# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
npm install              # Install dependencies
npm run dev             # Start development server (http://localhost:3000)
npm run build           # Build for production
npm run generate        # Generate static site
npm run preview         # Preview production build locally
```

### Code Quality
```bash
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues automatically
npm run test            # Run tests with Vitest
npm run test:coverage   # Run tests with coverage report
```

### Firebase & Scripts
```bash
npm run test:firebase                # Test Firebase connection
npm run convert:circles              # Convert circle data format
npm run import:converted-circles     # Import converted circles to Firestore
npm run seed:events                  # Seed events data
npm run migrate:multi-event          # Run multi-event migration
```

## Architecture Overview

### Project Structure
This is a **Nuxt 3 SPA** application for managing circle information at Aikatsu doujinshi events, built with Vue 3 Composition API, TypeScript, Tailwind CSS, and Firebase.

### Key Architectural Patterns

**Composables-First State Management:**
- Uses Vue 3 composables instead of Pinia/Vuex for state management
- Each domain has its own composable (`useAuth`, `useCircles`, `useBookmarks`, `useEvents`, `useEditPermissions`, `useCirclePermissions`)
- State persists across navigation using `useState()` with unique keys
- Follow the established pattern: state variables, computed properties, methods, return readonly refs

**Firebase Integration:**
- Firebase services initialized in `plugins/firebase.client.ts`
- Services accessed via `const { $auth, $firestore, $storage } = useNuxtApp()`
- Real-time updates using Firestore's `onSnapshot` with proper cleanup
- Authentication via Twitter OAuth with user data stored in Firestore

**Multi-Event Architecture:**
- Events are first-class entities with unique IDs (`geika-1`, `geika-2`, etc.)
- Circles belong to specific events via `eventId` field
- Bookmarks are event-specific for data isolation
- Event switching functionality throughout the application

**Edit Permission System:**
- Twitter-based authentication for circle editing rights
- Auto-approval when Twitter screen names match circle's Twitter information
- Manual admin approval for unmatched requests
- Granular permissions (image upload, genre editing, etc.)
- Request tracking and management system with status workflow

**Component Organization:**
- Feature-based component grouping (`circle/`, `bookmark/`, `layout/`, `ui/`, `map/`)
- PascalCase naming convention with descriptive names
- TypeScript interfaces for all props and emits
- Reusable UI components in `ui/` directory
- Map-related components in `map/` directory (EventMap.vue)

### Data Layer

**Type Definitions:** All types are centralized in `types/index.ts`:
- Core entities: `User`, `Circle`, `Bookmark`, `Event`
- Search and filtering: `SearchFilters`, `SearchParams`, `SearchResult`
- Permissions: `EditPermissionRequest`, `CirclePermission`
- API responses: `ApiResponse<T>`, `ApiError`

**Firestore Collections:**
```
users/                     # User profiles and settings
  └── bookmarks/           # User bookmarks subcollection (event-specific)
events/                    # Event metadata and configuration
  └── circles/             # Circle information subcollection (event-specific)
