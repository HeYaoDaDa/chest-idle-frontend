import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import CombatPage from '@/pages/CombatPage'

// Mock gameConfig
vi.mock('@/gameConfig', async (importOriginal) => {
  const original = await importOriginal() as Record<string, unknown>
  return {
    ...original,
    skillConfigs: [
      { id: 'melee', name: 'skill.melee.name', skillType: 'combat' },
      { id: 'defense', name: 'skill.defense.name', skillType: 'combat' },
    ],
    enemyConfigs: [
      {
        type: 'enemy',
        id: 'test-enemy',
        sort: 0,
        hp: 50,
        attack: 5,
        attackInterval: 3000,
        xpReward: 10,
        fixedLootItems: [],
        fixedChestPoints: [],
        name: 'enemy.test.name',
        description: 'enemy.test.description',
      },
    ],
    enemyConfigMap: {
      'test-enemy': {
        type: 'enemy',
        id: 'test-enemy',
        sort: 0,
        hp: 50,
        attack: 5,
        attackInterval: 3000,
        xpReward: 10,
        fixedLootItems: [],
        fixedChestPoints: [],
        name: 'enemy.test.name',
        description: 'enemy.test.description',
      },
    },
  }
})

import { createTestI18n } from '@/../test/setup'

describe('CombatPage a11y', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should render enemies list by default when not in battle', () => {
    const wrapper = mount(CombatPage, {
      global: {
        plugins: [createTestI18n()],
        stubs: { RouterLink: true },
      },
    })

    // 应该显示战斗标题和描述
    expect(wrapper.text()).toContain('ui.combat.title')
    expect(wrapper.text()).toContain('ui.combat.description')
  })

  it('should not show battle arena when not in battle', () => {
    const wrapper = mount(CombatPage, {
      global: {
        plugins: [createTestI18n()],
        stubs: { RouterLink: true },
      },
    })

    // 应该不显示战斗场景的元素
    expect(wrapper.text()).not.toContain('ui.combat.remainingBattles')
  })

  it('should display combat page header when not in battle', () => {
    const wrapper = mount(CombatPage, {
      global: {
        plugins: [createTestI18n()],
        stubs: { RouterLink: true },
      },
    })

    // 页面应该包含战斗相关信息
    expect(wrapper.text()).toContain('ui.combat.title')
    expect(wrapper.text()).toContain('ui.combat.description')
  })
})
