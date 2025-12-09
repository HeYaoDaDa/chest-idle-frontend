import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useConsumableStore } from '@/stores/consumable'
import { useInventoryStore } from '@/stores/inventory'
import { toFixed } from '@/utils/fixedPoint'

import ConsumableSlot from '../ConsumableSlot'

import { createTestI18n } from '@/../test/setup'

// Mock itemConfigMap - use literal values to avoid hoisting issues
vi.mock('@/gameConfig', () => ({
  itemConfigMap: {
    coffee: {
      id: 'coffee',
      name: 'item.coffee.name',
      category: 'consumable',
      consumable: {
        consumableType: 'buff',
        duration: 5000000, // legacy field unused in component tests
        effects: [],
      },
    },
    tea: {
      id: 'tea',
      name: 'item.tea.name',
      category: 'consumable',
      consumable: {
        consumableType: 'buff',
        duration: 3000000, // 3000ms * 1000 (SCALE)
        effects: [],
      },
    },
  },
}))

// Mock formatDurationMs - component now passes milliseconds derived from seconds
vi.mock('@/utils/format', () => ({
  formatDurationMs: vi.fn((ms: number) => `${Math.floor(ms / 1000)}s`),
}))

// Mock statStore
vi.mock('@/stores/stat', () => ({
  useStatStore: () => ({
    addEffectsFromSource: vi.fn(),
    removeEffectsFromSource: vi.fn(),
  }),
}))

