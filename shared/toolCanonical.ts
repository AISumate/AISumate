/**
 * Canonical URL for a tool listed twice.
 *
 * This Week's AI Picks re-lists products that often already have a row in the
 * main tools table, under a different Teable record id. Both URLs were
 * prerendered with a self-referencing canonical and both were in the sitemap,
 * which Search Console reports as "Duplicate without user-selected canonical".
 * The picks page is still rendered for visitors and crawlers. When the product
 * is the same one, its canonical (and the sitemap) point at the tools URL.
 *
 * A pick matches a tools row when, in order:
 *
 * 1. Official URL keys are equal. Scheme, a leading www, userinfo, the default
 *    port, query, hash, a trailing slash, and a trailing /index.html are
 *    ignored, so a tracking query does not split one product.
 * 2. Normalized names are equal and the hostnames are equal — the same site
 *    at two paths, such as the homepage and /create.
 * 3. Normalized names are equal and at least one official URL is missing.
 *    If the pick has no URL and several tools rows share that name on
 *    different hosts, the match is ambiguous and is refused.
 *
 * Names are equal when, after case-folding, "&" → "and", and stripping
 * punctuation and spaces, the keys match and are at least 3 characters.
 * Different hostnames on both sides block a name-only match, so two products
 * that only share a display name stay separate.
 *
 * Other feeds are not folded into tools. They are separate inventories. Only
 * the picks table is a shortlist whose rows graduate into the main table.
 */
import { validHttpUrl } from "./reviewSanitize";

export interface CanonicalListing {
  tableKey: string;
  id: string;
  name: string;
  url: string;
}

export type CanonicalMatchReason = "url" | "host-and-name" | "name";

export interface CanonicalMatch {
  id: string;
  reason: CanonicalMatchReason;
}

export interface CanonicalToolIndex {
  byUrl: Map<string, CanonicalListing[]>;
  byHostAndName: Map<string, CanonicalListing[]>;
  byName: Map<string, CanonicalListing[]>;
}

/** Official URL identity: hostname without www, plus path, without query. */
export interface OfficialUrlIdentity {
  host: string;
  key: string;
}

const PICKS_TABLE = "thisWeeksAiPicks";
const TOOLS_TABLE = "tools";
const MIN_NAME_KEY = 3;

/** Alphanumeric product key. "UI Verify", "UI-Verify", and "uiverify" agree. */
export function normalizeToolName(name: string): string {
  return String(name ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "");
}

/**
 * Host + path identity of an official http(s) URL.
 * Empty when the cell is blank or not an http(s) URL.
 */
export function officialUrlIdentity(url: string): OfficialUrlIdentity {
  const raw = validHttpUrl(String(url ?? ""));
  if (!raw) return { host: "", key: "" };
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return { host: "", key: "" };
  }
  let host = parsed.hostname.toLowerCase().replace(/^www\./, "");
  if (!host) return { host: "", key: "" };
  const port = parsed.port;
  if (port && port !== "80" && port !== "443") host = `${host}:${port}`;
  let path = parsed.pathname.toLowerCase().replace(/\/+$/, "");
  path = path.replace(/\/index\.html$/, "").replace(/\/+$/, "");
  return { host, key: `${host}${path}` };
}

function hostNameKey(host: string, nameKey: string): string {
  return `${host}\n${nameKey}`;
}

function push(
  map: Map<string, CanonicalListing[]>,
  key: string,
  listing: CanonicalListing
): void {
  const list = map.get(key);
  if (list) list.push(listing);
  else map.set(key, [listing]);
}

