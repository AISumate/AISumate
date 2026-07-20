import { ENV } from "./_core/env";
import { delay, staggeredAll } from "./_core/batch";
import { isPlaceholderValue, validHttpUrl } from "@shared/reviewSanitize";

/**
 * Teable API integration module.
 * All calls to Teable happen server-side so the API key is never exposed to the client.
 */

export interface TeableRecord {
  id: string;
  name: string;
  fields: Record<string, unknown>;
  createdTime?: string;
}

export interface TeableField {
  id: string;
  name: string;
  type: string;
  description?: string;
}

// --- Type definitions for each data source ---

/** Verified review fields shared by all content tables (Data Flags are internal-only and never surfaced). */
export interface ReviewFields {
  prosEn: string;
  consEn: string;
  costEn: string;
  verdictEn: string;
  prosEs: string;
  consEs: string;
  costEs: string;
  verdictEs: string;
  /** "high" | "medium" | "low" | "" */
  reviewConfidence: string;
}

export interface AiTool extends ReviewFields {
  id: string;
  name: string;
  descriptionEn: string;
  descriptionEs: string;
  category: string;
  url: string;
  affiliateUrl: string;
  iconUrl: string;
  isAffiliate: boolean;
  rating: number;
  isNew: boolean;
}

export interface GithubRepo {
  id: string;
  name: string;
  repoUrl: string;
  description: string;
  descriptionEn: string;
  descriptionEs: string;
  owner: string;
  language: string;
  stars: number;
  status: string;
  rating: number;
  isNew: boolean;
}

export interface WeeklyViralRepo extends ReviewFields {
  id: string;
  name: string;
  repoUrl: string;
  description: string;
  descriptionEn: string;
  descriptionEs: string;
  owner: string;
  language: string;
  stars: number;
  starsThisWeek: number;
  weeklyRank: number;
  weekEnding: string;
  whyViral: string;
  iconUrl: string;
  rating: number;
}

export interface LlmModel extends ReviewFields {
  id: string;
  name: string;
  summaryEn: string;
  summaryEs: string;
  providerType: string;
  url: string;
  affiliateUrl: string;
  iconUrl: string;
  isAffiliate: boolean;
  rating: number;
  isNew: boolean;
}

export interface LtdDeal extends ReviewFields {
  id: string;
  name: string;
  website: string;
  summaryEn: string;
  summaryEs: string;
  dealUrl: string;
  platform: string;
  status: string;
  iconUrl: string;
  rating: number;
  isNew: boolean;
}

export interface GenericTool extends ReviewFields {
  id: string;
  name: string;
  descriptionEn: string;
  descriptionEs: string;
  url: string;
  affiliateUrl: string;
  iconUrl: string;
  category: string;
  isAffiliate: boolean;
  rating: number;
  isNew: boolean;
  /**
   * Content-language flags (currently only populated on AI Influencers via
   * its "English"/"Spanish" checkbox columns) — the CHANNEL's own broadcast
   * language, independent of the site's EN/ES UI toggle which still governs
   * which of descriptionEn/descriptionEs is shown.
   */
  isEnglishContent: boolean;
  isSpanishContent: boolean;
  /** Popularity metric (currently only populated on AI Influencers via its "Subscribers" column). */
  popularity: number;
  /** Curated rank (currently only populated on AI Influencers and Sumate Top Recommendations via their "Rank" column). */
  rank: number;
  /** Blog-post fields (currently only populated on AI Media). */
  slug: string;
  bodyEn: string;
  /** Empty until a "Body - ES" column exists in Teable — client falls back to bodyEn. */
  bodyEs: string;
  author: string;
  tags: string[];
  readingTimeMinutes: number;
  publishedDate: string;
}

// --- Cache with stale-on-error ---

type CachedData<T> = {
  data: T[];
  timestamp: number;
};

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const caches = new Map<string, CachedData<unknown>>();

/**
 * Serve fresh cache when valid; otherwise fetch. If the fetch fails and we
 * hold stale data, serve the stale data instead of caching an empty result —
 * a Teable outage must never blank the site for the TTL window.
 */
