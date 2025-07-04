// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: { enabled: true },

  // TypeScript設定
  typescript: {
    strict: false,
    typeCheck: false,
  },

  // モジュール
  modules: ["@nuxtjs/tailwindcss", "@vite-pwa/nuxt"],

  // プラグイン
  plugins: [
    "~/plugins/firebase.client.ts",
    "~/plugins/events.client.ts",
    "~/plugins/logger.client.ts",
    "~/plugins/pwa-head.client.ts",
    "~/plugins/pwa.client.ts"
  ],

  // CSS設定
  css: ["~/assets/css/main.css"],

  // コンポーネント設定
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    }
  ],

  // アプリ設定
  app: {
    head: {
      title: "geica check! - アイカツ！同人イベントサークルチェックアプリ",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content:
            "アイカツ！シリーズオンリー同人イベント「芸能人はカードが命！（芸カ）」のサークルチェックを効率化するWebアプリ",
        },
        { name: "theme-color", content: "#FF69B4" },
        {
          'http-equiv': 'Content-Security-Policy',
          content: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' https://apis.google.com https://www.gstatic.com https://*.firebaseapp.com https://*.googleapis.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data: https: blob:",
            "connect-src 'self' https://*.googleapis.com https://*.firebaseapp.com wss://*.firebaseio.com https://firestore.googleapis.com https://securetoken.googleapis.com",
            "frame-src 'none'",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'"
          ].join('; ')
        }
      ],
      link: [
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
        { rel: "apple-touch-icon", sizes: "180x180", href: "/pwa-192x192.png" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700&display=swap",
        },
      ],
    },
  baseURL: '/'
  },

  // ランタイム設定
  runtimeConfig: {
    public: {
      firebaseApiKey: process.env.NUXT_PUBLIC_FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.NUXT_PUBLIC_FIREBASE_APP_ID,
      useFirebaseEmulator: process.env.NUXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true',
      // ログレベル設定
      logLevel: process.env.NUXT_PUBLIC_LOG_LEVEL || (process.env.NODE_ENV === 'development' ? 'debug' : 'error'),
    },
  },

  // ビルド設定
  ssr: false, // SPAモード

  // Vite設定
  vite: {
    optimizeDeps: {
      include: ['estree-walker']
    },
    define: {
      global: 'globalThis'
    }
  },

  // PWA設定
  pwa: {
    registerType: 'autoUpdate',
    strategies: 'generateSW',
    injectRegister: 'auto',
    manifest: {
      name: 'geica check! - アイカツ！同人イベントサークルチェックアプリ',
      short_name: 'geica check!',
      description: 'アイカツ！シリーズオンリー同人イベント「芸能人はカードが命！（芸カ）」のサークルチェックを効率化するWebアプリ',
      theme_color: '#FF69B4',
      background_color: '#f8f9fa',
      display: 'standalone',
      orientation: 'portrait-primary',
      scope: '/',
      start_url: '/',
      lang: 'ja',
      categories: ['entertainment', 'lifestyle'],
      icons: [
        {
          src: 'pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable'
        }
      ],
      shortcuts: [
        {
          name: 'ブックマーク',
          short_name: 'ブックマーク',
          description: '保存したサークルをチェック',
          url: '/bookmarks',
          icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
        },
        {
          name: '会場マップ',
          short_name: 'マップ',
          description: 'イベント会場マップを表示',
          url: '/map',
          icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
        }
      ]
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      cleanupOutdatedCaches: true,
      clientsClaim: true,
      skipWaiting: true,
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/.*\.firebaseapp\.com\/.*/i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'firebase-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 7 // 1週間
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        },
        {
          urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'firestore-cache',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 10 // 10分
            }
          }
        },
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'google-fonts-stylesheets'
          }
        },
        {
          urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-webfonts',
            expiration: {
              maxEntries: 30,
              maxAgeSeconds: 60 * 60 * 24 * 365 // 1年
            }
          }
        }
      ]
    },
    devOptions: {
      enabled: true,
      suppressWarnings: true,
      navigateFallback: '/',
      navigateFallbackAllowlist: [/^\/$/],
      type: 'module'
    }
  },

  // Nitro設定
  nitro: {
    esbuild: {
      options: {
        target: 'esnext'
      }
    },
    prerender: {
      routes: ['/']
    }
  }
});
