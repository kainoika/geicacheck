<template>
  <div class="min-h-screen bg-gray-50">
    <main class="container mx-auto px-4 py-8 max-w-4xl">
      <div class="bg-white rounded-lg shadow-md p-8">
        <h1 class="text-3xl font-bold mb-2">プライバシーポリシー</h1>
        <p class="text-gray-600 mb-8">最終更新日: 2025年9月1日</p>

        <div class="prose prose-pink max-w-none space-y-8">
          <section>
            <h2 class="text-2xl font-bold text-pink-600 mb-4 flex items-center gap-2">
              <ShieldCheckIcon class="h-6 w-6" />
              個人情報の取り扱いについて
            </h2>
            <p class="text-gray-700 leading-relaxed">
              geica check!では、ユーザーの個人情報を適切に保護し、管理いたします。<br>
              本プライバシーポリシーでは、収集する情報の種類と利用目的について説明いたします。
            </p>
          </section>

          <section>
            <h2 class="text-2xl font-bold text-pink-600 mb-4 flex items-center gap-2">
              <ChartBarIcon class="h-6 w-6" />
              収集する情報
            </h2>
            
            <div class="space-y-6">
              <div class="bg-blue-50 rounded-lg p-6">
                <h3 class="font-bold text-lg mb-3 flex items-center gap-2">
                  <img src="data:image/svg+xml,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' fill='%232563eb'/%3E%3C/svg%3E" class="h-5 w-5" alt="X" /> Twitter（X）認証による取得情報
                </h3>
                <ul class="space-y-2 text-sm text-gray-700">
                  <li>✓ ユーザー名（@から始まるID）</li>
                  <li>✓ 表示名</li>
                  <li>✓ プロフィール画像</li>
                  <li>✓ X(Twitter)のユーザーID</li>
                </ul>
                <p class="mt-3 text-xs text-gray-600">
                  ※ ツイート内容やフォロワー情報は取得いたしません
                </p>
              </div>

              <div class="bg-green-50 rounded-lg p-6">
                <h3 class="font-bold text-lg mb-3 flex items-center gap-2">
                  <PencilIcon class="h-5 w-5 text-green-600" /> ユーザー入力情報
                </h3>
                <ul class="space-y-2 text-sm text-gray-700">
                  <li>✓ サークル名・サークル情報</li>
                  <li>✓ 頒布物の情報</li>
                  <li>✓ アップロードした画像（サークルカット、お品書き）</li>
                  <li>✓ ブックマークしたサークル情報</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 class="text-2xl font-bold text-pink-600 mb-4 flex items-center gap-2">
              <DocumentTextIcon class="h-6 w-6" />
              利用目的
            </h2>
            <div class="bg-pink-50 rounded-lg p-6">
              <p class="font-bold mb-3">収集した情報は以下の目的で利用いたします：</p>
              <ul class="space-y-3 text-gray-700">
                <li class="flex items-start gap-2">
                  <CheckCircleIcon class="h-5 w-5 text-pink-600" />
                  <span>ユーザー認証とサークル情報の管理</span>
                </li>
                <li class="flex items-start gap-2">
                  <EyeIcon class="h-5 w-5 text-pink-600" />
                  <span>他の参加者によるサークル情報の閲覧</span>
                </li>
                <li class="flex items-start gap-2">
                  <BookmarkIcon class="h-5 w-5 text-pink-600" />
                  <span>ブックマーク機能の提供</span>
                </li>
                <li class="flex items-start gap-2">
                  <ChartBarIcon class="h-5 w-5 text-pink-600" />
                  <span>サービス改善のための統計分析（個人を特定しない形で）</span>
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 class="text-2xl font-bold text-pink-600 mb-4 flex items-center gap-2">
              <ShareIcon class="h-6 w-6" />
              情報の公開範囲
            </h2>
            <div class="space-y-4">
              <div class="p-4 bg-gray-50 rounded-lg">
                <h3 class="font-bold mb-2">公開される情報</h3>
                <p class="text-sm text-gray-700">
                  サークル情報（サークル名、頒布物、画像など）は、他のユーザーに公開されます。
                </p>
              </div>
              
              <div class="p-4 bg-gray-50 rounded-lg">
                <h3 class="font-bold mb-2">公開されない情報</h3>
                <p class="text-sm text-gray-700">
                  ブックマーク情報、その他の個人設定は公開されません。
                </p>
              </div>

              <div class="p-4 bg-red-50 rounded-lg">
                <h3 class="font-bold mb-2">第三者への提供</h3>
                <p class="text-sm text-gray-700">
                  法令に基づく場合を除き、ユーザーの個人情報を第三者に提供することはありません。
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 class="text-2xl font-bold text-pink-600 mb-4 flex items-center gap-2">
              <ArrowPathIcon class="h-6 w-6" />
              ポリシーの変更
            </h2>
            <p class="text-gray-700">
              本プライバシーポリシーは、必要に応じて更新することがあります。<br>
              重要な変更がある場合は、サイト上でお知らせいたします。
            </p>
          </section>

        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import {
  ShieldCheckIcon,
  ChartBarIcon,
  PencilIcon,
  CogIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  EyeIcon,
  BookmarkIcon,
  ShareIcon,
  LockClosedIcon,
  TrashIcon,
  UserIcon,
  ArrowPathIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/vue/24/outline'

useHead({
  title: 'プライバシーポリシー - geica check!',
  meta: [
    { 
      name: 'description', 
      content: 'geica check!のプライバシーポリシーです。個人情報の取り扱いについて説明しています。' 
    }
  ]
})
</script>