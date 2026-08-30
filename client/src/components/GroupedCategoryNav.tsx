import { Check, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/LanguageContext";
import type { TranslationKey } from "@/lib/i18n";

interface GroupedCategoryNavProps {
  activeTab: string;
  onChange: (tabValue: string) => void;
}

interface NavTab {
  tabValue: string;
  labelKey: TranslationKey;
}

interface NavGroup {
  labelKey: TranslationKey;
  tabs: NavTab[];
}

/**
 * Two-level category nav: a single compact row of group buttons, each opening
 * a dropdown of its categories. Replaces the 22-pill carousel, which was hard
 * to use (auto-scroll moved targets mid-reach; 22 flat pills never fit a row).
 * Identical on desktop and mobile — Radix DropdownMenu is tap-native and
 * keyboard/ARIA-complete, so nothing here depends on hover or scrolling.
 *
 * "AI Tools" (the default tab / main catalogue) is a direct button; every
 * other tab lives in exactly one group. The group labels reuse the bilingual
 * group* i18n keys shipped with the original design.
 */
const DIRECT_TAB: NavTab = { tabValue: "tools", labelKey: "tabTools" };

const NAV_GROUPS: NavGroup[] = [
  {
    labelKey: "groupModels",
    tabs: [
      { tabValue: "llms", labelKey: "tabLlms" },
      { tabValue: "chatbots", labelKey: "tabChatbots" },
      { tabValue: "freeApis", labelKey: "tabFreeApis" },
    ],
  },
  {
    labelKey: "groupCreate",
    tabs: [
      { tabValue: "videoImage", labelKey: "tabVideoImage" },
      { tabValue: "musicVoice", labelKey: "tabMusicVoice" },
      { tabValue: "designerTools", labelKey: "tabDesignerTools" },
      { tabValue: "aiMedia", labelKey: "iconAiMedia" },
    ],
  },
  {
    labelKey: "groupWork",
    tabs: [
      { tabValue: "businessProductivity", labelKey: "tabBusinessProductivity" },
      { tabValue: "auSeoTools", labelKey: "tabAuSeoTools" },
    ],
  },
  {
    labelKey: "groupBuild",
    tabs: [
      { tabValue: "vibeCoding", labelKey: "tabVibeCoding" },
      { tabValue: "freeLlmIde", labelKey: "tabFreeLlmIde" },
      { tabValue: "github", labelKey: "tabGithub" },
      { tabValue: "mcpProviders", labelKey: "tabMcpProviders" },
      { tabValue: "testingTools", labelKey: "tabTestingTools" },
    ],
  },
  {
    labelKey: "groupRun",
    tabs: [
      { tabValue: "aiInfra", labelKey: "tabAiInfra" },
      { tabValue: "vpsCloud", labelKey: "tabVpsCloud" },
      { tabValue: "hardware", labelKey: "tabHardware" },
      { tabValue: "aiSecurity", labelKey: "tabAiSecurity" },
    ],
  },
  {
    labelKey: "groupDiscover",
    tabs: [
      { tabValue: "aiInfluencers", labelKey: "iconAiInfluencers" },
      { tabValue: "aiSites", labelKey: "iconAiSites" },
      { tabValue: "aiDiscord", labelKey: "iconAiDiscord" },
    ],
  },
];

// Smaller pills below `sm` so all 7 level-1 buttons fit two rows on a phone.
// The group ORDER is also part of that: lighter labels are interleaved so the
// greedy flex-wrap packs 4 + 3 buttons into two 343px rows at 375px wide.
const pillBase =
  "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-1 text-xs sm:px-3.5 sm:py-1.5 sm:text-sm font-semibold transition-all cursor-pointer";
const pillActive =
  "bg-primary text-primary-foreground shadow-[0_2px_10px_color-mix(in_srgb,var(--primary)_35%,transparent)]";
const pillInactive =
  "border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 data-[state=open]:text-foreground data-[state=open]:border-primary/50";

export function GroupedCategoryNav({ activeTab, onChange }: GroupedCategoryNavProps) {
  const { t } = useLanguage();

  return (
    // top-20 must track the header's h-20, or this bar overlaps it or floats below it.
    <div className="sticky top-20 z-30 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="container flex flex-wrap items-center justify-center gap-1 py-2 sm:gap-1.5 sm:py-2.5">
        {/* Direct button for the main catalogue (also the default tab). */}
        <button
          type="button"
          onClick={() => onChange(DIRECT_TAB.tabValue)}
          className={`${pillBase} ${activeTab === DIRECT_TAB.tabValue ? pillActive : pillInactive}`}
        >
          {t(DIRECT_TAB.labelKey)}
        </button>

        {NAV_GROUPS.map((group) => {
          const containsActive = group.tabs.some((tab) => tab.tabValue === activeTab);
          return (
            <DropdownMenu key={group.labelKey}>
              <DropdownMenuTrigger
                className={`${pillBase} ${containsActive ? pillActive : pillInactive}`}
              >
                {t(group.labelKey)}
                <ChevronDown className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[200px]">
                {group.tabs.map((tab) => {
                  const isActive = tab.tabValue === activeTab;
                  return (
                    <DropdownMenuItem
                      key={tab.tabValue}
                      onSelect={() => onChange(tab.tabValue)}
                      className={
                        isActive ? "text-primary font-semibold data-[highlighted]:text-primary" : ""
                      }
                    >
                      <Check
                        className={`h-4 w-4 shrink-0 ${isActive ? "text-primary opacity-100" : "opacity-0"}`}
                      />
                      {t(tab.labelKey)}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        })}
      </div>
    </div>
  );
}
