import { enemyConfigMap, itemConfigMap, skillConfigs } from '@/gameConfig'
import i18n from '@/i18n'
import { toFiniteForCompute } from '@/utils/amount'
import { toFixed, type Seconds } from '@/utils/fixedPoint'

import type { useActionQueueStore } from '../actionQueue'
import type { useChestPointStore } from '../chestPoint'
import type { useCombatStore } from '../combat'
import type { useInventoryStore } from '../inventory'
import type { useLootNotificationStore } from '../lootNotification'
import type { useNotificationStore } from '../notification'
import type { useSkillStore } from '../skill'

/**
 * 奖励包类型
 */
interface RewardBundle {
  xpGains: Record<string, number>
  lootItems: Map<string, number>
  chestPoints: Map<string, number>
}

/**
 * 战斗行动执行器
 *
 * 负责：
 * 1. 战斗行动更新（批量优化）
 * 2. 冷却状态处理
 * 3. 战斗 UI 更新（HP、攻击进度）
 * 4. 批量聚合和发放奖励
 */
export class CombatExecutor {
  constructor(
    private actionQueueStore: ReturnType<typeof useActionQueueStore>,
    private skillStore: ReturnType<typeof useSkillStore>,
    private inventoryStore: ReturnType<typeof useInventoryStore>,
    private combatStore: ReturnType<typeof useCombatStore>,
    private chestPointStore: ReturnType<typeof useChestPointStore>,
    private notificationStore: ReturnType<typeof useNotificationStore>,
    private lootNotificationStore: ReturnType<typeof useLootNotificationStore>,
  ) {}

  /**
   * 更新战斗行动（批量优化版本）
   * @param elapsed 已过去的时间（毫秒）
   * @returns 剩余未消耗的时间（毫秒）
   */
  update(elapsed: number): number {
    if (!this.actionQueueStore.actionStartDate || !this.actionQueueStore.currentAction) {
      return 0
    }

    const actionItem = this.actionQueueStore.currentAction
    const durationSeconds: Seconds = actionItem.combatDurationSeconds ?? 0

    // 处理冷却状态（提前返回）
    if (this.handleCooldownState()) {
      this.updateBattleUI()
      return 0
    }

    const elapsedSeconds = elapsed / 1000

    // 检查是否完成至少一场战斗
    if (elapsedSeconds < durationSeconds) {
      // 未完成一场，只更新 UI
      this.updateBattleUI()
      return 0
    }

    // 计算批量处理的战斗场次
    let computedBattleCount = toFiniteForCompute(actionItem.amount)

    // 限制1：基于时间能完成多少场
    const timeBasedAmount = Math.floor(elapsedSeconds / durationSeconds)
    computedBattleCount = Math.min(computedBattleCount, timeBasedAmount)

    // 限制2：基于技能升级（动态获取所有战斗技能）
    if (this.combatStore.currentBattle) {
      const battle = this.combatStore.currentBattle
      const singleXpGains = battle.singleXpGains

      // 从 config 动态获取所有战斗技能
      const combatSkills = skillConfigs.filter((skill) => skill.skillType === 'combat')
      const xpLimits = combatSkills
        .map((skill) => {
          const xpPerBattle = (singleXpGains as Record<string, number>)[skill.id] || 0
          return this.calcBattlesUntilUpgrade(skill.id, xpPerBattle)
        })
        .filter((n) => n !== Infinity)

      if (xpLimits.length > 0) {
        const minXpLimit = Math.min(...xpLimits)
        computedBattleCount = Math.min(computedBattleCount, minXpLimit)
      }
    }

    // 确保至少处理1场战斗
    computedBattleCount = Math.max(1, Math.floor(computedBattleCount))

    // 批量聚合奖励
    const aggregatedRewards = this.aggregateBattleRewards(computedBattleCount)

    // 统一发放奖励
    this.distributeRewards(aggregatedRewards)

    // 计算实际消耗的时间（毫秒）
    const computedElapsedTime = durationSeconds * computedBattleCount * 1000
    const remainedElapsed = elapsed - computedElapsedTime

    // 完成当前行动（批量减少计数）
    this.actionQueueStore.completeCurrentAction(computedElapsedTime, computedBattleCount)

    // 如果还有剩余战斗次数，进入冷却状态
    if (this.actionQueueStore.currentAction && this.actionQueueStore.isCombatAction) {
      this.combatStore.startCooldown()
    } else {
      // 所有战斗完成，清除战斗状态
      this.combatStore.clearBattle()
    }

    return remainedElapsed
  }

