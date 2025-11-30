import { describe, it, expect } from 'vitest'

import {
  simulateSingleBattle,
  simulateBattles,
  type PlayerCombatStats,
} from '@/utils/combatSimulator'

import type { EnemyConfig } from '@/gameConfig'

// ==================== 测试数据 ====================

const createPlayerStats = (overrides: Partial<PlayerCombatStats> = {}): PlayerCombatStats => ({
  maxHp: 100,
  maxMp: 100,
  attack: 10,
  attackIntervalSeconds: 3,
  attackType: 'melee',
  physicalDamageTakenPercent: 1, // 100% 伤害承受（无防御）
  ...overrides,
})

const createEnemyConfig = (overrides: Partial<EnemyConfig> = {}): EnemyConfig => ({
  type: 'enemy',
  id: 'test-enemy',
  sort: 0,
  hp: 50,
  attack: 5,
  attackIntervalSeconds: 3,
  xpReward: 10,
  fixedLootItems: [],
  fixedChestPoints: [],
  name: 'enemy.test.name',
  description: 'enemy.test.description',
  ...overrides,
})

// ==================== 单场战斗测试 ====================

describe('simulateSingleBattle', () => {
  it('玩家应该能击败弱敌人', () => {
    const player = createPlayerStats({ attack: 20 })
    const enemy = createEnemyConfig({ hp: 30, attack: 5 })

    const result = simulateSingleBattle(player, enemy)

    expect(result.canWin).toBe(true)
    expect(result.enemyHpRemaining).toBe(0)
    expect(result.playerHpRemaining).toBeGreaterThan(0)
    expect(result.log.length).toBeGreaterThan(0)
  })

  it('玩家应该输给强敌人', () => {
    const player = createPlayerStats({ maxHp: 30, attack: 5 })
    const enemy = createEnemyConfig({ hp: 100, attack: 20 })

    const result = simulateSingleBattle(player, enemy)

    expect(result.canWin).toBe(false)
    expect(result.playerHpRemaining).toBe(0)
    expect(result.enemyHpRemaining).toBeGreaterThan(0)
  })

  it('战斗应该是确定性的（相同输入产生相同输出）', () => {
    const player = createPlayerStats()
    const enemy = createEnemyConfig()

    const result1 = simulateSingleBattle(player, enemy)
    const result2 = simulateSingleBattle(player, enemy)

    expect(result1.canWin).toBe(result2.canWin)
    expect(result1.durationSeconds).toBe(result2.durationSeconds)
    expect(result1.playerHpRemaining).toBe(result2.playerHpRemaining)
    expect(result1.enemyHpRemaining).toBe(result2.enemyHpRemaining)
    expect(result1.log.length).toBe(result2.log.length)

    // 验证每个事件都相同
    for (let i = 0; i < result1.log.length; i++) {
      expect(result1.log[i].timeSeconds).toBe(result2.log[i].timeSeconds)
      expect(result1.log[i].actorSide).toBe(result2.log[i].actorSide)
      expect(result1.log[i].damage).toBe(result2.log[i].damage)
      expect(result1.log[i].targetHpAfter).toBe(result2.log[i].targetHpAfter)
    }
  })

  it('事件日志应该按时间顺序排列', () => {
    const player = createPlayerStats()
    const enemy = createEnemyConfig()

    const result = simulateSingleBattle(player, enemy)

    for (let i = 1; i < result.log.length; i++) {
      expect(result.log[i].timeSeconds).toBeGreaterThanOrEqual(
        result.log[i - 1].timeSeconds,
      )
    }
  })

  it('战斗持续时间应该等于最后一个事件的时间', () => {
    const player = createPlayerStats()
    const enemy = createEnemyConfig()

    const result = simulateSingleBattle(player, enemy)

    const lastEventTime = result.log[result.log.length - 1].timeSeconds
    expect(result.durationSeconds).toBe(lastEventTime)
  })

  it('近战攻击应该累计近战经验', () => {
    const player = createPlayerStats({ attackType: 'melee', attack: 20 })
    const enemy = createEnemyConfig({ hp: 40 })

    const result = simulateSingleBattle(player, enemy)

    expect(result.canWin).toBe(true)
    expect(result.xpGains.melee).toBeGreaterThan(0)
    expect(result.xpGains.ranged).toBe(0)
    expect(result.xpGains.magic).toBe(0)
  })

  it('远程攻击应该累计远程经验', () => {
    const player = createPlayerStats({ attackType: 'ranged', attack: 20 })
    const enemy = createEnemyConfig({ hp: 40 })

    const result = simulateSingleBattle(player, enemy)

    expect(result.canWin).toBe(true)
    expect(result.xpGains.ranged).toBeGreaterThan(0)
    expect(result.xpGains.melee).toBe(0)
    expect(result.xpGains.magic).toBe(0)
  })

  it('魔法攻击应该累计魔法经验', () => {
    const player = createPlayerStats({ attackType: 'magic', attack: 20 })
    const enemy = createEnemyConfig({ hp: 40 })

    const result = simulateSingleBattle(player, enemy)

    expect(result.canWin).toBe(true)
    expect(result.xpGains.magic).toBeGreaterThan(0)
    expect(result.xpGains.melee).toBe(0)
    expect(result.xpGains.ranged).toBe(0)
  })

  it('受到伤害应该累计耐力经验', () => {
    const player = createPlayerStats({ maxHp: 100, attack: 15 })
    const enemy = createEnemyConfig({ hp: 30, attack: 10 })

    const result = simulateSingleBattle(player, enemy)

    expect(result.canWin).toBe(true)
    expect(result.xpGains.stamina).toBeGreaterThan(0)
  })

  it('防御抵挡伤害应该累计防御经验', () => {
    const player = createPlayerStats({
      maxHp: 100,
      attack: 15,
      physicalDamageTakenPercent: 0.5, // 50% 伤害承受（50% 被抵挡）
    })
    const enemy = createEnemyConfig({ hp: 30, attack: 10 })

    const result = simulateSingleBattle(player, enemy)

    expect(result.canWin).toBe(true)
    expect(result.xpGains.defense).toBeGreaterThan(0)
    // 抵挡了一半的伤害
    expect(result.xpGains.defense).toBe(result.xpGains.stamina)
  })

  it('攻击间隔更短的一方应该先攻击', () => {
    const player = createPlayerStats({ attackIntervalSeconds: 2 })
    const enemy = createEnemyConfig({ attackIntervalSeconds: 3 })

    const result = simulateSingleBattle(player, enemy)

    // 第一个事件应该是玩家攻击
    expect(result.log[0].actorSide).toBe('player')
    expect(result.log[0].timeSeconds).toBeCloseTo(2)
  })

  it('攻击间隔相同时玩家应该先攻击', () => {
    const player = createPlayerStats({ attackIntervalSeconds: 3 })
    const enemy = createEnemyConfig({ attackIntervalSeconds: 3 })

    const result = simulateSingleBattle(player, enemy)

    // 第一个事件应该是玩家攻击
    expect(result.log[0].actorSide).toBe('player')
  })
})

