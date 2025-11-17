import { setActivePinia, createPinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { toFixed } from '../../utils/fixedPoint'
import { useNotificationStore } from '../notification'
import { useSkillStore } from '../skill'

// Mock gameConfig
vi.mock('@/gameConfig', () => ({
  skillConfigMap: {
    testSkill: {
      id: 'testSkill',
      name: 'skill.testSkill.name',
      description: 'skill.testSkill.description',
      sort: 1,
    },
    anotherSkill: {
      id: 'anotherSkill',
      name: 'skill.anotherSkill.name',
      description: 'skill.anotherSkill.description',
      sort: 2,
    },
  },
  skillConfigs: [
    {
      id: 'testSkill',
      name: 'skill.testSkill.name',
      description: 'skill.testSkill.description',
      sort: 1,
    },
    {
      id: 'anotherSkill',
      name: 'skill.anotherSkill.name',
      description: 'skill.anotherSkill.description',
      sort: 2,
    },
  ],
}))

// Mock i18n
vi.mock('@/i18n', () => ({
  default: {
    global: {
      t: (key: string) => key,
    },
  },
}))

describe('Skill Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('skillXpMap access', () => {
    it('should access skillXpMap directly', () => {
      const skillStore = useSkillStore()

      expect(skillStore.skillXpMap).toBeDefined()
      expect(skillStore.skillXpMap).toEqual({})
    })

    it('should store XP in skillXpMap', () => {
      const skillStore = useSkillStore()
      skillStore.skillXpMap = { testSkill: toFixed(100) }

      expect(skillStore.skillXpMap.testSkill).toBe(toFixed(100))
    })
  })

  describe('getSkillLevel', () => {
    it('should return level 0 for 0 XP', () => {
      const skillStore = useSkillStore()

      expect(skillStore.getSkillLevel('testSkill')).toBe(0)
    })

    it('should return level 1 for 33 XP', () => {
      const skillStore = useSkillStore()
      skillStore.skillXpMap = { testSkill: toFixed(33) }

      expect(skillStore.getSkillLevel('testSkill')).toBe(1)
    })

    it('should return level 10 for 964 XP', () => {
      const skillStore = useSkillStore()
      skillStore.skillXpMap = { testSkill: toFixed(964) }

      expect(skillStore.getSkillLevel('testSkill')).toBe(10)
    })

    it('should return level 99 for 10000000 XP', () => {
      const skillStore = useSkillStore()
      skillStore.skillXpMap = { testSkill: toFixed(10000000) }

      expect(skillStore.getSkillLevel('testSkill')).toBe(99)
    })

    it('should return max level for very high XP', () => {
      const skillStore = useSkillStore()
      // XP_TABLE has 150 entries (levels 0-149)
      // Very high XP should return the maximum level (145 based on actual XP table)
      skillStore.skillXpMap = { testSkill: toFixed(1000000000) }

      const level = skillStore.getSkillLevel('testSkill')
      expect(level).toBeGreaterThanOrEqual(145)
      expect(level).toBeLessThanOrEqual(150)
    })
  })

  describe('remainingXpForUpgrade via getSkill', () => {
    it('should show XP needed for level 1 when at level 0', () => {
      const skillStore = useSkillStore()

      const skill = skillStore.getSkill('testSkill')
      // Level 0 → Level 1: needs 33 XP
      expect(skill?.remainingXpForUpgrade).toBe(toFixed(33))
    })

    it('should show remaining XP for partial progress', () => {
      const skillStore = useSkillStore()
      skillStore.skillXpMap = { testSkill: toFixed(50) } // Level 1, need 76 for level 2

      const skill = skillStore.getSkill('testSkill')
      // Remaining: 76 - 50 = 26
      expect(skill?.remainingXpForUpgrade).toBe(toFixed(26))
    })

    it('should show 56 XP remaining at exact level 2 boundary', () => {
      const skillStore = useSkillStore()
      skillStore.skillXpMap = { testSkill: toFixed(76) } // Exactly level 2

      const skill = skillStore.getSkill('testSkill')
      // Remaining: 132 - 76 = 56
      expect(skill?.remainingXpForUpgrade).toBe(toFixed(56))
    })

    it('should show appropriate remaining XP at max level', () => {
      const skillStore = useSkillStore()
      skillStore.skillXpMap = { testSkill: toFixed(10000000000) } // Max level

      const skill = skillStore.getSkill('testSkill')
      // At max level, remaining XP might be a large number or Infinity
      expect(skill?.remainingXpForUpgrade).toBeGreaterThan(toFixed(0))
    })
  })

  describe('upgradeProgress via getSkill', () => {
    it('should show 0 for no XP', () => {
      const skillStore = useSkillStore()

      const skill = skillStore.getSkill('testSkill')
      expect(skill?.upgradeProgress).toBe(0)
    })

    it('should show progress within a level', () => {
      const skillStore = useSkillStore()
      // Level 1 XP range: 33 → 76 (range of 43)
      // Current: 50, which is 17 XP into level 1
      skillStore.skillXpMap = { testSkill: toFixed(50) }

      const skill = skillStore.getSkill('testSkill')
      expect(skill?.upgradeProgress).toBeCloseTo((50 - 33) / (76 - 33), 5)
    })

    it('should show 0 at level boundary', () => {
      const skillStore = useSkillStore()
      skillStore.skillXpMap = { testSkill: toFixed(76) } // Exactly level 2

      const skill = skillStore.getSkill('testSkill')
      expect(skill?.upgradeProgress).toBe(0)
    })

    it('should show progress toward max level', () => {
      const skillStore = useSkillStore()
      skillStore.skillXpMap = { testSkill: toFixed(10000000000) } // Very high XP

      const skill = skillStore.getSkill('testSkill')
      // Progress should be a reasonable value between 0 and 1
      expect(skill?.upgradeProgress).toBeGreaterThanOrEqual(0)
      expect(skill?.upgradeProgress).toBeLessThanOrEqual(1)
    })
  })

  describe('addSkillXp', () => {
    it('should add XP to skill', () => {
      const skillStore = useSkillStore()

      skillStore.addSkillXp('testSkill', toFixed(50))

      expect(skillStore.skillXpMap.testSkill).toBe(toFixed(50))
    })

    it('should accumulate XP from multiple additions', () => {
      const skillStore = useSkillStore()

      skillStore.addSkillXp('testSkill', toFixed(30))
      skillStore.addSkillXp('testSkill', toFixed(20))

      expect(skillStore.skillXpMap.testSkill).toBe(toFixed(50))
    })

    it('should not send notification when not leveling up', () => {
      const skillStore = useSkillStore()
      const notificationStore = useNotificationStore()
      const infoSpy = vi.spyOn(notificationStore, 'info')

      skillStore.addSkillXp('testSkill', toFixed(10))

      expect(infoSpy).not.toHaveBeenCalled()
    })

    it('should send notification when leveling up', () => {
      const skillStore = useSkillStore()
      const notificationStore = useNotificationStore()
      const infoSpy = vi.spyOn(notificationStore, 'info')

      // Add XP to level up from 0 to 1
      skillStore.addSkillXp('testSkill', toFixed(33))

      expect(infoSpy).toHaveBeenCalledWith('notification.levelUp', {
        skill: 'skill.testSkill.name',
        level: 1,
      })
    })

    it('should send notification with correct level when leveling up multiple times', () => {
      const skillStore = useSkillStore()
      const notificationStore = useNotificationStore()
      const infoSpy = vi.spyOn(notificationStore, 'info')

      // Add enough XP to jump from level 0 to level 2 (76 XP)
      skillStore.addSkillXp('testSkill', toFixed(76))

      // Should only notify for the final level reached
      expect(infoSpy).toHaveBeenCalledWith('notification.levelUp', {
        skill: 'skill.testSkill.name',
        level: 2,
      })
    })

    it('should not send notification for non-existent skill config', () => {
      const skillStore = useSkillStore()
      const notificationStore = useNotificationStore()
      const infoSpy = vi.spyOn(notificationStore, 'info')

      // Add XP to a skill not in config
      skillStore.addSkillXp('nonExistentSkill', toFixed(100))

      expect(infoSpy).not.toHaveBeenCalled()
    })
  })

  describe('getSkill', () => {
    it('should return undefined for non-existent skill', () => {
      const skillStore = useSkillStore()

      expect(skillStore.getSkill('nonExistent')).toBeUndefined()
    })

    it('should return skill with all properties', () => {
      const skillStore = useSkillStore()
      skillStore.skillXpMap = { testSkill: toFixed(50) }

      const skill = skillStore.getSkill('testSkill')

      expect(skill).toBeDefined()
      expect(skill?.id).toBe('testSkill')
      expect(skill?.name).toBe('skill.testSkill.name')
      expect(skill?.description).toBe('skill.testSkill.description')
      expect(skill?.sort).toBe(1)
      expect(skill?.xp).toBe(toFixed(50))
      expect(skill?.level).toBe(1)
      expect(skill?.remainingXpForUpgrade).toBe(toFixed(26))
    })

    it('should calculate upgrade progress', () => {
      const skillStore = useSkillStore()
      skillStore.skillXpMap = { testSkill: toFixed(50) }

      const skill = skillStore.getSkill('testSkill')

      expect(skill?.upgradeProgress).toBeCloseTo((50 - 33) / (76 - 33), 5)
    })
  })

  describe('skillList', () => {
    it('should return all skills sorted', () => {
      const skillStore = useSkillStore()

      const skills = skillStore.skillList

      expect(skills).toHaveLength(2)
      expect(skills[0].id).toBe('testSkill')
      expect(skills[1].id).toBe('anotherSkill')
    })

    it('should update reactively when XP changes', () => {
      const skillStore = useSkillStore()

      const initialSkills = skillStore.skillList
      expect(initialSkills[0].xp).toBe(toFixed(0))

      skillStore.addSkillXp('testSkill', toFixed(100))

      const updatedSkills = skillStore.skillList
      expect(updatedSkills[0].xp).toBe(toFixed(100))
    })

    it('should filter out invalid skills', () => {
      const skillStore = useSkillStore()
      // This test verifies the filter works, even though all configured skills are valid
      const skills = skillStore.skillList

      expect(skills.every((skill) => skill !== undefined)).toBe(true)
    })
  })

  describe('XP Table and Level Calculation', () => {
    it('should handle edge case of exact XP match', () => {
      const skillStore = useSkillStore()

      // Test several exact level boundaries
      const testCases = [
        { xp: 0, expectedLevel: 0 },
        { xp: 33, expectedLevel: 1 },
        { xp: 76, expectedLevel: 2 },
        { xp: 964, expectedLevel: 10 },
        { xp: 10000000, expectedLevel: 99 },
      ]

      for (const { xp, expectedLevel } of testCases) {
        skillStore.skillXpMap = { testSkill: toFixed(xp) }
        expect(skillStore.getSkillLevel('testSkill')).toBe(expectedLevel)
      }
    })

    it('should handle XP just below level threshold', () => {
      const skillStore = useSkillStore()

      skillStore.skillXpMap = { testSkill: toFixed(75) } // Just below level 2 (76)
      expect(skillStore.getSkillLevel('testSkill')).toBe(1)

      skillStore.skillXpMap = { testSkill: toFixed(963) } // Just below level 10 (964)
      expect(skillStore.getSkillLevel('testSkill')).toBe(9)
    })

    it('should handle XP just above level threshold', () => {
      const skillStore = useSkillStore()

      skillStore.skillXpMap = { testSkill: toFixed(77) } // Just above level 2 (76)
      expect(skillStore.getSkillLevel('testSkill')).toBe(2)

      skillStore.skillXpMap = { testSkill: toFixed(965) } // Just above level 10 (964)
      expect(skillStore.getSkillLevel('testSkill')).toBe(10)
    })
  })
})
