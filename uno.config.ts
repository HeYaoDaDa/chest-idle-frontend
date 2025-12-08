import presetWind from '@unocss/preset-wind'
import { defineConfig } from 'unocss'

const surface = {
  DEFAULT: '#ffffff',
  muted: '#f8fafc',
  subtle: '#edf2ff',
  overlay: 'rgba(0, 0, 0, 0.35)',  // 新增
}

const neutral = {
  25: '#f6f8fb',
  50: '#f1f5f9',
  100: '#e2e8f0',
  200: '#cbd5e0',  // 改为 e0，保持一致
  300: '#94a3b8',
  400: '#64748b',
  500: '#475569',
  600: '#334155',
  700: '#1e293b',
  800: '#0f172a',
  900: '#020617',
}

// 新增 state 对象
const state = {
  hover: 'rgba(37, 99, 235, 0.05)',
  active: 'rgba(37, 99, 235, 0.1)',
  disabled: 'rgba(148, 163, 184, 0.5)',
}

export default defineConfig({
  presets: [presetWind()],
  theme: {
    colors: {
      // 基础色
      primary: '#2563eb',
      primaryMuted: '#3b82f6',
      success: '#22c55e',
      warning: '#f97316',
      error: '#ef4444',

      // 表面色
      surface,

      // 中性色（替代 gray）
      neutral,

      // 状态色（新增）
      state,
    },
    boxShadow: {
      panel: '0 10px 25px -15px rgba(15, 23, 42, 0.35)',
      card: '0 6px 18px -12px rgba(15, 23, 42, 0.35)',
    },
    borderRadius: {
      panel: '18px',
    },
  },
  shortcuts: {
    // ==================== 基础框架 ====================
    'panel':
      'bg-surface/90 backdrop-blur-md border border-neutral-100 rounded-lg shadow-panel overflow-hidden',

    // ==================== 卡片 ====================
    'card-item': 'bg-surface border border-neutral-50 shadow-card rounded-md hover:shadow-panel transition flex items-center justify-center',

    // ==================== 按钮基础 ====================
    'btn-base':
      'px-3 py-2 rounded-md text-sm font-semibold transition inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary disabled:opacity-50 disabled:cursor-not-allowed',

    // ==================== 按钮变种 ====================
    'btn-primary': 'btn-base bg-primary text-white hover:bg-primary/90 shadow-sm',
    'btn-secondary': 'btn-base bg-neutral-100 text-neutral-900 hover:bg-neutral-200 border border-neutral-200',
    'btn-destructive': 'btn-base bg-error/10 text-error border border-error/30 hover:bg-error/20',

    // ==================== 按钮尺寸 ====================
    'btn-sm': 'px-2 py-1 text-xs rounded-md',

    // ==================== 输入框 ====================
    'input-base':
      'px-3 py-2 rounded-md border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition text-sm',

    // ==================== 导航链接 ====================
    'nav-link':
      'flex flex-col justify-center items-stretch gap-0.5 p-2 px-3 rounded-md bg-neutral-50 font-semibold text-neutral-500 transition cursor-pointer select-none hover:bg-neutral-100 hover:text-neutral-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary text-sm no-underline',

    // ==================== 进度条 ====================
    'progress-bar':
      'h-full bg-gradient-to-r from-cyan-400 to-primary transition-all shadow-inner shadow-primary/20',
    'progress-track': 'w-full bg-neutral-100 rounded-full overflow-hidden',

    // ==================== 徽章 ====================
    'badge': 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-neutral-50 text-neutral-500',

    // ==================== 网格布局 ====================

  },
})
