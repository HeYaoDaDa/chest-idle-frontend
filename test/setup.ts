import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, vi } from 'vitest'
import { createI18n } from 'vue-i18n'

import log from '@/utils/log'

// Mock virtual:uno.css import to prevent resolution errors
vi.mock('virtual:uno.css', () => ({}))

// Setup Pinia for each test
beforeEach(() => {
  const pinia = createPinia()
  setActivePinia(pinia)
  // Silence logger during tests to avoid noise and external transport
  log.setLevel('silent')
})

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks()
  vi.clearAllTimers()
})

// Create a lightweight i18n instance for tests
export const createTestI18n = () => {
  return createI18n({
    legacy: false,
    locale: 'en',
    messages: {
      en: {
        gameName: 'Test Game',
        nothing: 'Nothing',
        stop: 'Stop',
        ui: {
          viewItem: 'View item: {item}',
          chestOpenResults: 'Chest Opening Results',
          chests: 'Chests',
          chestsDescription: 'View all chest progress',
          remainingPoints: 'Remaining',
          possibleRewards: 'Possible Rewards',
          dropChance: 'Drop Chance',
          currentAction: 'Current Action',
          queue: 'Queue',
          consumable: {
            empty: 'Empty',
          },
          inventory: 'Inventory',
          equipment: 'Equipment',
          abilities: 'Abilities',
          confirm: 'Confirm',
          close: 'Close',
          progressPercentage: 'Progress',
          currentProgress: 'Current Progress',
          quantity: 'Quantity',
          type: 'Type',
          slot: 'Slot',
          equip: 'Equip',
          unequip: 'Unequip',
          open: 'Open',
        },
        action: {
          test: {
            name: 'Test Action',
          },
        },
        item: {
          copperMineChest: { name: 'Copper Mine Chest' },
          copperPickaxe: { name: 'Copper Pickaxe' },
          coffee: {
            name: 'Coffee',
          },
          tea: {
            name: 'Tea',
          },
        },
      },
      zh: {},
    },
  })
}

// Mock navigator.language if needed
if (typeof global.navigator === 'undefined') {
  Object.defineProperty(global, 'navigator', {
    value: {
      language: 'en-US',
    },
    writable: true,
  })
}
