import { useState } from "react";
import { keepPreviousData } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Star,
  ExternalLink,
  GitBranch,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Loader2,
} from "lucide-react";
import { LIST_PAGE_SIZE_DEFAULT } from "@shared/listPage";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { FilterBar } from "./FilterBar";
import { LoadMoreButton } from "./LoadMoreButton";
import { formatCompactNumber, SectionHeading } from "./toolVisuals";

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

export function GithubReposSection() {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>("stars");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const debouncedSearch = useDebouncedValue(searchTerm);

  const query = trpc.github.list.useInfiniteQuery(
    {
      search: debouncedSearch.trim() || undefined,
      status: statusFilter,
      sort: sortField,
      order: sortDirection,
      limit: LIST_PAGE_SIZE_DEFAULT,
    },
    {
      initialCursor: 1,
      getNextPageParam: last => last.nextCursor ?? undefined,
      placeholderData: keepPreviousData,
      refetchOnWindowFocus: false,
    }
  );

  const repos = query.data?.pages.flatMap(page => page.repos) ?? [];
  const total = query.data?.pages[0]?.total ?? 0;
  const isLoading = query.isLoading;
  const statusOptions = (query.data?.pages[0]?.statuses ?? []).map(status => ({
    value: status,
    label: status,
  }));

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === "asc" ? "desc" : "asc"));
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

  const sortButtonClass =
    "inline-flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer select-none";

  return (
    <section className="py-12">
      <div>
        <SectionHeading
          title={t("githubTitle")}
          subtitle={t("githubSubtitle")}
        />

        {/* Hide the filter bar until data loads so it doesn't flash "0 results". */}
        {!isLoading && (
          <FilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filters={[
              ...(statusOptions.length > 0
                ? [
                    {
                      key: "status",
                      value: statusFilter,
                      onChange: setStatusFilter,
                      options: statusOptions,
                      placeholderKey: "filterByStatus",
                    },
                  ]
                : []),
            ]}
            sort={{
              field: sortField,
              direction: sortDirection,
              onFieldChange: f => handleSort(f as SortField),
              onDirectionChange: d => setSortDirection(d as SortDirection),
              options: [
                {
                  value: "stars",
                  labelKey: "sortByStars",
                  defaultDirection: "desc",
                },
                {
                  value: "name",
                  labelKey: "sortByName",
                  defaultDirection: "asc",
                },
              ],
            }}
            resultCount={total}
            onReset={handleReset}
          />
        )}

        {/* Repos table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : repos.length > 0 ? (
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
                  <th className="text-center px-4 py-3 font-semibold text-foreground">
                    {""}
                  </th>
                </tr>
              </thead>
              <tbody>
                {repos.map((repo, idx) => (
                  <tr
                    key={repo.id}
                    className={`border-b border-border last:border-0 hover:bg-accent/5 transition-colors tool-accent-${idx % 6}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <GitBranch
                          className="h-4 w-4 shrink-0"
                          style={{ color: "var(--tool-accent)" }}
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {repo.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {repo.owner}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-muted-foreground line-clamp-2 max-w-md">
                        {repo.description}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1 text-foreground font-medium">
                        <Star
                          className="h-3.5 w-3.5 fill-current"
                          style={{ color: "var(--tool-accent)" }}
                        />
                        {formatCompactNumber(repo.stars)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {repo.repoUrl && (
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          style={{
                            borderColor:
                              "color-mix(in oklch, var(--tool-accent) 30%, transparent)",
                            color: "var(--tool-accent)",
                          }}
                        >
                          <a
                            href={repo.repoUrl}
                            target="_blank"
                            rel="nofollow noopener noreferrer"
                          >
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
          <p className="text-center py-12 text-muted-foreground">
            {t("noResults")}
          </p>
        )}

        <LoadMoreButton
          shown={repos.length}
          total={total}
          hasMore={Boolean(query.hasNextPage)}
          pending={query.isFetchingNextPage}
          onClick={() => {
            void query.fetchNextPage();
          }}
        />
      </div>
    </section>
  );
}