async function withCache<T>(key: string, fetcher: () => Promise<T[]>): Promise<T[]> {
  const cached = caches.get(key) as CachedData<T> | undefined;
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }
  try {
    const data = await fetcher();
    caches.set(key, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    console.error(
      `[Teable] Fetch failed for "${key}"${cached ? " — serving stale cache" : ""}:`,
      error
    );
    return cached ? cached.data : [];
  }
}

// --- Field helpers ---

function str(f: Record<string, unknown>, key: string): string {
  const v = f[key];
  if (v === null || v === undefined) return "";
  return String(v);
}

/** Like str(), but placeholder values ("Unknown", "N/A", …) are treated as empty. */
function cleanStr(f: Record<string, unknown>, key: string): string {
  const v = str(f, key);
  return isPlaceholderValue(v) ? "" : v;
}

/** Only real http(s) URLs pass — "Unknown"/"N/A" in a URL cell must not become a link. */
const validUrl = validHttpUrl;

function num(f: Record<string, unknown>, key: string): number {
  const v = f[key];
  if (v === null || v === undefined) return 0;
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}

function bool(f: Record<string, unknown>, key: string): boolean {
  const v = f[key];
  if (v === null || v === undefined) return false;
  const s = String(v).toLowerCase().trim();
  return s === "true" || s === "1" || s === "yes";
}

/** Try multiple possible field name variants for logo URL */
function logoUrl(f: Record<string, unknown>): string {
  return validUrl(str(f, "LogoUrl") || str(f, "LogoURL") || str(f, "Logo Url") || str(f, "Logo URL") || "");
}

/** Try multiple possible field name variants for affiliate URL */
function affiliateUrl(f: Record<string, unknown>): string {
  return validUrl(str(f, "AffiliateUrl") || str(f, "AffiliateURL") || str(f, "Affiliate URL") || str(f, "Affiliate Url") || "");
}

/** Try multiple possible field name variants for outbound URL */
function outboundUrl(f: Record<string, unknown>): string {
  return validUrl(str(f, "OutboundUrl") || str(f, "Outbound URL") || str(f, "Website") || str(f, "Repository URL") || str(f, "URL") || "");
}

/**
 * Derive a favicon URL from a tool's website so no logo has to be curated by
 * hand. Google's favicon service resolves icons for any registered domain.
 */
