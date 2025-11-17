import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, vi } from 'vitest'

import { useNotificationStore } from '../notification'

describe('notification store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  it('should add notifications', () => {
    const store = useNotificationStore()

    store.info('test.message')
    expect(store.notifications).toHaveLength(1)
    expect(store.notifications[0].key).toBe('test.message')
    expect(store.notifications[0].type).toBe('info')
  })

  it('should add notifications with different types', () => {
    const store = useNotificationStore()

    store.info('info.message')
    store.warning('warning.message')
    store.error('error.message')

    expect(store.notifications).toHaveLength(3)
    expect(store.notifications[0].type).toBe('info')
    expect(store.notifications[1].type).toBe('warning')
    expect(store.notifications[2].type).toBe('error')
  })

  it('should pass params to notifications', () => {
    const store = useNotificationStore()
    const params = { count: 5, name: 'test' }

    store.info('test.message', params)
    expect(store.notifications[0].params).toEqual(params)
  })

  it('should trim notifications to MAX_NOTIFICATIONS', () => {
    const store = useNotificationStore()

    // Add more than MAX_NOTIFICATIONS (3)
    store.info('message1')
    store.info('message2')
    store.info('message3')
    store.info('message4')
    store.info('message5')

    expect(store.notifications).toHaveLength(3)
    // Should keep the last 3
    expect(store.notifications[0].key).toBe('message3')
    expect(store.notifications[1].key).toBe('message4')
    expect(store.notifications[2].key).toBe('message5')
  })

  it('should remove notification by id', () => {
    const store = useNotificationStore()

    const id1 = store.info('message1')
    const id2 = store.info('message2')
    const id3 = store.info('message3')

    expect(store.notifications).toHaveLength(3)

    store.remove(id2)
    expect(store.notifications).toHaveLength(2)
    expect(store.notifications[0].id).toBe(id1)
    expect(store.notifications[1].id).toBe(id3)
  })

  it('should not error when removing non-existent id', () => {
    const store = useNotificationStore()

    store.info('message1')
    expect(() => store.remove(999)).not.toThrow()
    expect(store.notifications).toHaveLength(1)
  })

  it('should clear all notifications', () => {
    const store = useNotificationStore()

    store.info('message1')
    store.warning('message2')
    store.error('message3')

    expect(store.notifications).toHaveLength(3)

    store.clear()
    expect(store.notifications).toHaveLength(0)
  })

  it('should auto-remove notification after duration', () => {
    const store = useNotificationStore()

    store.info('message', undefined, 2000)
    expect(store.notifications).toHaveLength(1)

    vi.advanceTimersByTime(2000)
    expect(store.notifications).toHaveLength(0)
  })

  it('should not auto-remove when duration is 0', () => {
    const store = useNotificationStore()

    store.info('message', undefined, 0)
    expect(store.notifications).toHaveLength(1)

    vi.advanceTimersByTime(10000)
    expect(store.notifications).toHaveLength(1)
  })

  it('should handle multiple auto-removing notifications', () => {
    const store = useNotificationStore()

    store.info('message1', undefined, 1000)
    store.info('message2', undefined, 2000)
    store.info('message3', undefined, 3000)

    expect(store.notifications).toHaveLength(3)

    vi.advanceTimersByTime(1000)
    expect(store.notifications).toHaveLength(2)

    vi.advanceTimersByTime(1000)
    expect(store.notifications).toHaveLength(1)

    vi.advanceTimersByTime(1000)
    expect(store.notifications).toHaveLength(0)
  })

  it('should generate unique ids for notifications', () => {
    const store = useNotificationStore()

    const id1 = store.info('message1')
    const id2 = store.info('message2')
    const id3 = store.info('message3')

    expect(id1).not.toBe(id2)
    expect(id2).not.toBe(id3)
    expect(id1).not.toBe(id3)
  })

  it('should return notification id from push methods', () => {
    const store = useNotificationStore()

    const infoId = store.info('info')
    const warningId = store.warning('warning')
    const errorId = store.error('error')

    expect(typeof infoId).toBe('number')
    expect(typeof warningId).toBe('number')
    expect(typeof errorId).toBe('number')
  })
})
