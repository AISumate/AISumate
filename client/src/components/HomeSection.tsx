import { useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { FilterBar } from "./FilterBar";
import { SectionHeading } from "./toolVisuals";
import { ToolCard, type AiTool } from "./ToolCard";
import { ThisWeeksAiPicksSection } from "./ThisWeeksAiPicksSection";
import { SumateTopRecommendationsSection } from "./SumateTopRecommendationsSection";
import { WeeklyViralGithubSection } from "./WeeklyViralGithubSection";
import { formatPublishedDate } from "./BlogArticle";
import { blogSlug } from "@shared/blogSlug";

interface BlogRow {
  id: string;
  name: string;
  slug?: string;
  descriptionEn?: string;
  descriptionEs?: string;
  bodyEn?: string;
  author?: string;
  category?: string;
  readingTimeMinutes?: number;
  publishedDate?: string;
}

/**
 * The blog row on the home page. Cards, not a grid of tool tiles — a post is a
 * headline plus a standfirst, and it wants the room to show both.
 */
function BlogRowSection() {
  const { t, language } = useLanguage();
  const { data, isLoading } = trpc.aiMedia.list.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const posts = ((data?.tools ?? []) as BlogRow[])
    .filter((p) => p.bodyEn?.trim())
    // Newest first; posts with no date sink to the bottom.
    .sort((a, b) => String(b.publishedDate ?? "").localeCompare(String(a.publishedDate ?? "")))
    .slice(0, 3);

  if (isLoading || posts.length === 0) return null;

  return (
    <section className="pt-10 pb-2">
      <SectionHeading title={t("aiMediaTitle")} subtitle={t("aiMediaSubtitle")} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => {
          const standfirst =
            (language === "es" ? post.descriptionEs : post.descriptionEn) || post.descriptionEn || "";
          return (
            <Link
              key={post.id}
              href={`/blog/${blogSlug(post.slug, post.id)}`}
              className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/50"
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                {post.category && (
                  <span
                    className="rounded-full px-2.5 py-0.5 font-medium"
                    style={{
                      backgroundColor: "color-mix(in oklch, var(--primary) 15%, transparent)",
                      color: "var(--primary)",
                    }}
                  >
                    {post.category}
                  </span>
                )}
                {post.publishedDate && (
                  <span>
                    {formatPublishedDate(post.publishedDate, language === "es" ? "es-ES" : "en-US")}
                  </span>
                )}
                {(post.readingTimeMinutes ?? 0) > 0 && (
                  <span>
                    {t("blogReadingTime").replace("{minutes}", String(post.readingTimeMinutes))}
                  </span>
                )}
              </div>

              <h3 className="text-lg font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
                {post.name}
              </h3>

              {standfirst && (
                <p className="line-clamp-4 text-sm leading-relaxed text-muted-foreground">
                  {standfirst}
                </p>
              )}

              <span className="mt-auto inline-flex items-center gap-1.5 pt-1 text-[13px] font-semibold text-primary">
                {t("readPost")}
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

/** A hit from search.global, shaped for ToolCard. */
interface SearchHit extends AiTool {
  sourceTable: string;
  sourceTableKey: string;
}

/**
 * The front page: a catalogue-wide search, and four curated rows that answer
 * "what's worth knowing this week" — the picks, the channels we rate, the repos
 * that went viral, and our own long-form pieces.
 *
 * The search covers EVERY table (the per-tab bars only filter their own tab),
 * so results replace the rows while a query is active rather than sitting under
 * them. Each row is an existing section component reused as-is, so the home
 * page can't drift from the tab it mirrors, and each hides itself when its
 * table is empty — a Teable outage thins the page instead of breaking it.
 */
export function HomeSection() {
  const { t } = useLanguage();
  // Shareable searches: /?q=voice+cloning arrives pre-filled.
  const [search, setSearch] = useState(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("q")?.trim() ?? "";
  });
  const [sortField, setSortField] = useState("relevance");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const term = search.trim();
  const searching = term.length > 0;

  // Searches every table, not just this page — the reason it lives here rather
  // than inside one section. Skipped entirely until something is typed.
  const query = trpc.search.global.useQuery(
    { query: term, limit: 100 },
    { enabled: searching, refetchOnWindowFocus: false },
  );

  const results = useMemo(() => {
    const rows = (query.data?.results ?? []) as SearchHit[];
    if (sortField === "relevance") return rows; // server order is by score
    const sorted = [...rows].sort((a, b) =>
      sortField === "rating"
        ? (b.rating ?? 0) - (a.rating ?? 0) || a.name.localeCompare(b.name)
        : a.name.localeCompare(b.name),
    );
    return sortDirection === "asc" ? sorted : sorted.reverse();
  }, [query.data, sortField, sortDirection]);

  const chips = [
    { label: t("heroChipVoiceCloning"), value: "voice cloning" },
    { label: t("heroChipFreeLlmApi"), value: "free LLM API" },
    { label: t("heroChipImageUpscaler"), value: "image upscaler" },
  ];

  return (
    <div className="py-6">
      <FilterBar
        searchTerm={search}
        onSearchChange={setSearch}
        filters={[]}
        sort={{
          field: sortField,
          direction: sortDirection,
          onFieldChange: setSortField,
          onDirectionChange: setSortDirection,
          options: [
            { value: "relevance", labelKey: "sortByRelevance" },
            { value: "name", labelKey: "sortByName" },
            { value: "rating", labelKey: "sortByRating", defaultDirection: "desc" },
          ],
        }}
        resultCount={searching ? results.length : undefined}
        searchPlaceholderKey="homeSearchPlaceholder"
      />

      {!searching && (
        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-medium text-muted-foreground">{t("heroTryLabel")}</span>
          {chips.map((chip) => (
            <button
              key={chip.value}
              type="button"
              onClick={() => setSearch(chip.value)}
              className="rounded-full border border-border px-3 py-1 font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}

      {searching ? (
        query.isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : results.length === 0 ? (
          <p className="py-20 text-center text-sm text-muted-foreground">
            {t("globalSearchNoResults")}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            {results.map((hit, idx) => (
              <ToolCard
                key={`${hit.sourceTableKey}/${hit.id}`}
                tool={hit}
                index={idx}
                tableKey={hit.sourceTableKey}
                cornerBadge={
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    {hit.sourceTable}
                  </span>
                }
              />
            ))}
          </div>
        )
      ) : (
        <>
          <ThisWeeksAiPicksSection divider={false} />
          <SumateTopRecommendationsSection limit={6} />
          <WeeklyViralGithubSection />
          <BlogRowSection />
        </>
      )}
    </div>
  );
}
