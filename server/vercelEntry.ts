import { createApp } from "./_core/app";

// esbuild bundle entry for the Vercel serverless function. Vercel compiled the
// old api/index.ts per-file and left its `../server/_core/app` import
// extensionless, which Node's ESM loader can't resolve at runtime
// (ERR_MODULE_NOT_FOUND on /var/task/server/_core/app). The `vercel-build`
// script bundles this file — inlining the whole server/** tree into a single
// self-contained api/index.js — so the only remaining imports are node_modules
// packages, which Vercel resolves normally.
export default createApp();
