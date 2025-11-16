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
