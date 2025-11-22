import { defineComponent } from 'vue'
import { RouterView } from 'vue-router'

import { ItemModal } from '@/components/modals'
import NotificationCenter from '@/components/NotificationCenter'
import { useItemModalStore } from '@/stores/itemModal'
import log from '@/utils/log'

export default defineComponent({
  name: 'App',
  setup() {
    const itemModal = useItemModalStore()
    const onItemModalClose = () => itemModal.close()

    // These handlers should never be called in App context because ItemModal
    // is only opened via ItemTag with mode='view' which hides all action buttons.
    // They are defined here to satisfy TypeScript and catch logic errors.
    const onEquip = () => {
      log.error('ItemModal equip event triggered in App context - this should not happen', { event: 'equip' })
      throw new Error('Equip action not supported in global item modal (view mode only)')
    }
    const onUnequip = () => {
      log.error('ItemModal unequip event triggered in App context - this should not happen', { event: 'unequip' })
      throw new Error('Unequip action not supported in global item modal (view mode only)')
    }
    const onOpenChest = () => {
      log.error('ItemModal openChest event triggered in App context - this should not happen', { event: 'openChest' })
      throw new Error('OpenChest action not supported in global item modal (view mode only)')
    }

    return () => (
      <div class="h-full w-full">
        <NotificationCenter />
        <RouterView />
        <ItemModal
          show={!!itemModal.itemId && itemModal.show}
          itemId={itemModal.itemId ?? ''}
          mode={itemModal.mode ?? undefined}
          onClose={onItemModalClose}
          onEquip={onEquip}
          onUnequip={onUnequip}
          onOpenChest={onOpenChest}
        />
        {/* Chest opening results are shown locally on InventoryPage */}
      </div>
    )
  },
})
