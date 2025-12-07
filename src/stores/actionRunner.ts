import { defineStore } from 'pinia'
import { watch } from 'vue'

import { useActionQueueStore } from './actionQueue'
import { CombatExecutor } from './actionRunner/CombatExecutor'
import { ProductionExecutor } from './actionRunner/ProductionExecutor'
import { ProgressCalculator } from './actionRunner/ProgressCalculator'
import { TimeManager } from './actionRunner/TimeManager'
import { useChestPointStore } from './chestPoint'
import { useCombatStore } from './combat'
import { useConsumableStore } from './consumable'
import { useInventoryStore } from './inventory'
import { useLootNotificationStore } from './lootNotification'
import { useNotificationStore } from './notification'
import { useSkillStore } from './skill'

export const useActionRunnerStore = defineStore('actionRunner', () => {
  const skillStore = useSkillStore()
  const inventoryStore = useInventoryStore()
  const actionQueueStore = useActionQueueStore()
  const notificationStore = useNotificationStore()
  const chestPointStore = useChestPointStore()
  const consumableStore = useConsumableStore()
  const combatStore = useCombatStore()
  const lootNotificationStore = useLootNotificationStore()

  // 进度计算器
  const progressCalculator = new ProgressCalculator(actionQueueStore)

  // 生产行动执行器
  const productionExecutor = new ProductionExecutor(
    actionQueueStore,
    skillStore,
    inventoryStore,
    consumableStore,
    chestPointStore,
    notificationStore,
    lootNotificationStore,
  )

  // 战斗行动执行器
  const combatExecutor = new CombatExecutor(
    actionQueueStore,
    skillStore,
    inventoryStore,
    combatStore,
    chestPointStore,
    notificationStore,
    lootNotificationStore,
  )

  // 时间管理器
  const timeManager = new TimeManager(
    (now) => update(now),
    () => shouldStop(),
  )

  function start(): void {
    timeManager.start()
  }

  // 监听队列变化，自动启动循环
  watch(
    () => actionQueueStore.actionQueue.length,
    (length) => {
      if (length > 0) {
        start()
      }
    },
  )

  /**
   * 判断是否应该停止循环
   * 当没有当前行动且队列为空时停止
   */
  function shouldStop(): boolean {
    return !actionQueueStore.currentAction && actionQueueStore.actionQueue.length === 0
  }

  function update(now: number): void {
    // 更新进度条
    progressCalculator.update(now)

    if (actionQueueStore.actionStartDate) {
      let remainedElapsed = now - actionQueueStore.actionStartDate
      while (actionQueueStore.currentAction && remainedElapsed > 0) {
        if (actionQueueStore.isCombatAction) {
          remainedElapsed = combatExecutor.update(remainedElapsed)
        } else {
          remainedElapsed = productionExecutor.update(remainedElapsed)
        }
      }
    }
  }

  return {
    start,
  }
})