export function deriveFaviconUrl(siteUrl: string): string {
  if (!siteUrl) return "";
  try {
    const { hostname } = new URL(siteUrl);
    if (!hostname) return "";
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=128`;
  } catch {
    return "";
  }
}

/** Manually curated logo wins; otherwise fall back to the site's favicon. */
function iconUrlFor(f: Record<string, unknown>, siteUrl: string): string {
  return logoUrl(f) || deriveFaviconUrl(siteUrl);
}

/** Map the verified review columns. Data Flags stay server-side by design. */
function reviewFields(f: Record<string, unknown>): ReviewFields {
  return {
    prosEn: cleanStr(f, "Pros - EN"),
    consEn: cleanStr(f, "Cons - EN"),
    costEn: cleanStr(f, "Cost - EN"),
    verdictEn: cleanStr(f, "Verdict - EN"),
    prosEs: cleanStr(f, "Pros - ES"),
    consEs: cleanStr(f, "Cons - ES"),
    costEs: cleanStr(f, "Cost - ES"),
    verdictEs: cleanStr(f, "Verdict - ES"),
    reviewConfidence: str(f, "Review Confidence").toLowerCase().trim(),
  };
}

const NEW_BADGE_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Check if a Teable record was created within the "New" badge window.
 * Teable's own createdTime is the source of truth — the InputDate field was
 * once bulk-stamped across whole tables, so it's only a last-resort fallback.
 */
function isNewRecord(record: TeableRecord): boolean {
  const inputDate = str(record.fields, "InputDate") || str(record.fields, "Input Date") || str(record.fields, "inputDate");
  const createdTime = record.createdTime || str(record.fields, "Created Time") || str(record.fields, "Created") || str(record.fields, "Date Added") || str(record.fields, "Date Created") || inputDate;
  if (!createdTime) return false;
  const created = new Date(createdTime).getTime();
  if (isNaN(created)) return false;
  return Date.now() - created < NEW_BADGE_WINDOW_MS;
}

// --- Fetching ---

/** Retry a fetch with exponential backoff on 429 responses. */
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3): Promise<Response> {
  let lastResponse: Response | null = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(url, options);
    if (response.status !== 429) return response;
    lastResponse = response;
    const backoffMs = Math.min(500 * Math.pow(2, attempt), 4000);
    console.warn(`[Teable] Rate limited (429), retrying in ${backoffMs}ms (attempt ${attempt + 1}/${maxRetries + 1}) for ${url}`);
    await delay(backoffMs);
  }
  return lastResponse!;
}

/**
 * Fetch every record of a table, paginating past the 1000-record limit.
 * Throws on failure so callers can distinguish "empty table" from "Teable is
 * down" — withCache relies on this to serve stale data instead of caching [].
 */
async function fetchAllRecords(tableId: string): Promise<TeableRecord[]> {
  const apiUrl = ENV.teableApiUrl;
  const apiKey = ENV.teableApiKey;

  if (!apiUrl || !tableId || !apiKey) {
    console.warn("[Teable] Missing configuration for table:", tableId);
    return [];
  }

  const allRecords: TeableRecord[] = [];
  const pageSize = 1000;
  let skip = 0;
  let hasMore = true;

  while (hasMore) {
    const url = `${apiUrl}/table/${tableId}/record?take=${pageSize}&skip=${skip}&fieldKeyType=name&cellFormat=text`;
    const response = await fetchWithRetry(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Teable API returned ${response.status} for table ${tableId}`);
    }

    const data = (await response.json()) as { records: (TeableRecord & { createdTime?: string; fields: Record<string, unknown> })[] };
    const records: TeableRecord[] = (data.records ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      fields: r.fields,
      createdTime: r.createdTime,
    }));
    allRecords.push(...records);

    if (records.length < pageSize) {
      hasMore = false;
    } else {
      skip += pageSize;
    }
  }

  return allRecords;
}

// --- Generic tool tables (identical schema, one mapper) ---

function mapGenericTool(record: TeableRecord): GenericTool {
  const f = record.fields ?? {};
  const out = outboundUrl(f);
  return {
    id: record.id,
    name: str(f, "Name") || record.name || "Untitled",
    descriptionEn: cleanStr(f, "Summary - EN") || cleanStr(f, "Summary"),
    descriptionEs: cleanStr(f, "Summary - ES") || cleanStr(f, "Summary"),
    url: out,
    affiliateUrl: affiliateUrl(f),
    iconUrl: iconUrlFor(f, out),
    category: cleanStr(f, "Category"),
    isAffiliate: bool(f, "Affiliate"),
    rating: num(f, "Rating 1-5"),
    isNew: isNewRecord(record),
    isEnglishContent: bool(f, "English"),
    isSpanishContent: bool(f, "Spanish"),
    popularity: num(f, "Subscribers"),
    rank: num(f, "Rank"),
    slug: cleanStr(f, "Slug"),
    bodyEn: cleanStr(f, "Body - EN"),
    bodyEs: cleanStr(f, "Body - ES"),
    author: cleanStr(f, "Author"),
    tags: str(f, "Tags").split(",").map((s) => s.trim()).filter(Boolean),
    readingTimeMinutes: num(f, "Reading Time"),
    publishedDate: normalizeDate(f["InputDate"]),
    ...reviewFields(f),
  };
}

/**
 * Registry of all generic tool tables. Adding a new section is one line here
 * (plus its env var); the fetcher, router, global search, and total count all
 * derive from this list.
 */
