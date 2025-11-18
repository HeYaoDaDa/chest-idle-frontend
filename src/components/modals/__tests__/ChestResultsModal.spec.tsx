import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { useItemModalStore } from '@/stores/itemModal'

import ChestResultsModal from '../ChestResultsModal'

import { createTestI18n } from '@/../test/setup'

describe('ChestResultsModal', () => {
  it('shows ItemTag and opens ItemModal when clicked', async () => {
    const i18n = createTestI18n()
    const wrapper = mount(ChestResultsModal, {
      props: {
        show: true,
        results: [{ itemId: 'coffee', amount: 1 }],
      },
      global: { plugins: [i18n] },
      attachTo: document.body,
    })

    const itemModal = useItemModalStore()
    expect(itemModal.show).toBe(false)

    // Find the rendered item name in teleported body and click
    const container = document.querySelector('.font-medium') as HTMLElement | null
    expect(container).not.toBeNull()
    const button = container?.querySelector('[role="button"]') as HTMLElement | null
    expect(button).not.toBeNull()
    button?.click()
    await wrapper.vm.$nextTick()

    expect(itemModal.show).toBe(true)
    expect(itemModal.itemId).toBe('coffee')

    wrapper.unmount()
  })
})
