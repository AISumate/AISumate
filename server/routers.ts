import { COOKIE_NAME } from "@shared/const";
import { blogSlug } from "@shared/blogSlug";
import { LIST_PAGE_SIZE_DEFAULT, LIST_PAGE_SIZE_MAX } from "@shared/listPage";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { staggeredAll } from "./_core/batch";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import {
  categoryKey,
  chosen,
  listInput,
  matchesAi,
  matchesLanguage,
  matchesQuery,
  pageOf,
  resolvePage,
  searchScore,
  sortCatalogue,
  toDealCard,
  toLlmCard,
  toRelatedCard,
  toRepoCard,
  toToolCard,
  toWeeklyCard,
  uniqueSorted,
} from "./catalogueQuery";
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

/**
 * All generic tool tables share one list endpoint shape: fetch (cached
 * server-side), filter, sort, then return one slim page. The full rows stay
 * in the Teable cache for `listing.get` and for scripts/prerender.ts, which
 * imports the fetchers directly and never goes through this public procedure.
 */
function makeGenericListRouter(fetcher: () => Promise<GenericTool[]>) {
  return router({
    list: publicProcedure.input(listInput).query(async ({ input }) => {
      const tools = await fetcher();
      const { page, limit } = resolvePage(input);
      const categories = uniqueSorted(tools.map(t => t.category));
      let filtered = tools;
      const search = input?.search?.trim();
      if (search) {
        filtered = filtered.filter(t =>
          matchesQuery(search, t.name, t.descriptionEn, t.descriptionEs)
        );
      }
      const category = chosen(input?.category);
      if (category) {
        filtered = filtered.filter(t => t.category === category);
      }
      filtered = filtered.filter(t => matchesAi(t.aiRelevance, input?.ai));
      filtered = filtered.filter(t => matchesLanguage(t, input?.language));
      if (input?.hasBody) {
        filtered = filtered.filter(t => Boolean(t.bodyEn?.trim()));
      }
      const sorted = sortCatalogue(filtered, input?.sort, input?.order);
      const paged = pageOf(sorted, page, limit);
      return {
        tools: paged.slice.map(toToolCard),
        categories,
        total: paged.total,
        page: paged.page,
        limit: paged.limit,
        hasMore: paged.hasMore,
        nextPage: paged.nextPage,
        nextCursor: paged.nextCursor,
      };
    }),
  });
}

/**
 * Fields a detail page reads. The cached row is returned as-is; this type
 * names the ones the UI touches so the procedure isn't typed as the whole
 * union of every table.
 */
interface ListingDetail {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  descriptionEn?: string;
  descriptionEs?: string;
  summaryEn?: string;
  summaryEs?: string;
  category?: string;
  providerType?: string;
  topic?: string;
  platform?: string;
  owner?: string;
  url?: string;
  repoUrl?: string;
  dealUrl?: string;
  website?: string;
  affiliateUrl?: string;
  iconUrl?: string;
  isAffiliate?: boolean;
  rating?: number;
  isNew?: boolean;
  aiRelevance?: string;
  sponsored?: boolean;
  prosEn?: string;
  consEn?: string;
  costEn?: string;
  verdictEn?: string;
  prosEs?: string;
  consEs?: string;
  costEs?: string;
  verdictEs?: string;
  reviewConfidence?: string;
  blogTitleEn?: string;
  blogTitleEs?: string;
  blogPostEn?: string;
  blogPostEs?: string;
  images?: string[];
  slug?: string;
  bodyEn?: string;
  bodyEs?: string;
  author?: string;
  tags?: string[];
  readingTimeMinutes?: number;
  publishedDate?: string;
  providerNoteEn?: string;
  providerNoteEs?: string;
  language?: string;
  stars?: number;
  starsThisWeek?: number;
  whyViral?: string;
}

/**
 * One record, not a table. Prerender and these lookups are the only readers
 * of a full row; the public `*.list` procedures above are paged and slim.
 */
