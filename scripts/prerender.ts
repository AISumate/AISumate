/**
 * Build-time prerender for SEO.
 *
 * The site is a client-rendered SPA, so crawlers reading raw HTML would see an
 * empty shell. This runs AFTER `vite build` and produces static files that
 * vercel.json routes to crawlers (humans keep the SPA):
 *
 *   • app.html        — the lean human shell + small JSON-LD.
 *   • seo.html        — shell + the full catalogue as text, every entry linked
 *                       to its internal /tool/<table>/<id> page (crawl graph).
 *   • tools-static/<table>/<id>.html — a static twin of every listing's page
 *                       (name, description, review, outbound link) served to
 *                       bots at /tool/<table>/<id>; humans get the SPA there.
 *   • privacy.html / terms.html — static twins of the legal pages, from the
 *                       same shared/legalContent.ts the React pages render.
 *   • sitemap.xml     — home + legal + every tool URL.
 *
 * Best-effort: if Teable is unreachable at build time it ships the shell and
 * legal pages without the catalogue, and never blocks a deploy.
 */
import "dotenv/config";
import { readFileSync, writeFileSync, existsSync, rmSync, mkdirSync } from "node:fs";
import path from "node:path";
import {
  GENERIC_TABLES,
  fetchGenericTools,
  fetchAllTools,
  fetchLlmModels,
  fetchGithubRepos,
  fetchWeeklyViralGithubRepos,
} from "../server/teable";
import { PRIVACY, TERMS, type LegalDoc } from "../shared/legalContent";
import { isLandingTable } from "../shared/simpleTables";
import { blogSlug } from "../shared/blogSlug";
import { mshotsUrl } from "../shared/screenshot";

const SITE_URL = "https://www.aisumate.com";
const OUT = path.resolve(process.cwd(), "dist/public");
const INDEX_HTML = path.join(OUT, "index.html");
const APP_HTML = path.join(OUT, "app.html");
const SEO_HTML = path.join(OUT, "seo.html");
const START = "<!--seo-prerender-start-->";
const END = "<!--seo-prerender-end-->";
const LD_START = "<!--seo-jsonld-start-->";
const LD_END = "<!--seo-jsonld-end-->";

interface Entry {
  tableKey: string;
  id: string;
  name: string;
  desc: string;
  url: string;
  category: string;
  rating: number;
  pros: string;
  cons: string;
  cost: string;
  verdict: string;
  /** Curated gallery from the Teable "Images" column (may be empty). */
  images: string[];
  iconUrl: string;
  /** Hand-written personal review (Teable "Blog Post - EN"); usually empty. */
  review: string;
  reviewTitle: string;
}

