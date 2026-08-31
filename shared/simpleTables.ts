/**
 * Which /tool/<table>/<id> pages get the rich landing layout.
 *
 * Landing pages are for product tools — things with a homepage worth
 * screenshotting and a review worth laying out. The tables below are
 * content-discovery listings instead (repos, YouTube channels, sites, Discord
 * servers, blog posts), so they keep the simple detail view.
 *
 * Shared so the React page (client/src/pages/ToolPage.tsx) and the crawler
 * twins (scripts/prerender.ts) can never disagree about which is which.
 */
export const SIMPLE_TABLES: ReadonlySet<string> = new Set([
  // GitHub repos — no review fields on the record at all (see GithubRepo in
  // server/teable.ts); a landing page would render an empty shell. Weekly
  // Viral has the review fields but they sit empty in practice, so it renders
  // just as thin.
  "github",
  "weeklyViralGithub",
  // YouTube channels — no pros/cons/cost/verdict, and a homepage screenshot of
  // youtube.com says nothing about the channel.
  "aiInfluencers",
  "sumateTopRecommendations",
  // Directory-of-links tables.
  "aiSites",
  "aiDiscord",
  // Sumate Media — the blog, which has its own BlogPostDialog layout.
  "aiMedia",
]);

/** True when this table's tool pages should render the full landing layout. */
export function isLandingTable(tableKey: string): boolean {
  return !SIMPLE_TABLES.has(tableKey);
}
