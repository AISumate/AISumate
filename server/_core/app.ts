import express from "express";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { registerRateLimits } from "./rateLimit";
import { imgProxyHandler } from "../imgProxy";

/**
 * Build the Express app with all API routes. Shared by the standalone server
 * (server/_core/index.ts, which adds static serving + listen) and the Vercel
 * serverless entry (api/index.ts, where the platform serves the static build).
 */
export function createApp() {
  const app = express();
  // The API only accepts small JSON payloads (search queries etc.)
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ limit: "1mb", extended: true }));
  registerRateLimits(app);
  // A bare GET /api/trpc/<something>.list has no input object. That used to
  // mean "the whole table". It now means the default page. Batch calls already
  // send an input map, and procedures that aren't lists are left alone
  // (tools.categories, for example, takes no object).
  app.use("/api/trpc", (req, _res, next) => {
    if (req.method !== "GET" || !req.url) return next();
    const qIndex = req.url.indexOf("?");
    const path = qIndex === -1 ? req.url : req.url.slice(0, qIndex);
    if (path.includes(",") || !path.includes(".list")) return next();
    const params = new URLSearchParams(
      qIndex === -1 ? "" : req.url.slice(qIndex + 1)
    );
    const current = params.get("input");
    const missing =
      current == null ||
      current === "" ||
      current === "null" ||
      current === '{"json":null}';
    if (!missing) return next();
    params.set("input", JSON.stringify({ json: {} }));
    req.url = `${path}?${params.toString()}`;
    next();
  });
  // The Manus-era /manus-storage/* proxy and /api/oauth/callback route used to be
  // mounted here. Both were publicly reachable, permanently inert (their forge /
  // OAuth env vars are never set outside Manus), and the storage proxy forwarded
  // a caller-controlled path to a backend with a bearer key and then redirected
  // to whatever URL came back — a path-traversal and open-redirect surface that
  // would have gone live the moment those env vars were set. Removed rather than
  // left dormant. Session verification (server/_core/sdk.ts) is untouched.
  // Same-origin image proxy (signed URLs only — see server/imgProxy.ts).
  // Own generous limiter: a cold grid page can fetch dozens of icons at once,
  // and Vercel's CDN absorbs repeats, so the origin only sees cache misses.
  app.get(
    "/api/img",
    rateLimit({
      windowMs: 60_000,
      limit: 120,
      standardHeaders: "draft-7",
      legacyHeaders: false,
      keyGenerator: (req: { ip?: string }) => ipKeyGenerator(req.ip ?? ""),
    }),
    imgProxyHandler
  );
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  return app;
}
