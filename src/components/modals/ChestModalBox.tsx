import { computed, defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'

import ChestRewardItem from '@/components/ChestRewardItem'
import ModalBox from '@/components/ModalBox'
import { itemConfigMap } from '@/gameConfig'
import { useChestPointStore } from '@/stores/chestPoint'
import { fromFixed, toFixed } from '@/utils/fixedPoint'
import { formatNumber, formatPercent } from '@/utils/format'

import type { BaseModalProps } from './types'

export default defineComponent({
  name: 'ChestModalBox',
  props: {
    show: { type: Boolean, required: true },
    chestId: { type: String, default: undefined },
  },
  emits: ['close'],
  setup(props: BaseModalProps & { chestId?: string }, { emit }) {
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
          <div class="flex flex-col gap-1 min-w-[min(380px,100%)]">
            <div class="flex justify-between items-start gap-2">
              <div class="flex flex-col gap-2">
                <span class="text-xs uppercase tracking-wider text-neutral-500">{t('ui.chest')}</span>
                <h2 class="text-xl font-bold text-neutral-900 leading-tight">
                  {t(chest.value?.name ?? '')}
                </h2>
                <p class="text-neutral-600 text-sm leading-normal">
                  {t(chest.value?.description ?? '')}
                </p>
              </div>
            </div>

            <div class="flex flex-col gap-1">
              <div class="flex justify-between items-center py-1">
                <span class="text-sm font-medium text-neutral-700">{t('ui.currentProgress')}</span>
                <span class="text-sm text-neutral-900">
                  {formatNumber(fromFixed(chestPoints.value), locale.value, 3)} /{' '}
                  {formatNumber(
                    fromFixed(chest.value?.chest?.maxPoints || toFixed(0)),
                    locale.value,
                    3,
                  )}
                </span>
              </div>
              <div class="flex justify-between items-center py-1">
                <span class="text-sm font-medium text-neutral-700">{t('ui.progressPercentage')}</span>
                <span class="text-sm text-neutral-900">
                  {formatPercent(chestProgress.value * 100, locale.value, 3)}
                </span>
              </div>
              <div class="flex justify-between items-center py-1">
                <span class="text-sm font-medium text-neutral-700">{t('ui.remainingPoints')}</span>
                <span class="text-sm text-neutral-900">
                  {formatNumber(fromFixed(chestRemaining.value), locale.value, 3)}
                </span>
              </div>

              <div class="h-px bg-neutral-200 my-2"></div>

              <div class="flex justify-between items-center py-2 font-semibold">
                <span class="text-sm text-neutral-700">{t('ui.possibleRewards')}</span>
              </div>

              <div class="flex flex-col gap-2 mt-2">
                {lootWithProbability.value.map((loot, index) => (
                  <ChestRewardItem
                    key={index}
                    itemId={loot.itemId}
                    minCount={loot.minCount}
                    maxCount={loot.maxCount}
                    probability={loot.probability}
                  />
                ))}
              </div>
            </div>
          </div>
        </ModalBox>
      ) : null
  },
})
