import { computed, defineComponent, onUnmounted, type PropType, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import type { CombatEvent } from '@/utils/combatSimulator'

/**
 * 战斗事件日志组件
 *
 * 显示战斗事件的实时回放，根据战斗进度高亮当前事件
 */
export default defineComponent({
  name: 'BattleEventLog',
  props: {
    /** 战斗事件列表 */
    events: {
      type: Array as PropType<CombatEvent[]>,
      required: true,
    },
    /** 战斗总时长（秒） */
    totalDurationSeconds: {
      type: Number,
      required: true,
    },
    /** 战斗开始时间（performance.now()） */
    startTime: {
      type: Number,
      required: true,
    },
    /** 是否正在战斗中 */
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const { t } = useI18n()

    // 当前时间进度（秒）
    const currentTimeSeconds = ref(0)

    // 更新当前时间
    let animationFrame: number | null = null

    const tick = () => {
      if (props.isActive && props.startTime > 0) {
        currentTimeSeconds.value = (performance.now() - props.startTime) / 1000
        animationFrame = requestAnimationFrame(tick)
      } else {
        stopTicker()
      }
    }

    const startTicker = () => {
      stopTicker()
      animationFrame = requestAnimationFrame(tick)
    }

    const stopTicker = () => {
      if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame)
        animationFrame = null
      }
    }

    watch(
      () => props.isActive,
      (isActive) => {
        if (isActive) {
          startTicker()
        } else {
          stopTicker()
        }
      },
      { immediate: true },
    )

    watch(
      () => props.startTime,
      () => {
        currentTimeSeconds.value = 0
        if (props.isActive) {
          startTicker()
        }
      },
    )

    onUnmounted(() => {
      stopTicker()
    })

    // 当前正在发生的事件索引
    const currentEventIndex = computed(() => {
      if (!props.isActive) return -1
      // 找到第一个时间 > currentTimeSeconds 的事件的前一个
      for (let i = props.events.length - 1; i >= 0; i--) {
        if (props.events[i].timeSeconds <= currentTimeSeconds.value) {
          return i
        }
      }
      return -1
    })

    // 格式化时间（秒，保留1位小数）
    const formatTime = (seconds: number) => {
      return seconds.toFixed(1) + 's'
    }

    // 获取事件图标
    const getEventIcon = (event: CombatEvent) => {
      if (event.actorSide === 'player') {
        return '⚔️'
      } else {
        return '💥'
      }
    }

    // 获取目标方（根据攻击方推断）
    const getTargetSide = (event: CombatEvent): 'player' | 'enemy' => {
      return event.actorSide === 'player' ? 'enemy' : 'player'
    }

    // 获取事件样式类
    const getEventClass = (event: CombatEvent, index: number) => {
      const isCurrentEvent = index === currentEventIndex.value
      const isPastEvent = event.timeSeconds <= currentTimeSeconds.value
      const isPlayerAction = event.actorSide === 'player'

      return [
        'flex items-start gap-2 p-1 rounded-none transition-all duration-300 divider',
        isPastEvent ? 'opacity-100' : 'opacity-30',
        isCurrentEvent ? 'bg-yellow-100 border border-yellow-300 scale-102' : '',
        isPlayerAction ? 'bg-primary/5' : 'bg-error/5',
      ]
    }

    // 生成事件描述
    const getEventDescription = (event: CombatEvent) => {
      const actorName =
        event.actorSide === 'player'
          ? t('ui.combat.eventLog.player')
          : t('ui.combat.eventLog.enemy')
      const targetSide = getTargetSide(event)
      const targetName =
        targetSide === 'player' ? t('ui.combat.eventLog.player') : t('ui.combat.eventLog.enemy')

      return t('ui.combat.eventLog.attackEvent', {
        actor: actorName,
        target: targetName,
        damage: event.damage,
      })
    }

    return () => (
      <div class="flex flex-col gap-2">
        {/* 标题和时间进度 */}
        <div class="flex justify-between items-center mb-1">
          <h4 class="text-md font-semibold text-neutral-700">{t('ui.combat.eventLog.title')}</h4>
          <span class="text-sm text-neutral-500">
            {formatTime(Math.min(currentTimeSeconds.value, props.totalDurationSeconds))} /{' '}
            {formatTime(props.totalDurationSeconds)}
          </span>
        </div>

        {/* 事件列表 */}
        <div class="max-h-64 overflow-y-auto space-y-1 pr-1">
          {props.events.length === 0 ? (
            <div class="text-center text-neutral-400 py-4">{t('ui.combat.eventLog.noEvents')}</div>
          ) : (
            props.events.map((event, index) => {
              const targetSide = getTargetSide(event)
              return (
                <div key={`${event.timeSeconds}-${index}`} class={getEventClass(event, index)}>
                  {/* 时间戳 */}
                  <div class="flex-shrink-0 w-10 text-xs text-neutral-500 font-mono">
                    {formatTime(event.timeSeconds)}
                  </div>

                  {/* 事件图标 */}
                  <div class="flex-shrink-0 text-lg">{getEventIcon(event)}</div>

                  {/* 事件内容 */}
                  <div class="flex-1 min-w-0">
                    <div class="text-sm text-neutral-800">{getEventDescription(event)}</div>
                    <div class="flex gap-2 text-xs text-neutral-500 mt-1">
                      {/* HP 变化 */}
                      <span class={targetSide === 'player' ? 'damage-player' : 'damage-enemy'}>
                        {targetSide === 'player' ? '❤️ ' : '💀 '}
                        {event.targetHpAfter} HP
                      </span>

                      {/* 是否击杀 */}
                      {event.targetHpAfter <= 0 && (
                        <span class="text-orange-600 font-semibold">
                          {targetSide === 'enemy'
                            ? t('ui.combat.eventLog.enemyDefeated')
                            : t('ui.combat.eventLog.playerDefeated')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* 战斗总结（战斗结束后显示） */}
        {!props.isActive && props.events.length > 0 && (
          <div class="mt-2 p-2 bg-success/10 rounded-md border border-success/30">
            <div class="text-sm font-semibold text-success">
              {t('ui.combat.eventLog.battleComplete')}
            </div>
            <div class="text-xs text-success/80 mt-1">
              {t('ui.combat.eventLog.totalEvents', { count: props.events.length })}
            </div>
          </div>
        )}
      </div>
    )
  },
})
