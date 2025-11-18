import { describe, it, expect } from 'vitest'
import { ROLES, getRoleDescription, isWerewolf, hasNightAction } from '@/lib/game/roles'

describe('Role Utilities', () => {
  describe('ROLES constant', () => {
    it('should have all 7 roles defined', () => {
      expect(Object.keys(ROLES)).toHaveLength(7)
    })

    it('should have Villager role', () => {
      expect(ROLES.VILLAGER).toBeDefined()
      expect(ROLES.VILLAGER.name).toBe('Villager')
      expect(ROLES.VILLAGER.team).toBe('villagers')
      expect(ROLES.VILLAGER.is_passive).toBe(true)
      expect(ROLES.VILLAGER.has_night_action).toBe(false)
    })

    it('should have Werewolf role', () => {
      expect(ROLES.WEREWOLF).toBeDefined()
      expect(ROLES.WEREWOLF.name).toBe('Werewolf')
      expect(ROLES.WEREWOLF.team).toBe('werewolves')
      expect(ROLES.WEREWOLF.has_night_action).toBe(true)
    })

    it('should have Doctor role', () => {
      expect(ROLES.DOCTOR).toBeDefined()
      expect(ROLES.DOCTOR.name).toBe('Doctor')
      expect(ROLES.DOCTOR.team).toBe('villagers')
      expect(ROLES.DOCTOR.has_night_action).toBe(true)
    })

    it('should have Seer role', () => {
      expect(ROLES.SEER).toBeDefined()
      expect(ROLES.SEER.name).toBe('Seer')
      expect(ROLES.SEER.team).toBe('villagers')
      expect(ROLES.SEER.has_night_action).toBe(true)
    })

    it('should have Witch role', () => {
      expect(ROLES.WITCH).toBeDefined()
      expect(ROLES.WITCH.name).toBe('Witch')
      expect(ROLES.WITCH.team).toBe('villagers')
      expect(ROLES.WITCH.has_night_action).toBe(true)
    })

    it('should have Knight role', () => {
      expect(ROLES.KNIGHT).toBeDefined()
      expect(ROLES.KNIGHT.name).toBe('Knight')
      expect(ROLES.KNIGHT.team).toBe('villagers')
      expect(ROLES.KNIGHT.is_passive).toBe(true)
      expect(ROLES.KNIGHT.has_night_action).toBe(false)
    })

    it('should have Saint role', () => {
      expect(ROLES.SAINT).toBeDefined()
      expect(ROLES.SAINT.name).toBe('Saint')
      expect(ROLES.SAINT.team).toBe('villagers')
      expect(ROLES.SAINT.is_passive).toBe(true)
      expect(ROLES.SAINT.has_night_action).toBe(false)
    })
  })

  describe('getRoleDescription', () => {
    it('should return description for Villager', () => {
      const desc = getRoleDescription('Villager')
      expect(desc).toContain('regular villager')
      expect(desc).toContain('no special abilities')
    })

    it('should return description for Werewolf', () => {
      const desc = getRoleDescription('Werewolf')
      expect(desc).toContain('werewolf')
      expect(desc).toContain('kills')
    })

    it('should return description for Doctor', () => {
      const desc = getRoleDescription('Doctor')
      expect(desc).toContain('save')
    })

    it('should return unknown for invalid role', () => {
      const desc = getRoleDescription('InvalidRole')
      expect(desc).toBe('Unknown role')
    })
  })

  describe('isWerewolf', () => {
    it('should return true for Werewolf', () => {
      expect(isWerewolf('Werewolf')).toBe(true)
    })

    it('should return false for Villager', () => {
      expect(isWerewolf('Villager')).toBe(false)
    })

    it('should return false for Doctor', () => {
      expect(isWerewolf('Doctor')).toBe(false)
    })

    it('should return false for all other villager roles', () => {
      expect(isWerewolf('Seer')).toBe(false)
      expect(isWerewolf('Witch')).toBe(false)
      expect(isWerewolf('Knight')).toBe(false)
      expect(isWerewolf('Saint')).toBe(false)
    })

    it('should return false for invalid role', () => {
      expect(isWerewolf('InvalidRole')).toBe(false)
    })
  })

  describe('hasNightAction', () => {
    it('should return true for roles with night actions', () => {
      expect(hasNightAction('Werewolf')).toBe(true)
      expect(hasNightAction('Doctor')).toBe(true)
      expect(hasNightAction('Seer')).toBe(true)
      expect(hasNightAction('Witch')).toBe(true)
    })

    it('should return false for passive roles', () => {
      expect(hasNightAction('Villager')).toBe(false)
      expect(hasNightAction('Knight')).toBe(false)
      expect(hasNightAction('Saint')).toBe(false)
    })

    it('should return false for invalid role', () => {
      expect(hasNightAction('InvalidRole')).toBe(false)
    })
  })

  describe('Role balance', () => {
    it('should have 6 villager roles and 1 werewolf role', () => {
      const villagerRoles = Object.values(ROLES).filter((r) => r.team === 'villagers')
      const werewolfRoles = Object.values(ROLES).filter((r) => r.team === 'werewolves')

      expect(villagerRoles).toHaveLength(6)
      expect(werewolfRoles).toHaveLength(1)
    })

    it('should have 4 roles with night actions', () => {
      const actionRoles = Object.values(ROLES).filter((r) => r.has_night_action)
      expect(actionRoles).toHaveLength(4)
    })

    it('should have 3 passive roles', () => {
      const passiveRoles = Object.values(ROLES).filter((r) => r.is_passive)
      expect(passiveRoles).toHaveLength(3)
    })
  })

  describe('Role descriptions', () => {
    it('should have descriptions for all roles', () => {
      Object.values(ROLES).forEach((role) => {
        expect(role.description).toBeDefined()
        expect(role.description.length).toBeGreaterThan(0)
      })
    })

    it('should have unique descriptions', () => {
      const descriptions = Object.values(ROLES).map((r) => r.description)
      const uniqueDescriptions = new Set(descriptions)
      expect(uniqueDescriptions.size).toBe(descriptions.length)
    })
  })
})
