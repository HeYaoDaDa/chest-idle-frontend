import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import InventoryPage from '@/pages/InventoryPage'

import { createTestI18n } from '@/../test/setup'

describe('InventoryPage accessibility', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('tab buttons should have aria-pressed toggles', async () => {
    const wrapper = mount(InventoryPage, {
      global: { plugins: [createTestI18n()], stubs: { RouterLink: true } },
    })

    // The first three buttons in header are tabs
    const buttons = wrapper.findAll('button').slice(0, 3)
    expect(buttons[0].attributes('aria-pressed')).toBe('true')
    expect(buttons[1].attributes('aria-pressed')).toBe('false')
    expect(buttons[2].attributes('aria-pressed')).toBe('false')

    await buttons[1].trigger('click')
    expect(buttons[1].attributes('aria-pressed')).toBe('true')
  })
})
