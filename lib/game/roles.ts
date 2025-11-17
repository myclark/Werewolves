import type { Role, PlayerTeam } from './types'

export const ROLES: Record<string, Omit<Role, 'id'>> = {
  VILLAGER: {
    name: 'Villager',
    team: 'villagers' as PlayerTeam,
    description:
      'A regular villager with no special abilities. Your goal is to identify and eliminate all werewolves.',
    has_night_action: false,
    is_passive: true,
  },
  WEREWOLF: {
    name: 'Werewolf',
    team: 'werewolves' as PlayerTeam,
    description:
      'A werewolf who kills villagers at night. You must work with other werewolves to choose a victim.',
    has_night_action: true,
    is_passive: false,
  },
  DOCTOR: {
    name: 'Doctor',
    team: 'villagers' as PlayerTeam,
    description:
      'Can save one person from werewolf attacks each night. You can save yourself.',
    has_night_action: true,
    is_passive: false,
  },
  SEER: {
    name: 'Seer',
    team: 'villagers' as PlayerTeam,
    description:
      'Can check if one player is a werewolf each night. Use this information wisely.',
    has_night_action: true,
    is_passive: false,
  },
  WITCH: {
    name: 'Witch',
    team: 'villagers' as PlayerTeam,
    description:
      'Can silence one player for the next day cycle, preventing them from nominating or voting.',
    has_night_action: true,
    is_passive: false,
  },
  KNIGHT: {
    name: 'Knight',
    team: 'villagers' as PlayerTeam,
    description:
      'Cannot be killed by werewolves at night, but can still be lynched during the day.',
    has_night_action: false,
    is_passive: true,
  },
  SAINT: {
    name: 'Saint',
    team: 'villagers' as PlayerTeam,
    description:
      'If lynched during the day, the player who nominated you dies with you.',
    has_night_action: false,
    is_passive: true,
  },
}

export function getRoleDescription(roleName: string): string {
  const role = Object.values(ROLES).find((r) => r.name === roleName)
  return role?.description || 'Unknown role'
}

export function isWerewolf(roleName: string): boolean {
  const role = Object.values(ROLES).find((r) => r.name === roleName)
  return role?.team === 'werewolves'
}

export function hasNightAction(roleName: string): boolean {
  const role = Object.values(ROLES).find((r) => r.name === roleName)
  return role?.has_night_action || false
}
