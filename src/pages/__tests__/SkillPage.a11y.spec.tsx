import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'

import SkillPage from '@/pages/SkillPage'

import { createTestI18n } from '@/../test/setup'

// Mock gameConfig to provide a minimal skill definition

vi.mock('@/gameConfig', async (importOriginal: unknown) => {
  // cast to any to import original module in test mock
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const original = await (importOriginal as any)()
  return {
    ...original,
    skillConfigs: [
      {
        id: 'test-skill',
        name: 'skill.testSkill',
        description: 'skill.testDesc',
        sort: 1,
        skillType: 'production',
      },
    ],
    skillConfigMap: {
      'test-skill': {
        id: 'test-skill',
        name: 'skill.testSkill',
        description: 'skill.testDesc',
        sort: 1,
        skillType: 'production',
      },
    },
    getSkillTabActionConfigsMapBySkillId: () => ({}),
    actionConfigListBySkill: {},
  }
})

// Mock router route to provide skill id and other router hooks used by the page
vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { id: 'test-skill' } }),
  onBeforeRouteUpdate: vi.fn(),
}))

describe('SkillPage accessibility (axe)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should have no detectable a11y violations', async () => {
    const wrapper = mount(SkillPage, {
      global: { plugins: [createTestI18n()], stubs: { RouterLink: true } },
    })

    const results = await axe(wrapper.element, {
      rules: { 'color-contrast': { enabled: false }, region: { enabled: false } },
    })
    expect(results.violations.length).toBe(0)
  })
})
