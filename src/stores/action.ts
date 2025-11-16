import { defineStore } from 'pinia'

import { actionConfigMap, type ModifierConfigInternal } from '@/gameConfig'
import { type FixedPoint, toFixed, fpMul } from '@/utils/fixedPoint'

import { useSkillStore } from './skill'
import { useStatStore } from './stat'

export interface Action {
  id: string
  sort: number
  tab?: string
  name: string
  description: string
  skillId: string
  minLevel: number
  chestId: string
  ingredients: { itemId: string; count: number }[]
  products: { itemId: string; count: number }[]

  duration: FixedPoint
  xp: FixedPoint
  chestPoints: FixedPoint
}

export const useActionStore = defineStore('action', () => {
  const statStore = useStatStore()
  const skillStore = useSkillStore()

  function getActionById(actionId: string): Action {
    const actionConfig = actionConfigMap[actionId]
    if (!actionConfig) {
      throw new Error(`Action with id ${actionId} not found`)
    }

    // Resolver function to handle skillLevel modifiers
    const resolveModifier = (modifier: ModifierConfigInternal): FixedPoint | undefined => {
      if (modifier.modifierType === 'skillLevel') {
        const currentLevel = skillStore.getSkillLevel(actionConfig.skillId)
        return fpMul(toFixed(currentLevel - actionConfig.minLevel), modifier.perLevelValue)
      }
      return undefined // Let stat.ts handle stat modifiers
    }

    const speedMultiplier = import.meta.env.DEV ? 0.01 : 1

    // 先计算 duration（使用 'self' 模式）
    const duration = fpMul(
      statStore.calculateDerivedValue(actionConfig.duration, 'self', resolveModifier),
      toFixed(speedMultiplier),
    )

    return {
      ...actionConfig,
      ingredients: actionConfig.ingredients ?? [],
      products: actionConfig.products ?? [],
      duration,
      // xp 和 chestPoints 使用计算出的 duration
      xp: statStore.calculateDerivedValue(actionConfig.xp, duration, resolveModifier),
      chestPoints: statStore.calculateDerivedValue(
        actionConfig.chestPoints,
        duration,
        resolveModifier,
      ),
    }
  }

  return {
    getActionById,
  }
})