export const GENERIC_TABLES = [
  { key: "videoImage", label: "Video & Image", tableId: () => ENV.teableVideoImageTableId },
  { key: "musicVoice", label: "Music & Voice", tableId: () => ENV.teableMusicVoiceTableId },
  { key: "chatbots", label: "Chatbots & Agents", tableId: () => ENV.teableChatbotsTableId },
  { key: "freeApis", label: "Free APIs", tableId: () => ENV.teableFreeApisTableId },
  { key: "freeLlmIde", label: "Free LLM & IDE", tableId: () => ENV.teableFreeLlmIdeTableId },
  { key: "vibeCoding", label: "Vibe Coding", tableId: () => ENV.teableVibeCodingTableId },
  { key: "designerTools", label: "Designer Tools", tableId: () => ENV.teableDesignerToolsTableId },
  { key: "aiInfra", label: "AI Infrastructure", tableId: () => ENV.teableAiInfraTableId },
  { key: "hardware", label: "Hardware & Computers", tableId: () => ENV.teableHardwareTableId },
  { key: "testingTools", label: "Testing Tools", tableId: () => ENV.teableTestingToolsTableId },
  { key: "aiSecurity", label: "AI Security", tableId: () => ENV.teableAiSecurityTableId },
  { key: "businessProductivity", label: "Business Productivity", tableId: () => ENV.teableBusinessProductivityTableId },
  { key: "mcpProviders", label: "MCP Providers", tableId: () => ENV.teableMcpProvidersTableId },
  { key: "vpsCloud", label: "VPS & Cloud", tableId: () => ENV.teableVpsCloudTableId },
  { key: "aiMedia", label: "AI Media", tableId: () => ENV.teableAiMediaTableId },
  { key: "aiInfluencers", label: "AI Influencers", tableId: () => ENV.teableAiInfluencersTableId },
  { key: "aiSites", label: "AI Sites", tableId: () => ENV.teableAiSitesTableId },
  { key: "aiDiscord", label: "AI Discord", tableId: () => ENV.teableAiDiscordTableId },
  { key: "auSeoTools", label: "AU SEO Tools", tableId: () => ENV.teableAuSeoToolsTableId },
  { key: "sumateTopRecommendations", label: "Sumate Top Recommendations", tableId: () => ENV.teableSumateTopRecommendationsTableId },
] as const;

export type GenericTableKey = (typeof GENERIC_TABLES)[number]["key"];

export async function fetchGenericTools(key: GenericTableKey): Promise<GenericTool[]> {
  const table = GENERIC_TABLES.find((t) => t.key === key);
  if (!table) return [];
  return withCache(key, async () => {
    const records = await fetchAllRecords(table.tableId());
    // "Published" (currently only on AI Media) gates drafts from the public site;
    // a no-op filter on every other table, which never has this column.
    const tools = records
      .filter((r) => r.fields["Published"] === undefined || bool(r.fields, "Published"))
      .map(mapGenericTool);
    tools.sort((a, b) => a.name.localeCompare(b.name));
    return tools;
  });
}

// Named fetchers kept as the stable public API (routers and tests use them).
export const fetchVideoImageTools = () => fetchGenericTools("videoImage");
export const fetchMusicVoiceTools = () => fetchGenericTools("musicVoice");
export const fetchChatbotsTools = () => fetchGenericTools("chatbots");
export const fetchFreeApisTools = () => fetchGenericTools("freeApis");
export const fetchFreeLlmIdeTools = () => fetchGenericTools("freeLlmIde");
export const fetchVibeCodingTools = () => fetchGenericTools("vibeCoding");
export const fetchDesignerTools = () => fetchGenericTools("designerTools");
export const fetchAiInfraTools = () => fetchGenericTools("aiInfra");
export const fetchHardwareTools = () => fetchGenericTools("hardware");
export const fetchTestingTools = () => fetchGenericTools("testingTools");
export const fetchAiSecurityTools = () => fetchGenericTools("aiSecurity");
export const fetchBusinessProductivityTools = () => fetchGenericTools("businessProductivity");
export const fetchMcpProvidersTools = () => fetchGenericTools("mcpProviders");
export const fetchVpsCloudTools = () => fetchGenericTools("vpsCloud");
export const fetchAiMediaTools = () => fetchGenericTools("aiMedia");
export const fetchAiInfluencersTools = () => fetchGenericTools("aiInfluencers");
export const fetchAiSitesTools = () => fetchGenericTools("aiSites");
export const fetchAiDiscordTools = () => fetchGenericTools("aiDiscord");
export const fetchAuSeoTools = () => fetchGenericTools("auSeoTools");
export const fetchSumateTopRecommendations = () => fetchGenericTools("sumateTopRecommendations");

