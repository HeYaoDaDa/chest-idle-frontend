import { defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'


import ModalBox from '@/components/ModalBox'
import { itemConfigMap } from '@/gameConfig'
import { useItemModalStore } from '@/stores/itemModal'

interface ChestResult {
  itemId: string
  amount: number
}

export default defineComponent({
  name: 'ChestResultsModal',
  props: {
    show: { type: Boolean, required: true },
    results: { type: Array as () => ChestResult[] | null, default: null },
  },
  emits: ['close'],
  setup(props, { emit }) {
    const { t } = useI18n()

    const itemModal = useItemModalStore()

    const close = () => {
      emit('close')
    }

    return () => {
      if (!props.show || !props.results) return null

      return (
        <ModalBox onClose={close}>
          <div class="flex flex-col gap-1">
            <div>
              <h3 class="text-lg sm:text-xl font-bold text-neutral-900 mb-1">{t('ui.chestOpenResults')}</h3>
            </div>

            <div class="max-h-96 overflow-auto">
              {props.results.length > 0 ? (
                <div class="flex flex-wrap gap-0.5">
                  {props.results.map((result) => (
                    <button
                      key={result.itemId}
                      type="button"
                      class="card-item w-16 h-16 relative"
                      onClick={() => itemModal.open(result.itemId, 'view')}
                      aria-label={t(itemConfigMap[result.itemId]?.name ?? `item.${result.itemId}.name`)}
                    >
                      <div class="text-xs font-semibold text-neutral-900 text-center leading-tight">
                        <span class="font-medium text-neutral-900">{t(itemConfigMap[result.itemId]?.name ?? `item.${result.itemId}.name`)}</span>
                      </div>
                      <div class="absolute top-0 right-0 bg-primary text-white text-[10px] px-1 rounded-bl">
                        ×{result.amount}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div class="text-center text-neutral-500 py-8">{t('ui.noItemsObtained')}</div>
              )}
            </div>
          </div>
        </ModalBox>
      )
    }
  },
})
