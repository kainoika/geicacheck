<template>
    <header class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <!-- ロゴ・タイトル -->
                <div class="flex items-center space-x-4">
                    <NuxtLink :to="isAuthenticated ? '/circles' : '/'" class="flex items-center space-x-2">
                            <h1 class="text-xl font-bold text-pink-500">
                                geica check!
                            </h1>
                    </NuxtLink>
                    
                    <!-- イベント選択ドロップダウン -->
                    <div class="relative hidden md:block">
                        <button @click="toggleEventMenu"
                            class="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
                            <span>{{ currentEvent?.shortName || 'イベント選択' }}</span>
                            <ChevronDownIcon class="h-4 w-4" />
                        </button>
                        
                        <!-- イベントドロップダウンメニュー -->
                        <Transition enter-active-class="transition ease-out duration-100"
                            enter-from-class="transform opacity-0 scale-95"
                            enter-to-class="transform opacity-100 scale-100"
                            leave-active-class="transition ease-in duration-75"
                            leave-from-class="transform opacity-100 scale-100"
                            leave-to-class="transform opacity-0 scale-95">
                            <div v-if="showEventMenu"
                                class="absolute left-0 mt-2 w-64 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                                @click.away="showEventMenu = false">
                                <div class="py-1">
                                    <!-- アクティブイベント -->
                                    <div v-if="activeEvents.length > 0">
                                        <div class="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            開催中
                                        </div>
                                        <button v-for="event in activeEvents" :key="event.id"
                                            @click="selectEvent(event.id)"
                                            class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                            :class="{ 'bg-pink-50 text-pink-600': currentEvent?.id === event.id }">
                                            <div class="font-medium">{{ event.shortName }}</div>
                                            <div class="text-xs text-gray-500">{{ formatEventDate(event.eventDate) }}</div>
                                        </button>
                                    </div>
                                    
                                    <!-- 今後のイベント -->
                                    <div v-if="upcomingEvents.length > 0">
                                        <div class="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-t border-gray-100 mt-1">
                                            今後
                                        </div>
                                        <button v-for="event in upcomingEvents" :key="event.id"
                                            @click="selectEvent(event.id)"
                                            class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                            :class="{ 'bg-pink-50 text-pink-600': currentEvent?.id === event.id }">
                                            <div class="font-medium">{{ event.shortName }}</div>
                                            <div class="text-xs text-gray-500">{{ formatEventDate(event.eventDate) }}</div>
                                        </button>
                                    </div>
                                    
                                    <!-- 過去のイベント -->
                                    <div v-if="completedEvents.length > 0">
                                        <div class="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-t border-gray-100 mt-1">
                                            過去
                                        </div>
                                        <button v-for="event in completedEvents.slice(0, 3)" :key="event.id"
                                            @click="selectEvent(event.id)"
                                            class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                            :class="{ 'bg-pink-50 text-pink-600': currentEvent?.id === event.id }">
                                            <div class="font-medium">{{ event.shortName }}</div>
                                            <div class="text-xs text-gray-500">{{ formatEventDate(event.eventDate) }}</div>
                                        </button>
                                        
                                        <!-- 全イベント一覧へのリンク -->
                                        <NuxtLink to="/events"
                                            class="block px-4 py-2 text-sm text-pink-600 hover:bg-gray-100"
                                            @click="showEventMenu = false">
                                            すべてのイベントを見る →
                                        </NuxtLink>
                                    </div>
                                </div>
                            </div>
                        </Transition>
                    </div>
                </div>

                <!-- デスクトップナビゲーション -->
                <nav class="hidden md:flex items-center space-x-6">
                    <NuxtLink to="/circles"
                        class="text-gray-700 hover:text-pink-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        :class="{ 'text-pink-600 bg-pink-50': $route.path === '/circles' }">
                        サークル一覧
                    </NuxtLink>
                    <NuxtLink to="/map"
                        class="text-gray-700 hover:text-pink-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        :class="{ 'text-pink-600 bg-pink-50': $route.path === '/map' }">
                        マップ
                    </NuxtLink>
                    <NuxtLink to="/bookmarks"
                        class="text-gray-700 hover:text-pink-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        :class="{ 'text-pink-600 bg-pink-50': $route.path === '/bookmarks' }">
                        ブックマーク
                        <span v-if="bookmarkCount > 0" class="ml-1 bg-pink-500 text-white px-2 py-1 rounded-full text-xs">
                            {{ bookmarkCount }}
                        </span>
                    </NuxtLink>
                </nav>

                <!-- ユーザーメニュー -->
                <div class="flex items-center space-x-4">
                    <!-- ログイン状態 -->
                    <div v-if="isAuthenticated" class="relative">
                        <button @click="toggleUserMenu"
                            class="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 transition-colors">
                            <img v-if="user?.photoURL" :src="user.photoURL" :alt="user.displayName"
                                class="h-8 w-8 rounded-full">
                            <div v-else class="h-8 w-8 bg-pink-500 rounded-full flex items-center justify-center">
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
                                        class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        @click="showUserMenu = false">
                                        <UserIcon class="h-4 w-4 mr-2" />
                                        プロフィール
                                    </NuxtLink>
                                    <NuxtLink v-if="isAdmin" to="/admin/edit-requests"
                                        class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        @click="showUserMenu = false">
                                        <WrenchScrewdriverIcon class="h-4 w-4 mr-2" />
                                        管理者ダッシュボード
                                    </NuxtLink>
                                    <NuxtLink to="/about"
                                        class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        @click="showUserMenu = false">
                                        <InformationCircleIcon class="h-4 w-4 mr-2" />
                                        アプリについて
                                    </NuxtLink>
                                    
                                    <!-- PWAインストール項目 -->
                                    <PWAInstallMenuItem @install="showUserMenu = false" />
                                    
                                    <hr class="my-1">
                                    <button @click="handleSignOut"
                                        class="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        <ArrowRightOnRectangleIcon class="h-4 w-4 mr-2" />
                                        ログアウト
                                    </button>
                                </div>
                            </div>
                        </Transition>
                    </div>

                    <!-- ログインボタン -->
                    <button v-else @click="handleSignIn" class="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center">
                        <svg class="w-4 h-4 mr-2" viewBox="0 0 1200 1227" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z" fill="white"/>
                        </svg>
                        Xでログイン
                    </button>

                    <!-- モバイルメニューボタン -->
                    <button @click="toggleMobileMenu"
                        class="md:hidden p-2 text-gray-400 hover:text-gray-500 transition-colors">
                        <Bars3Icon v-if="!showMobileMenu" class="h-6 w-6" />
                        <XMarkIcon v-else class="h-6 w-6" />
                    </button>
                </div>
            </div>

        </div>

        <!-- モバイルナビゲーション -->
        <Transition enter-active-class="transition ease-out duration-200" enter-from-class="opacity-0 -translate-y-2"
            enter-to-class="opacity-100 translate-y-0" leave-active-class="transition ease-in duration-150"
            leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-2">
            <div v-if="showMobileMenu" class="md:hidden border-t border-gray-200 bg-white">
                <div class="px-2 pt-2 pb-3 space-y-1">
                    <!-- イベント選択 -->
                    <div class="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        イベント選択
                    </div>
                    <div class="px-3 py-2">
                        <button 
                            @click="toggleMobileEventMenu"
                            class="w-full flex items-center justify-between px-3 py-2 text-base font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                        >
                            <span>{{ currentEvent?.shortName || 'イベント選択' }}</span>
                            <ChevronDownIcon 
                                class="h-4 w-4 transition-transform duration-200" 
                                :class="{ 'rotate-180': showMobileEventMenu }"
                            />
                        </button>
                        
                        <!-- モバイル用イベントメニュー -->
                        <Transition 
                            enter-active-class="transition ease-out duration-100"
                            enter-from-class="transform opacity-0 scale-95"
                            enter-to-class="transform opacity-100 scale-100"
                            leave-active-class="transition ease-in duration-75"
                            leave-from-class="transform opacity-100 scale-100"
                            leave-to-class="transform opacity-0 scale-95"
                        >
                            <div v-if="showMobileEventMenu" class="mt-2 space-y-1">
                                <!-- アクティブイベント -->
                                <div v-if="activeEvents.length > 0">
                                    <div class="px-3 py-1 text-xs font-semibold text-gray-500">開催中</div>
                                    <button 
                                        v-for="event in activeEvents" 
                                        :key="event.id"
                                        @click="selectEventMobile(event.id)"
                                        class="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100"
                                        :class="{ 'bg-pink-50 text-pink-600': currentEvent?.id === event.id }"
                                    >
                                        <div class="font-medium">{{ event.shortName }}</div>
                                        <div class="text-xs text-gray-500">{{ formatEventDate(event.eventDate) }}</div>
                                    </button>
                                </div>
                                
                                <!-- 今後のイベント -->
                                <div v-if="upcomingEvents.length > 0">
                                    <div class="px-3 py-1 text-xs font-semibold text-gray-500">今後</div>
                                    <button 
                                        v-for="event in upcomingEvents" 
                                        :key="event.id"
                                        @click="selectEventMobile(event.id)"
                                        class="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100"
                                        :class="{ 'bg-pink-50 text-pink-600': currentEvent?.id === event.id }"
                                    >
                                        <div class="font-medium">{{ event.shortName }}</div>
                                        <div class="text-xs text-gray-500">{{ formatEventDate(event.eventDate) }}</div>
                                    </button>
                                </div>
                                
                                <!-- 過去のイベント -->
                                <div v-if="completedEvents.length > 0">
                                    <div class="px-3 py-1 text-xs font-semibold text-gray-500">過去</div>
                                    <button 
                                        v-for="event in completedEvents.slice(0, 3)" 
                                        :key="event.id"
                                        @click="selectEventMobile(event.id)"
                                        class="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100"
                                        :class="{ 'bg-pink-50 text-pink-600': currentEvent?.id === event.id }"
                                    >
                                        <div class="font-medium">{{ event.shortName }}</div>
                                        <div class="text-xs text-gray-500">{{ formatEventDate(event.eventDate) }}</div>
                                    </button>
                                    
                                    <!-- 全イベント一覧へのリンク -->
                                    <NuxtLink 
                                        to="/events"
                                        class="block px-3 py-2 text-sm text-pink-600 rounded-md hover:bg-gray-100"
                                        @click="showMobileMenu = false"
                                    >
                                        すべてのイベントを見る →
                                    </NuxtLink>
                                </div>
                            </div>
                        </Transition>
                    </div>
                    
                    <!-- 主要機能 -->
                    <div class="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-4">
                        主要機能
                    </div>
                    <NuxtLink to="/circles"
                        class="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-pink-600 hover:bg-gray-50"
                        :class="{ 'text-pink-600 bg-pink-50': $route.path === '/circles' }"
                        @click="showMobileMenu = false">
                        <BookOpenIcon class="h-5 w-5 mr-2" />
                        サークル一覧
                    </NuxtLink>
                    <NuxtLink to="/map"
                        class="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-pink-600 hover:bg-gray-50"
                        :class="{ 'text-pink-600 bg-pink-50': $route.path === '/map' }"
                        @click="showMobileMenu = false">
                        <MapIcon class="h-5 w-5 mr-2" />
                        マップ
                    </NuxtLink>
                    <NuxtLink to="/bookmarks"
                        class="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-pink-600 hover:bg-gray-50"
                        :class="{ 'text-pink-600 bg-pink-50': $route.path === '/bookmarks' }"
                        @click="showMobileMenu = false">
                        <StarIcon class="h-5 w-5 mr-2" />
                        ブックマーク
                        <span v-if="bookmarkCount > 0" class="ml-2 bg-pink-500 text-white px-2 py-1 rounded-full text-xs">
                            {{ bookmarkCount }}
                        </span>
                    </NuxtLink>
                    <NuxtLink to="/events"
                        class="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-pink-600 hover:bg-gray-50"
                        :class="{ 'text-pink-600 bg-pink-50': $route.path === '/events' }"
                        @click="showMobileMenu = false">
                        <CalendarIcon class="h-5 w-5 mr-2" />
                        イベント一覧
                    </NuxtLink>
                    
                    <!-- ユーザー機能 -->
                    <div class="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-4">
                        ユーザー機能
                    </div>
                    <NuxtLink v-if="!isAuthenticated" to="/auth/login"
                        class="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-pink-600 hover:bg-gray-50"
                        :class="{ 'text-pink-600 bg-pink-50': $route.path === '/auth/login' }"
                        @click="showMobileMenu = false">
                        <LockClosedIcon class="h-5 w-5 mr-2" />
                        ログイン
                    </NuxtLink>
                    <NuxtLink v-if="isAuthenticated" to="/profile"
                        class="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-pink-600 hover:bg-gray-50"
                        :class="{ 'text-pink-600 bg-pink-50': $route.path === '/profile' }"
                        @click="showMobileMenu = false">
                        <UserIcon class="h-5 w-5 mr-2" />
                        プロフィール
                    </NuxtLink>
                    
                    <!-- その他 -->
                    <div class="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-4">
                        その他
                    </div>
                    <NuxtLink to="/about"
                        class="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-pink-600 hover:bg-gray-50"
                        :class="{ 'text-pink-600 bg-pink-50': $route.path === '/about' }"
                        @click="showMobileMenu = false">
                        <InformationCircleIcon class="h-5 w-5 mr-2" />
                        アプリについて
                    </NuxtLink>
                    
                    <!-- PWAインストール項目 -->
                    <PWAInstallMobileItem @install="showMobileMenu = false" />
                    
                    <!-- ログアウト -->
                    <div v-if="isAuthenticated" class="border-t border-gray-200 mt-4 pt-4">
                        <button @click="handleSignOut"
                            class="flex items-center w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-pink-600 hover:bg-gray-50">
                            <ArrowRightOnRectangleIcon class="h-5 w-5 mr-2" />
                            ログアウト
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </header>
</template>

