import { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { ExternalLink, Loader2, ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { FilterBar, buildFilterOptions } from "./FilterBar";
import { accentClassFor, ReviewDetails, reviewHoverCardClass, SectionHeading, StarRating, ToolIcon, VisitButton, type ReviewInfo } from "./toolVisuals";

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
}

type SectionTabKey = "videoImage" | "musicVoice" | "chatbots" | "freeApis" | "freeLlmIde" | "vibeCoding" | "designerTools" | "aiInfra" | "hardware" | "testingTools" | "aiSecurity" | "businessProductivity" | "mcpProviders" | "vpsCloud" | "aiMedia" | "aiInfluencers" | "aiSites" | "aiDiscord";
type TranslationKey = Parameters<ReturnType<typeof useLanguage>["t"]>[0];

interface GenericToolSectionProps {
  queryKey: SectionTabKey;
  titleKey: TranslationKey;
  subtitleKey: TranslationKey;
}

export function GenericToolSection({ queryKey, titleKey, subtitleKey }: GenericToolSectionProps) {
  const { t, language } = useLanguage();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
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
  }, [tools, search, categoryFilter, sortField, sortDirection]);

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
    setDisplayCount(100);
  };

  return (
    <div className="py-6">
      <SectionHeading title={t(titleKey)} subtitle={t(subtitleKey)} />

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
            { value: "category", labelKey: "filterByCategory", defaultDirection: "asc" },
            { value: "rating", labelKey: "sortByRating", defaultDirection: "desc" },
          ],
        }}
        resultCount={filteredTools.length}
        onReset={handleReset}
      />

      {/* Loading state */}
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

      {/* Empty state */}
      {!isLoading && !isError && filteredTools.length === 0 && (
        <div className="text-center py-20">
          <p className="text-lg text-muted-foreground">{t("noResultsGeneric")}</p>
        </div>
      )}

      {/* Tools grid */}
      {!isLoading && !isError && filteredTools.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {displayedTools.map((tool, idx) => {
              const description = language === "es" ? tool.descriptionEs : tool.descriptionEn;
              const visitUrl = tool.isAffiliate && tool.affiliateUrl ? tool.affiliateUrl : tool.url;
              return (
              <HoverCard key={tool.id} openDelay={300} closeDelay={200}>
                <HoverCardTrigger asChild>
                  <div className={`group relative flex flex-col items-center justify-center rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:shadow-xl hover:-translate-y-1 cursor-pointer min-h-[120px] overflow-hidden ${accentClassFor(idx)}`}>
                    {/* Icon */}
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl overflow-hidden ring-2 ring-border group-hover:ring-[var(--tool-accent)] transition-all duration-200" style={{ backgroundColor: "color-mix(in oklch, var(--tool-accent) 12%, var(--card))" }}>
                      <ToolIcon
                        iconUrl={tool.iconUrl}
                        siteUrl={tool.url}
                        alt={tool.name}
                        className="h-full w-full object-contain"
                        fallback={<ImageIcon className="h-6 w-6" style={{ color: "var(--tool-accent)" }} />}
                      />
                    </div>
                    {/* Name */}
                    <p className="text-sm font-medium text-center text-foreground line-clamp-2">
                      {tool.name}
                    </p>

                    {/* New badge pinned to the corner so it never crowds the title */}
                    {tool.isNew && (
                      <Badge className="absolute bottom-2 right-2 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 leading-none">New</Badge>
                    )}
                  </div>
                </HoverCardTrigger>
                {/* Accent class repeated: portal content doesn't inherit --tool-accent from the card */}
                <HoverCardContent className={`${reviewHoverCardClass(tool, "p-4")} ${accentClassFor(idx)}`} side="top" align="center">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <ToolIcon
                        iconUrl={tool.iconUrl}
                        siteUrl={tool.url}
                        alt={tool.name}
                        className="h-8 w-8 rounded object-contain"
                        fallback={null}
                      />
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-semibold text-foreground">{tool.name}</h4>
                        {tool.isNew && (
                          <Badge className="shrink-0 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 leading-none">New</Badge>
                        )}
                      </div>
                    </div>
                    {/* Rating stars */}
                    {tool.rating && tool.rating > 0 && (
                      <StarRating rating={tool.rating} accent="var(--tool-accent)" />
                    )}
                    {description && (
                      <div>
                        <p className="text-sm text-muted-foreground line-clamp-4">
                          {description}
                        </p>
                        {tool.isAffiliate && tool.affiliateUrl && (
                          <p className="text-xs text-muted-foreground italic mt-2">
                            {t("affiliateDisclosure")}
                          </p>
                        )}
                      </div>
                    )}
                    {tool.category && (
                      <span className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ backgroundColor: "color-mix(in oklch, var(--tool-accent) 15%, transparent)", color: "var(--tool-accent)" }}>
                        {tool.category}
                      </span>
                    )}
                    {/* Verified review: pros / cons / cost / verdict in the active language */}
                    <ReviewDetails review={tool} />
                    {/* Visit button — the only link out, so affiliate URLs can't be bypassed */}
                    <VisitButton url={visitUrl} label={t("visitToolGeneric")} />
                  </div>
                </HoverCardContent>
              </HoverCard>
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
    </div>
  );
}
