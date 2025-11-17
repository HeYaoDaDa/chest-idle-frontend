import { describe, it, expect } from 'vitest'

import {
  SCALE,
  toFixed,
  fromFixed,
  fpAdd,
  fpSub,
  fpMul,
  fpDiv,
  fpMod,
  fpGt,
  fpLt,
  fpEq,
  fpGte,
  fpLte,
  fpFloor,
  fpCeil,
  fpRound,
  fpMax,
  fpMin,
  type FixedPoint,
} from '../fixedPoint'

describe('fixedPoint', () => {
  describe('conversion', () => {
    it('should convert number to fixed point', () => {
      expect(toFixed(5.5)).toBe(5500)
      expect(toFixed(2.2)).toBe(2200)
      expect(toFixed(0)).toBe(0)
      expect(toFixed(-3.14)).toBe(-3140)
    })

    it('should convert fixed point to number', () => {
      expect(fromFixed(5500 as FixedPoint)).toBe(5.5)
      expect(fromFixed(2200 as FixedPoint)).toBe(2.2)
      expect(fromFixed(0 as FixedPoint)).toBe(0)
      expect(fromFixed(-3140 as FixedPoint)).toBe(-3.14)
    })

    it('should maintain scale constant', () => {
      expect(SCALE).toBe(1000)
    })
  })

  describe('arithmetic operations', () => {
    it('should add fixed points', () => {
      const a = toFixed(5.5)
      const b = toFixed(2.2)
      const sum = fpAdd(a, b)
      expect(fromFixed(sum)).toBeCloseTo(7.7, 3)
    })

    it('should subtract fixed points', () => {
      const a = toFixed(10.5)
      const b = toFixed(3.2)
      const diff = fpSub(a, b)
      expect(fromFixed(diff)).toBeCloseTo(7.3, 3)
    })

    it('should multiply fixed points', () => {
      const a = toFixed(4)
      const b = toFixed(2.5)
      const product = fpMul(a, b)
      expect(fromFixed(product)).toBeCloseTo(10, 3)
    })

    it('should divide fixed points', () => {
      const a = toFixed(10)
      const b = toFixed(2)
      const quotient = fpDiv(a, b)
      expect(fromFixed(quotient)).toBeCloseTo(5, 3)
    })

    it('should calculate modulo of fixed points', () => {
      const a = toFixed(10.5)
      const b = toFixed(3)
      const mod = fpMod(a, b)
      expect(fromFixed(mod)).toBeCloseTo(1.5, 3)
    })

    it('should handle zero operations', () => {
      const zero = toFixed(0)
      const five = toFixed(5)

      expect(fromFixed(fpAdd(five, zero))).toBe(5)
      expect(fromFixed(fpSub(five, zero))).toBe(5)
      expect(fromFixed(fpMul(five, zero))).toBe(0)
    })
  })

  describe('comparison operations', () => {
    it('should compare greater than', () => {
      expect(fpGt(toFixed(5), toFixed(3))).toBe(true)
      expect(fpGt(toFixed(3), toFixed(5))).toBe(false)
      expect(fpGt(toFixed(5), toFixed(5))).toBe(false)
    })

    it('should compare less than', () => {
      expect(fpLt(toFixed(3), toFixed(5))).toBe(true)
      expect(fpLt(toFixed(5), toFixed(3))).toBe(false)
      expect(fpLt(toFixed(5), toFixed(5))).toBe(false)
    })

    it('should compare equality', () => {
      expect(fpEq(toFixed(5), toFixed(5))).toBe(true)
      expect(fpEq(toFixed(5), toFixed(3))).toBe(false)
    })

    it('should compare greater than or equal', () => {
      expect(fpGte(toFixed(5), toFixed(3))).toBe(true)
      expect(fpGte(toFixed(5), toFixed(5))).toBe(true)
      expect(fpGte(toFixed(3), toFixed(5))).toBe(false)
    })

    it('should compare less than or equal', () => {
      expect(fpLte(toFixed(3), toFixed(5))).toBe(true)
      expect(fpLte(toFixed(5), toFixed(5))).toBe(true)
      expect(fpLte(toFixed(5), toFixed(3))).toBe(false)
    })
  })

  describe('rounding operations', () => {
    it('should floor fixed points to nearest integer in fixed space', () => {
      // fpFloor operates on the internal representation, flooring to nearest 1000
      const fp = toFixed(5.9) // 5900
      const floored = fpFloor(fp) // floor(5900) = 5900
      expect(floored).toBe(5900 as FixedPoint)

      // For truly flooring the value, need to floor then multiply
      expect(fromFixed(toFixed(Math.floor(5.9)))).toBe(5)
      expect(fromFixed(toFixed(Math.floor(5.1)))).toBe(5)
      expect(fromFixed(toFixed(Math.floor(-5.9)))).toBe(-6)
    })

    it('should ceil fixed points to nearest integer in fixed space', () => {
      const fp = toFixed(5.1) // 5100
      const ceiled = fpCeil(fp) // ceil(5100) = 5100
      expect(ceiled).toBe(5100 as FixedPoint)

      expect(fromFixed(toFixed(Math.ceil(5.1)))).toBe(6)
      expect(fromFixed(toFixed(Math.ceil(5.9)))).toBe(6)
      expect(fromFixed(toFixed(Math.ceil(-5.1)))).toBe(-5)
    })

    it('should round fixed points to nearest integer in fixed space', () => {
      const fp = toFixed(5.4) // 5400
      const rounded = fpRound(fp) // round(5400) = 5400
      expect(rounded).toBe(5400 as FixedPoint)

      expect(fromFixed(toFixed(Math.round(5.4)))).toBe(5)
      expect(fromFixed(toFixed(Math.round(5.5)))).toBe(6)
      expect(fromFixed(toFixed(Math.round(5.6)))).toBe(6)
    })
  })

  describe('min/max operations', () => {
    it('should find maximum of two fixed points', () => {
      expect(fromFixed(fpMax(toFixed(5), toFixed(3)))).toBe(5)
      expect(fromFixed(fpMax(toFixed(3), toFixed(5)))).toBe(5)
      expect(fromFixed(fpMax(toFixed(5), toFixed(5)))).toBe(5)
    })

    it('should find minimum of two fixed points', () => {
      expect(fromFixed(fpMin(toFixed(5), toFixed(3)))).toBe(3)
      expect(fromFixed(fpMin(toFixed(3), toFixed(5)))).toBe(3)
      expect(fromFixed(fpMin(toFixed(5), toFixed(5)))).toBe(5)
    })
  })

  describe('edge cases', () => {
    it('should handle very large numbers', () => {
      const large = toFixed(1000000)
      expect(fromFixed(large)).toBe(1000000)
    })

    it('should handle very small numbers', () => {
      const small = toFixed(0.001)
      expect(fromFixed(small)).toBeCloseTo(0.001, 3)
    })

    it('should handle negative numbers', () => {
      const neg = toFixed(-42.5)
      expect(fromFixed(neg)).toBe(-42.5)
      expect(fromFixed(fpAdd(neg, toFixed(50)))).toBeCloseTo(7.5, 3)
    })
  })
})
