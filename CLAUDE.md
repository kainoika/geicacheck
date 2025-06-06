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
npm run import:circles               # Import circles from CSV
npm run import:converted-circles     # Import converted circles
npm run seed:events                  # Seed events data
npm run migrate:multi-event          # Run multi-event migration
```

## Architecture Overview

### Project Structure
This is a **Nuxt 3 SPA** application for managing circle information at Aikatsu doujinshi events, built with Vue 3 Composition API, TypeScript, Tailwind CSS, and Firebase.

### Key Architectural Patterns

**Composables-First State Management:**
- Uses Vue 3 composables instead of Pinia/Vuex for state management
- Each domain has its own composable (`useAuth`, `useCircles`, `useBookmarks`, `useEvents`)
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

**Component Organization:**
- Feature-based component grouping (`circle/`, `bookmark/`, `layout/`, `ui/`)
- PascalCase naming convention with descriptive names
- TypeScript interfaces for all props and emits
- Reusable UI components in `ui/` directory

### Data Layer

**Type Definitions:** All types are centralized in `types/index.ts`:
- Core entities: `User`, `Circle`, `Bookmark`, `Event`
- Search and filtering: `SearchFilters`, `SearchParams`, `SearchResult`
- Permissions: `EditPermissionRequest`, `CirclePermission`
- API responses: `ApiResponse<T>`, `ApiError`

**Firestore Collections:**
```
users/               # User profiles and settings
circles/             # Circle information (event-specific)
bookmarks/           # User bookmarks (event-specific)
events/              # Event metadata and configuration
edit_permission_requests/  # Permission requests for circle editing
circle_permissions/  # Granted permissions
```

**Authentication & Authorization:**
- Twitter OAuth via Firebase Auth
- User types: `general`, `circle`, `admin`
- Circle editing requires permission approval system
- Auto-approval for matching Twitter IDs

### Development Guidelines

**When adding new features:**
1. Define TypeScript interfaces in `types/index.ts` first
2. Create or extend appropriate composables for data operations
3. Use established patterns for error handling and loading states
4. Follow the existing component structure and naming conventions
5. Ensure event-specific data isolation where applicable

**Firebase Operations:**
- Always use server timestamps for created/updated fields
- Handle offline scenarios gracefully
- Use proper Firestore security rules (defined in `firestore.rules`)
- Follow the established error handling patterns in composables

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

### Testing
- Unit tests use Vitest
- Component tests use Vue Test Utils
- Run tests with `npm run test`
- Aim for 80%+ coverage on utility functions and composables

### Important Files
- `nuxt.config.ts` - Main configuration (SPA mode, Firebase env vars)
- `types/index.ts` - Complete type definitions
- `composables/` - Core business logic and state management
- `plugins/firebase.client.ts` - Firebase service initialization
- `firestore.rules` - Database security rules
- `scripts/` - Data migration and management utilities

## Conversation Guidelines
- 常に日本語で会話する