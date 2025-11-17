import { fileURLToPath } from 'node:url'

import { defineConfig, mergeConfig } from 'vitest/config'

import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./test/setup.ts'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'lcov', 'html'],
        exclude: [
          'node_modules/**',
          'test/**',
          '**/*.spec.ts',
          '**/*.test.ts',
          '**/types.ts',
          'src/main.ts',
          'vite.config.ts',
          'vitest.config.ts',
          'uno.config.ts',
          'eslint.config.ts',
        ],
      },
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }),
)
