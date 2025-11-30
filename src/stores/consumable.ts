import { defineStore } from 'pinia'
import { ref } from 'vue'

import { itemConfigMap } from '@/gameConfig'
import {
  type SecondsFixed,
  toFixed,
  fpAdd,
  fpSub,
  fpMul,
  fpDiv,
  toSecondsFixed,
  fromSecondsFixed,
} from '@/utils/fixedPoint'
import log from '@/utils/log'

import { useInventoryStore } from './inventory'
import { useStatStore } from './stat'

interface ConsumableSlot {
  itemId: string | null
  remaining: SecondsFixed // 剩余时间（秒）
}

const SLOT_COUNT = 3 // 每个技能固定3个槽位

export const useConsumableStore = defineStore('consumable', () => {
  const inventoryStore = useInventoryStore()
  const statStore = useStatStore()

  // slotMap: { [skillId:string]: ConsumableSlot[] } - 每个技能3个槽位
  const slotMap = ref<Record<string, ConsumableSlot[]>>(Object.create(null))

  /**
   * 获取技能的消耗槽位（固定3个）
   */
  function getSlots(skillId: string): ConsumableSlot[] {
    if (!slotMap.value[skillId]) {
      slotMap.value[skillId] = Array.from({ length: SLOT_COUNT }, () => ({
        itemId: null,
        remaining: toSecondsFixed(0),
      }))
    }
    return slotMap.value[skillId]
  }

  /**
   * 获取某个 source 的总可用时间（秒）
   */
  function getTotalAvailableSecondsForSource(sourceId: string): SecondsFixed {
    // sourceId 格式: "consumable:skillId:slotIndex"
    const parts = sourceId.split(':')
    if (parts.length !== 3 || parts[0] !== 'consumable') return toFixed(0)

    const skillId = parts[1]
    const slotIndex = parseInt(parts[2])

    const slots = getSlots(skillId)
    const slot = slots[slotIndex]

    if (!slot || !slot.itemId) return toSecondsFixed(0)

    const item = itemConfigMap[slot.itemId]
    if (!item.consumable) return toSecondsFixed(0)

    const inventoryCount = inventoryStore.inventoryMap[slot.itemId] ?? 0
    return fpAdd(slot.remaining, fpMul(toFixed(inventoryCount), item.consumable.durationSeconds))
  }

  /**
   * 估算在消耗品限制下能执行的最大行动次数
   */
  function estimateBuffedCounts(skillId: string, actionDurationSeconds: SecondsFixed): number {
    const slots = getSlots(skillId)
    let minCount = Infinity

    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i]
      // 槽位为空，跳过（不限制）
      if (!slot.itemId) continue

      const totalAvailable = getTotalAvailableSecondsForSource(`consumable:${skillId}:${i}`)
      // 时间不足，跳过（buff不生效，不限制）
      if (totalAvailable < actionDurationSeconds) continue

      const count = Math.floor(fromSecondsFixed(fpDiv(totalAvailable, actionDurationSeconds)))
      minCount = Math.min(minCount, count)
    }

    // 如果所有槽位都被跳过了，返回 Infinity（不限制）
    return minCount === Infinity ? Infinity : minCount
  }

  /**
   * 消耗 buffs，返回需要从库存扣除的物品列表
   */
  function consumeBuffs(
    skillId: string,
    consumedDurationSeconds: SecondsFixed,
  ): [string, number][] {
    const itemsToRemove: [string, number][] = []
    const slots = getSlots(skillId)

    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i]
      if (!slot.itemId) continue

      const item = itemConfigMap[slot.itemId]
      if (!item.consumable) continue

      const totalAvailable = getTotalAvailableSecondsForSource(`consumable:${skillId}:${i}`)
      if (totalAvailable < consumedDurationSeconds) continue

      // 计算需要消耗多少瓶
      const usedBottles = Math.ceil(
        Math.max(0, fromSecondsFixed(fpSub(consumedDurationSeconds, slot.remaining))) /
          fromSecondsFixed(item.consumable.durationSeconds),
      )

      // 更新剩余时间
      slot.remaining = fpSub(
        fpAdd(slot.remaining, fpMul(toFixed(usedBottles), item.consumable.durationSeconds)),
        consumedDurationSeconds,
      )

      // 记录需要扣除的库存
      if (usedBottles > 0) {
        itemsToRemove.push([slot.itemId, usedBottles])
      }

      // 如果剩余时间为0，移除效果并清空槽位
      if (slot.remaining <= 0) {
        statStore.removeEffectsFromSource(`consumable:${skillId}:${i}`)
        slot.itemId = null
        slot.remaining = toFixed(0)
      }
    }

    return itemsToRemove
  }

  /**
   * 装入消耗品到指定槽位
   */
  function applyConsumable(skillId: string, slotIndex: number, itemId: string): boolean {
    const item = itemConfigMap[itemId]
    if (item.category !== 'consumable' || !item.consumable) {
      log.error(`Item ${itemId} is not a consumable`, { itemId, skillId, slotIndex })
      return false
    }

    // 从库存检查
    const inventoryCount = inventoryStore.inventoryMap[itemId] ?? 0
    if (inventoryCount <= 0) {
      log.error(`Not enough ${itemId} in inventory`, { itemId, skillId })
      return false
    }

    const slots = getSlots(skillId)
    if (slotIndex < 0 || slotIndex >= slots.length) {
      log.error(`Invalid slot index ${slotIndex}`, { slotIndex, skillId })
      return false
    }

    // 如果有相同类型的消耗品在其他槽位，先卸载
    const consumableType = item.consumable.consumableType
    if (consumableType) {
      for (let i = 0; i < slots.length; i++) {
        if (i === slotIndex) continue
        const otherSlot = slots[i]
        if (otherSlot.itemId) {
          const otherItem = itemConfigMap[otherSlot.itemId]
          if (otherItem.consumable?.consumableType === consumableType) {
            // 自动卸载冲突的消耗品
            statStore.removeEffectsFromSource(`consumable:${skillId}:${i}`)
            otherSlot.itemId = null
            otherSlot.remaining = toFixed(0)
          }
        }
      }
    }

    const slot = slots[slotIndex]

    // 如果已有不同物品，先移除
    if (slot.itemId && slot.itemId !== itemId) {
      statStore.removeEffectsFromSource(`consumable:${skillId}:${slotIndex}`)
      slot.itemId = null
      slot.remaining = toSecondsFixed(0)
    }

    // 解析模板 statId 并添加效果
    const parsedEffects = item.consumable.effects.map((effect) => ({
      statId: effect.statId.replace('{skill}', skillId),
      type: effect.type,
      value: effect.value,
    }))

    statStore.addEffectsFromSource(`consumable:${skillId}:${slotIndex}`, parsedEffects)

    // 设置槽位 - 装备时不扣库存，只清空剩余时间
    slot.itemId = itemId
    slot.remaining = toFixed(0)

    return true
  }

  /**
   * 移除槽位中的消耗品
   */
  function removeConsumable(skillId: string, slotIndex: number): void {
    const slots = getSlots(skillId)
    if (slotIndex < 0 || slotIndex >= slots.length) return

    const slot = slots[slotIndex]
    if (slot.itemId) {
      statStore.removeEffectsFromSource(`consumable:${skillId}:${slotIndex}`)
      slot.itemId = null
      slot.remaining = toSecondsFixed(0)
    }
  }

  return {
    slotMap,
    getSlots,
    getTotalAvailableSecondsForSource,
    estimateBuffedCounts,
    consumeBuffs,
    applyConsumable,
    removeConsumable,
  }
})
