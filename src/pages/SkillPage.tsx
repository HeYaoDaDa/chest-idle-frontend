import { defineComponent, computed, ref, shallowRef, watchEffect } from 'vue'
import { watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { onBeforeRouteUpdate, useRoute } from 'vue-router'

import ConsumableSlot from '@/components/ConsumableSlot'
import { ActionModalBox, ConsumableSelectModal } from '@/components/modals'
import {
  actionConfigListBySkill,
  getSkillTabActionConfigsMapBySkillId,
  skillConfigMap,
} from '@/gameConfig'
import { useSkillStore } from '@/stores/skill'
import { fromFixed } from '@/utils/fixedPoint'
import { formatNumber } from '@/utils/format'

export default defineComponent({
  name: 'SkillPage',
  setup() {
    const { t, locale } = useI18n()
    const route = useRoute()
    const skillId = ref(route.params.id as string)

    const skillStore = useSkillStore()

    const currentTab = ref<string>('')
    const modalVisible = ref(false)
    const selectedActionId = shallowRef<string | undefined>(undefined)
    const consumableModalVisible = ref(false)
    const selectedSlotIndex = ref<number>(0)

    const skill = computed(() => skillStore.getSkill(skillId.value))
    const skillActionTabs = computed(() => getSkillTabActionConfigsMapBySkillId(skillId.value))
    const hasTabGroups = computed(() => Object.keys(skillActionTabs.value).length > 0)
    const availableTabs = computed(() => Array.from(Object.keys(skillActionTabs.value)))

    watchEffect(() => {
      if (hasTabGroups.value && availableTabs.value.length > 0) {
        if (!currentTab.value || !availableTabs.value.includes(currentTab.value)) {
          currentTab.value = availableTabs.value[0]
        }
      }
    })

    const displayedActions = computed(() => {
      if (!hasTabGroups.value) {
        return actionConfigListBySkill[skillId.value] || []
      }
      return skillActionTabs.value[currentTab.value] || []
    })

    const tabEntries = computed(() =>
      availableTabs.value.map((tab) => ({
        id: tab,
        label: t(`action.${tab}.name`),
      })),
    )

    const openModal = (actionId: string) => {
      selectedActionId.value = actionId
      modalVisible.value = true
    }

    const closeModal = () => {
      modalVisible.value = false
      selectedActionId.value = undefined
    }

    const openConsumableModal = (slotIndex: number) => {
      selectedSlotIndex.value = slotIndex
      consumableModalVisible.value = true
    }

    const closeConsumableModal = () => {
      consumableModalVisible.value = false
    }

    const isProductionSkill = computed(() => {
      const skillConfig = skillConfigMap[skillId.value]
      return skillConfig?.skillType === 'production'
    })

    watch(
      () => skillId.value,
      () => {
        if (!hasTabGroups.value) {
          currentTab.value = ''
        }
      },
    )

    onBeforeRouteUpdate(async (to) => {
      skillId.value = to.params.id as string
    })

    return () => {
      if (!skill.value) return null

      return (
        <div class="flex flex-col gap-2 p-4 pb-32">
          <div class="skill-header mb-4">
            <div class="flex justify-between items-baseline mb-2">
              <h2 class="skill-title">{t(skill.value.name)}</h2>
              <div class="heading-level">
                {t('ui.level', { level: skill.value.level })}
              </div>
            </div>
            <div class="skill-description">{t(skill.value.description)}</div>
            <div class="flex gap-6 mb-2">
              <div class="flex flex-col">
                <span class="label-xs">{t('ui.xp')}</span>
                <span class="label-md">
                  {formatNumber(fromFixed(skill.value.xp), locale.value)}
                </span>
              </div>
              <div class="flex flex-col">
                <span class="label-xs">{t('ui.nextLevel')}</span>
                <span class="label-md">
                  {formatNumber(fromFixed(skill.value.remainingXpForUpgrade), locale.value)}
                </span>
              </div>
            </div>
            <div class="progress-track">
              <div
                class="h-full progress-bar"
                style={{ width: skill.value.upgradeProgress * 100 + '%' }}
                role="progressbar"
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow={Math.round(skill.value.upgradeProgress * 100)}
                aria-label={t('ui.progressPercentage')}
              ></div>
            </div>
          </div>

          {hasTabGroups.value && (
            <div class="flex gap-1 mb-2 border-b border-neutral-200">
              {tabEntries.value.map((tab) => (
                <button
                  key={tab.id}
                  class={`btn font-semibold transition border-b-2 cursor-pointer ${
                    currentTab.value === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-neutral-600 hover:text-neutral-900'
                  }`}
                  aria-pressed={currentTab.value === tab.id}
                  onClick={() => (currentTab.value = tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          <div class="flex flex-wrap gap-2">
            {displayedActions.value.map((action) => (
              <button
                key={action.id}
                type="button"
                class="card-item w-16 h-16 flex items-center justify-center p-2"
                onClick={() => openModal(action.id)}
                aria-label={t(action.name)}
                aria-expanded={modalVisible.value && selectedActionId.value === action.id}
              >
                <div class="text-xs font-semibold text-neutral-900 text-center leading-tight">
                  {t(action.name)}
                </div>
              </button>
            ))}
          </div>

          <ActionModalBox
            show={modalVisible.value}
            onClose={closeModal}
            actionId={selectedActionId.value}
          />

          {isProductionSkill.value && (
            <div class="footer-gradient-mask">
              <div class="flex justify-center gap-4">
                {[0, 1, 2].map((slotIndex) => (
                  <ConsumableSlot
                    key={slotIndex}
                    skillId={skillId.value}
                    slotIndex={slotIndex}
                    onSlotClick={openConsumableModal}
                    expanded={consumableModalVisible.value && selectedSlotIndex.value === slotIndex}
                  />
                ))}
              </div>
            </div>
          )}

          <ConsumableSelectModal
            show={consumableModalVisible.value}
            skillId={skillId.value}
            slotIndex={selectedSlotIndex.value}
            onClose={closeConsumableModal}
          />
        </div>
      )
    }
  },
})
