import { defineConfig, presetUno } from 'unocss'

const surface = {
  DEFAULT: '#ffffff',
  muted: '#f8fafc',
  subtle: '#edf2ff',
}

const neutral = {
  25: '#f6f8fb',
  50: '#f1f5f9',
  100: '#e2e8f0',
  200: '#cbd5f5',
  300: '#94a3b8',
  400: '#64748b',
  500: '#475569',
  600: '#334155',
}

export default defineConfig({
  presets: [presetUno()],
  theme: {
    colors: {
      primary: '#2563eb',
      primaryMuted: '#3b82f6',
      success: '#22c55e',
      warning: '#f97316',
      error: '#ef4444',
      surface,
      neutral,
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
    // layout containers
    panel:
      'bg-surface/90 backdrop-blur-md border border-neutral-100 rounded-none shadow-panel overflow-hidden',
    'panel-muted':
      'bg-surface-muted/95 backdrop-blur border border-neutral-100 rounded-none shadow-card',
    // Navigation and cards
    'nav-link':
      'flex flex-col justify-center items-stretch gap-0.5 p-1 px-2 rounded-none bg-neutral-50 font-semibold text-neutral-500 transition cursor-pointer select-none hover:bg-neutral-100 hover:text-neutral-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary text-sm lg:text-sm no-underline',
    'card-item':
      'rounded-none bg-surface border border-neutral-50 shadow-card hover:shadow-panel transition cursor-pointer focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
    'progress-bar':
      'h-full bg-gradient-to-r from-cyan-400 to-primary transition-all shadow-inner shadow-primary/20',
    // Buttons & interactive shortcuts
    btn: 'px-2 py-1 rounded-md text-sm font-semibold transition inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-40 disabled:cursor-not-allowed',
    'btn-primary': 'btn bg-primary text-white hover:bg-primary/90 border border-transparent shadow-sm',
    'btn-secondary':
      'btn bg-surface text-neutral-600 border border-neutral-100 hover:bg-neutral-50 shadow-card',
    'btn-ghost':
      'btn bg-transparent text-neutral-500 border border-transparent hover:bg-neutral-50 hover:text-neutral-700 px-2 py-1',
    'btn-destructive':
      'btn bg-error/10 text-error border border-error/30 hover:bg-error/20 hover:text-error',
    // Utility
    badge:
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-neutral-50 text-neutral-500',
    // Compact helpers and divider
    'compact-base': 'text-sm leading-tight',
    // Modal compact: smaller gaps and tighter line-height for modals' content
    // Historically we had `modal-compact`/`nav-link-compact`; with compact being the default, we no longer keep specialized variants.
    divider: 'border-b border-neutral-100 last:border-b-0',
  },
})
