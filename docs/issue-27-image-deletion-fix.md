# Issue #27: 画像削除処理のCloud Functions移行計画書

## 問題の概要

### 現在発生している問題
サークルカット・お品書きの画像を削除する際、以下の不整合が発生している：

1. **Firebase Storage**: 画像ファイルは削除される ✅
2. **Firestore**: サークルデータの画像パス情報が残存する ❌

この結果、「サークル詳細にパス情報はあるのに画像は無い」という状態が生まれ、画像表示がバグる。

### 不具合が発生する操作フロー
1. サークル詳細画面で画像をアップロード
2. 画像削除ボタンをクリック
3. `ImageUpload.vue` の `removeImage()` が実行される
4. Firebase Storageからファイルが削除される
5. **Firestoreのパス情報は残存**（⚠️ 問題箇所）

## 現在の実装状況分析

### クライアントサイドの現在の処理

#### `components/ui/ImageUpload.vue`
```typescript
const removeImage = async () => {
  if (!props.modelValue) return
  try {
    // Storageから画像を削除
    const imageRef = storageRef($storage, props.modelValue)
    await deleteObject(imageRef)

    emit('update:modelValue', undefined) // 🔥 問題: 親コンポーネントが適切に処理していない
  } catch (err) {
    console.error('画像削除エラー:', err)
    emit('error', '画像の削除に失敗しました')
  }
}
```

#### `pages/circles/[id].vue`
```typescript
const updateCircleCut = async (imageUrl: string | undefined) => {
  if (!circle.value) return
  saving.value = true
  try {
    await updateCircle(circle.value.id, currentEvent.value!.id, {
      circleCutImageUrl: imageUrl // 🔥 undefined がFirestoreに書き込まれるべきだが呼ばれていない
    })
    circle.value.circleCutImageUrl = imageUrl
  } catch (err) {
    console.error('サークルカット更新エラー:', err)
    uploadError.value = 'サークルカットの更新に失敗しました'
  } finally {
    saving.value = false
  }
}
```

#### `composables/useCircles.ts`
```typescript
const updateCircle = async (circleId: string, eventId: string, updates: Partial<Circle>) => {
  // Firestoreへの更新処理 - 正常動作
  const circleRef = doc($firestore, "events", eventId, "circles", circleId);
  const updateData = {
    ...updates,
    updatedAt: new Date()
  };
  await updateDoc(circleRef, updateData);
};
```

### 根本原因
`ImageUpload.vue` から `emit('update:modelValue', undefined)` されても、親の `updateCircleCut/updateMenuImage` 関数が呼ばれていない。

## 解決策

### Phase 1: クライアントサイド修正（即時対応）
現在の問題を即座に解決するため、クライアントサイドで修正：

1. **ImageUpload.vueの修正**
   ```typescript
   const removeImage = async () => {
     if (!props.modelValue) return
     try {
       // Storageから画像を削除
       const imageRef = storageRef($storage, props.modelValue)
       await deleteObject(imageRef)

       // 🔥 修正: 親コンポーネントに削除完了を通知
       emit('update:modelValue', undefined)
       emit('image-deleted') // 新しいイベント追加
     } catch (err) {
       console.error('画像削除エラー:', err)
       emit('error', '画像の削除に失敗しました')
     }
   }
   ```

2. **pages/circles/[id].vue の修正**
   ```vue
   <ImageUpload
     v-model="circle.circleCutImageUrl"
     label="サークルカット画像"
     :path="`circle-images/${currentEvent?.id}/${circle.id}/circle-cut`"
     :can-edit="permissions.canUploadImages"
     @update:modelValue="updateCircleCut"
     @image-deleted="onImageDeleted"
     @error="uploadError = $event"
   />
   ```

   ```typescript
   const onImageDeleted = async () => {
     // 明示的にFirestoreを更新
     await updateCircleCut(undefined)
   }
   ```

### Phase 2: Cloud Functions移行（長期対応）

#### 新しいCloud Function: `onImageDelete`

```typescript
// functions/src/imageManagement.ts
export const onImageDelete = functions
  .region("asia-northeast1")
  .storage
  .object()
  .onDelete(async (object) => {
    const filePath = object.name; // e.g., "circle-images/geica-32/circle123/circle-cut/image.jpg"

    if (!filePath?.startsWith('circle-images/')) {
      return; // サークル画像以外は処理しない
    }

    try {
      const pathParts = filePath.split('/');
      // ["circle-images", "geica-32", "circle123", "circle-cut", "image.jpg"]

      if (pathParts.length < 4) return;

      const eventId = pathParts[1]; // "geica-32"
      const circleId = pathParts[2]; // "circle123"
      const imageType = pathParts[3]; // "circle-cut" or "menu"

      const db = admin.firestore();
      const circleRef = db.doc(`events/${eventId}/circles/${circleId}`);

      // Firestoreのパス情報をクリア
      const updateData: any = {
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      if (imageType === 'circle-cut') {
        updateData.circleCutImageUrl = null;
      } else if (imageType === 'menu') {
        updateData.menuImageUrl = null;
      }

      await circleRef.update(updateData);

      console.log(`✅ Cleaned up image path for ${circleId} (${imageType})`);
    } catch (error) {
      console.error('❌ Error cleaning up image path:', error);
    }
  });
```

## 実装ロードマップ

### Step 1: 緊急修正（即時実装）
- [x] `ImageUpload.vue` に `image-deleted` イベント追加
- [x] `pages/circles/[id].vue` でイベントハンドリング追加
- [x] テスト実行で動作確認

### Step 2: Cloud Functions 実装
- [ ] `functions/src/imageManagement.ts` 作成
- [ ] Storage削除トリガーの実装
- [ ] パス解析とFirestore更新処理
- [ ] デプロイとテスト

### Step 3: クライアントサイド簡素化
- [ ] Cloud Functionsが安定稼働後、クライアント側の処理を簡素化
- [ ] Firestoreの手動更新処理を削除

## 期待される効果

1. **即時効果**: Phase 1により不具合が解消
2. **長期効果**: Cloud Functionsによる自動化で運用負荷軽減
3. **一貫性**: Storage削除時に必ずFirestore更新が実行される
4. **メンテナンス性**: サーバーサイドでの一元管理

## リスク評価

### Phase 1のリスク
- **低**: クライアントサイド修正のみ、既存機能への影響最小限

### Phase 2のリスク
- **中**: Cloud Functions新規追加、デプロイ・設定が必要
- **対策**: 十分なテスト実施とロールバック計画

## テスト計画

### テストケース
1. **サークルカット削除**: 画像削除後にFirestoreパスが削除される
2. **お品書き削除**: 画像削除後にFirestoreパスが削除される
3. **権限確認**: 編集権限のないユーザーは削除不可
4. **エラーハンドリング**: Storage削除失敗時の適切なエラー表示

### 確認項目
- [ ] 画像削除後、Firestore内のパス情報が `null` または削除される
- [ ] UI上で「画像なし」状態が正しく表示される
- [ ] 画像の再アップロードが正常動作する

## 関連ファイル

- `components/ui/ImageUpload.vue` - 画像削除UI
- `pages/circles/[id].vue` - サークル詳細画面
- `composables/useCircles.ts` - サークル更新処理
- `functions/src/index.ts` - Cloud Functions (新規追加予定)
- `storage.rules` - Storage セキュリティルール
- `firestore.rules` - Firestore セキュリティルール

---

**作成日**: 2025-01-22
**対応Issue**: [#27](https://github.com/kainoika/geika-check/issues/27)
**優先度**: High
**予想工数**: Phase 1 (0.5日) + Phase 2 (1日)