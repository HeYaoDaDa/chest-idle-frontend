import { computed, defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'

import ModalBox from '@/components/ModalBox'
import { consumableConfigs } from '@/gameConfig'
import { useConsumableStore } from '@/stores/consumable'
import { useInventoryStore } from '@/stores/inventory'

export default defineComponent({
  name: 'ConsumableSelectModal',
  props: {
    show: { type: Boolean, required: true },
    skillId: { type: String, required: true },
    slotIndex: { type: Number, required: true },
  },
  emits: ['close'],
  setup(props, { emit }) {
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
          <div class="p-6 bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-xl font-bold text-gray-900">{t('ui.consumable.selectTitle')}</h3>
            </div>

            <div class="max-h-96 overflow-y-auto">
              {availableConsumables.value.length === 0 ? (
                <div class="text-center text-gray-500 py-8">{t('ui.consumable.noItems')}</div>
              ) : (
                <div class="grid grid-cols-[repeat(auto-fill,minmax(64px,1fr))] gap-0.5">
                  {availableConsumables.value.map((item) => {
                    const inventoryCount = inventoryStore.inventoryMap[item.id] ?? 0

                    return (
                      <div
                        key={item.id}
                        class="w-16 h-16 rounded bg-white border border-gray-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition cursor-pointer flex flex-col justify-center items-center p-1 relative"
                        onClick={() => handleSelectConsumable(item.id)}
                      >
                        <div class="text-xs font-semibold text-gray-900 text-center leading-tight">
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
