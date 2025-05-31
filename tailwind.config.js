/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],
  theme: {
    extend: {
      colors: {
        // アイカツ！テーマカラー
        primary: {
          50: "#fef7ff",
          100: "#feeeff",
          200: "#fddeff",
          300: "#fcbfff",
          400: "#f990ff",
          500: "#ff69b4", // メインピンク
          600: "#e91e63", // 濃いピンク
          700: "#c2185b",
          800: "#ad1457",
          900: "#880e4f",
        },
        secondary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#87ceeb", // スカイブルー
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
        accent: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#ffd700", // ゴールド
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },
        success: "#4caf50",
        warning: "#ff9800",
        error: "#f44336",
      },
      fontFamily: {
        sans: [
          "Noto Sans JP",
          "Hiragino Kaku Gothic ProN",
          "ヒラギノ角ゴ ProN W3",
          "Meiryo",
          "メイリオ",
          "Osaka",
          "MS PGothic",
          "arial",
          "helvetica",
          "sans-serif",
        ],
      },
      animation: {
        "bounce-slow": "bounce 2s infinite",
        "pulse-slow": "pulse 3s infinite",
        sparkle: "sparkle 1.5s ease-in-out infinite",
      },
      keyframes: {
        sparkle: {
          "0%, 100%": { opacity: 1, transform: "scale(1)" },
          "50%": { opacity: 0.5, transform: "scale(1.1)" },
        },
      },
      boxShadow: {
        glow: "0 0 20px rgba(255, 105, 180, 0.3)",
        "glow-lg": "0 0 30px rgba(255, 105, 180, 0.4)",
      },
    },
  },
  plugins: [],
};
