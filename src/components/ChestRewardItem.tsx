import { defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'

import ItemTag from '@/components/ItemTag'
import { formatNumber, formatPercent } from '@/utils/format'

export default defineComponent({
  name: 'ChestRewardItem',
  props: {
    itemId: { type: String, required: true },
    minCount: { type: Number, required: false, default: 1 },
    maxCount: { type: Number, required: false, default: 1 },
    probability: { type: Number, required: false, default: undefined },
    showProbability: { type: Boolean, default: true },
  },
  setup(props) {
    const { locale } = useI18n()

    const countText = () => {
      if (props.minCount === props.maxCount)
        return `${formatNumber(props.minCount, locale.value, 3)}`
      return `${formatNumber(props.minCount, locale.value, 3)}-${formatNumber(props.maxCount, locale.value, 3)}`
    }

    return () => (
        <div class="flex items-center justify-between gap-2 py-1">
        <div class="flex items-center">
          <span class="text-sm text-neutral-900 font-medium">
            {countText()}
            <ItemTag itemId={props.itemId} />
              {props.showProbability && typeof props.probability === 'number' && props.probability < 100 && (
                <span class="text-xs text-neutral-600">~{formatPercent(props.probability, locale.value, 3)}</span>
              )}
          </span>
        </div>
      </div>
    )
  },
})
