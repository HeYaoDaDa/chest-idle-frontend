import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { useItemModalStore } from '@/stores/itemModal'

import ItemTag from '../ItemTag'

import { createTestI18n } from '@/../test/setup'

describe('ItemTag', () => {
  it('opens ItemModal when clicked via store', async () => {
    const i18n = createTestI18n()

    const wrapper = mount(ItemTag, {
      props: { itemId: 'copperOre' },
      global: {
        plugins: [i18n],
      },
    })

    const store = useItemModalStore()
    expect(store.show).toBe(false)

    await wrapper.trigger('click')

    expect(store.show).toBe(true)
    expect(store.itemId).toBe('copperOre')
    // ItemTag opens item modal in 'view' mode
    expect(store.mode).toBe('view')
  })
})
