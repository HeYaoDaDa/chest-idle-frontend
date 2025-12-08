/**
 * useQueueAction - Composable for action queue management in Modals
 *
 * Provides common logic for:
 * - Queue state checking (if there's a current action)
 * - Queue position calculation (where to insert new action)
 * - Modal closing after action queued
 *
 * Usage:
 * ```typescript
 * const {
 *   hasCurrentAction,  // computed<boolean> - queue has active action?
 *   queuePosition,     // computed<number> - where to insert
 *   closeModal,        // () => void - emit close event
 * } = useQueueAction(emit)
 * ```
 */

import { computed } from 'vue'

import { useActionQueueStore } from '@/stores/actionQueue'

export function useQueueAction(emit: (event: 'close') => void) {
  const actionQueueStore = useActionQueueStore()

  const hasCurrentAction = computed(() => !!actionQueueStore.currentAction)

  const queuePosition = computed(() => actionQueueStore.queueLength + 1)

  const closeModal = () => {
    emit('close')
  }

  return {
    hasCurrentAction,
    queuePosition,
    closeModal,
  }
}
