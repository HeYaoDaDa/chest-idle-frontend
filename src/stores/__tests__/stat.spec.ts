import { setActivePinia, createPinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { type ModifierConfigInternal } from '@/gameConfig'

import { toFixed, fpMul, fpDiv } from '../../utils/fixedPoint'
import { useStatStore } from '../stat'

// Mock gameConfig - use literal values instead of toFixed to avoid hoisting issues
vi.mock('@/gameConfig', () => ({
  statConfigMap: {
    strength: {
      id: 'strength',
      sort: 1,
      name: 'Strength',
      description: 'Physical strength',
      base: 0, // 0 as FixedPoint literal
    },
    agility: {
      id: 'agility',
      sort: 2,
      name: 'Agility',
      description: 'Speed and agility',
      base: 0,
    },
    efficiency: {
      id: 'efficiency',
      sort: 3,
      name: 'Efficiency',
      description: 'Efficiency modifier',
      base: 0,
    },
    speed: {
      id: 'speed',
      sort: 4,
      name: 'Speed',
      description: 'Speed modifier',
      base: 0,
    },
    flatStat: {
      id: 'flatStat',
      sort: 5,
      name: 'Flat Stat',
      description: 'Flat stat',
      base: 0,
    },
    percentStat: {
      id: 'percentStat',
      sort: 6,
      name: 'Percent Stat',
      description: 'Percent stat',
      base: 0,
    },
    inverseStat: {
      id: 'inverseStat',
      sort: 7,
      name: 'Inverse Stat',
      description: 'Inverse stat',
      base: 0,
    },
  },
}))

describe('Stat Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('addEffectsFromSource / removeEffectsFromSource', () => {
    it('should add effects from a source', () => {
      const statStore = useStatStore()

      statStore.addEffectsFromSource('test', [
        { statId: 'strength', type: 'flat', value: toFixed(10) },
      ])

      expect(statStore.sourceIdEffectsMap['test']).toBeDefined()
      expect(statStore.sourceIdEffectsMap['test']).toHaveLength(1)
    })

    it('should remove effects from a source', () => {
      const statStore = useStatStore()

      statStore.addEffectsFromSource('test', [
        { statId: 'strength', type: 'flat', value: toFixed(10) },
      ])
      statStore.removeEffectsFromSource('test')

      expect(statStore.sourceIdEffectsMap['test']).toBeUndefined()
    })

    it('should override effects when adding from same source', () => {
      const statStore = useStatStore()

      statStore.addEffectsFromSource('test', [
        { statId: 'strength', type: 'flat', value: toFixed(10) },
      ])
      statStore.addEffectsFromSource('test', [
        { statId: 'strength', type: 'flat', value: toFixed(20) },
      ])

      expect(statStore.sourceIdEffectsMap['test']).toHaveLength(1)
      expect(statStore.sourceIdEffectsMap['test'][0].value).toBe(toFixed(20))
    })
  })

  describe('getModifiersByStatId', () => {
    it('should return empty array when no modifiers', () => {
      const statStore = useStatStore()

      const modifiers = statStore.getModifiersByStatId('strength')

      expect(modifiers).toEqual([])
    })

    it('should return modifiers for specific stat', () => {
      const statStore = useStatStore()

      statStore.addEffectsFromSource('test', [
        { statId: 'strength', type: 'flat', value: toFixed(10) },
        { statId: 'agility', type: 'flat', value: toFixed(5) },
      ])

      const modifiers = statStore.getModifiersByStatId('strength')

      expect(modifiers).toHaveLength(1)
      expect(modifiers[0].value).toBe(toFixed(10))
    })

    it('should aggregate modifiers from multiple sources', () => {
      const statStore = useStatStore()

      statStore.addEffectsFromSource('source1', [
        { statId: 'strength', type: 'flat', value: toFixed(10) },
      ])
      statStore.addEffectsFromSource('source2', [
        { statId: 'strength', type: 'percentage', value: toFixed(0.1) },
      ])

      const modifiers = statStore.getModifiersByStatId('strength')

      expect(modifiers).toHaveLength(2)
    })

    it('should set availableMs to Infinity for non-consumable sources', () => {
      const statStore = useStatStore()

      statStore.addEffectsFromSource('equipment', [
        { statId: 'strength', type: 'flat', value: toFixed(10) },
      ])

      const modifiers = statStore.getModifiersByStatId('strength')

      expect(modifiers[0].availableSeconds).toBe(Infinity)
    })
  })

  describe('getStatValue', () => {
    it('should return 0 for non-existent stat when no base value', () => {
      const statStore = useStatStore()

      expect(statStore.getStatValue('nonExistent')).toBe(toFixed(0))
    })

    it('should calculate stat with flat modifier', () => {
      const statStore = useStatStore()

      statStore.addEffectsFromSource('test', [
        { statId: 'strength', type: 'flat', value: toFixed(10) },
      ])

      // No base, so 0 + 10 = 10
      const value = statStore.getStatValue('strength')
      expect(value).toBe(toFixed(10))
    })

    it('should calculate stat with percentage modifier', () => {
      const statStore = useStatStore()

      statStore.addEffectsFromSource('test', [
        { statId: 'strength', type: 'percentage', value: toFixed(0.5) },
      ])

      // 0 * (1 + 0.5) = 0
      const value = statStore.getStatValue('strength')
      expect(value).toBe(toFixed(0))
    })

    it('should calculate stat with inverse percentage modifier', () => {
      const statStore = useStatStore()

      statStore.addEffectsFromSource('test', [
        { statId: 'strength', type: 'inversePercentage', value: toFixed(0.5) },
      ])

      // 0 / (1 + 0.5) = 0
      const value = statStore.getStatValue('strength')
      expect(value).toBe(toFixed(0))
    })

    it('should combine multiple modifier types', () => {
      const statStore = useStatStore()

      // Base value would be 100 (if defined in config)
      // With flat +20, percentage +50%, inverse percentage +25%
      // Formula: ((100 + 20) * (1 + 0.5)) / (1 + 0.25) = 180 / 1.25 = 144

      statStore.addEffectsFromSource('test', [
        { statId: 'strength', type: 'flat', value: toFixed(20) },
        { statId: 'strength', type: 'percentage', value: toFixed(0.5) },
        { statId: 'strength', type: 'inversePercentage', value: toFixed(0.25) },
      ])

      const value = statStore.getStatValue('strength')
      // Since base is 0: ((0 + 20) * 1.5) / 1.25 = 30 / 1.25 = 24
      expect(value).toBe(toFixed(24))
    })

    it('should filter modifiers by duration', () => {
      const statStore = useStatStore()

      // Add a modifier with limited availability (simulating consumable)
      statStore.addEffectsFromSource('consumable:test:0', [
        { statId: 'strength', type: 'flat', value: toFixed(10) },
      ])

      // Without duration filter, should include the modifier
      const valueNoFilter = statStore.getStatValue('strength', 0)
      expect(valueNoFilter).toBe(toFixed(10))

      // With duration longer than available, should exclude the modifier
      const valueWithFilter = statStore.getStatValue('strength', 10)
      expect(valueWithFilter).toBe(toFixed(0))
    })
  })

  describe('getDerivedStatValue', () => {
    it('should calculate derived value from single stat', () => {
      const statStore = useStatStore()

      statStore.addEffectsFromSource('test', [
        { statId: 'strength', type: 'flat', value: toFixed(10) },
      ])

      const derivedValue = statStore.getDerivedStatValue(
        [{ statId: 'strength', type: 'flat' }],
        toFixed(0),
      )

      // Base 0 + strength(10) = 10
      expect(derivedValue).toBe(toFixed(10))
    })

    it('should calculate derived value with base value', () => {
      const statStore = useStatStore()

      statStore.addEffectsFromSource('test', [
        { statId: 'strength', type: 'flat', value: toFixed(10) },
      ])

      const derivedValue = statStore.getDerivedStatValue(
        [{ statId: 'strength', type: 'flat' }],
        toFixed(100),
      )

      // Base 100 + strength(10) = 110
      expect(derivedValue).toBe(toFixed(110))
    })

    it('should apply percentage modifier from stat', () => {
      const statStore = useStatStore()

      statStore.addEffectsFromSource('test', [
        { statId: 'efficiency', type: 'flat', value: toFixed(0.5) },
      ])

      const derivedValue = statStore.getDerivedStatValue(
        [{ statId: 'efficiency', type: 'percentage' }],
        toFixed(100),
      )

      // Base 100 * (1 + efficiency(0.5)) = 100 * 1.5 = 150
      expect(derivedValue).toBe(toFixed(150))
    })

    it('should apply inverse percentage modifier from stat', () => {
      const statStore = useStatStore()

      statStore.addEffectsFromSource('test', [
        { statId: 'speed', type: 'flat', value: toFixed(0.5) },
      ])

      const derivedValue = statStore.getDerivedStatValue(
        [{ statId: 'speed', type: 'inversePercentage' }],
        toFixed(100),
      )

      // Base 100 / (1 + speed(0.5)) = 100 / 1.5 ≈ 66.666...
      expect(derivedValue).toBe(fpDiv(toFixed(100), toFixed(1.5)))
    })

    it('should combine multiple stats', () => {
      const statStore = useStatStore()

      statStore.addEffectsFromSource('test', [
        { statId: 'strength', type: 'flat', value: toFixed(10) },
        { statId: 'agility', type: 'flat', value: toFixed(5) },
      ])

      const derivedValue = statStore.getDerivedStatValue(
        [
          { statId: 'strength', type: 'flat' },
          { statId: 'agility', type: 'flat' },
        ],
        toFixed(100),
      )

      // Base 100 + strength(10) + agility(5) = 115
      expect(derivedValue).toBe(toFixed(115))
    })

    it('should apply extend modifiers', () => {
      const statStore = useStatStore()

      const derivedValue = statStore.getDerivedStatValue(
        [],
        toFixed(100),
        { type: 'flat', value: toFixed(20), availableMs: Infinity },
        { type: 'percentage', value: toFixed(0.5), availableMs: Infinity },
      )

      // Base 100, flat +20, percentage +50%
      // (100 + 20) * (1 + 0.5) = 120 * 1.5 = 180
      expect(derivedValue).toBe(toFixed(180))
    })
  })

  describe('calculateDerivedValue', () => {
    it('should calculate simple derived value without modifiers', () => {
      const statStore = useStatStore()

      const config = {
        baseValue: toFixed(100),
        modifiers: [],
      }

      const value = statStore.calculateDerivedValue(config)
      expect(value).toBe(toFixed(100))
    })

    it('should apply stat modifiers', () => {
      const statStore = useStatStore()

      statStore.addEffectsFromSource('test', [
        { statId: 'strength', type: 'flat', value: toFixed(10) },
      ])

      const config = {
        baseValue: toFixed(100),
        modifiers: [
          {
            modifierType: 'stat' as const,
            statId: 'strength',
            type: 'flat' as const,
          },
        ],
      }

      const value = statStore.calculateDerivedValue(config)
      // 100 + strength(10) = 110
      expect(value).toBe(toFixed(110))
    })

    it('should use custom resolver for modifiers', () => {
      const statStore = useStatStore()

      const config = {
        baseValue: toFixed(100),
        modifiers: [
          {
            modifierType: 'skillLevel' as const,
            type: 'percentage' as const,
            perLevelValue: toFixed(0.1),
          },
        ],
      }

      const resolver = (modifier: ModifierConfigInternal) => {
        if (modifier.modifierType === 'skillLevel') {
          return fpMul(toFixed(5), modifier.perLevelValue) // 5 levels * 0.1
        }
        return undefined
      }

      const value = statStore.calculateDerivedValue(config, 0, resolver)
      // 100 * (1 + 0.5) = 150
      expect(value).toBe(toFixed(150))
    })

    it('should handle "self" duration mode with convergence', () => {
      const statStore = useStatStore()

      const config = {
        baseValue: toFixed(1000),
        modifiers: [],
      }

      const value = statStore.calculateDerivedValue(config, 'self')
      expect(value).toBe(toFixed(1000))
    })

    it('should filter stat modifiers by duration', () => {
      const statStore = useStatStore()

      // Add a consumable effect with limited availability
      statStore.addEffectsFromSource('consumable:test:0', [
        { statId: 'strength', type: 'flat', value: toFixed(10) },
      ])

      const config = {
        baseValue: toFixed(100),
        modifiers: [
          {
            modifierType: 'stat' as const,
            statId: 'strength',
            type: 'flat' as const,
          },
        ],
      }

      // Short duration - should include modifier
      const valueShort = statStore.calculateDerivedValue(config, 0)
      expect(valueShort).toBe(toFixed(110))

      // Long duration - should exclude modifier (if consumable doesn't have enough time)
      const valueLong = statStore.calculateDerivedValue(config, 100)
      expect(valueLong).toBe(toFixed(100))
    })

    it('should combine all modifier types correctly', () => {
      const statStore = useStatStore()

      statStore.addEffectsFromSource('test', [
        { statId: 'flatStat', type: 'flat', value: toFixed(20) },
        { statId: 'percentStat', type: 'flat', value: toFixed(0.5) },
        { statId: 'inverseStat', type: 'flat', value: toFixed(0.25) },
      ])

      const config = {
        baseValue: toFixed(100),
        modifiers: [
          {
            modifierType: 'stat' as const,
            statId: 'flatStat',
            type: 'flat' as const,
          },
          {
            modifierType: 'stat' as const,
            statId: 'percentStat',
            type: 'percentage' as const,
          },
          {
            modifierType: 'stat' as const,
            statId: 'inverseStat',
            type: 'inversePercentage' as const,
          },
        ],
      }

      const value = statStore.calculateDerivedValue(config)
      // ((100 + 20) * (1 + 0.5)) / (1 + 0.25) = 180 / 1.25 = 144
      expect(value).toBe(toFixed(144))
    })
  })

  describe('complex scenarios', () => {
    it('should handle multiple sources with same stat', () => {
      const statStore = useStatStore()

      statStore.addEffectsFromSource('equipment', [
        { statId: 'strength', type: 'flat', value: toFixed(10) },
      ])
      statStore.addEffectsFromSource('buff', [
        { statId: 'strength', type: 'flat', value: toFixed(5) },
      ])
      statStore.addEffectsFromSource('skill', [
        { statId: 'strength', type: 'percentage', value: toFixed(0.2) },
      ])

      const value = statStore.getStatValue('strength')
      // (0 + 10 + 5) * (1 + 0.2) = 15 * 1.2 = 18
      expect(value).toBe(toFixed(18))
    })

    it('should recalculate when sources change', () => {
      const statStore = useStatStore()

      statStore.addEffectsFromSource('test', [
        { statId: 'strength', type: 'flat', value: toFixed(10) },
      ])

      const value1 = statStore.getStatValue('strength')
      expect(value1).toBe(toFixed(10))

      statStore.addEffectsFromSource('test', [
        { statId: 'strength', type: 'flat', value: toFixed(20) },
      ])

      const value2 = statStore.getStatValue('strength')
      expect(value2).toBe(toFixed(20))
    })
  })
})
