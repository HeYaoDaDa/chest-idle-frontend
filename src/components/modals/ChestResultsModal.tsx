import { defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'

import ItemTag from '@/components/ItemTag'
import ModalBox from '@/components/ModalBox'

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

    const close = () => {
      emit('close')
    }

    return () => {
      if (!props.show || !props.results) return null

      return (
        <ModalBox onClose={close}>
          <div class="flex flex-col gap-3">
            <div>
              <h3 class="text-lg font-bold text-gray-900 mb-1">{t('ui.chestOpenResults')}</h3>
            </div>

            <div class="max-h-96 overflow-auto">
              {props.results.length > 0 ? (
                <div class="flex flex-col gap-2">
                  {props.results.map((result) => (
                    <div
                      key={result.itemId}
                      class="flex justify-between items-center p-2 bg-gray-50 rounded"
                    >
                      <span class="font-medium text-gray-900">
                        <ItemTag itemId={result.itemId} />
                      </span>
                      <span class="text-gray-600">×{result.amount}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div class="text-center text-gray-500 py-8">{t('ui.noItemsObtained')}</div>
              )}
            </div>
          </div>
        </ModalBox>
      )
    }
  },
})
