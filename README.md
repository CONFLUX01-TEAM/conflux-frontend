# AI Recruitment Platform — Frontend Architecture

> **Version:** 1.0 — MVP + Phase 2 Ready
> **Scope:** Frontend only — React / TypeScript / Vite
> **Audience:** Frontend engineers, tech leads, architects
> **Status:** Approved for implementation

---

## Purpose

This document defines the scalable frontend architecture for the AI Recruitment Platform. It covers layer responsibilities, technology choices, file organisation, state management strategy, performance patterns, and the decision rationale behind each — with Phase 2 feature additions accounted for from the start.

---

## Core Principles

- **Pages are thin orchestrators** — they fetch data and compose layouts; all logic lives in features or services.
- **Features own their domain** — each domain folder is self-contained with its own components, hooks, and types.
- **Shared means 2+ features use it** — nothing enters `shared/` because it might be reused; only because it already is.
- **Services are the only door to the API** — no `fetch()` or `axios` calls outside the `services/` layer.
- **Grow by addition, not refactoring** — Phase 2 modules slot in without touching existing code.

---

## Technology Stack

| Technology | Category | Rationale |
|---|---|---|
| React 18 + TypeScript | UI framework + type safety | Concurrent features, strict typing throughout |
| Vite | Build tool | Sub-second HMR, native ESM, optimised production bundles |
| React Router v6 | Client-side routing | Nested routes, lazy loading, route-based code splitting |
| TanStack Query v5 | Server state | Caching, background refetch, optimistic updates, stale-while-revalidate |
| Zustand | Client state | Lightweight, minimal boilerplate, devtools, immer middleware |
| Axios | HTTP client | Interceptors for auth, token refresh, global error handling |
| TanStack Virtual | Virtual scrolling | Render 1,000+ candidate rows at 60fps |
| Tailwind CSS | Styling | Utility-first, consistent design tokens, dark mode ready |
| Vitest + Testing Library | Testing | Unit and integration tests, co-located with features |
| Playwright | E2E testing | Critical user flows: assessment submission, scoring, shortlisting |

---

## Architecture Layers

Dependencies flow **downward only** — upper layers import from lower ones; lower layers never import from upper ones.

| Layer | Technology / Pattern | Key Responsibilities |
|---|---|---|
| 1. Entry point | `app.tsx` + Vite | Bootstrap, providers, global error boundary, Suspense root |
| 2. Router | React Router v6 | Route definitions, lazy loading, role-based guards, redirect logic |
| 3. Pages | One file per route | Compose layout + feature components; minimal logic |
| 4. Feature modules | `features/<domain>/` | All domain logic: components, hooks, local state, types |
| 5. Shared UI | `shared/ui/` | Reusable primitives used across 2+ features |
| 6. State — server | TanStack Query | API data, caching, optimistic updates, background sync |
| 6. State — client | Zustand | Auth session, exam state, notification queue, UI prefs |
| 7. Services | `services/` | All API calls; one file per domain; apiClient as shared base |
| 8. Cross-cutting | `lib/` + `hooks/` | Formatters, validators, feature flags, analytics, logger |
| 9. Performance | Build + runtime | Code splitting, lazy images, virtual scroll, prefetching |

---

## File Organisation

### Top-level `src/` structure

```
src/
  app.tsx                  # Root provider tree, Suspense, ErrorBoundary
  main.tsx                 # Vite entry — mounts app
  router/                  # Route definitions and guards
  pages/                   # One file per route — thin orchestrators
  features/                # Domain feature modules
  shared/                  # Components used across 2+ features
  services/                # All HTTP calls — no fetch() elsewhere
  store/                   # Zustand client state stores
  hooks/                   # Shared hooks (2+ features)
  lib/                     # Formatters, validators, constants, flags
  types/                   # Global / shared TypeScript types
```

### Feature module structure

Every feature is a self-contained directory. The `index.ts` barrel defines the public API — nothing outside imports from internal paths.

