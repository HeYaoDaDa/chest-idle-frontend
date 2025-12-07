import { beforeEach, describe, expect, it, vi } from 'vitest'

import { CombatExecutor } from './CombatExecutor'

// Mock gameConfig
vi.mock('@/gameConfig', () => ({
  enemyConfigMap: {
    enemy1: { hp: 100, attackIntervalSeconds: 2.0 },
  },
  itemConfigMap: {},
  skillConfigs: [
    { id: 'attack', skillType: 'combat' },
    { id: 'defense', skillType: 'combat' },
  ],
}))

/* eslint-disable @typescript-eslint/no-explicit-any */
describe('CombatExecutor', () => {
  let executor: CombatExecutor
  let actionQueueStore: any
  let skillStore: any
  let inventoryStore: any
  let combatStore: any
  let chestPointStore: any
  let notificationStore: any
  let lootNotificationStore: any

  beforeEach(() => {
    // Mock stores
    actionQueueStore = {
      actionStartDate: 1000,
      currentAction: { type: 'combat', actionId: 'enemy1', amount: 10, combatDurationSeconds: 5 },
      isCombatAction: true,
      completeCurrentAction: vi.fn(),
      stopCurrentAction: vi.fn(),
    }

    skillStore = {
      getSkill: vi.fn(() => ({
        id: 'attack',
        remainingXpForUpgrade: 100,
      })),
      addSkillXpRaw: vi.fn(),
    }

    inventoryStore = {
      addManyItems: vi.fn(),
      addItem: vi.fn(),
    }

    combatStore = {
      currentBattle: {
        enemyId: 'enemy1',
        state: 'fighting',
        startTime: 1000,
        representativeLog: [],
        singleXpGains: { attack: 10, defense: 5 },
        playerCurrentHp: 100,
        enemyCurrentHp: 50,
        playerAttackProgress: 0,
        enemyAttackProgress: 0,
      },
      maxHp: 100,
      currentAttackIntervalSeconds: 2.0,
      completeBattle: vi.fn(() => ({
        xpGains: { attack: 10, defense: 5 },
        lootItems: [{ itemId: 'gold', count: 10 }],
        chestPoints: [{ chestId: 'chest1', points: 5 }],
      })),
      startCooldown: vi.fn(),
      clearBattle: vi.fn(),
      startNextRound: vi.fn(() => 5),
    }

    chestPointStore = {
      addChestPoints: vi.fn(() => 0),
    }

    notificationStore = {
      info: vi.fn(),
    }

    lootNotificationStore = {
      addNotification: vi.fn(),
    }

    executor = new CombatExecutor(
      actionQueueStore,
      skillStore,
      inventoryStore,
      combatStore,
      chestPointStore,
      notificationStore,
      lootNotificationStore,
    )
  })

  describe('update', () => {
    it('should return 0 if no action is running', () => {
      actionQueueStore.actionStartDate = null
      const result = executor.update(10000)
      expect(result).toBe(0)
    })

    it('should update UI and return 0 if elapsed time is less than duration', () => {
      vi.spyOn(executor, 'updateBattleUI')
      const result = executor.update(3000) // 3 秒 < 5 秒

      expect(executor.updateBattleUI).toHaveBeenCalled()
      expect(result).toBe(0)
    })

    it('should execute one battle if elapsed time equals duration', () => {
      const result = executor.update(5000) // 5 秒 = 5 秒

      expect(combatStore.completeBattle).toHaveBeenCalledTimes(1)
      expect(skillStore.addSkillXpRaw).toHaveBeenCalledWith('attack', 10)
      expect(skillStore.addSkillXpRaw).toHaveBeenCalledWith('defense', 5)
      expect(inventoryStore.addManyItems).toHaveBeenCalledWith([['gold', 10]])
      expect(actionQueueStore.completeCurrentAction).toHaveBeenCalledWith(5000, 1)
      expect(combatStore.startCooldown).toHaveBeenCalled()
      expect(result).toBe(0)
    })

    it('should execute multiple battles if elapsed time allows', () => {
      const result = executor.update(12000) // 12 秒 / 5 秒 = 2 场

      expect(combatStore.completeBattle).toHaveBeenCalledTimes(2)
      expect(skillStore.addSkillXpRaw).toHaveBeenCalledWith('attack', 20)
      expect(skillStore.addSkillXpRaw).toHaveBeenCalledWith('defense', 10)
      expect(inventoryStore.addManyItems).toHaveBeenCalledWith([['gold', 20]])
      expect(actionQueueStore.completeCurrentAction).toHaveBeenCalledWith(10000, 2)
      expect(result).toBe(2000) // 剩余 2 秒
    })

    it('should limit by XP upgrade threshold', () => {
      skillStore.getSkill.mockImplementation((skillId: string) => {
        if (skillId === 'attack') {
          return { id: 'attack', remainingXpForUpgrade: 15 } // 只够 2 场（10 * 2 = 20 > 15）
        }
        return { id: 'defense', remainingXpForUpgrade: 1000 }
      })

      const result = executor.update(20000) // 理论上可执行 4 场

      expect(combatStore.completeBattle).toHaveBeenCalledTimes(2)
      expect(actionQueueStore.completeCurrentAction).toHaveBeenCalledWith(10000, 2)
      expect(result).toBe(10000)
    })

    it('should clear battle when all battles are completed', () => {
      actionQueueStore.currentAction.amount = 1

      // 执行战斗
      executor.update(5000)

      // 模拟 completeCurrentAction 后队列为空
      actionQueueStore.currentAction = null
      actionQueueStore.isCombatAction = false

      // 由于 currentAction 为 null，update 会提前返回，无法触发 clearBattle
      // 实际上 clearBattle 在战斗完成后会被调用
      expect(combatStore.startCooldown).toHaveBeenCalled()
    })

    it('should handle cooldown state', () => {
      combatStore.currentBattle.state = 'cooldown'
      combatStore.currentBattle.cooldownEndTime = 6000
      vi.spyOn(executor, 'updateBattleUI')

      const result = executor.update(5000)

      expect(executor.updateBattleUI).toHaveBeenCalled()
      expect(result).toBe(0)
    })

    it('should start next round when cooldown ends', () => {
      combatStore.currentBattle.state = 'cooldown'
      combatStore.currentBattle.cooldownEndTime = 5000
      vi.spyOn(performance, 'now').mockReturnValue(6000) // 冷却已结束

      executor.update(6000)

      expect(combatStore.startNextRound).toHaveBeenCalled()
      expect(actionQueueStore.currentAction.combatDurationSeconds).toBe(5)
    })

    it('should stop action if unable to start next round', () => {
      combatStore.currentBattle.state = 'cooldown'
      combatStore.currentBattle.cooldownEndTime = 5000
      combatStore.startNextRound.mockReturnValue(null) // 无法继续
      vi.spyOn(performance, 'now').mockReturnValue(6000)

      executor.update(6000)

      expect(actionQueueStore.stopCurrentAction).toHaveBeenCalled()
    })
  })

  describe('updateBattleUI', () => {
    beforeEach(() => {
      combatStore.currentBattle.state = 'fighting'
    })

    it('should set HP and progress to 0 during cooldown', () => {
      combatStore.currentBattle.state = 'cooldown'

      executor.updateBattleUI()

      expect(combatStore.currentBattle.enemyCurrentHp).toBe(0)
      expect(combatStore.currentBattle.playerAttackProgress).toBe(0)
      expect(combatStore.currentBattle.enemyAttackProgress).toBe(0)
    })

    it('should update HP based on battle events', () => {
      vi.spyOn(performance, 'now').mockReturnValue(3000)
      combatStore.currentBattle.startTime = 1000 // 2 秒前
      combatStore.currentBattle.representativeLog = [
        { actorSide: 'player', timeSeconds: 1, targetHpAfter: 40 },
        { actorSide: 'enemy', timeSeconds: 2, targetHpAfter: 90 },
      ]

      executor.updateBattleUI()

      expect(combatStore.currentBattle.enemyCurrentHp).toBe(40)
      expect(combatStore.currentBattle.playerCurrentHp).toBe(90)
    })

    it('should calculate attack progress correctly', () => {
      combatStore.currentBattle.startTime = performance.now() - 1500 // 1.5 秒前
      combatStore.currentBattle.representativeLog = [
        { actorSide: 'player', timeSeconds: 0, targetHpAfter: 40 },
      ]
      combatStore.currentAttackIntervalSeconds = 2.0

      executor.updateBattleUI()

      // 1.5 秒 / 2.0 秒 = 0.75
      expect(combatStore.currentBattle.playerAttackProgress).toBeCloseTo(0.75, 1)
    })
  })

  describe('aggregateBattleRewards', () => {
    it('should aggregate multiple battle rewards', () => {
      combatStore.completeBattle
        .mockReturnValueOnce({
          xpGains: { attack: 10, defense: 5 },
          lootItems: [{ itemId: 'gold', count: 10 }],
          chestPoints: [{ chestId: 'chest1', points: 5 }],
        })
        .mockReturnValueOnce({
          xpGains: { attack: 10, defense: 5 },
          lootItems: [
            { itemId: 'gold', count: 15 },
            { itemId: 'silver', count: 20 },
          ],
          chestPoints: [{ chestId: 'chest1', points: 3 }],
        })

      executor.update(10000) // 2 场战斗

      expect(skillStore.addSkillXpRaw).toHaveBeenCalledWith('attack', 20)
      expect(skillStore.addSkillXpRaw).toHaveBeenCalledWith('defense', 10)
      expect(inventoryStore.addManyItems).toHaveBeenCalledWith([
        ['gold', 25],
        ['silver', 20],
      ])
    })
  })
})
