<template>
    <header class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <!-- ロゴ・タイトル -->
                <div class="flex items-center">
                    <NuxtLink to="/" class="flex items-center space-x-2">
                        <div class="text-2xl">✨</div>
                        <h1 class="text-xl font-bold text-gradient-aikatsu">
                            geika check!
                        </h1>
                    </NuxtLink>
                </div>

                <!-- デスクトップナビゲーション -->
                <nav class="hidden md:flex items-center space-x-6">
                    <NuxtLink to="/circles"
                        class="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        :class="{ 'text-primary-600 bg-primary-50': $route.path === '/circles' }">
                        サークル一覧
                    </NuxtLink>
                    <NuxtLink to="/map"
                        class="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        :class="{ 'text-primary-600 bg-primary-50': $route.path === '/map' }">
                        マップ
                    </NuxtLink>
                    <NuxtLink to="/bookmarks"
                        class="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        :class="{ 'text-primary-600 bg-primary-50': $route.path === '/bookmarks' }">
                        ブックマーク
                        <span v-if="bookmarkCount > 0" class="ml-1 badge badge-primary">
                            {{ bookmarkCount }}
                        </span>
                    </NuxtLink>
                </nav>

                <!-- ユーザーメニュー -->
                <div class="flex items-center space-x-4">
                    <!-- 検索ボタン（モバイル） -->
                    <button @click="toggleSearch"
                        class="md:hidden p-2 text-gray-400 hover:text-gray-500 transition-colors">
                        <MagnifyingGlassIcon class="h-5 w-5" />
                    </button>

                    <!-- ログイン状態 -->
                    <div v-if="isAuthenticated" class="relative">
                        <button @click="toggleUserMenu"
                            class="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 transition-colors">
                            <img v-if="user?.photoURL" :src="user.photoURL" :alt="user.displayName"
                                class="h-8 w-8 rounded-full">
                            <div v-else class="h-8 w-8 bg-primary-500 rounded-full flex items-center justify-center">
                                <span class="text-white text-sm font-medium">
                                    {{ user?.displayName?.charAt(0) || '?' }}
                                </span>
                            </div>
                            <ChevronDownIcon class="h-4 w-4 text-gray-400" />
                        </button>

                        <!-- ユーザードロップダウンメニュー -->
                        <Transition enter-active-class="transition ease-out duration-100"
                            enter-from-class="transform opacity-0 scale-95"
                            enter-to-class="transform opacity-100 scale-100"
                            leave-active-class="transition ease-in duration-75"
                            leave-from-class="transform opacity-100 scale-100"
                            leave-to-class="transform opacity-0 scale-95">
                            <div v-if="showUserMenu"
                                class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                                @click.away="showUserMenu = false">
                                <div class="py-1">
                                    <NuxtLink to="/profile"
                                        class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        @click="showUserMenu = false">
                                        👤 プロフィール
                                    </NuxtLink>
                                    <NuxtLink to="/edit-permission/apply"
                                        class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        @click="showUserMenu = false">
                                        ✏️ 編集権限申請
                                    </NuxtLink>
                                    <NuxtLink to="/admin/edit-requests"
                                        class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        @click="showUserMenu = false">
                                        🛠️ 管理者ダッシュボード
                                    </NuxtLink>
                                    <NuxtLink to="/about"
                                        class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        @click="showUserMenu = false">
                                        ℹ️ アプリについて
                                    </NuxtLink>
                                    <hr class="my-1">
                                    <button @click="handleSignOut"
                                        class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        ログアウト
                                    </button>
                                </div>
                            </div>
                        </Transition>
                    </div>

                    <!-- ログインボタン -->
                    <button v-else @click="handleSignIn" class="btn-primary">
                        <svg class="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                            <path
                                d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                        </svg>
                        Twitterでログイン
                    </button>

                    <!-- モバイルメニューボタン -->
                    <button @click="toggleMobileMenu"
                        class="md:hidden p-2 text-gray-400 hover:text-gray-500 transition-colors">
                        <Bars3Icon v-if="!showMobileMenu" class="h-6 w-6" />
                        <XMarkIcon v-else class="h-6 w-6" />
                    </button>
                </div>
            </div>

            <!-- モバイル検索バー -->
            <Transition enter-active-class="transition ease-out duration-200"
                enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0"
                leave-active-class="transition ease-in duration-150" leave-from-class="opacity-100 translate-y-0"
                leave-to-class="opacity-0 -translate-y-2">
                <div v-if="showSearch" class="md:hidden pb-4">
                    <div class="relative">
                        <input v-model="searchQuery" type="text" placeholder="サークル名、タグで検索..." class="input pl-10"
                            @keyup.enter="handleSearch">
                        <MagnifyingGlassIcon
                            class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                </div>
            </Transition>
        </div>

        <!-- モバイルナビゲーション -->
        <Transition enter-active-class="transition ease-out duration-200" enter-from-class="opacity-0 -translate-y-2"
            enter-to-class="opacity-100 translate-y-0" leave-active-class="transition ease-in duration-150"
            leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-2">
            <div v-if="showMobileMenu" class="md:hidden border-t border-gray-200 bg-white">
                <div class="px-2 pt-2 pb-3 space-y-1">
                    <!-- 主要機能 -->
                    <div class="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        主要機能
                    </div>
                    <NuxtLink to="/circles"
                        class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                        :class="{ 'text-primary-600 bg-primary-50': $route.path === '/circles' }"
                        @click="showMobileMenu = false">
                        📖 サークル一覧
                    </NuxtLink>
                    <NuxtLink to="/map"
                        class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                        :class="{ 'text-primary-600 bg-primary-50': $route.path === '/map' }"
                        @click="showMobileMenu = false">
                        🗺️ マップ
                    </NuxtLink>
                    <NuxtLink to="/bookmarks"
                        class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                        :class="{ 'text-primary-600 bg-primary-50': $route.path === '/bookmarks' }"
                        @click="showMobileMenu = false">
                        ⭐ ブックマーク
                        <span v-if="bookmarkCount > 0" class="ml-2 badge badge-primary">
                            {{ bookmarkCount }}
                        </span>
                    </NuxtLink>
                    
                    <!-- ユーザー機能 -->
                    <div class="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-4">
                        ユーザー機能
                    </div>
                    <NuxtLink v-if="!isAuthenticated" to="/auth/login"
                        class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                        :class="{ 'text-primary-600 bg-primary-50': $route.path === '/auth/login' }"
                        @click="showMobileMenu = false">
                        🔐 ログイン
                    </NuxtLink>
                    <NuxtLink v-if="isAuthenticated" to="/profile"
                        class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                        :class="{ 'text-primary-600 bg-primary-50': $route.path === '/profile' }"
                        @click="showMobileMenu = false">
                        👤 プロフィール
                    </NuxtLink>
                    <NuxtLink to="/edit-permission/apply"
                        class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                        :class="{ 'text-primary-600 bg-primary-50': $route.path === '/edit-permission/apply' }"
                        @click="showMobileMenu = false">
                        ✏️ 編集権限申請
                    </NuxtLink>
                    
                    <!-- その他 -->
                    <div class="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-4">
                        その他
                    </div>
                    <NuxtLink to="/about"
                        class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                        :class="{ 'text-primary-600 bg-primary-50': $route.path === '/about' }"
                        @click="showMobileMenu = false">
                        ℹ️ アプリについて
                    </NuxtLink>
                    
                    <!-- ログアウト -->
                    <div v-if="isAuthenticated" class="border-t border-gray-200 mt-4 pt-4">
                        <button @click="handleSignOut"
                            class="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50">
                            🚪 ログアウト
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </header>
</template>

