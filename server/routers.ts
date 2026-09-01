import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { staggeredAll } from "./_core/batch";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import {
  fetchAllTools,
  fetchGithubRepos,
  fetchWeeklyViralGithubRepos,
  fetchLlmModels,
  fetchLtdDeals,
  fetchVideoImageTools,
  fetchMusicVoiceTools,
  fetchChatbotsTools,
  fetchFreeApisTools,
  fetchFreeLlmIdeTools,
  fetchVibeCodingTools,
  fetchDesignerTools,
  fetchAiInfraTools,
  fetchHardwareTools,
  fetchTestingTools,
  fetchAiSecurityTools,
  fetchBusinessProductivityTools,
  fetchMcpProvidersTools,
  fetchVpsCloudTools,
  fetchAiMediaTools,
  fetchAiInfluencersTools,
  fetchAiSitesTools,
  fetchAiDiscordTools,
  fetchAuSeoTools,
  fetchSumateTopRecommendations,
  fetchThisWeeksAiPicks,
  fetchTotalToolCount,
  type GenericTool,
} from "./teable";

const searchInput = z.object({ search: z.string().optional() }).optional();

/** Split a query into lowercased word tokens. "Free LLM API" -> ["free","llm","api"]. */
const searchTokens = (query: string): string[] =>
  query.toLowerCase().trim().split(/\s+/).filter(Boolean);

/**
 * An item matches when EVERY query word appears somewhere in its searchable
 * text. The old matcher required the whole query as one contiguous substring,
 * so any multi-word query ("free LLM API") matched nothing. Tokenising fixes
 * that while still narrowing as the user adds words.
 */
const matchesQuery = (query: string, ...fields: (string | undefined)[]): boolean => {
  const tokens = searchTokens(query);
  if (!tokens.length) return true;
  const hay = fields.map((f) => (f ?? "").toLowerCase()).join(" ");
  return tokens.every((t) => hay.includes(t));
};

/**
 * Relevance score for global search — higher is better; -1 means no match.
 * Name matches beat description matches, and exact/prefix name matches beat
 * partial ones, so "claude" surfaces the Claude entry instead of alphabetically
 * whatever happens to mention Claude in its description.
 */
const searchScore = (
  query: string,
  name: string,
  category: string,
  ...descriptions: (string | undefined)[]
): number => {
  const tokens = searchTokens(query);
  if (!tokens.length) return 0;
  const n = name.toLowerCase();
  const c = category.toLowerCase();
  const d = descriptions.map((x) => (x ?? "").toLowerCase()).join(" ");
  const hay = `${n} ${c} ${d}`;
  if (!tokens.every((t) => hay.includes(t))) return -1;
  const q = query.toLowerCase().trim();
  let score = 0;
  if (n === q) score += 1000;
  else if (n.startsWith(q)) score += 600;
  else if (n.includes(q)) score += 400;
  if (tokens.every((t) => n.includes(t))) score += 200; // all words in the name
  else if (tokens.some((t) => n.includes(t))) score += 60; // some words in the name
  if (tokens.every((t) => c.includes(t))) score += 80; // all words in the category
  return score;
};

/**
 * All generic tool tables share one list endpoint shape: fetch (cached
 * server-side), optionally filter by search term across name + descriptions.
 */
