import { defineStore } from 'pinia'

import { fromSecondsFixed } from '@/utils/fixedPoint'

import { useActionQueueStore } from './actionQueue'

export const useActionProgressStore = defineStore('actionProgress', () => {
  const actionQueueStore = useActionQueueStore()

  let animationFrame: number | null = null

  const tick = () => {
    updateProgress()
    animationFrame = requestAnimationFrame(tick)
  }

  function updateProgress(): void {
    if (actionQueueStore.actionStartDate && actionQueueStore.currentAction) {
      const elapsedSeconds = (performance.now() - actionQueueStore.actionStartDate) / 1000

      if (actionQueueStore.isCombatAction) {
        const durationSeconds = actionQueueStore.currentAction.combatDurationSeconds ?? 0
        const ratio = durationSeconds > 0 ? elapsedSeconds / durationSeconds : 0
        actionQueueStore.progress = Math.min(ratio, 1) * 100
      } else if (actionQueueStore.currentActionDetail) {
        const actionDurationSeconds = fromSecondsFixed(
          actionQueueStore.currentActionDetail.durationSeconds,
        )
        const ratio = actionDurationSeconds > 0 ? elapsedSeconds / actionDurationSeconds : 0
        actionQueueStore.progress = Math.min(ratio, 1) * 100
      } else {
        actionQueueStore.progress = 0
      }
    } else {
      actionQueueStore.progress = 0
    }
  }

  function start(): void {
    if (animationFrame !== null) {
      return
    }
    updateProgress()
    animationFrame = requestAnimationFrame(tick)
  }

  function stop(): void {
    if (animationFrame !== null) {
      cancelAnimationFrame(animationFrame)
      animationFrame = null
    }
    actionQueueStore.progress = 0
  }

  return {
    start,
    stop,
    updateProgress,
  }
})
