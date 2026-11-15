import { useState } from "react";
import { useLocation } from "wouter";
import { keepPreviousData } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { LIST_PAGE_SIZE_DEFAULT } from "@shared/listPage";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { FilterBar } from "./FilterBar";
import { SectionHeading, type ReviewInfo } from "./toolVisuals";
import { ToolCard } from "./ToolCard";
import { LoadMoreButton } from "./LoadMoreButton";
import { blogSlug } from "@shared/blogSlug";

interface GenericTool extends ReviewInfo {
  id: string;
  name: string;
  descriptionEn: string;
  descriptionEs: string;
  url: string;
  affiliateUrl: string;
  iconUrl: string;
  category: string;
  isAffiliate: boolean;
  rating?: number;
  isNew?: boolean;
  isEnglishContent?: boolean;
  isSpanishContent?: boolean;
  aiRelevance?: string;
  sponsored?: boolean;
  popularity?: number;
  slug?: string;
  bodyEn?: string;
  bodyEs?: string;
  hasBody?: boolean;
  hasReview?: boolean;
  author?: string;
  tags?: string[];
  readingTimeMinutes?: number;
  publishedDate?: string;
}

type ContentLanguageFilter = "all" | "en" | "es";

type SectionTabKey =
  | "videoImage"
  | "musicVoice"
  | "chatbots"
  | "freeApis"
  | "freeLlmIde"
  | "vibeCoding"
  | "designerTools"
  | "aiInfra"
  | "hardware"
  | "testingTools"
  | "aiSecurity"
  | "businessProductivity"
  | "mcpProviders"
  | "vpsCloud"
  | "aiMedia"
  | "aiInfluencers"
  | "aiSites"
  | "aiDiscord"
  | "auSeoTools";
type TranslationKey = Parameters<ReturnType<typeof useLanguage>["t"]>[0];

interface GenericToolSectionProps {
  queryKey: SectionTabKey;
  titleKey: TranslationKey;
  subtitleKey: TranslationKey;
  /** Visit-button label, e.g. "visitChannel" for AI Influencers. Defaults to "Visit Tool". */
  visitLabelKey?: TranslationKey;
  /** Show a "sort by popularity" option — only meaningful for tables with a Subscribers/popularity metric (AI Influencers). */
  hasPopularitySort?: boolean;
  /** Show the English/Spanish/Both content-language radio filter — only meaningful for tables with English/Spanish content flags (AI Influencers). */
  hasLanguageFilter?: boolean;
  /** Clicking a tile opens its full body content in a blog-post dialog (AI Media). */
  hasBlogView?: boolean;
  /**
   * Denser tiles with no description teaser, and more columns per row — for
   * long lists (AI Influencers) where fitting more on screen beats the preview.
   */
  compactCards?: boolean;
}

