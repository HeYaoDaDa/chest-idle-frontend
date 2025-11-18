import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { useInventoryStore } from '@/stores/inventory'

import ItemModal from '../ItemModal'

import { createTestI18n } from '@/../test/setup'

describe('ItemModal', () => {
  describe('read-only view mode', () => {
    it('hides inventory quantity and action buttons when mode is view', async () => {
      const i18n = createTestI18n()
      const inv = useInventoryStore()
      inv.addItem('coffee', 2)

      const wrapper = mount(ItemModal, {
        props: { show: true, itemId: 'coffee', mode: 'view' },
        global: { plugins: [i18n] },
        attachTo: document.body,
      })

      // Should not show `ui.quantity` text or `ui.open`/`ui.equip` buttons
      expect(document.body.innerHTML).not.toContain('Quantity')
      expect(document.body.innerHTML).not.toContain('Open')
      expect(document.body.innerHTML).not.toContain('Equip')

      wrapper.unmount()
    })

    it('hides slot information when mode is view', async () => {
      const i18n = createTestI18n()
      const wrapper = mount(ItemModal, {
        props: { show: true, itemId: 'copperPickaxe', mode: 'view' },
        global: { plugins: [i18n] },
        attachTo: document.body,
      })

      // Should not show `ui.type` or slot name in view mode
      expect(document.body.innerHTML).not.toContain('Type')

      wrapper.unmount()
    })
  })
})
