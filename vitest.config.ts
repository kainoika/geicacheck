import { defineConfig } from 'vitest/config'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['test/setup.ts']
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
      '~': resolve(__dirname, '.'),
      '#app': resolve(__dirname, 'test/mocks/nuxt.ts'),
      '#imports': resolve(__dirname, 'test/mocks/imports.ts')
    }
  }
})