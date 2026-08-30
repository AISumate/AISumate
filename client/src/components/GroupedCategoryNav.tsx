import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { TranslationKey } from "@/lib/i18n";

interface GroupedCategoryNavProps {
  activeTab: string;
  onChange: (tabValue: string) => void;
}

/**
 * Category nav as a single-row, infinitely-rotating carousel — one pill per
 * real Teable-backed tab, in the same order as the original SectionTabs list.
 * The pill list is rendered twice so auto-scroll can loop seamlessly (when it
 * passes the width of one copy we subtract that width, landing on the identical
 * position with no visible jump). Prev/next arrows page through it and a
 * play/pause button toggles the slow auto-scroll (on by default).
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

const AUTO_SCROLL_PX_PER_SEC = 30; // deliberately slow + readable
const TAB_COUNT = CATEGORY_TABS.length;

/** Width of ONE copy of the list = distance from the 1st pill to the 1st pill
 *  of the duplicated copy. Falls back to half the scroll width pre-layout. */
function copyWidth(el: HTMLDivElement): number {
  const first = el.children[0] as HTMLElement | undefined;
  const boundary = el.children[TAB_COUNT] as HTMLElement | undefined;
  if (first && boundary) return boundary.offsetLeft - first.offsetLeft;
  return el.scrollWidth / 2;
}

export function GroupedCategoryNav({ activeTab, onChange }: GroupedCategoryNavProps) {
  const { t } = useLanguage();
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false); // true while the pointer is over the strip
  const carryRef = useRef(0); // sub-pixel accumulator so slow speeds stay smooth
  // Auto-scroll is on by default, except for reduced-motion visitors.
  const [playing, setPlaying] = useState(
    () =>
      typeof window === "undefined" ||
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  // Auto-scroll loop. No CSS scroll-behavior on the track (it would fight these
  // per-frame writes and cause stutter); we move by whole pixels with a
  // fractional carry, and wrap by subtracting one copy's width for a seamless
  // rotation back to the start.
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last: number | null = null;
    const tick = (ts: number) => {
      const el = trackRef.current;
      if (el && last != null && !pausedRef.current) {
        carryRef.current += (AUTO_SCROLL_PX_PER_SEC * (ts - last)) / 1000;
        const step = Math.floor(carryRef.current);
        if (step >= 1) {
          carryRef.current -= step;
          const w = copyWidth(el);
          let next = el.scrollLeft + step;
          if (w > 0 && next >= w) next -= w; // seamless loop
          el.scrollLeft = next;
        }
      }
      last = ts;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  // Bring the active pill into view when the tab changes from elsewhere (search,
  // hash link) — only while paused, so it doesn't fight the auto-scroll.
  useEffect(() => {
    if (playing) return;
    const el = trackRef.current?.querySelector<HTMLElement>(`[data-tab="${activeTab}"]`);
    el?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [activeTab, playing]);

  // Arrow paging: instant, copy-width-wrapped jump so it works identically
  // whether or not auto-scroll is running (a smooth scroll would be overridden
  // by the rAF writes).
  const page = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const w = copyWidth(el);
    let next = el.scrollLeft + dir * el.clientWidth * 0.8;
    if (w > 0) next = ((next % w) + w) % w;
    el.scrollLeft = next;
  };

  const pause = () => (pausedRef.current = true);
  const resume = () => (pausedRef.current = false);

  const arrowBtn =
    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-primary hover:border-primary/50";

  return (
    // top-20 must track the header's h-20, or this bar overlaps it or floats below it.
    <div className="sticky top-20 z-30 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="container flex items-center gap-2 py-2.5">
        <button type="button" onClick={() => page(-1)} className={arrowBtn} aria-label={t("navScrollPrev")}>
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div
          ref={trackRef}
          onMouseEnter={pause}
          onMouseLeave={resume}
          onTouchStart={pause}
          onTouchEnd={resume}
          className="no-scrollbar flex flex-1 flex-nowrap gap-1.5 overflow-x-auto"
        >
          {/* List rendered twice for the seamless loop. The second copy is
              decorative (hidden from assistive tech, not focusable) but still
              clickable so a tap on it selects the tab too. */}
          {CATEGORY_TABS.concat(CATEGORY_TABS).map((tab, i) => {
            const isClone = i >= TAB_COUNT;
            return (
              <button
                key={`${tab.tabValue}-${i}`}
                data-tab={isClone ? undefined : tab.tabValue}
                aria-hidden={isClone || undefined}
                tabIndex={isClone ? -1 : undefined}
                onClick={() => onChange(tab.tabValue)}
                className={`shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === tab.tabValue
                    ? "bg-primary text-primary-foreground shadow-[0_2px_10px_color-mix(in_srgb,var(--primary)_35%,transparent)]"
                    : "border border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
                }`}
              >
                {t(tab.labelKey)}
              </button>
            );
          })}
        </div>

        <button type="button" onClick={() => page(1)} className={arrowBtn} aria-label={t("navScrollNext")}>
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
