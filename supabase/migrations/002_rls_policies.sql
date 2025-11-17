-- Enable RLS on all tables
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Roles: Everyone can read
CREATE POLICY "Roles are publicly readable"
  ON roles FOR SELECT
  TO authenticated
  USING (true);

-- Games: Anyone can read active games
CREATE POLICY "Games are publicly readable"
  ON games FOR SELECT
  TO authenticated
  USING (true);

-- Games: Only host can create
CREATE POLICY "Users can create games"
  ON games FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = host_user_id);

-- Games: Only host can update
CREATE POLICY "Host can update their game"
  ON games FOR UPDATE
  TO authenticated
  USING (auth.uid() = host_user_id);

-- Players: Can read players in games they're in
CREATE POLICY "Players can read other players in their game"
  ON players FOR SELECT
  TO authenticated
  USING (
    game_id IN (
      SELECT game_id FROM players WHERE user_id = auth.uid()
    )
  );

-- Players: Can insert themselves into a game
CREATE POLICY "Users can join games"
  ON players FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Players: Can only update their own player record
CREATE POLICY "Players can update themselves"
  ON players FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Role Votes: Can read votes in their game
CREATE POLICY "Can read role votes in their game"
  ON role_votes FOR SELECT
  TO authenticated
  USING (
    game_id IN (
      SELECT game_id FROM players WHERE user_id = auth.uid()
    )
  );

-- Role Votes: Can create/update their own votes
CREATE POLICY "Can manage their own role votes"
  ON role_votes FOR ALL
  TO authenticated
  USING (
    player_id IN (
      SELECT id FROM players WHERE user_id = auth.uid()
    )
  );

-- Events: Can read events from their game
CREATE POLICY "Can read events from their game"
  ON events FOR SELECT
  TO authenticated
  USING (
    game_id IN (
      SELECT game_id FROM players WHERE user_id = auth.uid()
    )
  );

-- Game History: Can read history from games they participated in
CREATE POLICY "Can read game history"
  ON game_history FOR SELECT
  TO authenticated
  USING (
    game_id IN (
      SELECT game_id FROM players WHERE user_id = auth.uid()
    )
  );
