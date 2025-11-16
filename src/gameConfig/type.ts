export type {
  SkillConfig,
  SlotConfig,
  StatConfig,
  ItemConfig,
  ActionConfig,
  GameConfig,
  EffectType,
  EffectConfig,
  LootEntryConfig,
  StatModifierConfig,
  SkillLevelModifierConfig,
  ModifierConfig,
  DerivedValueConfig,
}

type GameConfig = SkillConfig | SlotConfig | StatConfig | ItemConfig | ActionConfig

interface SkillConfig {
  type: 'skill'
  id: string
  sort: number
  skillType: 'production' | 'combat'
  name: string
  description: string
}

interface SlotConfig {
  type: 'slot'
  id: string
  sort: number
  name: string
  description: string
}

interface StatConfig {
  type: 'stat'
  id: string
  sort: number
  base?: number
  name: string
  description: string
}

interface ItemConfig {
  type: 'item'
  category: 'resource' | 'chest' | 'equipment' | 'consumable'
  id: string
  sort: number
  chest?: {
    maxPoints: number
    loots: LootEntryConfig[]
  }
  equipment?: {
    slotId: string
    effects: EffectConfig[]
  }
  consumable?: {
    duration: number
    consumableType: string
    effects: EffectConfig[]
  }
  name: string
  description: string
}

interface ActionConfig {
  type: 'action'
  id: string
  skillId: string
  tab?: string
  minLevel: number
  sort: number
  duration: DerivedValueConfig
  xp: DerivedValueConfig
  chestId: string
  chestPoints: DerivedValueConfig
  ingredients?: { itemId: string; count: number }[]
  products: { itemId: string; count: number }[]
  name: string
  description: string
}

type EffectType = 'flat' | 'percentage' | 'inversePercentage'

interface StatModifierConfig {
  modifierType: 'stat'
  statId: string
  type: EffectType
}

interface SkillLevelModifierConfig {
  modifierType: 'skillLevel'
  type: EffectType
  perLevelValue: number
}

type ModifierConfig = StatModifierConfig | SkillLevelModifierConfig

interface DerivedValueConfig {
  baseValue: number
  modifiers?: ModifierConfig[]
}

interface EffectConfig {
  statId: string
  type: EffectType
  value: number
}

interface LootEntryConfig {
  itemId: string
  chance: number
  min: number
  max: number
}

// ==================== 内部类型（使用定点数） ====================

import type { FixedPoint } from '@/utils/fixedPoint'

/**
 * 派生值配置（内部使用定点数）
 */
export interface DerivedValueConfigInternal {
  baseValue: FixedPoint
  modifiers?: ModifierConfigInternal[]
}

/**
 * 修饰符配置（内部使用定点数）
 */
export type ModifierConfigInternal = StatModifierConfigInternal | SkillLevelModifierConfigInternal

export interface StatModifierConfigInternal {
  modifierType: 'stat'
  statId: string
  type: EffectType
}

export interface SkillLevelModifierConfigInternal {
  modifierType: 'skillLevel'
  type: EffectType
  perLevelValue: FixedPoint
}

/**
 * 效果配置（内部使用定点数）
 */
export interface EffectConfigInternal {
  statId: string
  type: EffectType
  value: FixedPoint
}

/**
 * 属性配置（内部使用定点数）
 */
export interface StatConfigInternal extends Omit<StatConfig, 'base'> {
  base?: FixedPoint
}

/**
 * 行动配置（内部使用定点数）
 */
export interface ActionConfigInternal
  extends Omit<ActionConfig, 'duration' | 'xp' | 'chestPoints'> {
  duration: DerivedValueConfigInternal
  xp: DerivedValueConfigInternal
  chestPoints: DerivedValueConfigInternal
}

/**
 * 物品配置（内部使用定点数）
 */
export interface ItemConfigInternal extends Omit<ItemConfig, 'chest' | 'equipment' | 'consumable'> {
  chest?: {
    maxPoints: FixedPoint
    loots: LootEntryConfig[]
  }
  equipment?: {
    slotId: string
    effects: EffectConfigInternal[]
  }
  consumable?: {
    duration: FixedPoint
    consumableType: string
    effects: EffectConfigInternal[]
  }
}
