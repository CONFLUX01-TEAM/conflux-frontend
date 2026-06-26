# Frontend Developer Guide

> Practical guide for working in this repo **today**.  
> For long-term architecture vision and Phase 2 plans, see the root [README.md](../README.md).

---

## Quick start

```bash
pnpm install
cp .env.example .env   # adjust VITE_API_BASE_URL if needed
pnpm dev               # http://localhost:3000
```

**Requirements:** Node 20+ (see `.nvmrc`), pnpm 9+.

---

## What is implemented vs planned

| Area                                                   | Status              | Notes                                                         |
| ------------------------------------------------------ | ------------------- | ------------------------------------------------------------- |
| Folder structure (`features/`, `services/`, `shared/`) | Done                | MVP scaffold in place                                         |
| CI (typecheck, lint, test, build)                      | Done                | See `.github/workflows/ci.yml`                                |
| Husky + lint-staged + commitlint                       | Done                | Scoped conventional commits required                          |
| Branch promotion guards (local + CI)                   | Done                | feature/\* → dev → main → staging → prod                      |
| Auth API wiring (`login`, `register`)                  | **Not done**        | `services/api-client.ts` exists; forms still stubbed          |
| Route guards (`RequireAuth`)                           | **Not done**        | `isAuthenticated()` exists but unused                         |
| TanStack Query / Zustand                               | **Not planned yet** | Add when server/client state grows                            |
| Error boundary + 404 page                              | **Not done**        |                                                               |
| E2E (Playwright)                                       | **Not done**        | Listed in README for Phase 2                                  |
| `auth-img.svg`                                         | **Missing**         | Referenced in auth screens — add to `public/` or update paths |

The README describes the **target** architecture. This guide describes the **current** codebase and how to extend it safely.

---

## Source layout

```
src/
├── main.tsx                 # Vite entry — mounts BrowserRouter + App
├── app/
│   └── App.tsx              # Root shell (renders router)
├── router/
│   └── index.tsx            # All route definitions
├── pages/                   # Thin route files — compose features only
│   ├── auth/
│   ├── onboarding/
│   └── dashboard/
├── features/                # Domain logic (components, hooks, types)
│   ├── auth/
│   └── onboarding/
├── shared/
│   ├── ui/                  # Button, InputField, Spinner
│   ├── layout/              # AuthLayout, MainLayout, OnboardingLayout, Navbar, Footer
│   └── types/               # Shared UI prop types
├── services/                # API + auth token helpers — only place for fetch()
│   ├── api-client.ts
│   └── auth.service.ts
├── lib/                     # Pure utilities (no React, no fetch)
│   └── validation.ts
├── config/
│   └── env.ts               # VITE_API_BASE_URL
├── types/
│   └── index.ts             # Re-exports for convenience
└── test/
    └── setup.ts             # Vitest + jest-dom setup
```

### Layer rules

Dependencies flow **downward only**:

```
pages → features → shared
                 → services → config
                 → lib
```

| Layer       | Responsibility            | Do                                         | Don't                                                 |
| ----------- | ------------------------- | ------------------------------------------ | ----------------------------------------------------- |
| `pages/`    | One file per route        | Import and render a feature component      | Put form logic, API calls, or heavy state here        |
| `features/` | Domain UI + hooks + types | Keep auth, onboarding, etc. self-contained | Import from other features' internals                 |
| `shared/`   | UI used by 2+ features    | Primitives and layouts                     | Add “might reuse later” code                          |
| `services/` | HTTP + token storage      | All `fetch()` calls                        | Import from `pages/` or `features/` components for UI |
| `lib/`      | Pure helpers              | Validators, formatters                     | React hooks or API calls                              |

### Path aliases

Use `@/` imports instead of deep relative paths:

```ts
import { AuthForm } from '@/features/auth'
import { login } from '@/services/api-client'
import Button from '@/shared/ui/Button'
import { validateAuthForm } from '@/lib/validation'
```

Configured in `vite.config.ts` and `tsconfig.app.json`.

---

## Feature module pattern

Each feature is a folder with a **public barrel** (`index.ts`). Other code imports from the barrel, not from deep paths.

```
features/<name>/
  components/     # Feature-specific UI
  hooks/          # Feature-specific hooks
  types.ts        # Feature types
  index.ts        # Public exports only
```

**Example — auth (current):**

```ts
// features/auth/index.ts
export { default as AuthForm } from './components/AuthForm'
export { useCountdown } from './hooks/useCountdown'
export type { AuthFormProps, AuthState } from './types'
```

**Thin page:**

```tsx
// pages/auth/SignInPage.tsx
import { AuthForm } from '@/features/auth'

const SignInPage = () => <AuthForm authState="signin" />
export default SignInPage
```

### Adding a new feature

