import { toFixed } from '@/utils/fixedPoint'

import type {
  SkillConfig,
  SlotConfig,
  StatConfig,
  ItemConfig,
  ActionConfig,
  GameConfig,
  StatConfigInternal,
  ItemConfigInternal,
  ActionConfigInternal,
  DerivedValueConfig,
  ModifierConfig,
  DerivedValueConfigInternal,
} from './type'
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
  StatConfigInternal,
  ItemConfigInternal,
  ActionConfigInternal,
  DerivedValueConfigInternal,
  EffectConfigInternal,
  ModifierConfigInternal,
} from './type'

export const skillConfigMap: Record<string, SkillConfig> = Object.create(null)
export const slotConfigMap: Record<string, SlotConfig> = Object.create(null)
export const statConfigMap: Record<string, StatConfigInternal> = Object.create(null)
export const itemConfigMap: Record<string, ItemConfigInternal> = Object.create(null)
export const actionConfigMap: Record<string, ActionConfigInternal> = Object.create(null)

export const skillConfigs: SkillConfig[] = []
export const slotConfigs: SlotConfig[] = []
export const statConfigs: StatConfig[] = []
export const resourceConfigs: ItemConfig[] = []
export const chestConfigs: ItemConfig[] = []
export const equipmentConfigs: ItemConfig[] = []
export const consumableConfigs: ItemConfig[] = []
export const actionConfigListBySkill: Record<string, ActionConfig[]> = Object.create(null)

/**
 * 将 DerivedValueConfig 转换为 DerivedValueConfigInternal
 */
function convertDerivedValue(config: DerivedValueConfig): DerivedValueConfigInternal {
  const result: DerivedValueConfigInternal = {
    baseValue: toFixed(config.baseValue),
  }

  if (config.modifiers) {
    result.modifiers = config.modifiers.map((modifier: ModifierConfig) => {
      if (modifier.modifierType === 'skillLevel') {
        return {
          ...modifier,
          perLevelValue: toFixed(modifier.perLevelValue),
        }
      }
      return modifier
    })
  }

  return result
}

export function loadGameConfig() {
  const modules = import.meta.glob('/src/data/**/*.json', {
    eager: true,
    import: 'default',
  }) as Record<string, GameConfig[]>
  const gameConfigs = Object.values(modules).flat()
  for (const config of gameConfigs) {
    switch (config.type) {
      case 'skill':
        skillConfigMap[config.id] = config as SkillConfig
        skillConfigs.push(config as SkillConfig)
        break
      case 'slot':
        slotConfigMap[config.id] = config as SlotConfig
        slotConfigs.push(config as SlotConfig)
        break
      case 'stat':
        const statInternal: StatConfigInternal = {
          ...config,
          base: config.base !== undefined ? toFixed(config.base) : undefined,
        } as StatConfigInternal
        statConfigMap[config.id] = statInternal
        statConfigs.push(config as StatConfig)
        break
      case 'item':
        const item = config as ItemConfig
        const itemInternal: ItemConfigInternal = {
          ...item,
        } as ItemConfigInternal

        // 转换箱子配置
        if (item.chest) {
          itemInternal.chest = {
            maxPoints: toFixed(item.chest.maxPoints),
            loots: item.chest.loots,
          }
        }

        // 转换装备配置
        if (item.equipment) {
          itemInternal.equipment = {
            slotId: item.equipment.slotId,
            effects: item.equipment.effects.map((effect) => ({
              statId: effect.statId,
              type: effect.type,
              value: toFixed(effect.value),
            })),
          }
        }

        // 转换消耗品配置
        if (item.consumable) {
          itemInternal.consumable = {
            duration: toFixed(item.consumable.duration),
            consumableType: item.consumable.consumableType,
            effects: item.consumable.effects.map((effect) => ({
              statId: effect.statId,
              type: effect.type,
              value: toFixed(effect.value),
            })),
          }
        }

        itemConfigMap[config.id] = itemInternal
        if (item.category === 'resource') {
          resourceConfigs.push(item)
        } else if (item.category === 'chest') {
          chestConfigs.push(item)
        } else if (item.category === 'equipment') {
          equipmentConfigs.push(item)
        } else if (item.category === 'consumable') {
          consumableConfigs.push(item)
        }
        break
      case 'action':
        const actionInternal: ActionConfigInternal = {
          ...config,
          duration: convertDerivedValue(config.duration),
          xp: convertDerivedValue(config.xp),
          chestPoints: convertDerivedValue(config.chestPoints),
        } as ActionConfigInternal
        actionConfigMap[config.id] = actionInternal
        actionConfigListBySkill[config.skillId] = actionConfigListBySkill[config.skillId] || []
        actionConfigListBySkill[config.skillId].push(config as ActionConfig)
        break
    }
  }

  skillConfigs.sort((a, b) => a.sort - b.sort)
  slotConfigs.sort((a, b) => a.sort - b.sort)
  statConfigs.sort((a, b) => a.sort - b.sort)
  resourceConfigs.sort((a, b) => a.sort - b.sort)
  chestConfigs.sort((a, b) => a.sort - b.sort)
  equipmentConfigs.sort((a, b) => a.sort - b.sort)
  consumableConfigs.sort((a, b) => a.sort - b.sort)
  for (const actionConfigs of Object.values(actionConfigListBySkill)) {
    actionConfigs.sort((a, b) => a.sort - b.sort)
  }
}

export function getSkillTabActionConfigsMapBySkillId(
  skillId: string,
): Record<string, ActionConfig[]> {
  const actionConfigs = actionConfigListBySkill[skillId] || []
  const tabActionConfigMap: Record<string, ActionConfig[]> = {}
  for (const actionConfig of actionConfigs) {
    const tab = actionConfig.tab
    if (!tab) {
      continue
    }
    if (!tabActionConfigMap[tab]) {
      tabActionConfigMap[tab] = []
    }
    tabActionConfigMap[tab].push(actionConfig)
  }
  return tabActionConfigMap
}
