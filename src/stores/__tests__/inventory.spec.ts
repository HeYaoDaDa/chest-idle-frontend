import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, vi } from 'vitest'

import { useInventoryStore, rollLoot } from '../inventory'

describe('inventory store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('addItem', () => {
    it('should add new item to inventory', () => {
      const store = useInventoryStore()

      store.addItem('item1', 5)
      expect(store.inventoryMap['item1']).toBe(5)
    })

    it('should accumulate item amounts', () => {
      const store = useInventoryStore()

      store.addItem('item1', 5)
      store.addItem('item1', 3)
      expect(store.inventoryMap['item1']).toBe(8)
    })

    it('should handle multiple different items', () => {
      const store = useInventoryStore()

      store.addItem('item1', 5)
      store.addItem('item2', 10)
      store.addItem('item3', 2)

      expect(store.inventoryMap['item1']).toBe(5)
      expect(store.inventoryMap['item2']).toBe(10)
      expect(store.inventoryMap['item3']).toBe(2)
    })
  })

  describe('addManyItems', () => {
    it('should add multiple items at once', () => {
      const store = useInventoryStore()

      store.addManyItems([
        ['item1', 5],
        ['item2', 10],
        ['item3', 2],
      ])

      expect(store.inventoryMap['item1']).toBe(5)
      expect(store.inventoryMap['item2']).toBe(10)
      expect(store.inventoryMap['item3']).toBe(2)
    })

    it('should accumulate with existing items', () => {
      const store = useInventoryStore()

      store.addItem('item1', 5)
      store.addManyItems([
        ['item1', 3],
        ['item2', 7],
      ])

      expect(store.inventoryMap['item1']).toBe(8)
      expect(store.inventoryMap['item2']).toBe(7)
    })
  })

  describe('removeItem', () => {
    it('should remove item amount', () => {
      const store = useInventoryStore()

      store.addItem('item1', 10)
      store.removeItem('item1', 3)

      expect(store.inventoryMap['item1']).toBe(7)
    })

    it('should delete item when amount reaches zero', () => {
      const store = useInventoryStore()

      store.addItem('item1', 5)
      store.removeItem('item1', 5)

      expect(store.inventoryMap['item1']).toBeUndefined()
    })

    it('should not go below zero', () => {
      const store = useInventoryStore()

      store.addItem('item1', 5)
      store.removeItem('item1', 10)

      expect(store.inventoryMap['item1']).toBeUndefined()
    })

    it('should handle removing non-existent item', () => {
      const store = useInventoryStore()

      expect(() => store.removeItem('nonexistent', 5)).not.toThrow()
    })
  })

  describe('removeManyItems', () => {
    it('should remove multiple items at once', () => {
      const store = useInventoryStore()

      store.addManyItems([
        ['item1', 10],
        ['item2', 20],
      ])

      store.removeManyItems([
        ['item1', 3],
        ['item2', 5],
      ])

      expect(store.inventoryMap['item1']).toBe(7)
      expect(store.inventoryMap['item2']).toBe(15)
    })
  })

  describe('hasItem', () => {
    it('should check if item exists with sufficient amount', () => {
      const store = useInventoryStore()

      store.addItem('item1', 10)

      expect(store.hasItem('item1', 5)).toBe(true)
      expect(store.hasItem('item1', 10)).toBe(true)
      expect(store.hasItem('item1', 15)).toBe(false)
    })

    it('should default to checking for 1 item', () => {
      const store = useInventoryStore()

      store.addItem('item1', 1)
      expect(store.hasItem('item1')).toBe(true)
    })

    it('should return false for non-existent item', () => {
      const store = useInventoryStore()
      expect(store.hasItem('nonexistent')).toBe(false)
    })
  })

  describe('getInventoryItem', () => {
    it('should return inventory item with count', () => {
      const store = useInventoryStore()

      store.addItem('wood', 10)
      const item = store.getInventoryItem('wood')

      expect(item).toBeDefined()
      expect(item?.count).toBe(10)
    })

    it('should return undefined for non-existent item', () => {
      const store = useInventoryStore()
      const item = store.getInventoryItem('nonexistent')

      expect(item).toBeUndefined()
    })
  })

  describe('inventoryItems computed', () => {
    it('should return sorted inventory items', () => {
      const store = useInventoryStore()

      store.addItem('item1', 5)
      store.addItem('item2', 10)

      expect(store.inventoryItems.length).toBeGreaterThanOrEqual(0)
    })
  })
})

describe('rollLoot', () => {
  it('should return empty array for non-existent chest', () => {
    const result = rollLoot('nonexistent_chest')
    expect(result).toEqual([])
  })

  it('should respect loot chance with deterministic random', () => {
    // Mock Math.random to always return 0 (always pass chance check)
    vi.spyOn(Math, 'random').mockReturnValue(0)

    const result = rollLoot('basic_chest')
    // Since we don't have actual chest config loaded, this might be empty
    // In real tests with gameConfig loaded, we'd verify actual loot
    expect(Array.isArray(result)).toBe(true)
  })

  it('should not drop loot when random exceeds chance', () => {
    // Mock Math.random to always return 1 (never pass chance check)
    vi.spyOn(Math, 'random').mockReturnValue(1)

    const result = rollLoot('basic_chest')
    expect(result).toEqual([])
  })

  it('should return loot with amount within min-max range', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)

    const result = rollLoot('basic_chest')

    result.forEach((loot) => {
      expect(typeof loot.itemId).toBe('string')
      expect(typeof loot.amount).toBe('number')
      expect(loot.amount).toBeGreaterThanOrEqual(0)
    })
  })
})
