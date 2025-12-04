import { defineStore } from 'pinia'

import { enemyConfigMap } from '@/gameConfig'
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

    requestAnimationFrame(update)
  }

  /**
   * 处理战斗行动的更新
   */
  function updateCombatAction(elapsed: number): number {
    if (!actionQueueStore.actionStartDate || !actionQueueStore.currentAction) return 0

    const actionItem = actionQueueStore.currentAction
    const durationSeconds: Seconds = actionItem.combatDurationSeconds ?? 0

    // 更新攻击冷却进度和HP
    if (combatStore.currentBattle) {
      const battle = combatStore.currentBattle
      const currentTime = performance.now()

      // 处理冷却状态
      if (battle.state === 'cooldown') {
        if (battle.cooldownEndTime && currentTime >= battle.cooldownEndTime) {
          // 冷却结束，开始下一场战斗
          const newDurationSeconds = combatStore.startNextRound()
          if (newDurationSeconds !== null) {
            // 更新队列中的战斗时长（秒）
            actionQueueStore.currentAction.combatDurationSeconds = newDurationSeconds
          } else {
            // 无法继续战斗，统一停止当前行动
            actionQueueStore.stopCurrentAction()
          }
        }
        // 冷却期间不消耗 elapsed，直接返回
        // 注意：这里我们假设冷却时间不计入 actionQueue 的进度
        // 如果需要计入，逻辑会更复杂，目前先简单处理
        return 0
      }

      // 处理战斗状态
      const battleElapsedSeconds = (currentTime - battle.startTime) / 1000
      const enemy = enemyConfigMap[battle.enemyId]

      const calcAttackProgress = (
        lastAttackTime: number,
        nextAttackTime: number | null,
        intervalSeconds: number,
      ): number => {
        // 如果没有下一次攻击事件，说明战斗在下一次攻击前结束了
        // 但进度条应该继续跑，直到战斗结束
        // 此时目标时间就是 上次攻击时间 + 攻击间隔
        const targetTime = nextAttackTime ?? lastAttackTime + intervalSeconds

        if (targetTime <= lastAttackTime) {
          return 1
        }
        const elapsedSinceLast = battleElapsedSeconds - lastAttackTime
        if (elapsedSinceLast <= 0) {
          return 0
        }
        const interval = targetTime - lastAttackTime
        return Math.min(1, Math.max(0, elapsedSinceLast / interval))
      }

      // 根据战斗事件流更新HP（事件时间以秒为单位，转换为毫秒比较）
      const events = battle.representativeLog
      let lastPlayerHp = combatStore.maxHp
      let lastEnemyHp = enemy?.hp || 0
      let lastPlayerAttackTime = 0
      let nextPlayerAttackTime: number | null = null
      let lastEnemyAttackTime = 0
      let nextEnemyAttackTime: number | null = null

      for (const event of events) {
        if (event.timeSeconds <= battleElapsedSeconds) {
          if (event.actorSide === 'player') {
            // 玩家攻击敌人
            lastEnemyHp = event.targetHpAfter
            lastPlayerAttackTime = event.timeSeconds
          } else {
            // 敌人攻击玩家
            lastPlayerHp = event.targetHpAfter
            lastEnemyAttackTime = event.timeSeconds
          }
        } else {
          if (event.actorSide === 'player' && nextPlayerAttackTime === null) {
            nextPlayerAttackTime = event.timeSeconds
          } else if (event.actorSide === 'enemy' && nextEnemyAttackTime === null) {
            nextEnemyAttackTime = event.timeSeconds
          }

          if (nextPlayerAttackTime !== null && nextEnemyAttackTime !== null) {
            break
          }
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

    if (elapsed / 1000 < durationSeconds) {
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

    // 计算实际消耗的时间（毫秒）
    const computedElapsedTime = durationSeconds * 1000
    const remainedElapsed = elapsed - computedElapsedTime

    // 完成当前行动（减少计数）
    actionQueueStore.completeCurrentAction(computedElapsedTime, 1)

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
