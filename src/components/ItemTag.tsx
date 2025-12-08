import { defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'

import { itemConfigMap } from '@/gameConfig'
import { useItemModalStore } from '@/stores/itemModal'

export default defineComponent({
  name: 'ItemTag',
  props: {
    itemId: { type: String, required: true },
    class: { type: String, default: '' },
  },
  setup(props) {
    const { t } = useI18n()
    const itemModal = useItemModalStore()

    const itemName = () => {
      const cfg = itemConfigMap[props.itemId]
      return cfg ? t(cfg.name) : props.itemId
    }

    const open = (e?: Event) => {
      if (e && typeof (e as Event).stopPropagation === 'function') (e as Event).stopPropagation()
      // Always open item modal in read-only view when invoked via ItemTag
      itemModal.open(props.itemId, 'view')
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        open()
      }
    }

    return () => (
      <span
        role="button"
        tabindex={0}
        class={`inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-sm font-medium hover:bg-neutral-200 select-none ${props.class}`}
        onClick={(e: Event) => open(e)}
        onKeydown={onKeyDown}
        aria-haspopup="dialog"
        aria-label={t('ui.viewItem', { item: itemName() })}
      >
        {itemName()}
      </span>
    )
  },
})
