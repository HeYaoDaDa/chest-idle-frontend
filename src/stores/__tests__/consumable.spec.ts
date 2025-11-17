import { setActivePinia, createPinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { toFixed } from '../../utils/fixedPoint'
import { useConsumableStore } from '../consumable'
import { useInventoryStore } from '../inventory'
import { useStatStore } from '../stat'

// Mock gameConfig
vi.mock('@/gameConfig', () => ({
  itemConfigMap: {
    strengthPotion: {
      id: 'strengthPotion',
      name: 'Strength Potion',
      category: 'consumable',
      consumable: {
        consumableType: 'strength',
        duration: toFixed(60000), // 60 seconds
        effects: [
          {
            statId: '{skill}:strength',
            type: 'flat',
            value: toFixed(10),
          },
        ],
      },
    },
    speedPotion: {
      id: 'speedPotion',
      name: 'Speed Potion',
      category: 'consumable',
      consumable: {
        consumableType: 'speed',
        duration: toFixed(30000), // 30 seconds
        effects: [
          {
            statId: '{skill}:speed',
            type: 'percentage',
            value: toFixed(0.2),
          },
        ],
      },
    },
    genericBuff: {
      id: 'genericBuff',
      name: 'Generic Buff',
      category: 'consumable',
      consumable: {
        consumableType: undefined,
        duration: toFixed(45000),
        effects: [
          {
            statId: '{skill}:generic',
            type: 'flat',
            value: toFixed(5),
          },
        ],
      },
    },
    notConsumable: {
      id: 'notConsumable',
      name: 'Not Consumable',
      category: 'resource',
    },
  },
}))

describe('Consumable Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('getSlots', () => {
    it('should initialize 3 empty slots for skill', () => {
      const consumableStore = useConsumableStore()

      const slots = consumableStore.getSlots('mining')

      expect(slots).toHaveLength(3)
      expect(slots[0].itemId).toBeNull()
      expect(slots[0].remaining).toBe(toFixed(0))
    })

    it('should return same slots on repeated calls', () => {
      const consumableStore = useConsumableStore()

      const slots1 = consumableStore.getSlots('mining')
      const slots2 = consumableStore.getSlots('mining')

      expect(slots1).toBe(slots2)
    })

    it('should have independent slots for different skills', () => {
      const consumableStore = useConsumableStore()

      const miningSlots = consumableStore.getSlots('mining')
      const foragingSlots = consumableStore.getSlots('foraging')

      expect(miningSlots).not.toBe(foragingSlots)
    })
  })

  describe('getTotalAvailableMsForSource', () => {
    it('should return 0 for empty slot', () => {
      const consumableStore = useConsumableStore()

      const available = consumableStore.getTotalAvailableMsForSource('consumable:mining:0')

      expect(available).toBe(toFixed(0))
    })

    it('should return 0 for invalid source format', () => {
      const consumableStore = useConsumableStore()

      const available = consumableStore.getTotalAvailableMsForSource('invalid')

      expect(available).toBe(toFixed(0))
    })

    it('should return 0 for non-consumable source', () => {
      const consumableStore = useConsumableStore()

      const available = consumableStore.getTotalAvailableMsForSource('equipment:mining:0')

      expect(available).toBe(toFixed(0))
    })

    it('should calculate available time from slot remaining + inventory', () => {
      const consumableStore = useConsumableStore()
      const inventoryStore = useInventoryStore()

      // Set up inventory with 5 strength potions
      inventoryStore.inventoryMap = { strengthPotion: 5 }

      // Apply consumable to slot
      consumableStore.applyConsumable('mining', 0, 'strengthPotion')

      // Set remaining time to 10000ms
      const slots = consumableStore.getSlots('mining')
      slots[0].remaining = toFixed(10000)

      const available = consumableStore.getTotalAvailableMsForSource('consumable:mining:0')

      // 10000 (remaining) + 5 * 60000 (inventory) = 310000
      expect(available).toBe(toFixed(310000))
    })
  })

  describe('estimateBuffedCounts', () => {
    it('should return Infinity when no consumables in slots', () => {
      const consumableStore = useConsumableStore()

      const count = consumableStore.estimateBuffedCounts('mining', toFixed(5000))

      expect(count).toBe(Infinity)
    })

    it('should return Infinity when all slots have insufficient time', () => {
      const consumableStore = useConsumableStore()
      const inventoryStore = useInventoryStore()

      inventoryStore.inventoryMap = { strengthPotion: 0 }
      consumableStore.applyConsumable('mining', 0, 'strengthPotion')

      // Slot has 0 inventory and 0 remaining
      const count = consumableStore.estimateBuffedCounts('mining', toFixed(5000))

      expect(count).toBe(Infinity)
    })

    it('should calculate max count based on single consumable', () => {
      const consumableStore = useConsumableStore()
      const inventoryStore = useInventoryStore()

      // 3 potions * 60000ms = 180000ms
      inventoryStore.inventoryMap = { strengthPotion: 3 }
      consumableStore.applyConsumable('mining', 0, 'strengthPotion')

      // Action duration: 5000ms
      // Max count: 180000 / 5000 = 36
      const count = consumableStore.estimateBuffedCounts('mining', toFixed(5000))

      expect(count).toBe(36)
    })

    it('should return minimum count when multiple consumables', () => {
      const consumableStore = useConsumableStore()
      const inventoryStore = useInventoryStore()

      // Strength: 3 * 60000 = 180000ms (36 actions)
      // Speed: 10 * 30000 = 300000ms (60 actions)
      inventoryStore.inventoryMap = { strengthPotion: 3, speedPotion: 10 }

      consumableStore.applyConsumable('mining', 0, 'strengthPotion')
      consumableStore.applyConsumable('mining', 1, 'speedPotion')

      // Should be limited by strength potion (36)
      const count = consumableStore.estimateBuffedCounts('mining', toFixed(5000))

      expect(count).toBe(36)
    })

    it('should ignore empty slots when calculating minimum', () => {
      const consumableStore = useConsumableStore()
      const inventoryStore = useInventoryStore()

      inventoryStore.inventoryMap = { strengthPotion: 3 }

      consumableStore.applyConsumable('mining', 0, 'strengthPotion')
      // Slots 1 and 2 are empty

      const count = consumableStore.estimateBuffedCounts('mining', toFixed(5000))

      expect(count).toBe(36)
    })
  })

  describe('consumeBuffs', () => {
    it('should return empty array when no consumables', () => {
      const consumableStore = useConsumableStore()

      const itemsToRemove = consumableStore.consumeBuffs('mining', toFixed(5000))

      expect(itemsToRemove).toEqual([])
    })

    it('should consume from remaining time without removing items', () => {
      const consumableStore = useConsumableStore()
      const inventoryStore = useInventoryStore()

      inventoryStore.inventoryMap = { strengthPotion: 5 }
      consumableStore.applyConsumable('mining', 0, 'strengthPotion')

      const slots = consumableStore.getSlots('mining')
      slots[0].remaining = toFixed(10000)

      const itemsToRemove = consumableStore.consumeBuffs('mining', toFixed(5000))

      expect(itemsToRemove).toEqual([])
      expect(slots[0].remaining).toBe(toFixed(5000))
    })

    it('should consume items when remaining time is insufficient', () => {
      const consumableStore = useConsumableStore()
      const inventoryStore = useInventoryStore()

      inventoryStore.inventoryMap = { strengthPotion: 5 }
      consumableStore.applyConsumable('mining', 0, 'strengthPotion')

      const slots = consumableStore.getSlots('mining')
      slots[0].remaining = toFixed(10000)

      // Consume 50000ms (need 1 bottle from inventory)
      const itemsToRemove = consumableStore.consumeBuffs('mining', toFixed(50000))

      expect(itemsToRemove).toEqual([['strengthPotion', 1]])
      expect(slots[0].remaining).toBe(toFixed(20000)) // 10000 + 60000 - 50000
    })

    it('should consume multiple items when needed', () => {
      const consumableStore = useConsumableStore()
      const inventoryStore = useInventoryStore()

      inventoryStore.inventoryMap = { strengthPotion: 5 }
      consumableStore.applyConsumable('mining', 0, 'strengthPotion')

      const slots = consumableStore.getSlots('mining')
      slots[0].remaining = toFixed(10000)

      // Consume 150000ms (need 3 bottles)
      const itemsToRemove = consumableStore.consumeBuffs('mining', toFixed(150000))

      expect(itemsToRemove).toEqual([['strengthPotion', 3]])
      expect(slots[0].remaining).toBe(toFixed(40000)) // 10000 + 180000 - 150000
    })

    it('should clear slot when remaining time reaches 0', () => {
      const consumableStore = useConsumableStore()
      const inventoryStore = useInventoryStore()
      const statStore = useStatStore()

      inventoryStore.inventoryMap = { strengthPotion: 5 }
      consumableStore.applyConsumable('mining', 0, 'strengthPotion')

      const slots = consumableStore.getSlots('mining')
      slots[0].remaining = toFixed(10000)

      const removeEffectsSpy = vi.spyOn(statStore, 'removeEffectsFromSource')

      // Consume exactly 10000ms
      consumableStore.consumeBuffs('mining', toFixed(10000))

      expect(removeEffectsSpy).toHaveBeenCalledWith('consumable:mining:0')
      expect(slots[0].itemId).toBeNull()
      expect(slots[0].remaining).toBe(toFixed(0))
    })

    it('should skip slots with insufficient total time', () => {
      const consumableStore = useConsumableStore()
      const inventoryStore = useInventoryStore()

      inventoryStore.inventoryMap = { strengthPotion: 0 }
      consumableStore.applyConsumable('mining', 0, 'strengthPotion')

      // Slot has 0 inventory, trying to consume 5000ms
      const itemsToRemove = consumableStore.consumeBuffs('mining', toFixed(5000))

      expect(itemsToRemove).toEqual([])
    })

    it('should consume from multiple slots independently', () => {
      const consumableStore = useConsumableStore()
      const inventoryStore = useInventoryStore()

      inventoryStore.inventoryMap = { strengthPotion: 5, speedPotion: 10 }

      consumableStore.applyConsumable('mining', 0, 'strengthPotion')
      consumableStore.applyConsumable('mining', 1, 'speedPotion')

      const slots = consumableStore.getSlots('mining')
      slots[0].remaining = toFixed(10000)
      slots[1].remaining = toFixed(5000)

      // Consume 40000ms
      const itemsToRemove = consumableStore.consumeBuffs('mining', toFixed(40000))

      // Strength: needs 1 bottle (10000 + 60000 - 40000 = 30000 remaining)
      // Speed: needs 2 bottles (5000 + 60000 - 40000 = 25000 remaining)
      expect(itemsToRemove).toContainEqual(['strengthPotion', 1])
      expect(itemsToRemove).toContainEqual(['speedPotion', 2])
    })
  })

  describe('applyConsumable', () => {
    it('should return false for non-consumable item', () => {
      const consumableStore = useConsumableStore()

      const result = consumableStore.applyConsumable('mining', 0, 'notConsumable')

      expect(result).toBe(false)
    })

    it('should return false when item not in inventory', () => {
      const consumableStore = useConsumableStore()
      const inventoryStore = useInventoryStore()

      inventoryStore.inventoryMap = {}

      const result = consumableStore.applyConsumable('mining', 0, 'strengthPotion')

      expect(result).toBe(false)
    })

    it('should return false for invalid slot index', () => {
      const consumableStore = useConsumableStore()
      const inventoryStore = useInventoryStore()

      inventoryStore.inventoryMap = { strengthPotion: 5 }

      const result1 = consumableStore.applyConsumable('mining', -1, 'strengthPotion')
      const result2 = consumableStore.applyConsumable('mining', 3, 'strengthPotion')

      expect(result1).toBe(false)
      expect(result2).toBe(false)
    })

    it('should apply consumable to empty slot', () => {
      const consumableStore = useConsumableStore()
      const inventoryStore = useInventoryStore()
      const statStore = useStatStore()

      inventoryStore.inventoryMap = { strengthPotion: 5 }

      const addEffectsSpy = vi.spyOn(statStore, 'addEffectsFromSource')

      const result = consumableStore.applyConsumable('mining', 0, 'strengthPotion')

      expect(result).toBe(true)

      const slots = consumableStore.getSlots('mining')
      expect(slots[0].itemId).toBe('strengthPotion')
      expect(slots[0].remaining).toBe(toFixed(0))

      expect(addEffectsSpy).toHaveBeenCalledWith('consumable:mining:0', [
        {
          statId: 'mining:strength',
          type: 'flat',
          value: toFixed(10),
        },
      ])
    })

    it('should replace template {skill} in effect statId', () => {
      const consumableStore = useConsumableStore()
      const inventoryStore = useInventoryStore()
      const statStore = useStatStore()

      inventoryStore.inventoryMap = { strengthPotion: 5 }

      const addEffectsSpy = vi.spyOn(statStore, 'addEffectsFromSource')

      consumableStore.applyConsumable('foraging', 1, 'strengthPotion')

      expect(addEffectsSpy).toHaveBeenCalledWith('consumable:foraging:1', [
        {
          statId: 'foraging:strength',
          type: 'flat',
          value: toFixed(10),
        },
      ])
    })

    it('should remove old consumable when applying new one to same slot', () => {
      const consumableStore = useConsumableStore()
      const inventoryStore = useInventoryStore()
      const statStore = useStatStore()

      inventoryStore.inventoryMap = { strengthPotion: 5, speedPotion: 5 }

      consumableStore.applyConsumable('mining', 0, 'strengthPotion')

      const removeEffectsSpy = vi.spyOn(statStore, 'removeEffectsFromSource')

      // Apply different consumable to same slot
      consumableStore.applyConsumable('mining', 0, 'speedPotion')

      expect(removeEffectsSpy).toHaveBeenCalledWith('consumable:mining:0')

      const slots = consumableStore.getSlots('mining')
      expect(slots[0].itemId).toBe('speedPotion')
    })

    it('should not remove effects when applying same consumable', () => {
      const consumableStore = useConsumableStore()
      const inventoryStore = useInventoryStore()
      const statStore = useStatStore()

      inventoryStore.inventoryMap = { strengthPotion: 5 }

      consumableStore.applyConsumable('mining', 0, 'strengthPotion')

      const removeEffectsSpy = vi.spyOn(statStore, 'removeEffectsFromSource')

      // Apply same consumable again
      consumableStore.applyConsumable('mining', 0, 'strengthPotion')

      // Should not call removeEffectsFromSource since it's the same item
      expect(removeEffectsSpy).not.toHaveBeenCalled()
    })

    it('should unload conflicting consumable type from other slots', () => {
      const consumableStore = useConsumableStore()
      const inventoryStore = useInventoryStore()
      const statStore = useStatStore()

      inventoryStore.inventoryMap = { strengthPotion: 10 }

      // Apply strength potion to slot 0
      consumableStore.applyConsumable('mining', 0, 'strengthPotion')

      const removeEffectsSpy = vi.spyOn(statStore, 'removeEffectsFromSource')

      // Apply same type to slot 1 - should remove from slot 0
      consumableStore.applyConsumable('mining', 1, 'strengthPotion')

      expect(removeEffectsSpy).toHaveBeenCalledWith('consumable:mining:0')

      const slots = consumableStore.getSlots('mining')
      expect(slots[0].itemId).toBeNull()
      expect(slots[1].itemId).toBe('strengthPotion')
    })

    it('should allow multiple consumables with no consumableType', () => {
      const consumableStore = useConsumableStore()
      const inventoryStore = useInventoryStore()

      inventoryStore.inventoryMap = { genericBuff: 10 }

      consumableStore.applyConsumable('mining', 0, 'genericBuff')
      consumableStore.applyConsumable('mining', 1, 'genericBuff')

      const slots = consumableStore.getSlots('mining')
      expect(slots[0].itemId).toBe('genericBuff')
      expect(slots[1].itemId).toBe('genericBuff')
    })

    it('should reset remaining time when applying consumable', () => {
      const consumableStore = useConsumableStore()
      const inventoryStore = useInventoryStore()

      inventoryStore.inventoryMap = { strengthPotion: 10 }

      consumableStore.applyConsumable('mining', 0, 'strengthPotion')

      const slots = consumableStore.getSlots('mining')
      slots[0].remaining = toFixed(30000)

      // Reapply same consumable
      consumableStore.applyConsumable('mining', 0, 'strengthPotion')

      // Remaining should be reset to 0
      expect(slots[0].remaining).toBe(toFixed(0))
    })
  })

  describe('removeConsumable', () => {
    it('should remove consumable from slot', () => {
      const consumableStore = useConsumableStore()
      const inventoryStore = useInventoryStore()
      const statStore = useStatStore()

      inventoryStore.inventoryMap = { strengthPotion: 5 }

      consumableStore.applyConsumable('mining', 0, 'strengthPotion')

      const removeEffectsSpy = vi.spyOn(statStore, 'removeEffectsFromSource')

      consumableStore.removeConsumable('mining', 0)

      expect(removeEffectsSpy).toHaveBeenCalledWith('consumable:mining:0')

      const slots = consumableStore.getSlots('mining')
      expect(slots[0].itemId).toBeNull()
      expect(slots[0].remaining).toBe(toFixed(0))
    })

    it('should do nothing for empty slot', () => {
      const consumableStore = useConsumableStore()
      const statStore = useStatStore()

      const removeEffectsSpy = vi.spyOn(statStore, 'removeEffectsFromSource')

      consumableStore.removeConsumable('mining', 0)

      expect(removeEffectsSpy).not.toHaveBeenCalled()
    })

    it('should do nothing for invalid slot index', () => {
      const consumableStore = useConsumableStore()

      consumableStore.removeConsumable('mining', -1)
      consumableStore.removeConsumable('mining', 5)

      // Should not throw error
    })
  })

  describe('integration scenarios', () => {
    it('should handle full workflow: apply, estimate, consume, remove', () => {
      const consumableStore = useConsumableStore()
      const inventoryStore = useInventoryStore()

      inventoryStore.inventoryMap = { strengthPotion: 3 }

      // Apply consumable
      consumableStore.applyConsumable('mining', 0, 'strengthPotion')

      // Estimate buffed counts (3 * 60000 / 5000 = 36)
      const estimate = consumableStore.estimateBuffedCounts('mining', toFixed(5000))
      expect(estimate).toBe(36)

      // Consume some buffs
      const itemsToRemove = consumableStore.consumeBuffs('mining', toFixed(100000))
      expect(itemsToRemove).toEqual([['strengthPotion', 2]])

      // Remove consumable
      consumableStore.removeConsumable('mining', 0)

      const slots = consumableStore.getSlots('mining')
      expect(slots[0].itemId).toBeNull()
    })
  })
})
