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
                        <a href="https://twitter.com/geica_check" target="_blank" rel="noopener noreferrer"
                            class="text-gray-400 hover:text-pink-600 transition-colors" aria-label="Twitter">
                            <svg class="w-5 h-5" viewBox="0 0 1200 1227" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z" fill="gray"/>
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