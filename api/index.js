// server/_core/app.ts
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";
var decodeOAuthState = (state) => {
  let decoded;
  try {
    decoded = atob(state);
  } catch {
    return { redirectUri: "" };
  }
  try {
    const parsed = JSON.parse(decoded);
    if (parsed && typeof parsed.redirectUri === "string") return parsed;
  } catch {
  }
  return { redirectUri: decoded };
};

// server/routers.ts
import { z as z2 } from "zod";

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// server/_core/batch.ts
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function staggeredAll(tasks, batchSize = 2, delayMs = 350) {
  const results = [];
  for (let i = 0; i < tasks.length; i += batchSize) {
    const batch = tasks.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map((task) => task()));
    results.push(...batchResults);
    if (i + batchSize < tasks.length) {
      await delay(delayMs);
    }
  }
  return results;
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  teableApiKey: process.env.TEABLE_API_KEY ?? "",
  teableApiUrl: process.env.TEABLE_API_URL ?? "https://app.teable.ai/api",
  teableTableId: process.env.TEABLE_TABLE_ID ?? "",
  teableGithubTableId: process.env.TEABLE_GITHUB_TABLE_ID ?? "",
  teableWeeklyViralGithubTableId: process.env.TEABLE_WEEKLY_VIRAL_GITHUB_TABLE_ID ?? "",
  teableLlmTableId: process.env.TEABLE_LLM_TABLE_ID ?? "",
  teableLtdTableId: process.env.TEABLE_LTD_TABLE_ID ?? "",
  teableVideoImageTableId: process.env.TEABLE_VIDEO_IMAGE_TABLE_ID ?? "",
  teableMusicVoiceTableId: process.env.TEABLE_MUSIC_VOICE_TABLE_ID ?? "",
  teableChatbotsTableId: process.env.TEABLE_CHATBOTS_TABLE_ID ?? "",
  teableFreeApisTableId: process.env.TEABLE_FREE_APIS_TABLE_ID ?? "",
  teableFreeLlmIdeTableId: process.env.TEABLE_FREE_LLM_IDE_TABLE_ID ?? "",
  teableVibeCodingTableId: process.env.TEABLE_VIBE_CODING_TABLE_ID ?? "",
  teableDesignerToolsTableId: process.env.TEABLE_DESIGNER_TOOLS_TABLE_ID ?? "",
  teableAiInfraTableId: process.env.TEABLE_AI_INFRA_TABLE_ID ?? "",
  teableHardwareTableId: process.env.TEABLE_HARDWARE_TABLE_ID ?? "",
  teableTestingToolsTableId: process.env.TEABLE_TESTING_TOOLS_TABLE_ID ?? "",
  teableAiSecurityTableId: process.env.TEABLE_AI_SECURITY_TABLE_ID ?? "",
  teableBusinessProductivityTableId: process.env.TEABLE_BUSINESS_PRODUCTIVITY_TABLE_ID ?? "",
  teableMcpProvidersTableId: process.env.TEABLE_MCP_PROVIDERS_TABLE_ID ?? "",
  teableVpsCloudTableId: process.env.TEABLE_VPS_CLOUD_TABLE_ID ?? "",
  teableAiMediaTableId: process.env.TEABLE_AI_MEDIA_TABLE_ID ?? "",
  teableAiInfluencersTableId: process.env.TEABLE_AI_INFLUENCERS_TABLE_ID ?? "",
  teableAiSitesTableId: process.env.TEABLE_AI_SITES_TABLE_ID ?? "",
  teableAiDiscordTableId: process.env.TEABLE_AI_DISCORD_TABLE_ID ?? "",
  teableAuSeoToolsTableId: process.env.TEABLE_AU_SEO_TOOLS_TABLE_ID ?? "",
  teableSumateTopRecommendationsTableId: process.env.TEABLE_SUMATE_TOP_RECOMMENDATIONS_TABLE_ID ?? ""
};

