import { computed, defineComponent, ref, watch, type PropType } from 'vue'
import { useI18n } from 'vue-i18n'

import ModalBox from '@/components/ModalBox'
import { itemConfigMap, slotConfigMap } from '@/gameConfig'
import { useEquippedItemStore } from '@/stores/equippedItem'
import { useInventoryStore } from '@/stores/inventory'

export default defineComponent({
  name: 'ItemModal',
  props: {
    show: { type: Boolean, required: true },
    itemId: { type: String, required: true },
    mode: { type: String as PropType<'inventory' | 'equipped' | 'view'>, required: false },
  },
  emits: ['close', 'unequip', 'equip', 'openChest'],
  setup(props, { emit }) {
    const { t } = useI18n()
    const inventoryStore = useInventoryStore()
    const equippedItemStore = useEquippedItemStore()
    const chestOpenAmount = ref(1)

    const inventoryItem = computed(() => inventoryStore.getInventoryItem(props.itemId))

    const isEquipped = computed(() =>
      Object.values(equippedItemStore.equippedBySlot).includes(props.itemId),
    )

    const explicitMode = computed(() => props.mode as 'inventory' | 'equipped' | 'view' | undefined)

    // If caller provides explicit mode, prefer it. Otherwise infer from inventory presence.
    const isViewMode = computed(() => explicitMode.value === 'view')
    const isInventoryMode = computed(() =>
      explicitMode.value ? explicitMode.value === 'inventory' : !!inventoryItem.value,
    )
    const isEquipmentMode = computed(() =>
      explicitMode.value
        ? explicitMode.value === 'equipped'
        : !inventoryItem.value && isEquipped.value,
    )

    const item = computed(() => inventoryItem.value?.item ?? itemConfigMap[props.itemId])

    const itemName = computed(() => (item.value ? t(item.value.name) : ''))
    const itemDescription = computed(() => (item.value ? t(item.value.description) : ''))

    const slotInfo = computed(() =>
      item.value?.equipment ? slotConfigMap[item.value.equipment.slotId] : undefined,
    )

    const quantity = computed(() => (isInventoryMode.value ? (inventoryItem.value?.count ?? 0) : 0))

    const isChest = computed(() => isInventoryMode.value && !!inventoryItem.value?.item.chest)

    const maxChestAmount = computed(() => (isChest.value ? (inventoryItem.value?.count ?? 1) : 1))

    const isValidChestAmount = computed(() => {
      return chestOpenAmount.value >= 1 && chestOpenAmount.value <= maxChestAmount.value
    })

    const close = () => emit('close')
    const unequip = () => emit('unequip')
    const equip = () => emit('equip')

    const setMaxChestAmount = () => {
      chestOpenAmount.value = maxChestAmount.value
    }

    const openChest = () => {
      if (isValidChestAmount.value) {
        emit('openChest', chestOpenAmount.value)
      }
    }

    watch(
      () => props.show,
      (newShow) => {
        if (newShow && isChest.value) {
          chestOpenAmount.value = Math.min(1, maxChestAmount.value)
        }
      },
    )

    return () => {
      if (!props.show) return null

      return (
        <ModalBox onClose={close}>
          <div class="flex flex-col gap-3">
            <div class="flex flex-col gap-2">
              <h3 class="text-2xl font-bold text-gray-900">{itemName.value}</h3>
              {isEquipmentMode.value && slotInfo.value && (
                <span class="text-sm text-gray-600">
                  {t('ui.type')}: {t(slotInfo.value.name)}
                </span>
              )}
              {isInventoryMode.value && (
                <span class="text-sm text-gray-600">
                  {t('ui.quantity')}: {quantity.value}
                </span>
              )}
            </div>

            <div class="flex flex-col gap-3">
              <p class="text-gray-700 text-sm leading-normal">{itemDescription.value}</p>

              {isInventoryMode.value && slotInfo.value && (
                <div class="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span class="text-sm font-medium text-gray-700">{t('ui.slot')}</span>
                  <span class="text-sm text-gray-900">{t(slotInfo.value.name)}</span>
                </div>
              )}
            </div>

            {!isViewMode.value && (
              <div class="flex flex-col gap-3">
                {/* Equipment mode: Unequip button */}
                {isEquipmentMode.value && (
                  <button
                    type="button"
                    class="btn-secondary w-full py-3 px-4 rounded-lg font-semibold transition-all"
                    onClick={unequip}
                  >
                    {t('ui.unequip')}
                  </button>
                )}

                {/* Inventory mode: Equip or Open chest */}
                {isInventoryMode.value && (
                  <>
                    {inventoryItem.value?.item.equipment && (
                      <button
                        type="button"
                        class="btn-primary w-full py-3 px-4 rounded-lg font-semibold transition-all"
                        onClick={equip}
                      >
                        {t('ui.equip')}
                      </button>
                    )}

                    {isChest.value && (
                      <div class="flex flex-col gap-2">
                        {maxChestAmount.value > 1 && (
                          <div class="flex gap-2">
                            <input
                              type="number"
                              min={1}
                              max={maxChestAmount.value}
                              value={chestOpenAmount.value}
                              onInput={(e) =>
                                (chestOpenAmount.value = Number(
                                  (e.target as HTMLInputElement).value,
                                ))
                              }
                              class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder={String(maxChestAmount.value)}
                            />
                            <button
                              type="button"
                              class="btn-secondary px-4 py-2 rounded-lg font-semibold"
                              onClick={setMaxChestAmount}
                            >
                              Max
                            </button>
                          </div>
                        )}
                        <button
                          type="button"
                          class="btn-primary w-full py-3 px-4 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={!isValidChestAmount.value}
                          onClick={openChest}
                        >
                          {t('ui.open')}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </ModalBox>
      )
    }
  },
})
