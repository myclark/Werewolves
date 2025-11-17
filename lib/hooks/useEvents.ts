'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

type Event = Database['public']['Tables']['events']['Row']

export function useEvents(gameId: string | null, cycleNumber?: number) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!gameId) {
      setEvents([])
      setLoading(false)
      return
    }

    let query = supabase
      .from('events')
      .select('*')
      .eq('game_id', gameId)
      .order('created_at', { ascending: false })

    if (cycleNumber !== undefined) {
      query = query.eq('cycle_number', cycleNumber)
    }

    // Initial fetch
    query.then(({ data, error }) => {
      if (!error && data) {
        setEvents(data)
      }
      setLoading(false)
    })

    // Subscribe to new events
    const channel = supabase
      .channel(`events:${gameId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'events',
          filter: `game_id=eq.${gameId}`,
        },
        (payload) => {
          const newEvent = payload.new as Event
          if (cycleNumber === undefined || newEvent.cycle_number === cycleNumber) {
            setEvents((prev) => [newEvent, ...prev])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [gameId, cycleNumber, supabase])

  return { events, loading }
}
