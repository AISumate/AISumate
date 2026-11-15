import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import type { Express } from "express";

/**
 * Rate limiting for the public API.
 *
 * Why: every endpoint is unauthenticated by design. List procedures are paged
 * and slim now, but a script can still walk the pages, and `search.global`
 * fans out to every Teable table on a cold cache. Without a limit that walk
 * burns the Vercel bandwidth quota.
 *
 * Caveat worth knowing: the store is in-memory, so on Vercel each warm serverless
 * instance keeps its own counters and the effective ceiling is (limit x instances).
 * That still defeats a single-source flood, which is the realistic threat here; a
 * shared store (Redis/Upstash) would be needed for a hard global cap.
 */

/** Normal browsing: a page load is a handful of batched calls, a search one more. */
const GENERAL_MAX = 300;
/** Global search fans out across every table, so it gets a tighter budget. */
const SEARCH_MAX = 60;
const WINDOW_MS = 60_000;

const common = {
  windowMs: WINDOW_MS,
  standardHeaders: "draft-7" as const,
  legacyHeaders: false,
  // ipKeyGenerator normalises IPv6 to a /64 prefix — without it a single client
  // can rotate through its own address range and get a fresh bucket each time.
  keyGenerator: (req: { ip?: string }) => ipKeyGenerator(req.ip ?? ""),
};

export function registerRateLimits(app: Express) {
  // Vercel terminates TLS upstream, so req.ip is the proxy unless we trust the
  // forwarded header. Left unset, every visitor shares one bucket and real users
  // start getting 429s. `1` = trust exactly one proxy hop, not an open X-F-F.
  app.set("trust proxy", 1);

  app.use(
    "/api/trpc/search.global",
    rateLimit({
      ...common,
      limit: SEARCH_MAX,
      message: { error: "Too many searches, please slow down." },
    })
  );

  app.use(
    "/api/trpc",
    rateLimit({
      ...common,
      limit: GENERAL_MAX,
      message: { error: "Too many requests, please try again shortly." },
    })
  );
}
