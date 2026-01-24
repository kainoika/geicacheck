# Implementation Plan: サークル詳細ページ画像表示改善

**Branch**: `001-improve-circle-image-display` | **Date**: 2026-01-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-improve-circle-image-display/spec.md`

## Summary

サークル詳細ページの画像表示を改善し、モバイルでの表示崩れを修正するとともに、お品書きを最大4枚まで登録・閲覧できるようにします。主な変更点は以下の通りです：

1. **モバイルレスポンシブ対応**: サークルカットとお品書き画像を画面幅（320px〜768px）に自動調整し、横スクロールを防止
2. **複数お品書き対応**: `menuImageUrl: string`から`menuImages: MenuImage[]`へのデータ構造変更（最大4枚、Twitter画像投稿上限に準拠）
3. **画像カルーセルUI**: スワイプ/ボタン操作で複数お品書きを閲覧可能な直感的UI
4. **パフォーマンス最適化**: 1枚目優先読み込み、2枚目以降の遅延読み込みで3秒以内の表示開始を実現

**技術アプローチ**:
- Vue 3 Composition APIでコンポーザブル実装（`useCircleImages`, `useImageCarousel`）
- Firebase Storage + Firestoreでの画像管理（最大10MB/枚）
- CSS `max-width: 100%` + `object-fit: contain`によるレスポンシブ対応
- 既存の`useTouch()`を活用したネイティブタッチジェスチャー実装

## Technical Context

**Language/Version**: TypeScript 5.x, JavaScript ES2022
**Primary Dependencies**:
- Nuxt 3 (SPAモード)
- Vue 3 Composition API
- Firebase SDK 10.x (Auth, Firestore, Storage)
- Tailwind CSS 3
- Heroicons (アイコンライブラリ)
- @vite-pwa/nuxt (PWA対応)

**Storage**: Firebase Firestore (NoSQL), Firebase Storage (画像ファイル)
**Testing**: Vitest (ユニットテスト), Vue Test Utils (コンポーネントテスト)
**Target Platform**: Webブラウザ（モバイルファースト: iOS Safari, Android Chrome、デスクトップ: Chrome, Firefox, Safari）
**Project Type**: Web (SPA) - フロントエンドのみ
**Performance Goals**:
- 画像表示開始: 3秒以内（4G回線）
- 画像アップロード: 10MB画像を20秒以内（4G回線）
- カルーセルスワイプ応答: 16ms以内（60fps維持）

**Constraints**:
- 画像最大サイズ: 10MB/枚
- お品書き最大枚数: 4枚（Twitter画像投稿上限に準拠）
- モバイル対応画面幅: 320px〜768px
- オフライン対応: PWA Service Workerでキャッシュ

**Scale/Scope**:
- 想定サークル数: 〜1000サークル/イベント
- 想定ユーザー数: 〜5000ユーザー
- 画像総ストレージ: 〜12GB（1000サークル × 平均2枚 × 平均6MB）

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ I. Composables-First Architecture

**適合状況**: ✅ **PASS**

- `useCircleImages()`を新規作成（画像アップロード・削除・順序変更）
- `useImageCarousel()`を新規作成（カルーセル表示ロジック）
- 既存の`useTouch()`コンポーザブルを再利用してタッチジェスチャー処理
- 外部ライブラリ（Swiper.js等）を使用せず、Vue Composition APIで実装

**判定**: 憲章準拠。Pinia/Vuexの使用なし、すべてComposition APIベース。

### ✅ II. Performance-First

**適合状況**: ✅ **PASS**

- 大量ブックマーク（1000+件）での画像表示に対応（最大4枚/サークル）
- 1枚目優先読み込み、2枚目以降は遅延読み込み（`loading="lazy"`）
- 画像カルーセルのスワイプ処理にdebounce適用（16ms）
- computedプロパティで画像リストをメモ化し、不要な再レンダリングを防止
- パフォーマンステスト実施（4枚画像読み込み時間 < 3秒）

**判定**: 憲章準拠。パフォーマンス最適化が設計段階から組み込まれている。

### ✅ III. Mobile-First

**適合状況**: ✅ **PASS**

- 全画像にレスポンシブCSS適用（`max-width: 100%`, `height: auto`）
- タッチスワイプジェスチャーでカルーセル操作（既存`useTouch()`活用）
- モバイル専用UI: ボタンでの画像順序変更（デスクトップはドラッグ&ドロップ）
- タッチエリア最小44px確保（ボタン、スワイプ判定エリア）
- モバイルデバイスでの描画安定性テスト実施

**判定**: 憲章準拠。モバイル体験が優先設計されている。

### ✅ IV. Progressive Enhancement (PWA)

**適合状況**: ✅ **PASS**

- Service WorkerでFirebase Storage画像をキャッシュ（CacheFirst戦略）
- オフライン時: キャッシュされた画像を表示、新規アップロードは接続復帰後に実行
- 画像読み込みエラー時のフォールバックUI実装
- 既存のPWA設定（@vite-pwa/nuxt）と統合

**判定**: 憲章準拠。PWAコンプライアンスを維持。

### ✅ V. Real-time Sync

**適合状況**: ✅ **PASS**

- Firestore `onSnapshot`で画像追加/削除をリアルタイム反映
- サーバータイムスタンプ使用（`uploadedAt: serverTimestamp()`）
- 画像アップロード失敗時のGracefulエラーハンドリング（ロールバック処理）
- イベント別データ分離（`events/{eventId}/circles/{circleId}/menuImages`）

**判定**: 憲章準拠。リアルタイム同期が適切に実装されている。

### ✅ VI. Test-Driven Development (NON-NEGOTIABLE)

**適合状況**: ✅ **PASS**

- **TDD実施計画**:
  1. テストファースト: `useCircleImages.test.ts`, `useImageCarousel.test.ts`, `MultipleImageUpload.test.ts`を先に作成
  2. Red-Green-Refactorサイクル適用
  3. テスト失敗確認後に実装開始
- **目標カバレッジ**: 80%+ (composables, utils)
- **テストタイプ**:
  - ユニットテスト: composablesの各関数
  - コンポーネントテスト: Vue Test Utilsでコンポーネント動作確認
  - パフォーマンステスト: 4枚画像読み込み時間測定

**判定**: 憲章準拠。TDD必須要件を満たす計画。

### ✅ VII. Logging & Observability

**適合状況**: ✅ **PASS**

- `useLogger('useCircleImages')`でアップロード処理をログ記録
- `useLogger('MultipleImageUpload')`でコンポーネント操作をログ記録
- ログレベル: `info`（成功）、`warn`（バリデーションエラー）、`error`（致命的エラー）
- 環境変数`NUXT_PUBLIC_LOG_LEVEL`で本番ではerrorのみ出力
- `console.log()`の直接使用なし

**判定**: 憲章準拠。構造化ログシステムを使用。

### ✅ VIII. Documentation-First

**適合状況**: ✅ **PASS**

- 全関数にJSDocコメント記載
- 複雑なロジック（順序変更アルゴリズム、ロールバック処理）に説明コメント
- MenuImage型に使用例コメント追加
- `quickstart.md`で開発者向け手順を詳細に記載

**判定**: 憲章準拠。ドキュメントファーストの原則を守っている。

### 🟢 総合判定: **ALL GATES PASSED**

すべての憲章原則に準拠しています。Phase 0 研究開始を承認します。

---

**Phase 1 設計後の再チェック**: ✅ **PASS** (全ゲート再確認済み)

## Project Structure

### Documentation (this feature)

```text
specs/001-improve-circle-image-display/
├── plan.md              # This file (/speckit.plan command output)
├── spec.md              # 機能仕様書
├── research.md          # Phase 0 output (技術調査)
├── data-model.md        # Phase 1 output (データモデル設計)
├── quickstart.md        # Phase 1 output (開発ガイド)
├── contracts/           # Phase 1 output
│   └── firebase-operations.md  # Firebase操作契約
└── checklists/
    └── requirements.md  # 仕様品質チェックリスト
