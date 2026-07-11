# aisumate — CI/CD & Deployment

How changes get from your editor to **aisumate.ai** on Vercel, and what has to
pass before anything ships.

## The pipeline at a glance

```
push any branch ──► CI  (.github/workflows/ci.yml)
                    ├─ pnpm check      TypeScript typecheck (client + server + shared + api)
                    ├─ pnpm test       vitest suite (see "What the tests cover")
                    └─ pnpm build      production build must succeed
push/merge main ──► CD  (.github/workflows/cd.yml)
                    ├─ typecheck + tests again (no shortcut to production)
                    └─ vercel build + deploy --prod
```

Every push to `main` that passes the gates goes live automatically. Work on
branches / PRs runs CI only.

## What the tests cover (and the policy for future changes)

- `shared/reviewSanitize.test.ts` — the **data-quality rules**: placeholder
  values (`Unknown`, `N/A`, `TBD`, `(unverified)`, …) and verification-pipeline
  junk ("domain inaccessible", "insufficient information", "Cannot assess…")
  must never render on the site; URL cells must be real `http(s)` URLs. These
  rules are shared by the server mappers and the client renderer, so one test
  suite guards both.
- `server/teable.test.ts` — every tRPC list endpoint (all 23 sections),
  search/filter behaviour, and response shapes.
- `server/auth.logout.test.ts` — session cookie clearing.

**Policy:** any future change that adds a data rule, a new Teable table/section,
or a new endpoint must land with a test in the matching suite. New table =
one registry line in `server/teable.ts` + one router line + a list test.

## Architecture on Vercel

- **Static site** — `pnpm run build:client` (Vite) → `dist/public`, served by
  Vercel's CDN.
- **API** — `api/index.ts` wraps the shared Express app
  (`server/_core/app.ts`) as one serverless function; `vercel.json` rewrites
  `/api/*` to it and everything else to the SPA's `index.html`.
- The standalone server (`server/_core/index.ts`, used by `pnpm dev` and any
  VPS deploy) uses the same `createApp()` — one API codebase, two runtimes.

## One-time setup (new GitHub + new Vercel account)

1. **GitHub**: create an empty repo on the new account, then from this folder:
   ```bash
   git remote add origin https://github.com/<account>/aisumate.git
   git push -u origin main
   ```
2. **Vercel**: `npm i -g vercel`, then `vercel login` (new account) and
   `vercel link` in this folder → creates `.vercel/project.json` containing
   `orgId` and `projectId`.
3. **GitHub secrets** (repo → Settings → Secrets and variables → Actions):
   | Secret | Value |
   |---|---|
   | `VERCEL_TOKEN` | vercel.com → Account Settings → Tokens |
   | `VERCEL_ORG_ID` | `orgId` from `.vercel/project.json` |
   | `VERCEL_PROJECT_ID` | `projectId` from `.vercel/project.json` |
4. **Vercel environment variables** (project → Settings → Environment
   Variables, for Production): copy every key from your local `.env` —
   `TEABLE_API_KEY`, `TEABLE_API_URL`, and all 23 `TEABLE_*_TABLE_ID` vars.
   Without these the site deploys but shows no data.
5. **Domain**: point `aisumate.ai` at the Vercel project (project → Settings
   → Domains) once the first deploy looks right.

## Day-to-day

- Work on a branch, push → CI tells you if it's green.
- Merge to `main` → CD deploys to production automatically.
- Manual deploy: Actions tab → CD → "Run workflow".
- Local prod-like run: `pnpm build && pnpm start` (needs `.env`).

## Gotchas

- `pnpm dev` uses POSIX `NODE_ENV=` syntax — on Windows run it through the
  existing `aisumate-dev` launcher (cmd wrapper), or use WSL/Git Bash.
- The Teable API key must stay server-side only; it is read from env in
  `server/_core/env.ts` and never shipped to the client bundle.
- `client/public/hero-video.mp4` (~10 MB) deploys to the CDN as-is — consider
  re-encoding to ~2–3 MB before heavy traffic.
- Manus-era pieces (OAuth login, forge LLM/image APIs) are unconfigured
  outside Manus; all public pages work without them.
