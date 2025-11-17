import { describe, it, expect } from 'vitest'

import { isInfiniteAmount, toFiniteForCompute, fromComputeResult, decrementAmount } from '../amount'
import { INFINITE_AMOUNT } from '../constants'

describe('amount', () => {
  describe('INFINITE_AMOUNT constant', () => {
    it('should be -1', () => {
      expect(INFINITE_AMOUNT).toBe(-1)
    })
  })

  describe('isInfiniteAmount', () => {
    it('should return true for INFINITE_AMOUNT', () => {
      expect(isInfiniteAmount(INFINITE_AMOUNT)).toBe(true)
      expect(isInfiniteAmount(-1)).toBe(true)
    })

    it('should return false for other values', () => {
      expect(isInfiniteAmount(0)).toBe(false)
      expect(isInfiniteAmount(1)).toBe(false)
      expect(isInfiniteAmount(100)).toBe(false)
      expect(isInfiniteAmount(-2)).toBe(false)
    })
  })

  describe('toFiniteForCompute', () => {
    it('should convert INFINITE_AMOUNT to Infinity', () => {
      expect(toFiniteForCompute(INFINITE_AMOUNT)).toBe(Infinity)
    })

    it('should return same value for finite amounts', () => {
      expect(toFiniteForCompute(0)).toBe(0)
      expect(toFiniteForCompute(100)).toBe(100)
      expect(toFiniteForCompute(50)).toBe(50)
    })
  })

  describe('fromComputeResult', () => {
    it('should convert Infinity to INFINITE_AMOUNT', () => {
      expect(fromComputeResult(Infinity)).toBe(INFINITE_AMOUNT)
    })

    it('should return same value for finite results', () => {
      expect(fromComputeResult(0)).toBe(0)
      expect(fromComputeResult(100)).toBe(100)
      expect(fromComputeResult(42.5)).toBe(42.5)
    })
  })

  describe('decrementAmount', () => {
    it('should return INFINITE_AMOUNT unchanged', () => {
      expect(decrementAmount(INFINITE_AMOUNT, 10)).toBe(INFINITE_AMOUNT)
      expect(decrementAmount(INFINITE_AMOUNT, 1000)).toBe(INFINITE_AMOUNT)
    })

    it('should decrement finite amounts', () => {
      expect(decrementAmount(100, 10)).toBe(90)
      expect(decrementAmount(50, 25)).toBe(25)
      expect(decrementAmount(10, 5)).toBe(5)
    })

    it('should not go below zero', () => {
      expect(decrementAmount(10, 20)).toBe(0)
      expect(decrementAmount(5, 10)).toBe(0)
      expect(decrementAmount(0, 5)).toBe(0)
    })

    it('should handle exact depletion', () => {
      expect(decrementAmount(10, 10)).toBe(0)
    })

    it('should handle fractional deltas', () => {
      expect(decrementAmount(10.5, 2.5)).toBe(8)
      expect(decrementAmount(5.5, 6)).toBe(0)
    })
  })

  describe('integration scenarios', () => {
    it('should handle round-trip conversion', () => {
      const finite = 100
      const computed = toFiniteForCompute(finite)
      const result = fromComputeResult(computed)
      expect(result).toBe(finite)
    })

    it('should handle infinite round-trip', () => {
      const infinite = INFINITE_AMOUNT
      const computed = toFiniteForCompute(infinite)
      const result = fromComputeResult(computed)
      expect(result).toBe(INFINITE_AMOUNT)
    })
  })
})
