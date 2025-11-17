import { createClient } from '@/lib/supabase/client'
import type { VoteResult } from './types'

/**
 * Join a game as a player
 */
export async function joinGame(gameId: string) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  // Check if already in game
  const { data: existing } = await supabase
    .from('players')
    .select('id')
    .eq('game_id', gameId)
    .eq('user_id', user.id)
    .single()

  if (existing) {
    return existing.id
  }

  // Join game
  const { data, error } = await supabase
    .from('players')
    .insert({
      game_id: gameId,
      user_id: user.id,
      joined: true,
    })
    .select('id')
    .single()

  if (error) throw error

  return data.id
}

/**
 * Toggle ready status
 */
export async function toggleReady(gameId: string, ready: boolean) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('players')
    .update({ ready })
    .eq('game_id', gameId)
    .eq('user_id', user.id)

  if (error) throw error
}

/**
 * Nominate a player for lynch
 */
export async function nominate(gameId: string, targetId: string) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  // Get current player
  const { data: player } = await supabase
    .from('players')
    .select('id, alive, previous_nominations, effect')
    .eq('game_id', gameId)
    .eq('user_id', user.id)
    .single()

  if (!player || !player.alive) {
    throw new Error('Cannot nominate while dead')
  }

  if (player.effect === 'hex') {
    throw new Error('You are hexed and cannot nominate')
  }

  // Check double jeopardy
  if (player.previous_nominations?.includes(targetId)) {
    throw new Error('Cannot nominate the same player twice')
  }

  // Update nomination list
  const { error } = await supabase
    .from('players')
    .update({
      previous_nominations: [...(player.previous_nominations || []), targetId],
    })
    .eq('id', player.id)

  if (error) throw error

  // Get game cycle
  const { data: game } = await supabase
    .from('games')
    .select('cycle_number')
    .eq('id', gameId)
    .single()

  // Create nomination event
  await supabase.from('events').insert({
    game_id: gameId,
    type: 'info',
    message: 'A player has been nominated for lynch.',
    cycle_number: game?.cycle_number || 0,
  })
}

/**
 * Vote on a lynch
 */
export async function vote(
  gameId: string,
  choice: 0 | 1 | 2 // 0=abstain, 1=for, 2=against
) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('players')
    .update({ vote_choice: choice })
    .eq('game_id', gameId)
    .eq('user_id', user.id)

  if (error) throw error
}

/**
 * Set night action target
 */
export async function setNightAction(
  gameId: string,
  targetId: string | null
) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('players')
    .update({
      target_player_id: targetId,
      night_action_done: targetId !== null,
    })
    .eq('game_id', gameId)
    .eq('user_id', user.id)

  if (error) throw error
}

/**
 * Count votes for a lynch
 */
export async function countLynchVotes(gameId: string): Promise<VoteResult> {
  const supabase = createClient()

  const { data: players } = await supabase
    .from('players')
    .select('vote_choice')
    .eq('game_id', gameId)
    .eq('alive', true)

  if (!players) {
    throw new Error('Failed to fetch players')
  }

  const forCount = players.filter((p) => p.vote_choice === 1).length
  const againstCount = players.filter((p) => p.vote_choice === 2).length
  const abstainCount = players.filter((p) => p.vote_choice === 0).length
  const totalVoters = players.length
  const majorityNeeded = Math.floor(totalVoters / 2) + 1

  return {
    for_count: forCount,
    against_count: againstCount,
    abstain_count: abstainCount,
    total_voters: totalVoters,
    majority_needed: majorityNeeded,
    passes: forCount >= majorityNeeded,
  }
}

/**
 * Check win condition
 */
export async function checkWinCondition(
  gameId: string
): Promise<'villagers' | 'werewolves' | 'continue'> {
  const supabase = createClient()

  // Use the database function
  const { data, error } = await supabase.rpc('check_win_condition', {
    game_uuid: gameId,
  })

  if (error) throw error

  return data as 'villagers' | 'werewolves' | 'continue'
}
