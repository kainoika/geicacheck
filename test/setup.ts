/**
 * Vitest セットアップファイル
 * テスト環境の初期化とグローバルモックの設定
 */
import { vi } from 'vitest'

// Vue 3のreactivity APIのグローバルインポート
global.ref = vi.fn((value) => ({ value }))
global.reactive = vi.fn((obj) => obj)
global.computed = vi.fn((fn) => ({ value: fn() }))
global.watch = vi.fn()
global.watchEffect = vi.fn()
global.onMounted = vi.fn()
global.onUnmounted = vi.fn()
global.nextTick = vi.fn()

// Nuxt固有のcomposablesのモック
global.useState = vi.fn((key, defaultValue) => ({
  value: defaultValue?.() || null
}))

global.useHead = vi.fn()
global.useCookie = vi.fn()
global.useRoute = vi.fn(() => ({
  params: {},
  query: {},
  path: '/'
}))

global.useRouter = vi.fn(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn()
}))

global.navigateTo = vi.fn()

// Firebase関連のモック
global.useNuxtApp = vi.fn(() => ({
  $firestore: {},
  $auth: {},
  $storage: {}
}))

// DOM操作関連のモック
Object.defineProperty(window, 'alert', {
  value: vi.fn()
})

Object.defineProperty(window, 'prompt', {
  value: vi.fn()
})

Object.defineProperty(window, 'confirm', {
  value: vi.fn()
})

// URL.createObjectURLのモック（CSVエクスポート用）
Object.defineProperty(window.URL, 'createObjectURL', {
  value: vi.fn(() => 'mocked-url')
})

Object.defineProperty(window.URL, 'revokeObjectURL', {
  value: vi.fn()
})

// LocalStorageのモック
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// console.logをスパイして出力を制御
vi.spyOn(console, 'log').mockImplementation(() => {})
vi.spyOn(console, 'error').mockImplementation(() => {})
vi.spyOn(console, 'warn').mockImplementation(() => {})