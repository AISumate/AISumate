import { z } from "zod";
import { LIST_PAGE_SIZE_DEFAULT, LIST_PAGE_SIZE_MAX } from "@shared/listPage";

/**
 * Shared filter / sort / page helpers for public catalogue procedures.
 *
 * The Teable fetchers still load a table into the server cache (prerender and
 * the per-record detail procedure need the full row). Nothing in this module
 * returns that array. Callers map the page through a slim card projector first.
 */

export const listInput = z.object({
  /** Page number for `useInfiniteQuery`. `page` is the same thing for callers that don't use a cursor. */
  cursor: z.number().int().min(1).max(10_000).nullish(),
  page: z.number().int().min(1).max(10_000).optional(),
  /** Omitted → 24. Anything above 50 is rejected, not clamped into a full dump. */
  limit: z.number().int().min(1).max(LIST_PAGE_SIZE_MAX).optional(),
  search: z.string().max(200).optional(),
  category: z.string().max(200).optional(),
  status: z.string().max(200).optional(),
  provider: z.string().max(200).optional(),
  platform: z.string().max(200).optional(),
  ai: z.enum(["all", "ai", "aiFirst"]).optional(),
  language: z.enum(["all", "en", "es"]).optional(),
  hasBody: z.boolean().optional(),
  sort: z
    .enum([
      "name",
      "category",
      "rating",
      "newest",
      "popularity",
      "rank",
      "stars",
      "provider",
      "platform",
      "status",
      "relevance",
    ])
    .optional(),
  /**
   * asc/desc. Named `order` because tRPC infinite queries reserve `direction`
   * for forward/backward cursors.
   */
  order: z.enum(["asc", "desc"]).optional(),
});

export type ListQuery = z.infer<typeof listInput>;

export interface PageMeta {
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  nextPage: number | null;
  nextCursor: number | null;
}

/** Split a query into lowercased word tokens. "Free LLM API" -> ["free","llm","api"]. */
export const searchTokens = (query: string): string[] =>
  query.toLowerCase().trim().split(/\s+/).filter(Boolean);

/**
 * An item matches when EVERY query word appears somewhere in its searchable
 * text. The old matcher required the whole query as one contiguous substring,
 * so any multi-word query ("free LLM API") matched nothing.
 */
export const matchesQuery = (
  query: string,
  ...fields: (string | undefined)[]
): boolean => {
  const tokens = searchTokens(query);
  if (!tokens.length) return true;
  const hay = fields.map(f => (f ?? "").toLowerCase()).join(" ");
  return tokens.every(t => hay.includes(t));
};

/**
 * Relevance score for global search — higher is better; -1 means no match.
 * Name matches beat description matches, and exact/prefix name matches beat
 * partial ones, so "claude" surfaces the Claude entry instead of alphabetically
 * whatever happens to mention Claude in its description.
 */
export const searchScore = (
  query: string,
  name: string,
  category: string,
  ...descriptions: (string | undefined)[]
): number => {
  const tokens = searchTokens(query);
  if (!tokens.length) return 0;
  const n = name.toLowerCase();
  const c = category.toLowerCase();
  const d = descriptions.map(x => (x ?? "").toLowerCase()).join(" ");
  const hay = `${n} ${c} ${d}`;
  if (!tokens.every(t => hay.includes(t))) return -1;
  const q = query.toLowerCase().trim();
  let score = 0;
  if (n === q) score += 1000;
  else if (n.startsWith(q)) score += 600;
  else if (n.includes(q)) score += 400;
  if (tokens.every(t => n.includes(t))) score += 200;
  else if (tokens.some(t => n.includes(t))) score += 60;
  if (tokens.every(t => c.includes(t))) score += 80;
  return score;
};

export function resolvePage(input: Partial<ListQuery> | null | undefined): {
  page: number;
  limit: number;
} {
  const query = input ?? {};
  const page = query.page ?? query.cursor ?? 1;
  const limit = query.limit ?? LIST_PAGE_SIZE_DEFAULT;
  return { page, limit };
}

