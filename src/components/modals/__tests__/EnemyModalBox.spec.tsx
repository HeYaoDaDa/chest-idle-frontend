import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { enemyConfigMap } from '@/gameConfig'

import EnemyModalBox from '../EnemyModalBox'

import type { EnemyConfig } from '@/gameConfig'


import { createTestI18n } from '@/../test/setup'

describe('EnemyModalBox', () => {
  let _oldEnemyTest: EnemyConfig | undefined
  beforeEach(() => {
    _oldEnemyTest = enemyConfigMap.test
    // Ensure a minimal enemy exists in game config for testing
    enemyConfigMap.test = {
      type: 'enemy',
      id: 'test',
      name: 'enemy.test.name',
      description: 'enemy.test.desc',
      hp: 10,
      attack: 1,
      attackIntervalSeconds: 1,
      xpReward: 1,
      fixedLootItems: [],
      fixedChestPoints: [],
      sort: 0,
    }
  })

  afterEach(() => {
    if (typeof _oldEnemyTest === 'undefined') delete enemyConfigMap.test
    else enemyConfigMap.test = _oldEnemyTest
  })

  it('should not auto focus amount input on open', async () => {
    const i18n = createTestI18n()
    const wrapper = mount(EnemyModalBox, {
      props: {
        show: true,
        enemyId: 'test',
      },
      global: { plugins: [i18n] },
      attachTo: document.body,
    })

    await wrapper.vm.$nextTick()

    const input = document.querySelector('input') as HTMLInputElement | null
    expect(input).not.toBeNull()
    // Ensure the input is not auto-focused by the modal
    expect(document.activeElement).not.toBe(input)

    wrapper.unmount()
  })

  it('should select amount input when clicked', async () => {
    const i18n = createTestI18n()
    const wrapper = mount(EnemyModalBox, {
      props: {
        show: true,
        enemyId: 'test',
      },
      global: { plugins: [i18n] },
      attachTo: document.body,
    })

    await wrapper.vm.$nextTick()

    const input = document.querySelector('input') as HTMLInputElement | null
    expect(input).not.toBeNull()

    // Set value to a known value, click the element and expect selection
    if (input) {
      input.value = '3'
      input.dispatchEvent(new MouseEvent('click'))
      await wrapper.vm.$nextTick()
      // Selection should select the whole input value
      expect(input.selectionStart).toBe(0)
      expect(input.selectionEnd).toBe(1)
    }

    wrapper.unmount()
  })
})
