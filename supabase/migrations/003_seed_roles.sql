-- Insert all game roles
INSERT INTO roles (name, team, description, short_description, has_night_action, is_passive, order_priority) VALUES
  (
    'Villager',
    'villagers',
    'A regular villager with no special abilities. Your goal is to identify and eliminate all werewolves.',
    'No special abilities',
    false,
    true,
    1
  ),
  (
    'Werewolf',
    'werewolves',
    'A werewolf who kills villagers at night. You must work with other werewolves to choose a victim.',
    'Kills at night',
    true,
    false,
    2
  ),
  (
    'Doctor',
    'villagers',
    'Can save one person from werewolf attacks each night. You can save yourself.',
    'Saves one person per night',
    true,
    false,
    3
  ),
  (
    'Seer',
    'villagers',
    'Can check if one player is a werewolf each night. Use this information wisely.',
    'Checks one player per night',
    true,
    false,
    4
  ),
  (
    'Witch',
    'villagers',
    'Can silence one player for the next day cycle, preventing them from nominating or voting.',
    'Silences one player',
    true,
    false,
    5
  ),
  (
    'Knight',
    'villagers',
    'Cannot be killed by werewolves at night, but can still be lynched during the day.',
    'Immune to werewolf attacks',
    false,
    true,
    6
  ),
  (
    'Saint',
    'villagers',
    'If lynched during the day, the player who nominated you dies with you.',
    'Kills their nominator if lynched',
    false,
    true,
    7
  );