/** Blank and the sentinel "all" both mean "no filter". */
export function chosen(value: string | undefined): string | undefined {
  const v = value?.trim();
  if (!v || v.toLowerCase() === "all") return undefined;
  return v;
}

export function uniqueSorted(values: (string | undefined)[]): string[] {
  return Array.from(
    new Set(values.map(v => (v ?? "").trim()).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));
}

export function matchesAi(
  relevance: string | undefined,
  ai: "all" | "ai" | "aiFirst" | undefined
): boolean {
  switch (ai) {
    case undefined:
    case "all":
      return true;
    case "ai":
      return relevance === "AI-first" || relevance === "AI-enabled";
    case "aiFirst":
      return relevance === "AI-first";
    default: {
      const _exhaustive: never = ai;
      return _exhaustive;
    }
  }
}

export function matchesLanguage(
  item: { isEnglishContent?: boolean; isSpanishContent?: boolean },
  language: "all" | "en" | "es" | undefined
): boolean {
  switch (language) {
    case undefined:
    case "all":
      return true;
    case "en":
      return Boolean(item.isEnglishContent);
    case "es":
      return Boolean(item.isSpanishContent);
    default: {
      const _exhaustive: never = language;
      return _exhaustive;
    }
  }
}

export function pageOf<T>(items: T[], page: number, limit: number) {
  const total = items.length;
  const start = (page - 1) * limit;
  const slice = start >= total ? [] : items.slice(start, start + limit);
  const hasMore = start + slice.length < total;
  const next = hasMore ? page + 1 : null;
  const meta: PageMeta = {
    total,
    page,
    limit,
    hasMore,
    nextPage: next,
    nextCursor: next,
  };
  return { slice, ...meta };
}

const TOOL_SORTS = [
  "name",
  "category",
  "rating",
  "newest",
  "popularity",
  "rank",
] as const;
type ToolSort = (typeof TOOL_SORTS)[number];

function asToolSort(sort: string | undefined): ToolSort {
  return (TOOL_SORTS as readonly string[]).includes(sort ?? "")
    ? (sort as ToolSort)
    : "name";
}

function defaultDirection(sort: ToolSort): "asc" | "desc" {
  switch (sort) {
    case "rating":
    case "popularity":
    case "newest":
      return "desc";
    case "name":
    case "category":
    case "rank":
      return "asc";
    default: {
      const _exhaustive: never = sort;
      return _exhaustive;
    }
  }
}

interface SortableTool {
  name: string;
  category?: string;
  rating?: number;
  publishedDate?: string;
  popularity?: number;
  rank?: number;
}

/** Same comparators the grids used to apply in the browser, so page 2 continues page 1. */
export function sortCatalogue<T extends SortableTool>(
  items: T[],
  sort: string | undefined,
  direction: "asc" | "desc" | undefined
): T[] {
  const field = asToolSort(sort);
  const dir = direction ?? defaultDirection(field);
  const indexed = items.map((item, index) => ({ item, index }));
  indexed.sort((a, b) => {
    let cmp = 0;
    switch (field) {
      case "name":
        cmp = a.item.name.localeCompare(b.item.name);
        break;
      case "category":
        cmp = (a.item.category || "").localeCompare(b.item.category || "");
        if (cmp === 0) cmp = a.item.name.localeCompare(b.item.name);
        break;
      case "rating":
        cmp = (b.item.rating || 0) - (a.item.rating || 0);
        if (cmp === 0) cmp = a.item.name.localeCompare(b.item.name);
        break;
      case "popularity":
        cmp = (b.item.popularity || 0) - (a.item.popularity || 0);
        if (cmp === 0) cmp = a.item.name.localeCompare(b.item.name);
        break;
      case "rank":
        cmp =
          (a.item.rank || Number.POSITIVE_INFINITY) -
          (b.item.rank || Number.POSITIVE_INFINITY);
        if (cmp === 0) cmp = a.item.name.localeCompare(b.item.name);
        break;
      case "newest":
        cmp = String(b.item.publishedDate || "").localeCompare(
          String(a.item.publishedDate || "")
        );
        if (cmp === 0) cmp = b.index - a.index;
        return dir === "desc" ? cmp : -cmp;
      default: {
        const _exhaustive: never = field;
        return _exhaustive;
      }
    }
    return dir === "asc" ? cmp : -cmp;
  });
  return indexed.map(row => row.item);
}

