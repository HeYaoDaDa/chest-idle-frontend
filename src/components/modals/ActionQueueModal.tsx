import { computed, defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'

import ModalBox from '@/components/ModalBox'
import { enemyConfigMap } from '@/gameConfig'
import { useActionQueueStore } from '@/stores/actionQueue'
import { isInfiniteAmount } from '@/utils/amount'

import { modalPropTypes } from './types'

import type { BaseModalProps } from './types'

export default defineComponent({
  name: 'ActionQueueModal',
  props: modalPropTypes.baseModal,
  emits: ['close'],
  setup(props: BaseModalProps, { emit }) {
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
      actionQueueStore.stopCurrentAction()
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
          <div class="flex flex-col gap-1 min-w-[min(420px,90vw)]">
            <div class="flex justify-between items-center pb-3 border-b border-neutral-100">
              <h3 class="text-lg font-bold text-neutral-600">{t('ui.queue')}</h3>
              <span class="badge bg-primary/10 text-primary">
                {unifiedLength.value} {t('ui.queuedItems')}
              </span>
            </div>

            <div class="max-h-96 overflow-y-auto">
              <ul class="flex flex-col gap-2 list-none p-0 m-0">
                {actionQueueStore.currentAction && (
                  <li class="flex flex-wrap justify-between items-center gap-2 bg-surface-subtle border border-primary/30 rounded-md p-2 transition-all">
                    <div class="flex items-center gap-2 flex-1 min-w-0">
                      <span class="flex items-center justify-center w-7 h-7 bg-primary/10 text-primary rounded-full text-sm font-bold flex-shrink-0">
                        0
                      </span>
                      <div class="flex flex-col gap-1 flex-1 min-w-0">
                        <span class="text-sm font-semibold text-neutral-600 truncate">
                          {actionQueueStore.isCombatAction
                            ? t(
                                enemyConfigMap[actionQueueStore.currentAction.actionId]?.name ||
                                  'ui.combat.title',
                              )
                            : t(actionQueueStore.currentActionDetail?.name || 'nothing')}
                        </span>
                        <span class="text-sm text-neutral-400">
                          ×{runningActionAmountDisplay.value}
                        </span>
                      </div>
                    </div>
                    {!actionQueueStore.isCombatAction && (
                      <div class="w-full order-10">
                        <div class="w-full h-2 bg-neutral-50 rounded-full overflow-hidden">
                          <div
                            class="h-full bg-primary transition-all dynamic-width"
                            style={{ '--width': progress.value } as Record<string, string>}
                          ></div>
                        </div>
                      </div>
                    )}
                    <div class="flex gap-2">
                      <button
                        type="button"
                        class="btn-secondary btn-sm"
                        title="Top"
                        disabled
                      >
                        ⏫
                      </button>
                      <button
                        type="button"
                        class="btn-secondary btn-sm"
                        title="Up"
                        disabled
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        class="btn-secondary btn-sm"
                        title="Down"
                        disabled={unifiedLength.value <= 1}
                        onClick={() => moveActionDown(0)}
                      >
                        ▼
                      </button>
                      <button
                        type="button"
                        class="btn-secondary btn-sm"
                        title="Bottom"
                        disabled={unifiedLength.value <= 1}
                        onClick={() => moveActionToBottom(0)}
                      >
                        ⏬
                      </button>
                    </div>
                    <button
                      type="button"
                      class="btn-destructive btn-sm rounded-full flex-shrink-0"
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
                      class="flex justify-between items-center gap-2 bg-surface border border-neutral-50 rounded-md p-2 transition-all hover:border-primary/40"
                    >
                      <div class="flex items-center gap-2 flex-1 min-w-0">
                        <span class="flex items-center justify-center w-7 h-7 bg-primary/10 text-primary rounded-full text-sm font-bold flex-shrink-0">
                          {unifiedIndex}
                        </span>
                        <div class="flex flex-col gap-1 flex-1 min-w-0">
                          <span class="text-sm font-semibold text-neutral-600 truncate">
                            {t(displayName)}
                          </span>
                          <span class="text-sm text-neutral-400">
                            ×{isInfiniteAmount(action.amount) ? '∞' : action.amount}
                          </span>
                        </div>
                      </div>
                      <div class="flex gap-2">
                        <button
                          type="button"
                          class="btn-secondary btn-sm"
                          title="Top"
                          disabled={unifiedIndex === 0}
                          onClick={() => moveActionToTop(unifiedIndex)}
                        >
                          ⏫
                        </button>
                        <button
                          type="button"
                          class="btn-secondary btn-sm"
                          title="Up"
                          disabled={unifiedIndex === 0}
                          onClick={() => moveActionUp(unifiedIndex)}
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          class="btn-secondary btn-sm"
                          title="Down"
                          disabled={unifiedIndex >= unifiedLength.value - 1}
                          onClick={() => moveActionDown(unifiedIndex)}
                        >
                          ▼
                        </button>
                        <button
                          type="button"
                          class="btn-secondary btn-sm"
                          title="Bottom"
                          disabled={unifiedIndex >= unifiedLength.value - 1}
                          onClick={() => moveActionToBottom(unifiedIndex)}
                        >
                          ⏬
                        </button>
                      </div>
                      <button
                        type="button"
                        class="btn-destructive btn-sm rounded-full flex-shrink-0"
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
