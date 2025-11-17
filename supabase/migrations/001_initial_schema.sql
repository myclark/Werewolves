-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Game status enum
CREATE TYPE game_status AS ENUM ('waiting', 'active', 'ended');
CREATE TYPE game_mode AS ENUM ('lobby', 'day', 'night', 'endgame');
CREATE TYPE player_team AS ENUM ('villagers', 'werewolves');
CREATE TYPE event_type AS ENUM ('death', 'lynch', 'werewolf_kill', 'info', 'warning');

-- Roles table (static data)
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  team player_team NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT,
  has_night_action BOOLEAN DEFAULT false,
  is_passive BOOLEAN DEFAULT false,
  order_priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Games table
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  status game_status DEFAULT 'waiting',
  mode game_mode DEFAULT 'lobby',
  cycle_number INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  winner player_team,
  host_user_id UUID REFERENCES auth.users(id),
  settings JSONB DEFAULT '{
    "doubleJeopardy": true,
    "revealRole": true,
    "timeDelays": {
      "voteTimeout": 60,
      "executionDelay": 10,
      "nightDuration": 120
    }
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Players table
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id),

  -- Player state
  alive BOOLEAN DEFAULT true,
  joined BOOLEAN DEFAULT false,
  ready BOOLEAN DEFAULT false,

  -- Voting
  vote_choice INTEGER DEFAULT 0, -- 0=abstain, 1=for, 2=against
  do_nothing_vote INTEGER DEFAULT 0,

  -- Actions
  target_player_id UUID REFERENCES players(id),
  night_action_done BOOLEAN DEFAULT false,
  doing_night_action BOOLEAN DEFAULT false,

  -- Effects
  effect TEXT, -- 'save', 'hex', etc.
  previous_nominations UUID[], -- Array of player IDs nominated today

  -- UI state
  seen_role BOOLEAN DEFAULT false,
  seen_death BOOLEAN DEFAULT false,
  seen_new_events BOOLEAN DEFAULT false,
  seen_night_results BOOLEAN DEFAULT false,
  seen_endgame BOOLEAN DEFAULT false,

  -- Death details
  death_cycle INTEGER,
  death_type TEXT, -- 'lynch', 'werewolf', 'saint'

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(game_id, user_id)
);

-- Role votes table
CREATE TABLE role_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  vote INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(game_id, player_id, role_id)
);

-- Events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  type event_type NOT NULL,
  message TEXT NOT NULL,
  cycle_number INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game history table
CREATE TABLE game_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  cycle_number INTEGER NOT NULL,
  player_states JSONB NOT NULL, -- Snapshot of all player states
  events JSONB, -- Events that happened this cycle
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(game_id, cycle_number)
);

-- Indexes for performance
CREATE INDEX idx_players_game_id ON players(game_id);
CREATE INDEX idx_players_user_id ON players(user_id);
CREATE INDEX idx_players_alive ON players(alive);
CREATE INDEX idx_events_game_id ON events(game_id);
CREATE INDEX idx_events_cycle ON events(cycle_number);
CREATE INDEX idx_game_history_game_id ON game_history(game_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers
CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON games
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
