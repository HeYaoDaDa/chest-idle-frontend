import { computed, defineComponent, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import EnemyList from '@/components/EnemyList'
import EnemyModalBox from '@/components/modals/EnemyModalBox'
import { enemyConfigMap, skillConfigs } from '@/gameConfig'
import { useActionQueueStore } from '@/stores/actionQueue'
import { useCombatStore } from '@/stores/combat'
import { useNotificationStore } from '@/stores/notification'
import { useSkillStore } from '@/stores/skill'
import { fromFixed } from '@/utils/fixedPoint'
import { formatNumber } from '@/utils/format'

export default defineComponent({
  name: 'CombatPage',
  setup() {
    const { t, locale } = useI18n()
    const skillStore = useSkillStore()
    const combatStore = useCombatStore()
    const actionQueueStore = useActionQueueStore()

    // 标签页状态
    const currentTab = ref<'overview' | 'currentBattle'>('overview')

    // 敌人详情 Modal 状态
    const showEnemyModal = ref(false)
    const selectedEnemyId = ref<string | undefined>(undefined)

    // 获取所有战斗技能
    const combatSkills = computed(() =>
      skillStore.skillList.filter((skill) => {
        const config = skillConfigs.find((c) => c.id === skill.id)
        return config?.skillType === 'combat'
      }),
    )

    // 当前是否正在进行战斗
    const isInBattle = computed(() => combatStore.currentBattle !== null)

    // 可见的标签页列表
    const visibleTabs = computed(() => {
      const tabs: Array<'overview' | 'currentBattle'> = ['overview']
      if (isInBattle.value) {
        tabs.push('currentBattle')
      }
      return tabs
    })

    // 监听战斗状态变化，自动切换标签页
    watch(isInBattle, (inBattle) => {
      if (inBattle) {
        // 开始战斗时自动切换到当前战斗标签页
        currentTab.value = 'currentBattle'
      } else {
        // 战斗结束时切回概览标签页
        if (currentTab.value === 'currentBattle') {
          currentTab.value = 'overview'
        }
      }
    })

    // 当前战斗的敌人信息
    const currentEnemy = computed(() => {
      if (!combatStore.currentBattle) return null
      return enemyConfigMap[combatStore.currentBattle.enemyId] ?? null
    })

    // 选择敌人的处理函数 - 打开 Modal
    const handleSelectEnemy = (enemyId: string) => {
      selectedEnemyId.value = enemyId
      showEnemyModal.value = true
    }

    // 关闭敌人 Modal
    const handleCloseEnemyModal = () => {
      showEnemyModal.value = false
      selectedEnemyId.value = undefined
    }

    // 开始战斗
    const handleStartBattle = (data: { enemyId: string; amount: number }) => {
      const enemy = enemyConfigMap[data.enemyId]
      if (!enemy) return

      // 启动战斗（会创建战斗状态并返回模拟结果）
      const result = combatStore.startBattle(data.enemyId, data.amount)
      if (!result || !result.canWin || !combatStore.currentBattle) {
        // 无法战胜该敌人，显示通知
        const notificationStore = useNotificationStore()
        notificationStore.push('ui.combat.insufficientPower', {}, 'error')
        return
      }

      // 将战斗 action 添加到队列，使用单场战斗时长（秒）
      actionQueueStore.startCombatImmediately(
        data.enemyId,
        data.amount,
        combatStore.currentBattle.singleBattleDurationSeconds,
      )
    }

    // 渲染战斗场景（左右对阵式布局）
    const renderBattleArena = () => {
      if (!isInBattle.value || !currentEnemy.value || !combatStore.currentBattle) return null

      const battle = combatStore.currentBattle

      const statBadge = (label: string, value: string) => (
        <div class="flex justify-between text-xs text-neutral-500 mb-0.5">
          <span>{label}</span>
          <span>{value}</span>
        </div>
      )

      const progressTrack = (value: number, colorClass: string) => (
        <div class="h-3 bg-neutral-50 rounded-full overflow-hidden">
          <div class={`h-full ${colorClass} transition-all duration-300`} style={{ width: `${value}%` }} />
        </div>
      )

      return (
        <div class="flex flex-col gap-3 h-full">
          <div class="panel p-4 flex-1 flex flex-col gap-6">
            <div class="flex flex-col gap-6 lg:flex-row">
              <div class="flex-1 flex flex-col items-stretch gap-3 border border-primary/20 rounded-xl p-4 bg-surface">
                <span class="text-base font-semibold text-neutral-600 text-center">
                  {t('ui.combat.playerStats')}
                </span>
                <div class="flex justify-center">
                  <div class="w-20 h-20 bg-primary/10 rounded-lg flex items-center justify-center text-4xl">
                    🧙
                  </div>
                </div>
                <div>
                  {statBadge(
                    'HP',
                    `${formatNumber(battle.playerCurrentHp, locale.value)}/${formatNumber(combatStore.maxHp, locale.value)}`,
                  )}
                  {progressTrack((battle.playerCurrentHp / combatStore.maxHp) * 100, 'bg-red-500')}
                </div>
                <div>
                  {statBadge(
                    'MP',
                    `${formatNumber(combatStore.maxMp, locale.value)}/${formatNumber(combatStore.maxMp, locale.value)}`,
                  )}
                  {progressTrack(100, 'bg-blue-500')}
                </div>
                <div class="flex gap-1 flex-wrap justify-center">
                  <span class="badge bg-primary/10 text-primary">
                    ⚔️ {formatNumber(combatStore.currentDamage, locale.value)}
                  </span>
                </div>
                <div>
                  <div class="text-xs text-neutral-500 mb-0.5 text-center">
                    {t('ui.combat.attackInterval')}: {combatStore.currentAttackIntervalSeconds.toFixed(1)}s
                  </div>
                  <div class="h-2 bg-neutral-50 rounded-full overflow-hidden">
                    <div
                      class="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-100"
                      style={{ width: `${(battle.playerAttackProgress || 0) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div class="flex-1 flex flex-col items-stretch gap-3 border border-error/20 rounded-xl p-4 bg-surface">
                <span class="text-base font-semibold text-neutral-600 text-center">
                  {t(currentEnemy.value.name)}
                </span>
                <div class="flex justify-center">
                  <div class="w-20 h-20 bg-error/10 rounded-lg flex items-center justify-center text-4xl">
                    👾
                  </div>
                </div>
                <div>
                  {statBadge(
                    'HP',
                    `${formatNumber(battle.enemyCurrentHp, locale.value)}/${formatNumber(currentEnemy.value.hp, locale.value)}`,
                  )}
                  {progressTrack((battle.enemyCurrentHp / currentEnemy.value.hp) * 100, 'bg-red-500')}
                </div>
                <div class="flex gap-1 flex-wrap justify-center">
                  <span class="badge bg-error/10 text-error">
                    ⚔️ {formatNumber(currentEnemy.value.attack, locale.value)}
                  </span>
                </div>
                <div>
                  <div class="text-xs text-neutral-500 mb-0.5 text-center">
                    {t('ui.combat.attackInterval')}: {currentEnemy.value.attackIntervalSeconds.toFixed(1)}s
                  </div>
                  <div class="h-2 bg-neutral-50 rounded-full overflow-hidden">
                    <div
                      class="h-full bg-red-500 transition-all duration-100"
                      style={{ width: `${(battle.enemyAttackProgress || 0) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="panel p-4 text-center">
            <span class="text-sm text-neutral-500 block">{t('ui.combat.remainingBattles')}</span>
            <span class="text-2xl font-bold text-neutral-600">
              {battle.totalAmount === -1 ? '∞' : battle.totalAmount - battle.completedAmount}
            </span>
          </div>
        </div>
      )
    }

    return () => (
      <div class="flex flex-col h-full">
        {/* 标签页导航 */}
        <div class="flex gap-1 px-4 pt-4 border-b border-gray-200">
          {visibleTabs.value.map((tab) => (
            <button
              key={tab}
              class={`btn font-semibold transition border-b-2 cursor-pointer ${
                currentTab.value === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
              aria-pressed={currentTab.value === tab}
              onClick={() => (currentTab.value = tab)}
            >
              {tab === 'overview' ? t('ui.combat.overview') : t('ui.combat.currentBattle')}
            </button>
          ))}
        </div>

        {/* 标签页内容 */}
        <div class="flex-1 min-h-0 overflow-hidden">
          {/* 概览标签页 */}
          {currentTab.value === 'overview' && (
            <div class="h-full overflow-auto">
              {/* 战斗技能 Header */}
              <div class="m-4 p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg border border-blue-200">
                <h2 class="text-xl font-bold text-gray-900 mb-3">{t('ui.combat.title')}</h2>
                <div class="flex flex-wrap gap-4">
                  {combatSkills.value.map((skill) => (
                    <div
                      key={skill.id}
                      class="flex-1 min-w-[200px] p-3 bg-white rounded-lg shadow-sm"
                    >
                      <div class="flex justify-between items-center mb-1">
                        <span class="text-sm font-semibold text-gray-900">{t(skill.name)}</span>
                        <span class="text-xs font-semibold text-blue-700 px-1.5 py-0.5 bg-blue-50 rounded">
                          {t('ui.level', { level: skill.level })}
                        </span>
                      </div>
                      <div class="text-xs text-gray-600 mb-1">{t(skill.description)}</div>
                      <div class="flex gap-4 text-xs text-gray-500 mb-1">
                        <span>
                          {t('ui.xp')}: {formatNumber(fromFixed(skill.xp), locale.value)}
                        </span>
                        <span>
                          {t('ui.nextLevel')}:{' '}
                          {formatNumber(fromFixed(skill.remainingXpForUpgrade), locale.value)}
                        </span>
                      </div>
                      <div class="h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          class="h-full progress-bar"
                          style={{ width: skill.upgradeProgress * 100 + '%' }}
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

              {/* 敌人列表 */}
              <div class="p-4 pt-0">
                <EnemyList onSelect={handleSelectEnemy} />
              </div>
            </div>
          )}

          {/* 当前战斗标签页 */}
          {currentTab.value === 'currentBattle' && renderBattleArena()}
        </div>

        {/* 敌人详情 Modal */}
        <EnemyModalBox
          show={showEnemyModal.value}
          enemyId={selectedEnemyId.value}
          onClose={handleCloseEnemyModal}
          onStartBattle={handleStartBattle}
        />
      </div>
    )
  },
})