<script setup lang="ts">
import {
    Bars3Icon,
    XMarkIcon,
    ChevronDownIcon,
    StarIcon,
    UserIcon,
    PencilIcon,
    WrenchScrewdriverIcon,
    InformationCircleIcon,
    ArrowRightOnRectangleIcon,
    LockClosedIcon,
    BookOpenIcon,
    MapIcon,
    HomeIcon,
    CalendarIcon
} from '@heroicons/vue/24/outline'

// Composables
const logger = useLogger('AppHeader')
const { user, isAuthenticated, isAdmin, signInWithTwitter, signOut } = useAuth()
const { bookmarkCount } = useBookmarks()
const router = useRouter()

// イベント管理
const {
  currentEvent,
  activeEvents,
  completedEvents,
  upcomingEvents,
  setCurrentEvent,
  fetchEvents
} = useEvents()

// State
const showMobileMenu = ref(false)
const showUserMenu = ref(false)
const showEventMenu = ref(false)
const showMobileEventMenu = ref(false)

// Methods
const toggleMobileMenu = () => {
    showMobileMenu.value = !showMobileMenu.value
}

const toggleUserMenu = () => {
    showUserMenu.value = !showUserMenu.value
}

const handleSignIn = async () => {
    try {
        await signInWithTwitter()
    } catch (error) {
        console.error('Sign in error:', error)
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

// イベント関連メソッド
const toggleEventMenu = () => {
    showEventMenu.value = !showEventMenu.value
}

const selectEvent = (eventId: string) => {
    logger.debug('Event switching started', { from: currentEvent.value?.id, to: eventId })
    setCurrentEvent(eventId)
    showEventMenu.value = false
    logger.debug('Event switching completed', { currentEventId: currentEvent.value?.id })
}

const formatEventDate = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date)
}

// モバイル用メソッド
const toggleMobileEventMenu = () => {
    showMobileEventMenu.value = !showMobileEventMenu.value
}

const selectEventMobile = (eventId: string) => {
    logger.debug('Mobile event switching started', { from: currentEvent.value?.id, to: eventId })
    setCurrentEvent(eventId)
    showMobileEventMenu.value = false
    showMobileMenu.value = false
    logger.debug('Mobile event switching completed', { currentEventId: currentEvent.value?.id })
}

// Close menus when route changes
watch(() => router.currentRoute.value.path, () => {
    showMobileMenu.value = false
    showUserMenu.value = false
    showEventMenu.value = false
    showMobileEventMenu.value = false
})

// 初期化とイベントリスナー
onMounted(async () => {
    // イベントデータを取得
    await fetchEvents()
    
    // メニューを閉じるためのクリックイベント
    document.addEventListener('click', (event) => {
        const target = event.target as Element
        if (!target.closest('.relative')) {
            showUserMenu.value = false
            showEventMenu.value = false
        }
    })
})
</script>