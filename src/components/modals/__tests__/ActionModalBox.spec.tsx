import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { actionConfigMap } from '@/gameConfig'
import { toFixed } from '@/utils/fixedPoint'

import ActionModalBox from '../ActionModalBox'

import type { ActionConfigInternal } from '@/gameConfig'

import { createTestI18n } from '@/../test/setup'

describe('ActionModalBox', () => {
  let _oldActionTest: ActionConfigInternal | undefined
  beforeEach(() => {
    _oldActionTest = actionConfigMap.test
    // Ensure a minimal action exists in game config for testing
    actionConfigMap.test = {
      type: 'action',
      id: 'test',
      name: 'action.test.name',
      skillId: 'woodcutting',
      durationSeconds: { baseValue: toFixed(1) },
      xp: { baseValue: toFixed(0) },
      chestPoints: { baseValue: toFixed(0) },
      minLevel: 1,
      sort: 0,
      chestId: 'default-chest',
      description: 'test',
      ingredients: [],
      products: [],
    }
  })

  afterEach(() => {
    if (typeof _oldActionTest === 'undefined') delete actionConfigMap.test
    else actionConfigMap.test = _oldActionTest
  })

  it('should not auto focus amount input on open', async () => {
    const i18n = createTestI18n()
    const wrapper = mount(ActionModalBox, {
      props: {
        show: true,
        actionId: 'test',
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
    const wrapper = mount(ActionModalBox, {
      props: {
        show: true,
        actionId: 'test',
      },
      global: { plugins: [i18n] },
      attachTo: document.body,
    })

    await wrapper.vm.$nextTick()

    const input = document.querySelector('input') as HTMLInputElement | null
    expect(input).not.toBeNull()

    if (input) {
      input.value = '4'
      input.dispatchEvent(new MouseEvent('click'))
      await wrapper.vm.$nextTick()
      expect(input.selectionStart).toBe(0)
      expect(input.selectionEnd).toBe(1)
    }

    wrapper.unmount()
  })
})
