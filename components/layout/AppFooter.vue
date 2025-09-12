<template>
    <footer class="bg-white border-t border-gray-200 mt-auto">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
                <!-- アプリ情報 -->
                <div class="col-span-1 md:col-span-2">
                    <div class="flex items-center space-x-2 mb-4">
                        <h3 class="text-lg font-bold text-pink-500">
                            geica check!
                        </h3>
                    </div>
                    <p class="text-gray-600 text-sm mb-4">
                        アイカツ！シリーズオンリーイベント「芸能人はカードが命！」のサークルチェックを効率化するWebアプリです。
                    </p>
                </div>

                <!-- 主要機能 -->
                <div>
                    <h4 class="text-sm font-semibold text-gray-900 mb-4">主要機能</h4>
                    <ul class="space-y-2">
                        <li>
                            <NuxtLink to="/" class="flex items-center text-sm text-gray-600 hover:text-pink-600 transition-colors">
                                <HomeIcon class="h-4 w-4 mr-2" />
                                ホーム
                            </NuxtLink>
                        </li>
                        <li>
                            <NuxtLink to="/circles" class="flex items-center text-sm text-gray-600 hover:text-pink-600 transition-colors">
                                <BookOpenIcon class="h-4 w-4 mr-2" />
                                サークル一覧
                            </NuxtLink>
                        </li>
                        <li>
                            <NuxtLink to="/map" class="flex items-center text-sm text-gray-600 hover:text-pink-600 transition-colors">
                                <MapIcon class="h-4 w-4 mr-2" />
                                マップ
                            </NuxtLink>
                        </li>
                        <li>
                            <NuxtLink to="/bookmarks"
                                class="flex items-center text-sm text-gray-600 hover:text-pink-600 transition-colors">
                                <StarIcon class="h-4 w-4 mr-2" />
                                ブックマーク
                            </NuxtLink>
                        </li>
                    </ul>
                </div>

                <!-- ユーザー・その他 -->
                <div>
                    <h4 class="text-sm font-semibold text-gray-900 mb-4">ユーザー・その他</h4>
                    <ul class="space-y-2">
                        <li>
                            <NuxtLink to="/auth/login" class="flex items-center text-sm text-gray-600 hover:text-pink-600 transition-colors">
                                <LockClosedIcon class="h-4 w-4 mr-2" />
                                ログイン
                            </NuxtLink>
                        </li>
                        <li>
                            <NuxtLink to="/profile" class="flex items-center text-sm text-gray-600 hover:text-pink-600 transition-colors">
                                <UserIcon class="h-4 w-4 mr-2" />
                                プロフィール
                            </NuxtLink>
                        </li>
                        <li>
                            <NuxtLink to="/about"
                                class="flex items-center text-sm text-gray-600 hover:text-pink-600 transition-colors">
                                <InformationCircleIcon class="h-4 w-4 mr-2" />
                                このアプリについて
                            </NuxtLink>
                        </li>
                        <li>
                            <NuxtLink to="/terms"
                                class="flex items-center text-sm text-gray-600 hover:text-pink-600 transition-colors">
                                <DocumentTextIcon class="h-4 w-4 mr-2" />
                                利用規約
                            </NuxtLink>
                        </li>
                        <li>
                            <NuxtLink to="/privacy"
                                class="flex items-center text-sm text-gray-600 hover:text-pink-600 transition-colors">
                                <ShieldCheckIcon class="h-4 w-4 mr-2" />
                                プライバシーポリシー
                            </NuxtLink>
                        </li>
                    </ul>
                </div>
            </div>

            <!-- 区切り線 -->
            <div class="border-t border-gray-200 mt-8 pt-6">
                <div class="flex flex-col md:flex-row justify-between items-center">
                    <!-- コピーライト -->
                    <div class="text-sm text-gray-500 mb-4 md:mb-0">
                        © {{ currentYear }} geica check! All rights reserved.
                    </div>

                    <!-- ソーシャルリンク -->
                    <div class="flex space-x-4">
                        <a href="https://twitter.com/your-account" target="_blank" rel="noopener noreferrer"
                            class="text-gray-400 hover:text-pink-600 transition-colors" aria-label="Twitter">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path
                                    d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
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
import {
    StarIcon,
    HomeIcon,
    BookOpenIcon,
    MapIcon,
    LockClosedIcon,
    UserIcon,
    PencilIcon,
    WrenchScrewdriverIcon,
    InformationCircleIcon,
    ComputerDesktopIcon,
    DocumentTextIcon,
    ShieldCheckIcon
} from '@heroicons/vue/24/outline'

// 現在の年を取得
const currentYear = new Date().getFullYear()
</script>