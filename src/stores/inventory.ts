import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { itemConfigMap, type ItemConfig } from '@/gameConfig'
import log from '@/utils/log'

export interface InventoryItem {
  item: ItemConfig
  count: number
}

export const useInventoryStore = defineStore('inventory', () => {
  const inventoryMap = ref<Record<string, number>>(Object.create(null))

  const inventoryItems = computed(() =>
    inventoryMap.value
      ? Object.entries(inventoryMap.value)
          .map(([itemId, count]) => ({ item: itemConfigMap[itemId], count }))
          .filter((item) => item.item !== undefined)
          .sort((a, b) => a.item.sort - b.item.sort)
      : [],
  )

  const inventoryItemsByCategory = computed(() => {
    const groups = {
      chest: [] as InventoryItem[],
      resource: [] as InventoryItem[],
      equipment: [] as InventoryItem[],
      consumable: [] as InventoryItem[],
    }

    for (const item of inventoryItems.value) {
      const category = item.item.category
      if (category in groups) {
        groups[category].push(item)
      }
    }

    return groups
  })

  const categoryStats = computed(() => ({
    chest: inventoryItemsByCategory.value.chest.length,
    resource: inventoryItemsByCategory.value.resource.length,
    equipment: inventoryItemsByCategory.value.equipment.length,
    consumable: inventoryItemsByCategory.value.consumable.length,
  }))

  function addItem(itemId: string, amount: number): void {
    const existingItem = inventoryMap.value[itemId]
    if (existingItem) {
      inventoryMap.value[itemId] += amount
    } else {
      inventoryMap.value[itemId] = amount
    }
  }

  function addManyItems(items: [string, number][]): void {
    for (const [itemId, amount] of items) {
      addItem(itemId, amount)
    }
  }

  function removeItem(itemId: string, amount: number): void {
    const existingItem = inventoryMap.value[itemId]
    if (existingItem) {
      inventoryMap.value[itemId] = Math.max(0, existingItem - amount)
      if (inventoryMap.value[itemId] === 0) {
        delete inventoryMap.value[itemId]
      }
    }
  }

  function removeManyItems(items: [string, number][]): void {
    for (const [itemId, amount] of items) {
      removeItem(itemId, amount)
    }
  }

  function getInventoryItem(itemId: string): InventoryItem | undefined {
    const count = inventoryMap.value[itemId]
    if (count !== undefined) {
      return { item: itemConfigMap[itemId], count }
    }
    return undefined
  }

  function hasItem(itemId: string, amount: number = 1): boolean {
    const inventoryCount = inventoryMap.value[itemId]
    return inventoryCount ? inventoryCount >= amount : false
  }

  function openChest(
    inventoryItem: InventoryItem,
    amount: number = 1,
  ): { itemId: string; amount: number }[] {
    const item = inventoryItem.item
    if (!item.chest) {
      log.error(`Item ${item.id} is not a chest`, { itemId: item.id })
      return []
    }

    const results: { itemId: string; amount: number }[] = []

    removeItem(inventoryItem.item.id, amount)

    for (let i = 0; i < amount; i++) {
      const lootResults = rollLoot(item.id)

      for (const { itemId, amount: lootAmount } of lootResults) {
        addItem(itemId, lootAmount)

        const existingResult = results.find((r) => r.itemId === itemId)
        if (existingResult) {
          existingResult.amount += lootAmount
        } else {
          results.push({ itemId, amount: lootAmount })
        }
      }
    }

    return results
  }

  return {
    inventoryItems,
    inventoryItemsByCategory,
    categoryStats,
    inventoryMap,

    addItem,
    addManyItems,
    removeItem,
    removeManyItems,
    getInventoryItem,
    hasItem,

    openChest,
  }
})

function randomIntInclusive(min: number, max: number): number {
  const lower = Math.ceil(min)
  const upper = Math.floor(max)
  return Math.floor(Math.random() * (upper - lower + 1)) + lower
}

export function rollLoot(chestId: string): { itemId: string; amount: number }[] {
  const results: { itemId: string; amount: number }[] = []
  const chestConfig = itemConfigMap[chestId]

  if (!chestConfig || !chestConfig.chest) return results

  for (const loot of chestConfig.chest.loots) {
    if (Math.random() <= loot.chance) {
      const amount = randomIntInclusive(loot.min, loot.max)
      results.push({ itemId: loot.itemId, amount })
    }
  }

  return results
}
