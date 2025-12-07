export type {
  SkillConfig,
  SlotConfig,
  StatConfig,
  ItemConfig,
  ActionConfig,
  EnemyConfig,
  GameConfig,
  EffectType,
  EffectConfig,
  LootEntryConfig,
  StatModifierConfig,
  SkillLevelModifierConfig,
  ModifierConfig,
  DerivedValueConfig,
}

export type ItemCategory = 'resource' | 'chest' | 'equipment' | 'consumable'
export type SkillType = 'production' | 'combat'
export type AttackType = 'melee' | 'ranged' | 'magic'

type GameConfig = SkillConfig | SlotConfig | StatConfig | ItemConfig | ActionConfig | EnemyConfig

interface SkillConfig {
  type: 'skill'
  id: string
  sort: number
  skillType: SkillType
  name: string
  description: string
}

interface SlotConfig {
  type: 'slot'
  id: string
  sort: number
  category?: 'production' | 'combat' | 'accessory'  // NEW
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
  category: ItemCategory
  id: string
  sort: number
  chest?: {
    maxPoints: number
    loots: LootEntryConfig[]
  }
  equipment?: {
    slotId: string
    occupiedSlots?: string[]  // NEW: 实际占用的所有槽位
    attackType?: AttackType
    effects: EffectConfig[]
  }
  consumable?: {
    durationSeconds: number
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
  durationSeconds: DerivedValueConfig
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

interface EnemyConfig {
  type: 'enemy'
  id: string
  sort: number
  hp: number
  attack: number
  attackIntervalSeconds: number
  respawnTimeSeconds?: number
  xpReward: number
  fixedLootItems: { itemId: string; count: number }[]
  fixedChestPoints: { chestId: string; points: number }[]
  name: string
  description: string
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
  extends Omit<ActionConfig, 'durationSeconds' | 'xp' | 'chestPoints'> {
  durationSeconds: DerivedValueConfigInternal
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
    occupiedSlots?: string[]  // NEW
    attackType?: AttackType
    effects: EffectConfigInternal[]
  }
  consumable?: {
    durationSeconds: FixedPoint
    consumableType: string
    effects: EffectConfigInternal[]
  }
}
