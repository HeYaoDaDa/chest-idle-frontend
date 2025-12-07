import { beforeEach, describe, expect, it } from 'vitest'

import { toSecondsFixed } from '@/utils/fixedPoint'

import { ProgressCalculator } from './ProgressCalculator'

describe('ProgressCalculator', () => {
  let mockActionQueueStore: {
    actionStartDate: number | null
    currentAction: unknown
    isCombatAction: boolean
    currentActionDetail: unknown
    progress: number
  }
  let calculator: ProgressCalculator

  beforeEach(() => {
    mockActionQueueStore = {
      actionStartDate: null,
      currentAction: null,
      isCombatAction: false,
      currentActionDetail: null,
      progress: 0,
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    calculator = new ProgressCalculator(mockActionQueueStore as any)
  })

  describe('update', () => {
    it('should set progress to 0 when no action is running', () => {
      calculator.update(1000)
      expect(mockActionQueueStore.progress).toBe(0)
    })

    it('should set progress to 0 when actionStartDate is null', () => {
      mockActionQueueStore.currentAction = { type: 'production', actionId: 'mining', amount: 1 }
      mockActionQueueStore.actionStartDate = null

      calculator.update(1000)
      expect(mockActionQueueStore.progress).toBe(0)
    })

    it('should calculate production action progress correctly', () => {
      const startTime = 1000
      const durationSeconds = 10
      mockActionQueueStore.actionStartDate = startTime
      mockActionQueueStore.currentAction = { type: 'production', actionId: 'mining', amount: 1 }
      mockActionQueueStore.isCombatAction = false
      mockActionQueueStore.currentActionDetail = {
        durationSeconds: toSecondsFixed(durationSeconds),
      }

      // 5 seconds elapsed (50% progress)
      calculator.update(startTime + 5000)
      expect(mockActionQueueStore.progress).toBeCloseTo(50, 1)

      // 10 seconds elapsed (100% progress)
      calculator.update(startTime + 10000)
      expect(mockActionQueueStore.progress).toBe(100)

      // 15 seconds elapsed (capped at 100%)
      calculator.update(startTime + 15000)
      expect(mockActionQueueStore.progress).toBe(100)
    })

    it('should calculate combat action progress correctly', () => {
      const startTime = 2000
      const durationSeconds = 8
      mockActionQueueStore.actionStartDate = startTime
      mockActionQueueStore.currentAction = {
        type: 'combat',
        actionId: 'slime',
        amount: 5,
        combatDurationSeconds: durationSeconds,
      }
      mockActionQueueStore.isCombatAction = true

      // 4 seconds elapsed (50% progress)
      calculator.update(startTime + 4000)
      expect(mockActionQueueStore.progress).toBeCloseTo(50, 1)

      // 8 seconds elapsed (100% progress)
      calculator.update(startTime + 8000)
      expect(mockActionQueueStore.progress).toBe(100)
    })

    it('should handle zero duration gracefully', () => {
      mockActionQueueStore.actionStartDate = 1000
      mockActionQueueStore.currentAction = {
        type: 'combat',
        actionId: 'slime',
        amount: 1,
        combatDurationSeconds: 0,
      }
      mockActionQueueStore.isCombatAction = true

      calculator.update(2000)
      expect(mockActionQueueStore.progress).toBe(0)
    })

    it('should set progress to 0 when currentActionDetail is missing for production', () => {
      mockActionQueueStore.actionStartDate = 1000
      mockActionQueueStore.currentAction = { type: 'production', actionId: 'mining', amount: 1 }
      mockActionQueueStore.isCombatAction = false
      mockActionQueueStore.currentActionDetail = null

      calculator.update(2000)
      expect(mockActionQueueStore.progress).toBe(0)
    })
  })
})
