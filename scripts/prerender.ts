/**
 * Build-time prerender for SEO.
 *
 * The site is a client-rendered SPA served (on Vercel) as a static
 * `dist/public/index.html`, so crawlers reading the raw HTML — Google's first
 * pass, social scrapers, non-JS bots — see only an empty shell. This runs AFTER
 * `vite build` and produces two static files (dynamic rendering):
 *
 *   • index.html  — the lean human shell, plus small JSON-LD structured data.
 *   • seo.html    — the same shell PLUS the full tool catalog (every tool by
 *                   category, as text). Only bots are routed here (see the
 *                   user-agent rewrite in vercel.json), so humans never pay for
 *                   the catalog bytes, and the CDN still serves both statically.
 *
 * seo.html also carries #root + the app scripts, so if a human is ever routed
 * there the SPA still boots normally. The catalog is `hidden` (no flash).
 *
 * Best-effort: any failure (missing env, Teable down) logs a warning and leaves
 * the shell untouched so a deploy is never blocked.
 */
import "dotenv/config";
import { readFileSync, writeFileSync, existsSync, rmSync } from "node:fs";
import path from "node:path";
import {
  GENERIC_TABLES,
  fetchGenericTools,
  fetchAllTools,
  fetchLlmModels,
  fetchGithubRepos,
  fetchWeeklyViralGithubRepos,
} from "../server/teable";

const SITE_URL = "https://www.aisumate.com/";
// vite emits index.html; we split it into app.html (humans) + seo.html (bots)
// and remove index.html so "/" resolves through the vercel.json user-agent
// rewrite instead of being served straight off the filesystem.
const INDEX_HTML = path.resolve(process.cwd(), "dist/public/index.html");
const APP_HTML = path.resolve(process.cwd(), "dist/public/app.html");
const SEO_HTML = path.resolve(process.cwd(), "dist/public/seo.html");
const START = "<!--seo-prerender-start-->";
const END = "<!--seo-prerender-end-->";
const LD_START = "<!--seo-jsonld-start-->";
const LD_END = "<!--seo-jsonld-end-->";

interface Entry {
  name: string;
  desc: string;
  url: string;
  category: string;
}

function esc(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function truncate(s: string, n = 200): string {
  const t = String(s ?? "").replace(/\s+/g, " ").trim();
  return t.length > n ? t.slice(0, n - 1).trimEnd() + "…" : t;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function normalize(item: any, fallbackCategory: string): Entry {
  return {
    name: item.name || item.title || "",
    desc:
      item.descriptionEn || item.summaryEn || item.description || item.whyViral || "",
    url: item.url || item.repoUrl || item.dealUrl || item.website || "",
    category:
      item.category || item.providerType || item.topic || item.platform || fallbackCategory || "",
  };
}

async function collect(): Promise<Entry[]> {
  const groups: Entry[][] = [];
  // AI Tools + LLMs + GitHub (+ weekly viral) + every generic category table.
  const [aiTools, llms, repos, viral] = await Promise.all([
    fetchAllTools().catch(() => []),
    fetchLlmModels().catch(() => []),
    fetchGithubRepos().catch(() => []),
    fetchWeeklyViralGithubRepos().catch(() => []),
  ]);
  groups.push(aiTools.map((t) => normalize(t, "AI Tools")));
  groups.push(llms.map((t) => normalize(t, "LLMs")));
  groups.push(repos.map((t) => normalize(t, "GitHub Repos")));
  groups.push(viral.map((t) => normalize(t, "GitHub Repos")));

  // Generic tables one at a time — gentle on Teable's rate limit.
  for (const table of GENERIC_TABLES) {
    try {
      const rows = await fetchGenericTools(table.key);
      groups.push(rows.map((t) => normalize(t, table.label)));
    } catch {
      // skip a table that fails; keep the rest
    }
  }

  // Flatten + dedupe by name (case-insensitive), keeping the first seen.
  const seen = new Set<string>();
  const out: Entry[] = [];
  for (const entry of groups.flat()) {
    if (!entry.name) continue;
    const key = entry.name.toLowerCase().trim();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(entry);
  }
  return out;
}

function buildCatalogHtml(entries: Entry[]): string {
  // Group by category, categories A→Z, tools A→Z within each.
  const byCat = new Map<string, Entry[]>();
  for (const e of entries) {
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
          // Name + description as TEXT only — no outbound <a> links. The text is
          // what search engines index; a wall of thousands of hidden external
          // links would add nothing for aisumate and risks looking spammy.
          const desc = e.desc ? ` — ${esc(truncate(e.desc))}` : "";
          return `<li><strong>${esc(e.name)}</strong>${desc}</li>`;
        })
        .join("");
      return `<section><h2>${esc(cat)}</h2><ul>${items}</ul></section>`;
    })
    .join("");

  return (
    `${START}` +
    `<div id="seo" hidden>` +
    `<h1>aisumate — AI Productivity Tools Directory</h1>` +
    `<p>Browse ${entries.length.toLocaleString()} human-curated AI tools, rated and reviewed in English and Spanish.</p>` +
    sections +
    `</div>` +
    `${END}`
  );
}

function buildJsonLd(count: number): string {
  const description =
    count > 0
      ? `Discover ${count.toLocaleString()} human-curated AI productivity tools, rated and reviewed in English and Spanish.`
      : "Discover human-curated AI productivity tools, rated and reviewed in English and Spanish.";
  const data = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "aisumate",
      alternateName: "AI Productivity Tools Directory",
      url: SITE_URL,
      description,
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "aisumate",
      url: SITE_URL,
      logo: `${SITE_URL}aisumate-logo-192.png`,
    },
  ];
  return (
    `${LD_START}` +
    `<script type="application/ld+json">${JSON.stringify(data)}</script>` +
    `${LD_END}`
  );
}

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
  // Start from a clean shell (strip any prior injection so re-runs are idempotent).
  let shell = readFileSync(INDEX_HTML, "utf8");
  shell = strip(shell, START, END);
  shell = strip(shell, LD_START, LD_END);

  // Best-effort catalog: a failure here just means no catalog, never a broken build.
  let entries: Entry[] = [];
  try {
    entries = await collect();
  } catch (err) {
    console.warn("[prerender] Teable fetch failed — shipping shell without catalog.", err);
  }

  const jsonld = buildJsonLd(entries.length);

  // app.html — lean human shell + JSON-LD. ALWAYS written (it's the "/" target).
  const humanHtml = shell.replace("</head>", `${jsonld}</head>`);
  writeFileSync(APP_HTML, humanHtml, "utf8");

  // seo.html — same shell + the full catalog when we have it, else identical to
  // app.html so the bot route never 404s.
  const botHtml = entries.length
    ? humanHtml.replace('<div id="root">', `${buildCatalogHtml(entries)}<div id="root">`)
    : humanHtml;
  writeFileSync(SEO_HTML, botHtml, "utf8");

  // Remove index.html so a request for "/" falls through to the UA rewrite
  // (Vercel serves a filesystem index.html before rewrites run, which would
  // otherwise bypass dynamic rendering for the homepage).
  if (existsSync(INDEX_HTML)) rmSync(INDEX_HTML);

  console.log(
    `[prerender] app.html ${kb(humanHtml)} KB (human) · seo.html ${kb(botHtml)} KB ` +
      `(${entries.length} tools, bots only) · removed index.html.`,
  );
}

main();
