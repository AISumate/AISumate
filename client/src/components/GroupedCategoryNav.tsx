import { useLanguage } from "@/contexts/LanguageContext";
import type { TranslationKey } from "@/lib/i18n";

interface GroupedCategoryNavProps {
  activeTab: string;
  onChange: (tabValue: string) => void;
}

/**
 * Sticky single-row category nav — one pill per real Teable-backed tab, in the
 * same order as the original SectionTabs list, horizontally scrollable.
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

export function GroupedCategoryNav({ activeTab, onChange }: GroupedCategoryNavProps) {
  const { t } = useLanguage();

  return (
    <div className="sticky top-16 z-30 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="container py-2.5">
        {/* All 22 pills visible at once, wrapped into ~3 centered rows — no horizontal scroll */}
        <div className="flex flex-wrap justify-center gap-1.5">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.tabValue}
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
      </div>
    </div>
  );
}
