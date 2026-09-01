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
    .replace(/^-|-$/g, "");
  return s || fallbackId;
}
