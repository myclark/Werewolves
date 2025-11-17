'use client'

import type { Database } from '@/types/database.types'

type Event = Database['public']['Tables']['events']['Row']

interface EventFeedProps {
  events: Event[]
}

export function EventFeed({ events }: EventFeedProps) {
  const getEventColor = (type: Event['type']) => {
    switch (type) {
      case 'death':
      case 'werewolf_kill':
      case 'lynch':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800'
    }
  }

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {events.map((event) => (
        <div
          key={event.id}
          className={`p-3 rounded-lg border ${getEventColor(event.type)}`}
        >
          <div className="flex items-start justify-between">
            <p className="text-sm">{event.message}</p>
            <span className="text-xs opacity-60 ml-2 whitespace-nowrap">
              Cycle {event.cycle_number}
            </span>
          </div>
        </div>
      ))}
      {events.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          No events yet
        </div>
      )}
    </div>
  )
}
