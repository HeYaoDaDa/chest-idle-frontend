import { defineStore } from 'pinia'

import i18n from '@/i18n'
import { isInfiniteAmount, toFiniteForCompute, fromComputeResult } from '@/utils/amount'
import { toFixed, fromFixed, fpMul, fpDiv, fpLt, fpFloor } from '@/utils/fixedPoint'

import { useActionQueueStore } from './actionQueue'
import { useChestPointStore } from './chestPoint'
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

  function start(): void {
    requestAnimationFrame(update)
  }

  function update(): void {
    if (actionQueueStore.actionStartDate) {
      const now = performance.now()
      let remainedElapsed = now - actionQueueStore.actionStartDate
      while (actionQueueStore.currentAction && remainedElapsed > 0) {
        remainedElapsed = updateCurrentAction(remainedElapsed)
      }
    }

    if (actionQueueStore.actionStartDate && actionQueueStore.currentActionDetail) {
      const elapsed = toFixed(performance.now() - actionQueueStore.actionStartDate)
      const duration = actionQueueStore.currentActionDetail.duration
      actionQueueStore.progress =
        Math.min(duration > 0 ? fromFixed(fpDiv(elapsed, duration)) : 0, 1) * 100
    } else {
      actionQueueStore.progress = 0
    }
    requestAnimationFrame(update)
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
      console.warn(
        `Required level ${action.minLevel} for action ${action.id}, but current level is ${currentLevel}`,
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
