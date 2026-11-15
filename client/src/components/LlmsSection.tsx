import { useState } from "react";
import { keepPreviousData } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { LIST_PAGE_SIZE_DEFAULT } from "@shared/listPage";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { FilterBar } from "./FilterBar";
import { LoadMoreButton } from "./LoadMoreButton";
import { SectionHeading } from "./toolVisuals";
import { ToolCard } from "./ToolCard";

export function LlmsSection() {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [providerFilter, setProviderFilter] = useState("all");
  const [aiFilter, setAiFilter] = useState("all");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const debouncedSearch = useDebouncedValue(searchTerm);

  const query = trpc.llms.list.useInfiniteQuery(
    {
      search: debouncedSearch.trim() || undefined,
      provider: providerFilter,
      ai: aiFilter as "all" | "ai" | "aiFirst",
      sort:
        sortField === "providerType"
          ? "provider"
          : (sortField as "name" | "rating"),
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

  const models = query.data?.pages.flatMap(page => page.models) ?? [];
  const total = query.data?.pages[0]?.total ?? 0;
  const isLoading = query.isLoading;
  const providerOptions = (query.data?.pages[0]?.providers ?? []).map(
    provider => ({ value: provider, label: provider })
  );

  const handleReset = () => {
    setSearchTerm("");
    setProviderFilter("all");
    setAiFilter("all");
    setSortField("name");
    setSortDirection("asc");
  };

  return (
    <section className="py-12">
      <div>
        <SectionHeading title={t("llmTitle")} subtitle={t("llmSubtitle")} />

        {/* Hide the filter bar until data loads so it doesn't flash "0 results". */}
        {!isLoading && (
          <FilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filters={[
              ...(providerOptions.length > 0
                ? [
                    {
                      key: "provider",
                      value: providerFilter,
                      onChange: setProviderFilter,
                      options: providerOptions,
                      placeholderKey: "filterByProvider",
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
              options: [
                {
                  value: "name",
                  labelKey: "sortByName",
                  defaultDirection: "asc",
                },
                {
                  value: "providerType",
                  labelKey: "sortByProvider",
                  defaultDirection: "asc",
                },
                {
                  value: "rating",
                  labelKey: "sortByRating",
                  defaultDirection: "desc",
                },
              ],
            }}
            resultCount={total}
            onReset={handleReset}
          />
        )}

        {/* Models grid — same ToolCard as Video & Image etc.: a Description
            button opens the detail modal and a centered Visit button links out
            (no hover popup). LLM fields are mapped onto the shared tool shape. */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : models.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {models.map((model, idx) => (
              <ToolCard
                key={model.id}
                index={idx}
                tableKey="llms"
                visitLabel={t("visitModel")}
                tool={{
                  ...model,
                  descriptionEn: model.summaryEn ?? "",
                  descriptionEs: model.summaryEs ?? "",
                  category: model.providerType ?? "",
                  url: model.url ?? "",
                  affiliateUrl: model.affiliateUrl ?? "",
                  iconUrl: model.iconUrl ?? "",
                }}
              />
            ))}
          </div>
        ) : (
          <p className="text-center py-12 text-muted-foreground">
            {t("noResults")}
          </p>
        )}
        {!isLoading && (
          <LoadMoreButton
            shown={models.length}
            total={total}
            hasMore={Boolean(query.hasNextPage)}
            pending={query.isFetchingNextPage}
            onClick={() => {
              void query.fetchNextPage();
            }}
          />
        )}
      </div>
    </section>
  );
}
