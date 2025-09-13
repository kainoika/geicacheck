<template>
  <div class="min-h-screen bg-gray-50">
    <main class="container mx-auto px-4 py-8 max-w-4xl">
      <div class="bg-white rounded-lg shadow-md p-8">
        <h1 class="text-3xl font-bold mb-2">利用規約</h1>
        <p class="text-gray-600 mb-8">最終更新日: 2025年9月1日</p>

        <div class="prose prose-pink max-w-none space-y-8">
          <section>
            <h2 class="text-2xl font-bold text-pink-600 mb-4 flex items-center gap-2">
              <DocumentTextIcon class="h-6 w-6" />
              はじめに
            </h2>
            <p class="text-gray-700 leading-relaxed">
              geica check!をご利用いただきありがとうございます。<br>
              このサービスは、同人イベント「芸カ」の参加サークル情報を管理・共有するためのツールです。<br>
              本規約をお読みいただき、同意の上でご利用ください。
            </p>
          </section>

          <section>
            <h2 class="text-2xl font-bold text-pink-600 mb-4 flex items-center gap-2">
              <UserGroupIcon class="h-6 w-6" />
              基本的なルール
            </h2>
            <div class="bg-pink-50 rounded-lg p-6 space-y-4">
              <div class="flex items-start gap-3">
                <CheckCircleIcon class="h-6 w-6 text-pink-600 flex-shrink-0" />
                <div>
                  <h3 class="font-bold mb-1">正確な情報の入力</h3>
                  <p class="text-sm text-gray-700">サークル情報は正確に入力してください。他人になりすます行為は禁止です。</p>
                </div>
              </div>
              
              <div class="flex items-start gap-3">
                <PhotoIcon class="h-6 w-6 text-pink-600 flex-shrink-0" />
                <div>
                  <h3 class="font-bold mb-1">画像の権利</h3>
                  <p class="text-sm text-gray-700">サークルカットやお品書きは、権利を有する画像のみアップロードしてください。</p>
                </div>
              </div>
              
              <div class="flex items-start gap-3">
                <HeartIcon class="h-6 w-6 text-pink-600 flex-shrink-0" />
                <div>
                  <h3 class="font-bold mb-1">適切な利用</h3>
                  <p class="text-sm text-gray-700">誹謗中傷や嫌がらせ行為は禁止です。</p>
                </div>
              </div>
              
            </div>
          </section>

          <section>
            <h2 class="text-2xl font-bold text-pink-600 mb-4 flex items-center gap-2">
              <LockClosedIcon class="h-6 w-6" />
              アカウント管理
            </h2>
            <ul class="space-y-3 text-gray-700">
              <li class="flex items-start gap-2">
                <span>•</span>
                <span>ログインはX(Twitter)アカウントで行います</span>
              </li>
              <li class="flex items-start gap-2">
                <span>•</span>
                <span>アカウントの管理は自己責任で行ってください</span>
              </li>
              <li class="flex items-start gap-2">
                <span>•</span>
                <span>アカウントの貸与や共有は禁止します</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 class="text-2xl font-bold text-pink-600 mb-4 flex items-center gap-2">
              <XMarkIcon class="h-6 w-6" />
              禁止行為
            </h2>
            <div class="bg-red-50 rounded-lg p-6">
              <ul class="space-y-2 text-gray-700">
                <li class="flex items-center gap-2"><XMarkIcon class="h-4 w-4 text-red-600" /> 法律に違反する行為</li>
                <li class="flex items-center gap-2"><XMarkIcon class="h-4 w-4 text-red-600" /> サーバーに負荷をかける行為（スクレイピング、自動化ツールの使用など）</li>
                <li class="flex items-center gap-2"><XMarkIcon class="h-4 w-4 text-red-600" /> サービスの運営を妨害する行為</li>
                <li class="flex items-center gap-2"><XMarkIcon class="h-4 w-4 text-red-600" /> その他、運営が不適切と判断する行為</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 class="text-2xl font-bold text-pink-600 mb-4 flex items-center gap-2">
              <CogIcon class="h-6 w-6" />
              サービスについて
            </h2>
            <div class="space-y-4 text-gray-700">
              <div class="p-4 bg-gray-50 rounded-lg">
                <h3 class="font-bold mb-2">サービスの変更・終了</h3>
                <p class="text-sm">予告なくサービス内容を変更、または終了することがあります。</p>
              </div>
              
              <div class="p-4 bg-gray-50 rounded-lg">
                <h3 class="font-bold mb-2">免責事項</h3>
                <p class="text-sm">システムの不具合等によって生じた損害について、責任を負いかねます。</p>
              </div>
              
              <div class="p-4 bg-gray-50 rounded-lg">
                <h3 class="font-bold mb-2">規約違反への対応</h3>
                <p class="text-sm">規約に違反した場合、警告またはアカウント停止措置を行うことがあります。</p>
              </div>
            </div>
          </section>

          <div class="mt-12 p-6 bg-pink-100 rounded-lg text-center">
            <p class="text-lg font-bold text-pink-700 mb-2">
              geica check!をご利用いただき、ありがとうございます
            </p>
            <p class="text-sm text-gray-600">
              本利用規約は予告なく変更することがあります。<br>
              重要な変更がある場合は、サイト上でお知らせいたします。
            </p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import {
  DocumentTextIcon,
  UserGroupIcon,
  CheckCircleIcon,
  PhotoIcon,
  HeartIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
  XMarkIcon,
  CogIcon,
  EnvelopeIcon
} from '@heroicons/vue/24/outline'

useHead({
  title: '利用規約 - geica check!',
  meta: [
    { 
      name: 'description', 
      content: 'geica check!の利用規約です。サービスを安全にご利用いただくためのルールを定めています。' 
    }
  ]
})
</script>