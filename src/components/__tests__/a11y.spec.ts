import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { describe, it, beforeEach, expect } from 'vitest'
import { axe } from 'vitest-axe'
import { createMemoryHistory, createRouter } from 'vue-router'

import ActionQueue from '@/components/ActionQueue'
import ConsumableSlot from '@/components/ConsumableSlot'
import LeftSidebar from '@/components/LeftSidebar'
import NotificationCenter from '@/components/NotificationCenter'
import log from '@/utils/log'

import { createTestI18n } from '@/../test/setup'

describe('Accessibility (axe) checks', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('ActionQueue should have no detectable a11y violations', async () => {
    const wrapper = mount(ActionQueue, {
      global: { plugins: [createTestI18n()] },
    })

    const results = await axe(wrapper.element, {
      rules: { 'color-contrast': { enabled: false }, region: { enabled: false } },
    })
    // debug:

    log.debug('ActionQueue violations', { violations: results.violations })
    expect(results.violations.length).toBe(0)
  })

  it('LeftSidebar should have no detectable a11y violations', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/', name: 'home', component: { template: '<div />' } }],
    })
    await router.push('/')
    await router.isReady()

    const wrapper = mount(LeftSidebar, {
      global: { plugins: [createTestI18n(), router], stubs: { RouterLink: true } },
    })

    const results = await axe(wrapper.element, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations.length).toBe(0)
  })

  it('NotificationCenter should have no detectable a11y violations', async () => {
    const wrapper = mount(NotificationCenter, {
      global: { plugins: [createTestI18n()] },
    })

    const results = await axe(wrapper.element, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations.length).toBe(0)
  })

  it('ConsumableSlot should have no detectable a11y violations', async () => {
    const wrapper = mount(ConsumableSlot, {
      props: { skillId: 'mining', slotIndex: 0, onSlotClick: () => {} },
      global: { plugins: [createTestI18n()] },
    })

    const results = await axe(wrapper.element, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations.length).toBe(0)
  })
})
