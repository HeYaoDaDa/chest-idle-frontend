import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useCombatStore } from '@/stores/combat'

// Mock gameConfig
vi.mock('@/gameConfig', async (importOriginal) => {
  const original = await importOriginal() as Record<string, unknown>
  return {
    ...original,
    skillConfigs: [
      { id: 'melee', name: 'skill.melee.name', skillType: 'combat' },
      { id: 'ranged', name: 'skill.ranged.name', skillType: 'combat' },
      { id: 'magic', name: 'skill.magic.name', skillType: 'combat' },
      { id: 'defense', name: 'skill.defense.name', skillType: 'combat' },
      { id: 'stamina', name: 'skill.stamina.name', skillType: 'combat' },
      { id: 'intelligence', name: 'skill.intelligence.name', skillType: 'combat' },
    ],
    enemyConfigMap: {
      slime: {
        type: 'enemy',
        id: 'slime',
        sort: 0,
        hp: 50,
        attack: 5,
        attackIntervalSeconds: 3,
        xpReward: 10,
        fixedLootItems: [{ itemId: 'slime-gel', count: 1 }],
        fixedChestPoints: [{ chestId: 'combat-chest', points: 5 }],
        name: 'enemy.slime.name',
        description: 'enemy.slime.description',
      },
      boss: {
        type: 'enemy',
        id: 'boss',
        sort: 1,
        hp: 10000,
        attack: 500,
        attackIntervalSeconds: 1,
        xpReward: 1000,
        fixedLootItems: [],
        fixedChestPoints: [],
        name: 'enemy.boss.name',
        description: 'enemy.boss.description',
      },
    },
  }
})

describe('Combat Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('基础属性计算', () => {
    it('应该根据技能等级计算基础属性', () => {
      const combatStore = useCombatStore()

      // 初始等级为 0，基础属性应该为 0
      expect(combatStore.atkMelee).toBe(0)
      expect(combatStore.atkRanged).toBe(0)
      expect(combatStore.atkMagic).toBe(0)
      expect(combatStore.defense).toBe(0)
      expect(combatStore.stamina).toBe(0)
      expect(combatStore.intelligence).toBe(0)
    })

    it('应该正确计算 MaxHP', () => {
      const combatStore = useCombatStore()

      // MaxHP = 10 * (10 + Sta) = 10 * (10 + 0) = 100
      expect(combatStore.maxHp).toBe(100)
    })

    it('应该正确计算 MaxMP', () => {
      const combatStore = useCombatStore()

      // MaxMP = 10 * (10 + Int) = 10 * (10 + 0) = 100
      expect(combatStore.maxMp).toBe(100)
    })

    it('应该正确计算护甲', () => {
      const combatStore = useCombatStore()

      // Armor = 0.2 * Def = 0.2 * 0 = 0
      expect(combatStore.armor).toBe(0)
    })

    it('应该正确计算伤害承受百分比', () => {
      const combatStore = useCombatStore()

      // 无护甲时，PhysicalDamageTaken% = 100 / (100 + 0) = 1
      expect(combatStore.physicalDamageTakenPercent).toBe(1)
    })
  })

  describe('战斗状态管理', () => {
    it('初始时应该没有战斗', () => {
      const combatStore = useCombatStore()
      expect(combatStore.currentBattle).toBeNull()
    })

    it('startBattle 应该对可战胜的敌人创建战斗状态', () => {
      const combatStore = useCombatStore()

      const result = combatStore.startBattle('slime', 1)

      expect(result).not.toBeNull()
      expect(result?.canWin).toBe(true)
      expect(combatStore.currentBattle).not.toBeNull()
      expect(combatStore.currentBattle?.enemyId).toBe('slime')
      expect(combatStore.currentBattle?.totalAmount).toBe(1)
    })

    it('startBattle 应该对无法战胜的敌人返回失败', () => {
      const combatStore = useCombatStore()

      const result = combatStore.startBattle('boss', 1)

      expect(result).not.toBeNull()
      expect(result?.canWin).toBe(false)
      expect(combatStore.currentBattle).toBeNull()
    })

    it('completeBattle 应该返回战斗奖励', () => {
      const combatStore = useCombatStore()

      combatStore.startBattle('slime', 5)
      const rewards = combatStore.completeBattle()

      expect(rewards).not.toBeNull()
      expect(rewards?.xpGains).toBeDefined()
      expect(rewards?.lootItems).toEqual([{ itemId: 'slime-gel', count: 1 }])
      expect(rewards?.chestPoints).toEqual([{ chestId: 'combat-chest', points: 5 }])
    })

    it('completeBattle 应该增加完成计数', () => {
      const combatStore = useCombatStore()

      combatStore.startBattle('slime', 5)
      expect(combatStore.currentBattle?.completedAmount).toBe(0)

      combatStore.completeBattle()
      expect(combatStore.currentBattle?.completedAmount).toBe(1)
    })

    it('cancelBattle 应该清除战斗状态', () => {
      const combatStore = useCombatStore()

      combatStore.startBattle('slime', 5)
      expect(combatStore.currentBattle).not.toBeNull()

      combatStore.cancelBattle()
      expect(combatStore.currentBattle).toBeNull()
    })

    it('clearBattle 应该清除战斗状态', () => {
      const combatStore = useCombatStore()

      combatStore.startBattle('slime', 5)
      expect(combatStore.currentBattle).not.toBeNull()

      combatStore.clearBattle()
      expect(combatStore.currentBattle).toBeNull()
    })

    it('isBattleComplete 应该正确判断战斗是否完成', () => {
      const combatStore = useCombatStore()

      // 无战斗时应返回 true
      expect(combatStore.isBattleComplete()).toBe(true)

      // 开始战斗
      combatStore.startBattle('slime', 2)
      expect(combatStore.isBattleComplete()).toBe(false)

      // 完成一场
      combatStore.completeBattle()
      expect(combatStore.isBattleComplete()).toBe(false)

      // 完成第二场
      combatStore.completeBattle()
      expect(combatStore.isBattleComplete()).toBe(true)
    })
  })

  describe('getPlayerStats', () => {
    it('应该返回正确的玩家战斗属性', () => {
      const combatStore = useCombatStore()
      const stats = combatStore.getPlayerStats()

      expect(stats.maxHp).toBe(100)
      expect(stats.maxMp).toBe(100)
      expect(stats.attack).toBe(10) // 10 + 0 (melee level)
      expect(stats.attackIntervalSeconds).toBe(3)
      expect(stats.attackType).toBe('melee')
      expect(stats.physicalDamageTakenPercent).toBe(1)
    })
  })
})
