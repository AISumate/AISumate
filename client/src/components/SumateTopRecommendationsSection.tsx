import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { SectionHeading, type ReviewInfo } from "./toolVisuals";
import { ToolCard, type AiTool } from "./ToolCard";

interface TopRecommendation extends ReviewInfo {
  id: string;
  name: string;
  descriptionEn: string;
  descriptionEs: string;
  url: string;
  iconUrl: string;
  category: string;
  rating: number;
  rank: number;
}

/**
 * Curated highlight strip — the top of the AI Influencers tab, and the
 * influencers row on the home page (with `limit`).
 *
 * The source content is English-only. This used to hide the entire strip in
 * Spanish, which left Spanish visitors with nothing at all; it now shows the
 * English cards, matching how every other English-only record behaves.
 *
 * Uses the shared ToolCard — a Description button opens the detail modal and a
 * Visit Channel button links out. It previously used a hover card, which is
 * unusable on touch devices.
 */
export function SumateTopRecommendationsSection({ limit }: { limit?: number } = {}) {
  const { t } = useLanguage();
  const { data, isLoading } = trpc.sumateTopRecommendations.list.useQuery(undefined);

  const items = (data?.tools ?? []) as TopRecommendation[];

  if (isLoading || items.length === 0) return null;

  // Ranked 1..N (unranked rows sink to the bottom).
  const ranked = [...items].sort((a, b) => (a.rank || Infinity) - (b.rank || Infinity));
  const sorted = limit ? ranked.slice(0, limit) : ranked;

  return (
    <section className="pt-10 pb-2">
      <div>
        <SectionHeading
          title={t("sumateTopRecommendationsTitle")}
          subtitle={t("sumateTopRecommendationsSubtitle")}
        />

        {/* Compact tiles, matching the AI Influencers grid this strip sits above. */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {sorted.map((item, idx) => (
            <ToolCard
              key={item.id}
              index={idx}
              compact
              tableKey="sumateTopRecommendations"
              visitLabel={t("visitChannel")}
              tool={{ ...item, affiliateUrl: "" } as AiTool}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
