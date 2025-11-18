'use client'

import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import type { Player } from '@/lib/hooks/usePlayers'
import type { Database } from '@/types/database.types'

type Game = Database['public']['Tables']['games']['Row']

interface EndgameScreenProps {
  game: Game
  players: Player[]
}

export function EndgameScreen({ game, players }: EndgameScreenProps) {
  const winner = game.winner
  const werewolvesWon = winner === 'werewolves'
  const villagersWon = winner === 'villagers'

  const werewolves = players.filter((p) => p.role?.team === 'werewolves')
  const villagers = players.filter((p) => p.role?.team === 'villagers')
  const survivors = players.filter((p) => p.alive)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Winner Announcement */}
        <Card
          className={`${
            werewolvesWon
              ? 'bg-red-50 border-red-500 border-2'
              : 'bg-blue-50 border-blue-500 border-2'
          }`}
        >
          <CardHeader>
            <CardTitle className="text-center">
              <div className="text-5xl font-bold mb-4">
                {werewolvesWon ? '🐺 Werewolves Win!' : '👥 Villagers Win!'}
              </div>
              <div className="text-lg text-gray-700">
                {werewolvesWon
                  ? 'The werewolves have overrun the village!'
                  : 'The villagers have eliminated all werewolves!'}
              </div>
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Game Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Duration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-center">
                {game.cycle_number}
              </div>
              <div className="text-sm text-gray-600 text-center">Cycles</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Survivors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-center">
                {survivors.length}
              </div>
              <div className="text-sm text-gray-600 text-center">
                out of {players.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Deaths</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-center">
                {players.length - survivors.length}
              </div>
              <div className="text-sm text-gray-600 text-center">Players</div>
            </CardContent>
          </Card>
        </div>

        {/* Team Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Werewolves */}
          <Card>
            <CardHeader>
              <CardTitle className="text-red-700">
                🐺 Werewolves ({werewolves.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {werewolves.map((player, idx) => (
                  <div
                    key={player.id}
                    className={`p-2 rounded ${
                      player.alive ? 'bg-green-50' : 'bg-gray-100'
                    }`}
                  >
                    <div className="flex justify-between">
                      <span>Player {players.indexOf(player) + 1}</span>
                      <span className="text-sm">
                        {player.alive ? '✓ Survived' : '✗ Died'}
                      </span>
                    </div>
                    {!player.alive && player.death_type && (
                      <div className="text-xs text-gray-600 mt-1">
                        Cycle {player.death_cycle} - {player.death_type}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Villagers */}
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-700">
                👥 Villagers ({villagers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {villagers.map((player, idx) => (
                  <div
                    key={player.id}
                    className={`p-2 rounded ${
                      player.alive ? 'bg-green-50' : 'bg-gray-100'
                    }`}
                  >
                    <div className="flex justify-between">
                      <span>
                        Player {players.indexOf(player) + 1} - {player.role?.name}
                      </span>
                      <span className="text-sm">
                        {player.alive ? '✓ Survived' : '✗ Died'}
                      </span>
                    </div>
                    {!player.alive && player.death_type && (
                      <div className="text-xs text-gray-600 mt-1">
                        Cycle {player.death_cycle} - {player.death_type}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <Button variant="primary" onClick={() => (window.location.href = '/lobby')}>
            Return to Lobby
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = '/history')}
          >
            View Game History
          </Button>
        </div>
      </div>
    </div>
  )
}
