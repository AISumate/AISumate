import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Newspaper, Calendar } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { FilterBar, buildFilterOptions } from "./FilterBar";
import { SectionHeading } from "./toolVisuals";

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}

export function NewsSection() {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [topicFilter, setTopicFilter] = useState("all");
  const [sortField, setSortField] = useState("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const { data, isLoading } = trpc.news.list.useQuery(
    searchTerm.trim() ? { search: searchTerm } : undefined,
  );

  const news = data?.news ?? [];

  const sourceOptions = useMemo(
    () => buildFilterOptions(news, (n) => n.source),
    [news],
  );
  const topicOptions = useMemo(
    () => buildFilterOptions(news, (n) => n.topic),
    [news],
  );

  const filteredNews = useMemo(() => {
    let result = news;
    if (sourceFilter !== "all") {
      result = result.filter((n) => n.source === sourceFilter);
    }
    if (topicFilter !== "all") {
      result = result.filter((n) => n.topic === topicFilter);
    }
    const sorted = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortField === "date") {
        const aDate = a.publishedDate ? new Date(a.publishedDate).getTime() : 0;
        const bDate = b.publishedDate ? new Date(b.publishedDate).getTime() : 0;
        cmp = aDate - bDate;
      } else if (sortField === "title") {
        cmp = a.title.localeCompare(b.title);
      } else if (sortField === "source") {
        cmp = (a.source || "").localeCompare(b.source || "");
      }
      return sortDirection === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [news, sourceFilter, topicFilter, sortField, sortDirection]);

  const handleReset = () => {
    setSearchTerm("");
    setSourceFilter("all");
    setTopicFilter("all");
    setSortField("date");
    setSortDirection("desc");
  };

  return (
    <section className="py-12">
      <div className="container">
        <SectionHeading title={t("newsTitle")} subtitle={t("newsSubtitle")} />

        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filters={[
            ...(sourceOptions.length > 0
              ? [{
                  key: "source",
                  value: sourceFilter,
                  onChange: setSourceFilter,
                  options: sourceOptions,
                  placeholderKey: "filterBySource",
                }]
              : []),
            ...(topicOptions.length > 0
              ? [{
                  key: "topic",
                  value: topicFilter,
                  onChange: setTopicFilter,
                  options: topicOptions,
                  placeholderKey: "filterByTopic",
                }]
              : []),
          ]}
          sort={{
            field: sortField,
            direction: sortDirection,
            onFieldChange: setSortField,
            onDirectionChange: setSortDirection,
            options: [
              { value: "date", labelKey: "sortByDate", defaultDirection: "desc" },
              { value: "title", labelKey: "sortByName", defaultDirection: "asc" },
              { value: "source", labelKey: "filterBySource", defaultDirection: "asc" },
            ],
          }}
          resultCount={filteredNews.length}
          onReset={handleReset}
        />

        {/* News list */}
        {isLoading ? (
          <p className="text-sm text-muted-foreground">{t("loading")}</p>
        ) : filteredNews.length > 0 ? (
          <div className="space-y-4">
            {filteredNews.map((item, idx) => (
              <div
                key={item.id}
                className={`flex flex-col sm:flex-row gap-4 rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:-translate-y-0.5 tool-accent-${idx % 6}`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg shrink-0" style={{ backgroundColor: "color-mix(in oklch, var(--tool-accent) 12%, var(--card))" }}>
                  <Newspaper className="h-5 w-5" style={{ color: "var(--tool-accent)" }} />
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <h3 className="font-semibold text-sm text-card-foreground">
                    {item.title}
                  </h3>
                  {item.summary && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{item.summary}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {item.publishedDate && (
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(item.publishedDate)}
                      </span>
                    )}
                    {item.source && <span>{t("newsSource")}: {item.source}</span>}
                    {item.topic && (
                      <Badge variant="outline" className="text-xs" style={{ borderColor: "color-mix(in oklch, var(--tool-accent) 30%, transparent)", color: "var(--tool-accent)" }}>
                        {item.topic}
                      </Badge>
                    )}
                  </div>
                </div>
                {item.url && (
                  <Button asChild size="sm" variant="outline" className="shrink-0 self-start sm:self-center" style={{ borderColor: "color-mix(in oklch, var(--tool-accent) 30%, transparent)", color: "var(--tool-accent)" }}>
                    <a href={item.url} target="_blank" rel="noopener noreferrer">
                      {t("readArticle")}
                      <ExternalLink className="ml-2 h-3.5 w-3.5" />
                    </a>
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-12 text-muted-foreground">{t("noNews")}</p>
        )}
      </div>
    </section>
  );
}
