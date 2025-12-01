import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { useItemModalStore } from '@/stores/itemModal'

import ChestResultsModal from '../ChestResultsModal'

import { createTestI18n } from '@/../test/setup'

describe('ChestResultsModal', () => {
  it('shows result cards and opens ItemModal when clicked', async () => {
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

    // Find the rendered item card in teleported body and click
    const card = document.querySelector('.card-item') as HTMLButtonElement | null
    expect(card).not.toBeNull()
    card?.click()
    await wrapper.vm.$nextTick()

    expect(itemModal.show).toBe(true)
    expect(itemModal.itemId).toBe('coffee')

    wrapper.unmount()
  })

  it('handles unknown item id gracefully and opens ItemModal', async () => {
    const i18n = createTestI18n()
    const wrapper = mount(ChestResultsModal, {
      props: {
        show: true,
        results: [{ itemId: 'unknownItem', amount: 1 }],
      },
      global: { plugins: [i18n] },
      attachTo: document.body,
    })

    const itemModal = useItemModalStore()
    expect(itemModal.show).toBe(false)

    const card = document.querySelector('.card-item') as HTMLButtonElement | null
    expect(card).not.toBeNull()
    card?.click()
    await wrapper.vm.$nextTick()

    expect(itemModal.show).toBe(true)
    expect(itemModal.itemId).toBe('unknownItem')

    wrapper.unmount()
  })
})
