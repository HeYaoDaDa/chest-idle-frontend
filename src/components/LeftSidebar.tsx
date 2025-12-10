import { computed, defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRoute } from 'vue-router'

import { skillConfigs } from '@/gameConfig'
import { useSkillStore } from '@/stores/skill'

export default defineComponent({
  name: 'LeftSidebar',
  setup() {
    const { t } = useI18n()
    const skillStore = useSkillStore()
    const route = useRoute()

    // 分离 production 和 combat 技能
    const productionSkills = computed(() =>
      skillStore.skillList.filter((skill) => {
        const config = skillConfigs.find((c) => c.id === skill.id)
        return config?.skillType === 'production'
      }),
    )

    const combatSkills = computed(() =>
      skillStore.skillList.filter((skill) => {
        const config = skillConfigs.find((c) => c.id === skill.id)
        return config?.skillType === 'combat'
      }),
    )

    // 判断当前是否在战斗页面
    const isCombatActive = computed(() => route.path === '/game/combat')

    return () => (
      <div class="flex flex-col gap-0.5 p-0.5 overflow-y-auto h-full">
        <RouterLink
          to="/game/inventory"
          activeClass="nav-link-active"
          class="lg:hidden nav-link"
        >
          <div class="text-xs text-center">{t('ui.inventory').substring(0, 2)}</div>
        </RouterLink>

        <RouterLink
          to="/game/chests"
          activeClass="nav-link-active"
          class="nav-link"
        >
          <div class="lg:hidden text-xs text-center">{t('ui.chests').substring(0, 2)}</div>
          <div class="hidden lg:block text-base">{t('ui.chests')}</div>
          <div class="hidden lg:block h-1"></div>
        </RouterLink>

        {/* Production 技能 - 保持原有逻辑 */}
        {productionSkills.value.map((skill) => (
          <RouterLink
            key={skill.id}
            to={`/game/${skill.id}`}
            activeClass="nav-link-active"
            class="nav-link"
          >
            <div class="lg:hidden text-xs text-center">{t(skill.name).substring(0, 2)}</div>

            <div class="hidden lg:flex lg:justify-between lg:items-baseline gap-2 text-base">
              <span class="flex-shrink-0">{t(skill.name)}</span>
              <span class="text-[10px] opacity-80">{t('ui.level', { level: skill.level })}</span>
            </div>
            <div class="hidden lg:block w-full">
              <div class="progress-track-thin">
                <div
                  class="progress-bar duration-75 dynamic-width"
                  style={{ '--width': skill.upgradeProgress * 100 + '%' } as Record<string, string>}
                  role="progressbar"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  aria-valuenow={Math.round(skill.upgradeProgress * 100)}
                  aria-label={t('ui.progressPercentage')}
                ></div>
              </div>
            </div>
          </RouterLink>
        ))}

        {/* Combat 技能分组 - 整体点击跳转到 /game/combat */}
        {combatSkills.value.length > 0 && (
          <RouterLink
            to="/game/combat"
            data-testid="combat-wrapper"
            class={[
              'nav-link flex flex-col gap-0.5 cursor-pointer',
              isCombatActive.value
                ? 'nav-link-active'
                : '',
            ]}
          >
            {/* 移动端: 简短显示 */}
            <div class="lg:hidden text-xs text-center">{t('ui.combat.title').substring(0, 2)}</div>

            {/* 桌面端: 显示标题和所有 combat 技能 */}
            <div class="hidden lg:block">
              <div class="text-base mb-1">{t('ui.combat.title')}</div>
              <div class="flex flex-col gap-1 pl-2 border-l-2 border-current/20">
                {combatSkills.value.map((skill) => (
                  <div key={skill.id} class="flex flex-col gap-0.5">
                    <div class="flex justify-between items-baseline gap-2 text-base">
                      <span class="flex-shrink-0">{t(skill.name)}</span>
                      <span class="text-[10px] opacity-80">
                        {t('ui.level', { level: skill.level })}
                      </span>
                    </div>
                    <div class="progress-track-thin">
                      <div
                        class="progress-bar duration-75 dynamic-width"
                        style={{ '--width': skill.upgradeProgress * 100 + '%' } as Record<string, string>}
                        role="progressbar"
                        aria-valuemin="0"
                        aria-valuemax="100"
                        aria-valuenow={Math.round(skill.upgradeProgress * 100)}
                        aria-label={t('ui.progressPercentage')}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </RouterLink>
        )}
      </div>
    )
  },
})
