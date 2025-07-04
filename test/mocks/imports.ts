/**
 * Vue Composition APIのモック
 */
import { vi } from 'vitest'

export const ref = vi.fn((value) => ({ value }))
export const reactive = vi.fn((obj) => obj)
export const computed = vi.fn((fn) => ({ value: fn() }))
export const watch = vi.fn()
export const watchEffect = vi.fn()
export const onMounted = vi.fn()
export const onUnmounted = vi.fn()
export const nextTick = vi.fn()

// Composables のモック
export const useAuth = vi.fn(() => ({
  user: { value: { uid: 'test-user-123' } },
  signIn: vi.fn(),
  signOut: vi.fn()
}))

export const useLogger = vi.fn(() => ({
  info: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn(),
  error: vi.fn()
}))

export default {
  ref,
  reactive,
  computed,
  watch,
  watchEffect,
  onMounted,
  onUnmounted,
  nextTick,
  useAuth,
  useLogger
}