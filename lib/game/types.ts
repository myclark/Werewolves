import type { Database } from '@/types/database.types'

export type GameStatus = Database['public']['Enums']['game_status']
export type GameMode = Database['public']['Enums']['game_mode']
export type PlayerTeam = Database['public']['Enums']['player_team']
export type EventType = Database['public']['Enums']['event_type']

export interface GameState {
  id: string
  status: GameStatus
  mode: GameMode
  cycle_number: number
  started_at: string | null
  ended_at: string | null
  winner: PlayerTeam | null
}

export interface Player {
  id: string
  game_id: string
  user_id: string
  role_id: string | null
  alive: boolean
  joined: boolean
  ready: boolean
  vote_choice: number
  target_player_id: string | null
  night_action_done: boolean
  effect: string | null
  previous_nominations: string[] | null
  seen_role: boolean
  death_cycle: number | null
  death_type: string | null
}

export interface Role {
  id: string
  name: string
  team: PlayerTeam
  description: string
  has_night_action: boolean
  is_passive: boolean
}

export interface VoteResult {
  for_count: number
  against_count: number
  abstain_count: number
  total_voters: number
  majority_needed: number
  passes: boolean
}
