import { Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { SectionHeading } from "./toolVisuals";
import { ToolCard, type AiTool } from "./ToolCard";

/**
 * "This Week's AI Picks" — the curated top-5 strip that sits between the search
 * bar and the main tools grid on the front page. Backed by its own Teable table
 * so Duncan can swap the five picks each week without touching the catalogue.
 *
 * Uses the same ToolCard as every other grid (Description button + Visit
 * button), so it behaves identically on mobile — no hover required.
 * Renders nothing while loading or if the table is empty, rather than leaving a
 * heading over a blank strip.
 */
export function ThisWeeksAiPicksSection({ divider = true }: { divider?: boolean } = {}) {
  const { t } = useLanguage();
  const { data, isLoading } = trpc.thisWeeksAiPicks.list.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const picks = (data?.tools ?? []) as AiTool[];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  if (picks.length === 0) return null;

  return (
    // On the AI Tools tab this strip sits above the main grid and needs the
    // divider plus generous space to read as its own thing. On the home page
    // it's one row among several, so it takes the same pb-2 as its siblings —
    // otherwise the gap below it is nearly double every other gap.
    <section className={divider ? "mb-10" : "pb-2"}>
      <SectionHeading
        title={t("thisWeeksAiPicksTitle")}
        subtitle={t("thisWeeksAiPicksSubtitle")}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {picks.slice(0, 5).map((tool, idx) => (
          <ToolCard key={tool.id} tool={tool} index={idx} tableKey="thisWeeksAiPicks" />
        ))}
      </div>

      {/* Divider so the picks read as their own section, not the first row of
          the main grid below. */}
      {divider && <div className="mt-10 border-t border-border/70" />}
    </section>
  );
}
