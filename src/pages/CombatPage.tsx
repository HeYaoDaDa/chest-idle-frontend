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
      const enemyInfo = currentEnemy.value

      const renderFighterCard = (side: 'player' | 'enemy') => {
        const isPlayer = side === 'player'
        const currentHp = isPlayer ? battle.playerCurrentHp : battle.enemyCurrentHp
        const maxHp = isPlayer ? combatStore.maxHp : enemyInfo.hp
        const enemyMpStat = (enemyInfo as typeof enemyInfo & { mp?: number }).mp ?? enemyInfo.hp
        const currentMp = isPlayer ? combatStore.maxMp : enemyMpStat
        const maxMp = isPlayer ? combatStore.maxMp : enemyMpStat
        const avatar = isPlayer ? '🧙' : '👾'
        const progress = isPlayer ? battle.playerAttackProgress || 0 : battle.enemyAttackProgress || 0
        const name = isPlayer ? t('ui.combat.playerStats') : t(enemyInfo.name)

        return (
          <div class="flex-1 max-w-xs w-full bg-white rounded-lg overflow-hidden shadow-lg flex flex-col text-gray-900 border border-gray-200">
            {/* 名字 */}
            <div class="py-2 px-4 text-center font-bold text-lg bg-gray-50 border-b border-gray-200 truncate">
              {name}
            </div>

            {/* 状态条区域 */}
            <div class="flex flex-col gap-px bg-gray-200 border-b border-gray-200">
              {/* HP */}
              <div class="h-6 bg-gray-100 relative w-full">
                <div
                  class="h-full bg-emerald-500 transition-none"
                  style={{ width: `${maxHp === 0 ? 0 : Math.min(100, Math.max(0, (currentHp / maxHp) * 100))}%` }}
                />
                <span class="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow-md">
                  {formatNumber(currentHp, locale.value)}/{formatNumber(maxHp, locale.value)}
                </span>
              </div>
              {/* MP */}
              <div class="h-6 bg-gray-100 relative w-full">
                <div
                  class="h-full bg-sky-500 transition-none"
                  style={{ width: `${maxMp === 0 ? 0 : Math.min(100, Math.max(0, (currentMp / maxMp) * 100))}%` }}
                />
                <span class="absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow-md">
                  {formatNumber(currentMp, locale.value)}/{formatNumber(maxMp, locale.value)}
                </span>
              </div>
            </div>

            {/* 头像区域 */}
            <div class="flex-1 flex items-center justify-center py-6 bg-white min-h-[160px]">
              <div class="transform scale-150 text-6xl filter drop-shadow-sm">
                {avatar}
              </div>
            </div>

            {/* 自动攻击条 */}
            <div class="h-8 bg-gray-100 relative w-full mt-auto border-t border-gray-200">
              <div
                class="h-full bg-purple-500 transition-none"
                style={{ width: `${Math.min(100, Math.max(progress * 100, 0))}%` }}
              />
              <span class="absolute inset-0 flex items-center justify-center text-sm font-bold text-white drop-shadow-md">
                {t('ui.combat.autoAttack')}
              </span>
            </div>
          </div>
        )
      }

      return (
        <div class="h-full w-full flex flex-col md:flex-row relative bg-gray-50/30">
          {/* Player Side */}
          <div class="flex-1 flex items-center justify-center p-6 border-b md:border-b-0 md:border-r border-gray-200">
            {renderFighterCard('player')}
          </div>

          {/* VS Badge (Desktop) */}
          <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden md:block">
            <div class="text-3xl font-black text-gray-300 italic bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
              VS
            </div>
          </div>

          {/* Enemy Side */}
          <div class="flex-1 flex items-center justify-center p-6">
            {renderFighterCard('enemy')}
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
              <div class="m-4 p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-none border border-blue-200">
                <h2 class="text-xl font-bold text-gray-900 mb-3">{t('ui.combat.title')}</h2>
                <div class="flex flex-wrap gap-4">
                  {combatSkills.value.map((skill) => (
                    <div
                      key={skill.id}
                      class="flex-1 min-w-[200px] p-3 bg-white rounded-none shadow-sm"
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
