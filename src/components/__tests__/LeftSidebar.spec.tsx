import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createRouter, createMemoryHistory } from 'vue-router'

import LeftSidebar from '@/components/LeftSidebar'
import { loadGameConfig, skillConfigs } from '@/gameConfig'

import { createTestI18n } from '@/../test/setup'

describe('LeftSidebar', () => {
  const createTestRouter = () =>
    createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', name: 'home', component: { template: '<div />' } },
        { path: '/game/inventory', name: 'inventory', component: { template: '<div />' } },
        { path: '/game/chests', name: 'chests', component: { template: '<div />' } },
        { path: '/game/combat', name: 'combat', component: { template: '<div />' } },
        { path: '/game/:id', name: 'skill', component: { template: '<div />' } },
      ],
    })

  beforeAll(() => {
    // 确保 skillConfigs 只加载一次
    if (skillConfigs.length === 0) {
      loadGameConfig()
    }
  })

  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should render combat wrapper with data-testid', () => {
    const router = createTestRouter()
    const wrapper = mount(LeftSidebar, {
      global: {
        plugins: [createTestI18n(), router],
      },
    })

    const combatWrapper = wrapper.find('[data-testid="combat-wrapper"]')
    expect(combatWrapper.exists()).toBe(true)
  })

  it('should contain combat skills inside combat wrapper', () => {
    const router = createTestRouter()
    const wrapper = mount(LeftSidebar, {
      global: {
        plugins: [createTestI18n(), router],
      },
    })

    const combatWrapper = wrapper.find('[data-testid="combat-wrapper"]')
    expect(combatWrapper.exists()).toBe(true)

    // 战斗技能应该在 wrapper 内部
    const text = combatWrapper.text()
    expect(text).toContain('skill.melee.name')
    expect(text).toContain('skill.defense.name')
    expect(text).toContain('skill.ranged.name')
  })

  it('should link combat wrapper to /game/combat', async () => {
    const router = createTestRouter()
    await router.push('/game/combat')
    await router.isReady()

    const wrapper = mount(LeftSidebar, {
      global: {
        plugins: [createTestI18n(), router],
      },
    })

    const combatWrapper = wrapper.find('[data-testid="combat-wrapper"]')
    expect(combatWrapper.exists()).toBe(true)

    // RouterLink 渲染后变成 <a> 标签，href 属性指向 /game/combat
    expect(combatWrapper.attributes('href')).toBe('/game/combat')
  })

  it('should render production skills separately', () => {
    const router = createTestRouter()
    const wrapper = mount(LeftSidebar, {
      global: {
        plugins: [createTestI18n(), router],
      },
    })

    // 生产技能应该有独立的链接
    const productionLinks = wrapper.findAll('a').filter((link) => {
      const to = link.attributes('to') || link.attributes('href')
      return to?.includes('/game/woodcutting') || to?.includes('/game/mining')
    })

    expect(productionLinks.length).toBeGreaterThan(0)
  })
})
