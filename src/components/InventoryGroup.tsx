import { defineComponent, type PropType } from 'vue'
import { useI18n } from 'vue-i18n'

import type { InventoryItem } from '@/stores/inventory'

export default defineComponent({
  name: 'InventoryGroup',
  props: {
    title: {
      type: String,
      required: true,
    },
    items: {
      type: Array as PropType<InventoryItem[]>,
      required: true,
    },
    onItemClick: {
      type: Function as PropType<(item: InventoryItem) => void>,
      required: true,
    },
  },
  setup(props) {
    const { t } = useI18n()

    return () => (
      <div class="mb-6">
        {/* 分组标题 */}
        <div class="section-header">
          <span class="section-title">{props.title}</span>
          <span class="text-xs text-neutral-400">({props.items.length})</span>
        </div>

        {/* 物品网格 */}
        <div class="flex flex-wrap gap-0.5">
          {props.items.map((inventoryItem) => (
            <button
              key={inventoryItem.item.id}
              class="card-item-square-relative"
              type="button"
              onClick={() => props.onItemClick(inventoryItem)}
              aria-label={t(inventoryItem.item.name)}
            >
              <div class="text-xs font-semibold text-neutral-600 text-center leading-tight">
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
      </div>
    )
  },
})
