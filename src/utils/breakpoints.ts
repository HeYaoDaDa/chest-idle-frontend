/**
 * 响应式设计系统 - 断点和规则定义
 *
 * 项目采用 Mobile-First 策略，使用标准 Tailwind 断点
 * 主要断点是 lg: (1024px)，用于 mobile ↔ desktop 切换
 */

export const BREAKPOINTS = {
  xs: '0px',      // 默认（无前缀）
  sm: '640px',    // 大手机（iPhone 12 Pro）
  md: '768px',    // 平板竖屏（iPad）
  lg: '1024px',   // 桌面 ⭐ 项目主断点
  xl: '1280px',   // 大桌面
  '2xl': '1536px', // 超大屏
} as const

export const BREAKPOINT_LABELS = {
  xs: 'Mobile',
  sm: 'Large Mobile',
  md: 'Tablet',
  lg: 'Desktop',  // ⭐ 当前唯一明确的分界
  xl: 'Large Desktop',
  '2xl': 'Extra Large',
} as const

/**
 * 响应式设计规则集
 * 定义各个断点下的推荐值
 */
export const RESPONSIVE_RULES = {
  // 内边距规则
  padding: {
    xs: 'p-2 px-3',      // 手机：紧凑（6px padding）
    sm: 'p-3 px-4',      // 大手机：舒适（12px padding）
    md: 'p-4 px-6',      // 平板：宽松（16px padding）
    lg: 'p-4 px-6',      // 桌面：同平板
  },

  // 按钮尺寸规则（必须 ≥ 44x44px）
  button: {
    xs: 'py-3 px-4',     // ≈ 38-40px (手机：3-4px top-bot + 14px font)
    sm: 'py-2.5 px-4',   // ≈ 35-36px (稍小一点)
    md: 'py-2 px-3',     // ≈ 30px
    lg: 'py-2 px-3',     // ≈ 30px (桌面)
  },

  // 标题文字规则
  heading: {
    xs: 'text-lg',       // 小手机（18px）
    sm: 'text-xl',       // 大手机（20px）
    md: 'text-2xl',      // 平板（24px）
    lg: 'text-3xl',      // 桌面（30px）
  },

  // 网格列数规则
  grid: {
    xs: 'grid-cols-2',   // 手机：2列
    sm: 'grid-cols-3',   // 大手机：3列
    md: 'grid-cols-4',   // 平板：4列
    lg: 'grid-cols-5',   // 桌面：5列+
  },

  // 间距规则
  gap: {
    xs: 'gap-1',         // 手机：4px
    sm: 'gap-1.5',       // 大手机：6px
    md: 'gap-2',         // 平板：8px
    lg: 'gap-3',         // 桌面：12px
  }
} as const

// 导出类型
export type Breakpoint = keyof typeof BREAKPOINTS
export type BreakpointLabel = keyof typeof BREAKPOINT_LABELS
export type ResponsiveRules = typeof RESPONSIVE_RULES
