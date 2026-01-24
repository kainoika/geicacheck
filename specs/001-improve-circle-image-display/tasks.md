# Tasks: サークル詳細ページ画像表示改善

**Input**: Design documents from `/specs/001-improve-circle-image-display/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/firebase-operations.md

**Tests**: TDD (Test-Driven Development) mandatory per Constitution VI. Tests are written FIRST and MUST fail before implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Nuxt 3 SPA**: `components/`, `composables/`, `pages/`, `types/`, `utils/`, `scripts/`, `tests/` at repository root
- Tests: `tests/composables/`, `tests/components/`, `tests/utils/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Verify development environment setup (Node.js 18+, npm, Firebase CLI)
- [ ] T002 Install project dependencies with `npm install`
- [ ] T003 [P] Configure environment variables in `.env` for Firebase
- [ ] T004 [P] Review existing codebase structure (components/, composables/, pages/)

**Checkpoint**: Development environment ready

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 Add MenuImage interface to `types/index.ts`
- [ ] T006 Extend Circle interface in `types/index.ts` (add menuImages?: MenuImage[], deprecate menuImageUrl?)
- [ ] T007 [P] Create `utils/imageUtils.ts` with image validation functions
- [ ] T008 [P] Update `firestore.rules` with menuImages validation (max 4 images)
- [ ] T009 [P] Update `storage.rules` with 10MB size limit and image format validation

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - モバイルでサークル画像を正しく表示 (Priority: P1) 🎯 MVP

**Goal**: 画像の横スクロール・レイアウト崩れをゼロにする

**Independent Test**: スマートフォン（320px, 375px, 768px）の各種画面サイズで、大きな画像を含むサークル詳細ページを開き、画像が画面からはみ出さず、横スクロールが発生しないことを確認。

### Tests for User Story 1 (TDD - Write FIRST) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T010 [P] [US1] Unit test for imageUtils validation functions in `tests/utils/imageUtils.test.ts`
- [ ] T011 [P] [US1] Component test for ImageUpload responsive behavior in `tests/components/ImageUpload.test.ts`

### Implementation for User Story 1

- [ ] T012 [US1] Update `components/ui/ImageUpload.vue` with responsive CSS (max-width: 100%, object-fit: contain)
- [ ] T013 [US1] Add responsive CSS for サークルカット display in `pages/circles/[id].vue`
- [ ] T014 [US1] Add responsive CSS for お品書き (single image) display in `pages/circles/[id].vue`
- [ ] T015 [US1] Add responsive CSS media queries for mobile (320px-768px) in `pages/circles/[id].vue`
- [ ] T016 [US1] Test on モバイルデバイス (Chrome DevTools: iPhone SE, iPhone 12 Pro, iPad)
- [ ] T017 [US1] Add logging for image load events using useLogger('CircleDetail')

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. SC-001 達成: モバイルユーザーの100%が横スクロールなしで閲覧可能。

---

## Phase 4: User Story 2 - 複数のお品書きを登録・閲覧 (Priority: P2)

**Goal**: 最大4枚のお品書き管理機能を実装

**Independent Test**: サークル出展者アカウントで編集画面から3枚のお品書きをアップロードし、イベント参加者アカウントでサークル詳細ページを開いて3枚すべてが閲覧できることを確認。スワイプやボタンで次の画像に移動できることを確認。

### Tests for User Story 2 (TDD - Write FIRST) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T018 [P] [US2] Unit test for useCircleImages composable in `tests/composables/useCircleImages.test.ts`
- [ ] T019 [P] [US2] Unit test for useImageCarousel composable in `tests/composables/useImageCarousel.test.ts`
- [ ] T020 [P] [US2] Component test for MultipleImageUpload in `tests/components/MultipleImageUpload.test.ts`
- [ ] T021 [P] [US2] Component test for ImageCarousel in `tests/components/ImageCarousel.test.ts`

### Implementation for User Story 2

- [ ] T022 [P] [US2] Implement useCircleImages composable in `composables/useCircleImages.ts` (uploadMenuImages, deleteMenuImage, reorderMenuImages)
- [ ] T023 [P] [US2] Implement useImageCarousel composable in `composables/useImageCarousel.ts` (currentIndex, next, prev, goTo)
- [ ] T024 [US2] Create MultipleImageUpload component in `components/ui/MultipleImageUpload.vue` (upload, delete, reorder UI)
- [ ] T025 [US2] Create ImageCarousel component in `components/ui/ImageCarousel.vue` (swipe, buttons, indicator)
- [ ] T026 [US2] Integrate MultipleImageUpload into `pages/circles/[id].vue` (replace single ImageUpload for menuImage)
- [ ] T027 [US2] Integrate ImageCarousel into `pages/circles/[id].vue` (display multiple menu images for viewers)
- [ ] T028 [US2] Add touch gesture support to ImageCarousel using existing `useTouch()` composable
- [ ] T029 [US2] Implement image order change UI (drag&drop for desktop, up/down buttons for mobile)
- [ ] T030 [US2] Add validation for max 4 images in MultipleImageUpload
- [ ] T031 [US2] Add validation for 10MB file size in MultipleImageUpload
- [ ] T032 [US2] Add validation for image formats (JPEG, PNG, GIF, WebP) in MultipleImageUpload
- [ ] T033 [US2] Implement error handling and rollback for failed uploads in useCircleImages
- [ ] T034 [US2] Add logging for upload/delete/reorder operations using useLogger('useCircleImages')
- [ ] T035 [US2] Test multiple image upload (1, 2, 3, 4 images)
- [ ] T036 [US2] Test image deletion and order adjustment
- [ ] T037 [US2] Test image reordering (drag&drop on desktop, buttons on mobile)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. SC-003 達成: 最大4枚のお品書き登録・閲覧可能。SC-004 達成: お品書き閲覧タスク完了率90%以上。

