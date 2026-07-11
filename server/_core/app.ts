import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";

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
  registerStorageProxy(app);
  registerOAuthRoutes(app);
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