```
features/
  assessment-gen/          # AI question generation (employer)
    components/
      QuestionEditor.tsx
      AssessmentConfig.tsx
      TemplateSelector.tsx
      GenerateButton.tsx
    hooks/
      useGenerateAssessment.ts
      useAssessmentTemplates.ts
    types.ts
    index.ts

  scoring/                 # AI scoring + explainability
    components/
      ScoreCard.tsx
      SkillBreakdown.tsx
      ExplainabilityLayer.tsx
      PassFailBadge.tsx
    hooks/
      useScoreData.ts
    types.ts
    index.ts

  pipeline/                # Candidate Kanban pipeline (employer)
    components/
      KanbanBoard.tsx
      CandidateCard.tsx
      StatusBadge.tsx
      ShortlistButton.tsx
    hooks/
      usePipeline.ts
      useCandidateStatus.ts
    types.ts
    index.ts

  exam-runner/             # Candidate-facing timed assessment
    components/
      QuestionDisplay.tsx
      TimerWidget.tsx
      AnswerInput.tsx
      AutoSaveIndicator.tsx
      ProgressTracker.tsx
    hooks/
      useExamSession.ts
      useAutoSave.ts
      useCountdownTimer.ts
    types.ts
    index.ts

  auth/                    # Login, register, password reset
    components/
      LoginForm.tsx
      RegisterForm.tsx
      ResetForm.tsx
    hooks/
      useAuthForm.ts
    types.ts
    index.ts
```

### Pages

```
pages/
  employer/
    DashboardPage.tsx        # Role overview, recent activity
    RolesPage.tsx            # List and create hiring roles
    AssessmentPage.tsx       # Generate + configure assessments
    CandidateResultsPage.tsx # Ranked results + Kanban pipeline
  assessment/
    AssessmentPage.tsx       # Candidate timed exam (token-gated)
    ResultsPage.tsx          # Candidate score breakdown
  auth/
    LoginPage.tsx
    RegisterPage.tsx
    ResetPage.tsx
```

### Shared UI

```
shared/ui/
  Button.tsx        DataTable.tsx      Modal.tsx
  Input.tsx         SkeletonUI.tsx     Tooltip.tsx
  PageLayout.tsx    SidebarNav.tsx     ErrorBoundary.tsx
  ProgressBar.tsx   EmptyState.tsx     Notification.tsx
  Badge.tsx         Spinner.tsx        Avatar.tsx
```

### Services layer

```
services/
  apiClient.ts       # Axios instance, auth interceptors, refresh, errors
  assessmentSvc.ts   # generate(), submit(), getScore(), getTemplates()
  candidateSvc.ts    # list(), updateStatus(), shortlist(), notify()
  authSvc.ts         # login(), register(), refreshToken(), resetPassword()
  roleSvc.ts         # createRole(), getRoles(), updateRole()
```

### State stores

```
store/
  authStore.ts          # User identity, token, permissions — persisted
  examSessionStore.ts   # Current question index, answers, timer state
  notificationStore.ts  # Toast queue
  uiPrefsStore.ts       # Sidebar collapse, table density, theme pref
```

### Lib (cross-cutting)

```
lib/
  formatters.ts     # Date, score, currency, duration formatting
  validators.ts     # Form validation schemas (Zod)
  constants.ts      # API base URL, score thresholds, limits
  featureFlags.ts   # Flag evaluation — gates Phase 2 features
  analytics.ts      # Event tracking wrapper
  logger.ts         # Structured logging (dev: console, prod: Sentry)
```

---

## State Management Strategy

### Server state — TanStack Query

- Every piece of API data is owned by TanStack Query, not Zustand.
- Queries are co-located in feature hooks: `useRolesQuery` in `features/pipeline/`, `useScoresQuery` in `features/scoring/`.
- Stale-while-revalidate keeps the employer dashboard snappy — cached data renders instantly while a background refetch runs.
- Optimistic updates for status changes: the Kanban card moves immediately on drag; the mutation confirms or rolls back silently.
- Retry logic with exponential backoff is configured globally on the `QueryClient`.

### Client state — Zustand

- **`authStore`** — JWT token, user ID, role, permissions. Persisted to `localStorage`. Cleared on logout.
- **`examSessionStore`** — current question index, all answers (buffered for auto-save), timer elapsed, submission status. Never persisted.
- **`notificationStore`** — a queue of toast messages drained by a single `Notification` component at the root.
- **`uiPrefsStore`** — sidebar state, table density preference. Persisted to `localStorage`.

### Decision rule

> If the data comes from or goes to the API → **TanStack Query**.
> If the data is purely a UI concern or session-scoped browser state → **Zustand**.
> When in doubt, start with TanStack Query.

---

## Routing & Route Guards

| Route Group | Routes |
|---|---|
| Public — no auth | `/assessment/:token` · Candidate exam and results |
| Auth — pre-auth only | `/login` · `/register` · `/reset-password` |
| Employer — auth + employer role | `/dashboard` · `/roles` · `/roles/:id/assessment` · `/results/:roleId` |
| Future: Admin | `/admin/*` — guarded by admin role flag |
| Future: Candidate prep | `/prep/*` — guarded by feature flag |

