import { computed, defineComponent, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import ItemTag from '@/components/ItemTag'
import ModalBox from '@/components/ModalBox'
import { useAmountInput, useQueueAction } from '@/composables'
import { enemyConfigMap } from '@/gameConfig'
import { useActionQueueStore } from '@/stores/actionQueue'
import { useCombatStore } from '@/stores/combat'
import { isIntegerOrInfinity, parseAmountString } from '@/utils/amountParser'
import { INFINITE_AMOUNT } from '@/utils/constants'
import { formatNumber } from '@/utils/format'

import type { BaseModalProps } from './types'
import type { EnemyConfig } from '@/gameConfig'

export default defineComponent({
  name: 'EnemyModalBox',
  props: {
    show: { type: Boolean, required: true },
    enemyId: { type: String, default: undefined },
  },
  emits: ['close', 'startBattle'],
  setup(props: BaseModalProps & { enemyId?: string }, { emit }) {
    const { t, locale } = useI18n()
    const combatStore = useCombatStore()
    const actionQueueStore = useActionQueueStore()

    // Use composable with custom validator for combat (disallow zero)
    const { amountString, allowAmount, resetAmount } = useAmountInput({
      defaultValue: '∞',
      validator: (value) => {
        if (!isIntegerOrInfinity(value)) return false
        const num = parseAmountString(value, 1, { allowZero: false })
        return num === INFINITE_AMOUNT || num > 0
      },
    })
    const { hasCurrentAction, queuePosition, closeModal: closeModalFromComposable } = useQueueAction(emit)

    // Override closeModal to also reset amount
    const closeModal = () => {
      closeModalFromComposable()
      resetAmount()
    }

    const enemy = computed<EnemyConfig | null>(() => {
      if (!props.enemyId) return null
      return enemyConfigMap[props.enemyId] ?? null
    })

    // allowAmount now from composable validator

    // 玩家战斗属性
    const playerMaxHp = computed(() => combatStore.maxHp)
    const playerDamage = computed(() => combatStore.currentDamage)
    const playerAttackIntervalSeconds = computed(() => combatStore.currentAttackIntervalSeconds)

    const hasLoot = computed(() => {
      if (!enemy.value) return false
      return enemy.value.fixedLootItems.length > 0 || enemy.value.fixedChestPoints.length > 0
    })

    const addToQueue = () => {
      if (enemy.value && allowAmount.value) {
        // 使用 previewBattle 仅模拟，不修改战斗状态
        const result = combatStore.previewBattle(enemy.value.id, parseAmountString(amountString.value, 1, { allowZero: false }))
        if (result && result.canWin) {
          const singleBattleDurationSeconds = result.perBattleSummary[0]?.durationSeconds ?? 0
          actionQueueStore.addCombatAction(
            enemy.value.id,
            parseAmountString(amountString.value, 1, { allowZero: false }),
            singleBattleDurationSeconds,
          )
        }
        closeModal()
      }
    }

    const startBattle = () => {
      if (enemy.value && allowAmount.value) {
        emit('startBattle', {
          enemyId: enemy.value.id,
          amount: parseAmountString(amountString.value, 1, { allowZero: false }),
        })
        closeModal()
      }
    }

    // We intentionally do not auto-select on focus; the input selection is handled on click.

    watch(
      () => props.show,
      (newValue) => {
        if (!newValue) {
          resetAmount()
        }
      },
    )

    return () => {
      if (!props.show || !enemy.value) return null

      return (
        <ModalBox onClose={closeModal}>
          <div class="flex flex-col gap-3 min-w-[min(380px,100%)] compact-base">
            {/* 标题 */}
            <div class="flex flex-col gap-1">
              <span class="text-xs uppercase tracking-wider text-primary">
                {t('ui.combat.title')}
              </span>
              <h2 class="text-xl font-bold text-neutral-900 leading-tight">
                {t(enemy.value.name)}
              </h2>
              <p class="text-neutral-600 text-sm leading-normal">{t(enemy.value.description)}</p>
            </div>

            {/* 敌人属性 */}
            <div class="flex flex-col gap-1 p-3 bg-surface border border-neutral-100 rounded-md shadow-sm">
              <h3 class="text-sm font-semibold text-neutral-800 mb-1">
                {t('ui.combat.title')} · {t('ui.combat.enemies')}
              </h3>
              <div class="flex justify-between items-center py-1 text-sm text-neutral-700">
                <span class="font-medium">{t('ui.combat.hp')}</span>
                <span class="text-neutral-900">{formatNumber(enemy.value.hp, locale.value)}</span>
              </div>
              <div class="flex justify-between items-center py-1 text-sm text-neutral-700">
                <span class="font-medium">{t('ui.combat.attack')}</span>
                <span class="text-neutral-900">{formatNumber(enemy.value.attack, locale.value)}</span>
              </div>
              <div class="flex justify-between items-center py-1 text-sm text-neutral-700">
                <span class="font-medium">{t('ui.combat.attackInterval')}</span>
                <span class="text-neutral-900">{enemy.value.attackIntervalSeconds.toFixed(1)}s</span>
              </div>
              <div class="flex justify-between items-center py-1 text-sm text-neutral-700">
                <span class="font-medium">{t('ui.combat.xpReward')}</span>
                <span class="text-neutral-900">{formatNumber(enemy.value.xpReward, locale.value)}</span>
              </div>
            </div>

            {/* 玩家战斗属性 */}
            <div class="flex flex-col gap-1 p-3 bg-surface border border-neutral-100 rounded-md shadow-sm">
              <h3 class="text-sm font-semibold text-neutral-800 mb-1">{t('ui.combat.playerStats')}</h3>
              <div class="flex justify-between items-center py-1 text-sm text-neutral-700">
                <span class="font-medium">{t('ui.combat.hp')}</span>
                <span class="text-neutral-900">{formatNumber(playerMaxHp.value, locale.value)}</span>
              </div>
              <div class="flex justify-between items-center py-1 text-sm text-neutral-700">
                <span class="font-medium">{t('ui.combat.attack')}</span>
                <span class="text-neutral-900">{formatNumber(playerDamage.value, locale.value)}</span>
              </div>
              <div class="flex justify-between items-center py-1 text-sm text-neutral-700">
                <span class="font-medium">{t('ui.combat.attackInterval')}</span>
                <span class="text-neutral-900">{playerAttackIntervalSeconds.value.toFixed(1)}s</span>
              </div>
            </div>

            <div class="flex flex-col gap-1">
              <div class="flex justify-between items-start py-1">
                <span class="text-sm font-medium text-gray-700">{t('ui.rewards')}</span>
                <span class="text-sm text-gray-900 text-right">
                  {hasLoot.value ? (
                    <>
                      {enemy.value.fixedLootItems.map((loot, idx) => (
                        <span key={loot.itemId}>
                          <span class="text-xs text-gray-600 font-medium">
                            {formatNumber(loot.count, locale.value)}
                          </span>
                          <ItemTag itemId={loot.itemId} />
                          {idx < enemy.value!.fixedLootItems.length - 1 && '，'}
                        </span>
                      ))}
                      {enemy.value.fixedChestPoints.map((cp) => (
                        <span key={cp.chestId}>
                          <ItemTag itemId={cp.chestId} />
                          <span class="text-xs text-gray-600 font-medium">
                            {' '}
                            +{formatNumber(cp.points, locale.value)} pts
                          </span>
                        </span>
                      ))}
                    </>
                  ) : (
                    <span class="text-gray-500">{t('ui.noRewards')}</span>
                  )}
                </span>
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <label class="flex flex-col gap-2">
                <span class="text-sm font-semibold text-gray-900">{t('ui.amount')}</span>
                <div class="flex gap-2">
                  <input
                    type="text"
                    value={amountString.value}
                    onInput={(e) => (amountString.value = (e.target as HTMLInputElement).value)}
                    data-autofocus-ignore
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                    class="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    class="btn-secondary"
                    title={t('ui.unlimited')}
                    onClick={() => (amountString.value = '∞')}
                  >
                    ∞
                  </button>
                </div>
              </label>
              <div class="flex gap-2">
                {hasCurrentAction.value && (
                  <button
                    type="button"
                    class="btn-secondary flex-1 py-2 px-3 rounded-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!allowAmount.value}
                    onClick={addToQueue}
                  >
                    {t('ui.addToQueue', { position: queuePosition.value })}
                  </button>
                )}
                <button
                  type="button"
                  class="btn-primary flex-1 py-2 px-3 rounded-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!allowAmount.value}
                  onClick={hasCurrentAction.value ? startBattle : startBattle}
                >
                  {hasCurrentAction.value ? t('ui.startImmediately') : t('start')}
                </button>
              </div>
            </div>
          </div>
        </ModalBox>
      )
    }
  },
})
