<template>
    <footer class="bg-white border-t border-gray-200 mt-auto">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
                <!-- アプリ情報 -->
                <div class="col-span-1 md:col-span-2">
                    <div class="flex items-center space-x-2 mb-4">
                        <div class="text-2xl">✨</div>
                        <h3 class="text-lg font-bold text-gradient-aikatsu">
                            geika check!
                        </h3>
                    </div>
                    <p class="text-gray-600 text-sm mb-4">
                        アイカツ！シリーズオンリー同人イベント「芸能人はカードが命！（芸カ）」のサークルチェックを効率化するWebアプリです。
                    </p>
                    <p class="text-gray-500 text-xs">
                        アイカツ！の楽曲「fashion check!」をモチーフとしたアプリケーション
                    </p>
                </div>

                <!-- 主要機能 -->
                <div>
                    <h4 class="text-sm font-semibold text-gray-900 mb-4">主要機能</h4>
                    <ul class="space-y-2">
                        <li>
                            <NuxtLink to="/" class="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                                📖 ホーム
                            </NuxtLink>
                        </li>
                        <li>
                            <NuxtLink to="/circles" class="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                                📖 サークル一覧
                            </NuxtLink>
                        </li>
                        <li>
                            <NuxtLink to="/map" class="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                                🗺️ マップ
                            </NuxtLink>
                        </li>
                        <li>
                            <NuxtLink to="/bookmarks"
                                class="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                                ⭐ ブックマーク
                            </NuxtLink>
                        </li>
                    </ul>
                </div>

                <!-- ユーザー・その他 -->
                <div>
                    <h4 class="text-sm font-semibold text-gray-900 mb-4">ユーザー・その他</h4>
                    <ul class="space-y-2">
                        <li>
                            <NuxtLink to="/auth/login" class="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                                🔐 ログイン
                            </NuxtLink>
                        </li>
                        <li>
                            <NuxtLink to="/profile" class="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                                👤 プロフィール
                            </NuxtLink>
                        </li>
                        <li>
                            <NuxtLink to="/edit-permission/apply"
                                class="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                                ✏️ 編集権限申請
                            </NuxtLink>
                        </li>
                        <li>
                            <NuxtLink to="/admin/edit-requests"
                                class="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                                🛠️ 管理者ダッシュボード
                            </NuxtLink>
                        </li>
                        <li>
                            <NuxtLink to="/about"
                                class="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                                ℹ️ このアプリについて
                            </NuxtLink>
                        </li>
                        <li>
                            <a href="https://github.com/geika-check/geika-check" target="_blank" rel="noopener noreferrer"
                                class="text-sm text-gray-600 hover:text-primary-600 transition-colors inline-flex items-center">
                                💻 GitHub
                                <svg class="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd"
                                        d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z"
                                        clip-rule="evenodd" />
                                    <path fill-rule="evenodd"
                                        d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z"
                                        clip-rule="evenodd" />
                                </svg>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

            <!-- 区切り線 -->
            <div class="border-t border-gray-200 mt-8 pt-6">
                <div class="flex flex-col md:flex-row justify-between items-center">
                    <!-- コピーライト -->
                    <div class="text-sm text-gray-500 mb-4 md:mb-0">
                        © {{ currentYear }} geika check! All rights reserved.
                    </div>

                    <!-- ソーシャルリンク -->
                    <div class="flex space-x-4">
                        <a href="https://twitter.com/your-account" target="_blank" rel="noopener noreferrer"
                            class="text-gray-400 hover:text-primary-600 transition-colors" aria-label="Twitter">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path
                                    d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                            </svg>
                        </a>

                        <a href="https://github.com/your-repo/geika-check" target="_blank" rel="noopener noreferrer"
                            class="text-gray-400 hover:text-primary-600 transition-colors" aria-label="GitHub">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path
                                    d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                        </a>
                    </div>
                </div>

                <!-- 免責事項 -->
                <div class="mt-4 text-xs text-gray-400 text-center">
                    <p>
                        このアプリは非公式のファンメイドアプリです。アイカツ！シリーズとは直接の関係はありません。<br>
                        アイカツ！は株式会社バンダイの登録商標です。
                    </p>
                </div>
            </div>
        </div>
    </footer>
</template>

<script setup lang="ts">
// 現在の年を取得
const currentYear = new Date().getFullYear()
</script>