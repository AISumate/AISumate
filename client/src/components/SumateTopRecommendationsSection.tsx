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
 * Curated highlight strip above the AI Influencers grid. Source content is
 * English-only (Teable's "English"/"Spanish" columns confirm this), so the
 * whole strip hides when the site's language toggle is set to Spanish rather
 * than show untranslated cards.
 *
 * Uses the shared ToolCard — a Description button opens the detail modal and a
 * Visit Channel button links out. It previously used a hover card, which is
 * unusable on touch devices.
 */
export function SumateTopRecommendationsSection() {
  const { t, language } = useLanguage();
  const { data, isLoading } = trpc.sumateTopRecommendations.list.useQuery(undefined);

  const items = (data?.tools ?? []) as TopRecommendation[];

  if (language === "es" || isLoading || items.length === 0) return null;

  // Ranked 1..N (unranked rows sink to the bottom).
  const sorted = [...items].sort((a, b) => (a.rank || Infinity) - (b.rank || Infinity));

  return (
    <section className="pt-10 pb-2">
      <div className="container">
        <SectionHeading
          title={t("sumateTopRecommendationsTitle")}
          subtitle={t("sumateTopRecommendationsSubtitle")}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {sorted.map((item, idx) => (
            <ToolCard
              key={item.id}
              index={idx}
              visitLabel={t("visitChannel")}
              tool={{ ...item, affiliateUrl: "" } as AiTool}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