/** Card payload. Review essays, galleries, and blog bodies stay on the detail procedure. */
export interface ToolCardFields {
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
  aiRelevance: string;
  sponsored: boolean;
  hasReview: boolean;
  isEnglishContent?: boolean;
  isSpanishContent?: boolean;
  slug?: string;
  author?: string;
  readingTimeMinutes?: number;
  publishedDate?: string;
  hasBody?: boolean;
}

interface ToolSource {
  id: string;
  name: string;
  descriptionEn?: string;
  descriptionEs?: string;
  category?: string;
  url?: string;
  affiliateUrl?: string;
  iconUrl?: string;
  isAffiliate?: boolean;
  rating?: number;
  isNew?: boolean;
  aiRelevance?: string;
  sponsored?: boolean;
  blogPostEn?: string;
  isEnglishContent?: boolean;
  isSpanishContent?: boolean;
  slug?: string;
  author?: string;
  readingTimeMinutes?: number;
  publishedDate?: string;
  bodyEn?: string;
}

export function toToolCard(tool: ToolSource): ToolCardFields {
  const card: ToolCardFields = {
    id: tool.id,
    name: tool.name,
    descriptionEn: tool.descriptionEn ?? "",
    descriptionEs: tool.descriptionEs ?? "",
    category: tool.category ?? "",
    url: tool.url ?? "",
    affiliateUrl: tool.affiliateUrl ?? "",
    iconUrl: tool.iconUrl ?? "",
    isAffiliate: Boolean(tool.isAffiliate),
    rating: tool.rating ?? 0,
    isNew: Boolean(tool.isNew),
    aiRelevance: tool.aiRelevance ?? "",
    sponsored: Boolean(tool.sponsored),
    hasReview: Boolean(tool.blogPostEn?.trim()),
  };
  if (tool.isEnglishContent) card.isEnglishContent = true;
  if (tool.isSpanishContent) card.isSpanishContent = true;
  if (tool.slug) card.slug = tool.slug;
  if (tool.author) card.author = tool.author;
  if (tool.readingTimeMinutes)
    card.readingTimeMinutes = tool.readingTimeMinutes;
  if (tool.publishedDate) card.publishedDate = tool.publishedDate;
  if (tool.bodyEn?.trim()) card.hasBody = true;
  return card;
}

export interface LlmCardFields {
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
  aiRelevance: string;
  sponsored: boolean;
  hasReview: boolean;
}

export function toLlmCard(model: {
  id: string;
  name: string;
  summaryEn?: string;
  summaryEs?: string;
  providerType?: string;
  url?: string;
  affiliateUrl?: string;
  iconUrl?: string;
  isAffiliate?: boolean;
  rating?: number;
  isNew?: boolean;
  aiRelevance?: string;
  sponsored?: boolean;
  blogPostEn?: string;
}): LlmCardFields {
  return {
    id: model.id,
    name: model.name,
    summaryEn: model.summaryEn ?? "",
    summaryEs: model.summaryEs ?? "",
    providerType: model.providerType ?? "",
    url: model.url ?? "",
    affiliateUrl: model.affiliateUrl ?? "",
    iconUrl: model.iconUrl ?? "",
    isAffiliate: Boolean(model.isAffiliate),
    rating: model.rating ?? 0,
    isNew: Boolean(model.isNew),
    aiRelevance: model.aiRelevance ?? "",
    sponsored: Boolean(model.sponsored),
    hasReview: Boolean(model.blogPostEn?.trim()),
  };
}