// --- Tools (main table) ---

export async function fetchAllTools(): Promise<AiTool[]> {
  return withCache("tools", async () => {
    const records = await fetchAllRecords(ENV.teableTableId);
    const tools = records.map((record) => {
      const f = record.fields ?? {};
      const out = outboundUrl(f);
      return {
        id: record.id,
        name: str(f, "Name") || record.name || "Untitled",
        descriptionEn: cleanStr(f, "Summary - EN") || cleanStr(f, "Summary"),
        descriptionEs: cleanStr(f, "Summary - ES") || cleanStr(f, "Summary"),
        category: cleanStr(f, "Category"),
        url: out,
        affiliateUrl: affiliateUrl(f),
        iconUrl: iconUrlFor(f, out),
        isAffiliate: bool(f, "Affiliate"),
        rating: num(f, "Rating 1-5"),
        isNew: isNewRecord(record),
        ...reviewFields(f),
      };
    });
    tools.sort((a, b) => a.name.localeCompare(b.name));
    return tools;
  });
}

// --- GitHub Repos ---

export async function fetchGithubRepos(): Promise<GithubRepo[]> {
  return withCache("github", async () => {
    const records = await fetchAllRecords(ENV.teableGithubTableId);
    const repos = records.map((record) => {
      const f = record.fields ?? {};
      return {
        id: record.id,
        name: str(f, "Name") || record.name || "Untitled",
        repoUrl: validUrl(str(f, "Repository URL")),
        description: cleanStr(f, "Description"),
        descriptionEn: cleanStr(f, "Summary - EN") || cleanStr(f, "Description"),
        descriptionEs: cleanStr(f, "Summary - ES") || cleanStr(f, "Description"),
        owner: str(f, "Owner"),
        language: cleanStr(f, "Language"),
        stars: num(f, "Stars"),
        status: cleanStr(f, "Status"),
        rating: num(f, "Rating 1-5"),
        isNew: isNewRecord(record),
      };
    });
    repos.sort((a, b) => b.stars - a.stars);
    return repos;
  });
}

// --- Weekly Viral GitHub Repos (curated trending highlight, refreshed weekly) ---

export async function fetchWeeklyViralGithubRepos(): Promise<WeeklyViralRepo[]> {
  return withCache("weeklyViralGithub", async () => {
    const records = await fetchAllRecords(ENV.teableWeeklyViralGithubTableId);
    const repos = records.map((record) => {
      const f = record.fields ?? {};
      const repoUrl = validUrl(str(f, "Repository URL"));
      const description = cleanStr(f, "Description");
      return {
        id: record.id,
        name: str(f, "Name") || record.name || "Untitled",
        repoUrl,
        description,
        descriptionEn: cleanStr(f, "Summary - EN") || description,
        descriptionEs: cleanStr(f, "Summary - ES") || description,
        owner: str(f, "Owner"),
        language: cleanStr(f, "Language"),
        stars: num(f, "Stars"),
        starsThisWeek: num(f, "Stars This Week"),
        weeklyRank: num(f, "Weekly Rank"),
        weekEnding: normalizeDate(f["Week Ending"]),
        whyViral: cleanStr(f, "Why Viral"),
        iconUrl: iconUrlFor(f, repoUrl),
        rating: num(f, "Rating 1-5"),
        ...reviewFields(f),
      };
    });
    // Weekly Rank ascending (1 = most viral); unranked rows sink to the bottom.
    repos.sort((a, b) => {
      const ar = a.weeklyRank || Infinity;
      const br = b.weeklyRank || Infinity;
      return ar !== br ? ar - br : b.starsThisWeek - a.starsThisWeek;
    });
    return repos;
  });
}

