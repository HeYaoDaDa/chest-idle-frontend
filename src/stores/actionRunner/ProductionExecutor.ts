import { itemConfigMap } from '@/gameConfig'
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
  type SecondsFixed,
} from '@/utils/fixedPoint'
import log from '@/utils/log'

import type { Action } from '../action'
import type { useActionQueueStore } from '../actionQueue'
import type { useChestPointStore } from '../chestPoint'
import type { useConsumableStore } from '../consumable'
import type { useInventoryStore } from '../inventory'
import type { useLootNotificationStore } from '../lootNotification'
import type { useNotificationStore } from '../notification'
import type { useSkillStore } from '../skill'

/**
 * 生产行动执行器
 *
 * 负责：
 * 1. 验证行动条件（等级、材料）
 * 2. 计算可执行次数（时间、材料、经验、消耗品）
 * 3. 执行生产行动（扣材料、加产物、加经验、加宝箱点数）
 */
export class ProductionExecutor {
  constructor(
    private actionQueueStore: ReturnType<typeof useActionQueueStore>,
    private skillStore: ReturnType<typeof useSkillStore>,
    private inventoryStore: ReturnType<typeof useInventoryStore>,
    private consumableStore: ReturnType<typeof useConsumableStore>,
    private chestPointStore: ReturnType<typeof useChestPointStore>,
    private notificationStore: ReturnType<typeof useNotificationStore>,
    private lootNotificationStore: ReturnType<typeof useLootNotificationStore>,
  ) {}

  /**
   * 更新当前生产行动
   * @param elapsed 已过去的时间（毫秒）
   * @returns 剩余未消耗的时间（毫秒）
   */
  update(elapsed: number): number {
    if (!this.actionQueueStore.actionStartDate || !this.actionQueueStore.currentActionDetail) {
      return 0
    }

    if (!this.checkCurrentActionItem()) {
      return 0 // 检查失败，行动已被移除，返回 0
    }

    const amount = this.actionQueueStore.currentAction.amount
    const action = this.actionQueueStore.currentActionDetail
    const skill = this.skillStore.getSkill(action.skillId)

    const elapsedSeconds = elapsed / 1000
    const elapsedSecondsFixed: SecondsFixed = toSecondsFixed(elapsedSeconds)

    // 未完成一次行动
    if (fpLt(elapsedSecondsFixed, action.durationSeconds)) {
      return 0
    }

    // 计算可执行次数
    let computedAmount = toFiniteForCompute(amount)

    // 限制1：基于时间可以执行的次数
    const timeBasedAmount = Math.floor(
      fromFixed(fpFloor(fpDiv(elapsedSecondsFixed, action.durationSeconds))),
    )
    computedAmount = Math.min(computedAmount, timeBasedAmount)

    // 限制2：基于经验升级限制
    if (skill) {
      const xpBasedAmount = Math.ceil(fromFixed(fpDiv(skill.remainingXpForUpgrade, action.xp)))
      computedAmount = Math.min(computedAmount, xpBasedAmount)
    }

    // 限制3：基于消耗品限制
    const buffBasedAmount = this.consumableStore.estimateBuffedCounts(
      action.skillId,
      action.durationSeconds,
    )
    computedAmount = Math.min(computedAmount, buffBasedAmount)

    // 确保是正整数
    computedAmount = Math.max(0, Math.floor(computedAmount))

    // 如果计算出的次数为 0，说明无法执行，移除当前行动
    if (computedAmount === 0) {
      this.actionQueueStore.removeAction(0)
      return 0
    }

    // 执行生产行动
    this.executeAction(action, computedAmount)

    // 计算实际消耗的时间
    const computedElapsedSecondsFixed = fpMul(action.durationSeconds, toFixed(computedAmount))
    const computedElapsedTime = fromSecondsFixed(computedElapsedSecondsFixed) * 1000
    const remainedElapsed = elapsed - computedElapsedTime

    // 完成当前行动
    this.actionQueueStore.completeCurrentAction(computedElapsedTime, computedAmount)

    return remainedElapsed
  }

