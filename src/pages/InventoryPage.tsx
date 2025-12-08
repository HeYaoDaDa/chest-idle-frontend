import { defineComponent, computed, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'

import InventoryGroup from '@/components/InventoryGroup'
import { ChestResultsModal, ItemModal } from '@/components/modals'
import { slotConfigs, itemConfigMap } from '@/gameConfig'
import { useChestResultsStore } from '@/stores/chestResults'
import { useEquippedItemStore } from '@/stores/equippedItem'
import { useInventoryStore, type InventoryItem } from '@/stores/inventory'

export default defineComponent({
  name: 'InventoryPage',
  setup() {
    const { t } = useI18n()
    const inventoryStore = useInventoryStore()
    const equippedItemStore = useEquippedItemStore()

    const selectedItemId = shallowRef<string | null>(null)
    const selectedContext = shallowRef<'inventory' | 'equipped' | null>(null)
    const chestResults = useChestResultsStore()
    const activeTab = shallowRef<'inventory' | 'equipment' | 'abilities'>('inventory')

    const selectedInventoryItem = computed(() => {
      if (selectedContext.value !== 'inventory' || !selectedItemId.value) return null
      return inventoryStore.getInventoryItem(selectedItemId.value) ?? null
    })

    const equippedBySlot = computed(() => equippedItemStore.equippedBySlot)

    const equippedItemNameBySlot = computed<Record<string, string>>(() => {
      const map: Record<string, string> = {}
      for (const slot of slotConfigs) {
        const id = equippedBySlot.value[slot.id]
        map[slot.id] = id ? itemConfigMap[id].name : slot.name
      }
      return map
    })

    const selectedSlotId = computed(() => {
      if (selectedContext.value !== 'equipped' || !selectedItemId.value) return null
      for (const slotId in equippedBySlot.value) {
        if (equippedBySlot.value[slotId] === selectedItemId.value) return slotId
      }
      return null
    })

    const currentItemId = computed(() => selectedItemId.value)
    const maxChestAmount = computed(() => selectedInventoryItem.value?.count || 1)

    const slotList = computed(() => {
      return slotConfigs.map((slot) => ({ id: slot.id, name: slot.name }))
    })

    // 物品类别配置
    const categoryConfig = [
      { key: 'chest' as const, i18nKey: 'ui.categoryChest' },
      { key: 'resource' as const, i18nKey: 'ui.categoryResource' },
      { key: 'equipment' as const, i18nKey: 'ui.categoryEquipment' },
      { key: 'consumable' as const, i18nKey: 'ui.categoryConsumable' },
    ] as const

    const openEquipmentModal = (slotId: string, equipmentId: string) => {
      selectedItemId.value = equipmentId
      selectedContext.value = 'equipped'
    }

    const unequipAndClose = (): void => {
      if (selectedSlotId.value) {
        equippedItemStore.unequipSlot(selectedSlotId.value)
        closeItemModal()
      }
    }

    const openInventoryModal = (item: InventoryItem): void => {
      selectedItemId.value = item.item.id
      selectedContext.value = 'inventory'
      chestResults.close()
    }

    const closeItemModal = (): void => {
      selectedItemId.value = null
      selectedContext.value = null
    }

    const equipAndClose = (): void => {
      if (selectedInventoryItem.value) {
        equippedItemStore.equipItem(selectedInventoryItem.value.item.id)
        closeItemModal()
      }
    }

    const openChestAndClose = (amount?: number): void => {
      if (selectedInventoryItem.value) {
        const amountToOpen = amount ?? 1
        if (amountToOpen >= 1 && amountToOpen <= maxChestAmount.value) {
          const results = inventoryStore.openChest(selectedInventoryItem.value, amountToOpen)
          chestResults.open(results)
          closeItemModal()
        }
      }
    }

    const closeChestResults = (): void => {
      chestResults.close()
    }

    const openSlotEquipment = (slotId: string): void => {
      const equipmentId = equippedBySlot.value[slotId]
      if (equipmentId) openEquipmentModal(slotId, equipmentId)
    }

    return () => (
      <div class="flex-1 flex flex-col h-full overflow-hidden">
        <div class="flex gap-1 px-4 pt-4 border-b border-neutral-200">
          <button
            class={`btn font-semibold transition border-b-2 cursor-pointer text-sm ${
              activeTab.value === 'inventory'
                ? 'border-primary text-primary'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
            aria-pressed={activeTab.value === 'inventory'}
            onClick={() => (activeTab.value = 'inventory')}
          >
            {t('ui.inventory')}
          </button>
          <button
            class={`btn font-semibold transition border-b-2 cursor-pointer text-sm ${
              activeTab.value === 'equipment'
                ? 'border-primary text-primary'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
            aria-pressed={activeTab.value === 'equipment'}
            onClick={() => (activeTab.value = 'equipment')}
          >
            {t('ui.equipment')}
          </button>
          <button
            class={`btn font-semibold transition border-b-2 cursor-pointer text-sm ${
              activeTab.value === 'abilities'
                ? 'border-primary text-primary'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
            aria-pressed={activeTab.value === 'abilities'}
            onClick={() => (activeTab.value = 'abilities')}
          >
            {t('ui.abilities')}
          </button>
        </div>

        <div class="flex-1 overflow-auto p-4">
          {activeTab.value === 'inventory' && (
            <div class="space-y-6">
              {categoryConfig
                .filter(({ key }) => inventoryStore.categoryStats[key] > 0)
                .map(({ key, i18nKey }) => (
                  <InventoryGroup
                    key={key}
                    title={t(i18nKey)}
                    items={inventoryStore.inventoryItemsByCategory[key]}
                    onItemClick={openInventoryModal}
                  />
                ))}
            </div>
          )}

          {activeTab.value === 'equipment' && (
            <div class="flex flex-wrap gap-2">
              {slotList.value.map((slot) => (
                <div key={slot.id} class="w-16 h-16">
                  {equippedBySlot.value[slot.id] ? (
                    <button
                      class="card-item w-full h-full border-2 border-primary bg-surface-subtle flex items-center justify-center p-1 select-none"
                      type="button"
                      onClick={() => openSlotEquipment(slot.id)}
                      aria-label={t(equippedItemNameBySlot.value[slot.id])}
                      aria-expanded={
                        selectedContext.value === 'equipped' && selectedSlotId.value === slot.id
                      }
                    >
                      <div class="text-xs font-semibold text-primary text-center leading-tight">
                        {t(equippedItemNameBySlot.value[slot.id])}
                      </div>
                    </button>
                  ) : (
                    <div class="w-full h-full rounded bg-neutral-50 border border-dashed border-neutral-100 flex items-center justify-center p-1 select-none">
                      <span class="text-[10px] text-neutral-400 text-center leading-tight">
                        {t(slot.name)}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab.value === 'abilities' && (
            <div class="text-neutral-400 text-center mt-8">Abilities coming soon</div>
          )}
        </div>

        <ItemModal
          show={!!currentItemId.value}
          itemId={currentItemId.value ?? ''}
          mode={selectedContext.value ?? undefined}
          onClose={closeItemModal}
          onUnequip={unequipAndClose}
          onEquip={equipAndClose}
          onOpenChest={openChestAndClose}
        />

        <ChestResultsModal
          show={!!chestResults.results}
          results={chestResults.results}
          onClose={closeChestResults}
        />
      </div>
    )
  },
})
