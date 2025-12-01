import { defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'

import { enemyConfigs } from '@/gameConfig'

export default defineComponent({
  name: 'EnemyList',
  emits: ['select'],
  setup(_, { emit }) {
    const { t } = useI18n()

    const handleSelectEnemy = (enemyId: string) => {
      emit('select', enemyId)
    }

    return () => (
      <div class="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2">
        {enemyConfigs.length === 0 ? (
          <div class="col-span-full text-gray-500 text-center py-8">{t('ui.combat.noEnemies')}</div>
        ) : (
          enemyConfigs.map((enemy) => (
            <button
              key={enemy.id}
              type="button"
              class="card-item p-2 flex flex-col items-center gap-2 hover:shadow-md transition-shadow compact-base"
              onClick={() => handleSelectEnemy(enemy.id)}
              aria-label={t(enemy.name)}
            >
              {/* 敌人图标占位 */}
              <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <span class="text-2xl">👾</span>
              </div>
              {/* 敌人名称 */}
              <div class="text-sm font-semibold text-gray-900 text-center">{t(enemy.name)}</div>
              {/* 敌人属性简要 */}
              <div class="flex gap-2 text-xs text-gray-500">
                <span title={t('ui.combat.hp')}>❤️ {enemy.hp}</span>
                <span title={t('ui.combat.attack')}>⚔️ {enemy.attack}</span>
              </div>
            </button>
          ))
        )}
      </div>
    )
  },
})
