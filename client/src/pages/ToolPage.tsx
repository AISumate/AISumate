import { useEffect } from "react";
import { Link, useParams } from "wouter";
import { ArrowLeft, Bot, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import {
  ReviewDetails,
  StarRating,
  ToolIcon,
  VisitButton,
  type ReviewInfo,
} from "@/components/toolVisuals";
import { isLandingTable } from "@shared/simpleTables";
import { lastTab } from "@/lib/lastTab";
import { ToolLanding } from "./ToolLanding";

/**
 * Shareable per-listing page: /tool/:table/:id
 *
 * Every listing the site shows in a modal is also reachable at a real URL, so
 * people can share/bookmark it and crawlers can index it (bots get a static
 * prerendered twin of this page — see scripts/prerender.ts + vercel.json).
 * Data comes from `listing.get` — one full row, plus up to three related cards.
 * The catalogue lists are paged and do not carry review text.
 */

// Whitelist doubles as the 404 guard for junk table params. The row itself
// comes from listing.get, not from paging through a list.
const LISTING_TABLES = new Set([
  "tools",
  "llms",
  "github",
  "weeklyViralGithub",
  "videoImage",
  "musicVoice",
  "chatbots",
  "freeApis",
  "freeLlmIde",
  "vibeCoding",
  "designerTools",
  "aiInfra",
  "hardware",
  "testingTools",
  "aiSecurity",
  "businessProductivity",
  "mcpProviders",
  "vpsCloud",
  "aiMedia",
  "aiInfluencers",
  "aiSites",
  "aiDiscord",
  "auSeoTools",
  "sumateTopRecommendations",
  "thisWeeksAiPicks",
]);

// Which tables get the rich landing layout lives in shared/simpleTables.ts so
// the crawler twins in scripts/prerender.ts stay in step with this page.

// Fallback for the back link when there's no remembered tab (a shared link, a
// bookmark). Some tables render as a strip INSIDE another tab rather than as
// their own, so this must name the host tab or SectionTabs shows nothing.
const HOME_TAB: Record<string, string> = {
  thisWeeksAiPicks: "tools",
  weeklyViralGithub: "github",
  sumateTopRecommendations: "aiInfluencers",
  ltds: "tools",
};

export interface AnyListing extends ReviewInfo {
  id: string;
  [k: string]: any;
}

function ToolPageInner({ table, id }: { table: string; id: string }) {
  const { t, language } = useLanguage();
  const source = LISTING_TABLES.has(table);

  const query = trpc.listing.get.useQuery(
    { table, id },
    { enabled: Boolean(source), refetchOnWindowFocus: false }
  );

  const item = (query.data?.item ?? undefined) as AnyListing | undefined;
  const related = (query.data?.related ?? []) as AnyListing[];

  const name = item ? item.name || item.title || "" : "";
  useEffect(() => {
    if (name) document.title = `${name} — aisumate`;
    return () => {
      document.title = "aisumate — AI Productivity Tools Directory";
    };
  }, [name]);

  if (!source) return <NotFoundBlock />;
  if (query.isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!item) return <NotFoundBlock />;

  if (isLandingTable(table)) {
    return <ToolLanding table={table} id={id} item={item} related={related} />;
  }

  const description =
    (language === "es"
      ? item.descriptionEs || item.summaryEs
      : item.descriptionEn || item.summaryEn) ||
    item.description ||
    "";
  const category =
    item.category ||
    item.providerType ||
    item.topic ||
    item.platform ||
    item.owner ||
    "";
  const url = item.url || item.repoUrl || item.dealUrl || item.website || "";
  const visitUrl =
    item.isAffiliate && item.affiliateUrl ? item.affiliateUrl : url;

  return (
    <article className="mx-auto max-w-2xl">
      <div className="flex items-center gap-4">
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl ring-2 ring-border"
          style={{
            backgroundColor:
              "color-mix(in oklch, var(--primary) 12%, var(--card))",
          }}
        >
          <ToolIcon
            iconUrl={item.iconUrl}
            siteUrl={url}
            alt={name}
            className="h-full w-full object-contain"
            fallback={<Bot className="h-7 w-7 text-primary" />}
          />
        </div>
        <div className="min-w-0">
          <h1
            className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {name}
          </h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            {category && (
              <Badge
                variant="outline"
                className="border-primary/30 text-primary"
              >
                {category}
              </Badge>
            )}
            {(item.rating ?? 0) > 0 && (
              <StarRating rating={item.rating} accent="var(--primary)" />
            )}
          </div>
        </div>
      </div>

      {description && (
        <p className="mt-6 text-base leading-relaxed text-foreground">
          {description}
        </p>
      )}

      {item.isAffiliate && item.affiliateUrl && (
        <p className="mt-3 text-xs italic text-muted-foreground">
          {t("affiliateDisclosure")}
        </p>
      )}

      <div className="mt-6">
        <ReviewDetails review={item} />
      </div>

      {visitUrl && (
        <div className="mt-8">
          <VisitButton url={visitUrl} label={t("visitToolGeneric")} />
        </div>
      )}
    </article>
  );
}

function NotFoundBlock() {
  const { t } = useLanguage();
  return (
    <div className="py-20 text-center">
      <p className="text-lg text-muted-foreground">{t("toolNotFound")}</p>
    </div>
  );
}

export default function ToolPage() {
  const params = useParams<{ table: string; id: string }>();
  const { t } = useLanguage();

  // Cards navigate here from anywhere in a long grid — without this the new
  // page opens at the old scroll position.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [params.table, params.id]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="container flex-1 py-7">
        <Link
          href={`/#${lastTab(HOME_TAB[params.table] ?? params.table)}`}
          className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("backHome")}
        </Link>
        {/* key: remount when the target changes so the dynamic table hook stays stable */}
        <ToolPageInner
          key={`${params.table}/${params.id}`}
          table={params.table}
          id={params.id}
        />
      </main>
      <Footer />
    </div>
  );
}
