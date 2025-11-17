import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'

import ModalBox from '../ModalBox'

describe('ModalBox Component', () => {
  beforeEach(() => {
    // Clean up any teleported elements
    document.body.innerHTML = ''
  })

  describe('rendering', () => {
    it('should render without crashing', () => {
      const wrapper = mount(ModalBox, {
        slots: {
          default: '<div>Modal Content</div>',
        },
        attachTo: document.body,
      })

      expect(wrapper.exists()).toBe(true)
      wrapper.unmount()
    })

    it('should render slot content', () => {
      const wrapper = mount(ModalBox, {
        slots: {
          default: '<div class="test-content">Test Modal Content</div>',
        },
        attachTo: document.body,
      })

      // Check content was teleported to body
      expect(document.body.innerHTML).toContain('test-content')
      expect(document.body.innerHTML).toContain('Test Modal Content')
      wrapper.unmount()
    })

    it('should have backdrop overlay', () => {
      const wrapper = mount(ModalBox, {
        slots: {
          default: '<div>Content</div>',
        },
        attachTo: document.body,
      })

      expect(document.body.innerHTML).toContain('bg-gray-900/55')
      wrapper.unmount()
    })

    it('should have modal container with proper styling', () => {
      const wrapper = mount(ModalBox, {
        slots: {
          default: '<div>Content</div>',
        },
        attachTo: document.body,
      })

      expect(document.body.innerHTML).toContain('bg-white')
      expect(document.body.innerHTML).toContain('rounded-lg')
      wrapper.unmount()
    })
  })

  describe('close functionality', () => {
    it('should emit close event when backdrop is clicked', async () => {
      const wrapper = mount(ModalBox, {
        slots: {
          default: '<div>Content</div>',
        },
        attachTo: document.body,
      })

      // Find backdrop in document body
      const backdrop = document.querySelector('.bg-gray-900\\/55') as HTMLElement
      backdrop?.click()

      await wrapper.vm.$nextTick()
      expect(wrapper.emitted('close')).toBeTruthy()
      wrapper.unmount()
    })
  })

  describe('keyboard events', () => {
    it('should emit close event when Escape key is pressed', async () => {
      const wrapper = mount(ModalBox, {
        slots: {
          default: '<div>Content</div>',
        },
        attachTo: document.body,
      })

      // Simulate Escape key press
      const event = new KeyboardEvent('keydown', { key: 'Escape' })
      window.dispatchEvent(event)

      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('close')).toBeTruthy()

      wrapper.unmount()
    })

    it('should not emit close event when other keys are pressed', async () => {
      const wrapper = mount(ModalBox, {
        slots: {
          default: '<div>Content</div>',
        },
        attachTo: document.body,
      })

      // Simulate other key press
      const event = new KeyboardEvent('keydown', { key: 'Enter' })
      window.dispatchEvent(event)

      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('close')).toBeFalsy()

      wrapper.unmount()
    })
  })

  describe('layout', () => {
    it('should have fixed positioning', () => {
      const wrapper = mount(ModalBox, {
        slots: {
          default: '<div>Content</div>',
        },
        attachTo: document.body,
      })

      expect(document.body.innerHTML).toContain('fixed')
      expect(document.body.innerHTML).toContain('inset-0')
      wrapper.unmount()
    })

    it('should center content', () => {
      const wrapper = mount(ModalBox, {
        slots: {
          default: '<div>Content</div>',
        },
        attachTo: document.body,
      })

      expect(document.body.innerHTML).toContain('grid')
      expect(document.body.innerHTML).toContain('place-items-center')
      wrapper.unmount()
    })
  })

  describe('edge cases', () => {
    it('should handle empty slot content', () => {
      const wrapper = mount(ModalBox, {
        attachTo: document.body,
      })

      expect(wrapper.exists()).toBe(true)
      expect(document.body.innerHTML).toContain('rounded-lg')
      wrapper.unmount()
    })

    it('should clean up on unmount', () => {
      const wrapper = mount(ModalBox, {
        slots: {
          default: '<div class="cleanup-test">Content</div>',
        },
        attachTo: document.body,
      })

      expect(document.body.innerHTML).toContain('cleanup-test')

      wrapper.unmount()

      // After unmount, wrapper should not exist
      expect(wrapper.exists()).toBe(false)
    })
  })
})
