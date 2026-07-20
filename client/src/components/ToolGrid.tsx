import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ToolCard } from "./ToolCard";
import type { AiTool } from "./ToolCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { FilterBar } from "./FilterBar";

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
  }, [tools, searchTerm, activeCategory, sortField, sortDirection]);

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
    setSortField("name");
    setSortDirection("asc");
    setDisplayCount(100);
  };

  return (
    <section className="py-12 grid-pattern-bg">
      {/* max-w-5xl: keep the tools area in a centered middle column like the mockup */}
      <div className="container max-w-5xl">
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

        {filteredTools.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTools.slice(0, displayCount).map((tool, idx) => (
                <ToolCard key={tool.id} tool={tool} index={idx} />
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
