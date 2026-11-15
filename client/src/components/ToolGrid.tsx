import { useState } from "react";
import { keepPreviousData } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { LIST_PAGE_SIZE_DEFAULT } from "@shared/listPage";
import { trpc } from "@/lib/trpc";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { ToolCard } from "./ToolCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { FilterBar } from "./FilterBar";
import { ThisWeeksAiPicksSection } from "./ThisWeeksAiPicksSection";
import { LoadMoreButton } from "./LoadMoreButton";

export function ToolGrid() {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [aiFilter, setAiFilter] = useState("all");
  const debouncedSearch = useDebouncedValue(searchTerm);

  const query = trpc.tools.list.useInfiniteQuery(
    {
      search: debouncedSearch.trim() || undefined,
      category: activeCategory,
      sort: sortField as "name" | "category" | "rating",
      order: sortDirection,
      ai: aiFilter as "all" | "ai" | "aiFirst",
      limit: LIST_PAGE_SIZE_DEFAULT,
    },
    {
      initialCursor: 1,
      getNextPageParam: last => last.nextCursor ?? undefined,
      placeholderData: keepPreviousData,
      refetchOnWindowFocus: false,
    }
  );

  const tools = query.data?.pages.flatMap(page => page.tools) ?? [];
  const total = query.data?.pages[0]?.total ?? 0;
  const categories = query.data?.pages[0]?.categories ?? [];
  const categoryOptions = categories.map(cat => ({ value: cat, label: cat }));

  const sortOptions = [
    { value: "name", labelKey: "sortByName", defaultDirection: "asc" as const },
    {
      value: "category",
      labelKey: "filterByCategory",
      defaultDirection: "asc" as const,
    },
    {
      value: "rating",
      labelKey: "sortByRating",
      defaultDirection: "desc" as const,
    },
  ];

  const handleReset = () => {
    setSearchTerm("");
    setActiveCategory("all");
    setAiFilter("all");
    setSortField("name");
    setSortDirection("asc");
  };

  return (
    // pt-2: the category nav is a single-row carousel now, so the old py-12 top
    // padding (on top of the tab wrapper's py-4) left a dead gap above the
    // search bar. Bottom padding stays generous.
    <section className="pt-2 pb-12 grid-pattern-bg">
      {/* SectionTabs already wraps every tab panel in .container — nesting
          another one here (or capping with max-w-5xl, as this once did) eats
          64px of width and gives tabs mismatched page widths. */}
      <div>
        {query.isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : query.isError ? (
          <p className="text-center py-20 text-sm text-destructive">
            {t("errorLoading")}
          </p>
        ) : (
          <>
            <FilterBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              filters={[
                ...(categories.length > 0
                  ? [
                      {
                        key: "category",
                        value: activeCategory,
                        onChange: setActiveCategory,
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
                options: sortOptions,
              }}
              resultCount={total}
              onReset={handleReset}
            />

            {/* Curated top-5 strip, between the search bar and the main grid. */}
            <ThisWeeksAiPicksSection />

            {tools.length > 0 ? (
              <>
                {/* Matches GenericToolSection: 5-up at xl (1216px container → 218px cards),
                    4 at lg (960px container → 228px). */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {tools.map((tool, idx) => (
                    <ToolCard
                      key={tool.id}
                      tool={tool}
                      index={idx}
                      tableKey="tools"
                    />
                  ))}
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
            ) : (
              <div className="text-center py-20">
                <p className="text-lg font-medium text-foreground mb-1">
                  {t("noResults")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("noResultsDesc")}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
