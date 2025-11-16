import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import {
  statConfigMap,
  type DerivedValueConfigInternal,
  type EffectType,
  type ModifierConfigInternal,
} from '@/gameConfig'
import { type FixedPoint, toFixed, fpAdd, fpMul, fpDiv } from '@/utils/fixedPoint'

import { useConsumableStore } from './consumable'

interface Effect {
  statId: string
  type: EffectType
  value: FixedPoint
}

interface Modifier {
  type: EffectType
  value: FixedPoint
  availableMs: number
}

interface Stat {
  id: string
  sort: number
  name: string
  description: string
  base: FixedPoint
  value: FixedPoint
  modifiers: Modifier[]
}
export const useStatStore = defineStore('stat', () => {
  const sourceIdEffectsMap = ref<Record<string, Effect[]>>(Object.create(null))

  const statList = computed(() => {
    const stats: Stat[] = []
    for (const statId in statConfigMap) {
      const stat = getStat(statId)
      if (stat) {
        stats.push(stat)
      }
    }

    stats.sort((a, b) => a.sort - b.sort)
    return stats
  })

  function addEffectsFromSource(sourceId: string, effects: Effect[]): void {
    sourceIdEffectsMap.value[sourceId] = effects
  }

  function removeEffectsFromSource(sourceId: string): void {
    delete sourceIdEffectsMap.value[sourceId]
  }

  function getModifiersByStatId(statId: string): Modifier[] {
    const modifiers: Modifier[] = []
    for (const [sourceId, effects] of Object.entries(sourceIdEffectsMap.value)) {
      let availableMs = Infinity
      if (sourceId.startsWith('consumable:')) {
        // 从 consumable store 获取可用时间
        const consumableStore = useConsumableStore()
        availableMs = consumableStore.getTotalAvailableMsForSource(sourceId)
      }
      for (const effect of effects) {
        if (effect.statId === statId) {
          modifiers.push({
            type: effect.type,
            value: effect.value,
            availableMs,
          })
        }
      }
    }
    return modifiers
  }

  function getStat(statId: string): Stat | undefined {
    const statConfig = statConfigMap[statId]
    if (!statConfig) return undefined
    const modifiers = getModifiersByStatId(statId)
    const value = getStatValue(statId)
    return {
      ...statConfig,
      base: statConfig.base ?? toFixed(0),
      value,
      modifiers,
    }
  }

  function getStatValue(statId: string, duration: number = 0): FixedPoint {
    const statConfig = statConfigMap[statId]
    if (!statConfig) return toFixed(0)
    const modifiers = getModifiersByStatId(statId).filter(
      (modifier) => modifier.availableMs >= duration,
    )
    let sumAdd = toFixed(0)
    let sumPercent = toFixed(0)
    let sumDivisor = toFixed(0)

    for (const { type, value } of modifiers) {
      switch (type) {
        case 'flat':
          sumAdd = fpAdd(sumAdd, value)
          break
        case 'percentage':
          sumPercent = fpAdd(sumPercent, value)
          break
        case 'inversePercentage':
          sumDivisor = fpAdd(sumDivisor, value)
          break
      }
    }
    const base = statConfig.base ?? toFixed(0)
    return fpDiv(
      fpMul(fpAdd(base, sumAdd), fpAdd(toFixed(1), sumPercent)),
      fpAdd(toFixed(1), sumDivisor),
    )
  }

  function getDerivedStatValue(
    derivedStatConfigs: {
      statId: string
      type: EffectType
    }[],
    baseValue: FixedPoint = toFixed(0),
    ...extendModifiers: Modifier[]
  ): FixedPoint {
    let sumAdd = toFixed(0)
    let sumPercent = toFixed(0)
    let sumDivisor = toFixed(0)

    for (const { statId, type } of derivedStatConfigs) {
      const statValue = getStatValue(statId)
      switch (type) {
        case 'flat':
          sumAdd = fpAdd(sumAdd, statValue)
          break
        case 'percentage':
          sumPercent = fpAdd(sumPercent, statValue)
          break
        case 'inversePercentage':
          sumDivisor = fpAdd(sumDivisor, statValue)
          break
      }
    }

    for (const { type, value } of extendModifiers) {
      switch (type) {
        case 'flat':
          sumAdd = fpAdd(sumAdd, value)
          break
        case 'percentage':
          sumPercent = fpAdd(sumPercent, value)
          break
        case 'inversePercentage':
          sumDivisor = fpAdd(sumDivisor, value)
          break
      }
    }

    return fpDiv(
      fpMul(fpAdd(baseValue, sumAdd), fpAdd(toFixed(1), sumPercent)),
      fpAdd(toFixed(1), sumDivisor),
    )
  }

  function calculateDerivedValue(
    config: DerivedValueConfigInternal,
    duration: number | 'self' = 0,
    resolveModifierValue?: (modifier: ModifierConfigInternal) => FixedPoint | undefined,
  ): FixedPoint {
    // 处理 'self' 模式：迭代计算直到收敛
    if (duration === 'self') {
      let prevValue = toFixed(0) // 从 0 开始，假设所有效果都可用
      let iterations = 0
      const maxIterations = 10 // 防止无限循环

      while (iterations < maxIterations) {
        const currentValue = calculateWithDuration(config, prevValue, resolveModifierValue)
        if (Math.abs(currentValue - prevValue) < 1) {
          return currentValue
        }
        prevValue = currentValue
        iterations++
      }
      return prevValue
    }

    return calculateWithDuration(config, toFixed(duration as number), resolveModifierValue)
  }

  function calculateWithDuration(
    config: DerivedValueConfigInternal,
    duration: FixedPoint,
    resolveModifierValue?: (modifier: ModifierConfigInternal) => FixedPoint | undefined,
  ): FixedPoint {
    const modifiers = config.modifiers ?? []

    if (modifiers.length === 0) {
      return config.baseValue
    }

    let sumAdd = toFixed(0)
    let sumPercent = toFixed(0)
    let sumDivisor = toFixed(0)

    const applyModifier = (type: EffectType, value: FixedPoint) => {
      switch (type) {
        case 'flat':
          sumAdd = fpAdd(sumAdd, value)
          break
        case 'percentage':
          sumPercent = fpAdd(sumPercent, value)
          break
        case 'inversePercentage':
          sumDivisor = fpAdd(sumDivisor, value)
          break
      }
    }

    for (const modifier of modifiers) {
      // Ask the caller if they can handle this modifier
      const customValue = resolveModifierValue?.(modifier)

      if (customValue !== undefined) {
        // Caller provided a value
        applyModifier(modifier.type, customValue)
      } else if (modifier.modifierType === 'stat') {
        // Default handling for stat modifiers - 传递 duration 参数来过滤效果
        const statValue = getStatValue(modifier.statId, duration)
        applyModifier(modifier.type, statValue)
      }
    }

    return fpDiv(
      fpMul(fpAdd(config.baseValue, sumAdd), fpAdd(toFixed(1), sumPercent)),
      fpAdd(toFixed(1), sumDivisor),
    )
  }

  return {
    sourceIdEffectsMap,

    statList,

    addEffectsFromSource,
    removeEffectsFromSource,
    getModifiersByStatId,

    getStat,
    getStatValue,
    getDerivedStatValue,
    calculateDerivedValue,
  }
})
