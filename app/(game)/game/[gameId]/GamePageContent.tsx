'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { useGameState } from '@/lib/hooks/useGameState'
import { usePlayers } from '@/lib/hooks/usePlayers'
import { useEvents } from '@/lib/hooks/useEvents'
import { PlayerList } from '@/components/game/PlayerList'
import { EventFeed } from '@/components/game/EventFeed'
import { DayPanel } from '@/components/game/DayPanel'
import { NightPanel } from '@/components/game/NightPanel'
import { RoleCard } from '@/components/game/RoleCard'
import { EndgameScreen } from '@/components/game/EndgameScreen'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export function GamePageContent({ gameId }: { gameId: string }) {
  const { user, loading: authLoading } = useAuth()
  const { game, loading: gameLoading } = useGameState(gameId)
  const { players, loading: playersLoading } = usePlayers(gameId)
  const { events } = useEvents(gameId, game?.cycle_number)
  const router = useRouter()

  const currentPlayer = players.find((p) => p.user_id === user?.id)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  if (authLoading || gameLoading || playersLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading game...</p>
        </div>
      </div>
    )
  }

  if (!game) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Game Not Found</h1>
          <p className="text-gray-600">This game does not exist or has been deleted.</p>
        </div>
      </div>
    )
  }

  // Show endgame screen
  if (game.mode === 'endgame' || game.status === 'ended') {
    return <EndgameScreen game={game} players={players} />
  }

  const isDay = game.mode === 'day'
  const isNight = game.mode === 'night'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold">
              Cycle {game.cycle_number} - {isDay ? '☀️ Day' : '🌙 Night'}
            </h1>
            <div className="text-sm text-gray-600">
              {players.filter((p) => p.alive).length} / {players.length} alive
            </div>
          </div>
          {currentPlayer && (
            <div className="text-sm text-gray-600">
              Status: {currentPlayer.alive ? 'Alive' : 'Dead'}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Players & Role */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Players ({players.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <PlayerList
                  players={players}
                  showStatus
                  currentUserId={user?.id}
                />
              </CardContent>
            </Card>

            {currentPlayer && currentPlayer.role && (
              <RoleCard player={currentPlayer} revealed />
            )}
          </div>

          {/* Middle Column - Events */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Events</CardTitle>
              </CardHeader>
              <CardContent>
                <EventFeed events={events} />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Action Panel */}
          <div>
            {isDay && (
              <DayPanel
                gameId={gameId}
                players={players}
                currentPlayer={currentPlayer}
              />
            )}
            {isNight && (
              <NightPanel
                gameId={gameId}
                players={players}
                currentPlayer={currentPlayer}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
