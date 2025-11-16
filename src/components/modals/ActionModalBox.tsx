import { computed, defineComponent, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import ModalBox from '@/components/ModalBox'
import { itemConfigMap } from '@/gameConfig'
import { useActionStore } from '@/stores/action'
import { useActionQueueStore } from '@/stores/actionQueue'
import { useInventoryStore } from '@/stores/inventory'
import { useSkillStore } from '@/stores/skill'
import { INFINITE_AMOUNT } from '@/utils/constants'
import { fromFixed, toFixed } from '@/utils/fixedPoint'
import { formatDurationMs, formatNumber } from '@/utils/format'

export default defineComponent({
  name: 'ActionModalBox',
  props: {
    show: { type: Boolean, required: true },
    actionId: { type: String, default: undefined },
  },
  emits: ['close'],
  setup(props, { emit }) {
    const { t, locale } = useI18n()
    const inventoryStore = useInventoryStore()
    const skillStore = useSkillStore()
    const actionStore = useActionStore()
    const actionQueueStore = useActionQueueStore()

    const amountString = ref('∞')

    const action = computed(() => {
      if (!props.actionId) return null
      return actionStore.getActionById(props.actionId)
    })

    function isIntegerOrInfinity(str: string): boolean {
      const pattern = /^-?\d+$|^∞$/
      return pattern.test(str)
    }

    function stringToNumber(str: string): number {
      if (str === '∞') return INFINITE_AMOUNT
      const num = Number(str)
      if (!isNaN(num) && Number.isInteger(num)) {
        return num
      }
      return INFINITE_AMOUNT
    }

    const skill = computed(() => {
      if (!action.value) return null
      return skillStore.getSkill(action.value.skillId)
    })

    const allowAmount = computed(() => isIntegerOrInfinity(amountString.value))
    const durationDisplay = computed(() =>
      formatDurationMs(fromFixed(action.value?.duration ?? toFixed(0)), locale.value, {
        maxFractionDigits: 3,
      }),
    )
    const xpPerCycle = computed(() => fromFixed(action.value?.xp ?? toFixed(0)))
    const chestPointsPerCycle = computed(() => fromFixed(action.value?.chestPoints ?? toFixed(0)))
    const hasIngredients = computed(() => (action.value?.ingredients.length ?? 0) > 0)
    const hasProducts = computed(() => (action.value?.products.length ?? 0) > 0)
    const hasCurrentAction = computed(() => !!actionQueueStore.currentAction)
    const queuePosition = computed(() => actionQueueStore.queueLength + 1)

    const isLevelInsufficient = computed(() => {
      if (!action.value || !skill.value) return false
      return skill.value.level < action.value.minLevel
    })

    const insufficientIngredients = computed(() => {
      if (!action.value || !('ingredients' in action.value)) return [] as string[]
      const lack: string[] = []
      for (const ingredient of action.value.ingredients) {
        const available = inventoryStore.inventoryMap[ingredient.itemId] ?? 0
        if (available < ingredient.count) lack.push(ingredient.itemId)
      }
      return lack
    })

    const hasInsufficientIngredients = computed(() => insufficientIngredients.value.length > 0)

    const canStartAction = computed(() => {
      if (!action.value) return { canStart: false, reasons: [] }

      const reasons: string[] = []

      if (skill.value && skill.value.level < action.value.minLevel) {
        reasons.push(
          t('notification.levelTooLow', {
            skill: t(skill.value.name),
            level: skill.value.level,
            required: action.value.minLevel,
            action: t(action.value.name),
          }),
        )
      }

      if ('ingredients' in action.value && action.value.ingredients.length > 0) {
        for (const ingredient of action.value.ingredients) {
          const available = inventoryStore.inventoryMap[ingredient.itemId] ?? 0
          const itemConfig = itemConfigMap[ingredient.itemId]
          if (available < ingredient.count) {
            reasons.push(
              t('ui.insufficientMaterial', {
                item: t(itemConfig.name),
                required: ingredient.count,
                available: available,
              }),
            )
          }
        }
      }

      return {
        canStart: reasons.length === 0,
        reasons,
      }
    })

    const closeModal = () => {
      emit('close')
      amountString.value = '∞'
    }

    const addAction = () => {
      if (action.value) {
        actionQueueStore.addAction(action.value.id, stringToNumber(amountString.value))
        closeModal()
      }
    }

    const startImmediately = () => {
      if (action.value) {
        actionQueueStore.startImmediately(action.value.id, stringToNumber(amountString.value))
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
      if (!props.show || !action.value) return null

      return (
        <ModalBox onClose={closeModal}>
          <div class="flex flex-col gap-3 min-w-[min(420px,100%)]">
            <div class="flex justify-between items-start gap-4">
              <div class="flex flex-col gap-2">
                <span class="text-xs uppercase tracking-wider text-gray-500">
                  {skill.value ? t(skill.value.name) : ''}
                </span>
                <h2 class="text-2xl font-bold text-gray-900 leading-tight">
                  {t(action.value.name)}
                </h2>
                <p class="text-gray-600 text-sm leading-normal">{t(action.value.description)}</p>
              </div>
            </div>

            <div class="flex flex-col gap-1">
              <div
                class={[
                  'flex justify-between items-center py-1',
                  isLevelInsufficient.value ? 'text-red-600' : '',
                ]}
              >
                <span class="text-sm font-medium">{t('minLevelRequired')}</span>
                <span class="text-sm">{action.value.minLevel}</span>
              </div>
              <div class="flex justify-between items-center py-1">
                <span class="text-sm font-medium text-gray-700">{t('duration')}</span>
                <span class="text-sm text-gray-900">{durationDisplay.value}</span>
              </div>
              <div class="flex justify-between items-center py-1">
                <span class="text-sm font-medium text-gray-700">{t('ui.xpPerCycle')}</span>
                <span class="text-sm text-gray-900">
                  {formatNumber(xpPerCycle.value, locale.value)}
                </span>
              </div>
              <div class="flex justify-between items-center py-1">
                <span class="text-sm font-medium text-gray-700">{t('ui.chestPoints')}</span>
                <span class="text-sm text-gray-900">
                  {formatNumber(chestPointsPerCycle.value, locale.value, 3)}
                </span>
              </div>
              <div class="flex justify-between items-center py-1">
                <span class="text-sm font-medium text-gray-700">{t('ui.chest')}</span>
                <span class="text-sm text-gray-900">
                  {t(itemConfigMap[action.value.chestId].name)}
                </span>
              </div>

              <div
                class={[
                  'flex justify-between items-start py-2',
                  hasIngredients.value && hasInsufficientIngredients.value ? 'text-red-600' : '',
                ]}
              >
                <span class="text-sm font-medium">{t('ui.requiredMaterials')}</span>
                <span class="text-sm text-right">
                  {hasIngredients.value && action.value ? (
                    action.value.ingredients.map((ingredient, idx) => (
                      <span key={ingredient.itemId}>
                        {t(itemConfigMap[ingredient.itemId].name)} ×
                        {formatNumber(ingredient.count, locale.value)}
                        {idx < action.value!.ingredients.length - 1 && '，'}
                      </span>
                    ))
                  ) : (
                    <span>{t('ui.noMaterialsRequired')}</span>
                  )}
                </span>
              </div>

              <div class="flex justify-between items-start py-1">
                <span class="text-sm font-medium text-gray-700">{t('ui.rewards')}</span>
                <span class="text-sm text-gray-900 text-right">
                  {hasProducts.value && action.value ? (
                    action.value.products.map((product, idx) => (
                      <span key={product.itemId}>
                        {t(itemConfigMap[product.itemId].name)} ×
                        {formatNumber(product.count, locale.value)}
                        {idx < action.value!.products.length - 1 && '，'}
                      </span>
                    ))
                  ) : (
                    <span>{t('ui.noRewards')}</span>
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
                    class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded font-medium transition-colors"
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
                    disabled={!allowAmount.value || !canStartAction.value.canStart}
                    onClick={addAction}
                  >
                    {t('ui.addToQueue', { position: queuePosition.value })}
                  </button>
                )}
                <button
                  type="button"
                  class="btn-primary flex-1 py-3 px-4 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!allowAmount.value || !canStartAction.value.canStart}
                  onClick={hasCurrentAction.value ? startImmediately : addAction}
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