1. Create `src/features/<domain>/` with `components/`, `hooks/` (if needed), `types.ts`, `index.ts`.
2. Add a thin page under `src/pages/<domain>/`.
3. Register the route in `src/router/index.tsx`.
4. Add tests next to the feature or under `src/router/`.

Do **not** put new API calls in feature components — add functions to `services/` first.

---

## Routing

Routes live in `src/router/index.tsx`.

| Path                                      | Page                   | Layout           |
| ----------------------------------------- | ---------------------- | ---------------- |
| `/`                                       | Redirects to `/signin` | MainLayout       |
| `/signin`                                 | SignInPage             | AuthLayout       |
| `/signup`                                 | SignUpPage             | AuthLayout       |
| `/verify-email`                           | VerifyEmailPage        | AuthLayout       |
| `/auth/callback`, `/auth/google/callback` | GoogleCallbackPage     | AuthLayout       |
| `/onboarding`                             | OnboardingPage         | OnboardingLayout |
| `/dashboard`                              | DashboardPage          | MainLayout       |

**Planned (not implemented):** `RequireAuth` guard, 404 catch-all, lazy-loaded routes.

Suggested guard location when implemented:

```
src/router/guards/RequireAuth.tsx
```

---

## Services & environment

### API client

`src/services/api-client.ts` — thin `fetch` wrapper:

- Attaches `Authorization: Bearer <token>` when a token exists
- Parses JSON and throws on non-2xx (NestJS-style `message` arrays flattened)
- Exports: `login`, `register` (more endpoints should be added here)

### Auth service

`src/services/auth.service.ts` — token storage + Google OAuth helpers:

- `getToken`, `setToken`, `clearToken`, `isAuthenticated`
- `startGoogleLogin`, `extractTokenFromRedirect`, `extractErrorFromRedirect`

### Environment

| Variable            | Purpose                              |
| ------------------- | ------------------------------------ |
| `VITE_API_BASE_URL` | Backend base URL including `/api/v1` |

Copy `.env.example` to `.env` for local overrides. Never commit `.env`.

---

## Branching & releases

We do not use GitHub branch protection. **Local git hooks + CI** enforce the promotion flow instead.

### Branch roles

| Branch      | Purpose                                       |
| ----------- | --------------------------------------------- |
| `feature/*` | All day-to-day development                    |
| `dev`       | Integration — merged features land here first |
| `main`      | Stable code ready for pre-production          |
| `staging`   | Pre-production / QA environment               |
| `prod`      | Production                                    |

### Promotion flow (strict)

```
feature/*  ──PR──▶  dev  ──PR──▶  main  ──PR──▶  staging  ──PR──▶  prod
```

| Target branch | Must come from                                        |
| ------------- | ----------------------------------------------------- |
| `dev`         | Any feature branch (not `main`, `staging`, or `prod`) |
| `main`        | `dev` only                                            |
| `staging`     | `main` only                                           |
| `prod`        | `staging` only                                        |

### What is enforced

| Layer                        | Rule                                                                              |
| ---------------------------- | --------------------------------------------------------------------------------- |
| **pre-commit**               | No commits directly on `dev`, `main`, `staging`, or `prod` — use a feature branch |
| **pre-push**                 | Promotion flow on push to protected branches (see table above)                    |
| **CI** (`branch-policy` job) | Same rules on pull requests                                                       |

**Maintainers** listed in `.github/branch-bypass-allowlist.json` may bypass all of the above (local hooks + CI). Everyone else is blocked.

| Maintainer check    | Field                                  |
| ------------------- | -------------------------------------- |
| Local git hooks     | `git config user.email` or `user.name` |
| CI on pull requests | `github.actor` (GitHub username)       |

To add or remove a maintainer, update the allowlist file in a PR (requires existing maintainer or repo admin).

### Typical workflow

```bash
git checkout dev
git pull
git checkout -b feat/auth-login
# ... work, commit (hooks run lint-staged + commitlint) ...
git push -u origin feat/auth-login
# Open PR: feat/auth-login → dev
```

When promoting between environments, open PRs in order (`dev` → `main` → `staging` → `prod`). Do not skip steps.

### Emergency bypass

Only for break-glass situations, not normal use:

```bash
SKIP_BRANCH_GUARD=1 git commit -m "chore(release): hotfix"
git push --no-verify
```

Maintainers do **not** need this — they are on the allowlist automatically when git email/name or GitHub user matches.

---

## Definition of Done

A pull request is **done** when all of the following are true:

- [ ] `pnpm validate` passes locally
- [ ] PR title follows scoped Conventional Commits (see below)
- [ ] Branch promotion flow is correct (feature → dev, or dev → main, etc.)
- [ ] Code lives in the right layer (`features/`, `services/`, `shared/` — not fat pages)
- [ ] No `console.log`, `alert()`, or stubbed API calls in user-facing paths (unless explicitly marked as WIP)
- [ ] No secrets, `.env`, or credentials committed
- [ ] New behavior has tests where practical
- [ ] UI changes tested in the browser; screenshots added to the PR if visible
- [ ] API calls go through `services/` only
- [ ] PR description explains **what** and **why** (use the PR template)

