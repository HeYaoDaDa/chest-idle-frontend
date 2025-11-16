import { computed, defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'

import ModalBox from '@/components/ModalBox'
import { itemConfigMap } from '@/gameConfig'
import { useChestPointStore } from '@/stores/chestPoint'
import { fromFixed, toFixed } from '@/utils/fixedPoint'
import { formatNumber, formatPercent } from '@/utils/format'

export default defineComponent({
  name: 'ChestModalBox',
  props: {
    show: { type: Boolean, required: true },
    chestId: { type: String, default: undefined },
  },
  emits: ['close'],
  setup(props, { emit }) {
    const { t, locale } = useI18n()
    const chestPointStore = useChestPointStore()

    const chest = computed(() => {
      if (!props.chestId) return null
      return itemConfigMap[props.chestId]
    })

    const chestPoints = computed(() => {
      if (!chest.value) return toFixed(0)
      return chestPointStore.getChestPoints(chest.value.id)
    })

    const chestProgress = computed(() => {
      if (!chest.value) return 0
      return chestPointStore.getChestProgress(chest.value.id)
    })

    const chestRemaining = computed(() => {
      if (!chest.value) return toFixed(0)
      return chestPointStore.getChestRemaining(chest.value.id)
    })

    const lootWithProbability = computed(() => {
      if (!chest.value || !chest.value.chest) return []

      return chest.value.chest.loots.map((lootEntry) => ({
        itemId: lootEntry.itemId,
        minCount: lootEntry.min,
        maxCount: lootEntry.max,
        probability: lootEntry.chance * 100,
      }))
    })

    const closeModal = () => {
      emit('close')
    }

    return () =>
      props.show ? (
        <ModalBox onClose={closeModal}>
          <div class="flex flex-col gap-4 min-w-[min(420px,100%)]">
            <div class="flex justify-between items-start gap-4">
              <div class="flex flex-col gap-2">
                <span class="text-xs uppercase tracking-wider text-gray-500">{t('ui.chest')}</span>
                <h2 class="text-2xl font-bold text-gray-900 leading-tight">
                  {t(chest.value?.name ?? '')}
                </h2>
                <p class="text-gray-600 text-sm leading-normal">
                  {t(chest.value?.description ?? '')}
                </p>
              </div>
            </div>

            <div class="flex flex-col gap-1">
              <div class="flex justify-between items-center py-1">
                <span class="text-sm font-medium text-gray-700">{t('ui.currentProgress')}</span>
                <span class="text-sm text-gray-900">
                  {formatNumber(fromFixed(chestPoints.value), locale.value, 3)} /{' '}
                  {formatNumber(
                    fromFixed(chest.value?.chest?.maxPoints || toFixed(0)),
                    locale.value,
                    3,
                  )}
                </span>
              </div>
              <div class="flex justify-between items-center py-1">
                <span class="text-sm font-medium text-gray-700">{t('ui.progressPercentage')}</span>
                <span class="text-sm text-gray-900">
                  {formatPercent(chestProgress.value * 100, locale.value, 3)}
                </span>
              </div>
              <div class="flex justify-between items-center py-1">
                <span class="text-sm font-medium text-gray-700">{t('ui.remainingPoints')}</span>
                <span class="text-sm text-gray-900">
                  {formatNumber(fromFixed(chestRemaining.value), locale.value, 3)}
                </span>
              </div>

              <div class="h-px bg-gray-200 my-2"></div>

              <div class="flex justify-between items-center py-2 font-semibold">
                <span class="text-sm text-gray-700">{t('ui.possibleRewards')}</span>
              </div>

              <div class="flex flex-col gap-3 mt-2">
                {lootWithProbability.value.map((loot, index) => (
                  <div
                    key={index}
                    class="flex flex-col gap-1 p-2 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100 hover:border-blue-300 transition-all"
                  >
                    <div class="flex justify-between items-center">
                      <span class="font-semibold text-gray-900 text-sm">
                        {t(itemConfigMap[loot.itemId].name)}
                      </span>
                      <span class="text-xs text-gray-600 font-medium">
                        ×
                        {loot.minCount === loot.maxCount
                          ? formatNumber(loot.minCount, locale.value, 3)
                          : `${formatNumber(loot.minCount, locale.value, 3)}-${formatNumber(
                              loot.maxCount,
                              locale.value,
                              3,
                            )}`}
                      </span>
                    </div>
                    <div class="flex items-center gap-2 text-xs">
                      <span class="text-gray-500">{t('ui.dropChance')}:</span>
                      <span class="text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded">
                        {formatPercent(loot.probability, locale.value, 3)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ModalBox>
      ) : null
  },
})
