import { trpc } from "@/lib/trpc";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { SectionTabs } from "@/components/SectionTabs";
import { Footer } from "@/components/Footer";

export default function Home() {
  const { data: totalCountData, isLoading: countLoading } =
    trpc.tools.totalCount.useQuery();

  const totalTools = totalCountData?.total ?? 0;

  // Render the page shell immediately — each section owns its loading state,
  // so one slow table never blanks the whole site. The AI Tools grid pages
  // its own catalogue instead of receiving the whole table as props.
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <Hero toolCount={totalTools} isLoading={countLoading} />
      <SectionTabs />
      <Footer />
    </div>
  );
}
