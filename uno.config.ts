import { defineConfig, presetUno } from 'unocss'

export default defineConfig({
  presets: [presetUno()],
  theme: {
    colors: {
      primary: '#2563eb',
      success: '#22c55e',
      error: '#ef4444',
    },
  },
  shortcuts: {
    // 通用
    panel: 'bg-white/78 backdrop-blur-md border border-gray-300 rounded shadow-lg overflow-hidden',
    'nav-link':
      'flex flex-col justify-center items-stretch gap-0.5 p-2 px-2.5 rounded-md bg-slate-100/70 font-semibold text-gray-700 transition cursor-pointer select-none hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary no-underline',
    'card-item':
      'rounded bg-white border border-gray-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
    'progress-bar': 'h-full bg-gradient-to-r from-cyan-400 to-primary transition-all',
    // Buttons & interactive shortcuts
    btn: 'px-4 py-2 rounded-md font-semibold transition inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-40',
    'btn-primary': 'btn bg-primary text-white hover:bg-primary/90 border-none shadow-sm',
    // Make `btn-secondary` a full button variant so consumers can use it standalone
    'btn-secondary': 'btn bg-gray-100 text-gray-900 border border-gray-300 hover:bg-gray-200',
    // Ghost / transparent minimal button (icon-only close buttons etc.)
    'btn-ghost': 'btn bg-transparent border-none p-0 hover:opacity-70 leading-none',
    // `interactive` removed — prefer `btn` or `card-item` for interactive elements
  },
})