---

## Phase 5: User Story 3 - 大きな画像を効率的に読み込み (Priority: P3)

**Goal**: 3秒以内の画像表示開始

**Independent Test**: 10MBの高解像度お品書き画像を登録し、3G回線相当の低速ネットワーク環境（Chrome DevTools Network Throttling）でサークル詳細ページを開き、3秒以内に画像が表示開始されることを確認。

### Tests for User Story 3 (TDD - Write FIRST) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T038 [P] [US3] Performance test for image load time in `tests/composables/useCircleImages.test.ts`
- [ ] T039 [P] [US3] Integration test for lazy loading in `tests/components/ImageCarousel.test.ts`

### Implementation for User Story 3

- [ ] T040 [US3] Implement priority loading (1st image eager, 2nd+ lazy) in ImageCarousel.vue (loading="lazy" attribute)
- [ ] T041 [US3] Add image preloading for 1st menu image in `pages/circles/[id].vue`
- [ ] T042 [US3] Configure Service Worker caching for Firebase Storage images in `nuxt.config.ts` (pwa.workbox.runtimeCaching)
- [ ] T043 [US3] Add loading skeleton/placeholder for images in ImageCarousel.vue
- [ ] T044 [US3] Add error handling and retry UI for image load failures in ImageCarousel.vue
- [ ] T045 [US3] Test with 10MB image on 3G network (Chrome DevTools Network Throttling)
- [ ] T046 [US3] Measure and validate 3-second load time with Chrome DevTools Performance tab
- [ ] T047 [US3] Add logging for image load performance metrics using useLogger('ImageCarousel')

**Checkpoint**: All user stories should now be independently functional. SC-002 達成: 3秒以内に最初の画像表示開始。

---

## Phase 6: Data Migration

**Purpose**: Migrate existing menuImageUrl data to menuImages array

- [ ] T048 Create data migration script in `scripts/migrateMenuImages.ts`
- [ ] T049 Implement dry-run mode in migrateMenuImages.ts
- [ ] T050 Implement rollback script in `scripts/rollbackMenuImages.ts`
- [ ] T051 Test migration script with dry-run on development/staging Firestore
- [ ] T052 Backup production Firestore data (gcloud firestore export)
- [ ] T053 Run migration script on production Firestore
- [ ] T054 Verify migration results in Firebase Console
- [ ] T055 Create order fix script in `scripts/fixMenuImageOrder.ts` (for edge cases)

**Checkpoint**: All existing data migrated to new menuImages structure

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T056 [P] Add JSDoc comments to all functions in useCircleImages.ts
- [ ] T057 [P] Add JSDoc comments to all functions in useImageCarousel.ts
- [ ] T058 [P] Add usage examples to MenuImage type in types/index.ts
- [ ] T059 [P] Run ESLint and fix all issues (`npm run lint:fix`)
- [ ] T060 [P] Run all tests and ensure 80%+ coverage (`npm run test:coverage`)
- [ ] T061 Deploy Firestore rules (`firebase deploy --only firestore:rules`)
- [ ] T062 Deploy Storage rules (`firebase deploy --only storage`)
- [ ] T063 Update README.md with new features (multiple menu images, responsive display)
- [ ] T064 Update CLAUDE.md with implementation details if needed
- [ ] T065 Run quickstart.md validation (manual walkthrough)
- [ ] T066 Cross-browser testing (iOS Safari, Android Chrome, Desktop Chrome/Firefox/Safari)
- [ ] T067 Lighthouse audit (target score 80+)
- [ ] T068 Security audit (XSS, file upload vulnerabilities)

**Checkpoint**: Feature complete, documented, tested, and ready for deployment

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User Story 1 (P1): Can start after Foundational
  - User Story 2 (P2): Can start after Foundational (independent of US1)
  - User Story 3 (P3): Depends on US2 completion (needs ImageCarousel component)
