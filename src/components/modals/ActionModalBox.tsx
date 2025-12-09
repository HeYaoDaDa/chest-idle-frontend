import { computed, defineComponent, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import ItemTag from '@/components/ItemTag'
import ModalBox from '@/components/ModalBox'
import { useAmountInput, useQueueAction } from '@/composables'
import { itemConfigMap } from '@/gameConfig'
import { useActionStore } from '@/stores/action'
import { useActionQueueStore } from '@/stores/actionQueue'
import { useInventoryStore } from '@/stores/inventory'
import { useSkillStore } from '@/stores/skill'
import { parseAmountString } from '@/utils/amountParser'
import { fromFixed, toFixed } from '@/utils/fixedPoint'
import { formatDurationMs, formatNumber } from '@/utils/format'

import type { BaseModalProps } from './types'

export default defineComponent({
  name: 'ActionModalBox',
  props: {
    show: { type: Boolean, required: true },
    actionId: { type: String, default: undefined },
  },
  emits: ['close'],
  setup(props: BaseModalProps & { actionId?: string }, { emit }) {
    const { t, locale } = useI18n()
    const inventoryStore = useInventoryStore()
    const skillStore = useSkillStore()
    const actionStore = useActionStore()
    const actionQueueStore = useActionQueueStore()

    // Use composables for amount input and queue management
    const { amountString, allowAmount, resetAmount } = useAmountInput({ defaultValue: '∞' })
    const { hasCurrentAction, queuePosition, closeModal: closeModalFromComposable } = useQueueAction(emit)

    // Override closeModal to also reset amount
    const closeModal = () => {
      closeModalFromComposable()
      resetAmount()
    }

    const action = computed(() => {
      if (!props.actionId) return null
      return actionStore.getActionById(props.actionId)
    })

    const skill = computed(() => {
      if (!action.value) return null
      return skillStore.getSkill(action.value.skillId)
    })

    const durationDisplay = computed(() => {
      const durationSeconds = action.value?.durationSeconds ?? toFixed(0)
      const durationMs = fromFixed(durationSeconds) * 1000
      return formatDurationMs(durationMs, locale.value, {
        maxFractionDigits: 3,
      })
    })
    const xpPerCycle = computed(() => fromFixed(action.value?.xp ?? toFixed(0)))
    const chestPointsPerCycle = computed(() => fromFixed(action.value?.chestPoints ?? toFixed(0)))
    const hasIngredients = computed(() => (action.value?.ingredients.length ?? 0) > 0)
    const hasProducts = computed(() => (action.value?.products.length ?? 0) > 0)

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

    const addAction = () => {
      if (action.value) {
        actionQueueStore.addAction(action.value.id, parseAmountString(amountString.value))
        closeModal()
      }
    }

    const startImmediately = () => {
      if (action.value) {
        actionQueueStore.startImmediately(action.value.id, parseAmountString(amountString.value))
        closeModal()
      }
    }

    // Selection of the amount input is now handled on click instead of focus

    watch(
      () => props.show,
      (newValue) => {
        if (!newValue) {
          resetAmount()
        }
      },
    )

    return () => {
      if (!props.show || !action.value) return null

      return (
        <ModalBox onClose={closeModal}>
          <div class="flex flex-col gap-1 min-w-[min(380px,100%)]">
            <div class="flex justify-between items-start gap-2">
              <div class="flex flex-col gap-2">
                <span class="text-xs uppercase tracking-wider text-neutral-500">
                  {skill.value ? t(skill.value.name) : ''}
                </span>
                <h2 class="heading-modal leading-tight">
                  {t(action.value.name)}
                </h2>
                <p class="text-neutral-600 text-sm leading-normal">{t(action.value.description)}</p>
              </div>
            </div>

            <div class="flex flex-col gap-1">
              <div
                class={[
                  'flex justify-between items-center py-1',
                  isLevelInsufficient.value ? 'text-error' : '',,
                ]}
              >
                <span class="text-sm font-medium">{t('minLevelRequired')}</span>
                <span class="text-sm">{action.value.minLevel}</span>
              </div>
              <div class="flex justify-between items-center py-1">
                <span class="text-sm font-medium text-neutral-700">{t('duration')}</span>
                <span class="text-sm text-neutral-900">{durationDisplay.value}</span>
              </div>
              <div class="flex justify-between items-center py-1">
                <span class="text-sm font-medium text-neutral-700">{t('ui.xpPerCycle')}</span>
                <span class="text-sm text-neutral-900">
                  {formatNumber(xpPerCycle.value, locale.value)}
                </span>
              </div>
              <div class="flex justify-between items-center py-1">
                <span class="text-sm font-medium text-neutral-700">{t('ui.chestPoints')}</span>
                <span class="text-sm text-neutral-900">
                  {formatNumber(chestPointsPerCycle.value, locale.value, 3)}
                </span>
              </div>
              <div class="flex justify-between items-center py-1">
                <span class="text-sm font-medium text-neutral-700">{t('ui.chest')}</span>
                <span class="text-sm text-neutral-900">
                  <ItemTag itemId={action.value.chestId} />
                </span>
              </div>

              <div
                class={[
                  'flex justify-between items-start py-1',
                  hasIngredients.value && hasInsufficientIngredients.value ? 'text-error' : '',,
                ]}
              >
                <span class="text-sm font-medium">{t('ui.requiredMaterials')}</span>
                <span class="text-sm text-right">
                  {hasIngredients.value && action.value ? (
                    action.value.ingredients.map((ingredient, idx) => (
                      <span key={ingredient.itemId}>
                        <span class="text-xs text-neutral-600 font-medium">
                          {formatNumber(ingredient.count, locale.value)}
                        </span>
                        <ItemTag itemId={ingredient.itemId} />
                        {idx < action.value!.ingredients.length - 1 && '，'}
                      </span>
                    ))
                  ) : (
                    <span>{t('ui.noMaterialsRequired')}</span>
                  )}
                </span>
              </div>

              <div class="flex justify-between items-start py-1">
                <span class="text-sm font-medium text-neutral-700">{t('ui.rewards')}</span>
                <span class="text-sm text-neutral-900 text-right">
                  {hasProducts.value && action.value ? (
                    action.value.products.map((product, idx) => (
                      <span key={product.itemId}>
                        <span class="text-xs text-neutral-600 font-medium">
                          {formatNumber(product.count, locale.value)}
                        </span>
                        <ItemTag itemId={product.itemId} />
                        {idx < action.value!.products.length - 1 && '，'}
                      </span>
                    ))
                  ) : (
                    <span>{t('ui.noRewards')}</span>
                  )}
                </span>
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <label class="flex flex-col gap-2">
                <span class="text-sm font-semibold text-neutral-900">{t('ui.amount')}</span>
                <div class="flex gap-2">
                  <input
                    type="text"
                    value={amountString.value}
                    onInput={(e) => (amountString.value = (e.target as HTMLInputElement).value)}
                    data-autofocus-ignore
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                    class="input-base flex-1 py-1"
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
                    class="btn-secondary flex-1"
                    disabled={!allowAmount.value || !canStartAction.value.canStart}
                    onClick={addAction}
                  >
                    {t('ui.addToQueue', { position: queuePosition.value })}
                  </button>
                )}
                <button
                  type="button"
                  class="btn-primary flex-1"
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
