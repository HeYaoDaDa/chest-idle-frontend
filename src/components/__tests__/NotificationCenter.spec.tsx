import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { useNotificationStore } from '@/stores/notification'

import NotificationCenter from '../NotificationCenter'

import { createTestI18n } from '@/../test/setup'

describe('NotificationCenter', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should render notifications and close button', async () => {
    const wrapper = mount(NotificationCenter, {
      global: { plugins: [createTestI18n()] },
    })

    const store = useNotificationStore()
    store.info('ui.confirm', {})

    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Confirm')

    const closeBtn = wrapper.find('button')
    expect(closeBtn.exists()).toBe(true)
    expect(closeBtn.attributes('aria-label')).toBeDefined()
    // `btn-ghost` is the preferred transparent icon button
    expect(closeBtn.classes()).toContain('btn-ghost')
  })

  it('should render error with role alert', async () => {
    const wrapper = mount(NotificationCenter, {
      global: { plugins: [createTestI18n()] },
    })

    const store = useNotificationStore()
    store.error('ui.confirm', {}, 0)

    await wrapper.vm.$nextTick()

    const item = wrapper.find('[role="alert"]')
    expect(item.exists()).toBe(true)
  })
})
