'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './useAuth'

interface PresenceState {
  user_id: string
  name: string
  online_at: string
}

export function usePresence(gameId: string | null) {
  const [presences, setPresences] = useState<Record<string, PresenceState[]>>({})
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    if (!gameId || !user) return

    const channel = supabase.channel(`game-presence:${gameId}`)

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<PresenceState>()
        setPresences(state)
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('New users joined:', newPresences)
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('Users left:', leftPresences)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: user.id,
            name: user.user_metadata.name || user.email || 'Anonymous',
            online_at: new Date().toISOString(),
          })
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [gameId, user, supabase])

  return { presences }
}
