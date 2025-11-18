'use client'

import type { Player } from '@/lib/hooks/usePlayers'

interface RoleCardProps {
  player: Player
  revealed?: boolean
}

export function RoleCard({ player, revealed = false }: RoleCardProps) {
  if (!player.role || (!revealed && !player.seen_role)) {
    return null
  }

  const isWerewolf = player.role.team === 'werewolves'

  return (
    <div
      className={`rounded-lg border-2 p-6 ${
        isWerewolf
          ? 'bg-red-50 border-red-500'
          : 'bg-blue-50 border-blue-500'
      }`}
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Your Role</h2>
        <div
          className={`text-4xl font-bold mb-4 ${
            isWerewolf ? 'text-red-700' : 'text-blue-700'
          }`}
        >
          {player.role.name}
        </div>
        <div className="text-sm text-gray-700">
          <p className="mb-2">
            <strong>Team:</strong>{' '}
            <span className="capitalize">{player.role.team}</span>
          </p>
        </div>
      </div>
    </div>
  )
}