Route guards live in `router/guards.tsx`. All page components are lazy-loaded via `React.lazy()` — a candidate accessing `/assessment/:token` never downloads the employer dashboard bundle.

---

## Performance Strategies

### Load time

- Route-level code splitting — every page is a separate chunk.
- Prefetch on hover — score detail query prefetches silently when hovering a candidate card.
- Skeleton UIs render immediately on every data-fetching page — perceived load is zero.
- Critical CSS inlined by Vite; fonts loaded with `font-display: swap`.

### Runtime performance

- Virtual scrolling via TanStack Virtual on the candidate results list — 1,000 rows render in <5ms.
- Memoisation with `React.memo` and `useMemo` applied at the feature level where profiling shows re-render cost.
- The exam timer runs in a Zustand store updated by `requestAnimationFrame` — no re-renders during countdown.
- Auto-save debounced to 3 seconds with fire-and-forget mutations and local optimistic state.

### Resilience

- `ErrorBoundary` wraps each route segment — one broken feature cannot crash the app.
- Exam answers are written to `localStorage` on every auto-save and flushed to the API on reconnect.
- Service worker (Workbox) caches static assets — the app shell loads offline.

---

## Phase 2 Scaling — Growth by Addition

| Phase 2 Feature | Where it lives | Integration approach |
|---|---|---|
| Candidate prep platform | `features/prep-platform/` | Gated by `featureFlags.ts` — no existing code changes |
| Video interviews | `features/video-interviews/` | New route group + feature module; WebRTC service in `services/` |
| ATS integrations | `services/atsSvc.ts` | New service file; employer settings page extended |
| Admin / white-label | `pages/admin/` + admin route guard | New route group; theme tokens in CSS custom properties |
| CV analysis | `features/cv-analysis/` | New feature module; hooks into `scoring/` via shared types |
| Adaptive assessments | Extension of `assessment-gen/` | Feature module extended; API contract changes isolated to service |

Feature flags in `lib/featureFlags.ts` allow shipping Phase 2 code behind flags before it is publicly visible — no long-lived feature branches.

---

## Testing Strategy

| Layer | Tooling | Coverage focus |
|---|---|---|
| Unit tests | Vitest + Testing Library | Co-located in `features/` — hooks, formatters, validators |
| Integration tests | Vitest + MSW | Feature components against mocked API responses |
| E2E tests | Playwright | Assessment submission · scoring · shortlisting · auth flows |
| Visual regression | Playwright screenshots | Shared UI components — catch layout regressions |

Tests live next to the code they test (e.g. `QuestionEditor.test.tsx` beside `QuestionEditor.tsx`). Shared test utilities live in a top-level `test/` folder. The services layer is always mocked in tests — no real API calls in CI.

---

## Dependency Rules (Import Boundaries)

Enforced by ESLint (`eslint-plugin-import-alias`) in CI — a PR that violates a boundary fails the lint check before code review.

| Module | Allowed imports |
|---|---|
| `pages/` | `features/*` (via `index.ts` only), `shared/ui/`, `store/`, `router/` |
| `features/*` | `shared/ui/`, `services/`, `store/`, `lib/`, `hooks/`, `types/` |
| `shared/ui/` | `lib/`, `types/` only — never from `features/` or `pages/` |
| `services/` | `lib/`, `types/` only — never from `features/`, `shared/`, or `store/` |
| `store/` | `lib/`, `types/` only |
| `lib/` | `types/` only — no other `src/` folders |
| `pages/` | Cannot be imported by anything — pages are leaf nodes |

---

## Appendix — Decision Log

| Decision | Rationale |
|---|---|
| TanStack Query over Redux Toolkit Query | Simpler API, better devtools, stale-while-revalidate built in, no boilerplate actions/reducers |
| Zustand over Context API | No provider wrapping, no re-render propagation, built-in devtools, immer middleware |
| Vite over CRA / webpack | 10–100x faster HMR, native ESM, simpler config, better DX |
| Feature-first folder structure over type-first | Feature owns all its code — easier to delete, test, and reason about |
| Services layer enforced | Changing the API base URL, adding auth headers, or mocking for tests is a single-file change |
| Virtual scrolling from day one | 1,000 candidates is a realistic v1 load; retrofitting virtual scroll is harder than starting with it |

---

*Document maintained by the frontend engineering team. Update this file when architectural decisions change, not after implementation.*