  /**
   * 更新战斗 UI（HP、攻击进度条）
   */
  updateBattleUI(): void {
    if (!this.combatStore.currentBattle) return

    const battle = this.combatStore.currentBattle
    // 冷却期间强制归零
    if (battle.state === 'cooldown') {
      battle.enemyCurrentHp = 0
      battle.playerAttackProgress = 0
      battle.enemyAttackProgress = 0
      return
    }

    const currentTime = performance.now()
    const battleElapsedSeconds = (currentTime - battle.startTime) / 1000
    const enemy = enemyConfigMap[battle.enemyId]

    const calcAttackProgress = (
      lastAttackTime: number,
      nextAttackTime: number | null,
      intervalSeconds: number,
    ): number => {
      const targetTime = nextAttackTime ?? lastAttackTime + intervalSeconds
      if (targetTime <= lastAttackTime) return 1

      const elapsedSinceLast = battleElapsedSeconds - lastAttackTime
      if (elapsedSinceLast <= 0) return 0

      const interval = targetTime - lastAttackTime
      return Math.min(1, Math.max(0, elapsedSinceLast / interval))
    }

    // 使用二分查找找到最后发生的事件
    const events = battle.representativeLog
    const lastEventIndex = this.findLastOccurredEventIndex(events, battleElapsedSeconds)

    let lastPlayerHp = this.combatStore.maxHp
    let lastEnemyHp = enemy?.hp || 0
    let lastPlayerAttackTime = 0
    let nextPlayerAttackTime: number | null = null
    let lastEnemyAttackTime = 0
    let nextEnemyAttackTime: number | null = null

    // 遍历已发生的事件
    for (let i = 0; i <= lastEventIndex; i++) {
      const event = events[i]
      if (event.actorSide === 'player') {
        lastEnemyHp = event.targetHpAfter
        lastPlayerAttackTime = event.timeSeconds
      } else {
        lastPlayerHp = event.targetHpAfter
        lastEnemyAttackTime = event.timeSeconds
      }
    }

    // 找下一个事件
    for (let i = lastEventIndex + 1; i < events.length; i++) {
      const event = events[i]
      if (event.actorSide === 'player' && nextPlayerAttackTime === null) {
        nextPlayerAttackTime = event.timeSeconds
      } else if (event.actorSide === 'enemy' && nextEnemyAttackTime === null) {
        nextEnemyAttackTime = event.timeSeconds
      }

      if (nextPlayerAttackTime !== null && nextEnemyAttackTime !== null) {
        break
      }
    }

    const playerInterval = this.combatStore.currentAttackIntervalSeconds
    const enemyInterval = enemy?.attackIntervalSeconds ?? 2.0

    battle.playerAttackProgress = calcAttackProgress(
      lastPlayerAttackTime,
      nextPlayerAttackTime,
      playerInterval,
    )
    battle.enemyAttackProgress = calcAttackProgress(
      lastEnemyAttackTime,
      nextEnemyAttackTime,
      enemyInterval,
    )

    battle.playerCurrentHp = lastPlayerHp
    battle.enemyCurrentHp = lastEnemyHp
  }

  /**
   * 处理战斗冷却状态
   * @returns true 表示正在冷却中，false 表示不在冷却或已结束冷却
   */
  private handleCooldownState(): boolean {
    if (!this.combatStore.currentBattle || this.combatStore.currentBattle.state !== 'cooldown') {
      return false
    }

    const battle = this.combatStore.currentBattle
    const currentTime = performance.now()

    if (battle.cooldownEndTime && currentTime >= battle.cooldownEndTime) {
      // 冷却结束，开始下一场战斗
      const newDurationSeconds = this.combatStore.startNextRound()
      if (newDurationSeconds !== null) {
        // 更新队列中的战斗时长（秒）
        if (this.actionQueueStore.currentAction) {
          this.actionQueueStore.currentAction.combatDurationSeconds = newDurationSeconds
        }
      } else {
        // 无法继续战斗，统一停止当前行动
        this.actionQueueStore.stopCurrentAction()
      }
    }

    return true // 表示正在冷却中
  }

