import { computed, defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'

import ModalBox from '@/components/ModalBox'
import { enemyConfigMap } from '@/gameConfig'
import { useActionQueueStore } from '@/stores/actionQueue'
import { isInfiniteAmount } from '@/utils/amount'

export default defineComponent({
  name: 'ActionQueueModal',
  props: { show: { type: Boolean, required: true } },
  emits: ['close'],
  setup(props, { emit }) {
    const { t } = useI18n()
    const actionQueueStore = useActionQueueStore()

    const unifiedLength = computed(() => actionQueueStore.queueLength)
    const progress = computed(() => actionQueueStore.progress + '%')

    const runningActionAmountDisplay = computed(() =>
      actionQueueStore.currentAction
        ? isInfiniteAmount(actionQueueStore.currentAction.amount)
          ? '∞'
          : String(actionQueueStore.currentAction.amount)
        : '',
    )

    const closeModal = () => emit('close')

    const stopCurrentAction = () => {
      if (actionQueueStore.currentAction) actionQueueStore.removeAction(0)
    }

    const moveActionUp = (index: number) => actionQueueStore.moveUp(index)
    const moveActionDown = (index: number) => actionQueueStore.moveDown(index)
    const moveActionToTop = (index: number) => actionQueueStore.moveTop(index)
    const moveActionToBottom = (index: number) => actionQueueStore.moveBottom(index)
    const removeQueuedAction = (index: number) => actionQueueStore.removeAction(index + 1)

    return () => {
      if (!props.show) return null
      return (
        <ModalBox onClose={closeModal}>
          <div class="flex flex-col gap-4 min-w-[min(420px,90vw)]">
            <div class="flex justify-between items-center pb-3 border-b-2 border-blue-100">
              <h3 class="text-lg font-bold text-gray-900">{t('ui.queue')}</h3>
              <span class="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                {unifiedLength.value} {t('ui.queuedItems')}
              </span>
            </div>

            <div class="max-h-96 overflow-y-auto">
              <ul class="flex flex-col gap-3 list-none p-0 m-0">
                {actionQueueStore.currentAction && (
                  <li class="flex flex-wrap justify-between items-center gap-4 bg-blue-50 border border-blue-300 rounded-lg p-3 transition-all hover:bg-blue-100">
                    <div class="flex items-center gap-4 flex-1 min-w-0">
                      <span class="flex items-center justify-center w-7 h-7 bg-blue-100 text-blue-600 rounded-full text-sm font-bold flex-shrink-0">
                        0
                      </span>
                      <div class="flex flex-col gap-1 flex-1 min-w-0">
                        <span class="text-sm font-semibold text-gray-900 truncate">
                          {actionQueueStore.isCombatAction
                            ? t(enemyConfigMap[actionQueueStore.currentAction.actionId]?.name || 'ui.combat.title')
                            : t(actionQueueStore.currentActionDetail?.name || 'nothing')}
                        </span>
                        <span class="text-sm text-gray-500">
                          ×{runningActionAmountDisplay.value}
                        </span>
                      </div>
                    </div>
                    {!actionQueueStore.isCombatAction && (
                      <div class="w-full order-10">
                        <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            class="h-full bg-blue-500 transition-all"
                            style={{ width: progress.value }}
                          ></div>
                        </div>
                      </div>
                    )}
                    <div class="flex gap-2">
                      <button
                        type="button"
                        class="btn btn-secondary px-2 py-1 text-xs"
                        title="Top"
                        disabled
                      >
                        ⏫
                      </button>
                      <button
                        type="button"
                        class="btn btn-secondary px-2 py-1 text-xs"
                        title="Up"
                        disabled
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        class="btn btn-secondary px-2 py-1 text-xs hover:bg-gray-200"
                        title="Down"
                        disabled={unifiedLength.value <= 1}
                        onClick={() => moveActionDown(0)}
                      >
                        ▼
                      </button>
                      <button
                        type="button"
                        class="btn btn-secondary px-2 py-1 text-xs hover:bg-gray-200"
                        title="Bottom"
                        disabled={unifiedLength.value <= 1}
                        onClick={() => moveActionToBottom(0)}
                      >
                        ⏬
                      </button>
                    </div>
                    <button
                      type="button"
                      class="btn border-none rounded-full px-2.5 py-2 font-semibold text-sm bg-red-100 text-red-700 hover:bg-red-200 hover:shadow-lg flex-shrink-0"
                      onClick={stopCurrentAction}
                    >
                      {t('stop')}
                    </button>
                  </li>
                )}

                {actionQueueStore.pendingActions.map((action, index) => {
                  const unifiedIndex = actionQueueStore.currentAction ? index + 1 : index
                  const detail = actionQueueStore.actionQueueDetails[unifiedIndex]
                  const isCombat = action.type === 'combat'
                  const displayName = isCombat
                    ? enemyConfigMap[action.actionId]?.name
                    : detail?.name
                  if (!displayName) return null
                  return (
                    <li
                      key={index}
                      class="flex justify-between items-center gap-4 bg-gray-50 border border-gray-200 rounded-lg p-3 transition-all hover:bg-gray-100 hover:border-blue-300"
                    >
                      <div class="flex items-center gap-4 flex-1 min-w-0">
                        <span class="flex items-center justify-center w-7 h-7 bg-blue-100 text-blue-600 rounded-full text-sm font-bold flex-shrink-0">
                          {unifiedIndex}
                        </span>
                        <div class="flex flex-col gap-1 flex-1 min-w-0">
                          <span class="text-sm font-semibold text-gray-900 truncate">
                            {t(displayName)}
                          </span>
                          <span class="text-sm text-gray-500">
                            ×{isInfiniteAmount(action.amount) ? '∞' : action.amount}
                          </span>
                        </div>
                      </div>
                      <div class="flex gap-2">
                        <button
                          type="button"
                          class="btn btn-secondary px-2 py-1 text-xs hover:bg-gray-200"
                          title="Top"
                          disabled={unifiedIndex === 0}
                          onClick={() => moveActionToTop(unifiedIndex)}
                        >
                          ⏫
                        </button>
                        <button
                          type="button"
                          class="btn btn-secondary px-2 py-1 text-xs hover:bg-gray-200"
                          title="Up"
                          disabled={unifiedIndex === 0}
                          onClick={() => moveActionUp(unifiedIndex)}
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          class="btn btn-secondary px-2 py-1 text-xs hover:bg-gray-200"
                          title="Down"
                          disabled={unifiedIndex >= unifiedLength.value - 1}
                          onClick={() => moveActionDown(unifiedIndex)}
                        >
                          ▼
                        </button>
                        <button
                          type="button"
                          class="btn btn-secondary px-2 py-1 text-xs hover:bg-gray-200"
                          title="Bottom"
                          disabled={unifiedIndex >= unifiedLength.value - 1}
                          onClick={() => moveActionToBottom(unifiedIndex)}
                        >
                          ⏬
                        </button>
                      </div>
                      <button
                        type="button"
                        class="btn border-none rounded-full px-2.5 py-2 font-semibold text-sm bg-red-100 text-red-700 hover:bg-red-200 hover:shadow-lg flex-shrink-0"
                        onClick={() => removeQueuedAction(index)}
                      >
                        {t('remove')}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </ModalBox>
      )
    }
  },
})