- **Data Migration (Phase 6)**: Depends on US2 completion (needs menuImages structure)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent of US1 (but builds on US1's responsive CSS)
- **User Story 3 (P3)**: Depends on User Story 2 (needs ImageCarousel component from US2)

### Within Each User Story

- Tests (TDD) MUST be written and FAIL before implementation
- Composables before components
- Components before page integration
- Core implementation before edge cases
- Story complete before moving to next priority

### Parallel Opportunities

**Phase 2 (Foundational)**:
```bash
# Can run in parallel:
T007 (utils/imageUtils.ts)
T008 (firestore.rules)
T009 (storage.rules)
```

**Phase 3 (User Story 1) - Tests**:
```bash
# Can run in parallel:
T010 (imageUtils.test.ts)
T011 (ImageUpload.test.ts)
```

**Phase 4 (User Story 2) - Tests**:
```bash
# Can run in parallel:
T018 (useCircleImages.test.ts)
T019 (useImageCarousel.test.ts)
T020 (MultipleImageUpload.test.ts)
T021 (ImageCarousel.test.ts)
```

**Phase 4 (User Story 2) - Composables**:
```bash
# Can run in parallel:
T022 (useCircleImages.ts)
T023 (useImageCarousel.ts)
```

**Phase 5 (User Story 3) - Tests**:
```bash
# Can run in parallel:
T038 (performance test)
T039 (lazy loading test)
```

**Phase 7 (Polish) - Documentation**:
```bash
# Can run in parallel:
T056 (JSDoc useCircleImages)
T057 (JSDoc useImageCarousel)
T058 (JSDoc MenuImage type)
T059 (ESLint)
T060 (Tests + coverage)
```

### User Story Independence

- **US1 → MVP deployment possible**: Responsive display alone provides immediate value
- **US1 + US2 → Full feature**: Multiple menu images + responsive display
- **US1 + US2 + US3 → Optimized**: Performance optimization for large images

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T009) **CRITICAL - blocks all stories**
3. Complete Phase 3: User Story 1 (T010-T017)
4. **STOP and VALIDATE**: Test User Story 1 independently on mobile devices
5. Deploy/demo if ready (responsive display is immediately valuable)

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Run Data Migration → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Polish → Final deployment
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T009)
2. Once Foundational is done:
   - **Developer A**: User Story 1 (T010-T017) → MVP
   - **Developer B**: User Story 2 (T018-T037) → Wait for Foundation
   - **Developer C**: User Story 3 (T038-T047) → Wait for US2
3. Stories complete and integrate independently

### Single Developer Strategy

1. Complete Setup + Foundational (T001-T009)
2. Complete User Story 1 (T010-T017) → **Deploy MVP**
3. Complete User Story 2 (T018-T037) → Deploy
4. Run Data Migration (T048-T055)
5. Complete User Story 3 (T038-T047) → Deploy
6. Polish (T056-T068) → Final deployment

---

## Parallel Examples

### User Story 1 - Tests (Run Together)

```bash
# Launch all tests for User Story 1 together:
T010: Unit test for imageUtils in tests/utils/imageUtils.test.ts
T011: Component test for ImageUpload in tests/components/ImageUpload.test.ts
```

### User Story 2 - Tests (Run Together)

```bash
# Launch all tests for User Story 2 together:
T018: Unit test for useCircleImages in tests/composables/useCircleImages.test.ts
T019: Unit test for useImageCarousel in tests/composables/useImageCarousel.test.ts
T020: Component test for MultipleImageUpload in tests/components/MultipleImageUpload.test.ts
T021: Component test for ImageCarousel in tests/components/ImageCarousel.test.ts
```

### User Story 2 - Composables (Run Together)

```bash
# Launch all composables for User Story 2 together:
T022: Implement useCircleImages in composables/useCircleImages.ts
T023: Implement useImageCarousel in composables/useImageCarousel.ts
```

---

## Notes

- **[P] tasks**: Different files, no dependencies - can run in parallel
- **[Story] label**: Maps task to specific user story for traceability
- **Each user story**: Independently completable and testable
- **TDD mandatory**: Write tests FIRST, ensure they FAIL, then implement
- **Commit strategy**: Commit after each task or logical group
- **Checkpoints**: Stop at any checkpoint to validate story independently
- **Avoid**: Vague tasks, same file conflicts, cross-story dependencies that break independence

---

## Test Coverage Goals

**Per Constitution VI (Test-Driven Development)**:

- **Target**: 80%+ coverage on composables and utils
- **Files requiring 80%+ coverage**:
  - `composables/useCircleImages.ts`
  - `composables/useImageCarousel.ts`
  - `utils/imageUtils.ts`
- **Component tests**: All new components (MultipleImageUpload, ImageCarousel)
- **Performance tests**: Image load time validation (3-second target)

Run coverage: `npm run test:coverage`

---

## Success Validation

After completing all phases, validate against Success Criteria:

- **SC-001**: モバイルユーザー（320px〜768px）の100%が横スクロールなしで閲覧可能 → User Story 1
- **SC-002**: 3秒以内に最初の画像表示開始 → User Story 3
- **SC-003**: 最大4枚のお品書き登録・閲覧可能 → User Story 2
- **SC-004**: お品書き閲覧タスク完了率90%以上 → User Story 2
- **SC-005**: 画像表示に関する問い合わせ50%削減 → All Stories Combined

**Validation Method**:
1. Manual testing on real mobile devices (iPhone, Android)
2. Chrome DevTools Network Throttling (3G simulation)
3. User feedback collection (before/after comparison)
4. Firebase Analytics (error rate monitoring)
