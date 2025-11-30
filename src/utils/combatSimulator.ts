/**
 * 战斗模拟器
 *
 * 实现确定性的战斗模拟，用于：
 * 1. 预判玩家是否能击败敌人
 * 2. 计算战斗持续时间
 * 3. 生成战斗事件流供前端回放
 * 4. 计算经验和掉落奖励
 *
 * 设计原则：
 * - 完全确定性：相同输入必定产生相同输出
 * - 事件驱动：按攻击时间点跳跃，而非逐帧模拟
 * - 纯函数：不依赖外部状态，便于测试和批量模拟
 */

import type { EnemyConfig } from '@/gameConfig'

// ==================== 类型定义 ====================

/**
 * 攻击类型
 */
export type AttackType = 'melee' | 'ranged' | 'magic'

/**
 * 战斗单位（玩家或敌人）
 */
export interface CombatUnit {
  /** 当前生命值 */
  hp: number
  /** 最大生命值 */
  maxHp: number
  /** 攻击力（原始伤害） */
  attack: number
  /** 攻击间隔（秒） */
  attackIntervalSeconds: number
  /** 攻击类型（仅玩家有意义） */
  attackType?: AttackType
  /** 物理伤害承受比例（0-1，1表示全额受伤） */
  damageTakenPercent: number
}

/**
 * 玩家战斗属性输入
 */
export interface PlayerCombatStats {
  maxHp: number
  maxMp: number
  attack: number
  attackIntervalSeconds: number
  attackType: AttackType
  /** 物理伤害承受比例 */
  physicalDamageTakenPercent: number
}

/**
 * 战斗事件
 */
export interface CombatEvent {
  /** 事件发生时间（秒） */
  timeSeconds: number
  /** 攻击方：'player' | 'enemy' */
  actorSide: 'player' | 'enemy'
  /** 攻击者在阵容中的索引（v1 固定为 0） */
  actorIndex: number
  /** 目标在阵容中的索引（v1 固定为 0） */
  targetIndex: number
  /** 攻击类型 */
  attackType: AttackType
  /** 原始伤害（未考虑防御） */
  rawDamage: number
  /** 实际伤害（考虑防御后） */
  damage: number
  /** 目标剩余生命值 */
  targetHpAfter: number
}

/**
 * 战斗经验增益（六个战斗技能）
 */
export interface CombatXpGains {
  melee: number
  ranged: number
  magic: number
  defense: number
  stamina: number
  intelligence: number
}

/**
 * 单场战斗结果
 */
export interface SingleBattleResult {
  /** 玩家是否获胜 */
  canWin: boolean
  /** 战斗持续时间（秒） */
  durationSeconds: number
  /** 战斗事件流 */
  log: CombatEvent[]
  /** 经验增益 */
  xpGains: CombatXpGains
  /** 玩家剩余生命值 */
  playerHpRemaining: number
  /** 敌人剩余生命值 */
  enemyHpRemaining: number
}

/**
 * 批量战斗的单场摘要
 */
export interface BattleSummary {
  /** 战斗持续时间（秒） */
  durationSeconds: number
  /** 经验增益 */
  xpGains: CombatXpGains
  /** 玩家剩余生命值 */
  playerHpRemaining: number
}

/**
 * 批量战斗聚合结果
 */
export interface AggregatedBattleResult {
  /** 总战斗时间（秒） */
  durationSeconds: number
  /** 总经验增益 */
  xpGains: CombatXpGains
  /** 掉落物品 */
  lootItems: { itemId: string; count: number }[]
  /** 宝箱点数 */
  chestPoints: { chestId: string; points: number }[]
}

/**
 * 批量战斗结果
 */
export interface BatchBattleResult {
  /** 玩家是否能赢（至少第一场） */
  canWin: boolean
  /** 每场战斗的摘要 */
  perBattleSummary: BattleSummary[]
  /** 聚合结果 */
  aggregatedResult: AggregatedBattleResult
  /** 代表性战斗的完整事件流（第一场） */
  representativeBattleLog: CombatEvent[]
}

// ==================== 辅助函数 ====================

/**
 * 创建空的经验增益对象
 */
function createEmptyXpGains(): CombatXpGains {
  return {
    melee: 0,
    ranged: 0,
    magic: 0,
    defense: 0,
    stamina: 0,
    intelligence: 0,
  }
}

