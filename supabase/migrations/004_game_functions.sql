-- Function: Assign roles to players
CREATE OR REPLACE FUNCTION assign_roles(game_uuid UUID)
RETURNS void AS $$
DECLARE
  player_count INTEGER;
  werewolf_count INTEGER;
  player_record RECORD;
  role_record RECORD;
  roles_pool UUID[];
  assigned_roles UUID[];
BEGIN
  -- Count players
  SELECT COUNT(*) INTO player_count
  FROM players
  WHERE game_id = game_uuid AND joined = true;

  -- Calculate werewolves (1/3 of players)
  werewolf_count := GREATEST(1, CEIL(player_count::NUMERIC / 3));

  -- Get werewolf role ID
  FOR player_record IN
    SELECT id FROM players
    WHERE game_id = game_uuid AND joined = true
    ORDER BY RANDOM()
    LIMIT werewolf_count
  LOOP
    UPDATE players
    SET role_id = (SELECT id FROM roles WHERE name = 'Werewolf')
    WHERE id = player_record.id;
  END LOOP;

  -- Get enabled roles (exclude werewolf)
  SELECT ARRAY_AGG(id) INTO roles_pool
  FROM roles
  WHERE name != 'Werewolf';

  -- Assign remaining roles
  FOR player_record IN
    SELECT id FROM players
    WHERE game_id = game_uuid AND role_id IS NULL AND joined = true
  LOOP
    UPDATE players
    SET role_id = roles_pool[1 + (random() * (array_length(roles_pool, 1) - 1))::INTEGER]
    WHERE id = player_record.id;
  END LOOP;

  -- Mark roles as assigned
  UPDATE games
  SET mode = 'day', cycle_number = 1, started_at = NOW(), status = 'active'
  WHERE id = game_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Check win conditions
CREATE OR REPLACE FUNCTION check_win_condition(game_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  werewolf_count INTEGER;
  villager_count INTEGER;
  has_doctor BOOLEAN;
  has_knight BOOLEAN;
BEGIN
  -- Count living werewolves
  SELECT COUNT(*) INTO werewolf_count
  FROM players p
  JOIN roles r ON p.role_id = r.id
  WHERE p.game_id = game_uuid
    AND p.alive = true
    AND r.team = 'werewolves';

  -- Count living villagers
  SELECT COUNT(*) INTO villager_count
  FROM players p
  JOIN roles r ON p.role_id = r.id
  WHERE p.game_id = game_uuid
    AND p.alive = true
    AND r.team = 'villagers';

  -- Check for special roles
  SELECT EXISTS(
    SELECT 1 FROM players p
    JOIN roles r ON p.role_id = r.id
    WHERE p.game_id = game_uuid
      AND p.alive = true
      AND r.name = 'Doctor'
  ) INTO has_doctor;

  SELECT EXISTS(
    SELECT 1 FROM players p
    JOIN roles r ON p.role_id = r.id
    WHERE p.game_id = game_uuid
      AND p.alive = true
      AND r.name = 'Knight'
  ) INTO has_knight;

  -- Check win conditions
  IF werewolf_count = 0 THEN
    RETURN 'villagers';
  ELSIF werewolf_count >= villager_count AND NOT (has_doctor OR has_knight) THEN
    RETURN 'werewolves';
  ELSE
    RETURN 'continue';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get current game state for a player
CREATE OR REPLACE FUNCTION get_player_game_state(p_user_id UUID, p_game_id UUID)
RETURNS TABLE (
  game_mode game_mode,
  cycle_number INTEGER,
  player_role TEXT,
  player_team player_team,
  is_alive BOOLEAN,
  can_act BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    g.mode,
    g.cycle_number,
    r.name as player_role,
    r.team as player_team,
    p.alive as is_alive,
    (p.alive AND NOT p.night_action_done AND r.has_night_action) as can_act
  FROM games g
  JOIN players p ON p.game_id = g.id
  JOIN roles r ON r.id = p.role_id
  WHERE g.id = p_game_id
    AND p.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Count votes
CREATE OR REPLACE FUNCTION count_lynch_votes(game_uuid UUID)
RETURNS TABLE (
  for_count INTEGER,
  against_count INTEGER,
  abstain_count INTEGER,
  total_voters INTEGER,
  majority_needed INTEGER,
  passes BOOLEAN
) AS $$
DECLARE
  v_for INTEGER;
  v_against INTEGER;
  v_abstain INTEGER;
  v_total INTEGER;
  v_majority INTEGER;
BEGIN
  SELECT
    COUNT(*) FILTER (WHERE vote_choice = 1),
    COUNT(*) FILTER (WHERE vote_choice = 2),
    COUNT(*) FILTER (WHERE vote_choice = 0),
    COUNT(*)
  INTO v_for, v_against, v_abstain, v_total
  FROM players
  WHERE game_id = game_uuid AND alive = true;

  v_majority := FLOOR(v_total / 2.0) + 1;

  RETURN QUERY SELECT v_for, v_against, v_abstain, v_total, v_majority, (v_for >= v_majority);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