/** Index main-tools rows only. Other tables in the list are ignored. */
export function indexCanonicalTools(
  listings: readonly CanonicalListing[]
): CanonicalToolIndex {
  const byUrl = new Map<string, CanonicalListing[]>();
  const byHostAndName = new Map<string, CanonicalListing[]>();
  const byName = new Map<string, CanonicalListing[]>();
  for (const listing of listings) {
    if (listing.tableKey !== TOOLS_TABLE || !listing.id) continue;
    const nameKey = normalizeToolName(listing.name);
    const { host, key } = officialUrlIdentity(listing.url);
    if (key) push(byUrl, key, listing);
    if (host && nameKey.length >= MIN_NAME_KEY) {
      push(byHostAndName, hostNameKey(host, nameKey), listing);
    }
    if (nameKey.length >= MIN_NAME_KEY) push(byName, nameKey, listing);
  }
  return { byUrl, byHostAndName, byName };
}

/**
 * Same name wins inside a tier, then the lowest record id, so a rebuild
 * does not swing the canonical between two identical tools rows.
 */
function choose(
  candidates: readonly CanonicalListing[],
  pickName: string
): CanonicalListing | undefined {
  const want = normalizeToolName(pickName);
  return [...candidates].sort((a, b) => {
    const aNamed = normalizeToolName(a.name) === want ? 0 : 1;
    const bNamed = normalizeToolName(b.name) === want ? 0 : 1;
    if (aNamed !== bNamed) return aNamed - bNamed;
    if (a.id < b.id) return -1;
    if (a.id > b.id) return 1;
    return 0;
  })[0];
}

function hostsOf(listings: readonly CanonicalListing[]): Set<string> {
  const hosts = new Set<string>();
  for (const listing of listings) {
    const host = officialUrlIdentity(listing.url).host;
    if (host) hosts.add(host);
  }
  return hosts;
}

export function matchCanonicalTool(
  pick: { name: string; url: string },
  index: CanonicalToolIndex
): CanonicalMatch | null {
  const nameKey = normalizeToolName(pick.name);
  const { host, key } = officialUrlIdentity(pick.url);
  const nameOk = nameKey.length >= MIN_NAME_KEY;

  if (key) {
    const byUrl = index.byUrl.get(key);
    const winner = byUrl?.length ? choose(byUrl, pick.name) : undefined;
    if (winner) return { id: winner.id, reason: "url" };
  }

  if (host && nameOk) {
    const byHost = index.byHostAndName.get(hostNameKey(host, nameKey));
    const winner = byHost?.length ? choose(byHost, pick.name) : undefined;
    if (winner) return { id: winner.id, reason: "host-and-name" };
  }

  if (!nameOk) return null;
  const byName = index.byName.get(nameKey);
  if (!byName?.length) return null;

  // Pick has an official URL. Only a tools row that is missing its URL can
  // still be the same product; a different host is a different product.
  if (host) {
    const missingUrl = byName.filter(
      tool => !officialUrlIdentity(tool.url).host
    );
    const winner = missingUrl.length
      ? choose(missingUrl, pick.name)
      : undefined;
    return winner ? { id: winner.id, reason: "name" } : null;
  }

  // Pick has no URL. One shared host (or none) is safe; two hosts is a guess.
  if (hostsOf(byName).size > 1) return null;
  const winner = choose(byName, pick.name);
  return winner ? { id: winner.id, reason: "name" } : null;
}

/** Path used for <link rel=canonical> and og:url. Picks may point at tools. */
export function listingCanonicalPath(
  entry: CanonicalListing,
  index: CanonicalToolIndex
): string {
  const self = `/tool/${entry.tableKey}/${entry.id}`;
  if (entry.tableKey !== PICKS_TABLE) return self;
  const match = matchCanonicalTool(entry, index);
  if (!match) return self;
  return `/tool/${TOOLS_TABLE}/${match.id}`;
}

/**
 * True when this picks URL should be left out of the sitemap because a tools
 * row already is the canonical URL. Every other listing stays listed.
 */
export function isDuplicatePickPage(
  entry: CanonicalListing,
  index: CanonicalToolIndex
): boolean {
  return (
    entry.tableKey === PICKS_TABLE && matchCanonicalTool(entry, index) !== null
  );
}
