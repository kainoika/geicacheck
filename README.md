# geika check! 

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
- **🔐 Twitter認証**: セキュアなTwitterアカウント連携でデータを保護
- **📊 CSVエクスポート**: ブックマークリストをCSV形式でエクスポート
- **📱 PWA対応**: スマートフォンのホーム画面に追加してアプリのように使用可能
- **✏️ 編集権限システム**: コミュニティによるサークル情報の管理

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
   git clone https://github.com/your-username/geika-check.git
   cd geika-check
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
geika-check/
├── components/          # Vueコンポーネント
│   ├── bookmark/        # ブックマーク関連
│   ├── circle/          # サークル表示関連
│   ├── event/           # イベント関連
│   ├── layout/          # レイアウト要素
│   ├── map/             # マップ機能
│   └── ui/              # 再利用可能UIコンポーネント
├── composables/         # Vue 3 Composition API
├── pages/               # ページコンポーネント（ファイルベースルーティング）
├── plugins/             # Nuxtプラグイン
├── scripts/             # データ管理スクリプト
├── types/               # TypeScript型定義
└── utils/               # ユーティリティ関数
```

### 状態管理

Vue 3の Composition API と `useState()` を活用したコンポーザブルベースの状態管理：

- `useAuth()` - 認証状態
- `useBookmarks()` - ブックマーク管理  
- `useCircles()` - サークルデータ
- `useEvents()` - イベント情報

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

## 🧪 テスト

```bash
# 全テスト実行
npm run test

# ウォッチモード
npm run test:watch

# カバレッジレポート
npm run test:coverage
```

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

- **バグ報告・機能要望**: [Issues](https://github.com/your-username/geika-check/issues)
- **Twitter**: [@geika_check](https://twitter.com/geika_check)
- **メール**: support@geika-check.com

---

**⚠️ 免責事項**: このアプリは非公式のファンメイドプロジェクトです。アイカツ！シリーズおよび関連する公式コンテンツとは直接の関係はありません。サークル情報の正確性については保証いたしかねますので、最新の情報は各サークルの公式アカウントや頒布物でご確認ください。