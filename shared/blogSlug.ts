/**
 * The URL slug for a blog post.
 *
 * The value comes from a Teable cell that anyone editing the base can type
 * into, and it ends up as both a URL segment and a filename
 * (dist/public/blog-static/<slug>.html), so it is reduced to characters that
 * cannot escape the path. Empty or unusable slugs fall back to the record id,
 * which is always safe.
 *
 * Shared so the link (HomeSection), the lookup (pages/BlogPost) and the
 * crawler twin (scripts/prerender) can never disagree about a post's address.
 */
export function blogSlug(raw: string | undefined, fallbackId: string): string {
  const s = String(raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    // Capped before the final trim: a slug long enough to blow the OS filename
    // limit makes writeFileSync throw, which would fail the whole deploy.
    .slice(0, 80)
    .replace(/^-|-$/g, "");
  // CON/NUL/COM1… are device handles on Windows — writing "con.html" there
  // opens a device rather than a file. Vercel builds on Linux, but a local
  // `pnpm vercel-build` would hit it.
  if (/^(con|prn|aux|nul|com\d|lpt\d)$/i.test(s)) return `post-${s}`;
  // The fallback is a Teable record id, which is already safe — but it is
  // interpolated into an unescaped href in the prerendered canonical tag, so
  // don't take that on trust either.
  return s || String(fallbackId).replace(/[^A-Za-z0-9-]/g, "");
}
