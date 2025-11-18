'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import type { Player } from '@/lib/hooks/usePlayers'
import { setNightAction } from '@/lib/game/actions'

interface NightPanelProps {
  gameId: string
  players: Player[]
  currentPlayer: Player | undefined
}

export function NightPanel({ gameId, players, currentPlayer }: NightPanelProps) {
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const alivePlayers = players.filter((p) => p.alive)
  const otherPlayers = alivePlayers.filter((p) => p.id !== currentPlayer?.id)
  const roleName = currentPlayer?.role?.name || ''
  const hasAction = currentPlayer?.role?.name &&
    ['Werewolf', 'Doctor', 'Seer', 'Witch'].includes(currentPlayer.role.name)
  const actionDone = currentPlayer?.night_action_done || false

  const handleAction = async () => {
    if (!selectedTarget) return
    setError(null)

    try {
      await setNightAction(gameId, selectedTarget)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to perform action')
    }
  }

  if (!currentPlayer?.alive) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Night Phase</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            You are dead and cannot perform night actions.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!hasAction) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Night Phase</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Your role ({roleName}) has no night action. Wait for morning...
          </p>
        </CardContent>
      </Card>
    )
  }

  const getActionText = () => {
    switch (roleName) {
      case 'Werewolf':
        return {
          title: 'Choose a victim',
          description: 'Select a player to kill tonight. All werewolves must agree.',
        }
      case 'Doctor':
        return {
          title: 'Save a player',
          description: 'Choose a player to save from werewolf attacks. You can save yourself.',
        }
      case 'Seer':
        return {
          title: 'Investigate a player',
          description: 'Choose a player to check if they are a werewolf.',
        }
      case 'Witch':
        return {
          title: 'Hex a player',
          description: 'Choose a player to silence during the next day phase.',
        }
      default:
        return {
          title: 'Choose target',
          description: 'Select your target for tonight.',
        }
    }
  }

  const actionText = getActionText()
  const targetList = roleName === 'Doctor' ? alivePlayers : otherPlayers

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Night Phase - {roleName}</span>
          {actionDone && (
            <span className="text-sm font-normal text-green-600">✓ Action Complete</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded">
            {error}
          </div>
        )}

        <div>
          <h3 className="font-semibold mb-1">{actionText.title}</h3>
          <p className="text-sm text-gray-600 mb-3">{actionText.description}</p>
        </div>

        <div className="space-y-2">
          {targetList.map((player) => (
            <button
              key={player.id}
              onClick={() => setSelectedTarget(player.id)}
              disabled={actionDone}
              className={`w-full p-3 rounded border text-left transition ${
                selectedTarget === player.id
                  ? 'bg-blue-100 border-blue-500'
                  : actionDone
                  ? 'bg-gray-100 border-gray-300 cursor-not-allowed'
                  : 'bg-white border-gray-300 hover:bg-gray-50'
              }`}
            >
              Player {players.indexOf(player) + 1}
              {player.id === currentPlayer.id && ' (You)'}
            </button>
          ))}
        </div>

        <Button
          onClick={handleAction}
          disabled={!selectedTarget || actionDone}
          variant="primary"
          className="w-full"
        >
          {actionDone ? 'Action Submitted' : 'Confirm Action'}
        </Button>

        {actionDone && (
          <p className="text-sm text-gray-600 text-center">
            Your action has been recorded. Waiting for other players...
          </p>
        )}
      </CardContent>
    </Card>
  )
}