/**
 * 合并两个经验增益对象
 */
function mergeXpGains(a: CombatXpGains, b: CombatXpGains): CombatXpGains {
  return {
    melee: a.melee + b.melee,
    ranged: a.ranged + b.ranged,
    magic: a.magic + b.magic,
    defense: a.defense + b.defense,
    stamina: a.stamina + b.stamina,
    intelligence: a.intelligence + b.intelligence,
  }
}

/**
 * 从玩家属性创建战斗单位
 */
function createPlayerUnit(stats: PlayerCombatStats): CombatUnit {
  return {
    hp: stats.maxHp,
    maxHp: stats.maxHp,
    attack: stats.attack,
    attackIntervalSeconds: stats.attackIntervalSeconds,
    attackType: stats.attackType,
    damageTakenPercent: stats.physicalDamageTakenPercent,
  }
}

/**
 * 从敌人配置创建战斗单位
 */
function createEnemyUnit(enemy: EnemyConfig): CombatUnit {
  return {
    hp: enemy.hp,
    maxHp: enemy.hp,
    attack: enemy.attack,
    attackIntervalSeconds: enemy.attackIntervalSeconds,
    attackType: 'melee', // 敌人默认近战
    damageTakenPercent: 1, // v1 敌人无防御
  }
}

// ==================== 核心模拟函数 ====================

/**
 * 模拟单场 1v1 战斗
 *
 * 使用事件驱动的时间推进方式，每次跳到下一次攻击发生的时间点。
 *
 * @param playerStats 玩家战斗属性
 * @param enemyConfig 敌人配置
 * @returns 单场战斗结果
 */
export function simulateSingleBattle(
  playerStats: PlayerCombatStats,
  enemyConfig: EnemyConfig,
): SingleBattleResult {
  // 初始化战斗单位
  const player = createPlayerUnit(playerStats)
  const enemy = createEnemyUnit(enemyConfig)

  // 战斗状态
  let currentTimeSeconds = 0
  let playerNextAttackTime = player.attackIntervalSeconds
  let enemyNextAttackTime = enemy.attackIntervalSeconds

  // 事件日志
  const log: CombatEvent[] = []

  // 经验累计器
  const xpGains = createEmptyXpGains()

  // 战斗循环：直到一方 HP <= 0
  while (player.hp > 0 && enemy.hp > 0) {
    // 确定下一个事件：谁先攻击
    const playerAttacksFirst = playerNextAttackTime <= enemyNextAttackTime

    if (playerAttacksFirst) {
      // 玩家攻击敌人
      currentTimeSeconds = playerNextAttackTime

      // 计算伤害（敌人 v1 无防御）
      const rawDamage = player.attack
      const actualDamage = Math.floor(rawDamage * enemy.damageTakenPercent)

      // 应用伤害
      enemy.hp = Math.max(0, enemy.hp - actualDamage)

      // 记录事件
      const event: CombatEvent = {
        timeSeconds: currentTimeSeconds,
        actorSide: 'player',
        actorIndex: 0,
        targetIndex: 0,
        attackType: player.attackType || 'melee',
        rawDamage,
        damage: actualDamage,
        targetHpAfter: enemy.hp,
      }
      log.push(event)

      // 累计攻击经验（按攻击类型）
      const attackType = player.attackType || 'melee'
      xpGains[attackType] += actualDamage

      // 更新玩家下次攻击时间
      playerNextAttackTime = currentTimeSeconds + player.attackIntervalSeconds
    } else {
      // 敌人攻击玩家
      currentTimeSeconds = enemyNextAttackTime

      // 计算伤害（考虑玩家防御）
      const rawDamage = enemy.attack
      const actualDamage = Math.floor(rawDamage * player.damageTakenPercent)

      // 应用伤害
      player.hp = Math.max(0, player.hp - actualDamage)

      // 记录事件
      const event: CombatEvent = {
        timeSeconds: currentTimeSeconds,
        actorSide: 'enemy',
        actorIndex: 0,
        targetIndex: 0,
        attackType: 'melee', // 敌人默认近战
        rawDamage,
        damage: actualDamage,
        targetHpAfter: player.hp,
      }
      log.push(event)

      // 累计防御经验（抵挡的伤害）
      const blockedDamage = Math.max(0, rawDamage - actualDamage)
      xpGains.defense += blockedDamage

      // 累计耐力经验（实际受到的伤害）
      xpGains.stamina += actualDamage

      // 更新敌人下次攻击时间
      enemyNextAttackTime = currentTimeSeconds + enemy.attackIntervalSeconds
    }
  }

  // 确定战斗结果
  const canWin = player.hp > 0 && enemy.hp <= 0

  return {
    canWin,
    durationSeconds: currentTimeSeconds,
    log,
    xpGains,
    playerHpRemaining: player.hp,
    enemyHpRemaining: enemy.hp,
  }
}

