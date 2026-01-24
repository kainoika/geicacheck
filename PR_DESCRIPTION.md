# お品書き画像の複数枚アップロード機能を追加

## Summary
- サークル詳細ページでお品書き画像を最大4枚までアップロード可能に（Twitter準拠）
- 画像カルーセル表示で複数画像を閲覧可能（スワイプ・キーボード操作対応）
- モバイルファーストのレスポンシブデザインで全デバイスに対応

## 主な変更内容

### 新規コンポーネント
- `MultipleImageUpload.vue`: 複数画像アップロードUI（ドラッグ&ドロップ、順序変更、削除）
- `ImageCarousel.vue`: 画像カルーセル表示（スワイプ、キーボード、ナビゲーションボタン）

### Composables
- `useCircleImages.ts`: 画像アップロード・削除・順序変更の管理（失敗時自動ロールバック）
- `useImageCarousel.ts`: カルーセルのナビゲーション管理

### ユーティリティ
- `imageUtils.ts`: 画像バリデーション、ID生成、サイズフォーマット

### データ移行
- `migrateMenuImages.ts`: menuImageUrl → menuImages[] への移行スクリプト（dry-run対応）
- `rollbackMenuImages.ts`: ロールバックスクリプト

### テスト
- 全320テスト合格（新規88テスト追加）
- TDDアプローチで実装前にテスト作成
- カバレッジ: utils, composables, components

## Test plan
- [x] ビルドが成功することを確認（`npm run build`）
- [x] 全テストが合格することを確認（320/320テスト）
- [x] 画像アップロード機能の動作確認
  - [x] ドラッグ&ドロップでアップロード
  - [x] ファイル選択でアップロード
  - [x] 最大4枚制限の確認
  - [x] 10MB制限の確認
- [x] 画像カルーセルの動作確認
  - [x] ナビゲーションボタンで切り替え
  - [x] スワイプジェスチャーで切り替え（モバイル）
  - [x] キーボード操作で切り替え（矢印キー）
- [x] 画像管理機能の確認
  - [x] 順序変更（上へ・下へボタン）
  - [x] 画像削除
  - [x] エラーハンドリング
- [x] モバイル表示の確認
  - [x] レスポンシブレイアウト
  - [x] タッチ操作
- [x] データ移行スクリプトの確認
  - [x] Dry-runモードで影響確認
  - [ ] 本番実行（デプロイ後）

## デプロイ後の作業
```bash
# 既存データの移行（本番環境）
npm run migrate:menu-images:dry-run  # まず影響を確認
npm run migrate:menu-images          # 問題なければ本番実行
```

## 技術的な詳細

### 実装されたファイル
```
components/ui/
  ├─ ImageCarousel.vue (299行)
  └─ MultipleImageUpload.vue (470行)

composables/
  ├─ useCircleImages.ts (241行)
  └─ useImageCarousel.ts (111行)

utils/
  └─ imageUtils.ts (211行)

scripts/
  ├─ migrateMenuImages.ts (170行)
  └─ rollbackMenuImages.ts (170行)

tests/
  ├─ components/
  │   ├─ ImageCarousel.test.ts (261行)
  │   ├─ ImageUpload.test.ts (119行)
  │   └─ MultipleImageUpload.test.ts (210行)
  ├─ composables/
  │   ├─ useCircleImages.test.ts (329行)
  │   └─ useImageCarousel.test.ts (223行)
  └─ utils/
      └─ imageUtils.test.ts (448行)
```

### 変更統計
- **30ファイル変更**
- **6,381行追加**
- **28行削除**
- **テスト**: 320/320合格

🤖 Generated with [Claude Code](https://claude.com/claude-code)
