/**
 * 数量输入解析工具
 * 用于解析用户输入的数量值（支持 ∞ 符号表示无限）
 */

import { INFINITE_AMOUNT } from './constants'

/**
 * 检查字符串是否为整数或 ∞
 * @param str - 待检查的字符串
 * @returns 是否符合格式
 */
export function isIntegerOrInfinity(str: string): boolean {
  const pattern = /^-?\d+$|^∞$/
  return pattern.test(str)
}

/**
 * 将字符串转换为数值
 * @param str - 输入字符串（如 "5", "∞", "invalid"）
 * @param defaultValue - 默认值（当无法解析时使用）
 * @param options - 额外选项
 * @param options.allowZero - 是否允许 0（false 时，<=0 的值会返回默认值）
 * @returns 解析后的数值
 *
 * @example
 * // Action 场景（允许任何整数）
 * parseAmountString('100')  // → 100
 * parseAmountString('∞')    // → INFINITE_AMOUNT
 * parseAmountString('invalid') // → INFINITE_AMOUNT
 *
 * @example
 * // Combat 场景（不允许 0 或负数）
 * parseAmountString('5', 1, { allowZero: false })   // → 5
 * parseAmountString('0', 1, { allowZero: false })   // → 1（默认值）
 * parseAmountString('-1', 1, { allowZero: false })  // → 1（默认值）
 */
export function parseAmountString(
  str: string,
  defaultValue: number = INFINITE_AMOUNT,
  options?: { allowZero?: boolean }
): number {
  // ∞ 始终返回 INFINITE_AMOUNT
  if (str === '∞') return INFINITE_AMOUNT

  const num = Number(str)

  // 检查是否为有效的整数
  if (!isNaN(num) && Number.isInteger(num)) {
    // 如果设置了 allowZero: false，则 num <= 0 时返回默认值
    if (options?.allowZero === false && num <= 0) {
      return defaultValue === INFINITE_AMOUNT ? 1 : defaultValue
    }
    return num
  }

  // 无法解析时返回默认值
  return defaultValue
}
