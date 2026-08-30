import { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { FilterBar, buildFilterOptions } from "./FilterBar";
import { SectionHeading, type ReviewInfo } from "./toolVisuals";
import { ToolCard } from "./ToolCard";
import { BlogPostDialog } from "./BlogPostDialog";

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
  popularity?: number;
  slug?: string;
  bodyEn?: string;
  bodyEs?: string;
  author?: string;
  tags?: string[];
  readingTimeMinutes?: number;
  publishedDate?: string;
}

type ContentLanguageFilter = "all" | "en" | "es";

type SectionTabKey = "videoImage" | "musicVoice" | "chatbots" | "freeApis" | "freeLlmIde" | "vibeCoding" | "designerTools" | "aiInfra" | "hardware" | "testingTools" | "aiSecurity" | "businessProductivity" | "mcpProviders" | "vpsCloud" | "aiMedia" | "aiInfluencers" | "aiSites" | "aiDiscord" | "auSeoTools";
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

export function GenericToolSection({ queryKey, titleKey, subtitleKey, visitLabelKey = "visitToolGeneric", hasPopularitySort = false, hasLanguageFilter = false, hasBlogView = false, compactCards = false }: GenericToolSectionProps) {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [languageFilter, setLanguageFilter] = useState<ContentLanguageFilter>("all");
  const [blogPostTool, setBlogPostTool] = useState<GenericTool | null>(null);
  const [displayCount, setDisplayCount] = useState(100);

  // Fetch the full (server-cached) list once; search/filter/sort client-side
  // so typing doesn't fire a request per keystroke.
  const query = trpc[queryKey].list.useQuery(undefined, { refetchOnWindowFocus: false });

  const tools = query.data?.tools ?? [];
  const isLoading = query.isLoading;
  const isError = query.isError;

  const categoryOptions = useMemo(
    () => buildFilterOptions(tools, (tool) => tool.category),
    [tools],
  );

  const filteredTools = useMemo(() => {
    let result = tools;
    if (search.trim()) {
      const term = search.toLowerCase().trim();
      result = result.filter(
        (tool) =>
          tool.name.toLowerCase().includes(term) ||
          tool.descriptionEn.toLowerCase().includes(term) ||
          tool.descriptionEs.toLowerCase().includes(term),
      );
    }
    if (categoryFilter !== "all") {
      result = result.filter((tool) => tool.category === categoryFilter);
    }
    if (hasLanguageFilter && languageFilter !== "all") {
      result = result.filter((tool) =>
        languageFilter === "en" ? tool.isEnglishContent : tool.isSpanishContent,
      );
    }
    const sorted = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortField === "name") {
        cmp = a.name.localeCompare(b.name);
      } else if (sortField === "category") {
        cmp = (a.category || "").localeCompare(b.category || "");
        if (cmp === 0) cmp = a.name.localeCompare(b.name);
      } else if (sortField === "rating") {
        cmp = (b.rating || 0) - (a.rating || 0);
        if (cmp === 0) cmp = a.name.localeCompare(b.name);
      } else if (sortField === "popularity") {
        cmp = (b.popularity || 0) - (a.popularity || 0);
        if (cmp === 0) cmp = a.name.localeCompare(b.name);
      }
      return sortDirection === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [tools, search, categoryFilter, sortField, sortDirection, hasLanguageFilter, languageFilter]);

  const displayedTools = useMemo(() => filteredTools.slice(0, displayCount), [filteredTools, displayCount]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setDisplayCount(100);
  };

  const handleReset = () => {
    setSearch("");
    setCategoryFilter("all");
    setSortField("name");
    setSortDirection("asc");
    setLanguageFilter("all");
    setDisplayCount(100);
  };

  return (
    // max-w-5xl: keep the tools area in a centered middle column like the mockup
    <div className="py-6 max-w-5xl mx-auto">
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
          <p className="text-lg font-medium text-foreground mb-1">{t("errorLoading")}</p>
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
                ? [{
                    key: "category",
                    value: categoryFilter,
                    onChange: (v: string) => { setCategoryFilter(v); setDisplayCount(100); },
                    options: categoryOptions,
                    placeholderKey: "filterByCategory",
                  }]
                : []),
            ]}
            sort={{
              field: sortField,
              direction: sortDirection,
              onFieldChange: (f: string) => { setSortField(f); setDisplayCount(100); },
              onDirectionChange: (d: "asc" | "desc") => { setSortDirection(d); setDisplayCount(100); },
              options: [
                { value: "name", labelKey: "sortByName", defaultDirection: "asc" },
                { value: "category", labelKey: "sortByCategory", defaultDirection: "asc" },
                { value: "rating", labelKey: "sortByRating", defaultDirection: "desc" },
                ...(hasPopularitySort
                  ? [{ value: "popularity", labelKey: "sortByPopularity", defaultDirection: "desc" as const }]
                  : []),
              ],
            }}
            resultCount={filteredTools.length}
            onReset={handleReset}
          />

          {hasLanguageFilter && (
            <RadioGroup
              value={languageFilter}
              onValueChange={(v) => { setLanguageFilter(v as ContentLanguageFilter); setDisplayCount(100); }}
              className="mb-6 -mt-3 flex flex-row flex-wrap items-center gap-5"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="en" id={`${queryKey}-lang-en`} />
                <Label htmlFor={`${queryKey}-lang-en`} className="font-normal cursor-pointer">{t("languageFilterEnglish")}</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="es" id={`${queryKey}-lang-es`} />
                <Label htmlFor={`${queryKey}-lang-es`} className="font-normal cursor-pointer">{t("languageFilterSpanish")}</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="all" id={`${queryKey}-lang-both`} />
                <Label htmlFor={`${queryKey}-lang-both`} className="font-normal cursor-pointer">{t("languageFilterBoth")}</Label>
              </div>
            </RadioGroup>
          )}

          {/* Empty state */}
          {filteredTools.length === 0 && (
            <div className="text-center py-20">
              <p className="text-lg text-muted-foreground">{t("noResultsGeneric")}</p>
            </div>
          )}
        </>
      )}

      {/* Tools grid */}
      {!isLoading && !isError && filteredTools.length > 0 && (
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
            {displayedTools.map((tool, idx) => {
              const canOpenBlogPost = hasBlogView && Boolean(tool.bodyEn);
              return (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  index={idx}
                  compact={compactCards}
                  visitLabel={t(visitLabelKey)}
                  onOpenDetails={canOpenBlogPost ? () => setBlogPostTool(tool) : undefined}
                />
              );
            })}
          </div>

          {/* Load more */}
          {filteredTools.length > displayCount && (
            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground mb-3">
                {t("showingResults")
                  .replace("{shown}", String(displayCount))
                  .replace("{total}", String(filteredTools.length))}
              </p>
              <Button
                variant="outline"
                onClick={() => setDisplayCount((c) => c + 100)}
                className="border-primary/30 text-primary hover:bg-primary/5"
              >
                {t("loadMore")}
              </Button>
            </div>
          )}
        </>
      )}

      {hasBlogView && (
        <BlogPostDialog
          tool={blogPostTool}
          open={blogPostTool !== null}
          onOpenChange={(open) => { if (!open) setBlogPostTool(null); }}
        />
      )}
    </div>
  );
}
