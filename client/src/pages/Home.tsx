import { trpc } from "@/lib/trpc";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { SectionTabs } from "@/components/SectionTabs";
import { Footer } from "@/components/Footer";

export default function Home() {
  const { data: toolsData, isLoading: toolsLoading, error: toolsError } =
    trpc.tools.list.useQuery(undefined);

  const { data: categoriesData } = trpc.tools.categories.useQuery();
  const { data: totalCountData, isLoading: countLoading } = trpc.tools.totalCount.useQuery();

  const tools = toolsData?.tools ?? [];
  const categories = categoriesData?.categories ?? [];
  const totalTools = totalCountData?.total ?? 0;

  // Render the page shell immediately — each section owns its loading state,
  // so one slow table never blanks the whole site.
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <Hero toolCount={totalTools} isLoading={countLoading} />
      <SectionTabs
        tools={tools}
        categories={categories}
        toolsLoading={toolsLoading}
        toolsError={!!toolsError}
      />
      <Footer />
    </div>
  );
}
