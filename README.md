# geica check! 

> アイカツ！同人イベントサークルチェックアプリ

[![Nuxt 3](https://img.shields.io/badge/Nuxt-3-green.svg)](https://nuxt.com/)
[![Vue 3](https://img.shields.io/badge/Vue-3-green.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-10-orange.svg)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3-blue.svg)](https://tailwindcss.com/)

アイカツ！シリーズオンリー同人イベント「芸能人はカードが命！（芸カ）」のサークル情報を効率的にチェックして、イベントをもっと楽しく、もっと効率的に回れるWebアプリです。

## ✨ 特徴

- **🔍 高度な検索機能**: サークル名、ペンネーム、ジャンル、説明文を対象とした複数キーワード検索
- **📚 3段階ブックマーク**: 「チェック予定」「気になる」「優先」の3つのカテゴリで管理
- **🗺️ インタラクティブマップ**: ブックマークしたサークルの配置を会場マップで確認
  - **📱 タッチ操作対応**: ピンチズーム・パン操作でスマートフォンでも快適操作
  - **🎯 SVGネイティブピン**: 高精度でパフォーマンス最適化されたピン表示
  - **🔄 マルチイベント対応**: 複数イベント間の自動切り替えとマップ読み込み
  - **💾 インテリジェントキャッシュ**: 高速なマップ切り替えとオフライン対応
  - **📊 ブックマーク統計表示**: 「合計」「チェック」「気になる」「優先」の4カテゴリ表示
  - **📲 モバイル最適化**: デバウンス処理による安定したピン表示
- **🔐 Twitter認証**: セキュアなTwitterアカウント連携でデータを保護
- **📊 CSVエクスポート**: ブックマークリストをCSV形式でエクスポート
- **📱 PWA対応**: スマートフォンのホーム画面に追加してアプリのように使用可能
- **✏️ 編集権限システム**: サークル参加者が自身のサークル情報を編集可能
- **👥 コミュニティ管理**: Twitter連携による自動承認と管理者による申請審査

## 🚀 技術スタック

### フロントエンド
- **[Nuxt 3](https://nuxt.com/)** - フルスタックVue.jsフレームワーク（SPAモード）
- **[Vue 3](https://vuejs.org/)** - プログレッシブJavaScriptフレームワーク
- **[TypeScript](https://www.typescriptlang.org/)** - 型安全性を提供する JavaScript のスーパーセット
- **[Tailwind CSS](https://tailwindcss.com/)** - ユーティリティファーストCSSフレームワーク
- **[Heroicons](https://heroicons.com/)** - 美しいSVGアイコンライブラリ

### バックエンド・インフラ
- **[Firebase Authentication](https://firebase.google.com/products/auth)** - Twitter OAuth認証
- **[Firebase Firestore](https://firebase.google.com/products/firestore)** - NoSQLドキュメントデータベース
- **[Firebase Storage](https://firebase.google.com/products/storage)** - ファイルストレージ
- **[Firebase Hosting](https://firebase.google.com/products/hosting)** - 高速Webホスティングサービス

### 開発ツール
- **[ESLint](https://eslint.org/)** + **[Prettier](https://prettier.io/)** - コード品質とフォーマット
- **[Vitest](https://vitest.dev/)** - 高速なユニットテストフレームワーク
- **[GitHub Actions](https://github.com/features/actions)** - CI/CDパイプライン

## 📦 セットアップ

### 前提条件

- Node.js 18+ 
- npm または yarn
- Firebase プロジェクト

### インストール

1. **リポジトリをクローン**
   ```bash
   git clone https://github.com/kainoika/geicacheck.git
   cd geicacheck
   ```

2. **依存関係をインストール**
   ```bash
   npm install
   ```

3. **環境変数を設定**
   ```bash
   cp .env.example .env
   ```
   
   `.env` ファイルに Firebase の設定値を記入：
   ```env
   NUXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NUXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NUXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Firebase プロジェクトの設定**
   - Firebase コンソールで新しいプロジェクトを作成
   - Authentication で Twitter プロバイダーを有効化
   - Firestore でデータベースを作成
   - `firestore.rules` でセキュリティルールを設定

5. **開発サーバーを起動**
   ```bash
   npm run dev
   ```

   アプリケーションが http://localhost:3000 で起動します。

## 🛠️ 開発

### よく使うコマンド

```bash
# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# 静的サイト生成
npm run generate

# 本番プレビュー
npm run preview

# コード品質チェック
npm run lint

# 自動フォーマット
npm run lint:fix

# テスト実行
npm run test

# カバレッジ付きテスト
npm run test:coverage

# Firebase接続テスト
npm run test:firebase
```

### Firebase Emulator Suite（開発環境）

ローカル開発では Firebase Emulator Suite を使用して、本番環境に接続せずにテストできます。

```bash
# Emulator Suite を起動
npm run emulators:start

# Emulator Suite を起動（データをインポート）
npm run emulators:import

# Emulator データをエクスポート
npm run emulators:export
```

**Emulator 設定:**
- **Auth Emulator**: http://localhost:9099
- **Firestore Emulator**: http://localhost:8080
- **Storage Emulator**: http://localhost:9199
- **Emulator UI**: http://localhost:4000

**開発環境でEmulatorを使用するには:**
1. `.env` ファイルに `NUXT_PUBLIC_USE_FIREBASE_EMULATOR=true` を追加
2. `npm run emulators:start` でEmulatorを起動
3. 別のターミナルで `npm run dev` で開発サーバーを起動

Emulatorを使用することで：
- 本番データを汚さずに安全にテストが可能
- オフラインでの開発が可能
- 高速な読み書き操作でスムーズな開発体験

### データ管理スクリプト

```bash
# サークルデータの変換
npm run convert:circles

# 変換済みサークルデータのインポート
npm run import:converted-circles

# イベントデータのインポート
npm run import:event
```

## 🏗️ アーキテクチャ

### プロジェクト構造

```
geica-check/
├── components/          # Vueコンポーネント
│   ├── bookmark/        # ブックマーク関連
│   ├── circle/          # サークル表示関連
│   ├── event/           # イベント関連
│   ├── layout/          # レイアウト要素
│   ├── map/             # インタラクティブマップ機能
│   └── ui/              # 再利用可能UIコンポーネント
├── composables/         # Vue 3 Composition API
│   ├── useEventMap.ts   # マップ読み込み・キャッシュ管理
│   ├── useSvgPins.ts    # SVGピン描画システム
│   ├── useTouch.ts      # タッチジェスチャー処理
│   └── (その他...)      # 各機能のコンポーザブル
├── data/                # 静的データファイル
│   └── mapConfigs.ts    # イベント別マップ設定
├── pages/               # ページコンポーネント（ファイルベースルーティング）
├── plugins/             # Nuxtプラグイン
├── scripts/             # データ管理スクリプト
├── tests/               # テストファイル
│   ├── composables/     # コンポーザブルテスト
│   ├── pages/           # ページテスト
│   └── utils/           # ユーティリティテスト
├── types/               # TypeScript型定義
└── utils/               # ユーティリティ関数
    └── placementUtils.ts # 配置番号正規化
```

### 状態管理

Vue 3の Composition API と `useState()` を活用したコンポーザブルベースの状態管理：

#### 📊 基本機能
- `useAuth()` - 認証状態
- `useBookmarks()` - ブックマーク管理（ref-based storeによるイベント別データ分離）
- `useCircles()` - サークルデータ
- `useEvents()` - イベント情報
- `useEditPermissions()` - 編集権限申請管理（ownerId自動更新対応）
- `useCirclePermissions()` - サークル編集権限チェック

#### 🗺️ インタラクティブマップ
- `useEventMap()` - マップファイル読み込み・キャッシュ・イベント切り替え
- `useSvgPins()` - SVGピン描画・アニメーション・カテゴリ別表示（タッチイベント最適化）
- `useTouch()` - タッチジェスチャー認識・ピンチズーム・パン操作
- `useCircleMapping()` - サークル座標計算・配置番号正規化

### データベース設計

Firestore のコレクション構造：

```
events/{eventId}/
├── circles/              # サークル情報
└── bookmarks/            # ユーザーブックマーク

users/                    # ユーザープロフィール
edit_permission_requests/ # 編集権限申請
circle_permissions/       # 編集権限管理
```

## ✏️ 編集権限機能

サークル参加者が自身のサークル情報を編集できる機能を提供しています。

### 🔑 権限申請の流れ

1. **申請**: サークル詳細ページから編集権限を申請
2. **自動審査**: 申請者のTwitterアカウントとサークルのTwitter情報が一致する場合は自動承認
3. **手動審査**: 一致しない場合は管理者による手動審査
4. **権限付与**: 承認後、サークル情報の編集が可能

### 🛡️ セキュリティ機能

- **Twitter連携認証**: 信頼性の高いアカウント確認
- **管理者承認システム**: 不正な編集を防止
- **権限の細分化**: 画像アップロード、ジャンル編集等の個別権限管理
- **履歴追跡**: 全ての編集操作の記録

### 📝 編集可能な情報

承認されたユーザーは以下の情報を編集できます：

- **サークルカット画像**: サークルカットの画像アップロード・更新
- **お品書き画像**: お品書きの画像アップロード・更新  
- **ジャンル情報**: サークルのジャンル設定
- **頒布物情報**: 頒布物リストの管理
- **連絡先情報**: Twitter、Pixiv等のリンク情報
- **説明文**: サークルの詳細説明

### 👨‍💼 管理者機能

管理者は専用ダッシュボードで以下の操作が可能：

- **申請一覧**: 全ての編集権限申請の確認
- **承認・却下**: 申請の手動審査と判定
- **権限管理**: 既存権限の確認と取り消し
- **統計情報**: 申請状況の確認

管理者ダッシュボードは `/admin/edit-requests` でアクセス可能です。

```

## 🧪 テスト

```bash
# 全テスト実行
npm run test

# ウォッチモード
npm run test:watch

# カバレッジレポート
npm run test:coverage
```

### テスト範囲

#### 📱 インタラクティブマップ機能
- **useEventMap**: マップ読み込み・キャッシュ・エラーハンドリング
- **useSvgPins**: ピン描画・強調表示・大量データ処理・タッチイベント
- **useTouch**: タッチジェスチャー・ピンチズーム・パン操作
- **useCircleMapping**: 座標計算・配置番号正規化・パフォーマンス
- **placementUtils**: 配置番号正規化・全角半角変換・エッジケース
- **モバイル対応**: デバウンス処理・描画タイミング最適化

#### 🔧 基本機能テスト
- **コンポーザブル**: 状態管理・データ取得・エラーハンドリング
- **ページ統合**: イベント切り替え・ブックマーク表示・ユーザー操作
- **ユーティリティ**: 権限チェック・データ変換・パフォーマンス
- **イベント切り替え**: ref-based store・データ分離・キャッシュクリア

#### 🚀 パフォーマンステスト
- 大量ブックマーク処理（1000件）
- 高速座標計算・検索処理
- メモリ効率・レンダリング最適化
- モバイル描画パフォーマンス

テストファイルは `*.test.ts` または `*.spec.ts` の命名規則に従ってください。

## 🚀 デプロイ

### Firebase Hosting

1. **Firebase CLIをインストール**
   ```bash
   npm install -g firebase-tools
   ```

2. **Firebaseにログイン**
   ```bash
   firebase login
   ```

3. **プロジェクトを初期化**
   ```bash
   firebase init hosting
   ```

4. **ビルド & デプロイ**
   ```bash
   npm run generate
   firebase deploy
   ```

### GitHub Actions

`.github/workflows/` でCI/CDパイプラインが設定されており、mainブランチへのプッシュで自動デプロイされます。

## 🤝 コントリビューション

プロジェクトへの貢献を歓迎します！

1. このリポジトリをフォーク
2. 新しいブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

### 開発ガイドライン

- TypeScriptの型安全性を維持してください
- ESLint + Prettier の設定に従ってください
- 新機能には適切なテストを追加してください
- コミットメッセージは[Conventional Commits](https://www.conventionalcommits.org/)形式を推奨します

## 📄 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。詳細は [LICENSE](LICENSE) ファイルをご覧ください。

## 🙏 謝辞

- **アイカツ！シリーズ** - 素晴らしい作品に感謝
- **同人イベント主催者様** - イベント開催に感謝
- **サークル参加者の皆様** - コミュニティの活動に感謝

## 📞 サポート

- **バグ報告・機能要望**: [Issues](https://github.com/kainoika/geicacheck/issues)
- **Twitter**: [@geica_check](https://twitter.com/geica_check)

---

**⚠️ 免責事項**: このアプリは非公式のファンメイドプロジェクトです。アイカツ！シリーズおよび関連する公式コンテンツとは直接の関係はありません。サークル情報の正確性については保証いたしかねますので、最新の情報は各サークルの公式アカウントや頒布物でご確認ください。