import { setActivePinia, createPinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { toFixed, fpMul } from '../../utils/fixedPoint'
import { useActionStore } from '../action'
import { useSkillStore } from '../skill'
import { useStatStore } from '../stat'

// Mock gameConfig - values in fixed point format (multiplied by 1000)
vi.mock('@/gameConfig', () => ({
  actionConfigMap: {
    testAction: {
      id: 'testAction',
      sort: 1,
      name: 'Test Action',
      description: 'A test action',
      skillId: 'testSkill',
      minLevel: 1,
      chestId: 'testChest',
      ingredients: [{ itemId: 'wood', count: 1 }],
      products: [{ itemId: 'plank', count: 2 }],
      duration: {
        baseValue: 5000000, // 5000 in fixed point
        modifiers: [],
      },
      xp: {
        baseValue: 10000, // 10 in fixed point
        modifiers: [],
      },
      chestPoints: {
        baseValue: 100000, // 100 in fixed point
        modifiers: [],
      },
    },
    actionWithModifiers: {
      id: 'actionWithModifiers',
      sort: 2,
      name: 'Action With Modifiers',
      description: 'Action with skill level modifiers',
      skillId: 'testSkill',
      minLevel: 5,
      chestId: 'testChest',
      duration: {
        baseValue: 10000000, // 10000 in fixed point
        modifiers: [
          {
            modifierType: 'skillLevel',
            type: 'percentage',
            perLevelValue: 50, // 0.05 in fixed point
          },
        ],
      },
      xp: {
        baseValue: 20000, // 20 in fixed point
        modifiers: [
          {
            modifierType: 'stat',
            statId: 'testStat',
            type: 'flat',
          },
        ],
      },
      chestPoints: {
        baseValue: 200000, // 200 in fixed point
        modifiers: [],
      },
    },
    actionNoIngredients: {
      id: 'actionNoIngredients',
      sort: 3,
      name: 'Action No Ingredients',
      description: 'Action without ingredients',
      skillId: 'testSkill',
      minLevel: 1,
      chestId: 'testChest',
      duration: {
        baseValue: 1000000, // 1000 in fixed point
        modifiers: [],
      },
      xp: {
        baseValue: 5000, // 5 in fixed point
        modifiers: [],
      },
      chestPoints: {
        baseValue: 50000, // 50 in fixed point
        modifiers: [],
      },
    },
  },
  statConfigMap: {
    testStat: {
      id: 'testStat',
      sort: 1,
      name: 'Test Stat',
      description: 'A test stat',
      base: 10000, // 10 in fixed point
    },
  },
}))

describe('Action Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('getActionById', () => {
    it('should throw error for non-existent action', () => {
      const actionStore = useActionStore()

      expect(() => actionStore.getActionById('nonExistent')).toThrow(
        'Action with id nonExistent not found',
      )
    })

    it('should return basic action with all properties', () => {
      const actionStore = useActionStore()
      const action = actionStore.getActionById('testAction')

      expect(action.id).toBe('testAction')
      expect(action.name).toBe('Test Action')
      expect(action.description).toBe('A test action')
      expect(action.skillId).toBe('testSkill')
      expect(action.minLevel).toBe(1)
      expect(action.chestId).toBe('testChest')
      expect(action.sort).toBe(1)
    })

    it('should return action with ingredients and products', () => {
      const actionStore = useActionStore()
      const action = actionStore.getActionById('testAction')

      expect(action.ingredients).toEqual([{ itemId: 'wood', count: 1 }])
      expect(action.products).toEqual([{ itemId: 'plank', count: 2 }])
    })

    it('should return action with empty arrays when no ingredients/products', () => {
      const actionStore = useActionStore()
      const action = actionStore.getActionById('actionNoIngredients')

      expect(action.ingredients).toEqual([])
      expect(action.products).toEqual([])
    })

    it('should calculate base duration correctly', () => {
      const actionStore = useActionStore()
      const action = actionStore.getActionById('testAction')

      // In DEV mode, duration is multiplied by 0.01
      const expectedDuration = import.meta.env.DEV ? toFixed(50) : toFixed(5000)
      expect(action.duration).toBe(expectedDuration)
    })

    it('should calculate base xp correctly', () => {
      const actionStore = useActionStore()
      const action = actionStore.getActionById('testAction')

      expect(action.xp).toBe(toFixed(10))
    })

    it('should calculate base chestPoints correctly', () => {
      const actionStore = useActionStore()
      const action = actionStore.getActionById('testAction')

      expect(action.chestPoints).toBe(toFixed(100))
    })

    it('should apply skill level modifiers to duration', () => {
      const actionStore = useActionStore()
      const skillStore = useSkillStore()

      // Set skill level to 10 (5 levels above minLevel)
      skillStore.skillXpMap = { testSkill: toFixed(964) } // Level 10 XP

      const action = actionStore.getActionById('actionWithModifiers')

      // Base duration: 10000
      // Skill level modifier: (10 - 5) * 0.05 = 0.25 (25% increase)
      // Final: 10000 * 1.25 = 12500
      // In DEV: 12500 * 0.01 = 125
      const expectedDuration = import.meta.env.DEV
        ? fpMul(toFixed(12500), toFixed(0.01))
        : toFixed(12500)
      expect(action.duration).toBe(expectedDuration)
    })

    it('should apply skill level modifiers only for levels above minLevel', () => {
      const actionStore = useActionStore()
      const skillStore = useSkillStore()

      // Set skill level to 3 (below minLevel of 5)
      skillStore.skillXpMap = { testSkill: toFixed(76) } // Level 3 XP (actually level 2)

      const action = actionStore.getActionById('actionWithModifiers')

      // Level 2: (2 - 5) * 50 = -150 fixed point = -0.15
      // Base: 10000
      // With modifier: 10000 * (1 + (-0.15)) = 10000 * 0.85 = 8500
      // In DEV: 8500 * 0.01 = 85
      const expectedDuration = import.meta.env.DEV
        ? fpMul(toFixed(8500), toFixed(0.01))
        : toFixed(8500)
      expect(action.duration).toBe(expectedDuration)
    })

    it('should pass calculated duration to xp and chestPoints calculations', () => {
      const actionStore = useActionStore()
      const statStore = useStatStore()

      // Mock stat value to verify duration is passed
      const calculateDerivedValueSpy = vi.spyOn(statStore, 'calculateDerivedValue')

      // Call getActionById to trigger calculateDerivedValue
      void actionStore.getActionById('testAction')

      // Verify calculateDerivedValue was called with the calculated duration
      const expectedDuration = import.meta.env.DEV ? toFixed(50) : toFixed(5000)

      // First call is for duration (with 'self')
      expect(calculateDerivedValueSpy).toHaveBeenCalledWith(
        expect.any(Object),
        'self',
        expect.any(Function),
      )

      // Second call is for xp (with calculated duration)
      expect(calculateDerivedValueSpy).toHaveBeenCalledWith(
        expect.any(Object),
        expectedDuration,
        expect.any(Function),
      )

      // Third call is for chestPoints (with calculated duration)
      expect(calculateDerivedValueSpy).toHaveBeenCalledWith(
        expect.any(Object),
        expectedDuration,
        expect.any(Function),
      )
    })

    it('should apply stat modifiers to xp', () => {
      const actionStore = useActionStore()
      const statStore = useStatStore()

      // Add a source of effects to the stat
      statStore.addEffectsFromSource('test', [
        {
          statId: 'testStat',
          type: 'flat',
          value: toFixed(5),
        },
      ])

      const action = actionStore.getActionById('actionWithModifiers')

      // Base XP: 20
      // Stat modifier: testStat value (10 base + 5 from effect) = 15
      // Final: 20 + 15 = 35
      expect(action.xp).toBe(toFixed(35))
    })

    it('should handle multiple calls with same action id', () => {
      const actionStore = useActionStore()

      const action1 = actionStore.getActionById('testAction')
      const action2 = actionStore.getActionById('testAction')

      expect(action1).toEqual(action2)
    })

    it('should recalculate when skill level changes', () => {
      const actionStore = useActionStore()
      const skillStore = useSkillStore()

      // Initial skill level
      skillStore.skillXpMap = { testSkill: toFixed(76) } // Level 3
      const action1 = actionStore.getActionById('actionWithModifiers')
      const duration1 = action1.duration

      // Change skill level
      skillStore.skillXpMap = { testSkill: toFixed(964) } // Level 10
      const action2 = actionStore.getActionById('actionWithModifiers')
      const duration2 = action2.duration

      // Duration should be different
      expect(duration2).toBeGreaterThan(duration1)
    })
  })
})
