import { defineStore } from 'pinia'

import { enemyConfigMap, itemConfigMap, skillConfigs } from '@/gameConfig'
import i18n from '@/i18n'
import { isInfiniteAmount, toFiniteForCompute, fromComputeResult } from '@/utils/amount'
import {
  toFixed,
  fromFixed,
  fpMul,
  fpDiv,
  fpLt,
  fpFloor,
  fromSecondsFixed,
  toSecondsFixed,
  type Seconds,
  type SecondsFixed,
} from '@/utils/fixedPoint'
import log from '@/utils/log'

import { useActionQueueStore } from './actionQueue'
import { useChestPointStore } from './chestPoint'
import { useCombatStore } from './combat'
import { useConsumableStore } from './consumable'
import { useInventoryStore } from './inventory'
import { useLootNotificationStore } from './lootNotification'
import { useNotificationStore } from './notification'
import { useSkillStore } from './skill'

import type { Action } from './action'

export const useActionRunnerStore = defineStore('actionRunner', () => {
  const skillStore = useSkillStore()
  const inventoryStore = useInventoryStore()
  const actionQueueStore = useActionQueueStore()
  const notificationStore = useNotificationStore()
  const chestPointStore = useChestPointStore()
  const consumableStore = useConsumableStore()
  const combatStore = useCombatStore()
  const lootNotificationStore = useLootNotificationStore()

  let isRunning = false

  function start(): void {
    // 幂等保护：已启动则直接返回
    if (isRunning) {
      return
    }
    isRunning = true
    requestAnimationFrame(update)
  }

  function update(): void {
    if (actionQueueStore.actionStartDate) {
      const now = performance.now()
      let remainedElapsed = now - actionQueueStore.actionStartDate
      while (actionQueueStore.currentAction && remainedElapsed > 0) {
        if (actionQueueStore.isCombatAction) {
          remainedElapsed = updateCombatAction(remainedElapsed)
        } else {
          remainedElapsed = updateCurrentAction(remainedElapsed)
        }
      }
    }

    requestAnimationFrame(update)
  }

  /**
   * 使用二分查找找到最后一个已发生的事件索引
   */
  function findLastOccurredEventIndex(
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

  /**
   * 更新战斗 UI（HP、攻击进度条）
   */
  function updateBattleUI(): void {
    if (!combatStore.currentBattle) return

    const battle = combatStore.currentBattle
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
    const lastEventIndex = findLastOccurredEventIndex(events, battleElapsedSeconds)

    let lastPlayerHp = combatStore.maxHp
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

    const playerInterval = combatStore.currentAttackIntervalSeconds
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
   * 奖励包类型
   */
  interface RewardBundle {
    xpGains: Record<string, number>
    lootItems: Map<string, number>
    chestPoints: Map<string, number>
  }

  /**
   * 处理战斗冷却状态
   * @returns true 表示正在冷却中，false 表示不在冷却或已结束冷却
   */
  function handleCooldownState(): boolean {
    if (!combatStore.currentBattle || combatStore.currentBattle.state !== 'cooldown') {
      return false
    }

    const battle = combatStore.currentBattle
    const currentTime = performance.now()

    if (battle.cooldownEndTime && currentTime >= battle.cooldownEndTime) {
      // 冷却结束，开始下一场战斗
      const newDurationSeconds = combatStore.startNextRound()
      if (newDurationSeconds !== null) {
        // 更新队列中的战斗时长（秒）
        if (actionQueueStore.currentAction) {
          actionQueueStore.currentAction.combatDurationSeconds = newDurationSeconds
        }
      } else {
        // 无法继续战斗，统一停止当前行动
        actionQueueStore.stopCurrentAction()
      }
    }

    return true // 表示正在冷却中
  }

  /**
   * 批量聚合战斗奖励
   */
  function aggregateBattleRewards(count: number): RewardBundle {
    const aggregated: RewardBundle = {
      xpGains: {},
      lootItems: new Map(),
      chestPoints: new Map(),
    }

    for (let i = 0; i < count; i++) {
      const battleRewards = combatStore.completeBattle()
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
  function distributeRewards(rewards: RewardBundle): void {
    // 发放经验
    Object.entries(rewards.xpGains).forEach(([skillId, xp]) => {
      if (xp > 0) {
        skillStore.addSkillXpRaw(skillId, xp)
      }
    })

    const lootNotifications: { itemId: string; count: number }[] = []

    // 添加掉落物品到背包
    if (rewards.lootItems.size > 0) {
      const itemsToAdd: [string, number][] = Array.from(rewards.lootItems.entries())
      inventoryStore.addManyItems(itemsToAdd)
      lootNotifications.push(
        ...Array.from(rewards.lootItems.entries()).map(([itemId, count]) => ({ itemId, count })),
      )
    }

    // 添加宝箱点数
    for (const [chestId, points] of rewards.chestPoints.entries()) {
      const chestCount = chestPointStore.addChestPoints(chestId, toFixed(points))
      if (chestCount > 0) {
        inventoryStore.addItem(chestId, chestCount)
        lootNotifications.push({ itemId: chestId, count: chestCount })
        // 添加宝箱获得通知
        const chestConfig = itemConfigMap[chestId]
        notificationStore.info('notification.chestObtained', {
          count: chestCount,
          chest: chestConfig ? i18n.global.t(chestConfig.name) : chestId,
        })
      }
    }

    if (lootNotifications.length > 0) {
      lootNotificationStore.addNotification(lootNotifications)
    }
  }

  /**
   * 计算到技能升级还需要多少场战斗
   */
  function calcBattlesUntilUpgrade(skillId: string, xpPerBattle: number): number {
    if (xpPerBattle <= 0) return Infinity
    const skill = skillStore.getSkill(skillId)
    if (!skill || skill.remainingXpForUpgrade <= 0) return Infinity
    return Math.ceil(skill.remainingXpForUpgrade / xpPerBattle)
  }

  /**
   * 处理战斗行动的更新（批量优化版本）
   */
  function updateCombatAction(elapsed: number): number {
    if (!actionQueueStore.actionStartDate || !actionQueueStore.currentAction) return 0

    const actionItem = actionQueueStore.currentAction
    const durationSeconds: Seconds = actionItem.combatDurationSeconds ?? 0

    // 处理冷却状态（提前返回）
    if (handleCooldownState()) {
      updateBattleUI()
      return 0
    }

    const elapsedSeconds = elapsed / 1000

    // 检查是否完成至少一场战斗
    if (elapsedSeconds < durationSeconds) {
      // 未完成一场，只更新 UI
      updateBattleUI()
      return 0
    }

    // 计算批量处理的战斗场次
    let computedBattleCount = toFiniteForCompute(actionItem.amount)

    // 限制1：基于时间能完成多少场
    const timeBasedAmount = Math.floor(elapsedSeconds / durationSeconds)
    computedBattleCount = Math.min(computedBattleCount, timeBasedAmount)

    // 限制2：基于技能升级（动态获取所有战斗技能）
    if (combatStore.currentBattle) {
      const battle = combatStore.currentBattle
      const singleXpGains = battle.singleXpGains

      // 从 config 动态获取所有战斗技能
      const combatSkills = skillConfigs.filter((skill) => skill.skillType === 'combat')
      const xpLimits = combatSkills
        .map((skill) => {
          const xpPerBattle = (singleXpGains as Record<string, number>)[skill.id] || 0
          return calcBattlesUntilUpgrade(skill.id, xpPerBattle)
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
    const aggregatedRewards = aggregateBattleRewards(computedBattleCount)

    // 统一发放奖励
    distributeRewards(aggregatedRewards)

    // 计算实际消耗的时间（毫秒）
    const computedElapsedTime = durationSeconds * computedBattleCount * 1000
    const remainedElapsed = elapsed - computedElapsedTime

    // 完成当前行动（批量减少计数）
    actionQueueStore.completeCurrentAction(computedElapsedTime, computedBattleCount)

    // 如果还有剩余战斗次数，进入冷却状态
    if (actionQueueStore.currentAction && actionQueueStore.isCombatAction) {
      combatStore.startCooldown()
    } else {
      // 所有战斗完成，清除战斗状态
      combatStore.clearBattle()
    }

    return remainedElapsed
  }

  function updateCurrentAction(elapsed: number): number {
    if (!actionQueueStore.actionStartDate || !actionQueueStore.currentActionDetail) return 0
    if (!checkCurrentActionItem()) return elapsed

    const amount = actionQueueStore.currentAction.amount
    const action = actionQueueStore.currentActionDetail
    const skill = skillStore.getSkill(action.skillId)

    const elapsedSeconds = elapsed / 1000
    const elapsedSecondsFixed: SecondsFixed = toSecondsFixed(elapsedSeconds)

    if (fpLt(elapsedSecondsFixed, action.durationSeconds)) {
      return 0
    } else {
      let computedAmount = toFiniteForCompute(amount)

      // 计算基于时间可以执行的次数
      const timeBasedAmount = Math.floor(
        fromFixed(fpFloor(fpDiv(elapsedSecondsFixed, action.durationSeconds))),
      )
      computedAmount = Math.min(computedAmount, timeBasedAmount)

      let xpBasedAmount = Infinity
      if (skill) {
        xpBasedAmount = Math.ceil(fromFixed(fpDiv(skill.remainingXpForUpgrade, action.xp)))
        computedAmount = Math.min(computedAmount, xpBasedAmount)
      }

      // 用消耗品限制行动次数
      const buffBasedAmount = consumableStore.estimateBuffedCounts(
        action.skillId,
        action.durationSeconds,
      )
      computedAmount = Math.min(computedAmount, buffBasedAmount)

      // 确保是正整数
      computedAmount = Math.max(0, Math.floor(computedAmount))

      // 如果计算出的次数为 0，说明无法执行，移除当前行动
      if (computedAmount === 0) {
        actionQueueStore.removeAction(0)
        return 0
      }

      computeAction(action, computedAmount)

      const computedElapsedSecondsFixed = fpMul(action.durationSeconds, toFixed(computedAmount))
      const computedElapsedTime = fromSecondsFixed(computedElapsedSecondsFixed) * 1000

      const remainedElapsed = elapsed - computedElapsedTime

      actionQueueStore.completeCurrentAction(computedElapsedTime, computedAmount)

      return remainedElapsed
    }
  }

  function computeAction(action: Action, computedAmount: number): void {
    const itemsToRemove: [string, number][] = []

    // 收集材料消耗
    if (action.ingredients) {
      for (const ingredient of action.ingredients) {
        itemsToRemove.push([ingredient.itemId, ingredient.count * computedAmount])
      }
    }

    // 收集消耗品消耗（使用秒为单位）
    const consumableItems = consumableStore.consumeBuffs(
      action.skillId,
      fpMul(action.durationSeconds, toFixed(computedAmount)),
    )
    itemsToRemove.push(...consumableItems)

    // 统一扣除库存
    if (itemsToRemove.length > 0) {
      inventoryStore.removeManyItems(itemsToRemove)
    }

    skillStore.addSkillXp(action.skillId, fpMul(action.xp, toFixed(computedAmount)))

    const chestCount = chestPointStore.addChestPoints(
      action.chestId,
      fpMul(action.chestPoints, toFixed(computedAmount)),
    )

    const rewards: [string, number][] = []
    const lootNotifications: { itemId: string; count: number }[] = []

    for (const product of action.products) {
      const count = product.count * computedAmount
      rewards.push([product.itemId, count])
      lootNotifications.push({ itemId: product.itemId, count })
    }

    if (chestCount > 0) {
      rewards.push([action.chestId, chestCount])
      lootNotifications.push({ itemId: action.chestId, count: chestCount })
      // 添加宝箱获得通知
      const chestConfig = itemConfigMap[action.chestId]
      notificationStore.info('notification.chestObtained', {
        count: chestCount,
        chest: chestConfig ? i18n.global.t(chestConfig.name) : action.chestId,
      })
    }

    if (rewards.length > 0) {
      inventoryStore.addManyItems(rewards)
      lootNotificationStore.addNotification(lootNotifications)
    }
  }

  function checkCurrentActionItem(): boolean {
    if (!actionQueueStore.currentAction || !actionQueueStore.currentActionDetail) return false

    const action = actionQueueStore.currentActionDetail
    const amount = actionQueueStore.currentAction.amount

    const currentLevel = skillStore.getSkillLevel(action.skillId)
    if (currentLevel < action.minLevel) {
      log.warn(
        `Required level ${action.minLevel} for action ${action.id}, but current level is ${currentLevel}`,
        {
          actionId: action.id,
          requiredLevel: action.minLevel,
          currentLevel,
        },
      )
      const skillConfig = skillStore.getSkill(action.skillId)
      notificationStore.warning('notification.levelTooLow', {
        skill: skillConfig ? i18n.global.t(skillConfig.name) : action.skillId,
        level: currentLevel,
        required: action.minLevel,
        action: i18n.global.t(action.name),
      })

      actionQueueStore.removeAction(0)
      return false
    }

    const actualAmount = computeAmount(action, amount)
    if (!isInfiniteAmount(actualAmount) && actualAmount <= 0) {
      notificationStore.warning('notification.notEnoughMaterials', {
        action: i18n.global.t(action.name),
      })

      actionQueueStore.removeAction(0)
      return false
    }
    actionQueueStore.currentAction.amount = actualAmount

    return true
  }

  function computeAmount(action: Action, amount: number): number {
    let maxAmount = Infinity

    if (action.ingredients) {
      for (const ingredient of action.ingredients) {
        const inventoryItemCount = inventoryStore.inventoryMap[ingredient.itemId]
        const availableCount = inventoryItemCount ? inventoryItemCount : 0
        const maxForThisIngredient = Math.floor(availableCount / ingredient.count)
        maxAmount = Math.min(maxAmount, maxForThisIngredient)
      }
    }

    const finiteAmount = toFiniteForCompute(amount)
    const computed = Math.min(finiteAmount, maxAmount)
    return fromComputeResult(computed)
  }

  return {
    start,
  }
})
