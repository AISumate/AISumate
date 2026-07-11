import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { ToolGrid } from "./ToolGrid";
import { type AiTool } from "./ToolCard";
import { GithubReposSection } from "./GithubReposSection";
import { LlmsSection } from "./LlmsSection";
import { NewsSection } from "./NewsSection";
import { LtdsSection } from "./LtdsSection";
import { GenericToolSection } from "./GenericToolSection";

interface SectionTabsProps {
  tools: AiTool[];
  categories: string[];
  toolsLoading?: boolean;
  toolsError?: boolean;
}

export function SectionTabs({ tools, categories, toolsLoading, toolsError }: SectionTabsProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("tools");

  // Sync with URL hash so icon links can switch tabs
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
    <div className="flex-1" data-tabs-section>
      <div className="container py-2">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start h-auto p-1.5 bg-secondary/50 flex-wrap gap-1 rounded-xl">
            <TabsTrigger value="tools" className="text-sm">
              {t("tabTools")}
            </TabsTrigger>
            <TabsTrigger value="github" className="text-sm">
              {t("tabGithub")}
            </TabsTrigger>
            <TabsTrigger value="llms" className="text-sm">
              {t("tabLlms")}
            </TabsTrigger>
            <TabsTrigger value="videoImage" className="text-sm">
              {t("tabVideoImage")}
            </TabsTrigger>
            <TabsTrigger value="musicVoice" className="text-sm">
              {t("tabMusicVoice")}
            </TabsTrigger>
            <TabsTrigger value="chatbots" className="text-sm">
              {t("tabChatbots")}
            </TabsTrigger>
            <TabsTrigger value="news" className="text-sm">
              {t("tabNews")}
            </TabsTrigger>
            <TabsTrigger value="ltds" className="text-sm">
              {t("tabLtds")}
            </TabsTrigger>
            <TabsTrigger value="freeApis" className="text-sm">
              {t("tabFreeApis")}
            </TabsTrigger>
            <TabsTrigger value="freeLlmIde" className="text-sm">
              {t("tabFreeLlmIde")}
            </TabsTrigger>
            <TabsTrigger value="vibeCoding" className="text-sm">
              {t("tabVibeCoding")}
            </TabsTrigger>
            <TabsTrigger value="designerTools" className="text-sm">
              {t("tabDesignerTools")}
            </TabsTrigger>
            <TabsTrigger value="aiInfra" className="text-sm">
              {t("tabAiInfra")}
            </TabsTrigger>
            <TabsTrigger value="hardware" className="text-sm">
              {t("tabHardware")}
            </TabsTrigger>
            <TabsTrigger value="testingTools" className="text-sm">
              {t("tabTestingTools")}
            </TabsTrigger>
            <TabsTrigger value="aiSecurity" className="text-sm">
              {t("tabAiSecurity")}
            </TabsTrigger>
            <TabsTrigger value="businessProductivity" className="text-sm">
              {t("tabBusinessProductivity")}
            </TabsTrigger>
            <TabsTrigger value="mcpProviders" className="text-sm">
              {t("tabMcpProviders")}
            </TabsTrigger>
            <TabsTrigger value="vpsCloud" className="text-sm">
              {t("tabVpsCloud")}
            </TabsTrigger>
            <TabsTrigger value="aiMedia" className="text-sm">
              {t("iconAiMedia")}
            </TabsTrigger>
            <TabsTrigger value="aiInfluencers" className="text-sm">
              {t("iconAiInfluencers")}
            </TabsTrigger>
            <TabsTrigger value="aiSites" className="text-sm">
              {t("iconAiSites")}
            </TabsTrigger>
            <TabsTrigger value="aiDiscord" className="text-sm">
              {t("iconAiDiscord")}
            </TabsTrigger>
          </TabsList>

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

          <TabsContent value="github" className="mt-0 grid-pattern-bg">
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

          <TabsContent value="news" className="mt-0 grid-pattern-bg">
            <NewsSection />
          </TabsContent>

          <TabsContent value="ltds" className="mt-0 grid-pattern-bg">
            <LtdsSection />
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

          <TabsContent value="aiMedia" className="mt-0 grid-pattern-bg">
            <GenericToolSection
              queryKey="aiMedia"
              titleKey="aiMediaTitle"
              subtitleKey="aiMediaSubtitle"
            />
          </TabsContent>

          <TabsContent value="aiInfluencers" className="mt-0 grid-pattern-bg">
            <GenericToolSection
              queryKey="aiInfluencers"
              titleKey="aiInfluencersTitle"
              subtitleKey="aiInfluencersSubtitle"
            />
          </TabsContent>

          <TabsContent value="aiSites" className="mt-0 grid-pattern-bg">
            <GenericToolSection
              queryKey="aiSites"
              titleKey="aiSitesTitle"
              subtitleKey="aiSitesSubtitle"
            />
          </TabsContent>

          <TabsContent value="aiDiscord" className="mt-0 grid-pattern-bg">
            <GenericToolSection
              queryKey="aiDiscord"
              titleKey="aiDiscordTitle"
              subtitleKey="aiDiscordSubtitle"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
