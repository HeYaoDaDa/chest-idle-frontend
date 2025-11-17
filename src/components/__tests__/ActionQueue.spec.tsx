import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useActionQueueStore } from '@/stores/actionQueue'

import ActionQueue from '../ActionQueue'

import { createTestI18n } from '@/../test/setup'

// Mock actionConfigMap - use literal values instead of toFixed to avoid hoisting issues
vi.mock('@/stores/action', async () => {
  const actionConfigMap = {
    'test-action': {
      id: 'test-action',
      name: 'action.test.name',
      description: 'Test action',
      skillId: 'mining',
      duration: 5000000, // 5000ms * 1000 (SCALE)
      xp: 10000, // 10 * 1000
      chestPoints: 100000, // 100 * 1000
    },
  }
  return {
    actionConfigMap,
    useActionStore: () => ({
      actionConfigMap,
      getActionById: (id: string) => actionConfigMap[id as keyof typeof actionConfigMap],
    }),
  }
})

// Mock the modals
vi.mock('../modals', () => ({
  ActionQueueModal: {
    name: 'ActionQueueModal',
    props: ['show', 'onClose'],
    setup() {
      return () => null
    },
  },
}))

describe('ActionQueue Component', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('rendering', () => {
    it('should render without crashing', () => {
      const wrapper = mount(ActionQueue, {
        global: {
          plugins: [createTestI18n()],
        },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should display "nothing" when no current action', () => {
      const wrapper = mount(ActionQueue, {
        global: {
          plugins: [createTestI18n()],
        },
      })

      expect(wrapper.text()).toContain('Nothing')
    })

    it('should display current action name and amount', () => {
      const actionQueueStore = useActionQueueStore()
      actionQueueStore.addAction('test-action', 5)

      const wrapper = mount(ActionQueue, {
        global: {
          plugins: [createTestI18n()],
        },
      })

      expect(wrapper.text()).toContain('Test Action')
      expect(wrapper.text()).toContain('5')
    })

    it('should display infinity symbol for infinite amount', () => {
      const actionQueueStore = useActionQueueStore()
      actionQueueStore.addAction('test-action') // default is Infinity

      const wrapper = mount(ActionQueue, {
        global: {
          plugins: [createTestI18n()],
        },
      })

      expect(wrapper.text()).toContain('∞')
    })

    it('should show stop button when action is running', () => {
      const actionQueueStore = useActionQueueStore()
      actionQueueStore.addAction('test-action', 1)

      const wrapper = mount(ActionQueue, {
        global: {
          plugins: [createTestI18n()],
        },
      })

      const stopButton = wrapper.find('button')
      expect(stopButton.exists()).toBe(true)
      expect(stopButton.text()).toContain('Stop')
    })

    it('should not show stop button when no action is running', () => {
      const wrapper = mount(ActionQueue, {
        global: {
          plugins: [createTestI18n()],
        },
      })

      const stopButton = wrapper.find('button')
      expect(stopButton.exists()).toBe(false)
    })

    it('should show queue button when actions are pending', () => {
      const actionQueueStore = useActionQueueStore()
      actionQueueStore.addAction('test-action', 1)
      actionQueueStore.addAction('test-action', 1)

      const wrapper = mount(ActionQueue, {
        global: {
          plugins: [createTestI18n()],
        },
      })

      const buttons = wrapper.findAll('button')
      expect(buttons.length).toBeGreaterThan(1)
    })
  })

  describe('interactions', () => {
    it('should call removeAction when stop button is clicked', async () => {
      const actionQueueStore = useActionQueueStore()
      actionQueueStore.addAction('test-action', 1)

      const wrapper = mount(ActionQueue, {
        global: {
          plugins: [createTestI18n()],
        },
      })

      const stopButton = wrapper.find('button')
      await stopButton.trigger('click')

      expect(actionQueueStore.actionQueue).toHaveLength(0)
    })
  })
})