export function GenericToolSection({
  queryKey,
  titleKey,
  subtitleKey,
  visitLabelKey = "visitToolGeneric",
  hasPopularitySort = false,
  hasLanguageFilter = false,
  hasBlogView = false,
  compactCards = false,
}: GenericToolSectionProps) {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [aiFilter, setAiFilter] = useState("all");
  // The blog reads newest-first; every other section reads alphabetically.
  const [sortField, setSortField] = useState(hasBlogView ? "newest" : "name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(
    hasBlogView ? "desc" : "asc"
  );
  const [languageFilter, setLanguageFilter] =
    useState<ContentLanguageFilter>("all");
  const [, navigate] = useLocation();
  const debouncedSearch = useDebouncedValue(search);

  // Filter and sort run on the server so a page never contains the whole table.
  // Search is debounced; the other controls apply on the next request.
  const query = trpc[queryKey].list.useInfiniteQuery(
    {
      search: debouncedSearch.trim() || undefined,
      category: categoryFilter,
      ai: aiFilter as "all" | "ai" | "aiFirst",
      language: hasLanguageFilter ? languageFilter : undefined,
      sort: sortField as
        | "name"
        | "category"
        | "rating"
        | "newest"
        | "popularity",
      order: sortDirection,
      limit: LIST_PAGE_SIZE_DEFAULT,
    },
    {
      initialCursor: 1,
      getNextPageParam: last => last.nextCursor ?? undefined,
      placeholderData: keepPreviousData,
      refetchOnWindowFocus: false,
    }
  );

  const tools = (query.data?.pages.flatMap(page => page.tools) ??
    []) as GenericTool[];
  const total = query.data?.pages[0]?.total ?? 0;
  const isLoading = query.isLoading;
  const isError = query.isError;
  const categoryOptions = (query.data?.pages[0]?.categories ?? []).map(
    category => ({ value: category, label: category })
  );

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const handleReset = () => {
    setSearch("");
    setCategoryFilter("all");
    setAiFilter("all");
    setSortField(hasBlogView ? "newest" : "name");
    setSortDirection(hasBlogView ? "desc" : "asc");
    setLanguageFilter("all");
  };

  return (
    // Full width of the surrounding container, matching the LLMs/GitHub tabs —
    // the old max-w-5xl cap gave these tabs a narrower page than the rest.
    <div className="py-6">
      <SectionHeading title={t(titleKey)} subtitle={t(subtitleKey)} />

      {/* Loading state — show ONLY the spinner. Rendering the FilterBar here
          would flash "0 results" (and the filters) before the data arrives. */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Error state */}
      {!isLoading && isError && (
        <div className="text-center py-20">
          <p className="text-lg font-medium text-foreground mb-1">
            {t("errorLoading")}
          </p>
        </div>
      )}

      {/* Loaded: filters + grid (or a real empty state). Only mounted once the
          query has resolved, so the count and empty message are never premature. */}
      {!isLoading && !isError && (
        <>
          <FilterBar
            searchTerm={search}
            onSearchChange={handleSearchChange}
            filters={[
              ...(categoryOptions.length > 0
                ? [
                    {
                      key: "category",
                      value: categoryFilter,
                      onChange: setCategoryFilter,
                      options: categoryOptions,
                      placeholderKey: "filterByCategory",
                    },
                  ]
                : []),
              {
                key: "aiRelevance",
                value: aiFilter,
                onChange: setAiFilter,
                options: [
                  { value: "ai", label: t("aiRelevanceAiOnly") },
                  { value: "aiFirst", label: t("aiRelevanceAiFirstOnly") },
                ],
                placeholderKey: "aiRelevanceFilter",
                allLabel: t("aiRelevanceAll"),
              },
            ]}
            sort={{
              field: sortField,
              direction: sortDirection,
              onFieldChange: setSortField,
              onDirectionChange: setSortDirection,
              options: [
                ...(hasBlogView
                  ? [
                      {
                        value: "newest",
                        labelKey: "sortByNewest",
                        defaultDirection: "desc" as const,
                      },
                    ]
                  : []),
                {
                  value: "name",
                  labelKey: "sortByName",
                  defaultDirection: "asc",
                },
                {
                  value: "category",
                  labelKey: "sortByCategory",
                  defaultDirection: "asc",
                },
                {
                  value: "rating",
                  labelKey: "sortByRating",
                  defaultDirection: "desc",
                },
                ...(hasPopularitySort
                  ? [
                      {
                        value: "popularity",
                        labelKey: "sortByPopularity",
                        defaultDirection: "desc" as const,
                      },
                    ]
                  : []),
              ],
            }}
            resultCount={total}
            onReset={handleReset}
          />

          {hasLanguageFilter && (
            <RadioGroup
              value={languageFilter}
              onValueChange={v => {
                setLanguageFilter(v as ContentLanguageFilter);
              }}
              className="mb-6 -mt-3 flex flex-row flex-wrap items-center gap-5"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="en" id={`${queryKey}-lang-en`} />
                <Label
                  htmlFor={`${queryKey}-lang-en`}
                  className="font-normal cursor-pointer"
                >
                  {t("languageFilterEnglish")}
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="es" id={`${queryKey}-lang-es`} />
                <Label
                  htmlFor={`${queryKey}-lang-es`}
                  className="font-normal cursor-pointer"
                >
                  {t("languageFilterSpanish")}
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="all" id={`${queryKey}-lang-both`} />
                <Label
                  htmlFor={`${queryKey}-lang-both`}
                  className="font-normal cursor-pointer"
                >
                  {t("languageFilterBoth")}
                </Label>
              </div>
            </RadioGroup>
          )}

          {/* Empty state */}
          {tools.length === 0 && (
            <div className="text-center py-20">
              <p className="text-lg text-muted-foreground">
                {t("noResultsGeneric")}
              </p>
            </div>
          )}
        </>
      )}

      {/* Tools grid */}
      {!isLoading && !isError && tools.length > 0 && (
        <>
          {/* 5-up at xl, where the container is at its 1216px cap (218px cards).
              lg holds a 960px container, so it stops at 4 (228px cards).
              Compact mode goes two columns denser at every breakpoint. */}
          <div
            className={`grid gap-3 ${
              compactCards
                ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6"
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5"
            }`}
          >
            {tools.map((tool, idx) => {
              // Blog posts have their own page at /blog/<slug>; everything else
              // keeps the card default (landing page, or the detail dialog).
              const blogHref =
                hasBlogView && tool.hasBody
                  ? `/blog/${blogSlug(tool.slug, tool.id)}`
                  : "";
              return (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  index={idx}
                  compact={compactCards}
                  tableKey={queryKey}
                  visitLabel={t(visitLabelKey)}
                  onOpenDetails={
                    blogHref ? () => navigate(blogHref) : undefined
                  }
                />
              );
            })}
          </div>

          <LoadMoreButton
            shown={tools.length}
            total={total}
            hasMore={Boolean(query.hasNextPage)}
            pending={query.isFetchingNextPage}
            onClick={() => {
              void query.fetchNextPage();
            }}
          />
        </>
      )}
    </div>
  );
}
