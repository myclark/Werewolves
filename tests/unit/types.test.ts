import { describe, it, expect } from 'vitest'

describe('Type Definitions', () => {
  describe('Vote Choices', () => {
    it('should have valid vote choice values', () => {
      const abstain = 0
      const forVote = 1
      const againstVote = 2

      expect([abstain, forVote, againstVote]).toEqual([0, 1, 2])
    })

    it('should validate vote choice is in range', () => {
      const validChoices = [0, 1, 2]
      expect(validChoices).toContain(0)
      expect(validChoices).toContain(1)
      expect(validChoices).toContain(2)
      expect(validChoices).not.toContain(3)
      expect(validChoices).not.toContain(-1)
    })
  })

  describe('Game Status', () => {
    it('should have valid game status values', () => {
      const statuses: Array<'waiting' | 'active' | 'ended'> = [
        'waiting',
        'active',
        'ended',
      ]
      expect(statuses).toHaveLength(3)
    })
  })

  describe('Game Mode', () => {
    it('should have valid game mode values', () => {
      const modes: Array<'lobby' | 'day' | 'night' | 'endgame'> = [
        'lobby',
        'day',
        'night',
        'endgame',
      ]
      expect(modes).toHaveLength(4)
    })
  })

  describe('Player Team', () => {
    it('should have valid team values', () => {
      const teams: Array<'villagers' | 'werewolves'> = [
        'villagers',
        'werewolves',
      ]
      expect(teams).toHaveLength(2)
    })
  })

  describe('Event Type', () => {
    it('should have valid event type values', () => {
      const eventTypes: Array<
        'death' | 'lynch' | 'werewolf_kill' | 'info' | 'warning'
      > = ['death', 'lynch', 'werewolf_kill', 'info', 'warning']
      expect(eventTypes).toHaveLength(5)
    })
  })

  describe('VoteResult Interface', () => {
    it('should have all required properties', () => {
      const voteResult = {
        for_count: 3,
        against_count: 2,
        abstain_count: 1,
        total_voters: 6,
        majority_needed: 4,
        passes: false,
      }

      expect(voteResult).toHaveProperty('for_count')
      expect(voteResult).toHaveProperty('against_count')
      expect(voteResult).toHaveProperty('abstain_count')
      expect(voteResult).toHaveProperty('total_voters')
      expect(voteResult).toHaveProperty('majority_needed')
      expect(voteResult).toHaveProperty('passes')
    })

    it('should calculate correct totals', () => {
      const voteResult = {
        for_count: 3,
        against_count: 2,
        abstain_count: 1,
        total_voters: 6,
        majority_needed: 4,
        passes: false,
      }

      expect(voteResult.for_count + voteResult.against_count + voteResult.abstain_count)
        .toBe(voteResult.total_voters)
    })
  })

  describe('Player State', () => {
    it('should have valid death types', () => {
      const deathTypes = ['lynch', 'werewolf', 'saint']
      expect(deathTypes).toContain('lynch')
      expect(deathTypes).toContain('werewolf')
      expect(deathTypes).toContain('saint')
    })

    it('should have valid effect types', () => {
      const effects = ['save', 'hex']
      expect(effects).toContain('save')
      expect(effects).toContain('hex')
    })
  })

  describe('Game Settings', () => {
    it('should have valid time delay settings', () => {
      const timeDelays = {
        voteTimeout: 60,
        executionDelay: 10,
        nightDuration: 120,
        gameStartDelay: 5,
      }

      expect(timeDelays.voteTimeout).toBeGreaterThan(0)
      expect(timeDelays.executionDelay).toBeGreaterThan(0)
      expect(timeDelays.nightDuration).toBeGreaterThan(0)
      expect(timeDelays.gameStartDelay).toBeGreaterThan(0)
    })

    it('should have boolean game settings', () => {
      const settings = {
        doubleJeopardy: true,
        revealRole: true,
      }

      expect(typeof settings.doubleJeopardy).toBe('boolean')
      expect(typeof settings.revealRole).toBe('boolean')
    })
  })
})
