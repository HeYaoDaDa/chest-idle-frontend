import { computed, defineComponent, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import ChestRewardItem from '@/components/ChestRewardItem'
import ModalBox from '@/components/ModalBox'
import { itemConfigMap, slotConfigMap } from '@/gameConfig'
import { useEquippedItemStore } from '@/stores/equippedItem'
import { useInventoryStore } from '@/stores/inventory'

import { modalPropTypes } from './types'

import type { ItemModalProps } from './types'

export default defineComponent({
  name: 'ItemModal',
  props: modalPropTypes.itemModal,
  emits: ['close', 'unequip', 'equip', 'openChest'],
  setup(props: ItemModalProps, { emit }) {
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
          <div class="flex flex-col gap-1">
            <div class="flex flex-col gap-2">
              <h3 class="heading-modal">{itemName.value}</h3>
              {isEquipmentMode.value && slotInfo.value && (
                <span class="text-sm text-neutral-600">
                  {t('ui.type')}: {t(slotInfo.value.name)}
                </span>
              )}
              {isInventoryMode.value && (
                <span class="text-sm text-neutral-600">
                  {t('ui.quantity')}: {quantity.value}
                </span>
              )}
            </div>

            <div class="flex flex-col gap-2">
              <p class="text-neutral-700 text-sm leading-normal">{itemDescription.value}</p>

              {isInventoryMode.value && slotInfo.value && (
                <div class="card-item w-full justify-between px-3 py-2">
                  <span class="text-sm font-medium text-neutral-700">{t('ui.slot')}</span>
                  <span class="text-sm text-neutral-900">{t(slotInfo.value.name)}</span>
                </div>
              )}

              {(item.value?.chest || itemConfigMap[props.itemId]?.chest) && (
                <div class="flex flex-col gap-2">
                  <div class="text-sm font-semibold text-neutral-700">{t('ui.possibleRewards')}</div>
                  <div class="flex flex-col gap-2">
                    {(item.value?.chest?.loots ?? itemConfigMap[props.itemId]?.chest?.loots ?? []).map((loot) => (
                      <ChestRewardItem
                        key={loot.itemId}
                        itemId={loot.itemId}
                        minCount={loot.min}
                        maxCount={loot.max}
                        probability={loot.chance * 100}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {!isViewMode.value && (
              <div class="flex flex-col gap-2">
                {/* Equipment mode: Unequip button */}
                {isEquipmentMode.value && (
                  <button
                    type="button"
                    class="btn-secondary w-full"
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
                        class="btn-primary w-full"
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
                              class="input-base flex-1 py-1"
                              placeholder={String(maxChestAmount.value)}
                            />
                            <button
                              type="button"
                              class="btn-secondary btn-sm"
                              onClick={setMaxChestAmount}
                            >
                              Max
                            </button>
                          </div>
                        )}
                        <button
                          type="button"
                          class="btn-primary w-full"
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
