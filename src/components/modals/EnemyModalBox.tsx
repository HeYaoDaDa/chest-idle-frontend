import { computed, defineComponent, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import ItemTag from '@/components/ItemTag'
import ModalBox from '@/components/ModalBox'
import { enemyConfigMap } from '@/gameConfig'
import { useActionQueueStore } from '@/stores/actionQueue'
import { useCombatStore } from '@/stores/combat'
import { INFINITE_AMOUNT } from '@/utils/constants'
import { formatNumber } from '@/utils/format'

import type { EnemyConfig } from '@/gameConfig'

export default defineComponent({
  name: 'EnemyModalBox',
  props: {
    show: { type: Boolean, required: true },
    enemyId: { type: String, default: undefined },
  },
  emits: ['close', 'startBattle'],
  setup(props, { emit }) {
    const { t, locale } = useI18n()
    const combatStore = useCombatStore()
    const actionQueueStore = useActionQueueStore()

    const amountString = ref('∞')

    const enemy = computed<EnemyConfig | null>(() => {
      if (!props.enemyId) return null
      return enemyConfigMap[props.enemyId] ?? null
    })

    function isIntegerOrInfinity(str: string): boolean {
      const pattern = /^-?\d+$|^∞$/
      return pattern.test(str)
    }

    function stringToNumber(str: string): number {
      if (str === '∞') return INFINITE_AMOUNT
      const num = Number(str)
      if (!isNaN(num) && Number.isInteger(num) && num > 0) {
        return num
      }
      return 1
    }

    const allowAmount = computed(() => {
      if (!isIntegerOrInfinity(amountString.value)) return false
      const num = stringToNumber(amountString.value)
      return num === INFINITE_AMOUNT || num > 0
    })

    // 玩家战斗属性
    const playerMaxHp = computed(() => combatStore.maxHp)
    const playerDamage = computed(() => combatStore.currentDamage)
    const playerAttackInterval = computed(() => combatStore.currentAttackInterval)

    const hasLoot = computed(() => {
      if (!enemy.value) return false
      return enemy.value.fixedLootItems.length > 0 || enemy.value.fixedChestPoints.length > 0
    })

    const hasCurrentAction = computed(() => !!actionQueueStore.currentAction)
    const queuePosition = computed(() => actionQueueStore.queueLength + 1)

    const closeModal = () => {
      emit('close')
      amountString.value = '1'
    }

    const addToQueue = () => {
      if (enemy.value && allowAmount.value) {
        // 使用 previewBattle 仅模拟，不修改战斗状态
        const result = combatStore.previewBattle(enemy.value.id, stringToNumber(amountString.value))
        if (result && result.canWin) {
          const singleBattleDuration = result.perBattleSummary[0]?.duration ?? 0
          actionQueueStore.addCombatAction(
            enemy.value.id,
            stringToNumber(amountString.value),
            singleBattleDuration,
          )
        }
        closeModal()
      }
    }

    const startBattle = () => {
      if (enemy.value && allowAmount.value) {
        emit('startBattle', {
          enemyId: enemy.value.id,
          amount: stringToNumber(amountString.value),
        })
        closeModal()
      }
    }

    const handleAmountFocus = (event: FocusEvent) => {
      const target = event.target as HTMLInputElement
      window.requestAnimationFrame(() => target.select())
    }

    watch(
      () => props.show,
      (newValue) => {
        if (!newValue) {
          amountString.value = '∞'
        }
      },
    )

    return () => {
      if (!props.show || !enemy.value) return null

      return (
        <ModalBox onClose={closeModal}>
          <div class="flex flex-col gap-3 min-w-[min(420px,100%)]">
            {/* 标题 */}
            <div class="flex justify-between items-start gap-4">
              <div class="flex flex-col gap-2">
                <span class="text-xs uppercase tracking-wider text-red-500">
                  {t('ui.combat.title')}
                </span>
                <h2 class="text-2xl font-bold text-gray-900 leading-tight">
                  {t(enemy.value.name)}
                </h2>
                <p class="text-gray-600 text-sm leading-normal">{t(enemy.value.description)}</p>
              </div>
              {/* 敌人图标 */}
              <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span class="text-4xl">👾</span>
              </div>
            </div>

            {/* 敌人属性 */}
            <div class="flex flex-col gap-1 p-3 bg-gray-50 rounded-lg">
              <h3 class="text-sm font-semibold text-gray-700 mb-1">
                {t('ui.combat.title')} - {t('ui.combat.enemies')}
              </h3>
              <div class="flex justify-between items-center py-1">
                <span class="text-sm font-medium text-gray-700">{t('ui.combat.hp')}</span>
                <span class="text-sm text-gray-900">
                  ❤️ {formatNumber(enemy.value.hp, locale.value)}
                </span>
              </div>
              <div class="flex justify-between items-center py-1">
                <span class="text-sm font-medium text-gray-700">{t('ui.combat.attack')}</span>
                <span class="text-sm text-gray-900">
                  ⚔️ {formatNumber(enemy.value.attack, locale.value)}
                </span>
              </div>
              <div class="flex justify-between items-center py-1">
                <span class="text-sm font-medium text-gray-700">{t('ui.combat.attackInterval')}</span>
                <span class="text-sm text-gray-900">
                  ⏱️ {(enemy.value.attackInterval / 1000).toFixed(1)}s
                </span>
              </div>
              <div class="flex justify-between items-center py-1">
                <span class="text-sm font-medium text-gray-700">{t('ui.combat.xpReward')}</span>
                <span class="text-sm text-gray-900">
                  ⭐ {formatNumber(enemy.value.xpReward, locale.value)}
                </span>
              </div>
            </div>

            {/* 玩家战斗属性 */}
            <div class="flex flex-col gap-1 p-3 bg-blue-50 rounded-lg">
              <h3 class="text-sm font-semibold text-blue-700 mb-1">
                {t('ui.combat.playerStats')}
              </h3>
              <div class="flex justify-between items-center py-1">
                <span class="text-sm font-medium text-blue-700">{t('ui.combat.hp')}</span>
                <span class="text-sm text-blue-900">
                  ❤️ {formatNumber(playerMaxHp.value, locale.value)}
                </span>
              </div>
              <div class="flex justify-between items-center py-1">
                <span class="text-sm font-medium text-blue-700">{t('ui.combat.attack')}</span>
                <span class="text-sm text-blue-900">
                  ⚔️ {formatNumber(playerDamage.value, locale.value)}
                </span>
              </div>
              <div class="flex justify-between items-center py-1">
                <span class="text-sm font-medium text-blue-700">{t('ui.combat.attackInterval')}</span>
                <span class="text-sm text-blue-900">
                  ⏱️ {(playerAttackInterval.value / 1000).toFixed(1)}s
                </span>
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
                          <ItemTag itemId={loot.itemId} />
                          <span class="text-xs text-gray-600 font-medium">
                            {' '}
                            ×{formatNumber(loot.count, locale.value)}
                          </span>
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

            <div class="flex flex-col gap-3">
              <label class="flex flex-col gap-2">
                <span class="text-sm font-semibold text-gray-900">{t('ui.amount')}</span>
                <div class="flex gap-2">
                  <input
                    type="text"
                    value={amountString.value}
                    onInput={(e) => (amountString.value = (e.target as HTMLInputElement).value)}
                    onFocus={handleAmountFocus}
                    class="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    class="btn btn-secondary"
                    title={t('ui.unlimited')}
                    onClick={() => (amountString.value = '∞')}
                  >
                    ∞
                  </button>
                </div>
              </label>
              <div class="flex gap-3">
                {hasCurrentAction.value && (
                  <button
                    type="button"
                    class="btn-secondary flex-1 py-3 px-4 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!allowAmount.value}
                    onClick={addToQueue}
                  >
                    {t('ui.addToQueue', { position: queuePosition.value })}
                  </button>
                )}
                <button
                  type="button"
                  class="btn-primary flex-1 py-3 px-4 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
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