---

## Scripts & quality gates

| Command           | When to use                                                   |
| ----------------- | ------------------------------------------------------------- |
| `pnpm dev`        | Local development                                             |
| `pnpm check`      | Quick gate: typecheck + lint + test                           |
| `pnpm validate`   | Before opening a PR: check + production build                 |
| `pnpm prepush`    | Same as validate (runs automatically on `git push` via Husky) |
| `pnpm lint:fix`   | Auto-fix ESLint issues                                        |
| `pnpm format`     | Run Prettier on the repo                                      |
| `pnpm test:watch` | Tests in watch mode                                           |

### Git hooks

| Hook       | Runs                                                          |
| ---------- | ------------------------------------------------------------- |
| pre-commit | Branch guard (no commits on protected branches) + lint-staged |
| commit-msg | commitlint (scoped conventional commits)                      |
| pre-push   | Branch guard (promotion flow) + `pnpm validate`               |

Implementation: `.github/branch-guard.mjs`

### Commit message format

**Required:** scoped Conventional Commits.

```
feat(auth): wire login form to api
fix(onboarding): validate linkedin url on blur
chore(ci): add staging branch trigger
```

- **type:** `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `ci`, `build`, etc.
- **scope:** required (e.g. `auth`, `onboarding`, `ci`, `setup`)
- **subject:** lowercase, no trailing period

### CI

GitHub Actions runs on pull requests to `dev`, `main`, `staging`, `prod`:

1. typecheck
2. lint
3. test
4. build

Push CI runs on `main`, `staging`, `prod` only (not `dev`).

PRs also run the **branch-policy** job to block merges that skip the promotion flow.

---

## Cross-repo standards

Shared rules for frontend and backend are in **[docs/STANDARDS.md](STANDARDS.md)** (commit format, CI, API contract). Copy that file into the backend repo and keep both in sync.

---

## Testing

- **Runner:** Vitest + Testing Library + jsdom
- **Setup:** `src/test/setup.ts`
- **Example:** `src/router/router.test.tsx`

Prefer tests that assert user-visible behavior (headings, buttons, navigation) over implementation details.

When adding features, co-locate tests:

```
features/auth/components/AuthForm.test.tsx
```

For API integration tests, consider [MSW](https://mswjs.io/) to mock `services/` — not set up yet.

---

## Known backlog for developers

Prioritized work items left intentionally for the team:

### P0 — Auth & routing

- [ ] Wire `AuthForm` to `login()` / `register()` in `services/api-client.ts`
- [ ] On success: `setToken()` + redirect to `/dashboard` or `/onboarding`
- [ ] Fix Google OAuth redirect (currently navigates to `/` → bounces to sign-in)
- [ ] Add `RequireAuth` guard for `/dashboard` and `/onboarding`
- [ ] Replace `alert()` / `console.log()` in auth and onboarding flows

### P1 — Production hardening

- [ ] Root `ErrorBoundary` in `src/app/`
- [ ] 404 / not-found route
- [ ] Lazy-load route pages (`React.lazy` + `Suspense`)
- [ ] Add `public/auth-img.svg` or remove broken image references
- [ ] `src/vite-env.d.ts` with typed `ImportMetaEnv`
- [ ] Enable `strict: true` in TypeScript (dedicated PR)

### P2 — Scale (when needed)

- [ ] TanStack Query for server state
- [ ] Zustand in `src/store/` for shared client state (auth session, UI prefs)
- [ ] New feature modules per README (`assessment-gen`, `scoring`, `pipeline`, etc.)
- [ ] Playwright E2E for critical flows
- [ ] Dependency audit in CI (optional — `pnpm audit` available locally)

---

## Adding a new API endpoint

1. Add types and function to `src/services/api-client.ts` (or `src/services/<domain>.service.ts` if the file grows).
2. Create a hook in the relevant `features/<domain>/hooks/` if the UI needs loading/error state.
3. Call the hook or service from a feature component — never from a page directly.

```ts
// services/api-client.ts
export const getProfile = () => request<Profile>('/users/me')
```

---

## Folder naming conventions

- **Folders:** lowercase (`pages/auth/`, `features/onboarding/`)
- **Components:** PascalCase files (`AuthForm.tsx`, `SignInPage.tsx`)
- **Hooks:** camelCase with `use` prefix (`useCountdown.ts`)
- **Services / lib:** kebab-case or dot-suffix (`api-client.ts`, `auth.service.ts`)

---

## Questions?

- **Architecture vision:** [README.md](../README.md)
- **Cross-repo standards (frontend + backend):** [STANDARDS.md](STANDARDS.md)
- **PR checklist:** [.github/pull_request_template.md](../.github/pull_request_template.md)
- **Env setup:** [.env.example](../.env.example)
