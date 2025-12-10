/**
 * 数值与时间格式化工具
 */

/**
 * 格式化数值，使用本地化的千分位分隔符
 * @param value 数值
 * @param locale 语言地区（如 'en-US', 'zh-CN'），默认 'en'
 * @param maximumFractionDigits 最多小数位数
 * @returns 格式化后的字符串
 */
export function formatNumber(
  value: number,
  locale: string = 'en-US',
  maximumFractionDigits: number = 3,
): string {
  return value.toLocaleString(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  })
}

/**
 * 格式化百分比
 * @param value 百分比数值（0-100）
 * @param maximumFractionDigits 最多小数位数
 * @returns 格式化后的字符串（带 %）
 */
export function formatPercent(
  value: number,
  locale: string = 'en-US',
  maximumFractionDigits: number = 0,
): string {
  // value is expected to be in 0..100
  return `${formatNumber(value, locale, maximumFractionDigits)}%`
}

/**
 * 格式化时间（毫秒转换为可读字符串或秒数）
 * @param ms 毫秒数
 * @param locale 语言地区（如 'en-US', 'zh-CN'）
 * @param options 选项
 * @param options.maxFractionDigits 秒数的最多小数位数（仅当返回秒数时有效）
 * @param options.compact 是否返回紧凑格式（仅对长时有效）
 * @returns
 *   - ms < 60000: 返回秒数（数值），可用 i18n `t('ui.seconds', { value: formatDurationMs(...) })`
 *   - ms >= 60000: 返回 'mm:ss' 字符串（直接显示，不需 i18n）
 */
/**
 * 返回用于展示的时长字符串（始终为字符串，已包含单位或时分秒格式）
 * - ms < 60000: 返回类似 "1.23s"（使用 locale 格式化小数）
 * - ms >= 60000: 返回 "mm:ss" 或 "hh:mm:ss"
 */
export function formatDurationMs(
  ms: number,
  locale: string = 'en-US',
  options?: { maxFractionDigits?: number; compact?: boolean },
): string {
  const maxFractionDigits = options?.maxFractionDigits ?? 3
  const compact = options?.compact ?? false

  if (ms < 60000) {
    const seconds = ms / 1000
    const formatted = formatNumber(seconds, locale, maxFractionDigits)
    return `${formatted}s`
  }

  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  if (compact) {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  if (minutes < 60) {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours}:${remainingMinutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`
}

/**
 * 返回时长对应的数值（秒），用于逻辑计算
 */
export function formatDurationMsValue(ms: number): number {
  return ms / 1000
}
