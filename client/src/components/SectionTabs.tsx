import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";
import { Loader2, PanelTopClose, PanelTopOpen } from "lucide-react";
import { ToolGrid } from "./ToolGrid";
import { type AiTool } from "./ToolCard";
import { GithubReposSection } from "./GithubReposSection";
import { WeeklyViralGithubSection } from "./WeeklyViralGithubSection";
import { SumateTopRecommendationsSection } from "./SumateTopRecommendationsSection";
import { LlmsSection } from "./LlmsSection";
import { GenericToolSection } from "./GenericToolSection";
import { GroupedCategoryNav } from "./GroupedCategoryNav";

interface SectionTabsProps {
  tools: AiTool[];
  categories: string[];
  toolsLoading?: boolean;
  toolsError?: boolean;
}

export function SectionTabs({ tools, categories, toolsLoading, toolsError }: SectionTabsProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("tools");
  // The 3-row category bar can feel bulky — a floating toggle hides it, remembered per browser.
  const [navHidden, setNavHidden] = useState(() => localStorage.getItem("hideCategoryBar") === "true");

  const toggleNav = () => {
    setNavHidden((prev) => {
      localStorage.setItem("hideCategoryBar", String(!prev));
      return !prev;
    });
  };

  // Sync with URL hash so icon links (and direct links) can switch tabs
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      setActiveTab(hash);
    }
    const onHashChange = () => {
      const h = window.location.hash.replace("#", "");
      if (h) setActiveTab(h);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <div className="flex-1">
      {!navHidden && <GroupedCategoryNav activeTab={activeTab} onChange={setActiveTab} />}

      {/* Floating show/hide toggle for the category bar — persisted in localStorage */}
      <button
        onClick={toggleNav}
        title={navHidden ? t("showCategoryBar") : t("hideCategoryBar")}
        aria-label={navHidden ? t("showCategoryBar") : t("hideCategoryBar")}
        className="fixed bottom-4 right-4 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/90 backdrop-blur-md shadow-lg text-muted-foreground transition-colors hover:text-primary hover:border-primary/50"
      >
        {navHidden ? <PanelTopOpen className="h-4 w-4" /> : <PanelTopClose className="h-4 w-4" />}
      </button>

      <div className="container py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent value="tools" className="mt-0 grid-pattern-bg">
            {toolsLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : toolsError ? (
              <p className="text-center py-20 text-sm text-destructive">{t("errorLoading")}</p>
            ) : (
              <ToolGrid tools={tools} categories={categories} />
            )}
          </TabsContent>

          <TabsContent value="aiMedia" className="mt-0 grid-pattern-bg">
            <GenericToolSection
              queryKey="aiMedia"
              titleKey="aiMediaTitle"
              subtitleKey="aiMediaSubtitle"
              hasBlogView
            />
          </TabsContent>

          <TabsContent value="github" className="mt-0 grid-pattern-bg">
            <WeeklyViralGithubSection />
            <GithubReposSection />
          </TabsContent>

          <TabsContent value="llms" className="mt-0 grid-pattern-bg">
            <LlmsSection />
          </TabsContent>

          <TabsContent value="videoImage" className="mt-0 grid-pattern-bg">
            <GenericToolSection
              queryKey="videoImage"
              titleKey="videoImageTitle"
              subtitleKey="videoImageSubtitle"
            />
          </TabsContent>

          <TabsContent value="musicVoice" className="mt-0 grid-pattern-bg">
            <GenericToolSection
              queryKey="musicVoice"
              titleKey="musicVoiceTitle"
              subtitleKey="musicVoiceSubtitle"
            />
          </TabsContent>

          <TabsContent value="chatbots" className="mt-0 grid-pattern-bg">
            <GenericToolSection
              queryKey="chatbots"
              titleKey="chatbotsTitle"
              subtitleKey="chatbotsSubtitle"
            />
          </TabsContent>

          <TabsContent value="freeApis" className="mt-0 grid-pattern-bg">
            <GenericToolSection
              queryKey="freeApis"
              titleKey="freeApisTitle"
              subtitleKey="freeApisSubtitle"
            />
          </TabsContent>

          <TabsContent value="freeLlmIde" className="mt-0 grid-pattern-bg">
            <GenericToolSection
              queryKey="freeLlmIde"
              titleKey="freeLlmIdeTitle"
              subtitleKey="freeLlmIdeSubtitle"
            />
          </TabsContent>

          <TabsContent value="vibeCoding" className="mt-0 grid-pattern-bg">
            <GenericToolSection
              queryKey="vibeCoding"
              titleKey="vibeCodingTitle"
              subtitleKey="vibeCodingSubtitle"
            />
          </TabsContent>

          <TabsContent value="designerTools" className="mt-0 grid-pattern-bg">
            <GenericToolSection
              queryKey="designerTools"
              titleKey="designerToolsTitle"
              subtitleKey="designerToolsSubtitle"
            />
          </TabsContent>

          <TabsContent value="aiInfra" className="mt-0 grid-pattern-bg">
            <GenericToolSection
              queryKey="aiInfra"
              titleKey="aiInfraTitle"
              subtitleKey="aiInfraSubtitle"
            />
          </TabsContent>

          <TabsContent value="hardware" className="mt-0 grid-pattern-bg">
            <GenericToolSection
              queryKey="hardware"
              titleKey="hardwareTitle"
              subtitleKey="hardwareSubtitle"
            />
          </TabsContent>

          <TabsContent value="testingTools" className="mt-0 grid-pattern-bg">
            <GenericToolSection
              queryKey="testingTools"
              titleKey="testingToolsTitle"
              subtitleKey="testingToolsSubtitle"
            />
          </TabsContent>

          <TabsContent value="aiSecurity" className="mt-0 grid-pattern-bg">
            <GenericToolSection
              queryKey="aiSecurity"
              titleKey="aiSecurityTitle"
              subtitleKey="aiSecuritySubtitle"
            />
          </TabsContent>

          <TabsContent value="businessProductivity" className="mt-0 grid-pattern-bg">
            <GenericToolSection
              queryKey="businessProductivity"
              titleKey="businessProductivityTitle"
              subtitleKey="businessProductivitySubtitle"
            />
          </TabsContent>

          <TabsContent value="mcpProviders" className="mt-0 grid-pattern-bg">
            <GenericToolSection
              queryKey="mcpProviders"
              titleKey="mcpProvidersTitle"
              subtitleKey="mcpProvidersSubtitle"
            />
          </TabsContent>

          <TabsContent value="vpsCloud" className="mt-0 grid-pattern-bg">
            <GenericToolSection
              queryKey="vpsCloud"
              titleKey="vpsCloudTitle"
              subtitleKey="vpsCloudSubtitle"
            />
          </TabsContent>

          <TabsContent value="aiInfluencers" className="mt-0 grid-pattern-bg">
            <SumateTopRecommendationsSection />
            <GenericToolSection
              queryKey="aiInfluencers"
              titleKey="aiInfluencersTitle"
              subtitleKey="aiInfluencersSubtitle"
              visitLabelKey="visitChannel"
              hasPopularitySort
              hasLanguageFilter
            />
          </TabsContent>

          <TabsContent value="aiSites" className="mt-0 grid-pattern-bg">
            <GenericToolSection
              queryKey="aiSites"
              visitLabelKey="visitSite"
              titleKey="aiSitesTitle"
              subtitleKey="aiSitesSubtitle"
              hasLanguageFilter
            />
          </TabsContent>

          <TabsContent value="aiDiscord" className="mt-0 grid-pattern-bg">
            <GenericToolSection
              queryKey="aiDiscord"
              visitLabelKey="visitServer"
              titleKey="aiDiscordTitle"
              subtitleKey="aiDiscordSubtitle"
              hasLanguageFilter
            />
          </TabsContent>

          <TabsContent value="auSeoTools" className="mt-0 grid-pattern-bg">
            <GenericToolSection
              queryKey="auSeoTools"
              titleKey="auSeoToolsTitle"
              subtitleKey="auSeoToolsSubtitle"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
