import { defineStore } from 'pinia'

import { actionConfigMap, type ModifierConfigInternal } from '@/gameConfig'
import { type FixedPoint, type SecondsFixed, toFixed, fpMul } from '@/utils/fixedPoint'

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

  /** 行动持续时间（秒），使用 FixedPoint 表示 */
  durationSeconds: SecondsFixed
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

    const speedMultiplier = import.meta.env.DEV ? 1 : 1

    // 先计算 durationSeconds（使用 'self' 模式）
    const durationSeconds = fpMul(
      statStore.calculateDerivedValue(actionConfig.durationSeconds, 'self', resolveModifier),
      toFixed(speedMultiplier),
    )

    return {
      ...actionConfig,
      ingredients: actionConfig.ingredients ?? [],
      products: actionConfig.products ?? [],
      durationSeconds,
      // xp 和 chestPoints 使用计算出的 durationSeconds
      xp: statStore.calculateDerivedValue(actionConfig.xp, durationSeconds, resolveModifier),
      chestPoints: statStore.calculateDerivedValue(
        actionConfig.chestPoints,
        durationSeconds,
        resolveModifier,
      ),
    }
  }

  return {
    getActionById,
  }
})
