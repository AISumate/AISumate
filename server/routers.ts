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
  fetchTotalToolCount,
  type GenericTool,
} from "./teable";

const searchInput = z.object({ search: z.string().optional() }).optional();

const matchesTerm = (term: string, ...fields: (string | undefined)[]) =>
  fields.some((f) => (f ?? "").toLowerCase().includes(term));

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
          matchesTerm(term, t.name, t.descriptionEn, t.descriptionEs)
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
            matchesTerm(term, t.name, t.descriptionEn, t.descriptionEs)
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
            matchesTerm(term, r.name, r.description, r.owner)
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
            matchesTerm(term, r.name, r.description, r.owner, r.whyViral)
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
            matchesTerm(term, m.name, m.summaryEn, m.summaryEs)
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
            matchesTerm(term, d.name, d.summaryEn, d.summaryEs)
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

        const tableFetchers: Array<{ label: string; fetch: () => Promise<SearchSourceItem[]> }> = [
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
          { label: "Sumate Top Recommendations", fetch: () => fetchSumateTopRecommendations() },
        ];

        // Staggered fetch: the cache serves most of these instantly, but on a
        // cold cache 23 concurrent requests would trip Teable's rate limit.
        const results = await staggeredAll(
          tableFetchers.map(({ label, fetch }) => async () => {
            try {
              const items = await fetch();
              const matched = items.filter((item) => {
                const name = (item.name || item.title || "").toLowerCase();
                const descEn = (item.descriptionEn || item.summaryEn || item.summary || "").toLowerCase();
                const descEs = (item.descriptionEs || item.summaryEs || item.summary || "").toLowerCase();
                return name.includes(term) || descEn.includes(term) || descEs.includes(term);
              });
              return matched.map((item) => ({
                id: item.id,
                name: item.name || item.title || "Untitled",
                descriptionEn: item.descriptionEn || item.summaryEn || item.summary || "",
                descriptionEs: item.descriptionEs || item.summaryEs || item.summary || "",
                url: item.url || item.dealUrl || item.repoUrl || "",
                affiliateUrl: item.affiliateUrl || "",
                iconUrl: item.iconUrl || "",
                category: item.category || item.topic || item.platform || "",
                isAffiliate: item.isAffiliate || false,
                rating: item.rating || 0,
                isNew: item.isNew || false,
                reviewConfidence: item.reviewConfidence || "",
                sourceTable: label,
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
          if (!existing || existing.sourceTable === "AI Tools") {
            deduped.set(key, result);
          }
        }
        const uniqueResults = Array.from(deduped.values());
        uniqueResults.sort((a, b) => a.name.localeCompare(b.name));

        return {
          results: uniqueResults.slice(0, limit),
          total: uniqueResults.length,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
