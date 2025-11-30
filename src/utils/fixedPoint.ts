/**
 * 定点数工具库
 *
 * 使用 1000 倍缩放的定点数来确保跨语言后端运算结果的一致性。
 * 所有游戏内的数值计算都应使用 FixedPoint 类型和相应的运算函数。
 *
 * @example
 * const a = toFixed(5.5)    // 5500
 * const b = toFixed(2.2)    // 2200
 * const sum = fpAdd(a, b)   // 7700
 * fromFixed(sum)            // 7.7
 */

/**
 * 定点数缩放常量
 * 所有浮点数将乘以此常量转换为定点数
 */
export const SCALE = 1000

/**
 * 定点数类型（品牌类型，编译时类型安全）
 *
 * 注意：禁止直接对 FixedPoint 使用 + - * / < > 等运算符
 * 必须使用本文件提供的 fp* 系列函数进行运算
 */
export type FixedPoint = number & { readonly __brand: 'FixedPoint' }

/** 时间（秒）的语义别名 */
export type Seconds = number

/** 使用定点数表示的秒数 */
export type SecondsFixed = FixedPoint

/**
 * 将普通数字转换为定点数
 * @param n 普通数字
 * @returns 定点数
 */
export function toFixed(n: number): FixedPoint {
  return (n * SCALE) as FixedPoint
}

/**
 * 将定点数转换为普通数字
 * @param fp 定点数
 * @returns 普通数字
 */
export function fromFixed(fp: FixedPoint): number {
  return fp / SCALE
}

/**
 * 将秒（浮点）转换为定点秒
 */
export function toSecondsFixed(seconds: Seconds): SecondsFixed {
  return toFixed(seconds) as SecondsFixed
}

/**
 * 将定点秒转换为普通秒
 */
export function fromSecondsFixed(secondsFixed: SecondsFixed): Seconds {
  return fromFixed(secondsFixed)
}

// ==================== 四则运算 ====================

/**
 * 定点数加法
 */
export function fpAdd(a: FixedPoint, b: FixedPoint): FixedPoint {
  return (a + b) as FixedPoint
}

/**
 * 定点数减法
 */
export function fpSub(a: FixedPoint, b: FixedPoint): FixedPoint {
  return (a - b) as FixedPoint
}

/**
 * 定点数乘法
 */
export function fpMul(a: FixedPoint, b: FixedPoint): FixedPoint {
  return ((a * b) / SCALE) as FixedPoint
}

/**
 * 定点数除法
 */
export function fpDiv(a: FixedPoint, b: FixedPoint): FixedPoint {
  return ((a * SCALE) / b) as FixedPoint
}

/**
 * 定点数取模（余数）
 */
export function fpMod(a: FixedPoint, b: FixedPoint): FixedPoint {
  return (a % b) as FixedPoint
}

// ==================== 比较函数 ====================

/**
 * 定点数大于比较
 */
export function fpGt(a: FixedPoint, b: FixedPoint): boolean {
  return a > b
}

/**
 * 定点数小于比较
 */
export function fpLt(a: FixedPoint, b: FixedPoint): boolean {
  return a < b
}

/**
 * 定点数等于比较
 */
export function fpEq(a: FixedPoint, b: FixedPoint): boolean {
  return a === b
}

/**
 * 定点数大于等于比较
 */
export function fpGte(a: FixedPoint, b: FixedPoint): boolean {
  return a >= b
}

/**
 * 定点数小于等于比较
 */
export function fpLte(a: FixedPoint, b: FixedPoint): boolean {
  return a <= b
}

// ==================== 取整函数 ====================

/**
 * 定点数向下取整
 */
export function fpFloor(fp: FixedPoint): FixedPoint {
  return Math.floor(fp) as FixedPoint
}

/**
 * 定点数向上取整
 */
export function fpCeil(fp: FixedPoint): FixedPoint {
  return Math.ceil(fp) as FixedPoint
}

/**
 * 定点数四舍五入
 */
export function fpRound(fp: FixedPoint): FixedPoint {
  return Math.round(fp) as FixedPoint
}

/**
 * 定点数取最大值
 */
export function fpMax(a: FixedPoint, b: FixedPoint): FixedPoint {
  return Math.max(a, b) as FixedPoint
}

/**
 * 定点数取最小值
 */
export function fpMin(a: FixedPoint, b: FixedPoint): FixedPoint {
  return Math.min(a, b) as FixedPoint
}
