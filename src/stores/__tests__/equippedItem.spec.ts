import { setActivePinia, createPinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useEquippedItemStore } from '../equippedItem'
import { useInventoryStore } from '../inventory'
import { useStatStore } from '../stat'

// Mock gameConfig
vi.mock('@/gameConfig', () => ({
  itemConfigMap: {
    ironSword: {
      id: 'ironSword',
      name: 'Iron Sword',
      category: 'equipment',
      equipment: {
        slotId: 'weapon',
        effects: [
          { statId: 'strength', type: 'flat', value: 10000 }, // 10 * 1000
        ],
      },
    },
    ironArmor: {
      id: 'ironArmor',
      name: 'Iron Armor',
      category: 'equipment',
      equipment: {
        slotId: 'armor',
        effects: [
          { statId: 'defense', type: 'flat', value: 5000 }, // 5 * 1000
        ],
      },
    },
    betterSword: {
      id: 'betterSword',
      name: 'Better Sword',
      category: 'equipment',
      equipment: {
        slotId: 'weapon',
        effects: [
          { statId: 'strength', type: 'flat', value: 20000 }, // 20 * 1000
        ],
      },
    },
    noEffectItem: {
      id: 'noEffectItem',
      name: 'No Effect Item',
      category: 'equipment',
      equipment: {
        slotId: 'accessory',
        effects: [],
      },
    },
    notEquipment: {
      id: 'notEquipment',
      name: 'Not Equipment',
      category: 'resource',
    },
  },
  slotConfigs: [
    { id: 'weapon', name: 'Weapon Slot' },
    { id: 'armor', name: 'Armor Slot' },
    { id: 'accessory', name: 'Accessory Slot' },
  ],
}))

