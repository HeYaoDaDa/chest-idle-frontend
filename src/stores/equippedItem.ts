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
   * 获取装备配置的实际占用槽位
   */
  function getOccupiedSlots(itemId: string): string[] {
    const item = itemConfigMap[itemId]
    if (!item.equipment) return []

    // 如果有显式声明，使用显式声明
    // 否则默认为 [slotId]
    return item.equipment.occupiedSlots ?? [item.equipment.slotId]
  }

  /**
   * 检查槽位是否有冲突
   * @returns 返回需要卸载的槽位列表（去重）
   */
  function getConflictingSlots(itemId: string): string[] {
    const targetSlots = getOccupiedSlots(itemId)
    const conflicts: string[] = []

    for (const slotId of targetSlots) {
      const currentItem = getEquippedItem(slotId)
      if (currentItem) {
        // 找到该装备占用的所有槽位
        const currentOccupiedSlots = getOccupiedSlots(currentItem)
        conflicts.push(...currentOccupiedSlots)
      }
    }

    // 去重
    return [...new Set(conflicts)]
  }

  /**
   * 内部方法：卸载但不返还背包（用于装备切换）
   */
  function unequipSlotInternal(slotId: string): void {
    const itemId = getEquippedItem(slotId)
    if (!itemId) return

    const occupiedSlots = getOccupiedSlots(itemId)
    for (const slot of occupiedSlots) {
      clearEquippedItem(slot)
    }

    const item = itemConfigMap[itemId]
    if (item.equipment) {
      statStore.removeEffectsFromSource(`equipment:${item.equipment.slotId}`)
    }

    inventoryStore.addItem(itemId, 1)
  }

  /**
   * 装备物品（智能处理冲突）
   */
  function equipItem(itemId: string): void {
    const itemConfig = itemConfigMap[itemId]
    if (itemConfig.category !== 'equipment' || !itemConfig.equipment) {
      log.error(`Item ${itemConfig.id} is not equipment`, { itemId: itemConfig.id })
      return
    }

    // 1. 检测冲突并自动卸载
    const conflictingSlots = getConflictingSlots(itemId)
    for (const slotId of conflictingSlots) {
      unequipSlotInternal(slotId)
    }

    // 2. 装备到所有目标槽位
    const targetSlots = getOccupiedSlots(itemId)
    for (const slotId of targetSlots) {
      setEquippedItem(slotId, itemId)
    }

    // 3. 应用属性加成（只应用一次）
    if (itemConfig.equipment.effects && itemConfig.equipment.effects.length > 0) {
      const effects = itemConfig.equipment.effects.map((effect) => ({
        statId: effect.statId,
        type: effect.type,
        value: effect.value,
      }))
      // 使用主槽位作为 source ID
      statStore.addEffectsFromSource(`equipment:${itemConfig.equipment.slotId}`, effects)
    }

    // 4. 从背包移除
    inventoryStore.removeItem(itemId, 1)
  }

  /**
   * 卸载槽位（智能处理多槽位装备）
   */
  function unequipSlot(slotId: string): void {
    const itemId = getEquippedItem(slotId)
    if (!itemId) return

    // 找到该装备占用的所有槽位
    const occupiedSlots = getOccupiedSlots(itemId)

    // 清空所有占用的槽位
    for (const slot of occupiedSlots) {
      clearEquippedItem(slot)
    }

    // 移除属性加成
    const item = itemConfigMap[itemId]
    if (item.equipment) {
      statStore.removeEffectsFromSource(`equipment:${item.equipment.slotId}`)
    }

    // 归还到背包
    inventoryStore.addItem(itemId, 1)
  }

  return {
    equippedItems,
    equippedBySlot,
    getEquippedItem,
    setEquippedItem,
    clearEquippedItem,
    getOccupiedSlots,
    getConflictingSlots,
    equipItem,
    unequipSlot,
  }
})