```

### Source Code (repository root)

**このプロジェクトはNuxt 3 SPA（フロントエンドのみ）のため、Option 2の構造を採用**

```text
# Nuxt 3 SPA Structure
components/
├── ui/
│   ├── MultipleImageUpload.vue  # 新規: 複数画像アップロードコンポーネント
│   ├── ImageCarousel.vue        # 新規: 画像カルーセル表示コンポーネント
│   └── ImageUpload.vue          # 既存: 単一画像アップロード（サークルカットで継続使用）
└── circle/
    └── ... (既存のサークル関連コンポーネント)

composables/
├── useCircleImages.ts    # 新規: 複数画像管理コンポーザブル
├── useImageCarousel.ts   # 新規: カルーセルロジックコンポーザブル
├── useTouch.ts           # 既存: タッチジェスチャー処理（再利用）
└── useCircles.ts         # 既存: サークル管理（updateメソッド拡張）

pages/
└── circles/
    └── [id].vue          # 既存: サークル詳細ページ（更新対象）

types/
└── index.ts              # 既存: 型定義（MenuImage追加、Circle拡張）

utils/
└── imageUtils.ts         # 新規: 画像関連ユーティリティ関数

scripts/
├── migrateMenuImages.ts  # 新規: データ移行スクリプト
└── fixMenuImageOrder.ts  # 新規: 順序修復スクリプト

