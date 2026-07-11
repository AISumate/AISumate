import { useLanguage } from "@/contexts/LanguageContext";
import { Film, Users, Globe, MessageCircle } from "lucide-react";

interface IconLinkItem {
  labelKey: "iconAiMedia" | "iconAiInfluencers" | "iconAiSites" | "iconAiDiscord";
  icon: React.ReactNode;
  tabValue: string;
}

const ICON_LINKS: IconLinkItem[] = [
  { labelKey: "iconAiMedia", icon: <Film className="h-4 w-4" />, tabValue: "aiMedia" },
  { labelKey: "iconAiInfluencers", icon: <Users className="h-4 w-4" />, tabValue: "aiInfluencers" },
  { labelKey: "iconAiSites", icon: <Globe className="h-4 w-4" />, tabValue: "aiSites" },
  { labelKey: "iconAiDiscord", icon: <MessageCircle className="h-4 w-4" />, tabValue: "aiDiscord" },
];

export function IconLinks() {
  const { t } = useLanguage();

  const handleClick = (tabValue: string) => {
    // Set the URL hash so SectionTabs can pick it up
    window.location.hash = tabValue;
    // Scroll to the tabs section
    const tabsSection = document.querySelector("[data-tabs-section]");
    if (tabsSection) {
      tabsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="flex items-center gap-1">
      {ICON_LINKS.map((item) => {
        const label = t(item.labelKey);

        return (
          <button
            key={item.labelKey}
            onClick={() => handleClick(item.tabValue)}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            title={label}
            aria-label={label}
          >
            {item.icon}
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