// server/_core/notification.ts
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// shared/reviewSanitize.ts
var PLACEHOLDER_RE = /^(unknown|unknowns?|n\/?a|none|null|nil|tbd|pending|-|—|no data( available)?|not (yet )?(determined|available|verified)|unable to (be )?determine(d)?( .*)?|unverified|not verified|pricing unknown( .*)?)\.?$/i;
function normalize(text2) {
  return text2.trim().replace(/^[(\[\s]+|[)\]\s.]+$/g, "");
}
function isPlaceholderValue(text2) {
  const n = normalize(text2);
  return n.length === 0 || PLACEHOLDER_RE.test(n);
}
function validHttpUrl(v) {
  const t2 = (v ?? "").trim();
  return /^https?:\/\//i.test(t2) ? t2 : "";
}

// server/teable.ts
var CACHE_TTL_MS = 5 * 60 * 1e3;
var caches = /* @__PURE__ */ new Map();
async function withCache(key, fetcher) {
  const cached = caches.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }
  try {
    const data = await fetcher();
    caches.set(key, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    console.error(
      `[Teable] Fetch failed for "${key}"${cached ? " \u2014 serving stale cache" : ""}:`,
      error
    );
    return cached ? cached.data : [];
  }
}
function str(f, key) {
  const v = f[key];
  if (v === null || v === void 0) return "";
  return String(v);
}
function cleanStr(f, key) {
  const v = str(f, key);
  return isPlaceholderValue(v) ? "" : v;
}
var validUrl = validHttpUrl;
function num(f, key) {
  const v = f[key];
  if (v === null || v === void 0) return 0;
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}
function bool(f, key) {
  const v = f[key];
  if (v === null || v === void 0) return false;
  const s = String(v).toLowerCase().trim();
  return s === "true" || s === "1" || s === "yes";
}
function logoUrl(f) {
  return validUrl(str(f, "LogoUrl") || str(f, "LogoURL") || str(f, "Logo Url") || str(f, "Logo URL") || "");
}
function affiliateUrl(f) {
  return validUrl(str(f, "AffiliateUrl") || str(f, "AffiliateURL") || str(f, "Affiliate URL") || str(f, "Affiliate Url") || "");
}
function outboundUrl(f) {
  return validUrl(str(f, "OutboundUrl") || str(f, "Outbound URL") || str(f, "Website") || str(f, "Repository URL") || str(f, "URL") || "");
}
function deriveFaviconUrl(siteUrl) {
  if (!siteUrl) return "";
  try {
    const { hostname } = new URL(siteUrl);
    if (!hostname) return "";
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=128`;
  } catch {
    return "";
  }
}
function iconUrlFor(f, siteUrl) {
  return logoUrl(f) || deriveFaviconUrl(siteUrl);
}
function reviewFields(f) {
  return {
    prosEn: cleanStr(f, "Pros - EN"),
    consEn: cleanStr(f, "Cons - EN"),
    costEn: cleanStr(f, "Cost - EN"),
    verdictEn: cleanStr(f, "Verdict - EN"),
    prosEs: cleanStr(f, "Pros - ES"),
    consEs: cleanStr(f, "Cons - ES"),
    costEs: cleanStr(f, "Cost - ES"),
    verdictEs: cleanStr(f, "Verdict - ES"),
    reviewConfidence: str(f, "Review Confidence").toLowerCase().trim()
  };
}
var NEW_BADGE_WINDOW_MS = 7 * 24 * 60 * 60 * 1e3;
function isNewRecord(record) {
  const inputDate = str(record.fields, "InputDate") || str(record.fields, "Input Date") || str(record.fields, "inputDate");
  const createdTime = record.createdTime || str(record.fields, "Created Time") || str(record.fields, "Created") || str(record.fields, "Date Added") || str(record.fields, "Date Created") || inputDate;
  if (!createdTime) return false;
  const created = new Date(createdTime).getTime();
  if (isNaN(created)) return false;
  return Date.now() - created < NEW_BADGE_WINDOW_MS;
}
var RETRYABLE_STATUS = /* @__PURE__ */ new Set([429, 502, 503, 504]);
async function fetchWithRetry(url, options, maxRetries = 5) {
  let lastResponse = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(url, options);
    if (!RETRYABLE_STATUS.has(response.status)) return response;
    lastResponse = response;
    if (attempt === maxRetries) break;
    const retryAfter = Number(response.headers.get("retry-after"));
    const backoffMs = Number.isFinite(retryAfter) && retryAfter > 0 ? Math.min(retryAfter * 1e3, 8e3) : Math.min(500 * Math.pow(2, attempt), 8e3);
    console.warn(`[Teable] ${response.status}, retrying in ${backoffMs}ms (attempt ${attempt + 1}/${maxRetries + 1}) for ${url}`);
    await delay(backoffMs);
  }
  return lastResponse;
}
async function fetchAllRecords(tableId) {
  const apiUrl = ENV.teableApiUrl;
  const apiKey = ENV.teableApiKey;
  if (!apiUrl || !tableId || !apiKey) {
    console.warn("[Teable] Missing configuration for table:", tableId);
    return [];
  }
  const allRecords = [];
  const pageSize = 1e3;
  let skip = 0;
  let hasMore = true;
  while (hasMore) {
    const url = `${apiUrl}/table/${tableId}/record?take=${pageSize}&skip=${skip}&fieldKeyType=name&cellFormat=text`;
    const response = await fetchWithRetry(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      }
    });
    if (!response.ok) {
      throw new Error(`Teable API returned ${response.status} for table ${tableId}`);
    }
    const data = await response.json();
    const records = (data.records ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      fields: r.fields,
      createdTime: r.createdTime
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
function mapGenericTool(record) {
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
    ...reviewFields(f)
  };
}
var GENERIC_TABLES = [
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
  { key: "sumateTopRecommendations", label: "Sumate Top Recommendations", tableId: () => ENV.teableSumateTopRecommendationsTableId }
];
async function fetchGenericTools(key) {
  const table = GENERIC_TABLES.find((t2) => t2.key === key);
  if (!table) return [];
  return withCache(key, async () => {
    const records = await fetchAllRecords(table.tableId());
    const tools = records.filter((r) => r.fields["Published"] === void 0 || bool(r.fields, "Published")).map(mapGenericTool);
    tools.sort((a, b) => a.name.localeCompare(b.name));
    return tools;
  });
}
var fetchVideoImageTools = () => fetchGenericTools("videoImage");
var fetchMusicVoiceTools = () => fetchGenericTools("musicVoice");
var fetchChatbotsTools = () => fetchGenericTools("chatbots");
var fetchFreeApisTools = () => fetchGenericTools("freeApis");
var fetchFreeLlmIdeTools = () => fetchGenericTools("freeLlmIde");
var fetchVibeCodingTools = () => fetchGenericTools("vibeCoding");
var fetchDesignerTools = () => fetchGenericTools("designerTools");
var fetchAiInfraTools = () => fetchGenericTools("aiInfra");
var fetchHardwareTools = () => fetchGenericTools("hardware");
var fetchTestingTools = () => fetchGenericTools("testingTools");
var fetchAiSecurityTools = () => fetchGenericTools("aiSecurity");
var fetchBusinessProductivityTools = () => fetchGenericTools("businessProductivity");
var fetchMcpProvidersTools = () => fetchGenericTools("mcpProviders");
var fetchVpsCloudTools = () => fetchGenericTools("vpsCloud");
var fetchAiMediaTools = () => fetchGenericTools("aiMedia");
var fetchAiInfluencersTools = () => fetchGenericTools("aiInfluencers");
var fetchAiSitesTools = () => fetchGenericTools("aiSites");
var fetchAiDiscordTools = () => fetchGenericTools("aiDiscord");
var fetchAuSeoTools = () => fetchGenericTools("auSeoTools");
var fetchSumateTopRecommendations = () => fetchGenericTools("sumateTopRecommendations");
async function fetchAllTools() {
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
        ...reviewFields(f)
      };
    });
    tools.sort((a, b) => a.name.localeCompare(b.name));
    return tools;
  });
}
async function fetchGithubRepos() {
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
        isNew: isNewRecord(record)
      };
    });
    repos.sort((a, b) => b.stars - a.stars);
    return repos;
  });
}
async function fetchWeeklyViralGithubRepos() {
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
        ...reviewFields(f)
      };
    });
    repos.sort((a, b) => {
      const ar = a.weeklyRank || Infinity;
      const br = b.weeklyRank || Infinity;
      return ar !== br ? ar - br : b.starsThisWeek - a.starsThisWeek;
    });
    return repos;
  });
}
async function fetchLlmModels() {
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
        ...reviewFields(f)
      };
    });
    models.sort((a, b) => a.name.localeCompare(b.name));
    return models;
  });
}
function normalizeDate(raw) {
  if (raw === null || raw === void 0 || raw === "") return "";
  const asNumber = Number(raw);
  const date = !isNaN(asNumber) && asNumber > 0 ? new Date(asNumber) : new Date(String(raw));
  if (isNaN(date.getTime())) return "";
  return date.toISOString();
}
async function fetchLtdDeals() {
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
        ...reviewFields(f)
      };
    });
    deals.sort((a, b) => a.name.localeCompare(b.name));
    return deals;
  });
}
async function fetchTotalToolCount() {
  const tasks = [
    () => fetchAllTools(),
    () => fetchGithubRepos(),
    () => fetchWeeklyViralGithubRepos(),
    () => fetchLlmModels(),
    // LTDs intentionally excluded — the LTDs tab is hidden from the site for now.
    ...GENERIC_TABLES.map((t2) => () => fetchGenericTools(t2.key))
  ];
  const results = await staggeredAll(tasks, 3, 200);
  return results.reduce((sum, arr) => sum + arr.length, 0);
}

// server/routers.ts
var searchInput = z2.object({ search: z2.string().optional() }).optional();
var searchTokens = (query) => query.toLowerCase().trim().split(/\s+/).filter(Boolean);
var matchesQuery = (query, ...fields) => {
  const tokens = searchTokens(query);
  if (!tokens.length) return true;
  const hay = fields.map((f) => (f ?? "").toLowerCase()).join(" ");
  return tokens.every((t2) => hay.includes(t2));
};
var searchScore = (query, name, category, ...descriptions) => {
  const tokens = searchTokens(query);
  if (!tokens.length) return 0;
  const n = name.toLowerCase();
  const c = category.toLowerCase();
  const d = descriptions.map((x) => (x ?? "").toLowerCase()).join(" ");
  const hay = `${n} ${c} ${d}`;
  if (!tokens.every((t2) => hay.includes(t2))) return -1;
  const q = query.toLowerCase().trim();
  let score = 0;
  if (n === q) score += 1e3;
  else if (n.startsWith(q)) score += 600;
  else if (n.includes(q)) score += 400;
  if (tokens.every((t2) => n.includes(t2))) score += 200;
  else if (tokens.some((t2) => n.includes(t2))) score += 60;
  if (tokens.every((t2) => c.includes(t2))) score += 80;
  return score;
};
function makeGenericListRouter(fetcher) {
  return router({
    list: publicProcedure.input(searchInput).query(async ({ input }) => {
      const tools = await fetcher();
      let filtered = tools;
      if (input?.search && input.search.trim()) {
        const term = input.search.toLowerCase().trim();
        filtered = filtered.filter(
          (t2) => matchesQuery(term, t2.name, t2.descriptionEn, t2.descriptionEs)
        );
      }
      return { tools: filtered, total: tools.length };
    })
  });
}
var appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true
      };
    })
  }),
  tools: router({
    /**
     * Public endpoint: fetch all AI tools from Teable.
     * The API key is used server-side only and never sent to the client.
     */
    list: publicProcedure.input(
      z2.object({
        search: z2.string().optional(),
        category: z2.string().optional()
      }).optional()
    ).query(async ({ input }) => {
      const tools = await fetchAllTools();
      let filtered = tools;
      if (input?.search && input.search.trim()) {
        const term = input.search.toLowerCase().trim();
        filtered = filtered.filter(
          (t2) => matchesQuery(term, t2.name, t2.descriptionEn, t2.descriptionEs)
        );
      }
      if (input?.category && input.category !== "all") {
        filtered = filtered.filter(
          (t2) => t2.category.toLowerCase() === input.category.toLowerCase()
        );
      }
      const sorted = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
      return {
        tools: sorted,
        total: tools.length
      };
    }),
    /**
     * Public endpoint: get all unique categories from the tools data.
     */
    categories: publicProcedure.query(async () => {
      const tools = await fetchAllTools();
      const categories = Array.from(
        new Set(tools.map((t2) => t2.category).filter(Boolean))
      ).sort();
      return { categories };
    }),
    /**
     * Public endpoint: get total tool count across ALL tables.
     */
    totalCount: publicProcedure.query(async () => {
      const total = await fetchTotalToolCount();
      return { total };
    })
  }),
  github: router({
    /**
     * Public endpoint: fetch all GitHub repos from Teable, sorted by stars.
     */
    list: publicProcedure.input(searchInput).query(async ({ input }) => {
      const repos = await fetchGithubRepos();
      let filtered = repos;
      if (input?.search && input.search.trim()) {
        const term = input.search.toLowerCase().trim();
        filtered = filtered.filter(
          (r) => matchesQuery(term, r.name, r.description, r.owner)
        );
      }
      return { repos: filtered, total: repos.length };
    })
  }),
  weeklyViralGithub: router({
    /**
     * Public endpoint: this week's curated trending AI repos, ranked by
     * Weekly Rank (1 = most viral). Shown as a highlight strip above the
     * full GitHub Repos table.
     */
    list: publicProcedure.input(searchInput).query(async ({ input }) => {
      const repos = await fetchWeeklyViralGithubRepos();
      let filtered = repos;
      if (input?.search && input.search.trim()) {
        const term = input.search.toLowerCase().trim();
        filtered = filtered.filter(
          (r) => matchesQuery(term, r.name, r.description, r.owner, r.whyViral)
        );
      }
      return { repos: filtered, total: repos.length };
    })
  }),
  llms: router({
    /**
     * Public endpoint: fetch all LLM models from Teable.
     */
    list: publicProcedure.input(searchInput).query(async ({ input }) => {
      const models = await fetchLlmModels();
      let filtered = models;
      if (input?.search && input.search.trim()) {
        const term = input.search.toLowerCase().trim();
        filtered = filtered.filter(
          (m) => matchesQuery(term, m.name, m.summaryEn, m.summaryEs)
        );
      }
      return { models: filtered, total: models.length };
    })
  }),
  ltds: router({
    /**
     * Public endpoint: fetch all lifetime deals from Teable.
     */
    list: publicProcedure.input(searchInput).query(async ({ input }) => {
      const deals = await fetchLtdDeals();
      let filtered = deals;
      if (input?.search && input.search.trim()) {
        const term = input.search.toLowerCase().trim();
        filtered = filtered.filter(
          (d) => matchesQuery(term, d.name, d.summaryEn, d.summaryEs)
        );
      }
      return { deals: filtered, total: deals.length };
    })
  }),
  // Generic tool sections — one factory, one line per table.
  videoImage: makeGenericListRouter(fetchVideoImageTools),
  musicVoice: makeGenericListRouter(fetchMusicVoiceTools),
  chatbots: makeGenericListRouter(fetchChatbotsTools),
  freeApis: makeGenericListRouter(fetchFreeApisTools),
  freeLlmIde: makeGenericListRouter(fetchFreeLlmIdeTools),
  vibeCoding: makeGenericListRouter(fetchVibeCodingTools),
  designerTools: makeGenericListRouter(fetchDesignerTools),
  aiInfra: makeGenericListRouter(fetchAiInfraTools),
  hardware: makeGenericListRouter(fetchHardwareTools),
  testingTools: makeGenericListRouter(fetchTestingTools),
  aiSecurity: makeGenericListRouter(fetchAiSecurityTools),
  businessProductivity: makeGenericListRouter(fetchBusinessProductivityTools),
  mcpProviders: makeGenericListRouter(fetchMcpProvidersTools),
  vpsCloud: makeGenericListRouter(fetchVpsCloudTools),
  aiMedia: makeGenericListRouter(fetchAiMediaTools),
  aiInfluencers: makeGenericListRouter(fetchAiInfluencersTools),
  aiSites: makeGenericListRouter(fetchAiSitesTools),
  aiDiscord: makeGenericListRouter(fetchAiDiscordTools),
  auSeoTools: makeGenericListRouter(fetchAuSeoTools),
  sumateTopRecommendations: makeGenericListRouter(fetchSumateTopRecommendations),
  search: router({
    /**
     * Global search across all Teable tables.
     * Returns unified results with source table labels.
     */
    global: publicProcedure.input(z2.object({
      query: z2.string().min(1),
      limit: z2.number().min(1).max(200).default(50)
    })).query(async ({ input }) => {
      const term = input.query.toLowerCase().trim();
      const limit = input.limit;
      const tableFetchers = [
        { label: "AI Tools", fetch: () => fetchAllTools() },
        { label: "GitHub Repos", fetch: () => fetchGithubRepos() },
        { label: "Weekly Viral GitHub", fetch: () => fetchWeeklyViralGithubRepos() },
        { label: "LLMs", fetch: () => fetchLlmModels() },
        { label: "Video & Image", fetch: () => fetchVideoImageTools() },
        { label: "Music & Voice", fetch: () => fetchMusicVoiceTools() },
        { label: "Chatbots & Agents", fetch: () => fetchChatbotsTools() },
        { label: "Free APIs", fetch: () => fetchFreeApisTools() },
        { label: "Free LLM & IDE", fetch: () => fetchFreeLlmIdeTools() },
        { label: "Vibe Coding", fetch: () => fetchVibeCodingTools() },
        { label: "Designer Tools", fetch: () => fetchDesignerTools() },
        { label: "AI Infrastructure", fetch: () => fetchAiInfraTools() },
        { label: "Hardware & Computers", fetch: () => fetchHardwareTools() },
        { label: "Testing Tools", fetch: () => fetchTestingTools() },
        { label: "AI Security", fetch: () => fetchAiSecurityTools() },
        { label: "Business Productivity", fetch: () => fetchBusinessProductivityTools() },
        { label: "MCP Providers", fetch: () => fetchMcpProvidersTools() },
        { label: "VPS & Cloud", fetch: () => fetchVpsCloudTools() },
        { label: "AI Media", fetch: () => fetchAiMediaTools() },
        { label: "AI Influencers", fetch: () => fetchAiInfluencersTools() },
        { label: "AI Sites", fetch: () => fetchAiSitesTools() },
        { label: "AI Discord", fetch: () => fetchAiDiscordTools() },
        { label: "AU SEO Tools", fetch: () => fetchAuSeoTools() },
        { label: "Sumate Top Recommendations", fetch: () => fetchSumateTopRecommendations() }
      ];
      const results = await staggeredAll(
        tableFetchers.map(({ label, fetch: fetch2 }) => async () => {
          try {
            const items = await fetch2();
            return items.map((item) => {
              const name = item.name || item.title || "Untitled";
              const category = item.category || item.topic || item.platform || "";
              const descEn = item.descriptionEn || item.summaryEn || item.summary || "";
              const descEs = item.descriptionEs || item.summaryEs || item.summary || "";
              const score = searchScore(term, name, category, descEn, descEs);
              return { item, name, category, descEn, descEs, score };
            }).filter((x) => x.score >= 0).map(({ item, name, category, descEn, descEs, score }) => ({
              id: item.id,
              name,
              descriptionEn: descEn,
              descriptionEs: descEs,
              url: item.url || item.dealUrl || item.repoUrl || "",
              affiliateUrl: item.affiliateUrl || "",
              iconUrl: item.iconUrl || "",
              category,
              isAffiliate: item.isAffiliate || false,
              rating: item.rating || 0,
              isNew: item.isNew || false,
              reviewConfidence: item.reviewConfidence || "",
              sourceTable: label,
              score
            }));
          } catch (err) {
            console.error(`[GlobalSearch] Error fetching table "${label}":`, err);
            return [];
          }
        })
      );
      const allResults = results.flat();
      const deduped = /* @__PURE__ */ new Map();
      for (const result of allResults) {
        const key = (result.url || result.name).trim().toLowerCase();
        const existing = deduped.get(key);
        if (!existing || result.score > existing.score || result.score === existing.score && existing.sourceTable === "AI Tools") {
          deduped.set(key, result);
        }
      }
      const uniqueResults = Array.from(deduped.values());
      uniqueResults.sort(
        (a, b) => b.score - a.score || (b.rating || 0) - (a.rating || 0) || a.name.localeCompare(b.name)
      );
      return {
        results: uniqueResults.slice(0, limit).map(({ score, ...r }) => r),
        total: uniqueResults.length
      };
    })
  })
});

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";

// server/db.ts
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";

// drizzle/schema.ts
import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
var users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
});

// server/db.ts
var _db = null;
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      openId: user.openId
    };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = /* @__PURE__ */ new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}

// server/_core/sdk.ts
var isNonEmptyString2 = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    return decodeOAuthState(state).redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString2(openId) || !isNonEmptyString2(appId) || !isNonEmptyString2(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    let sessionToken = cookies.get(COOKIE_NAME);
    if (!sessionToken) {
      const authHeader = req.headers.authorization;
      if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
        sessionToken = authHeader.slice(7);
      }
    }
    const session = await this.verifySession(sessionToken);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    if (session.openId.startsWith(CRON_OPEN_ID_PREFIX)) {
      const userInfo = await this.getUserInfoWithJwt(sessionToken ?? "");
      const taskUid = userInfo.taskUid ?? null;
      if (!taskUid) {
        throw ForbiddenError("Cron session missing task_uid");
      }
      return buildCronUser(userInfo);
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionToken ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var CRON_OPEN_ID_PREFIX = "cron_";
function buildCronUser(userInfo) {
  const now = /* @__PURE__ */ new Date();
  return {
    id: -1,
    openId: userInfo.openId,
    name: userInfo.name || "Manus Scheduled Task",
    email: null,
    loginMethod: null,
    role: "user",
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
    taskUid: userInfo.taskUid ?? void 0,
    isCron: true
  };
}
var sdk = new SDKServer();

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/_core/rateLimit.ts
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
var GENERAL_MAX = 300;
var SEARCH_MAX = 60;
var WINDOW_MS = 6e4;
var common = {
  windowMs: WINDOW_MS,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  // ipKeyGenerator normalises IPv6 to a /64 prefix — without it a single client
  // can rotate through its own address range and get a fresh bucket each time.
  keyGenerator: (req) => ipKeyGenerator(req.ip ?? "")
};
function registerRateLimits(app) {
  app.set("trust proxy", 1);
  app.use(
    "/api/trpc/search.global",
    rateLimit({
      ...common,
      limit: SEARCH_MAX,
      message: { error: "Too many searches, please slow down." }
    })
  );
  app.use(
    "/api/trpc",
    rateLimit({
      ...common,
      limit: GENERAL_MAX,
      message: { error: "Too many requests, please try again shortly." }
    })
  );
}

// server/_core/app.ts
function createApp() {
  const app = express();
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ limit: "1mb", extended: true }));
  registerRateLimits(app);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  return app;
}

// server/vercelEntry.ts
var vercelEntry_default = createApp();
export {
  vercelEntry_default as default
};