tests/
├── composables/
│   ├── useCircleImages.test.ts   # 新規: useCircleImagesのテスト
│   └── useImageCarousel.test.ts  # 新規: useImageCarouselのテスト
├── components/
│   ├── MultipleImageUpload.test.ts  # 新規: MultipleImageUploadのテスト
│   └── ImageCarousel.test.ts        # 新規: ImageCarouselのテスト
└── utils/
    └── imageUtils.test.ts           # 新規: imageUtilsのテスト

firestore.rules           # 既存: Firestoreセキュリティルール（更新）
storage.rules             # 既存: Storageセキュリティルール（更新）
```

**Structure Decision**:

Nuxt 3のSPAプロジェクト構造を採用しました。フロントエンドのみで、バックエンドロジックはFirebase SDKを通じてクライアント側で実行します。新規ファイルは以下の通り：

- **Components**: `MultipleImageUpload.vue`, `ImageCarousel.vue`（2ファイル）
- **Composables**: `useCircleImages.ts`, `useImageCarousel.ts`（2ファイル）
- **Utils**: `imageUtils.ts`（1ファイル）
- **Scripts**: `migrateMenuImages.ts`, `fixMenuImageOrder.ts`（2ファイル）
- **Tests**: 5テストファイル

既存ファイルの更新：
- `pages/circles/[id].vue`: お品書き表示セクションを`MultipleImageUpload`に置き換え
- `types/index.ts`: `MenuImage`型追加、`Circle`型拡張
- `firestore.rules`, `storage.rules`: バリデーション更新

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**該当なし**: すべての憲章チェックゲートをパスしているため、複雑性の正当化は不要です。

---

## Phase 0 Research Summary

**完了日**: 2026-01-24
**成果物**: `research.md`

### 主要な技術決定

1. **複数画像UI**: Swiper.js等の外部ライブラリを使用せず、ネイティブVue実装
   - 理由: バンドルサイズ最小化、憲章「Composables-First」準拠
   - 実装: `useImageCarousel()`コンポーザブル + CSS Flexbox

2. **レスポンシブ画像**: Firebase Extensionsを使用せず、CSS対応
   - 理由: 追加コストゼロ、実装が簡単、後から段階的に最適化可能
   - 実装: `max-width: 100%`, `object-fit: contain`

3. **データ構造**: menuImagesを配列フィールドとしてFirestoreに保存
   - 理由: サブコレクション不要、クエリコスト削減、トランザクション処理が簡単
   - 最大4枚制限: Twitter画像投稿上限に準拠

4. **画像ファイルサイズ**: 10MB上限
   - 理由: 高解像度お品書き（A4スキャン等）に対応、Firebase Storage無料枠内

5. **順序変更UI**: ドラッグ&ドロップ（デスクトップ）+ ボタン（モバイル）
   - 理由: プラットフォームごとに最適なUX提供、アクセシビリティ向上
   - 実装: Vue Draggable Nextを使用せず、ネイティブ実装

## Phase 1 Design Summary

**完了日**: 2026-01-24
**成果物**: `data-model.md`, `contracts/firebase-operations.md`, `quickstart.md`

### データモデル

**MenuImage エンティティ** (新規):
- `id`: string (一意識別子)
- `url`: string (Firebase Storage URL)
- `order`: number (表示順序 0-3)
- `uploadedAt`: Date (サーバータイムスタンプ)
- `fileSize?`: number (バイト単位)
- `fileName?`: string (元のファイル名)

**Circle エンティティ** (拡張):
- `menuImageUrl?: string` → 削除
- `menuImages?: MenuImage[]` → 追加（最大4枚）

### API契約

**Firebase操作**:
1. **uploadMenuImages**: 複数画像アップロード（並列処理、ロールバック対応）
2. **deleteMenuImage**: 画像削除（Storage + Firestore、順序詰め直し）
3. **reorderMenuImages**: 順序変更（Firestoreのみ更新）

### セキュリティルール

**Firestore**:
- 読み取り: 全ユーザー
- 書き込み: 認証済み + 編集権限 + menuImagesバリデーション（最大4枚、必須フィールド）

**Firebase Storage**:
- 読み取り: 全ユーザー
- 書き込み: 認証済み + 10MB以下 + 画像形式のみ
- 削除: 認証済み + 編集権限

### データ移行

**移行スクリプト**: `scripts/migrateMenuImages.ts`
- 既存の`menuImageUrl: string`を`menuImages: MenuImage[]`に変換
- dry-runモード対応
- ロールバック機能実装

---

## Implementation Roadmap

### フェーズ分けと優先度

実装は仕様書のUser Storyに基づいて、P1 → P2 → P3の順で進めます。

#### Phase 2A: P1 - モバイルでサークル画像を正しく表示 🎯 MVP

**目標**: 画像の横スクロール・レイアウト崩れをゼロにする

**タスク**:
1. レスポンシブCSS実装（`max-width: 100%`, `object-fit: contain`）
2. サークルカット画像の表示修正
3. お品書き画像の表示修正（単一画像を先に修正）
4. モバイルデバイスでのテスト（320px, 375px, 768px）

**検証基準**:
- SC-001達成: モバイルユーザーの100%が横スクロールなしで閲覧可能

#### Phase 2B: P2 - 複数のお品書きを登録・閲覧

**目標**: 最大4枚のお品書き管理機能を実装

**タスク**:
1. MenuImage型定義追加
2. Circle型拡張（menuImages配列）
3. `useCircleImages()`コンポーザブル実装
4. `MultipleImageUpload.vue`コンポーネント実装
5. `ImageCarousel.vue`コンポーネント実装
6. サークル詳細ページ統合
7. データ移行スクリプト実装・実行

**検証基準**:
- SC-003達成: 最大4枚のお品書き登録・閲覧可能
- SC-004達成: お品書き閲覧タスク完了率90%以上

#### Phase 2C: P3 - 大きな画像を効率的に読み込み

**目標**: 3秒以内の画像表示開始

**タスク**:
1. 1枚目優先読み込み実装
2. 2枚目以降の遅延読み込み（`loading="lazy"`）
3. Service Workerキャッシュ設定
4. パフォーマンステスト実施

**検証基準**:
- SC-002達成: 3秒以内に最初の画像表示開始

### 推定作業量

| Phase | タスク数 | 見込み工数（概算） |
|-------|---------|-------------------|
| Phase 2A (P1) | 8タスク | - |
| Phase 2B (P2) | 15タスク | - |
| Phase 2C (P3) | 6タスク | - |
| **合計** | **29タスク** | - |

**注**: 時間見積もりは憲章に基づき提供しません。タスクの複雑度と依存関係のみを記載。

---

## Risk Assessment

### 技術リスク

| リスク | 影響度 | 対策 |
|--------|-------|------|
| 既存データ移行失敗 | 高 | dry-runモード実装、バックアップ必須、ロールバックスクリプト準備 |
| 大きな画像の表示パフォーマンス | 中 | 遅延読み込み、Service Workerキャッシュ、将来的にFirebase Extensions導入 |
| モバイルブラウザ互換性 | 中 | iOS Safari, Android Chromeでテスト、Polyfill追加（必要に応じて） |
| 画像アップロード中のエラーハンドリング | 中 | ロールバック処理実装、ユーザーへのエラーメッセージ表示 |

### 緩和策

1. **データ移行**:
   - 本番移行前にステージング環境でテスト
   - Firestoreエクスポートでバックアップ取得
   - 移行後24時間は監視体制を強化

2. **パフォーマンス**:
   - Chrome DevToolsでネットワークスロットリング (3G) でテスト
   - Lighthouseスコア80以上を目標

3. **互換性**:
   - BrowserStack等でクロスブラウザテスト
   - iOS 14+、Android 10+を最小対応バージョンとする

---

## Next Steps

✅ **Phase 0 - Research**: 完了
✅ **Phase 1 - Design**: 完了
⬜ **Phase 2 - Implementation**: `/speckit.tasks`コマンドで`tasks.md`を生成し、実装開始

**推奨される次のアクション**:

```bash
# タスク分解を実行
/speckit.tasks
```

これにより、Phase 2の詳細なタスクリスト（`tasks.md`）が生成され、実装の具体的な手順が明確になります。
