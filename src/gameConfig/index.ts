import type {
  SkillConfig,
  SlotConfig,
  StatConfig,
  ItemConfig,
  ActionConfig,
  GameConfig,
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
} from './type'

export const skillConfigMap: Record<string, SkillConfig> = Object.create(null)
export const slotConfigMap: Record<string, SlotConfig> = Object.create(null)
export const statConfigMap: Record<string, StatConfig> = Object.create(null)
export const itemConfigMap: Record<string, ItemConfig> = Object.create(null)
export const actionConfigMap: Record<string, ActionConfig> = Object.create(null)

export const skillConfigs: SkillConfig[] = []
export const slotConfigs: SlotConfig[] = []
export const statConfigs: StatConfig[] = []
export const resourceConfigs: ItemConfig[] = []
export const chestConfigs: ItemConfig[] = []
export const equipmentConfigs: ItemConfig[] = []
export const consumableConfigs: ItemConfig[] = []
export const actionConfigListBySkill: Record<string, ActionConfig[]> = Object.create(null)

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
        statConfigMap[config.id] = config as StatConfig
        statConfigs.push(config as StatConfig)
        break
      case 'item':
        const item = config as ItemConfig
        itemConfigMap[config.id] = item
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
        actionConfigMap[config.id] = config as ActionConfig
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