export interface RepoCardFields {
  id: string;
  name: string;
  repoUrl: string;
  description: string;
  owner: string;
  language: string;
  stars: number;
  status: string;
  rating: number;
  isNew: boolean;
}

export function toRepoCard(repo: {
  id: string;
  name: string;
  repoUrl?: string;
  description?: string;
  owner?: string;
  language?: string;
  stars?: number;
  status?: string;
  rating?: number;
  isNew?: boolean;
}): RepoCardFields {
  return {
    id: repo.id,
    name: repo.name,
    repoUrl: repo.repoUrl ?? "",
    description: repo.description ?? "",
    owner: repo.owner ?? "",
    language: repo.language ?? "",
    stars: repo.stars ?? 0,
    status: repo.status ?? "",
    rating: repo.rating ?? 0,
    isNew: Boolean(repo.isNew),
  };
}

export interface WeeklyCardFields {
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
  hasReview: boolean;
}

export function toWeeklyCard(repo: {
  id: string;
  name: string;
  repoUrl?: string;
  description?: string;
  descriptionEn?: string;
  descriptionEs?: string;
  owner?: string;
  language?: string;
  stars?: number;
  starsThisWeek?: number;
  weeklyRank?: number;
  weekEnding?: string;
  whyViral?: string;
  iconUrl?: string;
  rating?: number;
  blogPostEn?: string;
  prosEn?: string;
}): WeeklyCardFields {
  return {
    id: repo.id,
    name: repo.name,
    repoUrl: repo.repoUrl ?? "",
    description: repo.description ?? "",
    descriptionEn: repo.descriptionEn ?? "",
    descriptionEs: repo.descriptionEs ?? "",
    owner: repo.owner ?? "",
    language: repo.language ?? "",
    stars: repo.stars ?? 0,
    starsThisWeek: repo.starsThisWeek ?? 0,
    weeklyRank: repo.weeklyRank ?? 0,
    weekEnding: repo.weekEnding ?? "",
    whyViral: repo.whyViral ?? "",
    iconUrl: repo.iconUrl ?? "",
    rating: repo.rating ?? 0,
    hasReview: Boolean(repo.blogPostEn?.trim() || repo.prosEn?.trim()),
  };
}

export interface DealCardFields {
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

export function toDealCard(deal: {
  id: string;
  name: string;
  website?: string;
  summaryEn?: string;
  summaryEs?: string;
  dealUrl?: string;
  platform?: string;
  status?: string;
  iconUrl?: string;
  rating?: number;
  isNew?: boolean;
}): DealCardFields {
  return {
    id: deal.id,
    name: deal.name,
    website: deal.website ?? "",
    summaryEn: deal.summaryEn ?? "",
    summaryEs: deal.summaryEs ?? "",
    dealUrl: deal.dealUrl ?? "",
    platform: deal.platform ?? "",
    status: deal.status ?? "",
    iconUrl: deal.iconUrl ?? "",
    rating: deal.rating ?? 0,
    isNew: Boolean(deal.isNew),
  };
}

/** Three neighbours for a landing page. Slim — the page already has the full record. */
export function toRelatedCard(item: {
  id: string;
  name?: string;
  title?: string;
  descriptionEn?: string;
  descriptionEs?: string;
  summaryEn?: string;
  summaryEs?: string;
  description?: string;
  category?: string;
  providerType?: string;
  rating?: number;
}) {
  return {
    id: item.id,
    name: item.name || item.title || "",
    descriptionEn:
      item.descriptionEn || item.summaryEn || item.description || "",
    descriptionEs: item.descriptionEs || item.summaryEs || "",
    summaryEn: item.summaryEn || "",
    summaryEs: item.summaryEs || "",
    category: item.category || item.providerType || "",
    rating: item.rating || 0,
  };
}

export function categoryKey(item: {
  category?: string;
  providerType?: string;
  topic?: string;
  platform?: string;
}): string {
  return (
    item.category || item.providerType || item.topic || item.platform || ""
  );
}
