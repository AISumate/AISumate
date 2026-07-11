import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Star, ExternalLink, GitBranch, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { FilterBar, buildFilterOptions } from "./FilterBar";
import { SectionHeading } from "./toolVisuals";

export interface GithubRepo {
  id: string;
  name: string;
  repoUrl: string;
  description: string;
  owner: string;
  stars: number;
  status: string;
}

type SortField = "name" | "stars";
type SortDirection = "asc" | "desc";

function formatStars(stars: number): string {
  if (stars >= 1000) {
    return `${(stars / 1000).toFixed(1)}k`;
  }
  return String(stars);
}

export function GithubReposSection() {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>("stars");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [displayCount, setDisplayCount] = useState(100);

  // Fetch the full (server-cached) list once; search/filter/sort client-side
  // so typing doesn't fire a request per keystroke.
  const { data, isLoading } = trpc.github.list.useQuery(undefined);

  const repos = data?.repos ?? [];

  const statusOptions = useMemo(
    () => buildFilterOptions(repos, (r) => r.status),
    [repos],
  );

  // Apply filters + sorting
  const processedRepos = useMemo(() => {
    let result = repos;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(term) ||
          r.description.toLowerCase().includes(term) ||
          r.owner.toLowerCase().includes(term),
      );
    }
    if (statusFilter !== "all") {
      result = result.filter((r) => r.status === statusFilter);
    }

    const sorted = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortField === "stars") {
        cmp = a.stars - b.stars;
      } else if (sortField === "name") {
        cmp = a.name.localeCompare(b.name);
      }
      return sortDirection === "asc" ? cmp : -cmp;
    });

    return sorted;
  }, [repos, searchTerm, statusFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection(field === "stars" ? "desc" : "asc");
    }
  };

  const handleReset = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSortField("stars");
    setSortDirection("desc");
    setDisplayCount(100);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/50" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="h-3.5 w-3.5 text-foreground" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 text-foreground" />
    );
  };

  const sortButtonClass = "inline-flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer select-none";

  return (
    <section className="py-12">
      <div className="container">
        <SectionHeading title={t("githubTitle")} subtitle={t("githubSubtitle")} />

        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={(v: string) => { setSearchTerm(v); setDisplayCount(100); }}
          filters={[
            ...(statusOptions.length > 0
              ? [{
                  key: "status",
                  value: statusFilter,
                  onChange: (v: string) => { setStatusFilter(v); setDisplayCount(100); },
                  options: statusOptions,
                  placeholderKey: "filterByStatus",
                }]
              : []),
          ]}
          sort={{
            field: sortField,
            direction: sortDirection,
            onFieldChange: (f) => handleSort(f as SortField),
            onDirectionChange: (d) => setSortDirection(d as SortDirection),
            options: [
              { value: "stars", labelKey: "sortByStars", defaultDirection: "desc" },
              { value: "name", labelKey: "sortByName", defaultDirection: "asc" },
            ],
          }}
          resultCount={processedRepos.length}
          onReset={handleReset}
        />

        {/* Repos table */}
        {isLoading ? (
          <p className="text-sm text-muted-foreground">{t("loading")}</p>
        ) : processedRepos.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-foreground">
                    <button
                      className={sortButtonClass}
                      onClick={() => handleSort("name")}
                      aria-label={t("sortByName")}
                    >
                      {t("repoName")}
                      <SortIcon field="name" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground hidden md:table-cell">
                    {t("repoDescription")}
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-foreground">
                    <button
                      className={`${sortButtonClass} ml-auto`}
                      onClick={() => handleSort("stars")}
                      aria-label={t("sortByStars")}
                    >
                      {t("repoStars")}
                      <SortIcon field="stars" />
                    </button>
                  </th>
                  <th className="text-center px-4 py-3 font-semibold text-foreground">{""}</th>
                </tr>
              </thead>
              <tbody>
                {processedRepos.slice(0, displayCount).map((repo, idx) => (
                  <tr key={repo.id} className={`border-b border-border last:border-0 hover:bg-accent/5 transition-colors tool-accent-${idx % 6}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <GitBranch className="h-4 w-4 shrink-0" style={{ color: "var(--tool-accent)" }} />
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">{repo.name}</p>
                          <p className="text-xs text-muted-foreground">{repo.owner}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-muted-foreground line-clamp-2 max-w-md">{repo.description}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1 text-foreground font-medium">
                        <Star className="h-3.5 w-3.5 fill-current" style={{ color: "var(--tool-accent)" }} />
                        {formatStars(repo.stars)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {repo.repoUrl && (
                        <Button asChild size="sm" variant="outline" style={{ borderColor: "color-mix(in oklch, var(--tool-accent) 30%, transparent)", color: "var(--tool-accent)" }}>
                          <a href={repo.repoUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center py-12 text-muted-foreground">{t("noResults")}</p>
        )}

        {processedRepos.length > displayCount && (
          <div className="flex flex-col items-center gap-3 mt-6">
            <p className="text-xs text-muted-foreground">
              {t("showingResults").replace("{shown}", String(displayCount)).replace("{total}", String(processedRepos.length))}
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
      </div>
    </section>
  );
}
