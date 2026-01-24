<!--
Sync Impact Report:
Version: 1.0.0 (initial constitution)
Modified Principles: N/A (new constitution)
Added Sections:
  - Core Principles (8 principles)
  - Development Workflow
  - Quality Standards
  - Governance
Removed Sections: N/A
Templates Status:
  - ✅ plan-template.md: Reviewed - constitution check section compatible
  - ✅ spec-template.md: Reviewed - aligns with user-centric and test-first principles
  - ✅ tasks-template.md: Reviewed - supports test-driven and incremental delivery
  - ⚠ commands/*.md: No command files found - will need review when created
Follow-up TODOs: None
-->

# geica check! Constitution

## Core Principles

### I. Composables-First Architecture

**Rule**: All state management MUST use Vue 3 Composition API composables instead of Pinia/Vuex. Each domain MUST have its own composable with unique `useState()` keys for persistent state across navigation.

**Rationale**: Composables provide better type safety, clearer dependency tracking, and more maintainable code structure for complex state management in this SPA application.

### II. Performance-First

**Rule**: ALL features MUST be optimized for large datasets (1000+ items). Performance tests MUST validate:
- Efficient rendering with debounced watchers
- Intelligent caching systems
- Minimal re-renders through computed properties
- Memory-efficient data structures

**Rationale**: The application handles large bookmark collections and circle data. Poor performance degrades user experience at doujinshi events where quick access is critical.

### III. Mobile-First

**Rule**: ALL interactive features MUST implement full touch gesture support including:
- Pinch-to-zoom functionality
- Pan operations
- Debounced touch events
- Larger touch areas (44px minimum)
- Stable rendering on mobile devices

**Rationale**: Primary usage occurs on mobile devices at physical events. Desktop support is secondary to mobile experience.

### IV. Progressive Enhancement (PWA)

**Rule**: Application MUST maintain PWA compliance:
- Service Worker with intelligent caching via Workbox
- Offline functionality for core features
- Install prompts for desktop and mobile
- Automatic update notifications
- Network state monitoring

**Rationale**: Event attendees need offline access to bookmarked circles when network connectivity is unreliable in crowded venues.

### V. Real-time Sync

**Rule**: Firebase integration MUST use:
- `onSnapshot` for real-time updates with proper cleanup
- Server timestamps for created/updated fields
- Graceful offline handling
- Event-specific data isolation to prevent cross-contamination

**Rationale**: Multi-device usage scenarios require immediate synchronization. Users may check bookmarks on desktop while preparing, then access on mobile at the event.

### VI. Test-Driven Development (NON-NEGOTIABLE)

**Rule**: TDD mandatory for new features:
- Tests written FIRST and MUST fail before implementation
- 80%+ coverage target for utilities and composables
- Performance tests for large datasets (1000+ items)
- Unit, integration, and contract tests where applicable
- Red-Green-Refactor cycle strictly enforced

**Rationale**: Complexity of interactive map system, touch gestures, and real-time sync requires rigorous testing to prevent regressions.

### VII. Logging & Observability

**Rule**: ALL code MUST use the centralized logging system:
- `useLogger('ComponentName')` in components/composables
- Appropriate log levels: `debug()`, `info()`, `warn()`, `error()`
- Environment-based log level control via `NUXT_PUBLIC_LOG_LEVEL`
- NO direct `console.log()` usage
- Automatic production log suppression

**Rationale**: Structured logging enables debugging in production without exposing sensitive information, and provides performance insights for optimization.

### VIII. Documentation-First

**Rule**: Before ANY code generation:
- Comprehensive function documentation MUST be written
- Business logic MUST have clear explanatory comments
- Complex type definitions MUST include usage examples
- Operating principles of generated code MUST be explainable

**Rationale**: Complex systems (interactive maps, PWA, permissions) require clear documentation to maintain and extend. Future developers must understand design decisions.

## Development Workflow

**Efficient Professional Workflow**: Explore-Plan-Code-Commit

1. **EXPLORE Phase** - Use AI agents to scan codebase, identify dependencies, generate dependency graphs
2. **PLAN Phase** - Generate multiple approaches, auto-create test scenarios, predict issues
3. **CODE Phase** - Generate boilerplate with documentation, auto-complete patterns, parallel implementation
4. **COMMIT Phase** - Conventional Commits in Japanese, logical commit separation

**Commit Requirements**:
- Follow Conventional Commits (例: `feat: 新機能`, `fix: バグ修正`, `docs: ドキュメント更新`)
- Commit messages in Japanese
- Commits separated by logical units (refactoring, features, tests as separate commits)

**File Creation Policy**:
- ALWAYS prefer editing existing files over creating new ones
- NEVER proactively create documentation files unless explicitly requested
- Replace dummy/sample data with real Firebase integration immediately

## Quality Standards

**Code Quality Requirements** (NON-NEGOTIABLE):
- TypeScript interfaces defined in `types/index.ts` FIRST before implementation
- All ESLint/formatting issues MUST be auto-fixed
- Heroicons ONLY for icons (no emojis unless explicitly requested)
- Security: MUST prevent XSS, SQL injection, command injection, OWASP Top 10 vulnerabilities
- Fix insecure code immediately upon discovery

**Testing Requirements**:
- Vitest for unit tests
- Vue Test Utils for component tests
- 80%+ coverage on utility functions and composables
- Test files: `*.test.ts` or `*.spec.ts` naming convention

**Architecture Patterns**:
- Feature-based component grouping (`circle/`, `bookmark/`, `layout/`, `ui/`, `map/`)
- PascalCase naming with descriptive names
- TypeScript interfaces for all props and emits
- Event-specific data isolation where applicable

**Firebase Security**:
- Proper Firestore security rules (`firestore.rules`)
- Admin users can read/write all user data for permission management
- Permission requests: `edit_permission_requests` collection
- Circle permissions: `circle_permissions` collection

## Governance

**Constitution Authority**: This constitution supersedes all other development practices. All code reviews, pull requests, and implementations MUST verify compliance with these principles.

**Amendment Procedure**:
1. Proposed changes MUST be documented with rationale
2. Impact analysis on existing codebase required
3. Template propagation plan required for dependent artifacts
4. Version increment following semantic versioning:
   - MAJOR: Backward incompatible principle removals/redefinitions
   - MINOR: New principles or materially expanded guidance
   - PATCH: Clarifications, wording fixes, non-semantic refinements

**Complexity Justification**: Any violation of principles (e.g., introducing non-composable state management, skipping tests, ignoring mobile optimization) MUST be explicitly justified in design documents with explanation of why simpler alternatives were rejected.

**Compliance Review**: All PRs MUST pass constitution compliance check before merge. Use `CLAUDE.md` for runtime development guidance aligned with this constitution.

**Guidance Files**:
- Primary development guidance: `/CLAUDE.md`
- Constitution (this file): `.specify/memory/constitution.md`
- Templates: `.specify/templates/*.md`

**Version**: 1.0.0 | **Ratified**: 2025-05-28 | **Last Amended**: 2026-01-24
