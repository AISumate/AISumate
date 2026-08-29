import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { registerRateLimits } from "./rateLimit";

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
  // The Manus-era /manus-storage/* proxy and /api/oauth/callback route used to be
  // mounted here. Both were publicly reachable, permanently inert (their forge /
  // OAuth env vars are never set outside Manus), and the storage proxy forwarded
  // a caller-controlled path to a backend with a bearer key and then redirected
  // to whatever URL came back — a path-traversal and open-redirect surface that
  // would have gone live the moment those env vars were set. Removed rather than
  // left dormant. Session verification (server/_core/sdk.ts) is untouched.
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