edit_permission_requests/  # Permission requests for circle editing
circle_permissions/        # Granted permissions
```

**Authentication & Authorization:**
- Twitter OAuth via Firebase Auth with screen name extraction
- User types: `general`, `circle`, `admin`
- Circle editing requires permission approval system
- Auto-approval when applicant's Twitter screen name matches circle's Twitter information
- Admin dashboard at `/admin/edit-requests` for permission management
- Middleware protection for admin routes

### Development Guidelines

**When adding new features:**
1. Define TypeScript interfaces in `types/index.ts` first
2. Create or extend appropriate composables for data operations
3. Use established patterns for error handling and loading states
4. Follow the existing component structure and naming conventions
5. Ensure event-specific data isolation where applicable
6. Replace dummy/sample data with real Firebase integration immediately
7. Use proper authentication checks for admin-only features
8. For edit permission features, always check both user authentication and circle ownership/permissions
9. Use `useCirclePermissions()` for permission checks and `useEditPermissions()` for permission requests

**Firebase Operations:**
- Always use server timestamps for created/updated fields
- Handle offline scenarios gracefully
- Use proper Firestore security rules (defined in `firestore.rules`)
- Follow the established error handling patterns in composables
- Admin users can read/write all user data for permission management
- Permission requests use collection name `edit_permission_requests` (with underscores)
- Circle permissions use collection name `circle_permissions` (with underscores)

**State Management:**
- Use `useState()` with descriptive keys for persistent state
- Computed properties for derived data
- Return readonly refs from composables to prevent external mutation
- Handle loading states and errors consistently across composables

**Environment Configuration:**
- Firebase config stored in environment variables
- Runtime config accessed via `useRuntimeConfig().public`
- SPA mode configured for client-side rendering
- Environment-specific Firebase projects for dev/staging/prod
- Vite optimizations for estree-walker and global polyfills

### Testing
- Unit tests use Vitest
- Component tests use Vue Test Utils
- Run tests with `npm run test`
- Aim for 80%+ coverage on utility functions and composables

### Important Files
- `nuxt.config.ts` - Main configuration (SPA mode, Firebase env vars, component settings)
- `types/index.ts` - Complete type definitions including EditPermissionRequest and CirclePermission
- `composables/` - Core business logic and state management
  - `composables/useEditPermissions.ts` - Permission request management
  - `composables/useCirclePermissions.ts` - Permission checking and user permission cache
- `plugins/firebase.client.ts` - Firebase service initialization
- `firestore.rules` - Database security rules including edit permission rules
- `scripts/` - Data migration and management utilities
- `components/map/EventMap.vue` - Interactive map component for event layouts
- `components/ui/EditPermissionModal.vue` - Permission request modal with Twitter matching
- `pages/admin/edit-requests.vue` - Admin dashboard for permission management
- `middleware/admin.ts` - Admin route protection middleware

## Conversation Guidelines
- 常に日本語で会話する

## Other Guidelines

- Do not use emojis in the appearance of your application, always use Heroicons

## 定期的なドキュメントの更新
- README.mdとCLAUDE.mdも更新して、新しい機能とその使い方を記載してください。

## 理解困難なコードへの対処
- IMPORTANT: 複雑な型定義には必ず使用例とコメントを追加
- YOU MUST: 生成したコードの動作原理を説明できること

## 🎯 Development Philosophy

### Core Principles
- **Engineer time is precious** - Automate everything possible
- **Quality without bureaucracy** - Smart defaults over process
- **Proactive assistance** - Suggest improvements before asked
- **Self-documenting code** - Generate docs automatically
- **Continuous improvement** - Learn from patterns and optimize

### Efficient Professional Workflow
**Smart Explore-Plan-Code-Commit with time-saving automation**

#### 1. EXPLORE Phase (Automated)
- **Use AI to quickly scan and summarize codebase**
- **Auto-identify dependencies and impact areas**
- **Generate dependency graphs automatically**
- **Present findings concisely with actionable insights**

#### 2. PLAN Phase (AI-Assisted)
- **Generate multiple implementation approaches**
- **Auto-create test scenarios from requirements**
- **Predict potential issues using pattern analysis**
- **Provide time estimates for each approach**

#### 3. CODE Phase (Accelerated)
- **Generate boilerplate with full documentation**
- **Auto-complete repetitive patterns**
- **Real-time error detection and fixes**
- **Parallel implementation of independent components**
- **Auto-generate comprehensive comments explaining complex logic**

#### 4. COMMIT Phase (Automated)
- Conventional Commitsに従うこと
    - 例: `feat: 新しい機能を追加`、`fix: バグを修正`、`docs: ドキュメントの更新`
- コミットメッセージは日本語で書くこと
- コミットメッセージは簡潔に、何をしたかがわかるように書くこと
- コミットは論理的な単位で分ける
  - 変更をリファクタリング、機能追加、テスト追加の3つのコミットに分けて

### Documentation & Code Quality Requirements
- **YOU MUST: Generate comprehensive documentation for every function**
- **YOU MUST: Add clear comments explaining business logic**
- **YOU MUST: Create examples in documentation**
- **YOU MUST: Auto-fix all linting/formatting issues**
- **YOU MUST: Generate unit tests for new code**