import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

import { isInfiniteAmount, decrementAmount } from '@/utils/amount'
import { INFINITE_AMOUNT } from '@/utils/constants'
import { type Seconds } from '@/utils/fixedPoint'
import log from '@/utils/log'

import { useActionStore } from './action'
import { useCombatStore, type CurrentBattle } from './combat'

/**
 * 队列中的行动项类型
 */
export type ActionQueueItemType = 'production' | 'combat'

/**
 * 队列中的行动项
 */
export interface ActionQueueItem {
  /** 行动类型 */
  type: ActionQueueItemType
  /** 行动 ID（生产行动）或敌人 ID（战斗行动） */
  actionId: string
  /** 剩余次数 */
  amount: number
  /** 战斗单场时长（仅战斗行动，秒） */
  combatDurationSeconds?: Seconds
}

export const useActionQueueStore = defineStore('actionQueue', () => {
  const actionStore = useActionStore()
  const combatStore = useCombatStore()
  const getCurrentBattle = () => combatStore.currentBattle as CurrentBattle | null

  const actionQueue = ref<ActionQueueItem[]>([])
  const actionStartDate = ref<number | null>(null)
  const progress = ref<number>(0)

  const currentAction = computed(() => actionQueue.value[0] || null)
  const pendingActions = computed(() => actionQueue.value.slice(1))
  const queueLength = computed(() => actionQueue.value.length)

  /** 当前行动是否为战斗 */
  const isCombatAction = computed(() => currentAction.value?.type === 'combat')

  const actionQueueDetails = computed(() =>
    actionQueue.value.map((actionItem) => {
      if (actionItem.type === 'combat') {
        // 战斗行动没有 action detail，返回 null
        return null
      }
      return actionStore.getActionById(actionItem.actionId)
    }),
  )
  const currentActionDetail = computed(() => {
    const actionItem = actionQueue.value[0]
    if (!actionItem) return null
    if (actionItem.type === 'combat') return null
    return actionStore.getActionById(actionItem.actionId)
  })

  function startImmediately(actionId: string, amount: number = INFINITE_AMOUNT): void {
    actionQueue.value.unshift({ type: 'production', actionId, amount })
    actionStartDate.value = performance.now()
  }

  function addAction(actionId: string, amount: number = INFINITE_AMOUNT): void {
    actionQueue.value.push({ type: 'production', actionId, amount })
    if (actionQueue.value.length === 1) {
      actionStartDate.value = performance.now()
    }
  }

  /**
   * 添加战斗行动到队列
   *
   * @param enemyId 敌人 ID
   * @param amount 战斗次数
   * @param durationSeconds 战斗单场时长（秒）
   */
  function addCombatAction(enemyId: string, amount: number, durationSeconds: Seconds): void {
    actionQueue.value.push({
      type: 'combat',
      actionId: enemyId,
      amount,
      combatDurationSeconds: durationSeconds,
    })
    if (actionQueue.value.length === 1) {
      actionStartDate.value = performance.now()
    }
  }

  /**
   * 立即开始战斗行动
   *
   * @param enemyId 敌人 ID
   * @param amount 战斗次数
   * @param durationSeconds 战斗单场时长（秒）
   */
  function startCombatImmediately(enemyId: string, amount: number, durationSeconds: Seconds): void {
    actionQueue.value.unshift({
      type: 'combat',
      actionId: enemyId,
      amount,
      combatDurationSeconds: durationSeconds,
    })
    actionStartDate.value = performance.now()
  }

  function removeAction(index: number): void {
    if (index < 0 || index >= actionQueue.value.length) return

    const removedAction = actionQueue.value[index]
    actionQueue.value.splice(index, 1)

    if (index === 0 && removedAction?.type === 'combat') {
      combatStore.cancelBattle()
    }

    if (index === 0) {
      if (actionQueue.value.length > 0) {
        actionStartDate.value = performance.now()
      } else {
        actionStartDate.value = null
      }
    }
  }

  function stopCurrentAction(): void {
    if (!currentAction.value) return
    removeAction(0)
  }

  function moveUp(index: number): void {
    if (index <= 0 || index >= actionQueue.value.length) return

    const temp = actionQueue.value[index]
    actionQueue.value[index] = actionQueue.value[index - 1]
    actionQueue.value[index - 1] = temp

    if (index === 1) {
      actionStartDate.value = performance.now()
    }
  }

  function moveDown(index: number): void {
    if (index < 0 || index >= actionQueue.value.length - 1) return

    const temp = actionQueue.value[index]
    actionQueue.value[index] = actionQueue.value[index + 1]
    actionQueue.value[index + 1] = temp

    if (index === 0) {
      actionStartDate.value = performance.now()
    }
  }

  function moveTop(index: number): void {
    if (index <= 0 || index >= actionQueue.value.length) return

    const item = actionQueue.value.splice(index, 1)[0]
    actionQueue.value.unshift(item)

    actionStartDate.value = performance.now()
  }

  function moveBottom(index: number): void {
    if (index < 0 || index >= actionQueue.value.length) return

    const item = actionQueue.value.splice(index, 1)[0]
    actionQueue.value.push(item)
    if (index === 0) {
      actionStartDate.value = performance.now()
    }
  }

  function completeCurrentAction(elapsed: number, executionCount: number): void {
    if (!actionStartDate.value) return
    if (!currentAction.value) return
    const actionItem = currentAction.value

    if (isInfiniteAmount(actionItem.amount)) {
      actionStartDate.value += elapsed
      return
    }
    if (actionItem.amount > executionCount) {
      actionStartDate.value += elapsed

      actionItem.amount = decrementAmount(actionItem.amount, executionCount)
    } else {
      actionQueue.value.shift()
      if (currentAction.value) {
        actionStartDate.value += elapsed
      } else {
        actionStartDate.value = null
      }
    }
  }

  watch(
    () => currentAction.value,
    (action) => {
      if (!action || action.type !== 'combat') return
      if (getCurrentBattle()) return

      const result = combatStore.startBattle(action.actionId, action.amount)
      const battle = getCurrentBattle()
      if (!result || !result.canWin || !battle) {
        log.warn('无法启动排队中的战斗行动，自动移除', {
          enemyId: action.actionId,
        })
        removeAction(0)
        return
      }

      action.combatDurationSeconds = battle.singleBattleDurationSeconds
      actionStartDate.value = performance.now()
    },
  )

  return {
    actionQueue,
    actionStartDate,
    progress,

    currentAction,
    pendingActions,
    queueLength,
    isCombatAction,

    actionQueueDetails,
    currentActionDetail,

    addAction,
    addCombatAction,
    removeAction,
    stopCurrentAction,
    startImmediately,
    startCombatImmediately,
    completeCurrentAction,

    moveUp,
    moveDown,
    moveTop,
    moveBottom,
  }
})
