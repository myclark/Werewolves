'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import type { Player } from '@/lib/hooks/usePlayers'
import { nominate, vote } from '@/lib/game/actions'

interface DayPanelProps {
  gameId: string
  players: Player[]
  currentPlayer: Player | undefined
}

export function DayPanel({ gameId, players, currentPlayer }: DayPanelProps) {
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null)
  const [voting, setVoting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const alivePlayers = players.filter((p) => p.alive && p.id !== currentPlayer?.id)
  const isHexed = currentPlayer?.effect === 'hex'
  const hasVoted = currentPlayer?.vote_choice !== 0

  const handleNominate = async () => {
    if (!selectedTarget) return
    setError(null)

    try {
      await nominate(gameId, selectedTarget)
      setVoting(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to nominate')
    }
  }

  const handleVote = async (choice: 1 | 2) => {
    setError(null)
    try {
      await vote(gameId, choice)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to vote')
    }
  }

  if (!currentPlayer?.alive) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Day Phase</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            You are dead and cannot participate in voting.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (isHexed) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Day Phase - Hexed!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 font-semibold">
            You have been hexed by the Witch and cannot nominate or vote this turn.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Day Phase - Discussion & Voting</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded">
            {error}
          </div>
        )}

        {!voting ? (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Nominate a player for lynch:</h3>
              <div className="space-y-2">
                {alivePlayers.map((player) => {
                  const alreadyNominated =
                    currentPlayer.previous_nominations?.includes(player.id)
                  return (
                    <button
                      key={player.id}
                      onClick={() => setSelectedTarget(player.id)}
                      disabled={alreadyNominated}
                      className={`w-full p-3 rounded border text-left transition ${
                        selectedTarget === player.id
                          ? 'bg-blue-100 border-blue-500'
                          : alreadyNominated
                          ? 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-50'
                          : 'bg-white border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      Player {players.indexOf(player) + 1}
                      {alreadyNominated && (
                        <span className="text-xs text-gray-500 ml-2">
                          (Already nominated)
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            <Button
              onClick={handleNominate}
              disabled={!selectedTarget}
              variant="primary"
              className="w-full"
            >
              Nominate Selected Player
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
              <p className="text-yellow-800 font-semibold">
                A player has been nominated for lynch. Cast your vote!
              </p>
            </div>

            <div className="space-y-2">
              <Button
                onClick={() => handleVote(1)}
                disabled={hasVoted}
                variant={currentPlayer.vote_choice === 1 ? 'primary' : 'outline'}
                className="w-full"
              >
                Vote For Lynch
                {currentPlayer.vote_choice === 1 && ' ✓'}
              </Button>
              <Button
                onClick={() => handleVote(2)}
                disabled={hasVoted}
                variant={currentPlayer.vote_choice === 2 ? 'primary' : 'outline'}
                className="w-full"
              >
                Vote Against Lynch
                {currentPlayer.vote_choice === 2 && ' ✓'}
              </Button>
            </div>

            {hasVoted && (
              <p className="text-sm text-gray-600 text-center">
                You have voted. Waiting for other players...
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
