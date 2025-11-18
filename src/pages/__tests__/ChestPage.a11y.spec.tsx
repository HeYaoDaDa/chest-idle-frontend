import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { vi } from 'vitest'

import ChestPage from '@/pages/ChestPage'

// Mock gameConfig chest list so we can reliably test UI elements
// eslint-disable-next-line @typescript-eslint/no-explicit-any
vi.mock('@/gameConfig', async (importOriginal: any) => {
  const original = await importOriginal()
  return {
    ...original,
    chestConfigs: [
      {
        id: 'test-chest',
        name: 'item.copperMineChest',
      },
    ],
    itemConfigMap: {
      'test-chest': {
        id: 'test-chest',
        chest: { maxPoints: 100, loots: [] },
      },
    },
  }
})
import { createTestI18n } from '@/../test/setup'

describe('ChestPage aria-expanded', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should set aria-expanded when the chest modal is open', async () => {
    const wrapper = mount(ChestPage, {
      global: { plugins: [createTestI18n()], stubs: { RouterLink: true } },
    })

    // click the first chest button (match by size class)
    // find a chest button by locating progressbar and finding closest button
    const chestBtnWrapper = wrapper
      .findAll('button')
      .find((el) => el.attributes('aria-label') === 'item.copperMineChest')
    expect(chestBtnWrapper).toBeTruthy()
    await chestBtnWrapper!.trigger('click')
    expect(chestBtnWrapper!.attributes('aria-expanded')).toBe('true')
  })
})