  /**
   * 执行生产行动（扣材料、加产物、加经验、加宝箱点数）
   */
  private executeAction(action: Action, computedAmount: number): void {
    const itemsToRemove: [string, number][] = []

    // 收集材料消耗
    if (action.ingredients) {
      for (const ingredient of action.ingredients) {
        itemsToRemove.push([ingredient.itemId, ingredient.count * computedAmount])
      }
    }

    // 收集消耗品消耗（使用秒为单位）
    const consumableItems = this.consumableStore.consumeBuffs(
      action.skillId,
      fpMul(action.durationSeconds, toFixed(computedAmount)),
    )
    itemsToRemove.push(...consumableItems)

    // 统一扣除库存
    if (itemsToRemove.length > 0) {
      this.inventoryStore.removeManyItems(itemsToRemove)
    }

    // 添加经验
    this.skillStore.addSkillXp(action.skillId, fpMul(action.xp, toFixed(computedAmount)))

    // 添加宝箱点数
    const chestCount = this.chestPointStore.addChestPoints(
      action.chestId,
      fpMul(action.chestPoints, toFixed(computedAmount)),
    )

    const rewards: [string, number][] = []
    const lootNotifications: { itemId: string; count: number }[] = []

    // 添加产物
    for (const product of action.products) {
      const count = product.count * computedAmount
      rewards.push([product.itemId, count])
      lootNotifications.push({ itemId: product.itemId, count })
    }

    // 如果获得了宝箱，添加到奖励
    if (chestCount > 0) {
      rewards.push([action.chestId, chestCount])
      lootNotifications.push({ itemId: action.chestId, count: chestCount })
      // 添加宝箱获得通知
      const chestConfig = itemConfigMap[action.chestId]
      this.notificationStore.info('notification.chestObtained', {
        count: chestCount,
        chest: chestConfig ? i18n.global.t(chestConfig.name) : action.chestId,
      })
    }

    // 统一添加奖励到背包
    if (rewards.length > 0) {
      this.inventoryStore.addManyItems(rewards)
      this.lootNotificationStore.addNotification(lootNotifications)
    }
  }

  /**
   * 检查当前行动是否可执行（等级、材料）
   */
  private checkCurrentActionItem(): boolean {
    if (!this.actionQueueStore.currentAction || !this.actionQueueStore.currentActionDetail) {
      return false
    }

    const action = this.actionQueueStore.currentActionDetail
    const amount = this.actionQueueStore.currentAction.amount

    // 检查等级
    const currentLevel = this.skillStore.getSkillLevel(action.skillId)
    if (currentLevel < action.minLevel) {
      log.warn(
        `Required level ${action.minLevel} for action ${action.id}, but current level is ${currentLevel}`,
        {
          actionId: action.id,
          requiredLevel: action.minLevel,
          currentLevel,
        },
      )
      const skillConfig = this.skillStore.getSkill(action.skillId)
      this.notificationStore.warning('notification.levelTooLow', {
        skill: skillConfig ? i18n.global.t(skillConfig.name) : action.skillId,
        level: currentLevel,
        required: action.minLevel,
        action: i18n.global.t(action.name),
      })

      this.actionQueueStore.removeAction(0)
      return false
    }

    // 检查材料
    const actualAmount = this.computeAmount(action, amount)
    if (!isInfiniteAmount(actualAmount) && actualAmount <= 0) {
      this.notificationStore.warning('notification.notEnoughMaterials', {
        action: i18n.global.t(action.name),
      })

      this.actionQueueStore.removeAction(0)
      return false
    }
    this.actionQueueStore.currentAction.amount = actualAmount

    return true
  }

  /**
   * 计算基于材料的可执行次数
   */
  private computeAmount(action: Action, amount: number): number {
    let maxAmount = Infinity

    if (action.ingredients) {
      for (const ingredient of action.ingredients) {
        const inventoryItemCount = this.inventoryStore.inventoryMap[ingredient.itemId]
        const availableCount = inventoryItemCount ? inventoryItemCount : 0
        const maxForThisIngredient = Math.floor(availableCount / ingredient.count)
        maxAmount = Math.min(maxAmount, maxForThisIngredient)
      }
    }

    const finiteAmount = toFiniteForCompute(amount)
    const computed = Math.min(finiteAmount, maxAmount)
    return fromComputeResult(computed)
  }
}
