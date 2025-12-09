import { computed, defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'

import ModalBox from '@/components/ModalBox'
import { consumableConfigs } from '@/gameConfig'
import { useConsumableStore } from '@/stores/consumable'
import { useInventoryStore } from '@/stores/inventory'

import { modalPropTypes } from './types'

import type { SkillModalProps } from './types'

export default defineComponent({
  name: 'ConsumableSelectModal',
  props: modalPropTypes.skillModal,
  emits: ['close'],
  setup(props: SkillModalProps, { emit }) {
    const { t } = useI18n()
    const consumableStore = useConsumableStore()
    const inventoryStore = useInventoryStore()

    // 筛选玩家拥有的消耗品（排除当前槽位已装备的）
    const availableConsumables = computed(() => {
      const currentSlot = consumableStore.getSlots(props.skillId)[props.slotIndex]
      return consumableConfigs.filter((item) => {
        const count = inventoryStore.inventoryMap[item.id] ?? 0
        if (count <= 0) return false
        // 排除当前槽位已装备的消耗品
        if (currentSlot?.itemId === item.id) return false
        return true
      })
    })

    const handleSelectConsumable = (itemId: string) => {
      const success = consumableStore.applyConsumable(props.skillId, props.slotIndex, itemId)
      if (success) {
        emit('close')
      }
    }

    const closeModal = () => emit('close')

    return () => {
      if (!props.show) return null

      return (
        <ModalBox onClose={closeModal}>
          <div class="flex flex-col gap-1 min-w-[min(380px,100%)]">
            <div class="flex justify-between items-center mb-2">
              <h3 class="heading-modal">{t('ui.consumable.selectTitle')}</h3>
            </div>

            <div class="max-h-96 overflow-y-auto">
              {availableConsumables.value.length === 0 ? (
                <div class="text-center text-neutral-500 py-8">{t('ui.consumable.noItems')}</div>
              ) : (
                <div class="flex flex-wrap gap-0.5">
                  {availableConsumables.value.map((item) => {
                    const inventoryCount = inventoryStore.inventoryMap[item.id] ?? 0

                    return (
                      <div
                        key={item.id}
                        class="card-item w-16 h-16 mt-0 relative"
                        onClick={() => handleSelectConsumable(item.id)}
                      >
                        <div class="text-xs font-semibold text-neutral-900 text-center leading-tight">
                          {t(item.name)}
                        </div>
                        {inventoryCount > 1 && (
                          <div class="absolute top-0 right-0 bg-primary text-white text-[10px] px-1 rounded-bl">
                            x{inventoryCount}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </ModalBox>
      )
    }
  },
})
