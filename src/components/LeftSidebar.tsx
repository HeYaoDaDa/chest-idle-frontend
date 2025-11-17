import { defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'

import { useSkillStore } from '@/stores/skill'

export default defineComponent({
  name: 'LeftSidebar',
  setup() {
    const { t } = useI18n()
    const skillStore = useSkillStore()

    return () => (
      <div class="flex flex-col gap-0.5 p-0.5 overflow-y-auto h-full">
        <RouterLink
          to="/game/inventory"
          activeClass="!bg-gradient-to-br !from-primary !to-blue-500 !text-white !shadow-lg"
          class="lg:hidden nav-link"
        >
          <div class="text-xs text-center">{t('ui.inventory').substring(0, 2)}</div>
        </RouterLink>

        <RouterLink
          to="/game/chests"
          activeClass="!bg-gradient-to-br !from-primary !to-blue-500 !text-white !shadow-lg"
          class="nav-link"
        >
          <div class="text-xs lg:text-base text-center lg:text-left">
            {t('ui.chests').substring(0, 2)}
          </div>
        </RouterLink>

        {skillStore.skillList.map((skill) => (
          <RouterLink
            key={skill.id}
            to={`/game/${skill.id}`}
            activeClass="!bg-gradient-to-br !from-primary !to-blue-500 !text-white !shadow-lg"
            class="nav-link"
          >
            <div class="lg:hidden text-xs text-center">{t(skill.name).substring(0, 2)}</div>

            <div class="hidden lg:flex lg:justify-between lg:items-baseline gap-2 text-base">
              <span class="flex-shrink-0">{t(skill.name)}</span>
              <span class="text-[10px] opacity-80">{t('ui.level', { level: skill.level })}</span>
            </div>
            <div class="hidden lg:block w-full">
              <div class="h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  class="progress-bar duration-75"
                  style={{ width: skill.upgradeProgress * 100 + '%' }}
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
      </div>
    )
  },
})
