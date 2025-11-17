import { defineComponent, computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { useActionQueueStore } from '@/stores/actionQueue'
import { isInfiniteAmount } from '@/utils/amount'
import { fromFixed } from '@/utils/fixedPoint'
import { formatDurationMs } from '@/utils/format'

import { ActionQueueModal } from './modals'

export default defineComponent({
  name: 'ActionQueue',
  setup() {
    const { t, locale } = useI18n()
    const actionQueueStore = useActionQueueStore()
    const showQueueModal = ref(false)

    const runningActionDisplay = computed(() =>
      actionQueueStore.currentActionDetail
        ? `${t(actionQueueStore.currentActionDetail.name)} · ${
            isInfiniteAmount(actionQueueStore.currentAction.amount)
              ? '∞'
              : actionQueueStore.currentAction.amount
          }`
        : `${t('nothing')}...`,
    )

    const runningActionDurationDisplay = computed(() => {
      if (!actionQueueStore.currentActionDetail) return ''
      return formatDurationMs(
        fromFixed(actionQueueStore.currentActionDetail.duration),
        locale.value,
        {
          maxFractionDigits: 3,
        },
      )
    })

    const hasQueuedActions = computed(() => actionQueueStore.pendingActions.length > 0)
    const unifiedLength = computed(() => actionQueueStore.queueLength)
    const progress = computed(() => actionQueueStore.progress + '%')

    const openQueueModal = () => {
      showQueueModal.value = true
    }

    const closeQueueModal = () => {
      showQueueModal.value = false
    }

    const stopCurrentAction = () => {
      if (actionQueueStore.currentAction) {
        actionQueueStore.removeAction(0)
      }
    }

    return () => (
      <div class="flex flex-col gap-2.5">
        <div class="flex justify-between items-center gap-2.5">
          <div class="flex flex-col gap-0.5 flex-1 min-w-0">
            <span class="text-xs uppercase tracking-wider text-gray-500">
              {t('ui.currentAction')}
            </span>
            <span class="text-base font-semibold text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">
              {runningActionDisplay.value}
            </span>
          </div>
          <div class="flex gap-1.5 flex-shrink-0 flex-col lg:flex-row">
            {actionQueueStore.currentAction && (
              <button
                type="button"
                class="border-none rounded-full px-2.5 py-2 font-semibold text-sm cursor-pointer transition whitespace-nowrap bg-red-100 text-red-700 hover:bg-red-200"
                onClick={stopCurrentAction}
              >
                {t('stop')}
              </button>
            )}
            {hasQueuedActions.value && (
              <button
                type="button"
                class="border-none rounded-full px-2.5 py-2 font-semibold text-sm cursor-pointer transition whitespace-nowrap bg-blue-100 text-primary hover:bg-blue-200"
                onClick={openQueueModal}
              >
                {t('ui.queue')} ({unifiedLength.value})
              </button>
            )}
          </div>
        </div>

        <div class="relative flex items-center min-w-64">
          <div
            class="w-full h-3 bg-gray-200 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow={Math.round(actionQueueStore.progress)}
            aria-label={t('ui.progressPercentage')}
          >
            <div
              class="h-full bg-gradient-to-r from-cyan-400 to-primary transition-all duration-75"
              style={{ width: progress.value }}
            ></div>
          </div>
          {runningActionDurationDisplay.value && (
            <span class="absolute left-1/2 -translate-x-1/2 text-xs text-gray-700 pointer-events-none">
              {runningActionDurationDisplay.value}
            </span>
          )}
        </div>

        <ActionQueueModal show={showQueueModal.value} onClose={closeQueueModal} />
      </div>
    )
  },
})
