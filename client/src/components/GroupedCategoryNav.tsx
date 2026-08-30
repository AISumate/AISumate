import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { TranslationKey } from "@/lib/i18n";

interface GroupedCategoryNavProps {
  activeTab: string;
  onChange: (tabValue: string) => void;
}

/**
 * Category nav as a single-row carousel — one pill per real Teable-backed tab,
 * in the same order as the original SectionTabs list. Prev/next arrows page
 * through it, and a play/pause button auto-scrolls it slowly. A single row (on
 * every breakpoint) keeps it from eating half the screen on mobile and from
 * wrapping into three rows on desktop.
 */
const CATEGORY_TABS: { tabValue: string; labelKey: TranslationKey }[] = [
  { tabValue: "tools", labelKey: "tabTools" },
  { tabValue: "aiMedia", labelKey: "iconAiMedia" },
  { tabValue: "github", labelKey: "tabGithub" },
  { tabValue: "llms", labelKey: "tabLlms" },
  { tabValue: "videoImage", labelKey: "tabVideoImage" },
  { tabValue: "musicVoice", labelKey: "tabMusicVoice" },
  { tabValue: "chatbots", labelKey: "tabChatbots" },
  { tabValue: "freeApis", labelKey: "tabFreeApis" },
  { tabValue: "freeLlmIde", labelKey: "tabFreeLlmIde" },
  { tabValue: "vibeCoding", labelKey: "tabVibeCoding" },
  { tabValue: "designerTools", labelKey: "tabDesignerTools" },
  { tabValue: "aiInfra", labelKey: "tabAiInfra" },
  { tabValue: "hardware", labelKey: "tabHardware" },
  { tabValue: "testingTools", labelKey: "tabTestingTools" },
  { tabValue: "aiSecurity", labelKey: "tabAiSecurity" },
  { tabValue: "businessProductivity", labelKey: "tabBusinessProductivity" },
  { tabValue: "mcpProviders", labelKey: "tabMcpProviders" },
  { tabValue: "vpsCloud", labelKey: "tabVpsCloud" },
  { tabValue: "aiInfluencers", labelKey: "iconAiInfluencers" },
  { tabValue: "aiSites", labelKey: "iconAiSites" },
  { tabValue: "aiDiscord", labelKey: "iconAiDiscord" },
  { tabValue: "auSeoTools", labelKey: "tabAuSeoTools" },
];

const AUTO_SCROLL_PX_PER_SEC = 32; // deliberately slow + readable

export function GroupedCategoryNav({ activeTab, onChange }: GroupedCategoryNavProps) {
  const { t } = useLanguage();
  const trackRef = useRef<HTMLDivElement>(null);
  const hoverRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  // Keep the arrows' enabled/disabled state honest as the track scrolls.
  const syncEdges = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 1);
    setAtEnd(el.scrollLeft >= el.scrollWidth - el.clientWidth - 1);
  }, []);

  useEffect(() => {
    syncEdges();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", syncEdges, { passive: true });
    window.addEventListener("resize", syncEdges);
    return () => {
      el.removeEventListener("scroll", syncEdges);
      window.removeEventListener("resize", syncEdges);
    };
  }, [syncEdges]);

  // Page the track by ~80% of its visible width per arrow click.
  const page = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  // Auto-scroll: rAF loop, paused while the pointer is over the track so it's
  // never fighting the user. Loops back to the start on reaching the end.
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last: number | null = null;
    const tick = (ts: number) => {
      const el = trackRef.current;
      if (el && last != null && !hoverRef.current) {
        el.scrollLeft += (AUTO_SCROLL_PX_PER_SEC * (ts - last)) / 1000;
        if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 1) el.scrollLeft = 0;
      }
      last = ts;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  // Bring the active pill into view when the tab changes elsewhere (search,
  // hash link, etc.) so the current section is always visible in the strip.
  useEffect(() => {
    const el = trackRef.current?.querySelector<HTMLElement>(`[data-tab="${activeTab}"]`);
    el?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [activeTab]);

  const arrowBtn =
    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-primary hover:border-primary/50 disabled:opacity-30 disabled:hover:text-muted-foreground disabled:hover:border-border";

  return (
    // top-20 must track the header's h-20, or this bar overlaps it or floats below it.
    <div className="sticky top-20 z-30 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="container flex items-center gap-2 py-2.5">
        <button type="button" onClick={() => page(-1)} disabled={atStart} className={arrowBtn} aria-label={t("navScrollPrev")}>
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div
          ref={trackRef}
          onMouseEnter={() => (hoverRef.current = true)}
          onMouseLeave={() => (hoverRef.current = false)}
          className="no-scrollbar flex flex-1 flex-nowrap gap-1.5 overflow-x-auto scroll-smooth"
        >
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.tabValue}
              data-tab={tab.tabValue}
              onClick={() => onChange(tab.tabValue)}
              className={`shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold transition-all cursor-pointer ${
                activeTab === tab.tabValue
                  ? "bg-primary text-primary-foreground shadow-[0_2px_10px_color-mix(in_srgb,var(--primary)_35%,transparent)]"
                  : "border border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
              }`}
            >
              {t(tab.labelKey)}
            </button>
          ))}
        </div>

        <button type="button" onClick={() => page(1)} disabled={atEnd} className={arrowBtn} aria-label={t("navScrollNext")}>
          <ChevronRight className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          className={`${arrowBtn} ${playing ? "text-primary border-primary/50" : ""}`}
          aria-label={playing ? t("navScrollPause") : t("navScrollPlay")}
          aria-pressed={playing}
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
