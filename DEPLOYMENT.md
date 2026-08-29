# aisumate — CI/CD & Deployment

How changes get from your editor to **aisumate.com** on Vercel, and what has to
pass before anything ships.

> Domain note: the site was originally built for `aisumate.ai`, which lapsed at
> the registry and is gone. The live domain is now **aisumate.com**, registered
> at Hostinger.

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

## One-time setup (AISumate GitHub + Vercel account)

The GitHub account is **`AISumate`** (a personal user account, not an org) and
the repo is **`AISumate/AISumate`** (private).

1. **GitHub**: from this folder —
   ```bash
   git remote add origin https://github.com/AISumate/AISumate.git
   git push -u origin main
   ```
   Whoever pushes must be the `AISumate` account or a collaborator on that repo.
2. **Vercel**: sign in to the Vercel account for `hello@aisumate.com`, then
   either **Import the GitHub repo from the Vercel dashboard** (simplest — gives
   automatic deploys on every push and needs no local CLI), or link locally with
   `npx vercel login` + `npx vercel link` → creates `.vercel/project.json`.
3. **GitHub secrets** — only needed if you want the bundled `cd.yml` workflow to
   deploy instead of Vercel's own Git integration (repo → Settings → Secrets and
   variables → Actions):
   | Secret | Value |
   |---|---|
   | `VERCEL_TOKEN` | vercel.com → Account Settings → Tokens |
   | `VERCEL_ORG_ID` | `orgId` from `.vercel/project.json` |
   | `VERCEL_PROJECT_ID` | `projectId` from `.vercel/project.json` |
4. **Vercel environment variables** (project → Settings → Environment
   Variables, Production): the fastest route is Vercel's bulk paste — open your
   local `.env` and paste the whole file in. That covers `TEABLE_API_KEY`,
   `TEABLE_API_URL`, and all 25 `TEABLE_*_TABLE_ID` vars. Without these the site
   deploys but shows no data.
5. **Domain** (`aisumate.com`, registered at **Hostinger**): add the domain in
   Vercel (project → Settings → Domains), then in Hostinger point DNS at Vercel —
   either switch to Vercel's nameservers, or keep Hostinger DNS and set an
   `A` record for `@` → `76.76.21.21` plus a `CNAME` for `www` →
   `cname.vercel-dns.com`. The domain currently sits on Hostinger's parking
   nameservers (`*.dns-parking.com`), so it must be repointed before it serves
   the site.

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
- Manus-era pieces (OAuth login, forge LLM/image APIs) are unconfigured
  outside Manus; all public pages work without them.
