import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ToolCard } from "./ToolCard";
import type { AiTool } from "./ToolCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { FilterBar } from "./FilterBar";
import { ThisWeeksAiPicksSection } from "./ThisWeeksAiPicksSection";

interface ToolGridProps {
  tools: AiTool[];
  categories: string[];
}

export function ToolGrid({ tools, categories }: ToolGridProps) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [displayCount, setDisplayCount] = useState(100);
  const [aiFilter, setAiFilter] = useState("all");

  const categoryOptions = useMemo(
    () => categories.map((cat) => ({ value: cat, label: cat })),
    [categories],
  );

  const sortOptions = [
    { value: "name", labelKey: "sortByName", defaultDirection: "asc" as const },
    { value: "category", labelKey: "filterByCategory", defaultDirection: "asc" as const },
    { value: "rating", labelKey: "sortByRating", defaultDirection: "desc" as const },
  ];

  const filteredTools = useMemo(() => {
    let result = tools;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(
        (tool) =>
          tool.name.toLowerCase().includes(term) ||
          tool.descriptionEn.toLowerCase().includes(term) ||
          tool.descriptionEs.toLowerCase().includes(term),
      );
    }

    if (activeCategory !== "all") {
      result = result.filter(
        (tool) => tool.category.toLowerCase() === activeCategory.toLowerCase(),
      );
    }

    if (aiFilter === "ai") {
      result = result.filter(
        (tool) => tool.aiRelevance === "AI-first" || tool.aiRelevance === "AI-enabled",
      );
    } else if (aiFilter === "aiFirst") {
      result = result.filter((tool) => tool.aiRelevance === "AI-first");
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
      }
      return sortDirection === "asc" ? cmp : -cmp;
    });

    return sorted;
  }, [tools, searchTerm, activeCategory, aiFilter, sortField, sortDirection]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setDisplayCount(100);
  };

  const handleCategoryChange = (value: string) => {
    setActiveCategory(value);
    setDisplayCount(100);
  };

  const handleSortFieldChange = (field: string) => {
    setSortField(field);
    setDisplayCount(100);
  };

  const handleSortDirectionChange = (dir: "asc" | "desc") => {
    setSortDirection(dir);
    setDisplayCount(100);
  };

  const handleReset = () => {
    setSearchTerm("");
    setActiveCategory("all");
    setAiFilter("all");
    setSortField("name");
    setSortDirection("asc");
    setDisplayCount(100);
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
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          filters={[
            ...(categories.length > 0
              ? [{
                  key: "category",
                  value: activeCategory,
                  onChange: handleCategoryChange,
                  options: categoryOptions,
                  placeholderKey: "filterByCategory",
                }]
              : []),
            {
              key: "aiRelevance",
              value: aiFilter,
              onChange: (v: string) => { setAiFilter(v); setDisplayCount(100); },
              options: [
                { value: "all", label: t("aiRelevanceAll") },
                { value: "ai", label: t("aiRelevanceAiOnly") },
                { value: "aiFirst", label: t("aiRelevanceAiFirstOnly") },
              ],
              placeholderKey: "aiRelevanceFilter",
            },
          ]}
          sort={{
            field: sortField,
            direction: sortDirection,
            onFieldChange: handleSortFieldChange,
            onDirectionChange: handleSortDirectionChange,
            options: sortOptions,
          }}
          resultCount={filteredTools.length}
          onReset={handleReset}
        />

        {/* Curated top-5 strip, between the search bar and the main grid. */}
        <ThisWeeksAiPicksSection />

        {filteredTools.length > 0 ? (
          <>
            {/* Matches GenericToolSection: 5-up at xl (1216px container → 218px cards),
                4 at lg (960px container → 228px). */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredTools.slice(0, displayCount).map((tool, idx) => (
                <ToolCard key={tool.id} tool={tool} index={idx} tableKey="tools" />
              ))}
            </div>
            {filteredTools.length > displayCount && (
              <div className="flex flex-col items-center gap-3 mt-8">
                <p className="text-xs text-muted-foreground">
                  {t("showingResults").replace("{shown}", String(displayCount)).replace("{total}", String(filteredTools.length))}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDisplayCount((prev) => prev + 100)}
                  className="border-primary/30 text-primary hover:bg-primary/5"
                >
                  {t("loadMore")}
                </Button>
              </div>
            )}
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
      </div>
    </section>
  );
}