  /**
   * 批量聚合战斗奖励
   */
  private aggregateBattleRewards(count: number): RewardBundle {
    const aggregated: RewardBundle = {
      xpGains: {},
      lootItems: new Map(),
      chestPoints: new Map(),
    }

    for (let i = 0; i < count; i++) {
      const battleRewards = this.combatStore.completeBattle()
      if (!battleRewards) continue

      // 累加经验（动态处理所有技能）
      Object.entries(battleRewards.xpGains).forEach(([skillId, xp]) => {
        aggregated.xpGains[skillId] = (aggregated.xpGains[skillId] || 0) + xp
      })

      // 累加掉落物品
      for (const item of battleRewards.lootItems) {
        aggregated.lootItems.set(
          item.itemId,
          (aggregated.lootItems.get(item.itemId) || 0) + item.count,
        )
      }

      // 累加宝箱点数
      for (const cp of battleRewards.chestPoints) {
        aggregated.chestPoints.set(
          cp.chestId,
          (aggregated.chestPoints.get(cp.chestId) || 0) + cp.points,
        )
      }
    }

    return aggregated
  }

  /**
   * 统一发放奖励（经验、掉落、宝箱点数）
   */
  private distributeRewards(rewards: RewardBundle): void {
    // 发放经验
    Object.entries(rewards.xpGains).forEach(([skillId, xp]) => {
      if (xp > 0) {
        this.skillStore.addSkillXpRaw(skillId, xp)
      }
    })

    const lootNotifications: { itemId: string; count: number }[] = []

    // 添加掉落物品到背包
    if (rewards.lootItems.size > 0) {
      const itemsToAdd: [string, number][] = Array.from(rewards.lootItems.entries())
      this.inventoryStore.addManyItems(itemsToAdd)
      lootNotifications.push(
        ...Array.from(rewards.lootItems.entries()).map(([itemId, count]) => ({ itemId, count })),
      )
    }

    // 添加宝箱点数
    for (const [chestId, points] of rewards.chestPoints.entries()) {
      const chestCount = this.chestPointStore.addChestPoints(chestId, toFixed(points))
      if (chestCount > 0) {
        this.inventoryStore.addItem(chestId, chestCount)
        lootNotifications.push({ itemId: chestId, count: chestCount })
        // 添加宝箱获得通知
        const chestConfig = itemConfigMap[chestId]
        this.notificationStore.info('notification.chestObtained', {
          count: chestCount,
          chest: chestConfig ? i18n.global.t(chestConfig.name) : chestId,
        })
      }
    }

    if (lootNotifications.length > 0) {
      this.lootNotificationStore.addNotification(lootNotifications)
    }
  }

  /**
   * 计算到技能升级还需要多少场战斗
   */
  private calcBattlesUntilUpgrade(skillId: string, xpPerBattle: number): number {
    if (xpPerBattle <= 0) return Infinity
    const skill = this.skillStore.getSkill(skillId)
    if (!skill || skill.remainingXpForUpgrade <= 0) return Infinity
    return Math.ceil(skill.remainingXpForUpgrade / xpPerBattle)
  }

  /**
   * 使用二分查找找到最后一个已发生的事件索引
   */
  private findLastOccurredEventIndex(
    events: Array<{ timeSeconds: number }>,
    elapsedSeconds: number,
  ): number {
    if (events.length === 0) return -1

    let left = 0
    let right = events.length - 1
    let lastOccurredIndex = -1

    while (left <= right) {
      const mid = Math.floor((left + right) / 2)
      if (events[mid].timeSeconds <= elapsedSeconds) {
        lastOccurredIndex = mid
        left = mid + 1
      } else {
        right = mid - 1
      }
    }

    return lastOccurredIndex
  }
}
