import { setActivePinia, createPinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { toFixed } from '../../utils/fixedPoint'
import { useChestPointStore } from '../chestPoint'

// Mock gameConfig
vi.mock('@/gameConfig', () => ({
  itemConfigMap: {
    basicChest: {
      id: 'basicChest',
      name: 'Basic Chest',
      category: 'chest',
      chest: {
        maxPoints: toFixed(1000),
        loot: [],
      },
    },
    smallChest: {
      id: 'smallChest',
      name: 'Small Chest',
      category: 'chest',
      chest: {
        maxPoints: toFixed(500),
        loot: [],
      },
    },
    notAChest: {
      id: 'notAChest',
      name: 'Not A Chest',
      category: 'resource',
    },
  },
}))

describe('ChestPoint Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('getChestPoints', () => {
    it('should return 0 for chest with no points', () => {
      const chestPointStore = useChestPointStore()

      expect(chestPointStore.getChestPoints('basicChest')).toBe(toFixed(0))
    })

    it('should return stored points for chest', () => {
      const chestPointStore = useChestPointStore()
      chestPointStore.chestPoints = { basicChest: toFixed(250) }

      expect(chestPointStore.getChestPoints('basicChest')).toBe(toFixed(250))
    })
  })

  describe('setChestPoints', () => {
    it('should set chest points', () => {
      const chestPointStore = useChestPointStore()

      chestPointStore.setChestPoints('basicChest', toFixed(300))

      expect(chestPointStore.getChestPoints('basicChest')).toBe(toFixed(300))
    })

    it('should not allow negative points', () => {
      const chestPointStore = useChestPointStore()

      chestPointStore.setChestPoints('basicChest', toFixed(-100))

      expect(chestPointStore.getChestPoints('basicChest')).toBe(toFixed(0))
    })

    it('should replace existing points', () => {
      const chestPointStore = useChestPointStore()
      chestPointStore.chestPoints = { basicChest: toFixed(250) }

      chestPointStore.setChestPoints('basicChest', toFixed(500))

      expect(chestPointStore.getChestPoints('basicChest')).toBe(toFixed(500))
    })
  })

  describe('addChestPoints', () => {
    it('should add points and return 0 chests when below max', () => {
      const chestPointStore = useChestPointStore()

      const count = chestPointStore.addChestPoints('basicChest', toFixed(300))

      expect(count).toBe(0)
      expect(chestPointStore.getChestPoints('basicChest')).toBe(toFixed(300))
    })

    it('should add points and return 1 chest when reaching max', () => {
      const chestPointStore = useChestPointStore()

      const count = chestPointStore.addChestPoints('basicChest', toFixed(1000))

      expect(count).toBe(1)
      expect(chestPointStore.getChestPoints('basicChest')).toBe(toFixed(0))
    })

    it('should add points and return multiple chests', () => {
      const chestPointStore = useChestPointStore()

      const count = chestPointStore.addChestPoints('basicChest', toFixed(2500))

      expect(count).toBe(2)
      expect(chestPointStore.getChestPoints('basicChest')).toBe(toFixed(500))
    })

    it('should accumulate existing points', () => {
      const chestPointStore = useChestPointStore()
      chestPointStore.chestPoints = { basicChest: toFixed(800) }

      const count = chestPointStore.addChestPoints('basicChest', toFixed(400))

      expect(count).toBe(1)
      expect(chestPointStore.getChestPoints('basicChest')).toBe(toFixed(200))
    })

    it('should handle exact multiple of maxPoints', () => {
      const chestPointStore = useChestPointStore()

      const count = chestPointStore.addChestPoints('basicChest', toFixed(3000))

      expect(count).toBe(3)
      expect(chestPointStore.getChestPoints('basicChest')).toBe(toFixed(0))
    })

    it('should return 0 for non-positive points', () => {
      const chestPointStore = useChestPointStore()

      const count1 = chestPointStore.addChestPoints('basicChest', toFixed(0))
      const count2 = chestPointStore.addChestPoints('basicChest', toFixed(-100))

      expect(count1).toBe(0)
      expect(count2).toBe(0)
    })

    it('should return 0 for non-chest items', () => {
      const chestPointStore = useChestPointStore()

      const count = chestPointStore.addChestPoints('notAChest', toFixed(1000))

      expect(count).toBe(0)
    })

    it('should handle different chest types independently', () => {
      const chestPointStore = useChestPointStore()

      chestPointStore.addChestPoints('basicChest', toFixed(300))
      chestPointStore.addChestPoints('smallChest', toFixed(200))

      expect(chestPointStore.getChestPoints('basicChest')).toBe(toFixed(300))
      expect(chestPointStore.getChestPoints('smallChest')).toBe(toFixed(200))
    })

    it('should handle fractional points correctly', () => {
      const chestPointStore = useChestPointStore()

      // Add 1234.567 points to a chest with max 1000
      const count = chestPointStore.addChestPoints('basicChest', toFixed(1234.567))

      expect(count).toBe(1)
      expect(chestPointStore.getChestPoints('basicChest')).toBe(toFixed(234.567))
    })
  })

  describe('getChestRemaining', () => {
    it('should return maxPoints for chest with no points', () => {
      const chestPointStore = useChestPointStore()

      expect(chestPointStore.getChestRemaining('basicChest')).toBe(toFixed(1000))
    })

    it('should return remaining points', () => {
      const chestPointStore = useChestPointStore()
      chestPointStore.chestPoints = { basicChest: toFixed(300) }

      expect(chestPointStore.getChestRemaining('basicChest')).toBe(toFixed(700))
    })

    it('should return 0 when at max', () => {
      const chestPointStore = useChestPointStore()
      chestPointStore.chestPoints = { basicChest: toFixed(1000) }

      expect(chestPointStore.getChestRemaining('basicChest')).toBe(toFixed(0))
    })

    it('should return 0 for non-chest items', () => {
      const chestPointStore = useChestPointStore()

      expect(chestPointStore.getChestRemaining('notAChest')).toBe(toFixed(0))
    })

    it('should not return negative values', () => {
      const chestPointStore = useChestPointStore()
      // Manually set points above max (shouldn't happen in practice, but testing robustness)
      chestPointStore.chestPoints = { basicChest: toFixed(1500) }

      const remaining = chestPointStore.getChestRemaining('basicChest')
      expect(remaining).toBe(toFixed(0))
    })
  })

  describe('getChestProgress', () => {
    it('should return 0 for chest with no points', () => {
      const chestPointStore = useChestPointStore()

      expect(chestPointStore.getChestProgress('basicChest')).toBe(0)
    })

    it('should return progress as fraction', () => {
      const chestPointStore = useChestPointStore()
      chestPointStore.chestPoints = { basicChest: toFixed(250) }

      const progress = chestPointStore.getChestProgress('basicChest')
      expect(progress).toBeCloseTo(0.25, 5)
    })

    it('should return 1 when at max', () => {
      const chestPointStore = useChestPointStore()
      chestPointStore.chestPoints = { basicChest: toFixed(1000) }

      const progress = chestPointStore.getChestProgress('basicChest')
      expect(progress).toBeCloseTo(1, 5)
    })

    it('should return 0.5 for half progress', () => {
      const chestPointStore = useChestPointStore()
      chestPointStore.chestPoints = { basicChest: toFixed(500) }

      const progress = chestPointStore.getChestProgress('basicChest')
      expect(progress).toBeCloseTo(0.5, 5)
    })

    it('should return 0 for non-chest items', () => {
      const chestPointStore = useChestPointStore()

      expect(chestPointStore.getChestProgress('notAChest')).toBe(0)
    })
  })

  describe('integration scenarios', () => {
    it('should handle full workflow: add, check progress, complete chest', () => {
      const chestPointStore = useChestPointStore()

      // Start with 0
      expect(chestPointStore.getChestProgress('basicChest')).toBe(0)

      // Add 600 points
      let count = chestPointStore.addChestPoints('basicChest', toFixed(600))
      expect(count).toBe(0)
      expect(chestPointStore.getChestProgress('basicChest')).toBeCloseTo(0.6, 5)

      // Add 500 more points - should complete 1 chest
      count = chestPointStore.addChestPoints('basicChest', toFixed(500))
      expect(count).toBe(1)
      expect(chestPointStore.getChestProgress('basicChest')).toBeCloseTo(0.1, 5)
      expect(chestPointStore.getChestRemaining('basicChest')).toBe(toFixed(900))
    })

    it('should handle multiple chests with different maxPoints', () => {
      const chestPointStore = useChestPointStore()

      // Add to basicChest (maxPoints: 1000)
      chestPointStore.addChestPoints('basicChest', toFixed(750))

      // Add to smallChest (maxPoints: 500)
      chestPointStore.addChestPoints('smallChest', toFixed(250))

      expect(chestPointStore.getChestProgress('basicChest')).toBeCloseTo(0.75, 5)
      expect(chestPointStore.getChestProgress('smallChest')).toBeCloseTo(0.5, 5)
    })

    it('should handle rapid accumulation', () => {
      const chestPointStore = useChestPointStore()

      // Simulate adding points multiple times
      chestPointStore.addChestPoints('basicChest', toFixed(200))
      chestPointStore.addChestPoints('basicChest', toFixed(300))
      chestPointStore.addChestPoints('basicChest', toFixed(600))

      // Total 1100 points = 1 chest + 100 remaining
      expect(chestPointStore.getChestPoints('basicChest')).toBe(toFixed(100))
    })
  })
})
