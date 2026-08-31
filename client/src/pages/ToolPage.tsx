import { useEffect, useMemo } from "react";
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
import { ToolLanding } from "./ToolLanding";

/**
 * Shareable per-listing page: /tool/:table/:id
 *
 * Every listing the site shows in a modal is also reachable at a real URL, so
 * people can share/bookmark it and crawlers can index it (bots get a static
 * prerendered twin of this page — see scripts/prerender.ts + vercel.json).
 * Data comes from the same cached table list the tabs use, so opening a tool
 * page costs at most one table fetch.
 */

// Table param -> which tRPC list router serves it, and which response field
// holds the rows. Whitelist doubles as the 404 guard for junk table params.
const TABLE_SOURCES: Record<string, { router: string; field: "tools" | "models" | "repos" }> = {
  tools: { router: "tools", field: "tools" },
  llms: { router: "llms", field: "models" },
  github: { router: "github", field: "repos" },
  weeklyViralGithub: { router: "weeklyViralGithub", field: "repos" },
  videoImage: { router: "videoImage", field: "tools" },
  musicVoice: { router: "musicVoice", field: "tools" },
  chatbots: { router: "chatbots", field: "tools" },
  freeApis: { router: "freeApis", field: "tools" },
  freeLlmIde: { router: "freeLlmIde", field: "tools" },
  vibeCoding: { router: "vibeCoding", field: "tools" },
  designerTools: { router: "designerTools", field: "tools" },
  aiInfra: { router: "aiInfra", field: "tools" },
  hardware: { router: "hardware", field: "tools" },
  testingTools: { router: "testingTools", field: "tools" },
  aiSecurity: { router: "aiSecurity", field: "tools" },
  businessProductivity: { router: "businessProductivity", field: "tools" },
  mcpProviders: { router: "mcpProviders", field: "tools" },
  vpsCloud: { router: "vpsCloud", field: "tools" },
  aiMedia: { router: "aiMedia", field: "tools" },
  aiInfluencers: { router: "aiInfluencers", field: "tools" },
  aiSites: { router: "aiSites", field: "tools" },
  aiDiscord: { router: "aiDiscord", field: "tools" },
  auSeoTools: { router: "auSeoTools", field: "tools" },
  sumateTopRecommendations: { router: "sumateTopRecommendations", field: "tools" },
  thisWeeksAiPicks: { router: "thisWeeksAiPicks", field: "tools" },
};

// Which tables get the rich landing layout lives in shared/simpleTables.ts so
// the crawler twins in scripts/prerender.ts stay in step with this page.

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface AnyListing extends ReviewInfo {
  id: string;
  [k: string]: any;
}

function ToolPageInner({ table, id }: { table: string; id: string }) {
  const { t, language } = useLanguage();
  const source = TABLE_SOURCES[table];

  // `table` is constant for this component instance (remounted via key on the
  // route below), so this conditional hook is stable across renders.
  const query = source
    ? (trpc as any)[source.router].list.useQuery(undefined, { refetchOnWindowFocus: false })
    : null;

  const rows: AnyListing[] = useMemo(
    () => (source && query?.data ? ((query.data as any)[source.field] ?? []) : []),
    [source, query?.data],
  );
  const item: AnyListing | undefined = useMemo(
    () => rows.find((r: AnyListing) => r.id === id),
    [rows, id],
  );

  const name = item ? item.name || item.title || "" : "";
  useEffect(() => {
    if (name) document.title = `${name} — aisumate`;
    return () => {
      document.title = "aisumate — AI Productivity Tools Directory";
    };
  }, [name]);

  if (!source) return <NotFoundBlock />;
  if (query?.isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!item) return <NotFoundBlock />;

  if (isLandingTable(table)) {
    return <ToolLanding table={table} id={id} item={item} rows={rows} />;
  }

  const description =
    (language === "es"
      ? item.descriptionEs || item.summaryEs
      : item.descriptionEn || item.summaryEn) ||
    item.description ||
    "";
  const category = item.category || item.providerType || item.topic || item.platform || item.owner || "";
  const url = item.url || item.repoUrl || item.dealUrl || item.website || "";
  const visitUrl = item.isAffiliate && item.affiliateUrl ? item.affiliateUrl : url;

  return (
    <article className="mx-auto max-w-2xl">
      <div className="flex items-center gap-4">
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl ring-2 ring-border"
          style={{ backgroundColor: "color-mix(in oklch, var(--primary) 12%, var(--card))" }}
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
              <Badge variant="outline" className="border-primary/30 text-primary">
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
        <p className="mt-6 text-base leading-relaxed text-foreground">{description}</p>
      )}

      {item.isAffiliate && item.affiliateUrl && (
        <p className="mt-3 text-xs italic text-muted-foreground">{t("affiliateDisclosure")}</p>
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="container flex-1 py-7">
        <Link
          href="/"
          className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("backHome")}
        </Link>
        {/* key: remount when the target changes so the dynamic table hook stays stable */}
        <ToolPageInner key={`${params.table}/${params.id}`} table={params.table} id={params.id} />
      </main>
      <Footer />
    </div>
  );
}
