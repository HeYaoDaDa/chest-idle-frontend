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
      <div class="flex flex-wrap gap-2">
        {enemyConfigs.length === 0 ? (
          <div class="w-full text-neutral-500 text-center py-8">{t('ui.combat.noEnemies')}</div>
        ) : (
          enemyConfigs.map((enemy) => (
            <button
              key={enemy.id}
              type="button"
              class="card-item w-16 h-16 p-2 text-center"
              onClick={() => handleSelectEnemy(enemy.id)}
              aria-label={t(enemy.name)}
            >
              <div class="text-xs font-semibold text-neutral-900 leading-tight">{t(enemy.name)}</div>
            </button>
          ))
        )}
      </div>
    )
  },
})
