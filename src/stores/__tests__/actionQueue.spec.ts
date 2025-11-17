import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, vi } from 'vitest'

import { INFINITE_AMOUNT } from '../../utils/constants'
import { useActionQueueStore } from '../actionQueue'

describe('actionQueue store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('addAction', () => {
    it('should add action to queue', () => {
      const store = useActionQueueStore()

      store.addAction('test_action')
      expect(store.queueLength).toBe(1)
      expect(store.currentAction?.actionId).toBe('test_action')
    })

    it('should set actionStartDate for first action', () => {
      const store = useActionQueueStore()
      vi.spyOn(performance, 'now').mockReturnValue(1000)

      store.addAction('test_action')
      expect(store.actionStartDate).toBe(1000)
    })

    it('should add action with specific amount', () => {
      const store = useActionQueueStore()

      store.addAction('test_action', 5)
      expect(store.currentAction?.amount).toBe(5)
    })

    it('should add action with infinite amount by default', () => {
      const store = useActionQueueStore()

      store.addAction('test_action')
      expect(store.currentAction?.amount).toBe(INFINITE_AMOUNT)
    })

    it('should add multiple actions to queue', () => {
      const store = useActionQueueStore()

      store.addAction('action1')
      store.addAction('action2')
      store.addAction('action3')

      expect(store.queueLength).toBe(3)
      expect(store.pendingActions).toHaveLength(2)
    })
  })

  describe('startImmediately', () => {
    it('should add action to front of queue', () => {
      const store = useActionQueueStore()

      store.addAction('action1')
      store.addAction('action2')
      store.startImmediately('urgent_action')

      expect(store.currentAction?.actionId).toBe('urgent_action')
      expect(store.queueLength).toBe(3)
    })

    it('should reset actionStartDate', () => {
      const store = useActionQueueStore()
      vi.spyOn(performance, 'now').mockReturnValueOnce(1000).mockReturnValueOnce(2000)

      store.addAction('action1')
      expect(store.actionStartDate).toBe(1000)

      store.startImmediately('urgent_action')
      expect(store.actionStartDate).toBe(2000)
    })
  })

  describe('removeAction', () => {
    it('should remove action at index', () => {
      const store = useActionQueueStore()

      store.addAction('action1')
      store.addAction('action2')
      store.addAction('action3')

      store.removeAction(1)
      expect(store.queueLength).toBe(2)
      expect(store.actionQueue[1].actionId).toBe('action3')
    })

    it('should reset actionStartDate when removing current action', () => {
      const store = useActionQueueStore()
      vi.spyOn(performance, 'now').mockReturnValueOnce(1000).mockReturnValueOnce(2000)

      store.addAction('action1')
      store.addAction('action2')

      store.removeAction(0)
      expect(store.actionStartDate).toBe(2000)
      expect(store.currentAction?.actionId).toBe('action2')
    })

    it('should set actionStartDate to null when queue becomes empty', () => {
      const store = useActionQueueStore()

      store.addAction('action1')
      store.removeAction(0)

      expect(store.actionStartDate).toBeNull()
      expect(store.queueLength).toBe(0)
    })

    it('should handle invalid index gracefully', () => {
      const store = useActionQueueStore()

      store.addAction('action1')
      store.removeAction(999)

      expect(store.queueLength).toBe(1)
    })
  })

  describe('move operations', () => {
    beforeEach(() => {
      vi.spyOn(performance, 'now').mockReturnValue(1000)
    })

    it('should move action up', () => {
      const store = useActionQueueStore()

      store.addAction('action1')
      store.addAction('action2')
      store.addAction('action3')

      store.moveUp(2)
      expect(store.actionQueue[1].actionId).toBe('action3')
      expect(store.actionQueue[2].actionId).toBe('action2')
    })

    it('should move action down', () => {
      const store = useActionQueueStore()

      store.addAction('action1')
      store.addAction('action2')
      store.addAction('action3')

      store.moveDown(0)
      expect(store.actionQueue[0].actionId).toBe('action2')
      expect(store.actionQueue[1].actionId).toBe('action1')
    })

    it('should move action to top', () => {
      const store = useActionQueueStore()

      store.addAction('action1')
      store.addAction('action2')
      store.addAction('action3')

      store.moveTop(2)
      expect(store.currentAction?.actionId).toBe('action3')
    })

    it('should move action to bottom', () => {
      const store = useActionQueueStore()

      store.addAction('action1')
      store.addAction('action2')
      store.addAction('action3')

      store.moveBottom(0)
      expect(store.actionQueue[2].actionId).toBe('action1')
    })

    it('should reset actionStartDate when moving to/from position 0', () => {
      const store = useActionQueueStore()
      vi.spyOn(performance, 'now').mockReturnValueOnce(1000).mockReturnValueOnce(2000)

      store.addAction('action1')
      store.addAction('action2')

      store.moveTop(1)
      expect(store.actionStartDate).toBe(2000)
    })
  })

  describe('completeCurrentAction', () => {
    it('should keep infinite action in queue', () => {
      const store = useActionQueueStore()
      vi.spyOn(performance, 'now').mockReturnValue(1000)

      store.addAction('action1', INFINITE_AMOUNT)
      store.completeCurrentAction(1000, 1)

      expect(store.queueLength).toBe(1)
      expect(store.actionStartDate).toBe(2000)
    })

    it('should decrement finite action amount', () => {
      const store = useActionQueueStore()
      vi.spyOn(performance, 'now').mockReturnValue(1000)

      store.addAction('action1', 5)
      store.completeCurrentAction(1000, 2)

      expect(store.currentAction?.amount).toBe(3)
      expect(store.queueLength).toBe(1)
    })

    it('should remove action when amount is depleted', () => {
      const store = useActionQueueStore()
      vi.spyOn(performance, 'now').mockReturnValue(1000)

      store.addAction('action1', 3)
      store.addAction('action2')
      store.completeCurrentAction(1000, 3)

      expect(store.currentAction?.actionId).toBe('action2')
      expect(store.queueLength).toBe(1)
    })

    it('should handle over-execution gracefully', () => {
      const store = useActionQueueStore()
      vi.spyOn(performance, 'now').mockReturnValue(1000)

      store.addAction('action1', 2)
      store.completeCurrentAction(1000, 5)

      expect(store.queueLength).toBe(0)
      expect(store.actionStartDate).toBeNull()
    })
  })

  describe('computed properties', () => {
    it('should return null currentAction when queue is empty', () => {
      const store = useActionQueueStore()
      expect(store.currentAction).toBeNull()
    })

    it('should return correct pendingActions', () => {
      const store = useActionQueueStore()

      store.addAction('action1')
      store.addAction('action2')
      store.addAction('action3')

      expect(store.pendingActions).toHaveLength(2)
      expect(store.pendingActions[0].actionId).toBe('action2')
      expect(store.pendingActions[1].actionId).toBe('action3')
    })

    it('should track progress correctly', () => {
      const store = useActionQueueStore()
      expect(store.progress).toBe(0)
    })
  })
})
