import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, vi } from 'vitest'
import { createI18n } from 'vue-i18n'

// Mock virtual:uno.css import to prevent resolution errors
vi.mock('virtual:uno.css', () => ({}))

// Setup Pinia for each test
beforeEach(() => {
  const pinia = createPinia()
  setActivePinia(pinia)
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
          currentAction: 'Current Action',
          queue: 'Queue',
          consumable: {
            empty: 'Empty',
          },
          progressPercentage: 'Progress',
          currentProgress: 'Current Progress',
        },
        action: {
          test: {
            name: 'Test Action',
          },
        },
        item: {
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
