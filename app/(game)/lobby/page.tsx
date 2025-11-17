'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { useGameState } from '@/lib/hooks/useGameState'
import { usePlayers } from '@/lib/hooks/usePlayers'
import { PlayerList } from '@/components/game/PlayerList'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { joinGame, toggleReady } from '@/lib/game/actions'

export default function LobbyPage() {
  const { user, loading: authLoading } = useAuth()
  const [gameId, setGameId] = useState<string | null>(null)
  const { game } = useGameState(gameId)
  const { players } = usePlayers(gameId)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (authLoading || !user) return

    // Find or create game for this user
    const findOrCreateGame = async () => {
      const { data: existingPlayer } = await supabase
        .from('players')
        .select('game_id')
        .eq('user_id', user.id)
        .single()

      if (existingPlayer) {
        setGameId(existingPlayer.game_id)
      } else {
        // Create new game
        const { data: newGame } = await supabase
          .from('games')
          .insert({
            host_user_id: user.id,
          })
          .select()
          .single()

        if (newGame) {
          await joinGame(newGame.id)
          setGameId(newGame.id)
        }
      }
    }

    findOrCreateGame()
  }, [user, authLoading, supabase])

  useEffect(() => {
    // Redirect to game when it starts
    if (game?.status === 'active') {
      router.push(`/game/${game.id}`)
    }
  }, [game, router])

  const currentPlayer = players.find((p) => p.user_id === user?.id)
  const allReady = players.length > 0 && players.every((p) => p.ready)
  const isHost = game?.host_user_id === user?.id
  const canStart = isHost && allReady && players.length >= 5

  const handleReady = async () => {
    if (!gameId) return
    try {
      await toggleReady(gameId, !currentPlayer?.ready)
    } catch (error) {
      console.error('Failed to toggle ready:', error)
    }
  }

  const handleStart = async () => {
    if (!gameId) return
    try {
      // Call database function to assign roles
      const { error } = await supabase.rpc('assign_roles', {
        game_uuid: gameId,
      })

      if (error) throw error

      // Add start event
      await supabase.from('events').insert({
        game_id: gameId,
        type: 'info',
        message: 'Game started! Roles have been assigned.',
        cycle_number: 1,
      })
    } catch (error) {
      console.error('Failed to start game:', error)
    }
  }

  if (authLoading || !gameId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <h1 className="text-4xl font-bold mb-8">Game Lobby</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Players Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">
            Players ({players.length})
          </h2>
          <PlayerList players={players} currentUserId={user?.id} />

          <div className="mt-6 space-y-3">
            <Button
              onClick={handleReady}
              className="w-full"
              variant={currentPlayer?.ready ? 'outline' : 'primary'}
            >
              {currentPlayer?.ready ? 'Not Ready' : 'Ready'}
            </Button>

            {canStart && (
              <Button onClick={handleStart} variant="primary" className="w-full">
                Start Game
              </Button>
            )}

            {isHost && !canStart && players.length < 5 && (
              <p className="text-center text-sm text-gray-600">
                Need at least 5 players to start
              </p>
            )}
          </div>
        </div>

        {/* Game Info Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Game Information</h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">How to Play</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Players are divided into Villagers and Werewolves</li>
                <li>During the day, discuss and vote to lynch a player</li>
                <li>At night, Werewolves choose a victim</li>
                <li>Special roles have unique abilities</li>
                <li>Villagers win by eliminating all Werewolves</li>
                <li>Werewolves win by outnumbering Villagers</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Game Settings</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span>Double Jeopardy:</span>
                  <span className="font-medium">
                    {game?.settings && typeof game.settings === 'object' && 'doubleJeopardy' in game.settings
                      ? (game.settings.doubleJeopardy ? 'Enabled' : 'Disabled')
                      : 'Enabled'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Reveal Role on Death:</span>
                  <span className="font-medium">
                    {game?.settings && typeof game.settings === 'object' && 'revealRole' in game.settings
                      ? (game.settings.revealRole ? 'Enabled' : 'Disabled')
                      : 'Enabled'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600">
                {isHost && (
                  <span className="text-blue-600 font-medium">
                    You are the host.{' '}
                  </span>
                )}
                Waiting for all players to ready up...
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