const listingFetchers: Record<string, () => Promise<ListingDetail[]>> = {
  tools: fetchAllTools,
  llms: fetchLlmModels,
  github: fetchGithubRepos,
  weeklyViralGithub: fetchWeeklyViralGithubRepos,
  videoImage: fetchVideoImageTools,
  musicVoice: fetchMusicVoiceTools,
  chatbots: fetchChatbotsTools,
  freeApis: fetchFreeApisTools,
  freeLlmIde: fetchFreeLlmIdeTools,
  vibeCoding: fetchVibeCodingTools,
  designerTools: fetchDesignerTools,
  aiInfra: fetchAiInfraTools,
  hardware: fetchHardwareTools,
  testingTools: fetchTestingTools,
  aiSecurity: fetchAiSecurityTools,
  businessProductivity: fetchBusinessProductivityTools,
  mcpProviders: fetchMcpProvidersTools,
  vpsCloud: fetchVpsCloudTools,
  aiMedia: fetchAiMediaTools,
  aiInfluencers: fetchAiInfluencersTools,
  aiSites: fetchAiSitesTools,
  aiDiscord: fetchAiDiscordTools,
  auSeoTools: fetchAuSeoTools,
  sumateTopRecommendations: fetchSumateTopRecommendations,
  thisWeeksAiPicks: fetchThisWeeksAiPicks,
  ltds: fetchLtdDeals,
} as Record<string, () => Promise<ListingDetail[]>>;

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
    /**
     * One page of card fields. Omitting page/limit still returns the default
     * page (24), never the whole table. Full rows: `listing.get`.
     */
    list: publicProcedure.input(listInput).query(async ({ input }) => {
      const tools = await fetchAllTools();
      const { page, limit } = resolvePage(input);
      const categories = uniqueSorted(tools.map(t => t.category));
      let filtered = tools;

      const search = input?.search?.trim();
      if (search) {
        filtered = filtered.filter(t =>
          matchesQuery(search, t.name, t.descriptionEn, t.descriptionEs)
        );
      }

      const category = chosen(input?.category);
      if (category) {
        filtered = filtered.filter(
          t => t.category.toLowerCase() === category.toLowerCase()
        );
      }
      filtered = filtered.filter(t => matchesAi(t.aiRelevance, input?.ai));

      // Copy via sort — `filtered` may be the shared cache array.
      const sorted = sortCatalogue(filtered, input?.sort, input?.order);
      const paged = pageOf(sorted, page, limit);

      return {
        tools: paged.slice.map(toToolCard),
        categories,
        total: paged.total,
        page: paged.page,
        limit: paged.limit,
        hasMore: paged.hasMore,
        nextPage: paged.nextPage,
        nextCursor: paged.nextCursor,
      };
    }),

    /**
     * Public endpoint: get all unique categories from the tools data.
     */
    categories: publicProcedure.query(async () => {
      const tools = await fetchAllTools();
      const categories = Array.from(
        new Set(tools.map(t => t.category).filter(Boolean))
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
    list: publicProcedure.input(listInput).query(async ({ input }) => {
      const repos = await fetchGithubRepos();
      const { page, limit } = resolvePage(input);
      const statuses = uniqueSorted(repos.map(r => r.status));
      let filtered = repos;
      const search = input?.search?.trim();
      if (search) {
        filtered = filtered.filter(r =>
          matchesQuery(search, r.name, r.description, r.owner)
        );
      }
      const status = chosen(input?.status);
      if (status) filtered = filtered.filter(r => r.status === status);
      const sorted =
        input?.sort === "name" || input?.sort === "stars"
          ? [...filtered].sort((a, b) => {
              const cmp =
                input.sort === "stars"
                  ? a.stars - b.stars
                  : a.name.localeCompare(b.name);
              const dir =
                input.order ?? (input.sort === "stars" ? "desc" : "asc");
              return dir === "asc" ? cmp : -cmp;
            })
          : filtered;
      const paged = pageOf(sorted, page, limit);
      return {
        repos: paged.slice.map(toRepoCard),
        statuses,
        total: paged.total,
        page: paged.page,
        limit: paged.limit,
        hasMore: paged.hasMore,
        nextPage: paged.nextPage,
        nextCursor: paged.nextCursor,
      };
    }),
  }),

  weeklyViralGithub: router({
    /**
     * Public endpoint: this week's curated trending AI repos, ranked by
     * Weekly Rank (1 = most viral). Shown as a highlight strip above the
     * full GitHub Repos table.
     */
    list: publicProcedure.input(listInput).query(async ({ input }) => {
      const repos = await fetchWeeklyViralGithubRepos();
      const { page, limit } = resolvePage(input);
      let filtered = repos;
      const search = input?.search?.trim();
      if (search) {
        filtered = filtered.filter(r =>
          matchesQuery(search, r.name, r.description, r.owner, r.whyViral)
        );
      }
      // Fetch order is Weekly Rank. Don't re-sort — a page must stay in that order.
      const paged = pageOf(filtered, page, limit);
      return {
        repos: paged.slice.map(toWeeklyCard),
        total: paged.total,
        page: paged.page,
        limit: paged.limit,
        hasMore: paged.hasMore,
        nextPage: paged.nextPage,
        nextCursor: paged.nextCursor,
      };
    }),
  }),

  llms: router({
    /**
     * Public endpoint: fetch all LLM models from Teable.
     */
    list: publicProcedure.input(listInput).query(async ({ input }) => {
      const models = await fetchLlmModels();
      const { page, limit } = resolvePage(input);
      const providers = uniqueSorted(models.map(m => m.providerType));
      let filtered = models;
      const search = input?.search?.trim();
      if (search) {
        filtered = filtered.filter(m =>
          matchesQuery(search, m.name, m.summaryEn, m.summaryEs)
        );
      }
      const provider = chosen(input?.provider);
      if (provider)
        filtered = filtered.filter(m => m.providerType === provider);
      filtered = filtered.filter(m => matchesAi(m.aiRelevance, input?.ai));
      const sorted = sortCatalogue(
        filtered.map(m => ({ ...m, category: m.providerType })),
        input?.sort === "provider" ? "category" : input?.sort,
        input?.order
      );
      const paged = pageOf(sorted, page, limit);
      return {
        models: paged.slice.map(toLlmCard),
        providers,
        total: paged.total,
        page: paged.page,
        limit: paged.limit,
        hasMore: paged.hasMore,
        nextPage: paged.nextPage,
        nextCursor: paged.nextCursor,
      };
    }),
  }),

  ltds: router({
    /**
     * Public endpoint: fetch all lifetime deals from Teable.
     */
    list: publicProcedure.input(listInput).query(async ({ input }) => {
      const deals = await fetchLtdDeals();
      const { page, limit } = resolvePage(input);
      const platforms = uniqueSorted(deals.map(d => d.platform));
      const statuses = uniqueSorted(deals.map(d => d.status));
      let filtered = deals;
      const search = input?.search?.trim();
      if (search) {
        filtered = filtered.filter(d =>
          matchesQuery(search, d.name, d.summaryEn, d.summaryEs)
        );
      }
      const platform = chosen(input?.platform);
      if (platform) filtered = filtered.filter(d => d.platform === platform);
      const status = chosen(input?.status);
      if (status) filtered = filtered.filter(d => d.status === status);
      const sortField =
        input?.sort === "platform" || input?.sort === "status"
          ? "category"
          : input?.sort;
      const sorted = sortCatalogue(
        filtered.map(d => ({
          ...d,
          category:
            input?.sort === "status"
              ? d.status
              : input?.sort === "platform"
                ? d.platform
                : d.platform,
        })),
        sortField,
        input?.order
      );
      const paged = pageOf(sorted, page, limit);
      return {
        deals: paged.slice.map(toDealCard),
        platforms,
        statuses,
        total: paged.total,
        page: paged.page,
        limit: paged.limit,
        hasMore: paged.hasMore,
        nextPage: paged.nextPage,
        nextCursor: paged.nextCursor,
      };
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
  sumateTopRecommendations: makeGenericListRouter(
    fetchSumateTopRecommendations
  ),
  thisWeeksAiPicks: makeGenericListRouter(fetchThisWeeksAiPicks),

  search: router({
    /**
     * Global search across all Teable tables.
     * Returns unified results with source table labels.
     */
    global: publicProcedure
      .input(
        z.object({
          query: z.string().min(1).max(200),
          limit: z
            .number()
            .int()
            .min(1)
            .max(LIST_PAGE_SIZE_MAX)
            .default(LIST_PAGE_SIZE_DEFAULT),
          cursor: z.number().int().min(1).max(10_000).nullish(),
          page: z.number().int().min(1).max(10_000).optional(),
          sort: z.enum(["relevance", "name", "rating"]).optional(),
          order: z.enum(["asc", "desc"]).optional(),
        })
      )
      .query(async ({ input }) => {
        const term = input.query.toLowerCase().trim();
        const page = input.page ?? input.cursor ?? 1;
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
          blogPostEn?: string;
        };

        // key is the /tool/<key>/<id> route segment, carried into each result so a
        // search hit can link to the listing's own page.
        const tableFetchers: Array<{
          label: string;
          key: string;
          fetch: () => Promise<SearchSourceItem[]>;
        }> = [
          { label: "AI Tools", key: "tools", fetch: () => fetchAllTools() },
          {
            label: "GitHub Repos",
            key: "github",
            fetch: () => fetchGithubRepos(),
          },
          {
            label: "Weekly Viral GitHub",
            key: "weeklyViralGithub",
            fetch: () => fetchWeeklyViralGithubRepos(),
          },
          { label: "LLMs", key: "llms", fetch: () => fetchLlmModels() },
          {
            label: "Video & Image",
            key: "videoImage",
            fetch: () => fetchVideoImageTools(),
          },
          {
            label: "Music & Voice",
            key: "musicVoice",
            fetch: () => fetchMusicVoiceTools(),
          },
          {
            label: "Chatbots & Agents",
            key: "chatbots",
            fetch: () => fetchChatbotsTools(),
          },
          {
            label: "Free APIs",
            key: "freeApis",
            fetch: () => fetchFreeApisTools(),
          },
          {
            label: "Free LLM & IDE",
            key: "freeLlmIde",
            fetch: () => fetchFreeLlmIdeTools(),
          },
          {
            label: "Vibe Coding",
            key: "vibeCoding",
            fetch: () => fetchVibeCodingTools(),
          },
          {
            label: "Designer Tools",
            key: "designerTools",
            fetch: () => fetchDesignerTools(),
          },
          {
            label: "AI Infrastructure",
            key: "aiInfra",
            fetch: () => fetchAiInfraTools(),
          },
          {
            label: "Hardware & Computers",
            key: "hardware",
            fetch: () => fetchHardwareTools(),
          },
          {
            label: "Testing Tools",
            key: "testingTools",
            fetch: () => fetchTestingTools(),
          },
          {
            label: "AI Security",
            key: "aiSecurity",
            fetch: () => fetchAiSecurityTools(),
          },
          {
            label: "Business Productivity",
            key: "businessProductivity",
            fetch: () => fetchBusinessProductivityTools(),
          },
          {
            label: "MCP Providers",
            key: "mcpProviders",
            fetch: () => fetchMcpProvidersTools(),
          },
          {
            label: "VPS & Cloud",
            key: "vpsCloud",
            fetch: () => fetchVpsCloudTools(),
          },
          {
            label: "AI Media",
            key: "aiMedia",
            fetch: () => fetchAiMediaTools(),
          },
          {
            label: "AI Influencers",
            key: "aiInfluencers",
            fetch: () => fetchAiInfluencersTools(),
          },
          {
            label: "AI Sites",
            key: "aiSites",
            fetch: () => fetchAiSitesTools(),
          },
          {
            label: "AI Discord",
            key: "aiDiscord",
            fetch: () => fetchAiDiscordTools(),
          },
          {
            label: "AU SEO Tools",
            key: "auSeoTools",
            fetch: () => fetchAuSeoTools(),
          },
          {
            label: "Sumate Top Recommendations",
            key: "sumateTopRecommendations",
            fetch: () => fetchSumateTopRecommendations(),
          },
        ];

        // Staggered fetch: the cache serves most of these instantly, but on a
        // cold cache 23 concurrent requests would trip Teable's rate limit.
        const results = await staggeredAll(
          tableFetchers.map(({ label, key, fetch }) => async () => {
            try {
              const items = await fetch();
              return items
                .map(item => {
                  const name = item.name || item.title || "Untitled";
                  const category =
                    item.category || item.topic || item.platform || "";
                  const descEn =
                    item.descriptionEn || item.summaryEn || item.summary || "";
                  const descEs =
                    item.descriptionEs || item.summaryEs || item.summary || "";
                  const base = searchScore(
                    term,
                    name,
                    category,
                    descEn,
                    descEs
                  );
                  // Genuinely-AI products outrank same-relevance general tools
                  // (a tiebreak nudge — never enough to beat a name match).
                  const rel = (item as { aiRelevance?: string }).aiRelevance;
                  const score =
                    base < 0
                      ? base
                      : base +
                        (rel === "AI-first"
                          ? 50
                          : rel === "AI-enabled"
                            ? 15
                            : 0);
                  return { item, name, category, descEn, descEs, score };
                })
                .filter(x => x.score >= 0)
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
                  hasReview: Boolean(item.blogPostEn?.trim()),
                  sourceTable: label,
                  sourceTableKey: key,
                  score,
                }));
            } catch (err) {
              console.error(
                `[GlobalSearch] Error fetching table "${label}":`,
                err
              );
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
            (result.score === existing.score &&
              existing.sourceTable === "AI Tools")
          ) {
            deduped.set(key, result);
          }
        }
        const uniqueResults = Array.from(deduped.values());
        // Rank by relevance score (name matches first), then rating, then name.
        // Name/rating sorts match the home-page control, including its
        // direction flip (rating's comparator is already high-to-low).
        const sort = input.sort ?? "relevance";
        const dir = input.order ?? "asc";
        uniqueResults.sort((a, b) => {
          switch (sort) {
            case "relevance":
              return (
                b.score - a.score ||
                (b.rating || 0) - (a.rating || 0) ||
                a.name.localeCompare(b.name)
              );
            case "rating": {
              const cmp =
                (b.rating || 0) - (a.rating || 0) ||
                a.name.localeCompare(b.name);
              return dir === "asc" ? cmp : -cmp;
            }
            case "name": {
              const cmp = a.name.localeCompare(b.name);
              return dir === "asc" ? cmp : -cmp;
            }
            default: {
              const _exhaustive: never = sort;
              return _exhaustive;
            }
          }
        });

        const paged = pageOf(uniqueResults, page, limit);
        return {
          results: paged.slice.map(({ score, ...r }) => r),
          total: paged.total,
          page: paged.page,
          limit: paged.limit,
          hasMore: paged.hasMore,
          nextPage: paged.nextPage,
          nextCursor: paged.nextCursor,
        };
      }),
  }),

  listing: router({
    /**
     * Full row for one listing: verdict, pros/cons, review text, gallery.
     * Related cards are a fixed handful, not the rest of the table.
     */
    get: publicProcedure
      .input(
        z.object({
          table: z.string().min(1).max(64),
          id: z.string().min(1).max(200),
        })
      )
      .query(async ({ input }) => {
        const fetcher = listingFetchers[input.table];
        if (!fetcher) return { item: null, related: [] };
        const rows = await fetcher();
        const item = rows.find(row => row.id === input.id) ?? null;
        if (!item) return { item: null, related: [] };
        const key = categoryKey(item);
        const related = rows
          .filter(
            row => row.id !== item.id && (key ? categoryKey(row) === key : true)
          )
          .sort(
            (a, b) =>
              (b.rating || 0) - (a.rating || 0) ||
              String(a.name || a.title || "").localeCompare(
                String(b.name || b.title || "")
              )
          )
          .slice(0, 3)
          .map(toRelatedCard);
        return { item, related };
      }),

    /** Blog posts are addressed by slug, not by the table list. */
    bySlug: publicProcedure
      .input(z.object({ slug: z.string().min(1).max(200) }))
      .query(async ({ input }) => {
        const rows = await fetchAiMediaTools();
        const post =
          rows.find(row => blogSlug(row.slug, row.id) === input.slug) ??
          rows.find(row => row.id === input.slug) ??
          null;
        return { post };
      }),
  }),
});

export type AppRouter = typeof appRouter;
