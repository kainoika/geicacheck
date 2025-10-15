<template>
  <div style="min-height: 100vh; background: #f9fafb;">
    <!-- ヒーローセクション -->
    <section style="background: linear-gradient(135deg, #ff69b4 0%, #87ceeb 50%, #ffd700 100%); color: white; padding: 4rem 0;">
      <div style="max-width: 1280px; margin: 0 auto; padding: 0 1rem; text-align: center;">
        <SparklesIcon style="width: 4rem; height: 4rem; margin: 0 auto 1rem; animation: sparkle 1.5s ease-in-out infinite; color: white;" />
        <h1 style="font-size: 3rem; font-weight: 700; margin: 0 0 1rem 0;">
          geica check!
        </h1>
        <p style="font-size: 1rem; opacity: 0.8; max-width: 600px; margin: 0 auto;">
          アイカツ！シリーズオンリーイベント「芸能人はカードが命！」のサークル情報を効率的にチェックして、<br>
          イベントをもっと楽しく、もっと効率的に回れるWebアプリです。
        </p>
      </div>
    </section>

    <!-- メインコンテンツ -->
    <div style="max-width: 1280px; margin: 0 auto; padding: 3rem 1rem;">
      <!-- アプリの特徴 -->
      <section style="margin-bottom: 4rem;">
        <h2 style="font-size: 2rem; font-weight: 700; color: #111827; text-align: center; margin: 0 0 3rem 0;">
          アプリの特徴
        </h2>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
          <div style="background: white; border-radius: 1rem; padding: 2rem; border: 1px solid #e5e7eb; text-align: center;">
            <div style="font-size: 3rem; margin-bottom: 1rem;"><BookOpenIcon style="width: 3rem; height: 3rem; color: #ff69b4; margin: 0 auto;" /></div>
            <h3 style="font-size: 1.25rem; font-weight: 600; color: #111827; margin: 0 0 1rem 0;">
              効率的なサークルチェック
            </h3>
            <p style="color: #6b7280; line-height: 1.6; margin: 0;">
              サークル名やジャンルで簡単にサークルを検索。お気に入りのサークルを素早く見つけて、効率的にイベントを回れます。
            </p>
          </div>

          <div style="background: white; border-radius: 1rem; padding: 2rem; border: 1px solid #e5e7eb; text-align: center;">
            <div style="font-size: 3rem; margin-bottom: 1rem;"><StarIcon style="width: 3rem; height: 3rem; color: #ff69b4; margin: 0 auto;" /></div>
            <h3 style="font-size: 1.25rem; font-weight: 600; color: #111827; margin: 0 0 1rem 0;">
              3段階ブックマーク
            </h3>
            <p style="color: #6b7280; line-height: 1.6; margin: 0;">
              「チェック予定」「気になる」「優先」の3つのカテゴリでサークルを管理。優先度に応じた巡回計画が立てられます。
            </p>
          </div>

          <div style="background: white; border-radius: 1rem; padding: 2rem; border: 1px solid #e5e7eb; text-align: center;">
            <div style="font-size: 3rem; margin-bottom: 1rem;"><MapIcon style="width: 3rem; height: 3rem; color: #ff69b4; margin: 0 auto;" /></div>
            <h3 style="font-size: 1.25rem; font-weight: 600; color: #111827; margin: 0 0 1rem 0;">
              インタラクティブマップ
            </h3>
            <p style="color: #6b7280; line-height: 1.6; margin: 0;">
              ブックマークしたサークルの配置を会場マップで確認。ズーム・パン機能で詳細な位置まで把握できます。
            </p>
          </div>

          <div style="background: white; border-radius: 1rem; padding: 2rem; border: 1px solid #e5e7eb; text-align: center;">
            <div style="font-size: 3rem; margin-bottom: 1rem;"><LockClosedIcon style="width: 3rem; height: 3rem; color: #ff69b4; margin: 0 auto;" /></div>
            <h3 style="font-size: 1.25rem; font-weight: 600; color: #111827; margin: 0 0 1rem 0;">
              X(Twitter)認証
            </h3>
            <p style="color: #6b7280; line-height: 1.6; margin: 0;">
              X(Twitter)アカウントでログインして、ブックマーク機能やサークル情報の編集権限申請が利用できます。
            </p>
          </div>

          <div style="background: white; border-radius: 1rem; padding: 2rem; border: 1px solid #e5e7eb; text-align: center;">
            <div style="font-size: 3rem; margin-bottom: 1rem;"><DocumentArrowDownIcon style="width: 3rem; height: 3rem; color: #ff69b4; margin: 0 auto;" /></div>
            <h3 style="font-size: 1.25rem; font-weight: 600; color: #111827; margin: 0 0 1rem 0;">
              CSVエクスポート
            </h3>
            <p style="color: #6b7280; line-height: 1.6; margin: 0;">
              ブックマークリストをCSV形式でエクスポート。他のアプリでの活用や、印刷してのアナログ管理も可能です。
            </p>
          </div>

          <div style="background: white; border-radius: 1rem; padding: 2rem; border: 1px solid #e5e7eb; text-align: center;">
            <div style="font-size: 3rem; margin-bottom: 1rem;"><DevicePhoneMobileIcon style="width: 3rem; height: 3rem; color: #ff69b4; margin: 0 auto;" /></div>
            <h3 style="font-size: 1.25rem; font-weight: 600; color: #111827; margin: 0 0 1rem 0;">
              PWA対応
            </h3>
            <p style="color: #6b7280; line-height: 1.6; margin: 0;">
              スマートフォンのホーム画面に追加して、アプリのように使用可能。オフライン機能で会場でも安心です。
            </p>
          </div>
        </div>
      </section>

      <!-- 使い方 -->
      <section style="margin-bottom: 4rem;">
        <h2 style="font-size: 2rem; font-weight: 700; color: #111827; text-align: center; margin: 0 0 3rem 0;">
          使い方
        </h2>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
          <div style="display: flex; align-items: start; gap: 1rem;">
            <div style="flex-shrink: 0; width: 2rem; height: 2rem; background: #ff69b4; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700;">
              1
            </div>
            <div>
              <h3 style="font-size: 1.125rem; font-weight: 600; color: #111827; margin: 0 0 0.5rem 0;">
                サークルを検索
              </h3>
              <p style="color: #6b7280; margin: 0; line-height: 1.5;">
                ジャンルやサークル名で気になるサークルを検索します。
              </p>
            </div>
          </div>

          <div style="display: flex; align-items: start; gap: 1rem;">
            <div style="flex-shrink: 0; width: 2rem; height: 2rem; background: #ff69b4; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700;">
              2
            </div>
            <div>
              <h3 style="font-size: 1.125rem; font-weight: 600; color: #111827; margin: 0 0 0.5rem 0;">
                ブックマークに追加
              </h3>
              <p style="color: #6b7280; margin: 0; line-height: 1.5;">
                気になるサークルを3つのカテゴリでブックマークします。
              </p>
            </div>
          </div>

          <div style="display: flex; align-items: start; gap: 1rem;">
            <div style="flex-shrink: 0; width: 2rem; height: 2rem; background: #ff69b4; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700;">
              3
            </div>
            <div>
              <h3 style="font-size: 1.125rem; font-weight: 600; color: #111827; margin: 0 0 0.5rem 0;">
                マップで確認
              </h3>
              <p style="color: #6b7280; margin: 0; line-height: 1.5;">
                会場マップでブックマークしたサークルの配置を確認します。
              </p>
            </div>
          </div>

          <div style="display: flex; align-items: start; gap: 1rem;">
            <div style="flex-shrink: 0; width: 2rem; height: 2rem; background: #ff69b4; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700;">
              4
            </div>
            <div>
              <h3 style="font-size: 1.125rem; font-weight: 600; color: #111827; margin: 0 0 0.5rem 0;">
                効率的に巡回
              </h3>
              <p style="color: #6b7280; margin: 0; line-height: 1.5;">
                優先度とマップを参考に、効率的な巡回ルートでイベントを楽しみます。
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- アイカツ！について -->
      <section style="margin-bottom: 4rem;">
        <h2 style="font-size: 2rem; font-weight: 700; color: #111827; text-align: center; margin: 0 0 3rem 0;">
          geica check!について
        </h2>
        
        <div style="background: white; border-radius: 1rem; padding: 2rem; border: 1px solid #e5e7eb;">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; align-items: center;">
            <div>
              <h3 style="font-size: 1.5rem; font-weight: 600; color: #111827; margin: 0 0 1rem 0;">
                「geica check!」について
              </h3>
              <p style="color: #6b7280; line-height: 1.6; margin: 0 0 1rem 0;">
                アプリの名前「geica check!」は、アイカツ！の楽曲「fashion check!」が由来となっています。
                アイドルたちがファッションをチェックするように、私たちもサークルをチェックしましょう！
              </p>

            </div>
            
            <!-- https://www.youtube.com/watch?v=wverKIG3mDg を埋め込み -->
            <div style="text-align: center;">
              <iframe 
                width="300" 
                height="169" 
                src="https://www.youtube.com/embed/wverKIG3mDg?si=1" 
                title="YouTube video player" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowfullscreen
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      <!-- 技術情報 -->
      <section style="margin-bottom: 4rem;">
        <h2 style="font-size: 2rem; font-weight: 700; color: #111827; text-align: center; margin: 0 0 3rem 0;">
          技術情報
        </h2>
        
        <div style="background: white; border-radius: 1rem; padding: 2rem; border: 1px solid #e5e7eb;">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem;">
            <div>
              <h3 style="font-size: 1.125rem; font-weight: 600; color: #111827; margin: 0 0 1rem 0;">
                フロントエンド
              </h3>
              <ul style="color: #6b7280; margin: 0; padding-left: 1rem; line-height: 1.6;">
                <li>Nuxt 3</li>
                <li>Vue 3 Composition API</li>
                <li>TypeScript</li>
                <li>Tailwind CSS</li>
              </ul>
            </div>
            
            <div>
              <h3 style="font-size: 1.125rem; font-weight: 600; color: #111827; margin: 0 0 1rem 0;">
                バックエンド
              </h3>
              <ul style="color: #6b7280; margin: 0; padding-left: 1rem; line-height: 1.6;">
                <li>Firebase Firestore</li>
                <li>Firebase Authentication</li>
                <li>Firebase Storage</li>
                <li>Firebase Functions</li>
                <li>Firebase Hosting</li>
              </ul>
            </div>
            
            <div>
              <h3 style="font-size: 1.125rem; font-weight: 600; color: #111827; margin: 0 0 1rem 0;">
                開発ツール
              </h3>
              <ul style="color: #6b7280; margin: 0; padding-left: 1rem; line-height: 1.6;">
                <li>ESLint</li>
                <li>Prettier</li>
                <li>Vitest</li>
                <li>GitHub Actions</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- お問い合わせ・サポート -->
      <section style="margin-bottom: 4rem;">
        <h2 style="font-size: 2rem; font-weight: 700; color: #111827; text-align: center; margin: 0 0 3rem 0;">
          お問い合わせ・サポート
        </h2>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
          <div style="background: white; border-radius: 1rem; padding: 2rem; border: 1px solid #e5e7eb; text-align: center;">
            <div style="font-size: 2rem; margin-bottom: 1rem;"><AtSymbolIcon style="width: 2rem; height: 2rem; color: #1da1f2; margin: 0 auto;" /></div>
            <h3 style="font-size: 1.25rem; font-weight: 600; color: #111827; margin: 0 0 1rem 0;">
              X(Twitter)
            </h3>
            <p style="color: #6b7280; margin: 0 0 1rem 0;">
              最新情報やお知らせはX(Twitter)で配信しています
            </p>
            <a 
              href="https://twitter.com/geica_check" 
              target="_blank" 
              rel="noopener noreferrer"
              style="color: #1da1f2; text-decoration: none; font-weight: 500;"
            >
              @geica_check
            </a>
          </div>

          <div style="background: white; border-radius: 1rem; padding: 2rem; border: 1px solid #e5e7eb; text-align: center;">
            <div style="font-size: 2rem; margin-bottom: 1rem;"><EnvelopeIcon style="width: 2rem; height: 2rem; color: #ff69b4; margin: 0 auto;" /></div>
            <h3 style="font-size: 1.25rem; font-weight: 600; color: #111827; margin: 0 0 1rem 0;">
              問い合わせ
            </h3>
            <p style="color: #6b7280; margin: 0 0 1rem 0;">
              バグ報告や機能要望はこちらからお送りください
            </p>
            <a 
              href="https://forms.gle/oJheDtS1oZWBTm6v8"
              style="color: #ff69b4; text-decoration: none; font-weight: 500;"
            >
              お問い合わせフォーム
            </a>
          </div>

        </div>
      </section>

      <!-- 免責事項 -->
      <section style="margin-bottom: 4rem;">
        <div style="background: #fef3f2; border: 1px solid #fecaca; border-radius: 1rem; padding: 2rem;">
          <h2 style="font-size: 1.5rem; font-weight: 600; color: #991b1b; margin: 0 0 1rem 0;">
            <ExclamationTriangleIcon style="width: 1.5rem; height: 1.5rem; display: inline; margin-right: 0.5rem; vertical-align: -0.25rem;" /> 免責事項
          </h2>
          <div style="color: #7f1d1d; line-height: 1.6;">
            <p style="margin: 0 0 1rem 0;">
              このアプリは非公式のファンメイドアプリです。アイカツ！シリーズおよび関連する公式コンテンツとは直接の関係はありません。
            </p>
            <p style="margin: 0;">
              サークル情報の正確性については保証いたしかねます。最新の情報は各サークルの公式アカウントや頒布物でご確認ください。
            </p>
          </div>
        </div>
      </section>

      <!-- 利用規約・プライバシーポリシー -->
      <section>
        <div style="background: white; border-radius: 1rem; padding: 2rem; border: 1px solid #e5e7eb; text-align: center;">
          <h2 style="font-size: 1.5rem; font-weight: 600; color: #111827; margin: 0 0 1.5rem 0;">
            <DocumentTextIcon style="width: 1.5rem; height: 1.5rem; display: inline; margin-right: 0.5rem; vertical-align: -0.25rem;" /> 法的情報
          </h2>
          <div style="display: flex; gap: 2rem; justify-content: center; flex-wrap: wrap;">
            <NuxtLink 
              to="/terms"
              style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; background: #f9fafb; color: #374151; border: 1px solid #e5e7eb; border-radius: 0.5rem; text-decoration: none; font-weight: 500; transition: all 0.2s;"
              onmouseover="this.style.borderColor='#ff69b4'; this.style.color='#ff69b4'"
              onmouseout="this.style.borderColor='#e5e7eb'; this.style.color='#374151'"
            >
              <DocumentTextIcon style="width: 1.25rem; height: 1.25rem;" />
              利用規約
            </NuxtLink>
            <NuxtLink 
              to="/privacy"
              style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; background: #f9fafb; color: #374151; border: 1px solid #e5e7eb; border-radius: 0.5rem; text-decoration: none; font-weight: 500; transition: all 0.2s;"
              onmouseover="this.style.borderColor='#ff69b4'; this.style.color='#ff69b4'"
              onmouseout="this.style.borderColor='#e5e7eb'; this.style.color='#374151'"
            >
              <ShieldCheckIcon style="width: 1.25rem; height: 1.25rem;" />
              プライバシーポリシー
            </NuxtLink>
          </div>
          <p style="color: #6b7280; margin: 1.5rem 0 0 0; font-size: 0.875rem;">
            本サービスをご利用いただく前に、必ず利用規約とプライバシーポリシーをお読みください。
          </p>
        </div>
      </section>
    </div>

    <!-- CTA セクション -->
    <section style="background: linear-gradient(135deg, #ff69b4, #87ceeb); padding: 4rem 0; text-align: center;">
      <div style="max-width: 1280px; margin: 0 auto; padding: 0 1rem;">
        <h2 style="font-size: 2rem; font-weight: 700; color: white; margin: 0 0 1rem 0;">
          今すぐ始めよう！
        </h2>
        <p style="color: white; opacity: 0.9; margin: 0 0 2rem 0; font-size: 1.125rem;">
          アイカツ！同人イベントをもっと楽しく、もっと効率的に
        </p>
        <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
          <NuxtLink 
            to="/circles"
            style="padding: 1rem 2rem; background: white; color: #ff69b4; border-radius: 0.5rem; text-decoration: none; font-weight: 600; transition: all 0.2s;"
            onmouseover="this.style.transform='translateY(-2px)'"
            onmouseout="this.style.transform='translateY(0)'"
          >
            サークル一覧を見る
          </NuxtLink>
          <NuxtLink 
            to="/auth/login"
            style="padding: 1rem 2rem; background: rgba(255,255,255,0.2); color: white; border: 2px solid white; border-radius: 0.5rem; text-decoration: none; font-weight: 600; transition: all 0.2s;"
            onmouseover="this.style.backgroundColor='white'; this.style.color='#ff69b4'"
            onmouseout="this.style.backgroundColor='rgba(255,255,255,0.2)'; this.style.color='white'"
          >
            ログインして始める
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import {
  SparklesIcon,
  StarIcon,
  BookOpenIcon,
  MapIcon,
  LockClosedIcon,
  DevicePhoneMobileIcon,
  WrenchScrewdriverIcon,
  PhoneIcon,
  AtSymbolIcon,
  EnvelopeIcon,
  ComputerDesktopIcon,
  ExclamationTriangleIcon,
  DocumentArrowDownIcon,
  DocumentTextIcon,
  ShieldCheckIcon
} from '@heroicons/vue/24/outline'
// SEO
useHead({
  title: 'このアプリについて - geica check!',
  meta: [
    { name: 'description', content: 'geica check! はアイカツ！シリーズオンリーイベント「芸能人はカードが命！」のサークルチェックを効率化するWebアプリです。' },
    { name: 'keywords', content: 'アイカツ,同人,イベント,サークル,チェック,ブックマーク,芸カ,geica check' },
    { property: 'og:title', content: 'このアプリについて - geica check!' },
    { property: 'og:description', content: 'アイカツ！同人イベントサークルチェックアプリの詳細情報' }
  ]
})
</script>

<style scoped>
@keyframes sparkle {
  0%, 100% { 
    opacity: 1; 
    transform: scale(1); 
  }
  50% { 
    opacity: 0.5; 
    transform: scale(1.1); 
  }
}
</style>