'use client'

import type { Player } from '@/lib/hooks/usePlayers'

interface PlayerListProps {
  players: Player[]
  showStatus?: boolean
  currentUserId?: string
}

export function PlayerList({ players, showStatus, currentUserId }: PlayerListProps) {
  return (
    <div className="space-y-2">
      {players.map((player) => (
        <div
          key={player.id}
          className={`flex items-center justify-between p-3 rounded-lg border ${
            player.alive ? 'bg-white border-gray-200' : 'bg-gray-100 border-gray-300 opacity-60'
          } ${
            player.user_id === currentUserId ? 'ring-2 ring-blue-500' : ''
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              player.ready ? 'bg-green-500' : 'bg-gray-300'
            }`} />
            <div>
              <div className="font-medium">
                Player {players.indexOf(player) + 1}
                {player.user_id === currentUserId && ' (You)'}
              </div>
              {showStatus && (
                <div className="text-sm text-gray-500">
                  {player.alive ? 'Alive' : 'Dead'}
                  {player.role && ` • ${player.role.name}`}
                </div>
              )}
            </div>
          </div>
          {!showStatus && (
            <div className="text-sm text-gray-500">
              {player.ready ? 'Ready' : 'Not Ready'}
            </div>
          )}
        </div>
      ))}
      {players.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          No players yet
        </div>
      )}
    </div>
  )
}
