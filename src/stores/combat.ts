import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { enemyConfigMap } from '@/gameConfig'
import {
  simulateBattles,
  buildPlayerStatsFromStore,
  type CombatEvent,
  type CombatXpGains,
  type BatchBattleResult,
} from '@/utils/combatSimulator'

import { useSkillStore } from './skill'

/**
 * 攻击类型
 */
export type AttackType = 'melee' | 'ranged' | 'magic'

/**
 * 当前战斗状态
 */
export interface CurrentBattle {
  /** 敌人 ID */
  enemyId: string
  /** 总战斗次数 */
  totalAmount: number
  /** 已完成的战斗次数 */
  completedAmount: number
  /** 单场战斗时长（毫秒） */
  singleBattleDuration: number
  /** 代表性战斗的事件流 */
  representativeLog: CombatEvent[]
  /** 战斗开始时间（performance.now()） */
  startTime: number
  /** 单场经验增益 */
  singleXpGains: CombatXpGains
  /** 单场掉落物品 */
  singleLootItems: { itemId: string; count: number }[]
  /** 单场宝箱点数 */
  singleChestPoints: { chestId: string; points: number }[]
  /** 玩家攻击冷却进度（0-1） */
  playerAttackProgress: number
  /** 敌人攻击冷却进度（0-1） */
  enemyAttackProgress: number
  /** 玩家当前HP */
  playerCurrentHp: number
  /** 敌人当前HP */
  enemyCurrentHp: number
}

/**
 * 战斗常量
 */
const BASE_INTERVAL = 3000 // 基础攻击间隔 (ms)
const BASE_HP_MULTIPLIER = 10 // HP 乘数
const BASE_HP_CONSTANT = 10 // HP 常数
const BASE_MP_MULTIPLIER = 10 // MP 乘数
const BASE_MP_CONSTANT = 10 // MP 常数
const ARMOR_COEFFICIENT = 0.2 // 护甲系数

/**
 * 玩家战斗属性 Store
 *
 * 基于技能等级计算玩家的战斗属性：
 * - 基础属性：AtkMelee, AtkRanged, AtkMagic, Def, Sta, Int
 * - 衍生属性：MaxHP, MaxMP, AttackInterval, Armor, DamageReduction
 */
