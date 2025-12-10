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

// 游戏特定颜色
const stat = {
  hp: '#22c55e',      // 绿色 - 生命值
  mp: '#0ea5e9',      // 蓝色 - 魔法值
  attack: '#a855f7',  // 紫色 - 攻击进度
}

const damage = {
  player: '#ef4444',  // 红色 - 玩家受伤害
  enemy: '#22c55e',   // 绿色 - 敌人受伤害（玩家造成）
}

const skill = {
  header: '#eef2ff',      // 浅蓝背景
  headerText: '#1e40af',  // 深蓝文字
  headerBorder: '#bfdbfe', // 蓝色边框
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

      // 游戏状态颜色
      stat,
      damage,
      skill,
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
    'footer-gradient-mask': 'fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent py-4 px-8 border-t border-neutral-200 shadow-lg',

    // ==================== 卡片 ====================
    'card-item': 'bg-surface border border-neutral-50 shadow-card rounded-md hover:shadow-panel transition flex items-center justify-center',

    // 卡片变种
    'card-item-square': 'card-item w-16 h-16',
    'card-item-square-relative': 'card-item w-16 h-16 relative',
    'card-item-equipped': 'card-item w-full h-full border-2 border-primary bg-surface-subtle p-1 select-none',
    'card-slot-empty': 'w-full h-full rounded bg-neutral-50 border border-dashed border-neutral-100 flex items-center justify-center p-1 select-none',
    'card-consumable-slot': 'card-item w-16 h-16 flex-col gap-1 p-1 select-none bg-primary/5 border-2 border-primary shadow-sm hover:shadow-md hover:-translate-y-0.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',

    // ==================== 选项卡 ====================
    'tab-button-base': 'font-semibold transition border-b-2 cursor-pointer text-sm',
    'tab-button-active': 'tab-button-base border-primary text-primary',
    'tab-button-inactive': 'tab-button-base border-transparent text-neutral-500 hover:text-neutral-700',

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
    'nav-link-active': '!bg-gradient-to-br !from-primary !to-blue-500 !text-white !shadow-lg',

    // ==================== 进度条 ====================
    'progress-bar':
      'h-full bg-gradient-to-r from-cyan-400 to-primary transition-all shadow-inner shadow-primary/20',
    'progress-track': 'w-full bg-neutral-100 rounded-full overflow-hidden',
    'progress-track-thin': 'h-1 bg-neutral-200 rounded-full overflow-hidden',

    // ==================== 徽章 ====================
    'badge': 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-neutral-50 text-neutral-500',

    // 徽章变种
    'badge-primary': 'badge bg-primary/10 text-primary',
    'badge-secondary': 'badge bg-neutral-50 text-neutral-500',
    'badge-success': 'badge bg-success/10 text-success',
    'badge-error': 'badge bg-error/10 text-error',
    'badge-vs': 'text-3xl font-black text-neutral-300 italic bg-white px-3 py-1 rounded-full shadow-sm border border-neutral-100',

    // ==================== 状态条（游戏特定）====================
    'stat-bar-container': 'h-6 bg-neutral-100 relative w-full',
    'stat-bar-label': 'absolute inset-0 flex items-center justify-center text-xs font-bold text-white drop-shadow-md',
    'stat-bar-fill': 'h-full transition-all',
    'stat-bar-hp': 'stat-bar-fill bg-stat-hp',
    'stat-bar-mp': 'stat-bar-fill bg-stat-mp',
    'stat-bar-attack': 'stat-bar-fill bg-stat-attack h-8',

    // ==================== 标题等级系统 ====================
    'heading-page': 'text-4xl sm:text-5xl font-bold text-neutral-900',
    'heading-page-small': 'text-3xl sm:text-4xl font-bold text-neutral-900',
    'heading-section': 'text-2xl sm:text-3xl font-bold text-neutral-900',
    'heading-subsection': 'text-xl sm:text-2xl font-bold text-neutral-900',
    'heading-modal': 'text-xl sm:text-2xl font-bold text-neutral-900',
    'heading-small': 'text-lg sm:text-xl font-bold text-neutral-900',
    'heading-level': 'text-sm font-semibold text-skill-headerText px-2 py-1 bg-white rounded',

    // ==================== 文本标签 ====================
    'label-xs': 'text-xs text-neutral-500 uppercase',
    'label-sm': 'text-sm font-semibold text-neutral-700',
    'label-md': 'text-base font-semibold text-neutral-900',

    // ==================== 技能卡片样式 ====================
    'skill-header': 'p-4 bg-gradient-to-br from-skill-header to-skill-header/80 rounded-none border border-skill-headerBorder',
    'skill-title': 'heading-section text-neutral-900',
    'skill-description': 'text-neutral-700 mb-3',

    // ==================== 空状态 ====================
    'empty-state': 'w-full text-neutral-500 text-center py-8',
    'empty-slot': 'text-sm text-neutral-400 italic',

    // ==================== 页面容器 ====================
    'page-container': 'flex flex-col gap-2 p-4 pb-32',
    'section-header': 'flex items-center gap-2 mb-2 px-2',
    'section-title': 'text-sm font-semibold text-neutral-700',

    // ==================== 模态框内容 ====================
    'modal-content': 'flex flex-col gap-1 min-w-[min(380px,100%)]',
    'modal-header': 'flex justify-between items-start gap-2',
    'modal-title': 'heading-subsection',

    // ==================== 信息区域 ====================
    'info-section': 'flex justify-between items-center py-1',
    'info-label': 'text-sm font-medium text-neutral-700',
    'info-value': 'text-sm text-neutral-900',

    // ==================== 分隔线 ====================
    'divider': 'h-px bg-neutral-200 my-2',

    // ==================== 伤害指示 ====================
    'damage-player': 'text-damage-player',
    'damage-enemy': 'text-damage-enemy',

    // ==================== 网格布局 ====================

    // ==================== 通知卡片 ====================
    'notification-item': 'pointer-events-auto min-w-60 max-w-90 p-2 rounded-none bg-surface shadow-panel flex items-start gap-2 border-l-4 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
    'notification-error': 'notification-item border-error',
    'notification-warning': 'notification-item border-warning',
    'notification-info': 'notification-item border-primary',

    // ==================== 模态框容器 ====================
    'modal-container': 'relative max-h-[min(720px,90vh)] w-[min(360px,95%)] sm:w-[min(460px,100%)] lg:w-[min(520px,100%)] bg-surface rounded-lg shadow-2xl overflow-auto p-2 sm:p-3 lg:p-4',
    'modal-dialog': 'outline-none',

  },
})