/**
 * 模拟多场连续战斗
 *
 * @param playerStats 玩家战斗属性
 * @param enemyConfig 敌人配置
 * @param amount 战斗次数（-1 表示无限）
 * @returns 批量战斗结果
 */
export function simulateBattles(
  playerStats: PlayerCombatStats,
  enemyConfig: EnemyConfig,
  amount: number,
): BatchBattleResult {
  // 先模拟第一场，检查是否能赢
  const firstBattle = simulateSingleBattle(playerStats, enemyConfig)

  if (!firstBattle.canWin) {
    // 打不过，返回失败结果
    return {
      canWin: false,
      perBattleSummary: [],
      aggregatedResult: {
        durationSeconds: 0,
        xpGains: createEmptyXpGains(),
        lootItems: [],
        chestPoints: [],
      },
      representativeBattleLog: firstBattle.log,
    }
  }

  // 处理无限战斗次数的情况（amount = -1）
  // 无限战斗时，只返回第一场的结果，实际执行由 actionRunner 逐场处理
  const isInfinite = amount === -1
  const actualAmount = isInfinite ? 1 : amount

  // 能赢，进行批量模拟
  const perBattleSummary: BattleSummary[] = []
  let totalDurationSeconds = 0
  let totalXpGains = createEmptyXpGains()

  // 由于战斗是确定性的，每场战斗结果相同
  // 所以可以直接用第一场的结果乘以次数
  for (let i = 0; i < actualAmount; i++) {
    // 对于相同的玩家属性和敌人，每场战斗结果相同
    // v1 简化：直接复用第一场的结果
    perBattleSummary.push({
      durationSeconds: firstBattle.durationSeconds,
      xpGains: { ...firstBattle.xpGains },
      playerHpRemaining: firstBattle.playerHpRemaining,
    })

    totalDurationSeconds += firstBattle.durationSeconds
    totalXpGains = mergeXpGains(totalXpGains, firstBattle.xpGains)
  }

  // 计算掉落（每场战斗都会掉落）
  // 无限战斗时，只计算单场掉落
  const lootItems: { itemId: string; count: number }[] = []
  for (const loot of enemyConfig.fixedLootItems) {
    lootItems.push({
      itemId: loot.itemId,
      count: loot.count * actualAmount,
    })
  }

  const chestPoints: { chestId: string; points: number }[] = []
  for (const cp of enemyConfig.fixedChestPoints) {
    chestPoints.push({
      chestId: cp.chestId,
      points: cp.points * actualAmount,
    })
  }

  return {
    canWin: true,
    perBattleSummary,
    aggregatedResult: {
      durationSeconds: totalDurationSeconds,
      xpGains: totalXpGains,
      lootItems,
      chestPoints,
    },
    representativeBattleLog: firstBattle.log,
  }
}

/**
 * 从 combat store 的数据构建 PlayerCombatStats
 *
 * 这是一个辅助函数，用于将 store 中的响应式数据转换为模拟器需要的输入格式
 */
export function buildPlayerStatsFromStore(combatStore: {
  maxHp: number
  maxMp: number
  currentDamage: number
  currentAttackIntervalSeconds: number
  currentAttackType: AttackType
  physicalDamageTakenPercent: number
}): PlayerCombatStats {
  return {
    maxHp: combatStore.maxHp,
    maxMp: combatStore.maxMp,
    attack: combatStore.currentDamage,
    attackIntervalSeconds: combatStore.currentAttackIntervalSeconds,
    attackType: combatStore.currentAttackType,
    physicalDamageTakenPercent: combatStore.physicalDamageTakenPercent,
  }
}
