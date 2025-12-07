import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface LootNotificationItem {
  itemId: string
  count: number
}

export interface LootNotification {
  id: number
  items: LootNotificationItem[]
  timestamp: number
}

export const useLootNotificationStore = defineStore('lootNotification', () => {
  const currentNotification = ref<LootNotification | null>(null)
  let nextId = 1
  const NOTIFICATION_DURATION = 3000 // 3 seconds
  let timeoutId: number | null = null

  function addNotification(items: LootNotificationItem[]): void {
    if (items.length === 0) return

    // Clear existing timer
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
      timeoutId = null
    }

    const id = nextId++
    currentNotification.value = {
      id,
      items,
      timestamp: Date.now(),
    }

    // Auto remove after duration
    timeoutId = window.setTimeout(() => {
      currentNotification.value = null
      timeoutId = null
    }, NOTIFICATION_DURATION)
  }

  return {
    currentNotification,
    addNotification,
  }
})
