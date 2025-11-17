'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

type PlayerRow = Database['public']['Tables']['players']['Row']

export interface Player extends PlayerRow {
  role?: {
    name: string
    team: 'villagers' | 'werewolves'
  } | null
}

export function usePlayers(gameId: string | null) {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!gameId) {
      setPlayers([])
      setLoading(false)
      return
    }

    const fetchPlayers = async () => {
      const { data, error } = await supabase
        .from('players')
        .select(`
          *,
          role:roles(name, team)
        `)
        .eq('game_id', gameId)
        .eq('joined', true)

      if (!error && data) {
        setPlayers(data as Player[])
      }
      setLoading(false)
    }

    // Initial fetch
    fetchPlayers()

    // Subscribe to changes
    const channel = supabase
      .channel(`players:${gameId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players',
          filter: `game_id=eq.${gameId}`,
        },
        () => {
          // Refetch when changes occur
          fetchPlayers()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [gameId, supabase])

  return { players, loading }
}
