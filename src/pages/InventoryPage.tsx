import { defineComponent, computed, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'

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

    const openEquipmentModal = (slotId: string, equipmentId: string): void => {
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
        <div class="flex gap-1 border-b border-gray-200 px-4 pt-4">
          <button
            class={`btn font-semibold transition border-b-2 ${
              activeTab.value === 'inventory'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
            aria-pressed={activeTab.value === 'inventory'}
            onClick={() => (activeTab.value = 'inventory')}
          >
            {t('ui.inventory')}
          </button>
          <button
            class={`btn font-semibold transition border-b-2 ${
              activeTab.value === 'equipment'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
            aria-pressed={activeTab.value === 'equipment'}
            onClick={() => (activeTab.value = 'equipment')}
          >
            {t('ui.equipment')}
          </button>
          <button
            class={`btn font-semibold transition border-b-2 ${
              activeTab.value === 'abilities'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
            aria-pressed={activeTab.value === 'abilities'}
            onClick={() => (activeTab.value = 'abilities')}
          >
            {t('ui.abilities')}
          </button>
        </div>

        <div class="flex-1 overflow-auto p-4">
          {activeTab.value === 'inventory' && (
            <div class="grid grid-cols-[repeat(auto-fill,minmax(64px,1fr))] gap-0.5">
              {inventoryStore.inventoryItems.map((inventoryItem) => (
                <button
                  key={inventoryItem.item.id}
                  class="card-item w-16 h-16 relative"
                  type="button"
                  onClick={() => openInventoryModal(inventoryItem)}
                  aria-label={t(inventoryItem.item.name)}
                  aria-expanded={
                    selectedContext.value === 'inventory' &&
                    selectedItemId.value === inventoryItem.item.id
                  }
                >
                  <div class="text-xs font-semibold text-gray-900 text-center leading-tight">
                    {t(inventoryItem.item.name)}
                  </div>
                  {inventoryItem.count > 1 && (
                    <div class="absolute top-0 right-0 bg-primary text-white text-[10px] px-1 rounded-bl">
                      x{inventoryItem.count}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {activeTab.value === 'equipment' && (
            <div class="grid grid-cols-[repeat(auto-fill,minmax(64px,1fr))] gap-0.5">
              {slotList.value.map((slot) => (
                <div key={slot.id} class="w-16 h-16">
                  {equippedBySlot.value[slot.id] ? (
                    <button
                      class="card-item w-full h-full bg-blue-50 border-2 border-primary shadow-sm hover:shadow-md hover:-translate-y-0.5 transition flex items-center justify-center p-1"
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
                    <div class="w-full h-full rounded bg-gray-100 border border-dashed border-gray-400 flex items-center justify-center p-1">
                      <span class="text-[10px] text-gray-500 text-center leading-tight">
                        {t(slot.name)}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab.value === 'abilities' && (
            <div class="text-gray-500 text-center mt-8">Abilities coming soon</div>
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
