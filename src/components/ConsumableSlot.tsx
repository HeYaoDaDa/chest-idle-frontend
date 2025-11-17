import { computed, defineComponent, type PropType } from 'vue'
import { useI18n } from 'vue-i18n'

import { itemConfigMap } from '@/gameConfig'
import { useConsumableStore } from '@/stores/consumable'
import { fromFixed } from '@/utils/fixedPoint'
import { formatDurationMs } from '@/utils/format'

export default defineComponent({
  name: 'ConsumableSlot',
  props: {
    skillId: { type: String, required: true },
    slotIndex: { type: Number, required: true },
    onSlotClick: { type: Function as PropType<(slotIndex: number) => void>, required: true },
  },
  setup(props) {
    const { t, locale } = useI18n()
    const consumableStore = useConsumableStore()

    const slots = computed(() => consumableStore.getSlots(props.skillId))
    const slot = computed(() => slots.value[props.slotIndex])
    const item = computed(() => (slot.value?.itemId ? itemConfigMap[slot.value.itemId] : null))

    const remainingTime = computed(() => {
      if (slot.value?.remaining && slot.value.remaining > 0) {
        return formatDurationMs(fromFixed(slot.value.remaining), locale.value, {
          maxFractionDigits: 0,
        })
      }
      return ''
    })

    const handleClick = () => {
      props.onSlotClick(props.slotIndex)
    }

    return () => (
      <button
        type="button"
        class="flex flex-col items-center gap-1 p-2 bg-white border-2 border-gray-300 rounded-lg shadow-sm hover:shadow-md hover:border-primary transition cursor-pointer min-w-24"
        onClick={handleClick}
        aria-label={item.value ? t(item.value.name) : t('ui.consumable.empty')}
      >
        {item.value ? (
          <>
            <div class="text-sm font-bold text-gray-900 text-center">{t(item.value.name)}</div>
            {remainingTime.value && (
              <div class="text-xs text-primary font-medium">{remainingTime.value}</div>
            )}
          </>
        ) : (
          <div class="text-sm text-gray-400 italic">{t('ui.consumable.empty')}</div>
        )}
      </button>
    )
  },
})
