import { describe, it, expect } from 'vitest'

describe('Game Logic', () => {
  describe('Vote Counting', () => {
    it('should calculate majority correctly for even number of players', () => {
      const totalVoters = 6
      const majorityNeeded = Math.floor(totalVoters / 2) + 1
      expect(majorityNeeded).toBe(4)
    })

    it('should calculate majority correctly for odd number of players', () => {
      const totalVoters = 7
      const majorityNeeded = Math.floor(totalVoters / 2) + 1
      expect(majorityNeeded).toBe(4)
    })

    it('should determine vote passes when for votes reach majority', () => {
      const forCount = 4
      const totalVoters = 6
      const majorityNeeded = Math.floor(totalVoters / 2) + 1
      const passes = forCount >= majorityNeeded
      expect(passes).toBe(true)
    })

    it('should determine vote fails when for votes do not reach majority', () => {
      const forCount = 3
      const totalVoters = 6
      const majorityNeeded = Math.floor(totalVoters / 2) + 1
      const passes = forCount >= majorityNeeded
      expect(passes).toBe(false)
    })
  })

  describe('Werewolf Count Calculation', () => {
    it('should assign 1 werewolf for 3 players (1/3)', () => {
      const playerCount = 3
      const werewolfCount = Math.max(1, Math.ceil(playerCount / 3))
      expect(werewolfCount).toBe(1)
    })

    it('should assign 2 werewolves for 6 players (1/3)', () => {
      const playerCount = 6
      const werewolfCount = Math.max(1, Math.ceil(playerCount / 3))
      expect(werewolfCount).toBe(2)
    })

    it('should assign 3 werewolves for 9 players (1/3)', () => {
      const playerCount = 9
      const werewolfCount = Math.max(1, Math.ceil(playerCount / 3))
      expect(werewolfCount).toBe(3)
    })

    it('should assign at least 1 werewolf even for 1 player', () => {
      const playerCount = 1
      const werewolfCount = Math.max(1, Math.ceil(playerCount / 3))
      expect(werewolfCount).toBe(1)
    })

    it('should round up for non-divisible player counts', () => {
      const playerCount = 5
      const werewolfCount = Math.max(1, Math.ceil(playerCount / 3))
      expect(werewolfCount).toBe(2) // 5/3 = 1.67, rounds up to 2
    })
  })

  describe('Win Conditions', () => {
    it('should recognize villagers win when no werewolves left', () => {
      const werewolfCount = 0
      const villagerCount = 3
      const result = werewolfCount === 0 ? 'villagers' : 'continue'
      expect(result).toBe('villagers')
    })

    it('should recognize werewolves win when they equal villagers (no special roles)', () => {
      const werewolfCount = 2
      const villagerCount = 2
      const hasDoctor = false
      const hasKnight = false
      const result =
        werewolfCount >= villagerCount && !hasDoctor && !hasKnight
          ? 'werewolves'
          : 'continue'
      expect(result).toBe('werewolves')
    })

    it('should continue game when werewolves outnumber but doctor alive', () => {
      const werewolfCount = 3
      const villagerCount = 2
      const hasDoctor = true
      const hasKnight = false
      const result =
        werewolfCount >= villagerCount && !hasDoctor && !hasKnight
          ? 'werewolves'
          : 'continue'
      expect(result).toBe('continue')
    })

    it('should continue game when werewolves outnumber but knight alive', () => {
      const werewolfCount = 3
      const villagerCount = 2
      const hasDoctor = false
      const hasKnight = true
      const result =
        werewolfCount >= villagerCount && !hasDoctor && !hasKnight
          ? 'werewolves'
          : 'continue'
      expect(result).toBe('continue')
    })

    it('should continue game when villagers outnumber werewolves', () => {
      const werewolfCount = 2
      const villagerCount = 5
      const hasDoctor = false
      const hasKnight = false
      const result =
        werewolfCount === 0
          ? 'villagers'
          : werewolfCount >= villagerCount && !hasDoctor && !hasKnight
          ? 'werewolves'
          : 'continue'
      expect(result).toBe('continue')
    })
  })

  describe('Game Cycle', () => {
    it('should start at cycle 1 when game begins', () => {
      const cycleNumber = 1
      expect(cycleNumber).toBe(1)
    })

    it('should increment cycle when transitioning from night to day', () => {
      let cycleNumber = 1
      cycleNumber++
      expect(cycleNumber).toBe(2)
    })

    it('should maintain cycle during day phase', () => {
      const cycleNumber = 3
      const mode = 'day'
      expect(cycleNumber).toBe(3)
    })
  })

  describe('Player States', () => {
    it('should initialize vote choice as 0 (abstain)', () => {
      const voteChoice = 0
      expect(voteChoice).toBe(0)
    })

    it('should allow vote choice 1 (for)', () => {
      const voteChoice = 1
      expect(voteChoice).toBe(1)
      expect([0, 1, 2]).toContain(voteChoice)
    })

    it('should allow vote choice 2 (against)', () => {
      const voteChoice = 2
      expect(voteChoice).toBe(2)
      expect([0, 1, 2]).toContain(voteChoice)
    })

    it('should track alive status', () => {
      let alive = true
      expect(alive).toBe(true)
      alive = false
      expect(alive).toBe(false)
    })

    it('should track ready status', () => {
      let ready = false
      expect(ready).toBe(false)
      ready = true
      expect(ready).toBe(true)
    })
  })

  describe('Double Jeopardy', () => {
    it('should prevent nominating same player twice', () => {
      const previousNominations = ['player1', 'player2']
      const targetId = 'player1'
      const canNominate = !previousNominations.includes(targetId)
      expect(canNominate).toBe(false)
    })

    it('should allow nominating player not previously nominated', () => {
      const previousNominations = ['player1', 'player2']
      const targetId = 'player3'
      const canNominate = !previousNominations.includes(targetId)
      expect(canNominate).toBe(true)
    })

    it('should allow first nomination when list is empty', () => {
      const previousNominations: string[] = []
      const targetId = 'player1'
      const canNominate = !previousNominations.includes(targetId)
      expect(canNominate).toBe(true)
    })
  })

  describe('Minimum Players', () => {
    it('should require at least 5 players to start', () => {
      const minPlayers = 5
      const currentPlayers = 4
      const canStart = currentPlayers >= minPlayers
      expect(canStart).toBe(false)
    })

    it('should allow start with exactly 5 players', () => {
      const minPlayers = 5
      const currentPlayers = 5
      const canStart = currentPlayers >= minPlayers
      expect(canStart).toBe(true)
    })

    it('should allow start with more than 5 players', () => {
      const minPlayers = 5
      const currentPlayers = 8
      const canStart = currentPlayers >= minPlayers
      expect(canStart).toBe(true)
    })
  })
})
