import { fromSecondsFixed } from '@/utils/fixedPoint'

import type { useActionQueueStore } from '../actionQueue'

/**
 * 进度计算器
 *
 * 负责计算当前行动的进度百分比（0-100）
 * 支持生产行动和战斗行动
 */
export class ProgressCalculator {
  constructor(private actionQueueStore: ReturnType<typeof useActionQueueStore>) {}

  /**
   * 更新当前行动的进度
   * @param now 当前时间戳（performance.now()）
   */
  update(now: number): void {
    if (!this.actionQueueStore.actionStartDate || !this.actionQueueStore.currentAction) {
      this.actionQueueStore.progress = 0
      return
    }

    const elapsedSeconds = (now - this.actionQueueStore.actionStartDate) / 1000

    if (this.actionQueueStore.isCombatAction) {
      this.updateCombatProgress(elapsedSeconds)
    } else if (this.actionQueueStore.currentActionDetail) {
      this.updateProductionProgress(elapsedSeconds)
    } else {
      this.actionQueueStore.progress = 0
    }
  }

  /**
   * 更新战斗进度
   */
  private updateCombatProgress(elapsedSeconds: number): void {
    const durationSeconds = this.actionQueueStore.currentAction!.combatDurationSeconds ?? 0
    const ratio = durationSeconds > 0 ? elapsedSeconds / durationSeconds : 0
    this.actionQueueStore.progress = Math.min(ratio, 1) * 100
  }

  /**
   * 更新生产行动进度
   */
  private updateProductionProgress(elapsedSeconds: number): void {
    const actionDurationSeconds = fromSecondsFixed(
      this.actionQueueStore.currentActionDetail!.durationSeconds,
    )
    const ratio = actionDurationSeconds > 0 ? elapsedSeconds / actionDurationSeconds : 0
    this.actionQueueStore.progress = Math.min(ratio, 1) * 100
  }
}