<script setup lang="ts">
import {
    MagnifyingGlassIcon,
    Bars3Icon,
    XMarkIcon,
    ChevronDownIcon
} from '@heroicons/vue/24/outline'

// Composables
const { user, isAuthenticated, signOut } = useAuth()
const { bookmarkCount } = useBookmarks()
const router = useRouter()

// State
const showMobileMenu = ref(false)
const showUserMenu = ref(false)
const showSearch = ref(false)
const searchQuery = ref('')

// Methods
const toggleMobileMenu = () => {
    showMobileMenu.value = !showMobileMenu.value
    if (showMobileMenu.value) {
        showSearch.value = false
    }
}

const toggleUserMenu = () => {
    showUserMenu.value = !showUserMenu.value
}

const toggleSearch = () => {
    showSearch.value = !showSearch.value
    if (showSearch.value) {
        showMobileMenu.value = false
    }
}

const handleSignIn = async () => {
    try {
        await navigateTo('/auth/login')
    } catch (error) {
        console.error('Sign in navigation error:', error)
    }
}

const handleSignOut = async () => {
    try {
        await signOut()
        showUserMenu.value = false
        await navigateTo('/')
    } catch (error) {
        console.error('Sign out error:', error)
    }
}

const handleSearch = () => {
    if (searchQuery.value.trim()) {
        router.push({
            path: '/search',
            query: { q: searchQuery.value.trim() }
        })
        showSearch.value = false
    }
}

// Close menus when route changes
watch(() => router.currentRoute.value.path, () => {
    showMobileMenu.value = false
    showUserMenu.value = false
    showSearch.value = false
})

// Close menus on outside click
onMounted(() => {
    document.addEventListener('click', (event) => {
        const target = event.target as Element
        if (!target.closest('.relative')) {
            showUserMenu.value = false
        }
    })
})
</script>