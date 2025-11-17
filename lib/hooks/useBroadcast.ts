'use client'

import { useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface BroadcastMessage {
  type: string
  payload: any
}

export function useBroadcast(
  gameId: string | null,
  onMessage?: (message: BroadcastMessage) => void
) {
  const supabase = createClient()
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!gameId) return

    const channel = supabase.channel(`game-broadcast:${gameId}`)
    channelRef.current = channel

    if (onMessage) {
      channel.on('broadcast', { event: 'game-action' }, ({ payload }) => {
        onMessage(payload as BroadcastMessage)
      })
    }

    channel.subscribe()

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [gameId, onMessage, supabase])

  const broadcast = useCallback(
    (type: string, payload: any) => {
      if (!channelRef.current) return

      channelRef.current.send({
        type: 'broadcast',
        event: 'game-action',
        payload: { type, payload },
      })
    },
    []
  )

  return { broadcast }
}