export const useCombatStore = defineStore('combat', () => {
  const skillStore = useSkillStore()

  // ==================== 基础属性（来自技能等级，1:1 映射） ====================

  /** 近战攻击力 = 近战技能等级 */
  const atkMelee = computed(() => skillStore.getSkillLevel('melee'))

  /** 远程攻击力 = 远程技能等级 */
  const atkRanged = computed(() => skillStore.getSkillLevel('ranged'))

  /** 魔法攻击力 = 魔法技能等级 */
  const atkMagic = computed(() => skillStore.getSkillLevel('magic'))

  /** 防御力 = 防御技能等级 */
  const defense = computed(() => skillStore.getSkillLevel('defense'))

  /** 耐力 = 耐力技能等级 */
  const stamina = computed(() => skillStore.getSkillLevel('stamina'))

  /** 智力 = 智力技能等级 */
  const intelligence = computed(() => skillStore.getSkillLevel('intelligence'))

  // ==================== 衍生属性 ====================

  /**
   * 最大生命值
   * 公式：MaxHP = 10 * (10 + Sta)
   */
  const maxHp = computed(() => BASE_HP_MULTIPLIER * (BASE_HP_CONSTANT + stamina.value))

  /**
   * 最大法力值
   * 公式：MaxMP = 10 * (10 + Int)
   */
  const maxMp = computed(() => BASE_MP_MULTIPLIER * (BASE_MP_CONSTANT + intelligence.value))

  /**
   * 护甲值
   * 公式：Armor = 0.2 * Def + ArmorBonus
   * v1 暂不考虑 ArmorBonus
   */
  const armor = computed(() => ARMOR_COEFFICIENT * defense.value)

  /**
   * 物理伤害减免百分比
   * 若 Armor >= 0：PhysicalDamageTaken% = 100 / (100 + Armor)
   * 若 Armor < 0：PhysicalDamageTaken% = (100 - Armor) / 100
   * 返回值为 0-1 之间的小数，表示实际受到的伤害比例
   */
  const physicalDamageTakenPercent = computed(() => {
    if (armor.value >= 0) {
      return 100 / (100 + armor.value)
    } else {
      return (100 - armor.value) / 100
    }
  })

  /**
   * 获取指定攻击类型对应的攻击力
   */
  function getAttackByType(type: AttackType): number {
    switch (type) {
      case 'melee':
        return atkMelee.value
      case 'ranged':
        return atkRanged.value
      case 'magic':
        return atkMagic.value
    }
  }

  /**
   * 计算攻击间隔
   * 公式：AttackInterval = BaseInterval / (1 + (Attack / 2000)) / (1 + AttackSpeedBonus)
   * v1 暂不考虑 AttackSpeedBonus
   *
   * @param attackType 攻击类型（决定使用哪个攻击属性）
   * @returns 攻击间隔（毫秒）
   */
  function getAttackInterval(attackType: AttackType): number {
    const attack = getAttackByType(attackType)
    return Math.floor(BASE_INTERVAL / (1 + attack / 2000))
  }

  /**
   * 计算玩家造成的伤害
   * 公式：Damage = (10 + SourceStat) * (1 + DamageBonus%)
   * v1 暂不考虑 DamageBonus%
   *
   * @param attackType 攻击类型
   * @returns 原始伤害值
   */
  function calculateDamage(attackType: AttackType): number {
    const sourceStat = getAttackByType(attackType)
    return 10 + sourceStat
  }

  /**
   * 计算受到的实际伤害（考虑护甲减免）
   *
   * @param rawDamage 原始伤害
   * @returns 实际受到的伤害
   */
  function calculateDamageTaken(rawDamage: number): number {
    return Math.floor(rawDamage * physicalDamageTakenPercent.value)
  }

  /**
   * 获取当前攻击类型
   * v1：未装备武器时默认为近战
   * TODO: 后续需要从装备 store 获取当前武器类型
   */
  const currentAttackType = computed<AttackType>(() => {
    // v1: 默认近战，后续从装备 store 读取
    return 'melee'
  })

  /**
   * 当前攻击力（基于当前装备的武器类型）
   */
  const currentAttack = computed(() => getAttackByType(currentAttackType.value))

  /**
   * 当前攻击间隔（基于当前装备的武器类型）
   */
  const currentAttackInterval = computed(() => getAttackInterval(currentAttackType.value))

  /**
   * 当前伤害输出（基于当前装备的武器类型）
   */
  const currentDamage = computed(() => calculateDamage(currentAttackType.value))

  // ==================== 战斗状态管理 ====================

  /** 当前战斗状态 */
  const currentBattle = ref<CurrentBattle | null>(null)

  /** 最近一次战斗的结果缓存 */
  const lastBattleResult = ref<BatchBattleResult | null>(null)

  /**
   * 获取当前玩家的战斗属性（用于模拟器）
   */
  function getPlayerStats() {
    return buildPlayerStatsFromStore({
      maxHp: maxHp.value,
      maxMp: maxMp.value,
      currentDamage: currentDamage.value,
      currentAttackInterval: currentAttackInterval.value,
      currentAttackType: currentAttackType.value,
      physicalDamageTakenPercent: physicalDamageTakenPercent.value,
    })
  }

  /**
   * 预览战斗（仅模拟，不修改战斗状态）
   *
   * 用于在添加到队列前预估战斗结果，不会创建 currentBattle
   *
   * @param enemyId 敌人 ID
   * @param amount 战斗次数
   * @returns 战斗模拟结果，如果敌人不存在返回 null
   */
  function previewBattle(enemyId: string, amount: number): BatchBattleResult | null {
    const enemyConfig = enemyConfigMap[enemyId]
    if (!enemyConfig) {
      console.error(`Enemy not found: ${enemyId}`)
      return null
    }

    // 获取玩家属性并进行模拟
    const playerStats = getPlayerStats()
    return simulateBattles(playerStats, enemyConfig, amount)
  }

  /**
   * 开始战斗
   *
   * @param enemyId 敌人 ID
   * @param amount 战斗次数
   * @returns 战斗模拟结果，如果无法获胜返回 null
   */
  function startBattle(enemyId: string, amount: number): BatchBattleResult | null {
    const enemyConfig = enemyConfigMap[enemyId]
    if (!enemyConfig) {
      console.error(`Enemy not found: ${enemyId}`)
      return null
    }

    // 获取玩家属性并进行模拟
    const playerStats = getPlayerStats()
    const result = simulateBattles(playerStats, enemyConfig, amount)

    // 保存模拟结果
    lastBattleResult.value = result

    if (!result.canWin) {
      // 打不过，不创建战斗状态
      return result
    }

    // 计算单场的掉落（用于 UI 显示）
    const singleLootItems = enemyConfig.fixedLootItems.map((loot) => ({
      itemId: loot.itemId,
      count: loot.count,
    }))
    const singleChestPoints = enemyConfig.fixedChestPoints.map((cp) => ({
      chestId: cp.chestId,
      points: cp.points,
    }))

    // 创建战斗状态
    currentBattle.value = {
      enemyId,
      totalAmount: amount,
      completedAmount: 0,
      singleBattleDuration: result.perBattleSummary[0]?.duration ?? 0,
      representativeLog: result.representativeBattleLog,
      startTime: performance.now(),
      singleXpGains: result.perBattleSummary[0]?.xpGains ?? {
        melee: 0,
        ranged: 0,
        magic: 0,
        defense: 0,
        stamina: 0,
        intelligence: 0,
      },
      singleLootItems,
      singleChestPoints,
      playerAttackProgress: 0,
      enemyAttackProgress: 0,
      playerCurrentHp: maxHp.value,
      enemyCurrentHp: enemyConfig.hp,
    }

    return result
  }

  /**
   * 完成一场战斗（由 actionRunner 调用）
   *
   * @returns 完成的战斗的经验和掉落信息
   */
  function completeBattle(): {
    xpGains: CombatXpGains
    lootItems: { itemId: string; count: number }[]
    chestPoints: { chestId: string; points: number }[]
  } | null {
    if (!currentBattle.value) return null

    const battle = currentBattle.value
    battle.completedAmount += 1

    // 返回本场战斗的奖励
    return {
      xpGains: { ...battle.singleXpGains },
      lootItems: [...battle.singleLootItems],
      chestPoints: [...battle.singleChestPoints],
    }
  }

  /**
   * 重置当前战斗的开始时间（用于开始下一场战斗）
   */
  function resetBattleStartTime(): void {
    if (currentBattle.value) {
      currentBattle.value.startTime = performance.now()
      // 重置HP到满血状态
      currentBattle.value.playerCurrentHp = maxHp.value
      const enemyConfig = enemyConfigMap[currentBattle.value.enemyId]
      if (enemyConfig) {
        currentBattle.value.enemyCurrentHp = enemyConfig.hp
      }
    }
  }

  /**
   * 取消当前战斗（不结算奖励）
   */
  function cancelBattle(): void {
    currentBattle.value = null
    lastBattleResult.value = null
  }

  /**
   * 清除战斗状态（战斗完成后调用）
   */
  function clearBattle(): void {
    currentBattle.value = null
    lastBattleResult.value = null
  }

  /**
   * 刷新战斗属性并重新模拟（用于继续下一场战斗）
   *
   * 当玩家属性发生变化时（如升级），需要重新模拟以获取新的战斗时长
   *
   * @returns 新的单场战斗时长，如果无法继续战斗返回 null
   */
  function refreshBattleStats(): number | null {
    if (!currentBattle.value) return null

    const enemyConfig = enemyConfigMap[currentBattle.value.enemyId]
    if (!enemyConfig) return null

    // 使用当前玩家属性重新模拟一场战斗
    const playerStats = getPlayerStats()
    const result = simulateBattles(playerStats, enemyConfig, 1)

    if (!result.canWin) {
      // 玩家属性变化导致无法继续获胜
      return null
    }

    // 更新战斗状态
    const newDuration = result.perBattleSummary[0]?.duration ?? 0
    currentBattle.value.singleBattleDuration = newDuration
    currentBattle.value.representativeLog = result.representativeBattleLog
    currentBattle.value.startTime = performance.now()
    currentBattle.value.singleXpGains = result.perBattleSummary[0]?.xpGains ?? {
      melee: 0,
      ranged: 0,
      magic: 0,
      defense: 0,
      stamina: 0,
      intelligence: 0,
    }
    // 重置HP到满血状态
    currentBattle.value.playerCurrentHp = maxHp.value
    currentBattle.value.enemyCurrentHp = enemyConfig.hp

    return newDuration
  }

  /**
   * 检查当前战斗是否已全部完成
   */
  function isBattleComplete(): boolean {
    if (!currentBattle.value) return true
    // -1 表示无限战斗
    if (currentBattle.value.totalAmount === -1) return false
    return currentBattle.value.completedAmount >= currentBattle.value.totalAmount
  }

  return {
    // 基础属性
    atkMelee,
    atkRanged,
    atkMagic,
    defense,
    stamina,
    intelligence,

    // 衍生属性
    maxHp,
    maxMp,
    armor,
    physicalDamageTakenPercent,

    // 当前状态
    currentAttackType,
    currentAttack,
    currentAttackInterval,
    currentDamage,

    // 战斗状态
    currentBattle,
    lastBattleResult,

    // 方法
    getAttackByType,
    getAttackInterval,
    calculateDamage,
    calculateDamageTaken,
    getPlayerStats,
    previewBattle,
    startBattle,
    completeBattle,
    resetBattleStartTime,
    cancelBattle,
    clearBattle,
    refreshBattleStats,
    isBattleComplete,
  }
})