// ==================== 批量战斗测试 ====================

describe('simulateBattles', () => {
  it('amount=1 应该与单场模拟结果一致', () => {
    const player = createPlayerStats({ attack: 20 })
    const enemy = createEnemyConfig({ hp: 30 })

    const singleResult = simulateSingleBattle(player, enemy)
    const batchResult = simulateBattles(player, enemy, 1)

    expect(batchResult.canWin).toBe(singleResult.canWin)
    expect(batchResult.aggregatedResult.durationSeconds).toBe(singleResult.durationSeconds)
    expect(batchResult.perBattleSummary.length).toBe(1)
    expect(batchResult.representativeBattleLog).toEqual(singleResult.log)
  })

  it('amount>1 时应该正确聚合结果', () => {
    const player = createPlayerStats({ attack: 20 })
    const enemy = createEnemyConfig({ hp: 30 })
    const amount = 5

    const singleResult = simulateSingleBattle(player, enemy)
    const batchResult = simulateBattles(player, enemy, amount)

    expect(batchResult.canWin).toBe(true)
    expect(batchResult.perBattleSummary.length).toBe(amount)
    expect(batchResult.aggregatedResult.durationSeconds).toBe(
      singleResult.durationSeconds * amount,
    )
  })

  it('打不过时应该返回 canWin=false 且不生成后续场次', () => {
    const player = createPlayerStats({ maxHp: 30, attack: 5 })
    const enemy = createEnemyConfig({ hp: 100, attack: 20 })

    const result = simulateBattles(player, enemy, 10)

    expect(result.canWin).toBe(false)
    expect(result.perBattleSummary.length).toBe(0)
    expect(result.aggregatedResult.durationSeconds).toBe(0)
    // 仍然有代表性战斗日志（失败的那场）
    expect(result.representativeBattleLog.length).toBeGreaterThan(0)
  })

  it('经验聚合应该是各场总和', () => {
    const player = createPlayerStats({ attack: 20 })
    const enemy = createEnemyConfig({ hp: 30 })
    const amount = 3

    const singleResult = simulateSingleBattle(player, enemy)
    const batchResult = simulateBattles(player, enemy, amount)

    expect(batchResult.aggregatedResult.xpGains.melee).toBe(singleResult.xpGains.melee * amount)
    expect(batchResult.aggregatedResult.xpGains.stamina).toBe(singleResult.xpGains.stamina * amount)
    expect(batchResult.aggregatedResult.xpGains.defense).toBe(singleResult.xpGains.defense * amount)
  })

  it('掉落物品应该按战斗次数累计', () => {
    const player = createPlayerStats({ attack: 20 })
    const enemy = createEnemyConfig({
      hp: 30,
      fixedLootItems: [{ itemId: 'test-item', count: 2 }],
    })
    const amount = 5

    const result = simulateBattles(player, enemy, amount)

    expect(result.canWin).toBe(true)
    expect(result.aggregatedResult.lootItems).toHaveLength(1)
    expect(result.aggregatedResult.lootItems[0].itemId).toBe('test-item')
    expect(result.aggregatedResult.lootItems[0].count).toBe(2 * amount)
  })

  it('宝箱点数应该按战斗次数累计', () => {
    const player = createPlayerStats({ attack: 20 })
    const enemy = createEnemyConfig({
      hp: 30,
      fixedChestPoints: [{ chestId: 'test-chest', points: 10 }],
    })
    const amount = 3

    const result = simulateBattles(player, enemy, amount)

    expect(result.canWin).toBe(true)
    expect(result.aggregatedResult.chestPoints).toHaveLength(1)
    expect(result.aggregatedResult.chestPoints[0].chestId).toBe('test-chest')
    expect(result.aggregatedResult.chestPoints[0].points).toBe(10 * amount)
  })

  it('多次调用应该产生完全相同的结果（确定性）', () => {
    const player = createPlayerStats({ attack: 20 })
    const enemy = createEnemyConfig({ hp: 30 })
    const amount = 10

    const result1 = simulateBattles(player, enemy, amount)
    const result2 = simulateBattles(player, enemy, amount)

    expect(result1.canWin).toBe(result2.canWin)
    expect(result1.aggregatedResult.durationSeconds).toBe(
      result2.aggregatedResult.durationSeconds,
    )
    expect(result1.aggregatedResult.xpGains).toEqual(result2.aggregatedResult.xpGains)
    expect(result1.perBattleSummary.length).toBe(result2.perBattleSummary.length)
  })
})
