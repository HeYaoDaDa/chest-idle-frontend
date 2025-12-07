import { beforeEach, describe, expect, it, vi } from 'vitest'

import { INFINITE_AMOUNT } from '@/utils/constants'
import { toFixed, toSecondsFixed } from '@/utils/fixedPoint'

import { ProductionExecutor } from './ProductionExecutor'

import type { Action } from '../action'

/* eslint-disable @typescript-eslint/no-explicit-any */
describe('ProductionExecutor', () => {
  let executor: ProductionExecutor
  let actionQueueStore: any
  let skillStore: any
  let inventoryStore: any
  let consumableStore: any
  let chestPointStore: any
  let notificationStore: any
  let lootNotificationStore: any

  beforeEach(() => {
    // Mock stores
    actionQueueStore = {
      actionStartDate: 1000,
      currentAction: { type: 'production', actionId: 'action1', amount: 10 },
      currentActionDetail: {
        id: 'action1',
        skillId: 'mining',
        minLevel: 1,
        durationSeconds: toSecondsFixed(2),
        xp: toFixed(10),
        chestId: 'chest1',
        chestPoints: toFixed(5),
        products: [{ itemId: 'ore', count: 1 }],
        ingredients: [{ itemId: 'pickaxe', count: 1 }],
        name: 'action.mining',
      },
      removeAction: vi.fn(),
      completeCurrentAction: vi.fn(),
    }

    skillStore = {
      getSkill: vi.fn(() => ({
        id: 'mining',
        remainingXpForUpgrade: toFixed(50),
      })),
      getSkillLevel: vi.fn(() => 5),
      addSkillXp: vi.fn(),
    }

    inventoryStore = {
      inventoryMap: { pickaxe: 100 },
      removeManyItems: vi.fn(),
      addManyItems: vi.fn(),
    }

    consumableStore = {
      estimateBuffedCounts: vi.fn(() => Infinity),
      consumeBuffs: vi.fn(() => []),
    }

    chestPointStore = {
      addChestPoints: vi.fn(() => 0),
    }

    notificationStore = {
      warning: vi.fn(),
      info: vi.fn(),
    }

    lootNotificationStore = {
      addNotification: vi.fn(),
    }

    executor = new ProductionExecutor(
      actionQueueStore,
      skillStore,
      inventoryStore,
      consumableStore,
      chestPointStore,
      notificationStore,
      lootNotificationStore,
    )
  })

  describe('update', () => {
    it('should return 0 if no action is running', () => {
      actionQueueStore.actionStartDate = null
      const result = executor.update(5000)
      expect(result).toBe(0)
    })

    it('should return 0 if elapsed time is less than duration', () => {
      const result = executor.update(1500) // 1.5 秒 < 2 秒
      expect(result).toBe(0)
    })

    it('should execute action once if elapsed time equals duration', () => {
      const result = executor.update(2000) // 2 秒 = 2 秒

      expect(inventoryStore.removeManyItems).toHaveBeenCalledWith([['pickaxe', 1]])
      expect(inventoryStore.addManyItems).toHaveBeenCalledWith([['ore', 1]])
      expect(skillStore.addSkillXp).toHaveBeenCalledWith('mining', toFixed(10))
      expect(actionQueueStore.completeCurrentAction).toHaveBeenCalledWith(2000, 1)
      expect(result).toBe(0)
    })

    it('should execute action multiple times if elapsed time allows', () => {
      const result = executor.update(5000) // 5 秒 / 2 秒 = 2 次

      expect(inventoryStore.removeManyItems).toHaveBeenCalledWith([['pickaxe', 2]])
      expect(inventoryStore.addManyItems).toHaveBeenCalledWith([['ore', 2]])
      expect(skillStore.addSkillXp).toHaveBeenCalledWith('mining', toFixed(20))
      expect(actionQueueStore.completeCurrentAction).toHaveBeenCalledWith(4000, 2)
      expect(result).toBe(1000) // 剩余 1 秒
    })

    it('should limit by material availability', () => {
      inventoryStore.inventoryMap = { pickaxe: 3 }
      actionQueueStore.currentAction.amount = INFINITE_AMOUNT

      const result = executor.update(10000) // 10 秒理论上可执行 5 次，但材料只够 3 次

      expect(inventoryStore.removeManyItems).toHaveBeenCalledWith([['pickaxe', 3]])
      expect(actionQueueStore.completeCurrentAction).toHaveBeenCalledWith(6000, 3)
      expect(result).toBe(4000)
    })

    it('should limit by XP upgrade threshold', () => {
      skillStore.getSkill.mockReturnValue({
        id: 'mining',
        remainingXpForUpgrade: toFixed(15), // 只够 2 次升级（10 * 2 = 20 > 15）
      })

      const result = executor.update(10000) // 理论上可执行 5 次

      expect(skillStore.addSkillXp).toHaveBeenCalledWith('mining', toFixed(20))
      expect(actionQueueStore.completeCurrentAction).toHaveBeenCalledWith(4000, 2)
      expect(result).toBe(6000)
    })

    it('should limit by consumable buff', () => {
      consumableStore.estimateBuffedCounts.mockReturnValue(2) // 消耗品只够 2 次

      const result = executor.update(10000) // 理论上可执行 5 次

      expect(actionQueueStore.completeCurrentAction).toHaveBeenCalledWith(4000, 2)
      expect(result).toBe(6000)
    })

    it('should remove action if computed amount is 0', () => {
      inventoryStore.inventoryMap = { pickaxe: 0 }

      const result = executor.update(5000)

      expect(actionQueueStore.removeAction).toHaveBeenCalledWith(0)
      // 注：checkCurrentActionItem 失败时，update() 返回 0
      expect(result).toBe(0)
    })

    it('should handle chest points and add chest item', () => {
      chestPointStore.addChestPoints.mockReturnValue(2) // 获得 2 个宝箱

      executor.update(2000)

      expect(inventoryStore.addManyItems).toHaveBeenCalledWith([
        ['ore', 1],
        ['chest1', 2],
      ])
      expect(notificationStore.info).toHaveBeenCalledWith('notification.chestObtained', {
        count: 2,
        chest: 'chest1',
      })
    })
  })

  describe('checkCurrentActionItem', () => {
    it('should return false if level is too low', () => {
      skillStore.getSkillLevel.mockReturnValue(0) // 等级 0 < 要求等级 1
      skillStore.getSkill.mockReturnValue({
        id: 'mining',
        name: 'skill.mining',
      })
      actionQueueStore.currentActionDetail = {
        ...actionQueueStore.currentActionDetail,
        minLevel: 1,
      } as Action

      const result = executor.update(5000)

      expect(notificationStore.warning).toHaveBeenCalledWith(
        'notification.levelTooLow',
        expect.any(Object),
      )
      expect(actionQueueStore.removeAction).toHaveBeenCalledWith(0)
      expect(result).toBe(0)
    })

    it('should return false if not enough materials', () => {
      inventoryStore.inventoryMap = {}

      const result = executor.update(5000)

      expect(notificationStore.warning).toHaveBeenCalledWith(
        'notification.notEnoughMaterials',
        expect.any(Object),
      )
      expect(actionQueueStore.removeAction).toHaveBeenCalledWith(0)
      expect(result).toBe(0)
    })

    it('should update action amount based on available materials', () => {
      inventoryStore.inventoryMap = { pickaxe: 5 }
      actionQueueStore.currentAction.amount = INFINITE_AMOUNT

      executor.update(2000)

      expect(actionQueueStore.currentAction.amount).toBe(5)
    })
  })
})
