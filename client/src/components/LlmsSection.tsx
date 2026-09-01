import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { FilterBar, buildFilterOptions } from "./FilterBar";
import { SectionHeading } from "./toolVisuals";
import { ToolCard } from "./ToolCard";

export function LlmsSection() {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [providerFilter, setProviderFilter] = useState("all");
  const [aiFilter, setAiFilter] = useState("all");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Fetch the full (server-cached) list once; search/filter/sort client-side
  // so typing doesn't fire a request per keystroke.
  const { data, isLoading } = trpc.llms.list.useQuery(undefined);

  const models = data?.models ?? [];

  const providerOptions = useMemo(
    () => buildFilterOptions(models, (m) => m.providerType),
    [models],
  );

  const filteredModels = useMemo(() => {
    let result = models;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(term) ||
          m.summaryEn.toLowerCase().includes(term) ||
          m.summaryEs.toLowerCase().includes(term),
      );
    }
    if (providerFilter !== "all") {
      result = result.filter((m) => m.providerType === providerFilter);
    }
    if (aiFilter === "ai") {
      result = result.filter(
        (m) => m.aiRelevance === "AI-first" || m.aiRelevance === "AI-enabled",
      );
    } else if (aiFilter === "aiFirst") {
      result = result.filter((m) => m.aiRelevance === "AI-first");
    }
    const sorted = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortField === "name") {
        cmp = a.name.localeCompare(b.name);
      } else if (sortField === "providerType") {
        cmp = (a.providerType || "").localeCompare(b.providerType || "");
        if (cmp === 0) cmp = a.name.localeCompare(b.name);
      } else if (sortField === "rating") {
        cmp = (b.rating || 0) - (a.rating || 0);
        if (cmp === 0) cmp = a.name.localeCompare(b.name);
      }
      return sortDirection === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [models, searchTerm, providerFilter, aiFilter, sortField, sortDirection]);

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
                ? [{
                    key: "provider",
                    value: providerFilter,
                    onChange: setProviderFilter,
                    options: providerOptions,
                    placeholderKey: "filterByProvider",
                  }]
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
                { value: "name", labelKey: "sortByName", defaultDirection: "asc" },
                { value: "providerType", labelKey: "sortByProvider", defaultDirection: "asc" },
                { value: "rating", labelKey: "sortByRating", defaultDirection: "desc" },
              ],
            }}
            resultCount={filteredModels.length}
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
        ) : filteredModels.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filteredModels.map((model, idx) => (
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
          <p className="text-center py-12 text-muted-foreground">{t("noResults")}</p>
        )}
      </div>
    </section>
  );
}
