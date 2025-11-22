import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { itemConfigMap, slotConfigs } from '@/gameConfig'
import log from '@/utils/log'

import { useInventoryStore } from './inventory'
import { useStatStore } from './stat'

export const useEquippedItemStore = defineStore('equippedItem', () => {
  const inventoryStore = useInventoryStore()
  const statStore = useStatStore()
  const equippedItems = ref<Record<string, string | null>>(Object.create(null))

  function getEquippedItem(slotId: string): string | null {
    return equippedItems.value[slotId] ?? null
  }

  function setEquippedItem(slotId: string, equipmentId: string | null): void {
    equippedItems.value[slotId] = equipmentId
  }

  function clearEquippedItem(slotId: string): void {
    equippedItems.value[slotId] = null
  }

  const equippedBySlot = computed<Record<string, string | null>>(() => {
    const map: Record<string, string | null> = {}
    for (const slot of slotConfigs) {
      map[slot.id] = getEquippedItem(slot.id)
    }
    return map
  })

  /**
   * Equip an item to the corresponding slot: update stat effects and inventory.
   */
  function equipItem(itemId: string): void {
    const itemConfig = itemConfigMap[itemId]
    if (itemConfig.category !== 'equipment' || !itemConfig.equipment) {
      log.error(`Item ${itemConfig.id} is not equipment`, { itemId: itemConfig.id })
      return
    }

    const slotId = itemConfig.equipment.slotId

    unequipSlot(slotId)

    if (itemConfig.equipment.effects && itemConfig.equipment.effects.length > 0) {
      const effects = itemConfig.equipment.effects.map((effect) => ({
        statId: effect.statId,
        type: effect.type,
        value: effect.value,
      }))
      statStore.addEffectsFromSource(`equipment:${slotId}`, effects)
    }

    setEquippedItem(slotId, itemConfig.id)

    inventoryStore.removeItem(itemConfig.id, 1)
  }

  function unequipSlot(slotId: string): void {
    const currentEquipment = getEquippedItem(slotId)

    if (currentEquipment) {
      statStore.removeEffectsFromSource(`equipment:${slotId}`)

      clearEquippedItem(slotId)

      inventoryStore.addItem(currentEquipment, 1)
    }
  }

  return {
    equippedItems,
    equippedBySlot,
    getEquippedItem,
    setEquippedItem,
    clearEquippedItem,
    equipItem,
    unequipSlot,
  }
})
