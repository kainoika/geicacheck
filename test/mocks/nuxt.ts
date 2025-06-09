/**
 * Nuxt関連のモック
 */
import { vi } from 'vitest'

export const useNuxtApp = vi.fn(() => ({
  $firestore: {},
  $auth: {},
  $storage: {}
}))

export const navigateTo = vi.fn()
export const useState = vi.fn((key, defaultValue) => ({
  value: defaultValue?.() || null
}))
export const useHead = vi.fn()
export const useCookie = vi.fn()
export const useRoute = vi.fn(() => ({
  params: {},
  query: {},
  path: '/'
}))
export const useRouter = vi.fn(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn()
}))

export default {
  useNuxtApp,
  navigateTo,
  useState,
  useHead,
  useCookie,
  useRoute,
  useRouter
}