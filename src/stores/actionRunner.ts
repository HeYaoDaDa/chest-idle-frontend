import { defineStore } from 'pinia'

import { enemyConfigMap } from '@/gameConfig'
import i18n from '@/i18n'
import { isInfiniteAmount, toFiniteForCompute, fromComputeResult } from '@/utils/amount'
import { toFixed, fromFixed, fpMul, fpDiv, fpLt, fpFloor } from '@/utils/fixedPoint'
import log from '@/utils/log'

import { useActionQueueStore } from './actionQueue'
import { useChestPointStore } from './chestPoint'
import { useCombatStore } from './combat'
import { useConsumableStore } from './consumable'
import { useInventoryStore } from './inventory'
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

    // 更新进度条
    if (actionQueueStore.actionStartDate && actionQueueStore.currentAction) {
      const elapsed = toFixed(performance.now() - actionQueueStore.actionStartDate)

      if (actionQueueStore.isCombatAction) {
        // 战斗行动使用 combatDuration
        const duration = actionQueueStore.currentAction.combatDuration || 0
        actionQueueStore.progress =
          Math.min(duration > 0 ? fromFixed(fpDiv(elapsed, toFixed(duration))) : 0, 1) * 100
      } else if (actionQueueStore.currentActionDetail) {
        // 生产行动使用 action.duration
        const duration = actionQueueStore.currentActionDetail.duration
        actionQueueStore.progress =
          Math.min(duration > 0 ? fromFixed(fpDiv(elapsed, duration)) : 0, 1) * 100
      } else {
        actionQueueStore.progress = 0
      }
    } else {
      actionQueueStore.progress = 0
    }
    requestAnimationFrame(update)
  }

  /**
   * 处理战斗行动的更新
   */
  function updateCombatAction(elapsed: number): number {
    if (!actionQueueStore.actionStartDate || !actionQueueStore.currentAction) return 0

    const actionItem = actionQueueStore.currentAction
    const duration = actionItem.combatDuration || 0

    // 更新攻击冷却进度和HP
    if (combatStore.currentBattle) {
      const battle = combatStore.currentBattle
      const currentTime = performance.now()
      const battleElapsed = currentTime - battle.startTime

      // 玩家攻击进度
      const playerInterval = combatStore.currentAttackInterval
      const playerProgress = (battleElapsed % playerInterval) / playerInterval
      battle.playerAttackProgress = Math.min(playerProgress, 1)

      // 敌人攻击进度
      const enemy = enemyConfigMap[battle.enemyId]
      if (enemy) {
        const enemyInterval = enemy.attackInterval
        const enemyProgress = (battleElapsed % enemyInterval) / enemyInterval
        battle.enemyAttackProgress = Math.min(enemyProgress, 1)
      }

      // 根据战斗事件流更新HP
      const events = battle.representativeLog
      let lastPlayerHp = combatStore.maxHp
      let lastEnemyHp = enemy?.hp || 0

      for (const event of events) {
        if (event.time > battleElapsed) break

        if (event.actorSide === 'player') {
          // 玩家攻击敌人
          lastEnemyHp = event.targetHpAfter
        } else {
          // 敌人攻击玩家
          lastPlayerHp = event.targetHpAfter
        }
      }

      battle.playerCurrentHp = lastPlayerHp
      battle.enemyCurrentHp = lastEnemyHp
    }

    if (elapsed < duration) {
      // 战斗未完成
      return 0
    }

    // 战斗完成，调用 combatStore 完成战斗并获取奖励
    const battleRewards = combatStore.completeBattle()

    // 结算战斗奖励
    if (battleRewards) {
      // 添加战斗技能经验
      const xpGains = battleRewards.xpGains
      if (xpGains.melee > 0) skillStore.addSkillXpRaw('melee', xpGains.melee)
      if (xpGains.ranged > 0) skillStore.addSkillXpRaw('ranged', xpGains.ranged)
      if (xpGains.magic > 0) skillStore.addSkillXpRaw('magic', xpGains.magic)
      if (xpGains.defense > 0) skillStore.addSkillXpRaw('defense', xpGains.defense)
      if (xpGains.stamina > 0) skillStore.addSkillXpRaw('stamina', xpGains.stamina)
      if (xpGains.intelligence > 0) skillStore.addSkillXpRaw('intelligence', xpGains.intelligence)

      // 添加掉落物品到背包
      if (battleRewards.lootItems.length > 0) {
        const itemsToAdd: [string, number][] = battleRewards.lootItems.map((loot) => [
          loot.itemId,
          loot.count,
        ])
        inventoryStore.addManyItems(itemsToAdd)
      }

      // 添加宝箱点数
      for (const cp of battleRewards.chestPoints) {
        const chestCount = chestPointStore.addChestPoints(cp.chestId, toFixed(cp.points))
        if (chestCount > 0) {
          inventoryStore.addItem(cp.chestId, chestCount)
        }
      }
    }

    // 计算实际消耗的时间
    const computedElapsedTime = duration
    const remainedElapsed = elapsed - computedElapsedTime

    // 完成当前行动（减少计数）
    actionQueueStore.completeCurrentAction(computedElapsedTime, 1)

    // 如果还有剩余战斗次数，刷新战斗属性并继续下一场
    if (actionQueueStore.currentAction && actionQueueStore.isCombatAction) {
      // 重新模拟以获取最新的玩家属性
      const newDuration = combatStore.refreshBattleStats()
      if (newDuration !== null) {
        // 更新队列中的战斗时长
        actionQueueStore.currentAction.combatDuration = newDuration
      } else {
        // 无法继续战斗，清除战斗状态并移除队列
        combatStore.clearBattle()
        actionQueueStore.removeAction(0)
      }
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

    const elapsedFixed = toFixed(elapsed)

    if (fpLt(elapsedFixed, action.duration)) {
      return 0
    } else {
      let computedAmount = toFiniteForCompute(amount)

      // 计算基于时间可以执行的次数
      const timeBasedAmount = Math.floor(fromFixed(fpFloor(fpDiv(elapsedFixed, action.duration))))
      computedAmount = Math.min(computedAmount, timeBasedAmount)

      let xpBasedAmount = Infinity
      if (skill) {
        xpBasedAmount = Math.ceil(fromFixed(fpDiv(skill.remainingXpForUpgrade, action.xp)))
        computedAmount = Math.min(computedAmount, xpBasedAmount)
      }

      // 用消耗品限制行动次数
      const buffBasedAmount = consumableStore.estimateBuffedCounts(action.skillId, action.duration)
      computedAmount = Math.min(computedAmount, buffBasedAmount)

      // 确保是正整数
      computedAmount = Math.max(0, Math.floor(computedAmount))

      // 如果计算出的次数为 0，说明无法执行，移除当前行动
      if (computedAmount === 0) {
        actionQueueStore.removeAction(0)
        return 0
      }

      computeAction(action, computedAmount)

      const computedElapsedTime = fromFixed(fpMul(action.duration, toFixed(computedAmount)))

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

    // 收集消耗品消耗
    const consumableItems = consumableStore.consumeBuffs(
      action.skillId,
      fpMul(action.duration, toFixed(computedAmount)),
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
    for (const product of action.products) {
      rewards.push([product.itemId, product.count * computedAmount])
    }

    if (chestCount > 0) {
      rewards.push([action.chestId, chestCount])
    }

    if (rewards.length > 0) {
      inventoryStore.addManyItems(rewards)
    }
  }

  function checkCurrentActionItem(): boolean {
    if (!actionQueueStore.currentAction || !actionQueueStore.currentActionDetail) return false

    const action = actionQueueStore.currentActionDetail
    const amount = actionQueueStore.currentAction.amount

    const currentLevel = skillStore.getSkillLevel(action.skillId)
    if (currentLevel < action.minLevel) {
      log.warn(`Required level ${action.minLevel} for action ${action.id}, but current level is ${currentLevel}`, {
        actionId: action.id,
        requiredLevel: action.minLevel,
        currentLevel,
      })
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
