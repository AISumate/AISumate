import { LIST_PAGE_SIZE_MAX } from "@shared/listPage";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { SectionHeading, type ReviewInfo } from "./toolVisuals";
import { ToolCard, type AiTool } from "./ToolCard";
import { LoadMoreButton } from "./LoadMoreButton";

interface TopRecommendation extends ReviewInfo {
  id: string;
  name: string;
  descriptionEn: string;
  descriptionEs: string;
  url: string;
  iconUrl: string;
  category: string;
  rating: number;
  hasReview?: boolean;
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
export function SumateTopRecommendationsSection({
  limit,
}: { limit?: number } = {}) {
  const { t } = useLanguage();
  const pageSize = limit
    ? Math.min(limit, LIST_PAGE_SIZE_MAX)
    : LIST_PAGE_SIZE_MAX;
  const query = trpc.sumateTopRecommendations.list.useInfiniteQuery(
    { sort: "rank", order: "asc", limit: pageSize },
    {
      initialCursor: 1,
      // A caller that asked for a fixed handful (the home row) stops after one page.
      getNextPageParam: last =>
        limit ? undefined : (last.nextCursor ?? undefined),
      refetchOnWindowFocus: false,
    }
  );

  const items: TopRecommendation[] =
    query.data?.pages.flatMap(page => page.tools) ?? [];

  if (query.isLoading || items.length === 0) return null;

  return (
    <section className="pt-10 pb-2">
      <div>
        <SectionHeading
          title={t("sumateTopRecommendationsTitle")}
          subtitle={t("sumateTopRecommendationsSubtitle")}
        />

        {/* Compact tiles, matching the AI Influencers grid this strip sits above. */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {items.map((item, idx) => (
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
        <LoadMoreButton
          shown={items.length}
          total={query.data?.pages[0]?.total ?? items.length}
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