// --- LLMs ---

export async function fetchLlmModels(): Promise<LlmModel[]> {
  return withCache("llms", async () => {
    const records = await fetchAllRecords(ENV.teableLlmTableId);
    const models = records.map((record) => {
      const f = record.fields ?? {};
      const out = outboundUrl(f);
      return {
        id: record.id,
        name: str(f, "Name") || record.name || "Untitled",
        summaryEn: cleanStr(f, "Summary - EN") || cleanStr(f, "Summary"),
        summaryEs: cleanStr(f, "Summary - ES") || cleanStr(f, "Summary"),
        providerType: cleanStr(f, "Provider Type"),
        url: out,
        affiliateUrl: affiliateUrl(f),
        iconUrl: iconUrlFor(f, out),
        isAffiliate: bool(f, "Affiliate"),
        rating: num(f, "Rating 1-5"),
        isNew: isNewRecord(record),
        ...reviewFields(f),
      };
    });
    models.sort((a, b) => a.name.localeCompare(b.name));
    return models;
  });
}

// --- Date helper ---

/** Normalize Teable date cells (text, ISO, or epoch ms) to an ISO string. */
function normalizeDate(raw: unknown): string {
  if (raw === null || raw === undefined || raw === "") return "";
  const asNumber = Number(raw);
  const date = !isNaN(asNumber) && asNumber > 0 ? new Date(asNumber) : new Date(String(raw));
  if (isNaN(date.getTime())) return "";
  return date.toISOString();
}

// --- LTDs (Lifetime Deals) ---

export async function fetchLtdDeals(): Promise<LtdDeal[]> {
  return withCache("ltds", async () => {
    const records = await fetchAllRecords(ENV.teableLtdTableId);
    const deals = records.map((record) => {
      const f = record.fields ?? {};
      const website = validUrl(str(f, "Website"));
      return {
        id: record.id,
        name: str(f, "Name") || record.name || "Untitled",
        website,
        summaryEn: cleanStr(f, "Summary - EN") || cleanStr(f, "Summary"),
        summaryEs: cleanStr(f, "Summary - ES") || cleanStr(f, "Summary"),
        dealUrl: validUrl(str(f, "Deal URL")),
        platform: cleanStr(f, "Platform"),
        status: cleanStr(f, "Status"),
        iconUrl: iconUrlFor(f, website),
        rating: num(f, "Rating 1-5"),
        isNew: isNewRecord(record),
        ...reviewFields(f),
      };
    });
    deals.sort((a, b) => a.name.localeCompare(b.name));
    return deals;
  });
}

// --- Total count across all tables ---

export async function fetchTotalToolCount(): Promise<number> {
  const tasks: (() => Promise<{ length: number }>)[] = [
    () => fetchAllTools(),
    () => fetchGithubRepos(),
    () => fetchWeeklyViralGithubRepos(),
    () => fetchLlmModels(),
    // LTDs intentionally excluded — the LTDs tab is hidden from the site for now.
    ...GENERIC_TABLES.map((t) => () => fetchGenericTools(t.key)),
  ];
  const results = await staggeredAll(tasks, 3, 200);
  return results.reduce((sum, arr) => sum + arr.length, 0);
}

// --- Fields metadata (diagnostics, server-side use only) ---

export async function fetchTableFields(): Promise<TeableField[]> {
  const apiUrl = ENV.teableApiUrl;
  const tableId = ENV.teableTableId;
  const apiKey = ENV.teableApiKey;

  if (!apiUrl || !tableId || !apiKey) {
    return [];
  }

  try {
    const url = `${apiUrl}/table/${tableId}/field`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(`[Teable] Fields API returned ${response.status}`);
      return [];
    }

    const data = (await response.json()) as TeableField[];
    return data ?? [];
  } catch (error) {
    console.error("[Teable] Failed to fetch fields:", error);
    return [];
  }
}
