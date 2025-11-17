import { describe, it, expect } from 'vitest'

import { formatNumber, formatPercent, formatDurationMs, formatDurationMsValue } from '../format'

describe('format', () => {
  describe('formatNumber', () => {
    it('should format integers with default locale', () => {
      expect(formatNumber(1000)).toBe('1,000')
      expect(formatNumber(1000000)).toBe('1,000,000')
    })

    it('should format decimals with specified precision', () => {
      expect(formatNumber(123.456, 'en-US', 2)).toBe('123.46')
      expect(formatNumber(123.456, 'en-US', 0)).toBe('123')
      expect(formatNumber(123.1, 'en-US', 3)).toBe('123.1')
    })

    it('should handle zero and negative numbers', () => {
      expect(formatNumber(0)).toBe('0')
      expect(formatNumber(-123.45, 'en-US', 2)).toBe('-123.45')
    })

    it('should respect locale formatting', () => {
      expect(formatNumber(1234.56, 'en-US')).toBe('1,234.56')
      // Note: zh-CN might format differently, test for consistency
      const zhFormat = formatNumber(1234.56, 'zh-CN', 2)
      expect(typeof zhFormat).toBe('string')
    })
  })

  describe('formatPercent', () => {
    it('should format percentage values', () => {
      expect(formatPercent(50, 'en-US', 0)).toBe('50%')
      expect(formatPercent(75.5, 'en-US', 1)).toBe('75.5%')
      expect(formatPercent(100, 'en-US', 0)).toBe('100%')
    })

    it('should handle decimal precision', () => {
      expect(formatPercent(33.333, 'en-US', 2)).toBe('33.33%')
      expect(formatPercent(66.666, 'en-US', 0)).toBe('67%')
    })

    it('should handle zero percent', () => {
      expect(formatPercent(0, 'en-US', 0)).toBe('0%')
    })
  })

  describe('formatDurationMs', () => {
    it('should format sub-minute durations as seconds', () => {
      expect(formatDurationMs(1234, 'en-US')).toBe('1.234s')
      expect(formatDurationMs(5000, 'en-US')).toBe('5s')
      expect(formatDurationMs(500, 'en-US', { maxFractionDigits: 2 })).toBe('0.5s')
    })

    it('should format minutes and seconds as mm:ss', () => {
      expect(formatDurationMs(60000)).toBe('1:00')
      expect(formatDurationMs(90000)).toBe('1:30')
      expect(formatDurationMs(125000)).toBe('2:05')
    })

    it('should format hours, minutes, and seconds as hh:mm:ss', () => {
      expect(formatDurationMs(3600000)).toBe('1:00:00')
      expect(formatDurationMs(3665000)).toBe('1:01:05')
      expect(formatDurationMs(7200000)).toBe('2:00:00')
    })

    it('should handle compact format for minutes', () => {
      expect(formatDurationMs(90000, 'en-US', { compact: true })).toBe('1:30')
    })

    it('should pad seconds with leading zero', () => {
      expect(formatDurationMs(61000)).toBe('1:01')
      expect(formatDurationMs(605000)).toBe('10:05')
    })

    it('should handle zero duration', () => {
      expect(formatDurationMs(0)).toBe('0s')
    })
  })

  describe('formatDurationMsValue', () => {
    it('should convert milliseconds to seconds', () => {
      expect(formatDurationMsValue(1000)).toBe(1)
      expect(formatDurationMsValue(5000)).toBe(5)
      expect(formatDurationMsValue(1500)).toBe(1.5)
    })

    it('should handle zero', () => {
      expect(formatDurationMsValue(0)).toBe(0)
    })

    it('should handle sub-second values', () => {
      expect(formatDurationMsValue(500)).toBe(0.5)
      expect(formatDurationMsValue(100)).toBe(0.1)
    })
  })

  describe('edge cases', () => {
    it('should handle very large numbers', () => {
      const large = formatNumber(1e12, 'en-US', 0)
      expect(large).toContain('000')
    })

    it('should handle very small decimals', () => {
      expect(formatNumber(0.001, 'en-US', 3)).toBe('0.001')
    })

    it('should handle boundary between second and minute format', () => {
      expect(formatDurationMs(59999)).toBe('59.999s')
      expect(formatDurationMs(60000)).toBe('1:00')
    })
  })
})