describe('EquippedItem Store', () => {
  let equippedItemStore: ReturnType<typeof useEquippedItemStore>
  let inventoryStore: ReturnType<typeof useInventoryStore>
  let statStore: ReturnType<typeof useStatStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    equippedItemStore = useEquippedItemStore()
    inventoryStore = useInventoryStore()
    statStore = useStatStore()
  })

  describe('getEquippedItem', () => {
    it('should return null for empty slot', () => {
      expect(equippedItemStore.getEquippedItem('weapon')).toBeNull()
    })

    it('should return equipped item id', () => {
      equippedItemStore.setEquippedItem('weapon', 'ironSword')
      expect(equippedItemStore.getEquippedItem('weapon')).toBe('ironSword')
    })
  })

  describe('setEquippedItem', () => {
    it('should set equipped item', () => {
      equippedItemStore.setEquippedItem('weapon', 'ironSword')
      expect(equippedItemStore.equippedItems.weapon).toBe('ironSword')
    })

    it('should overwrite previous item', () => {
      equippedItemStore.setEquippedItem('weapon', 'ironSword')
      equippedItemStore.setEquippedItem('weapon', 'betterSword')
      expect(equippedItemStore.equippedItems.weapon).toBe('betterSword')
    })

    it('should set to null', () => {
      equippedItemStore.setEquippedItem('weapon', 'ironSword')
      equippedItemStore.setEquippedItem('weapon', null)
      expect(equippedItemStore.equippedItems.weapon).toBeNull()
    })
  })

  describe('clearEquippedItem', () => {
    it('should clear equipped item', () => {
      equippedItemStore.setEquippedItem('weapon', 'ironSword')
      equippedItemStore.clearEquippedItem('weapon')
      expect(equippedItemStore.equippedItems.weapon).toBeNull()
    })

    it('should handle clearing empty slot', () => {
      equippedItemStore.clearEquippedItem('weapon')
      expect(equippedItemStore.equippedItems.weapon).toBeNull()
    })
  })

  describe('equippedBySlot', () => {
    it('should return map of all slots', () => {
      const bySlot = equippedItemStore.equippedBySlot
      expect(bySlot).toHaveProperty('weapon')
      expect(bySlot).toHaveProperty('armor')
      expect(bySlot).toHaveProperty('accessory')
    })

    it('should be reactive', () => {
      let bySlot = equippedItemStore.equippedBySlot
      expect(bySlot.weapon).toBeNull()

      equippedItemStore.setEquippedItem('weapon', 'ironSword')
      bySlot = equippedItemStore.equippedBySlot
      expect(bySlot.weapon).toBe('ironSword')
    })
  })

  describe('equipItem', () => {
    it('should equip item to correct slot', () => {
      inventoryStore.addItem('ironSword', 1)

      equippedItemStore.equipItem('ironSword')

      expect(equippedItemStore.getEquippedItem('weapon')).toBe('ironSword')
    })

    it('should remove item from inventory', () => {
      inventoryStore.addItem('ironSword', 2)

      equippedItemStore.equipItem('ironSword')

      expect(inventoryStore.inventoryMap.ironSword).toBe(1)
    })

    it('should add stat effects', () => {
      inventoryStore.addItem('ironSword', 1)
      const addEffectsSpy = vi.spyOn(statStore, 'addEffectsFromSource')

      equippedItemStore.equipItem('ironSword')

      expect(addEffectsSpy).toHaveBeenCalledWith('equipment:weapon', [
        { statId: 'strength', type: 'flat', value: 10000 },
      ])
    })

    it('should unequip previous item in same slot', () => {
      inventoryStore.addItem('ironSword', 1)
      inventoryStore.addItem('betterSword', 1)

      equippedItemStore.equipItem('ironSword')
      expect(equippedItemStore.getEquippedItem('weapon')).toBe('ironSword')

      equippedItemStore.equipItem('betterSword')
      expect(equippedItemStore.getEquippedItem('weapon')).toBe('betterSword')
      expect(inventoryStore.inventoryMap.ironSword).toBe(1) // returned to inventory
    })

    it('should handle item with no effects', () => {
      inventoryStore.addItem('noEffectItem', 1)

      equippedItemStore.equipItem('noEffectItem')

      expect(equippedItemStore.getEquippedItem('accessory')).toBe('noEffectItem')
      expect(inventoryStore.inventoryMap.noEffectItem).toBeUndefined()
    })

    it('should handle non-equipment item gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      equippedItemStore.equipItem('notEquipment')

      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('is not equipment'))
      consoleErrorSpy.mockRestore()
    })

    it('should handle multiple slots independently', () => {
      inventoryStore.addItem('ironSword', 1)
      inventoryStore.addItem('ironArmor', 1)

      equippedItemStore.equipItem('ironSword')
      equippedItemStore.equipItem('ironArmor')

      expect(equippedItemStore.getEquippedItem('weapon')).toBe('ironSword')
      expect(equippedItemStore.getEquippedItem('armor')).toBe('ironArmor')
    })
  })

  describe('unequipSlot', () => {
    it('should remove equipped item', () => {
      inventoryStore.addItem('ironSword', 1)
      equippedItemStore.equipItem('ironSword')

      equippedItemStore.unequipSlot('weapon')

      expect(equippedItemStore.getEquippedItem('weapon')).toBeNull()
    })

    it('should return item to inventory', () => {
      inventoryStore.addItem('ironSword', 1)
      equippedItemStore.equipItem('ironSword')

      equippedItemStore.unequipSlot('weapon')

      expect(inventoryStore.inventoryMap.ironSword).toBe(1)
    })

    it('should remove stat effects', () => {
      inventoryStore.addItem('ironSword', 1)
      equippedItemStore.equipItem('ironSword')

      const removeEffectsSpy = vi.spyOn(statStore, 'removeEffectsFromSource')
      equippedItemStore.unequipSlot('weapon')

      expect(removeEffectsSpy).toHaveBeenCalledWith('equipment:weapon')
    })

    it('should handle unequipping empty slot', () => {
      equippedItemStore.unequipSlot('weapon')
      expect(equippedItemStore.getEquippedItem('weapon')).toBeNull()
    })

    it('should not affect other slots', () => {
      inventoryStore.addItem('ironSword', 1)
      inventoryStore.addItem('ironArmor', 1)
      equippedItemStore.equipItem('ironSword')
      equippedItemStore.equipItem('ironArmor')

      equippedItemStore.unequipSlot('weapon')

      expect(equippedItemStore.getEquippedItem('weapon')).toBeNull()
      expect(equippedItemStore.getEquippedItem('armor')).toBe('ironArmor')
    })
  })

  describe('equip/unequip workflow', () => {
    it('should handle full equip and unequip cycle', () => {
      inventoryStore.addItem('ironSword', 1)

      // Start: 1 in inventory, 0 equipped
      expect(inventoryStore.inventoryMap.ironSword).toBe(1)
      expect(equippedItemStore.getEquippedItem('weapon')).toBeNull()

      // Equip: 0 in inventory, 1 equipped
      equippedItemStore.equipItem('ironSword')
      expect(inventoryStore.inventoryMap.ironSword).toBeUndefined()
      expect(equippedItemStore.getEquippedItem('weapon')).toBe('ironSword')

      // Unequip: 1 in inventory, 0 equipped
      equippedItemStore.unequipSlot('weapon')
      expect(inventoryStore.inventoryMap.ironSword).toBe(1)
      expect(equippedItemStore.getEquippedItem('weapon')).toBeNull()
    })

    it('should handle swapping equipment', () => {
      inventoryStore.addItem('ironSword', 1)
      inventoryStore.addItem('betterSword', 1)

      equippedItemStore.equipItem('ironSword')
      expect(inventoryStore.inventoryMap.ironSword).toBeUndefined()
      expect(inventoryStore.inventoryMap.betterSword).toBe(1)

      // Swap weapons
      equippedItemStore.equipItem('betterSword')
      expect(inventoryStore.inventoryMap.ironSword).toBe(1) // old weapon back
      expect(inventoryStore.inventoryMap.betterSword).toBeUndefined()
      expect(equippedItemStore.getEquippedItem('weapon')).toBe('betterSword')
    })
  })
})
