import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, ArrowUpDown, ArrowUp, ArrowDown, Star } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";

export interface FilterOption {
  value: string;
  label: string;
}

export interface SortOption {
  value: string;
  labelKey: string;
  defaultDirection?: "asc" | "desc";
}

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filters: {
    key: string;
    value: string;
    onChange: (value: string) => void;
    options: FilterOption[];
    placeholderKey: string;
    /**
     * Label for the built-in "everything" entry. Filters must NOT put their own
     * `value: "all"` option in `options` — Radix matches the trigger text by
     * value, so two items sharing "all" render both labels run together
     * ("AllAll tools").
     */
    allLabel?: string;
  }[];
  sort?: {
    field: string;
    direction: "asc" | "desc";
    onFieldChange: (field: string) => void;
    onDirectionChange: (direction: "asc" | "desc") => void;
    options: SortOption[];
  };
  /** Placeholder i18n key for the search input. Defaults to the section
   *  filter wording; the home page passes its own, because that bar searches
   *  the whole catalogue rather than filtering one tab. */
  searchPlaceholderKey?: string;
  /** Omit to hide the count entirely — the home page has no result set until
   *  something is searched, and "0 results" over a full page reads as broken. */
  resultCount?: number;
  onReset?: () => void;
}

export function FilterBar({
  searchTerm,
  onSearchChange,
  filters,
  sort,
  resultCount,
  onReset,
  searchPlaceholderKey = "searchPlaceholder",
}: FilterBarProps) {
  const { t } = useLanguage();

  const hasActiveFilters = searchTerm.trim() || filters.some((f) => f.value !== "all");

  return (
    // Glass panel: the tabs' gridline background otherwise runs straight through
    // the search/sort controls and makes them hard to read.
    <div className="mb-6 space-y-4 rounded-2xl border border-border/70 bg-card/80 backdrop-blur-md p-4 shadow-sm">
      {/* Search + sort row */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        {/* Search bar */}
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder={t(searchPlaceholderKey as never)}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-10 h-11"
            aria-label={t(searchPlaceholderKey as never)}
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={t("clearSearch")}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Sort dropdown */}
        {sort && (
          <div className="flex items-center gap-2">
            <Select
              value={sort.field}
              onValueChange={sort.onFieldChange}
            >
              <SelectTrigger className="w-[180px] h-11" aria-label={t("sortBy")}>
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                {sort.options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {t(opt.labelKey as never)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort direction toggle */}
            <Button
              variant="outline"
              size="icon"
              className="h-11 w-11 shrink-0"
              onClick={() =>
                sort.onDirectionChange(sort.direction === "asc" ? "desc" : "asc")
              }
              aria-label={sort.direction === "asc" ? t("sortDescending") : t("sortAscending")}
            >
              {sort.direction === "asc" ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}

        {/* Ratings legend — far right, same row as sort */}
        <span
          className="ml-auto hidden sm:inline-flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap"
          title={t("ratingsLegendFull")}
        >
          <Star className="h-3 w-3 shrink-0" style={{ color: "var(--primary)" }} />
          {t("ratingsLegend")}
        </span>
      </div>

      {/* Filter dropdowns row */}
      {filters.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          {filters.map((filter) => (
            <Select
              key={filter.key}
              value={filter.value}
              onValueChange={filter.onChange}
            >
              <SelectTrigger className="w-[160px] h-10" aria-label={t(filter.placeholderKey as never)}>
                <SelectValue placeholder={t(filter.placeholderKey as never)} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{filter.allLabel ?? t("allOption")}</SelectItem>
                {filter.options.filter((opt) => opt.value !== "all").map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}

          {/* Reset button */}
          {hasActiveFilters && onReset && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5 mr-1" />
              {t("resetFilters")}
            </Button>
          )}
        </div>
      )}

      {/* Results count — singular/plural aware ("1 result" not "1 results") */}
      {resultCount !== undefined && (
        <p className="text-sm text-muted-foreground">
          {resultCount} {resultCount === 1 ? t("result") : t("results")}
        </p>
      )}
    </div>
  );
}

/**
 * Helper to extract unique values from an array of objects for filter options.
 * This is a plain function — wrap it in useMemo at the call site for memoization.
 */
export function buildFilterOptions<T>(
  items: T[],
  getter: (item: T) => string,
): FilterOption[] {
  const set = new Set<string>();
  items.forEach((item) => {
    const val = getter(item);
    if (val && val.trim()) set.add(val.trim());
  });
  return Array.from(set).sort((a, b) => a.localeCompare(b)).map((val) => ({ value: val, label: val }));
}
