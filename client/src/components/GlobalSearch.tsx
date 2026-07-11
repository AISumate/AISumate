import { useState, useEffect, useMemo, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, X, Loader2, Bot } from "lucide-react";
import { accentClassFor, ConfidenceBadge, StarRating, ToolIcon, VisitButton } from "./toolVisuals";

interface SearchResult {
  id: string;
  name: string;
  descriptionEn: string;
  descriptionEs: string;
  url: string;
  affiliateUrl: string;
  iconUrl: string;
  category: string;
  isAffiliate: boolean;
  rating: number;
  isNew: boolean;
  reviewConfidence: string;
  sourceTable: string;
}

export function GlobalSearch() {
  const { t, language } = useLanguage();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [displayCount, setDisplayCount] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  // Reset display count when query changes
  useEffect(() => {
    setDisplayCount(50);
  }, [debouncedQuery]);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const enabled = debouncedQuery.length >= 2;

  const { data, isLoading, isFetching, isError } = trpc.search.global.useQuery(
    { query: debouncedQuery, limit: 200 },
    {
      enabled,
      refetchOnWindowFocus: false,
      staleTime: 60_000,
    },
  );

  const results = useMemo(() => data?.results ?? [], [data]);
  const totalFound = data?.total ?? 0;
  const displayedResults = useMemo(() => results.slice(0, displayCount), [results, displayCount]);

  const handleClear = () => {
    setQuery("");
    setDebouncedQuery("");
    setShowResults(false);
  };

  const hasQuery = query.trim().length >= 2;

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      {/* Search input */}
      <div className="relative">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none"
        />
        <Input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          placeholder={t("globalSearchPlaceholder")}
          className="pl-12 pr-10 h-12 text-base rounded-full border-border bg-background/80 backdrop-blur-sm shadow-lg"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {showResults && hasQuery && (
        <div className="absolute top-full mt-3 w-full rounded-2xl border border-border bg-popover shadow-2xl overflow-hidden z-50 max-h-[600px] overflow-y-auto">
          {/* Loading state */}
          {(isLoading || isFetching) && (
            <div className="flex items-center justify-center gap-2 py-8">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">{t("globalSearchLoading")}</span>
            </div>
          )}

          {/* Error state */}
          {!isLoading && !isFetching && isError && (
            <div className="text-center py-8">
              <p className="text-sm text-destructive">
                {language === "en" ? "Search failed. Please try again." : "La búsqueda falló. Por favor, inténtalo de nuevo."}
              </p>
            </div>
          )}

          {/* No results */}
          {!isLoading && !isFetching && !isError && results.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">{t("globalSearchNoResults")}</p>
            </div>
          )}

          {/* Results header */}
          {!isLoading && !isFetching && !isError && results.length > 0 && (
            <>
              <div className="px-4 py-3 border-b border-border bg-muted/30">
                <p className="text-sm font-medium text-foreground">
                  <span className="font-bold">{totalFound}</span>{" "}
                  <span className="text-muted-foreground">{t("globalSearchResults")}</span>
                </p>
              </div>

              {/* Results grid */}
              <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {displayedResults.map((tool, idx) => {
                    const description = language === "es" ? tool.descriptionEs : tool.descriptionEn;
                    const visitUrl = tool.isAffiliate && tool.affiliateUrl ? tool.affiliateUrl : tool.url;
                    const accentClass = accentClassFor(idx);
                    return (
                      <div
                        key={`${tool.sourceTable}-${tool.id}`}
                        className={`group flex items-start gap-3 rounded-xl border border-border bg-card p-3 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${accentClass}`}
                      >
                        {/* Icon */}
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-lg overflow-hidden shrink-0 ring-2 ring-border group-hover:ring-[var(--tool-accent)] transition-all"
                          style={{ backgroundColor: "color-mix(in oklch, var(--tool-accent) 12%, var(--card))" }}
                        >
                          <ToolIcon
                            iconUrl={tool.iconUrl}
                            siteUrl={tool.url}
                            alt={tool.name}
                            className="h-full w-full object-contain"
                            fallback={<Bot className="h-5 w-5" style={{ color: "var(--tool-accent)" }} />}
                          />
                        </div>

                        {/* Content */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-sm font-semibold text-card-foreground truncate">
                              {tool.name}
                            </h4>
                            {tool.isNew && (
                              <Badge className="shrink-0 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 leading-none">
                                New
                              </Badge>
                            )}
                          </div>

                          {/* Source table badge */}
                          <Badge
                            variant="outline"
                            className="text-[10px] mt-1 mb-1"
                            style={{
                              borderColor: "color-mix(in oklch, var(--tool-accent) 30%, transparent)",
                              color: "var(--tool-accent)",
                            }}
                          >
                            {tool.sourceTable}
                          </Badge>

                          {/* Rating + review confidence */}
                          {(tool.rating > 0 || tool.reviewConfidence) && (
                            <div className="mb-1 flex items-center gap-2 flex-wrap">
                              {tool.rating > 0 && (
                                <StarRating rating={tool.rating} accent="var(--tool-accent)" />
                              )}
                              <ConfidenceBadge level={tool.reviewConfidence} />
                            </div>
                          )}

                          {/* Description */}
                          {description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {description}
                            </p>
                          )}

                          {/* Visit button — the only link out, so affiliate URLs can't be bypassed */}
                          {visitUrl && (
                            <div className="mt-1.5">
                              <VisitButton url={visitUrl} label={t("visitToolGeneric")} compact />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Load more */}
                {results.length > displayCount && (
                  <div className="mt-4 text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDisplayCount((c) => c + 50)}
                    >
                      {t("loadMore")}
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