describe('ConsumableSlot Component', () => {
  let consumableStore: ReturnType<typeof useConsumableStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    consumableStore = useConsumableStore()
    // getSlots will auto-initialize slots
  })

  describe('rendering', () => {
    it('should render without crashing', () => {
      const wrapper = mount(ConsumableSlot, {
        props: {
          skillId: 'mining',
          slotIndex: 0,
          onSlotClick: vi.fn(),
        },
        global: {
          plugins: [createTestI18n()],
        },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should display empty slot when no item', () => {
      const wrapper = mount(ConsumableSlot, {
        props: {
          skillId: 'mining',
          slotIndex: 0,
          onSlotClick: vi.fn(),
        },
        global: {
          plugins: [createTestI18n()],
        },
      })

      expect(wrapper.text()).toContain('Empty')
      expect(wrapper.find('.text-neutral-400').exists()).toBe(true)
    })

    it('should display item name when slot has item', () => {
      const inventoryStore = useInventoryStore()
      inventoryStore.inventoryMap = { coffee: 5 }

      consumableStore.applyConsumable('mining', 0, 'coffee')
      const slots = consumableStore.getSlots('mining')
      slots[0].remaining = toFixed(5)

      const wrapper = mount(ConsumableSlot, {
        props: {
          skillId: 'mining',
          slotIndex: 0,
          onSlotClick: vi.fn(),
        },
        global: {
          plugins: [createTestI18n()],
        },
      })

      expect(wrapper.text()).toContain('Coffee')
      expect(wrapper.find('.card-consumable-slot').exists()).toBe(true)
    })

    it('should display remaining time when slot has item with remaining time', async () => {
      const inventoryStore = useInventoryStore()
      inventoryStore.inventoryMap = { coffee: 5 }

      // Directly set slotMap to bypass applyConsumable
      consumableStore.slotMap = {
        mining: [
          { itemId: 'coffee', remaining: toFixed(5) }, // 5 seconds as FixedPoint
          { itemId: null, remaining: toFixed(0) },
          { itemId: null, remaining: toFixed(0) },
        ],
      }

      const wrapper = mount(ConsumableSlot, {
        props: {
          skillId: 'mining',
          slotIndex: 0,
          onSlotClick: vi.fn(),
        },
        global: {
          plugins: [createTestI18n()],
        },
      })

      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('5s')
      expect(wrapper.find('.text-primary').exists()).toBe(true)
    })

    it('should reflect expanded state for aria-expanded', async () => {
      const onSlotClick = vi.fn()
      const wrapper = mount(ConsumableSlot, {
        props: {
          skillId: 'mining',
          slotIndex: 0,
          onSlotClick,
          expanded: true,
        },
        global: {
          plugins: [createTestI18n()],
        },
      })

      const container = wrapper.find('button')
      expect(container.attributes('aria-expanded')).toBe('true')
    })

    it('should not display remaining time when time is zero', () => {
      const inventoryStore = useInventoryStore()
      inventoryStore.inventoryMap = { coffee: 5 }

      consumableStore.applyConsumable('mining', 0, 'coffee')
      const slots = consumableStore.getSlots('mining')
      slots[0].remaining = toFixed(0)

      const wrapper = mount(ConsumableSlot, {
        props: {
          skillId: 'mining',
          slotIndex: 0,
          onSlotClick: vi.fn(),
        },
        global: {
          plugins: [createTestI18n()],
        },
      })

      expect(wrapper.text()).toContain('Coffee')
      expect(wrapper.text()).not.toContain('0s')
    })

    it('should not display remaining time when time is negative', () => {
      const inventoryStore = useInventoryStore()
      inventoryStore.inventoryMap = { coffee: 5 }

      consumableStore.applyConsumable('mining', 0, 'coffee')
      const slots = consumableStore.getSlots('mining')
      slots[0].remaining = toFixed(-1)

      const wrapper = mount(ConsumableSlot, {
        props: {
          skillId: 'mining',
          slotIndex: 0,
          onSlotClick: vi.fn(),
        },
        global: {
          plugins: [createTestI18n()],
        },
      })

      expect(wrapper.text()).toContain('Coffee')
      expect(wrapper.find('.text-primary').exists()).toBe(false)
    })
  })

  describe('styling', () => {
    it('should have proper container classes', () => {
      const wrapper = mount(ConsumableSlot, {
        props: {
          skillId: 'mining',
          slotIndex: 0,
          onSlotClick: vi.fn(),
        },
        global: {
          plugins: [createTestI18n()],
        },
      })

      const container = wrapper.find('button')
      expect(container.classes()).toContain('card-consumable-slot')
      // card-consumable-slot includes flex, flex-col, items-center, rounded, and transition
      // We just verify the shortcut is applied, not individual utility classes
    })

    it('should have hover styles', () => {
      const wrapper = mount(ConsumableSlot, {
        props: {
          skillId: 'mining',
          slotIndex: 0,
          onSlotClick: vi.fn(),
        },
        global: {
          plugins: [createTestI18n()],
        },
      })

      const container = wrapper.find('button')
      // card-consumable-slot includes transition behavior
      expect(container.classes()).toContain('card-consumable-slot')
    })

    it('should have proper styling for empty slot', () => {
      const wrapper = mount(ConsumableSlot, {
        props: {
          skillId: 'mining',
          slotIndex: 0,
          onSlotClick: vi.fn(),
        },
        global: {
          plugins: [createTestI18n()],
        },
      })

      const emptyText = wrapper.find('.text-neutral-400')
      expect(emptyText.exists()).toBe(true)
      expect(emptyText.classes()).toContain('italic')
    })

    it('should have proper styling for item name', () => {
      const inventoryStore = useInventoryStore()
      inventoryStore.inventoryMap = { coffee: 5 }

      consumableStore.applyConsumable('mining', 0, 'coffee')
      const slots = consumableStore.getSlots('mining')
      slots[0].remaining = toFixed(5)

      const wrapper = mount(ConsumableSlot, {
        props: {
          skillId: 'mining',
          slotIndex: 0,
          onSlotClick: vi.fn(),
        },
        global: {
          plugins: [createTestI18n()],
        },
      })

      const itemName = wrapper.find('.font-bold')
      expect(itemName.exists()).toBe(true)
      expect(itemName.classes()).toContain('text-neutral-900')
    })

    it('should have proper styling for remaining time', () => {
      const inventoryStore = useInventoryStore()
      inventoryStore.inventoryMap = { coffee: 5 }

      consumableStore.applyConsumable('mining', 0, 'coffee')
      const slots = consumableStore.getSlots('mining')
      slots[0].remaining = toFixed(5)

      const wrapper = mount(ConsumableSlot, {
        props: {
          skillId: 'mining',
          slotIndex: 0,
          onSlotClick: vi.fn(),
        },
        global: {
          plugins: [createTestI18n()],
        },
      })

      const timeText = wrapper.find('.text-primary')
      expect(timeText.exists()).toBe(true)
      expect(timeText.classes()).toContain('font-medium')
      expect(timeText.classes()).toContain('text-xs')
    })
  })

  describe('interactions', () => {
    it('should call onSlotClick when clicked', async () => {
      const onSlotClick = vi.fn()
      const wrapper = mount(ConsumableSlot, {
        props: {
          skillId: 'mining',
          slotIndex: 0,
          onSlotClick,
        },
        global: {
          plugins: [createTestI18n()],
        },
      })

      await wrapper.trigger('click')

      expect(onSlotClick).toHaveBeenCalledTimes(1)
      expect(onSlotClick).toHaveBeenCalledWith(0)
    })

    it('should call onSlotClick with correct slot index', async () => {
      const onSlotClick = vi.fn()
      const wrapper = mount(ConsumableSlot, {
        props: {
          skillId: 'mining',
          slotIndex: 2,
          onSlotClick,
        },
        global: {
          plugins: [createTestI18n()],
        },
      })

      await wrapper.trigger('click')

      expect(onSlotClick).toHaveBeenCalledWith(2)
    })

    it('should work with different skill IDs', async () => {
      const onSlotClick = vi.fn()

      const wrapper1 = mount(ConsumableSlot, {
        props: {
          skillId: 'mining',
          slotIndex: 0,
          onSlotClick,
        },
        global: {
          plugins: [createTestI18n()],
        },
      })

      const wrapper2 = mount(ConsumableSlot, {
        props: {
          skillId: 'foraging',
          slotIndex: 0,
          onSlotClick,
        },
        global: {
          plugins: [createTestI18n()],
        },
      })

      await wrapper1.trigger('click')
      await wrapper2.trigger('click')

      expect(onSlotClick).toHaveBeenCalledTimes(2)
    })
  })

  describe('multiple slots', () => {
    it('should handle multiple slots independently', async () => {
      const inventoryStore = useInventoryStore()
      inventoryStore.inventoryMap = { coffee: 5, tea: 5 }

      // Directly set slotMap
      consumableStore.slotMap = {
        mining: [
          { itemId: 'coffee', remaining: toFixed(5) }, // 5 seconds as FixedPoint
          { itemId: 'tea', remaining: toFixed(3) }, // 3 seconds as FixedPoint
          { itemId: null, remaining: toFixed(0) },
        ],
      }

      const wrapper1 = mount(ConsumableSlot, {
        props: {
          skillId: 'mining',
          slotIndex: 0,
          onSlotClick: vi.fn(),
        },
        global: {
          plugins: [createTestI18n()],
        },
      })

      const wrapper2 = mount(ConsumableSlot, {
        props: {
          skillId: 'mining',
          slotIndex: 1,
          onSlotClick: vi.fn(),
        },
        global: {
          plugins: [createTestI18n()],
        },
      })

      await wrapper1.vm.$nextTick()
      await wrapper2.vm.$nextTick()

      expect(wrapper1.text()).toContain('Coffee')
      expect(wrapper1.text()).toContain('5s')
      expect(wrapper2.text()).toContain('Tea')
      expect(wrapper2.text()).toContain('3s')
    })

    it('should handle out of bounds slot index', () => {
      const inventoryStore = useInventoryStore()
      inventoryStore.inventoryMap = { coffee: 5 }

      consumableStore.applyConsumable('mining', 0, 'coffee')
      const slots = consumableStore.getSlots('mining')
      slots[0].remaining = toFixed(5)

      const wrapper = mount(ConsumableSlot, {
        props: {
          skillId: 'mining',
          slotIndex: 5,
          onSlotClick: vi.fn(),
        },
        global: {
          plugins: [createTestI18n()],
        },
      })

      expect(wrapper.text()).toContain('Empty')
    })
  })

  describe('reactivity', () => {
    it('should update when slot content changes', async () => {
      const wrapper = mount(ConsumableSlot, {
        props: {
          skillId: 'mining',
          slotIndex: 0,
          onSlotClick: vi.fn(),
        },
        global: {
          plugins: [createTestI18n()],
        },
      })

      expect(wrapper.text()).toContain('Empty')

      // Add item to slot
      const inventoryStore = useInventoryStore()
      inventoryStore.inventoryMap = { coffee: 5 }
      consumableStore.applyConsumable('mining', 0, 'coffee')
      const slots = consumableStore.getSlots('mining')
      slots[0].remaining = toFixed(5)
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('Coffee')
    })

    it('should update remaining time when it changes', async () => {
      const inventoryStore = useInventoryStore()
      inventoryStore.inventoryMap = { coffee: 5 }

      // Directly set slotMap with initial time
      consumableStore.slotMap = {
        mining: [
          { itemId: 'coffee', remaining: toFixed(10) }, // 10 seconds as FixedPoint
          { itemId: null, remaining: toFixed(0) },
          { itemId: null, remaining: toFixed(0) },
        ],
      }

      const wrapper = mount(ConsumableSlot, {
        props: {
          skillId: 'mining',
          slotIndex: 0,
          onSlotClick: vi.fn(),
        },
        global: {
          plugins: [createTestI18n()],
        },
      })

      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('10s')

      // Update remaining time
      consumableStore.getSlots('mining')[0].remaining = toFixed(5) // 5 seconds as FixedPoint
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('5s')
    })
  })

  describe('i18n', () => {
    it('should translate empty slot text', () => {
      const wrapper = mount(ConsumableSlot, {
        props: {
          skillId: 'mining',
          slotIndex: 0,
          onSlotClick: vi.fn(),
        },
        global: {
          plugins: [createTestI18n()],
        },
      })

      // The test i18n should return "Empty" for 'ui.consumable.empty'
      expect(wrapper.text()).toContain('Empty')
    })

    it('should translate item names', () => {
      const inventoryStore = useInventoryStore()
      inventoryStore.inventoryMap = { coffee: 5 }

      consumableStore.applyConsumable('mining', 0, 'coffee')
      const slots = consumableStore.getSlots('mining')
      slots[0].remaining = toFixed(5)

      const wrapper = mount(ConsumableSlot, {
        props: {
          skillId: 'mining',
          slotIndex: 0,
          onSlotClick: vi.fn(),
        },
        global: {
          plugins: [createTestI18n()],
        },
      })

      // The test i18n translates 'item.coffee.name' to 'Coffee'
      expect(wrapper.text()).toContain('Coffee')
    })
  })

  describe('edge cases', () => {
    it('should handle missing itemId gracefully', () => {
      const slots = consumableStore.getSlots('mining')
      slots[0].itemId = null
      slots[0].remaining = toFixed(5)

      const wrapper = mount(ConsumableSlot, {
        props: {
          skillId: 'mining',
          slotIndex: 0,
          onSlotClick: vi.fn(),
        },
        global: {
          plugins: [createTestI18n()],
        },
      })

      expect(wrapper.text()).toContain('Empty')
    })

    it('should handle item not in config map', () => {
      const slots = consumableStore.getSlots('mining')
      slots[0].itemId = 'nonexistent'
      slots[0].remaining = toFixed(5)

      const wrapper = mount(ConsumableSlot, {
        props: {
          skillId: 'mining',
          slotIndex: 0,
          onSlotClick: vi.fn(),
        },
        global: {
          plugins: [createTestI18n()],
        },
      })

      expect(wrapper.text()).toContain('Empty')
    })

    it('should handle skill with no slots', () => {
      const wrapper = mount(ConsumableSlot, {
        props: {
          skillId: 'nonexistent',
          slotIndex: 0,
          onSlotClick: vi.fn(),
        },
        global: {
          plugins: [createTestI18n()],
        },
      })

      expect(wrapper.text()).toContain('Empty')
    })

    it('should handle missing remaining property', () => {
      const inventoryStore = useInventoryStore()
      inventoryStore.inventoryMap = { coffee: 5 }

      consumableStore.applyConsumable('mining', 0, 'coffee')
      const slots = consumableStore.getSlots('mining')
      slots[0].remaining = toFixed(0)

      const wrapper = mount(ConsumableSlot, {
        props: {
          skillId: 'mining',
          slotIndex: 0,
          onSlotClick: vi.fn(),
        },
        global: {
          plugins: [createTestI18n()],
        },
      })

      expect(wrapper.text()).toContain('Coffee')
      expect(wrapper.find('.text-primary').exists()).toBe(false)
    })

    it('should handle very large remaining time', () => {
      const inventoryStore = useInventoryStore()
      inventoryStore.inventoryMap = { coffee: 5 }

      consumableStore.applyConsumable('mining', 0, 'coffee')
      const slots = consumableStore.getSlots('mining')
      slots[0].remaining = toFixed(999999000)

      const wrapper = mount(ConsumableSlot, {
        props: {
          skillId: 'mining',
          slotIndex: 0,
          onSlotClick: vi.fn(),
        },
        global: {
          plugins: [createTestI18n()],
        },
      })

      expect(wrapper.text()).toContain('Coffee')
      expect(wrapper.find('.text-primary').exists()).toBe(true)
    })
  })
})