function makeGenericListRouter(fetcher: () => Promise<GenericTool[]>) {
  return router({
    list: publicProcedure.input(searchInput).query(async ({ input }) => {
      const tools = await fetcher();
      let filtered = tools;
      if (input?.search && input.search.trim()) {
        const term = input.search.toLowerCase().trim();
        filtered = filtered.filter((t) =>
          matchesQuery(term, t.name, t.descriptionEn, t.descriptionEs)
        );
      }
      return { tools: filtered, total: tools.length };
    }),
  });
}

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  tools: router({
    /**
     * Public endpoint: fetch all AI tools from Teable.
     * The API key is used server-side only and never sent to the client.
     */
    list: publicProcedure
      .input(
        z.object({
          search: z.string().optional(),
          category: z.string().optional(),
        }).optional()
      )
      .query(async ({ input }) => {
        const tools = await fetchAllTools();

        let filtered = tools;

        if (input?.search && input.search.trim()) {
          const term = input.search.toLowerCase().trim();
          filtered = filtered.filter((t) =>
            matchesQuery(term, t.name, t.descriptionEn, t.descriptionEs)
          );
        }

        if (input?.category && input.category !== "all") {
          filtered = filtered.filter(
            (t) => t.category.toLowerCase() === input.category!.toLowerCase()
          );
        }

        // Copy before sorting — `filtered` may be the shared cache array.
        const sorted = [...filtered].sort((a, b) => a.name.localeCompare(b.name));

        return {
          tools: sorted,
          total: tools.length,
        };
      }),

    /**
     * Public endpoint: get all unique categories from the tools data.
     */
    categories: publicProcedure.query(async () => {
      const tools = await fetchAllTools();
      const categories = Array.from(
        new Set(tools.map((t) => t.category).filter(Boolean))
      ).sort();
      return { categories };
    }),

    /**
     * Public endpoint: get total tool count across ALL tables.
     */
    totalCount: publicProcedure.query(async () => {
      const total = await fetchTotalToolCount();
      return { total };
    }),
  }),

  github: router({
    /**
     * Public endpoint: fetch all GitHub repos from Teable, sorted by stars.
     */
    list: publicProcedure
      .input(searchInput)
      .query(async ({ input }) => {
        const repos = await fetchGithubRepos();
        let filtered = repos;
        if (input?.search && input.search.trim()) {
          const term = input.search.toLowerCase().trim();
          filtered = filtered.filter((r) =>
            matchesQuery(term, r.name, r.description, r.owner)
          );
        }
        return { repos: filtered, total: repos.length };
      }),
  }),

  weeklyViralGithub: router({
    /**
     * Public endpoint: this week's curated trending AI repos, ranked by
     * Weekly Rank (1 = most viral). Shown as a highlight strip above the
     * full GitHub Repos table.
     */
    list: publicProcedure
      .input(searchInput)
      .query(async ({ input }) => {
        const repos = await fetchWeeklyViralGithubRepos();
        let filtered = repos;
        if (input?.search && input.search.trim()) {
          const term = input.search.toLowerCase().trim();
          filtered = filtered.filter((r) =>
            matchesQuery(term, r.name, r.description, r.owner, r.whyViral)
          );
        }
        return { repos: filtered, total: repos.length };
      }),
  }),

  llms: router({
    /**
     * Public endpoint: fetch all LLM models from Teable.
     */
    list: publicProcedure
      .input(searchInput)
      .query(async ({ input }) => {
        const models = await fetchLlmModels();
        let filtered = models;
        if (input?.search && input.search.trim()) {
          const term = input.search.toLowerCase().trim();
          filtered = filtered.filter((m) =>
            matchesQuery(term, m.name, m.summaryEn, m.summaryEs)
          );
        }
        return { models: filtered, total: models.length };
      }),
  }),

  ltds: router({
    /**
     * Public endpoint: fetch all lifetime deals from Teable.
     */
    list: publicProcedure
      .input(searchInput)
      .query(async ({ input }) => {
        const deals = await fetchLtdDeals();
        let filtered = deals;
        if (input?.search && input.search.trim()) {
          const term = input.search.toLowerCase().trim();
          filtered = filtered.filter((d) =>
            matchesQuery(term, d.name, d.summaryEn, d.summaryEs)
          );
        }
        return { deals: filtered, total: deals.length };
      }),
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
  thisWeeksAiPicks: makeGenericListRouter(fetchThisWeeksAiPicks),

  search: router({
    /**
     * Global search across all Teable tables.
     * Returns unified results with source table labels.
     */
    global: publicProcedure
      .input(z.object({
        query: z.string().min(1),
        limit: z.number().min(1).max(200).default(50),
      }))
      .query(async ({ input }) => {
        const term = input.query.toLowerCase().trim();
        const limit = input.limit;

        // Every table normalized into one search-result shape.
        type SearchSourceItem = {
          id: string;
          name?: string;
          title?: string;
          descriptionEn?: string;
          descriptionEs?: string;
          summaryEn?: string;
          summaryEs?: string;
          summary?: string;
          url?: string;
          dealUrl?: string;
          repoUrl?: string;
          affiliateUrl?: string;
          iconUrl?: string;
          category?: string;
          topic?: string;
          platform?: string;
          isAffiliate?: boolean;
          rating?: number;
          isNew?: boolean;
          reviewConfidence?: string;
        };

        // key is the /tool/<key>/<id> route segment, carried into each result so a
        // search hit can link to the listing's own page.
        const tableFetchers: Array<{ label: string; key: string; fetch: () => Promise<SearchSourceItem[]> }> = [
          { label: "AI Tools", key: "tools", fetch: () => fetchAllTools() },
          { label: "GitHub Repos", key: "github", fetch: () => fetchGithubRepos() },
          { label: "Weekly Viral GitHub", key: "weeklyViralGithub", fetch: () => fetchWeeklyViralGithubRepos() },
          { label: "LLMs", key: "llms", fetch: () => fetchLlmModels() },
          { label: "Video & Image", key: "videoImage", fetch: () => fetchVideoImageTools() },
          { label: "Music & Voice", key: "musicVoice", fetch: () => fetchMusicVoiceTools() },
          { label: "Chatbots & Agents", key: "chatbots", fetch: () => fetchChatbotsTools() },
          { label: "Free APIs", key: "freeApis", fetch: () => fetchFreeApisTools() },
          { label: "Free LLM & IDE", key: "freeLlmIde", fetch: () => fetchFreeLlmIdeTools() },
          { label: "Vibe Coding", key: "vibeCoding", fetch: () => fetchVibeCodingTools() },
          { label: "Designer Tools", key: "designerTools", fetch: () => fetchDesignerTools() },
          { label: "AI Infrastructure", key: "aiInfra", fetch: () => fetchAiInfraTools() },
          { label: "Hardware & Computers", key: "hardware", fetch: () => fetchHardwareTools() },
          { label: "Testing Tools", key: "testingTools", fetch: () => fetchTestingTools() },
          { label: "AI Security", key: "aiSecurity", fetch: () => fetchAiSecurityTools() },
          { label: "Business Productivity", key: "businessProductivity", fetch: () => fetchBusinessProductivityTools() },
          { label: "MCP Providers", key: "mcpProviders", fetch: () => fetchMcpProvidersTools() },
          { label: "VPS & Cloud", key: "vpsCloud", fetch: () => fetchVpsCloudTools() },
          { label: "AI Media", key: "aiMedia", fetch: () => fetchAiMediaTools() },
          { label: "AI Influencers", key: "aiInfluencers", fetch: () => fetchAiInfluencersTools() },
          { label: "AI Sites", key: "aiSites", fetch: () => fetchAiSitesTools() },
          { label: "AI Discord", key: "aiDiscord", fetch: () => fetchAiDiscordTools() },
          { label: "AU SEO Tools", key: "auSeoTools", fetch: () => fetchAuSeoTools() },
          { label: "Sumate Top Recommendations", key: "sumateTopRecommendations", fetch: () => fetchSumateTopRecommendations() },
        ];

        // Staggered fetch: the cache serves most of these instantly, but on a
        // cold cache 23 concurrent requests would trip Teable's rate limit.
        const results = await staggeredAll(
          tableFetchers.map(({ label, key, fetch }) => async () => {
            try {
              const items = await fetch();
              return items
                .map((item) => {
                  const name = item.name || item.title || "Untitled";
                  const category = item.category || item.topic || item.platform || "";
                  const descEn = item.descriptionEn || item.summaryEn || item.summary || "";
                  const descEs = item.descriptionEs || item.summaryEs || item.summary || "";
                  const base = searchScore(term, name, category, descEn, descEs);
                  // Genuinely-AI products outrank same-relevance general tools
                  // (a tiebreak nudge — never enough to beat a name match).
                  const rel = (item as { aiRelevance?: string }).aiRelevance;
                  const score =
                    base < 0 ? base : base + (rel === "AI-first" ? 50 : rel === "AI-enabled" ? 15 : 0);
                  return { item, name, category, descEn, descEs, score };
                })
                .filter((x) => x.score >= 0)
                .map(({ item, name, category, descEn, descEs, score }) => ({
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
                  sourceTableKey: key,
                  score,
                }));
            } catch (err) {
              console.error(`[GlobalSearch] Error fetching table "${label}":`, err);
              return [];
            }
          })
        );

        // Flatten. The same real-world tool can legitimately live in both the
        // generic "AI Tools" table and its specialized category table (e.g. a
        // music tool tagged into both AI Tools and Music & Voice) — dedupe by
        // url (falling back to name) so search doesn't show it twice, keeping
        // the more specific category match over the generic "AI Tools" one.
        const allResults = results.flat();
        const deduped = new Map<string, (typeof allResults)[number]>();
        for (const result of allResults) {
          const key = (result.url || result.name).trim().toLowerCase();
          const existing = deduped.get(key);
          // Keep the higher-scored duplicate; on a tie prefer the specialized
          // table over the generic "AI Tools" one.
          if (
            !existing ||
            result.score > existing.score ||
            (result.score === existing.score && existing.sourceTable === "AI Tools")
          ) {
            deduped.set(key, result);
          }
        }
        const uniqueResults = Array.from(deduped.values());
        // Rank by relevance score (name matches first), then rating, then name.
        uniqueResults.sort(
          (a, b) =>
            b.score - a.score ||
            (b.rating || 0) - (a.rating || 0) ||
            a.name.localeCompare(b.name),
        );

        return {
          results: uniqueResults.slice(0, limit).map(({ score, ...r }) => r),
          total: uniqueResults.length,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
