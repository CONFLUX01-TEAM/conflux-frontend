# Engineering Standards (Frontend + Backend)

> Copy this file into **both** the frontend and backend repositories (`docs/STANDARDS.md`) and keep them aligned.  
> Repo-specific setup lives in each project's `docs/DEVELOPMENT.md` (frontend) or equivalent backend guide.

---

## 1. Branch promotion flow

Same flow on **both** repos:

```
feature/*  ──PR──▶  dev  ──PR──▶  main  ──PR──▶  staging  ──PR──▶  prod
```

| Target    | Allowed source                                        |
| --------- | ----------------------------------------------------- |
| `dev`     | Feature branches only (not `main`, `staging`, `prod`) |
| `main`    | `dev`                                                 |
| `staging` | `main`                                                |
| `prod`    | `staging`                                             |

**Enforcement:**

- Local: git hooks (`.github/branch-guard.mjs`) — bypass for maintainers in `.github/branch-bypass-allowlist.json`
- Remote: CI `branch-policy` job on pull requests — bypass when `github.actor` is in the allowlist
- GitHub branch protection is optional; when enabled, it should match these rules

**Maintainer allowlist** (edit in both repos):

```json
{
  "githubUsers": ["ZEED2468"],
  "gitEmails": ["victoradebayo360@gmail.com"],
  "gitNames": ["ZEDD2468"]
}
```

---

## 2. Commit messages

**Format:** scoped [Conventional Commits](https://www.conventionalcommits.org/)

```
<type>(<scope>): <subject>
```

**Examples:**

```
feat(auth): wire login form to api
fix(onboarding): validate linkedin company url
chore(ci): add branch policy job
```

**Rules (both repos):**

| Rule    | Detail                                                                              |
| ------- | ----------------------------------------------------------------------------------- |
| Scope   | **Required** — e.g. `auth`, `onboarding`, `ci`, `setup`                             |
| Subject | Lowercase, imperative, no trailing period                                           |
| Types   | `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `ci`, `build`, `perf`, `revert` |

Enforced via **commitlint** + Husky `commit-msg` hook on both repos.

Full examples and hook setup: frontend [DEVELOPMENT.md](DEVELOPMENT.md#commit-message-format).

---

## 3. CI quality gates

Both repos should run the same **core** checks on pull requests:

| Step          | Frontend                    | Backend                                           |
| ------------- | --------------------------- | ------------------------------------------------- |
| Branch policy | PR base/head promotion flow | Same                                              |
| Typecheck     | `pnpm typecheck`            | `pnpm typecheck` (or equivalent)                  |
| Lint          | `pnpm lint`                 | `pnpm lint`                                       |
| Test          | `pnpm test`                 | `pnpm test:push` (+ `test:enforce` if applicable) |
| Build         | `pnpm build`                | `pnpm build`                                      |
| `HUSKY`       | `0` in CI                   | `0` in CI                                         |

**Triggers (aligned):**

- `pull_request` → `dev`, `main`, `staging`, `prod`
- `push` → `main`, `staging`, `prod` (not `dev`)

Node **20**, **pnpm 9** — use `.nvmrc` in both repos.

---

## 4. Local workflow (both repos)

| Command         | Purpose                                 |
| --------------- | --------------------------------------- |
| `pnpm check`    | typecheck + lint + test                 |
| `pnpm validate` | check + build                           |
| `pnpm prepush`  | Runs on `git push` (after branch guard) |

**Hooks:**

- **pre-commit** — no commits on `dev` / `main` / `staging` / `prod`; lint staged files
- **commit-msg** — commitlint
- **pre-push** — branch promotion rules + validate

---

## 5. API contract (frontend ↔ backend)

### Base URL

| Environment | Frontend env var              | Backend                               |
| ----------- | ----------------------------- | ------------------------------------- |
| Local       | `VITE_API_BASE_URL` in `.env` | e.g. `http://localhost:<port>/api/v1` |
| Hosted      | Set in deploy env             | Must match CORS + OAuth redirect URIs |

Frontend reads config from `src/config/env.ts`. Backend owns route definitions.

### Auth (current MVP)

| Endpoint         | Method         | Frontend consumer                                 |
| ---------------- | -------------- | ------------------------------------------------- |
| `/auth/login`    | POST           | `services/api-client.ts` → `login()`              |
| `/auth/register` | POST           | `services/api-client.ts` → `register()`           |
| `/auth/google`   | GET (redirect) | `services/auth.service.ts` → `startGoogleLogin()` |

**Response shapes:**

- Login: `{ access_token: string }` — JWT sent as `Authorization: Bearer <token>`
- Register: `{ success: boolean, message: string }`

**Errors:** NestJS-style `{ message: string | string[] }` — frontend flattens arrays in `api-client.ts`.

### Contract changes

1. Backend documents new/changed endpoints (OpenAPI or a short table in backend `docs/DEVELOPMENT.md`).
2. Update this section and frontend `services/`.
3. Coordinate deploy order when breaking changes ship (backend first, or versioned API).

---

## 6. Definition of Done (shared)

Every PR — frontend or backend:

- [ ] `pnpm validate` passes
- [ ] Scoped conventional commit / PR title
- [ ] Correct branch promotion (feature → dev, etc.)
- [ ] No secrets committed
- [ ] Tests for new behavior where practical
- [ ] PR description: what + why + test plan

Repo-specific DoD items: see [DEVELOPMENT.md](DEVELOPMENT.md#definition-of-done).

---

## 7. Keeping standards in sync

When you change rules in one repo:

1. Update `docs/STANDARDS.md` in both repos (or a shared internal wiki).
2. Update commitlint / CI / branch-guard scripts in both repos.
3. Notify the team in Slack/standup.

**Owners:** CTO / tech leads review changes to this file.
