import { defineComponent, computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { enemyConfigMap, skillConfigMap } from '@/gameConfig'
import { useActionQueueStore } from '@/stores/actionQueue'
import { useCombatStore } from '@/stores/combat'
import { isInfiniteAmount } from '@/utils/amount'
import { fromFixed } from '@/utils/fixedPoint'
import { formatDurationMs, formatNumber } from '@/utils/format'

import { ActionQueueModal } from './modals'

export default defineComponent({
  name: 'ActionQueue',
  setup() {
    const { t, locale } = useI18n()
    const actionQueueStore = useActionQueueStore()
    const combatStore = useCombatStore()
    const showQueueModal = ref(false)

    const runningActionPrefix = computed(() => {
      const action = actionQueueStore.currentAction
      if (!action) return t('ui.currentAction')
      if (action.type === 'combat') {
        return t('ui.combat.title')
      }
      const detail = actionQueueStore.currentActionDetail
      if (detail) {
        const skillConfig = skillConfigMap[detail.skillId]
        if (skillConfig) {
          return t(skillConfig.name)
        }
      }
      return t('ui.currentAction')
    })

    const runningActionName = computed(() => {
      if (actionQueueStore.isCombatAction && actionQueueStore.currentAction) {
        const enemyId = actionQueueStore.currentAction.actionId
        const enemy = enemyConfigMap[enemyId]
        return enemy ? t(enemy.name) : t('ui.combat.title')
      }
      return actionQueueStore.currentActionDetail
        ? t(actionQueueStore.currentActionDetail.name)
        : t('nothing')
    })

    const runningActionAmount = computed(() => {
      const action = actionQueueStore.currentAction
      if (!action) return ''
      return isInfiniteAmount(action.amount) ? '∞' : `${action.amount}`
    })

    const runningActionDisplay = computed(() => {
      if (!actionQueueStore.currentAction) return t('nothing')
      const amount = runningActionAmount.value ? ` · ${runningActionAmount.value}` : ''
      return `${runningActionPrefix.value} · ${runningActionName.value}${amount}`
    })

    const runningActionDurationDisplay = computed(() => {
      if (!actionQueueStore.currentActionDetail) return ''
      const durationMs = fromFixed(actionQueueStore.currentActionDetail.durationSeconds) * 1000
      return formatDurationMs(durationMs, locale.value, {
        maxFractionDigits: 3,
      })
    })

    const isCombatAction = computed(() => actionQueueStore.isCombatAction)

    const hpProgress = computed(() => {
      if (!combatStore.currentBattle) return 0
      return (combatStore.currentBattle.playerCurrentHp / combatStore.maxHp) * 100
    })

    const mpProgress = computed(() => 100) // MP始终满值

    const queueButtonLabel = computed(() => `${t('ui.queue')} (${actionQueueStore.queueLength})`)
    const canOpenQueue = computed(() => actionQueueStore.queueLength > 0)
    const progress = computed(() => actionQueueStore.progress + '%')
    const hasRunningAction = computed(() => Boolean(actionQueueStore.currentAction))

    const hpDisplayText = computed(() => {
      if (!combatStore.currentBattle) return ''
      return `${formatNumber(combatStore.currentBattle.playerCurrentHp, locale.value)} / ${formatNumber(combatStore.maxHp, locale.value)}`
    })

    const mpDisplayText = computed(
      () =>
        `${formatNumber(combatStore.maxMp, locale.value)} / ${formatNumber(combatStore.maxMp, locale.value)}`,
    )

    const openQueueModal = () => {
      showQueueModal.value = true
    }

    const closeQueueModal = () => {
      showQueueModal.value = false
    }

    const stopCurrentAction = () => {
      actionQueueStore.stopCurrentAction()
    }

    return () => (
      <div class="flex flex-col gap-3 w-full max-w-2xl">
        <div class="flex flex-col gap-2.5 lg:flex-row lg:items-center">
          <span class="text-base font-semibold text-neutral-600 flex-1 min-w-0 truncate">
            {runningActionDisplay.value}
          </span>
          {hasRunningAction.value && (
            <div class="flex flex-col gap-1.5 lg:flex-row lg:flex-shrink-0">
              <button
                type="button"
                class="btn btn-secondary rounded-full px-3 py-2 text-sm whitespace-nowrap w-full lg:w-auto"
                onClick={openQueueModal}
                disabled={!canOpenQueue.value}
              >
                {queueButtonLabel.value}
              </button>
              <button
                type="button"
                class="btn btn-destructive rounded-full px-3 py-2 text-sm whitespace-nowrap w-full lg:w-auto"
                onClick={stopCurrentAction}
              >
                {t('stop')}
              </button>
            </div>
          )}
        </div>

        {/* 战斗时显示HP/MP进度条，非战斗时显示普通进度条 */}
        {hasRunningAction.value && isCombatAction.value && combatStore.currentBattle ? (
          <div class="flex flex-col gap-1.5">
            <div
              class="relative h-3 w-full bg-neutral-50 rounded-full overflow-hidden"
              aria-label="HP"
            >
              <div
                class="h-full bg-red-500 transition-all duration-300"
                style={{ width: `${hpProgress.value}%` }}
              />
              <span class="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-white drop-shadow">
                {hpDisplayText.value}
              </span>
            </div>
            <div
              class="relative h-3 w-full bg-neutral-50 rounded-full overflow-hidden"
              aria-label="MP"
            >
              <div
                class="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${mpProgress.value}%` }}
              />
              <span class="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-white drop-shadow">
                {mpDisplayText.value}
              </span>
            </div>
          </div>
        ) : (
          hasRunningAction.value && (
            <div class="relative flex items-center min-w-64">
              <div
                class="w-full h-3 bg-neutral-50 rounded-full overflow-hidden"
                role="progressbar"
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow={Math.round(actionQueueStore.progress)}
                aria-label={t('ui.progressPercentage')}
              >
                <div
                  class="h-full progress-bar duration-75"
                  style={{ width: progress.value }}
                ></div>
              </div>
              {runningActionDurationDisplay.value && (
                <span class="absolute left-1/2 -translate-x-1/2 text-xs text-neutral-500 pointer-events-none">
                  {runningActionDurationDisplay.value}
                </span>
              )}
            </div>
          )
        )}

        <ActionQueueModal show={showQueueModal.value} onClose={closeQueueModal} />
      </div>
    )
  },
})