function esc(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Only allow http(s) links through — never javascript:/data: etc. */
function safeUrl(u: string): string {
  const t = String(u ?? "").trim();
  return /^https?:\/\//i.test(t) ? t : "";
}

function truncate(s: string, n = 200): string {
  const t = String(s ?? "").replace(/\s+/g, " ").trim();
  return t.length > n ? t.slice(0, n - 1).trimEnd() + "…" : t;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function normalize(item: any, tableKey: string, fallbackCategory: string): Entry {
  return {
    tableKey,
    id: String(item.id ?? ""),
    name: item.name || item.title || "",
    desc:
      item.descriptionEn || item.summaryEn || item.description || item.whyViral || "",
    url: item.url || item.repoUrl || item.dealUrl || item.website || "",
    category:
      item.category || item.providerType || item.topic || item.platform || fallbackCategory || "",
    rating: typeof item.rating === "number" ? item.rating : 0,
    pros: item.prosEn || "",
    cons: item.consEn || "",
    cost: item.costEn || "",
    verdict: item.verdictEn || "",
    images: Array.isArray(item.images) ? item.images.filter(Boolean) : [],
    iconUrl: item.iconUrl || "",
    review: item.blogPostEn || "",
    reviewTitle: item.blogTitleEn || "",
  };
}

/**
 * The review is Markdown in Teable. The static twin is crawler-only plain
 * HTML, so strip the markers and emit paragraphs rather than pull in a
 * renderer — the words are what needs to be indexed, not the formatting.
 */
function reviewHtml(title: string, body: string): string {
  const text = String(body ?? "").trim();
  if (!text) return "";
  const paras = text
    .split(/\n{2,}/)
    .map((p) => p.replace(/^[#>\-*\s]+/, "").replace(/\*\*/g, "").replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .map((p) => `<p>${esc(p)}</p>`)
    .join("");
  return `<h2>Our review</h2>${title ? `<h3>${esc(title)}</h3>` : ""}${paras}`;
}

async function collect(): Promise<Entry[]> {
  const groups: Entry[][] = [];
  const [aiTools, llms, repos, viral] = await Promise.all([
    fetchAllTools().catch(() => []),
    fetchLlmModels().catch(() => []),
    fetchGithubRepos().catch(() => []),
    fetchWeeklyViralGithubRepos().catch(() => []),
  ]);
  groups.push(aiTools.map((t) => normalize(t, "tools", "AI Tools")));
  groups.push(llms.map((t) => normalize(t, "llms", "LLMs")));
  groups.push(repos.map((t) => normalize(t, "github", "GitHub Repos")));
  groups.push(viral.map((t) => normalize(t, "weeklyViralGithub", "GitHub Repos")));

  // Generic tables one at a time — gentle on Teable's rate limit.
  for (const table of GENERIC_TABLES) {
    try {
      const rows = await fetchGenericTools(table.key);
      groups.push(rows.map((t) => normalize(t, table.key, table.label)));
    } catch {
      // skip a table that fails; keep the rest
    }
  }

  return groups.flat().filter((e) => e.name && e.id);
}

/* ------------------------------ shared chrome ------------------------------ */

const STATIC_CSS = `
:root{--bone:#F4EFE6;--ink:#1A1A1A;--tobacco:#8B6F47;--terracotta:#C8501E}
*{box-sizing:border-box}body{margin:0;font-family:system-ui,-apple-system,Segoe UI,sans-serif;background:var(--bone);color:var(--ink);line-height:1.6}
.wrap{max-width:720px;margin:0 auto;padding:32px 20px 64px}
a{color:var(--terracotta)}
header a{font-weight:800;font-size:22px;text-decoration:none;color:var(--ink)}header a b{color:var(--terracotta)}
h1{font-size:28px;margin:24px 0 4px;border-left:4px solid var(--terracotta);padding-left:12px}
h2{font-size:18px;margin:24px 0 8px}
.meta{color:var(--tobacco);font-size:13px;margin:0 0 16px;padding-left:16px}
.pill{display:inline-block;border:1px solid var(--terracotta);color:var(--terracotta);border-radius:999px;padding:1px 10px;font-size:12px;font-weight:600}
ul{padding-left:20px}li{margin:4px 0}
.visit{display:inline-block;background:var(--terracotta);color:#F4EFE6;font-weight:700;padding:10px 22px;border-radius:999px;text-decoration:none;margin-top:16px}
.shot{display:block;width:100%;max-width:560px;height:auto;margin:20px 0;border-radius:12px;border:1px solid rgba(26,26,26,.12)}
footer{margin-top:48px;font-size:12px;color:var(--tobacco)}footer a{color:var(--tobacco)}
`.trim();

function staticShell(opts: {
  title: string;
  metaDesc: string;
  canonicalPath: string;
  body: string;
  /** Extra <head> markup (og:/twitter: cards on tool pages). */
  head?: string;
}): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(opts.title)}</title>
<meta name="description" content="${esc(truncate(opts.metaDesc, 160))}" />
<link rel="canonical" href="${SITE_URL}${opts.canonicalPath}" />
<link rel="icon" href="/favicon.ico" sizes="any" />
${opts.head ?? ""}<style>${STATIC_CSS}</style>
</head>
<body>
<div class="wrap">
<header><a href="/"><b>ai</b>sumate</a></header>
${opts.body}
<footer><a href="/">aisumate</a> — AI Productivity Tools Directory · <a href="/privacy">Privacy</a> · <a href="/terms">Terms</a></footer>
</div>
</body>
</html>`;
}

/* ------------------------------- tool pages -------------------------------- */

function reviewList(label: string, raw: string): string {
  const items = String(raw)
    .split(/[;\n•]+/)
    .map((s) => s.trim())
    .filter((s) => s && !/^(unknown|n\/?a)$/i.test(s));
  if (!items.length) return "";
  return `<h2>${esc(label)}</h2><ul>${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;
}

/**
 * Share card + hero image for a listing.
 *
 * Curated images (Teable "Images" column) win; landing tables otherwise fall
 * back to the automatic homepage screenshot, mirroring what ToolLanding.tsx
 * shows humans. Simple tables (channels, Discord servers, repos) get no
 * screenshot — a shot of a discord.gg invite is noise — so their card falls
 * back to the tool's icon and a small summary card.
 */
/**
 * The server hands out images/iconUrl as same-origin "/api/img?..." proxy
 * paths (see server/imgProxy.ts). Absolutize those for og: tags (crawlers
 * need absolute URLs); still refuse anything that is neither our proxy nor
 * a plain http(s) URL.
 */
function safeImgUrl(u: string): string {
  const t = String(u ?? "").trim();
  if (t.startsWith("/api/img?")) return `${SITE_URL}${t}`;
  return safeUrl(t);
}

function toolImage(e: Entry): { shot: string; ogImage: string } {
  const curated = e.images.map(safeImgUrl).filter(Boolean);
  const href = safeUrl(e.url);
  const shot = curated[0] || (isLandingTable(e.tableKey) && href ? mshotsUrl(href, 1200) : "");
  return { shot, ogImage: shot || safeImgUrl(e.iconUrl) };
}

function toolPageHtml(e: Entry): string {
  const href = safeUrl(e.url);
  const stars = e.rating > 0 ? `★ ${e.rating}/5 · ` : "";
  const { shot, ogImage } = toolImage(e);
  const title = `${e.name} — aisumate`;
  const metaDesc = e.desc || `${e.name} on aisumate, the human-curated AI tools directory.`;
  const canonicalPath = `/tool/${e.tableKey}/${e.id}`;

  // Per-listing share card, so a pasted link previews as the tool rather than
  // as the site. esc() does not escape "'", so every value sits in "quotes".
  const head =
    `<meta property="og:type" content="website" />` +
    `<meta property="og:site_name" content="aisumate" />` +
    `<meta property="og:title" content="${esc(title)}" />` +
    `<meta property="og:description" content="${esc(truncate(metaDesc, 160))}" />` +
    `<meta property="og:url" content="${SITE_URL}${esc(canonicalPath)}" />` +
    (ogImage ? `<meta property="og:image" content="${esc(ogImage)}" />` : "") +
    `<meta name="twitter:card" content="${shot ? "summary_large_image" : "summary"}" />` +
    `<meta name="twitter:title" content="${esc(title)}" />` +
    `<meta name="twitter:description" content="${esc(truncate(metaDesc, 160))}" />` +
    (ogImage ? `<meta name="twitter:image" content="${esc(ogImage)}" />` : "") +
    "\n";

  const body =
    `<h1>${esc(e.name)}</h1>` +
    `<p class="meta">${stars}${e.category ? `<span class="pill">${esc(e.category)}</span>` : ""}</p>` +
    (shot
      ? `<img class="shot" src="${esc(shot)}" alt="${esc(e.name)} homepage" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()" />`
      : "") +
    (e.desc ? `<p>${esc(e.desc)}</p>` : "") +
    reviewList("Pros", e.pros) +
    reviewList("Cons", e.cons) +
    (e.cost && !/^(unknown|n\/?a)$/i.test(e.cost.trim())
      ? `<h2>Cost</h2><p>${esc(e.cost)}</p>`
      : "") +
    (e.verdict ? `<h2>Verdict</h2><p><em>${esc(e.verdict)}</em></p>` : "") +
    reviewHtml(e.reviewTitle, e.review) +
    (href
      ? `<a class="visit" href="${esc(href)}" rel="sponsored nofollow noopener noreferrer">Visit ${esc(e.name)}</a>`
      : "");

  return staticShell({ title, metaDesc, canonicalPath, body, head });
}

function writeToolPages(entries: Entry[]): number {
  let written = 0;
  for (const e of entries) {
    const dir = path.join(OUT, "tools-static", e.tableKey);
    mkdirSync(dir, { recursive: true });
    writeFileSync(path.join(dir, `${e.id}.html`), toolPageHtml(e), "utf8");
    written++;
  }
  return written;
}

/* -------------------------------- blog posts ------------------------------- */

interface BlogEntry {
  slug: string;
  name: string;
  desc: string;
  body: string;
  author: string;
  category: string;
  publishedDate: string;
  iconUrl: string;
}

/**
 * The long-form posts in the AI Media table. Their bodies never reached the
 * crawler before — normalize() only carries the summary — so search engines
 * saw a 40-word teaser of a 12,000-word article. These twins carry the text.
 */
async function collectBlog(): Promise<BlogEntry[]> {
  let rows: Awaited<ReturnType<typeof fetchGenericTools>> = [];
  try {
    rows = await fetchGenericTools("aiMedia");
  } catch {
    return [];
  }
  return rows
    .filter((r) => String(r.bodyEn ?? "").trim())
    .map((r) => ({
      slug: blogSlug(r.slug, r.id),
      name: r.name,
      desc: r.descriptionEn || "",
      body: String(r.bodyEn ?? ""),
      author: r.author || "",
      category: r.category || "",
      publishedDate: r.publishedDate || "",
      iconUrl: r.iconUrl || "",
    }));
}

function blogPageHtml(e: BlogEntry): string {
  const title = `${e.name} — aisumate`;
  const metaDesc = e.desc || e.name;
  const canonicalPath = `/blog/${e.slug}`;
  const ogImage = safeUrl(e.iconUrl);

  const head =
    `<meta property="og:type" content="article" />` +
    `<meta property="og:site_name" content="aisumate" />` +
    `<meta property="og:title" content="${esc(title)}" />` +
    `<meta property="og:description" content="${esc(truncate(metaDesc, 160))}" />` +
    `<meta property="og:url" content="${SITE_URL}${esc(canonicalPath)}" />` +
    (ogImage ? `<meta property="og:image" content="${esc(ogImage)}" />` : "") +
    (e.publishedDate
      ? `<meta property="article:published_time" content="${esc(e.publishedDate)}" />`
      : "") +
    `<meta name="twitter:card" content="summary_large_image" />` +
    `<meta name="twitter:title" content="${esc(title)}" />` +
    `<meta name="twitter:description" content="${esc(truncate(metaDesc, 160))}" />` +
    "\n";

  // Markdown in, plain paragraphs out — same reasoning as reviewHtml().
  const paras = e.body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      const heading = /^(#{2,6})\s+(.*)$/.exec(p.split("\n")[0]);
      if (heading) return `<h2>${esc(heading[2].replace(/\*\*/g, ""))}</h2>`;
      return `<p>${esc(p.replace(/^[#>\-*\s]+/, "").replace(/\*\*/g, "").replace(/\s+/g, " "))}</p>`;
    })
    .join("");

  const body =
    `<h1>${esc(e.name)}</h1>` +
    `<p class="meta">${[e.category, e.author && `By ${e.author}`, e.publishedDate.slice(0, 10)]
      .filter(Boolean)
      .map((s) => esc(String(s)))
      .join(" · ")}</p>` +
    paras;

  return staticShell({ title, metaDesc, canonicalPath, body, head });
}

function writeBlogPages(posts: BlogEntry[]): number {
  const dir = path.join(OUT, "blog-static");
  mkdirSync(dir, { recursive: true });
  for (const p of posts) {
    writeFileSync(path.join(dir, `${p.slug}.html`), blogPageHtml(p), "utf8");
  }
  return posts.length;
}

/* ------------------------------- legal pages ------------------------------- */

function legalHtml(doc: LegalDoc, canonicalPath: string): string {
  const body =
    `<h1>${esc(doc.title)}</h1>` +
    `<p class="meta">Last updated: ${esc(doc.updated)}</p>` +
    `<p>${esc(doc.intro)}</p>` +
    doc.sections
      .map(
        (s) =>
          `<h2>${esc(s.heading)}</h2>` +
          s.paragraphs.map((p) => `<p>${esc(p)}</p>`).join(""),
      )
      .join("");
  return staticShell({
    title: `${doc.title} — aisumate`,
    metaDesc: doc.intro,
    canonicalPath,
    body,
  });
}

/* --------------------------------- catalog --------------------------------- */

function buildCatalogHtml(entries: Entry[], roundedTotal: string): string {
  // Dedupe by name for DISPLAY (a tool can live in several tables) — the kept
  // entry's internal page is the link target. Tool pages exist for every entry.
  const seen = new Set<string>();
  const deduped = entries.filter((e) => {
    const k = e.name.toLowerCase().trim();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  const byCat = new Map<string, Entry[]>();
  for (const e of deduped) {
    const cat = e.category || "Other";
    if (!byCat.has(cat)) byCat.set(cat, []);
    byCat.get(cat)!.push(e);
  }
  const cats = [...byCat.keys()].sort((a, b) => a.localeCompare(b));

  const sections = cats
    .map((cat) => {
      const items = byCat
        .get(cat)!
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((e) => {
          const desc = e.desc ? ` — ${esc(truncate(e.desc, 110))}` : "";
          return `<li><a href="/tool/${esc(e.tableKey)}/${esc(e.id)}"><strong>${esc(e.name)}</strong></a>${desc}</li>`;
        })
        .join("");
      return `<section><h2>${esc(cat)}</h2><ul>${items}</ul></section>`;
    })
    .join("");

  return (
    `${START}` +
    `<div id="seo" hidden>` +
    `<h1>aisumate — AI Productivity Tools Directory</h1>` +
    `<p>Browse ${roundedTotal} human-curated AI tools, rated and reviewed in English and Spanish.</p>` +
    sections +
    `</div>` +
    `${END}`
  );
}

/* --------------------------------- jsonld ---------------------------------- */

function roundedCount(count: number): string {
  return `${(Math.floor(count / 100) * 100).toLocaleString()}+`;
}

function buildJsonLd(count: number): string {
  const description =
    count > 0
      ? `Discover ${roundedCount(count)} human-curated AI productivity tools, rated and reviewed in English and Spanish.`
      : "Discover human-curated AI productivity tools, rated and reviewed in English and Spanish.";
  const data = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "aisumate",
      alternateName: "AI Productivity Tools Directory",
      url: `${SITE_URL}/`,
      description,
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "aisumate",
      url: `${SITE_URL}/`,
      logo: `${SITE_URL}/aisumate-logo-192.png`,
    },
  ];
  return (
    `${LD_START}` +
    `<script type="application/ld+json">${JSON.stringify(data)}</script>` +
    `${LD_END}`
  );
}

/* --------------------------------- sitemap --------------------------------- */

function buildSitemap(entries: Entry[], posts: BlogEntry[]): string {
  const today = new Date().toISOString().slice(0, 10);
  const urls: string[] = [
    `${SITE_URL}/`,
    `${SITE_URL}/privacy`,
    `${SITE_URL}/terms`,
    ...posts.map((p) => `${SITE_URL}/blog/${p.slug}`),
    ...entries.map((e) => `${SITE_URL}/tool/${e.tableKey}/${e.id}`),
  ];
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls
      .map(
        (u) =>
          `  <url><loc>${esc(u)}</loc><lastmod>${today}</lastmod></url>`,
      )
      .join("\n") +
    `\n</urlset>\n`
  );
}

/* ----------------------------------- main ---------------------------------- */

/** Remove any previously-injected block so re-runs stay idempotent. */
function strip(html: string, start: string, end: string): string {
  const re = new RegExp(`${start}[\\s\\S]*?${end}`, "g");
  return html.replace(re, "");
}

const kb = (s: string) => Math.round(Buffer.byteLength(s) / 1024);

async function main() {
  if (!existsSync(INDEX_HTML)) {
    console.warn(`[prerender] ${INDEX_HTML} not found — run \`vite build\` first. Skipping.`);
    return;
  }
  let shell = readFileSync(INDEX_HTML, "utf8");
  shell = strip(shell, START, END);
  shell = strip(shell, LD_START, LD_END);

  // Legal static pages never depend on Teable — always written.
  writeFileSync(path.join(OUT, "privacy.html"), legalHtml(PRIVACY.en, "/privacy"), "utf8");
  writeFileSync(path.join(OUT, "terms.html"), legalHtml(TERMS.en, "/terms"), "utf8");

  // Best-effort catalogue: a failure here means no catalogue, never a broken build.
  let entries: Entry[] = [];
  try {
    entries = await collect();
  } catch (err) {
    console.warn("[prerender] Teable fetch failed — shipping shell without catalogue.", err);
  }

  const jsonld = buildJsonLd(entries.length);

  // app.html — lean human shell + JSON-LD. ALWAYS written (it's the "/" target).
  const humanHtml = shell.replace("</head>", `${jsonld}</head>`);
  writeFileSync(APP_HTML, humanHtml, "utf8");

  // seo.html — shell + catalogue when we have it (identical to app.html if not).
  const botHtml = entries.length
    ? humanHtml.replace(
        '<div id="root">',
        `${buildCatalogHtml(entries, roundedCount(entries.length))}<div id="root">`,
      )
    : humanHtml;
  writeFileSync(SEO_HTML, botHtml, "utf8");

  // Per-tool + per-post static pages, and the full sitemap (only when the
  // catalogue fetched — a Teable outage must not blank an existing sitemap).
  const posts = await collectBlog();
  const blogPages = writeBlogPages(posts);
  let toolPages = 0;
  if (entries.length) {
    toolPages = writeToolPages(entries);
    writeFileSync(path.join(OUT, "sitemap.xml"), buildSitemap(entries, posts), "utf8");
  }

  // Remove index.html so "/" resolves through the vercel.json UA rewrite
  // (a filesystem index.html is served before rewrites run).
  if (existsSync(INDEX_HTML)) rmSync(INDEX_HTML);

  console.log(
    `[prerender] app.html ${kb(humanHtml)} KB · seo.html ${kb(botHtml)} KB · ` +
      `${toolPages} tool pages · ${blogPages} blog pages · ` +
      `sitemap ${entries.length ? entries.length + posts.length + 3 : "(kept static)"} URLs · ` +
      `privacy/terms static · removed index.html.`,
  );
}

main();
