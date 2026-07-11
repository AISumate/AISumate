import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Tag } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { FilterBar, buildFilterOptions } from "./FilterBar";
import { accentClassFor, ReviewDetails, reviewHoverCardClass, SectionHeading, StarRating, ToolIcon, VisitButton } from "./toolVisuals";

export function LtdsSection() {
  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Fetch the full (server-cached) list once; search/filter/sort client-side
  // so typing doesn't fire a request per keystroke.
  const { data, isLoading } = trpc.ltds.list.useQuery(undefined);

  const deals = data?.deals ?? [];

  const platformOptions = useMemo(
    () => buildFilterOptions(deals, (d) => d.platform),
    [deals],
  );
  const statusOptions = useMemo(
    () => buildFilterOptions(deals, (d) => d.status),
    [deals],
  );

  const filteredDeals = useMemo(() => {
    let result = deals;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(term) ||
          d.summaryEn.toLowerCase().includes(term) ||
          d.summaryEs.toLowerCase().includes(term),
      );
    }
    if (platformFilter !== "all") {
      result = result.filter((d) => d.platform === platformFilter);
    }
    if (statusFilter !== "all") {
      result = result.filter((d) => d.status === statusFilter);
    }
    const sorted = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortField === "name") {
        cmp = a.name.localeCompare(b.name);
      } else if (sortField === "platform") {
        cmp = (a.platform || "").localeCompare(b.platform || "");
        if (cmp === 0) cmp = a.name.localeCompare(b.name);
      } else if (sortField === "status") {
        cmp = (a.status || "").localeCompare(b.status || "");
        if (cmp === 0) cmp = a.name.localeCompare(b.name);
      } else if (sortField === "rating") {
        cmp = (b.rating || 0) - (a.rating || 0);
        if (cmp === 0) cmp = a.name.localeCompare(b.name);
      }
      return sortDirection === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [deals, searchTerm, platformFilter, statusFilter, sortField, sortDirection]);

  const handleReset = () => {
    setSearchTerm("");
    setPlatformFilter("all");
    setStatusFilter("all");
    setSortField("name");
    setSortDirection("asc");
  };

  return (
    <section className="py-12">
      <div className="container">
        <SectionHeading title={t("ltdTitle")} subtitle={t("ltdSubtitle")} />

        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filters={[
            ...(platformOptions.length > 0
              ? [{
                  key: "platform",
                  value: platformFilter,
                  onChange: setPlatformFilter,
                  options: platformOptions,
                  placeholderKey: "filterByPlatform",
                }]
              : []),
            ...(statusOptions.length > 0
              ? [{
                  key: "status",
                  value: statusFilter,
                  onChange: setStatusFilter,
                  options: statusOptions,
                  placeholderKey: "filterByStatus",
                }]
              : []),
          ]}
          sort={{
            field: sortField,
            direction: sortDirection,
            onFieldChange: setSortField,
            onDirectionChange: setSortDirection,
            options: [
              { value: "name", labelKey: "sortByName", defaultDirection: "asc" },
              { value: "platform", labelKey: "sortByPlatform", defaultDirection: "asc" },
              { value: "status", labelKey: "sortByStatus", defaultDirection: "asc" },
              { value: "rating", labelKey: "sortByRating", defaultDirection: "desc" },
            ],
          }}
          resultCount={filteredDeals.length}
          onReset={handleReset}
        />

        {/* Deals grid */}
        {isLoading ? (
          <p className="text-sm text-muted-foreground">{t("loading")}</p>
        ) : filteredDeals.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {filteredDeals.map((deal, idx) => {
              const summary = language === "es" ? deal.summaryEs : deal.summaryEn;
              const visitUrl = deal.dealUrl || deal.website;
              return (
                <HoverCard key={deal.id} openDelay={200} closeDelay={150}>
                  <HoverCardTrigger asChild>
                    <div
                      className={`group relative flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card p-6 text-center transition-all duration-200 hover:shadow-2xl hover:-translate-y-1.5 hover:border-[var(--tool-accent)] cursor-pointer min-h-[160px] overflow-hidden ${accentClassFor(idx)}`}
                    >
                      {/* Colored top bar that appears on hover */}
                      <div
                        className="absolute top-0 left-0 right-0 h-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300"
                        style={{ backgroundColor: "var(--tool-accent)" }}
                      />

                      {/* Subtle accent glow on hover */}
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                        style={{
                          background: "radial-gradient(circle at 50% 0%, color-mix(in oklch, var(--tool-accent) 8%, transparent), transparent 70%)",
                        }}
                      />

                      {/* Icon with colored ring */}
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-xl overflow-hidden shrink-0 ring-2 ring-border group-hover:ring-[var(--tool-accent)] transition-all duration-200"
                        style={{
                          backgroundColor: "color-mix(in oklch, var(--tool-accent) 12%, var(--card))",
                        }}
                      >
                        <ToolIcon
                          iconUrl={deal.iconUrl}
                          siteUrl={deal.website}
                          alt={deal.name}
                          className="h-full w-full object-contain"
                          fallback={<Tag className="h-6 w-6" style={{ color: "var(--tool-accent)" }} />}
                        />
                      </div>

                      {/* Deal name */}
                      <h3 className="text-sm font-semibold leading-tight text-card-foreground line-clamp-2">
                        {deal.name}
                      </h3>

                      {/* Platform badge with accent color */}
                      {deal.platform && (
                        <Badge
                          variant="secondary"
                          className="text-xs font-normal"
                          style={{
                            backgroundColor: "color-mix(in oklch, var(--tool-accent) 15%, transparent)",
                            color: "var(--tool-accent)",
                          }}
                        >
                          {deal.platform}
                        </Badge>
                      )}

                      {/* New badge pinned to the corner so it never crowds the title */}
                      {deal.isNew && (
                        <Badge className="absolute bottom-2 right-2 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 leading-none">New</Badge>
                      )}
                    </div>
                  </HoverCardTrigger>

                  {/* Accent class repeated: portal content doesn't inherit --tool-accent from the card */}
                  <HoverCardContent className={`${reviewHoverCardClass(deal)} ${accentClassFor(idx)}`} align="center" sideOffset={8}>
                    <div className="space-y-3">
                      {/* Header with icon + name */}
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-lg overflow-hidden shrink-0"
                          style={{
                            backgroundColor: "color-mix(in oklch, var(--tool-accent) 12%, var(--popover))",
                          }}
                        >
                          <ToolIcon
                            iconUrl={deal.iconUrl}
                            siteUrl={deal.website}
                            alt={deal.name}
                            className="h-full w-full object-contain"
                            fallback={<Tag className="h-5 w-5" style={{ color: "var(--tool-accent)" }} />}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-semibold text-sm text-popover-foreground truncate">
                              {deal.name}
                            </h4>
                            {deal.isNew && (
                              <Badge className="shrink-0 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 leading-none">New</Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {deal.platform && (
                              <Badge
                                variant="outline"
                                className="text-xs"
                                style={{
                                  borderColor: "color-mix(in oklch, var(--tool-accent) 30%, transparent)",
                                  color: "var(--tool-accent)",
                                }}
                              >
                                {deal.platform}
                              </Badge>
                            )}
                            {deal.status && (
                              <Badge variant="outline" className="text-xs">{deal.status}</Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Rating stars */}
                      {deal.rating && deal.rating > 0 && (
                        <StarRating rating={deal.rating} accent="var(--tool-accent)" />
                      )}

                      {/* Description in the selected language */}
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          {t("description")}
                        </p>
                        <p className="text-sm text-popover-foreground leading-relaxed">
                          {summary || t("noDescription")}
                        </p>
                      </div>

                      {/* Verified review: pros / cons / cost / verdict in the active language */}
                      <ReviewDetails review={deal} />

                      {/* Visit button — the only link out, so affiliate URLs can't be bypassed */}
                      <VisitButton url={visitUrl} label={t("visitDeal")} />
                    </div>
                  </HoverCardContent>
                </HoverCard>
              );
            })}
          </div>
        ) : (
          <p className="text-center py-12 text-muted-foreground">{t("noDeals")}</p>
        )}
      </div>
    </section>
  );
}
