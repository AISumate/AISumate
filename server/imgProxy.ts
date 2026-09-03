import { createHmac, timingSafeEqual } from "node:crypto";
import type { Request, Response } from "express";
import { ENV } from "./_core/env";

/**
 * Same-origin image proxy.
 *
 * Tool logos and curated gallery images live on thousands of third-party
 * hosts. Serving them through /api/img means Vercel's edge CDN caches them
 * globally (fast, resilient to origin sites dying) and visitors' browsers
 * never contact the third-party host at all (the privacy page relies on
 * this).
 *
 * This is NOT an open proxy: every URL the API hands out is signed with an
 * HMAC derived from a server-only secret, and the route refuses anything
 * unsigned. The proxy can therefore only ever fetch URLs our own catalog
 * references — no SSRF, no third-party hotlinking through us.
 */

const SIG_BYTES = 16;

/** Server-only signing secret; never sent to any client. */
function secret(): string {
  // Derived, not the raw key: even a log line showing a signature reveals
  // nothing about the Teable credential (HMAC is a PRF). Empty key (e.g. a
  // build without env) disables proxying entirely — callers then keep the
  // original URLs. Operational note: rotating TEABLE_API_KEY invalidates the
  // signatures baked into prerendered pages until the redeploy that a Vercel
  // env change requires anyway — which re-bakes them.
  return ENV.teableApiKey ? `img-proxy:${ENV.teableApiKey}` : "";
}

function sign(src: string): string {
  return createHmac("sha256", secret()).update(src).digest("hex").slice(0, SIG_BYTES * 2);
}

/**
 * Rewrite an absolute image URL to its proxied form. Pass-through when there
 * is nothing to sign with, the value is empty, or it is already proxied.
 */
export function proxyImg(src: string): string {
  if (!src || !secret() || src.startsWith("/api/img?")) return src;
  if (!/^https?:\/\//i.test(src)) return src;
  return `/api/img?src=${encodeURIComponent(src)}&sig=${sign(src)}`;
}

export function verifySig(src: string, sig: string): boolean {
  if (!secret() || !sig || sig.length !== SIG_BYTES * 2) return false;
  const expect = Buffer.from(sign(src), "utf8");
  const got = Buffer.from(sig, "utf8");
  return expect.length === got.length && timingSafeEqual(expect, got);
}

/** Defence-in-depth on top of the signature: never fetch internal targets. */
function isBlockedHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (h === "localhost" || h.endsWith(".localhost") || h.endsWith(".local") || h.endsWith(".internal")) return true;
  // IPv4 literal in private/link-local/loopback/CGNAT/benchmark ranges, or
  // any IPv6 literal.
  if (h.includes(":")) return true;
  const m = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/.exec(h);
  if (m) {
    const [a, b] = [Number(m[1]), Number(m[2])];
    if (a === 10 || a === 127 || a === 0) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && (b === 168 || b === 0)) return true;
    if (a === 169 && b === 254) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;
    if (a === 198 && (b === 18 || b === 19)) return true;
  }
  return false;
}

function isBlockedUrl(url: URL): boolean {
  return !/^https?:$/.test(url.protocol) || isBlockedHost(url.hostname);
}

/** Keep well under Vercel's serverless response payload limit. */
const MAX_BYTES = 4 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 15_000;
const OK_CACHE = "public, max-age=86400, s-maxage=2592000, stale-while-revalidate=604800";
const ERR_CACHE = "public, max-age=60, s-maxage=120";

/**
 * mShots serves a small loading GIF (via a redirect to its default image)
 * until the screenshot has actually been generated. A 200 is a 200, so
 * without this the edge would pin that spinner onto every page with no
 * curated image for a month. Not-ready answers get the short TTL instead, so
 * the next visitor re-asks and the real screenshot lands.
 */
export function isPendingScreenshot(url: URL, contentType: string): boolean {
  return (
    url.hostname.toLowerCase() === "s.wordpress.com" &&
    url.pathname.startsWith("/mshots/") &&
    contentType === "image/gif"
  );
}

function fail(res: Response, status: number): void {
  res.status(status).set("Cache-Control", ERR_CACHE).end();
}

const MAX_REDIRECTS = 5;

/**
 * Follow redirects by hand so every hop re-passes the protocol/host checks —
 * a signed public URL must not be able to bounce the fetch to an internal
 * address.
 */
async function fetchImage(url: URL, signal: AbortSignal): Promise<globalThis.Response | null> {
  let current = url;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    if (isBlockedUrl(current)) return null;
    const r = await fetch(current, {
      signal,
      redirect: "manual",
      headers: {
        "User-Agent": "aisumate-img-proxy/1.0 (+https://www.aisumate.com)",
        Accept: "image/*,*/*;q=0.5",
      },
    });
    if (r.status >= 300 && r.status < 400) {
      const loc = r.headers.get("location");
      if (!loc) return null;
      try {
        current = new URL(loc, current);
      } catch {
        return null;
      }
      continue;
    }
    return r;
  }
  return null;
}

export async function imgProxyHandler(req: Request, res: Response): Promise<void> {
  // Only src+sig — any extra parameter would mint a fresh CDN cache key per
  // value and turn the edge cache into an amplification lever.
  const keys = Object.keys(req.query);
  const src = typeof req.query.src === "string" ? req.query.src : "";
  const sig = typeof req.query.sig === "string" ? req.query.sig : "";
  if (keys.length !== 2 || !src || !verifySig(src, sig)) {
    res.status(403).set("Cache-Control", "no-store").end();
    return;
  }

  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return fail(res, 400);
  }
  if (isBlockedUrl(url)) return fail(res, 403);

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const upstream = await fetchImage(url, ctrl.signal);
    if (!upstream || !upstream.ok || !upstream.body) return fail(res, 502);

    const type = (upstream.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
    if (!type.startsWith("image/")) return fail(res, 502);
    const declared = Number(upstream.headers.get("content-length") || 0);
    if (declared > MAX_BYTES) return fail(res, 502);

    // Stream with a hard cap — content-length can lie, be absent, or predate
    // transparent decompression, so the ceiling is enforced on actual bytes.
    const chunks: Uint8Array[] = [];
    let total = 0;
    const reader = upstream.body.getReader();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_BYTES) {
        ctrl.abort();
        return fail(res, 502);
      }
      chunks.push(value);
    }
    const buf = Buffer.concat(chunks);
    if (buf.length === 0) return fail(res, 502);

    res
      .status(200)
      .set("Content-Type", type)
      .set("Cache-Control", isPendingScreenshot(url, type) ? ERR_CACHE : OK_CACHE)
      .set("X-Content-Type-Options", "nosniff")
      // Neutralises scripted SVGs if the proxy URL is opened directly —
      // as an <img> source the sandbox changes nothing.
      .set("Content-Security-Policy", "default-src 'none'; sandbox")
      .send(buf);
  } catch {
    fail(res, 502);
  } finally {
    clearTimeout(timer);
  }
}
