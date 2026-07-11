import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ToolCard, type AiTool } from "./ToolCard";
import { useLanguage } from "@/contexts/LanguageContext";

export function ToolCarousel({ tools }: { tools: AiTool[] }) {
  const { t } = useLanguage();

  if (tools.length === 0) return null;

  return (
    <section className="py-12 border-b border-border">
      <div className="container">
        {/* Section header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {t("carouselTitle")}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t("carouselSubtitle")}
          </p>
        </div>

        {/* Carousel */}
        <div className="relative px-12">
          <Carousel
            opts={{
              align: "start",
              loop: false,
              dragFree: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {tools.map((tool) => (
                <CarouselItem
                  key={tool.id}
                  className="pl-4 basis-[160px] sm:basis-[180px] md:basis-[200px]"
                >
                  <ToolCard tool={tool} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-left-2 left-2" aria-label={t("previousSlide")} />
            <CarouselNext className="-right-2 right-2" aria-label={t("nextSlide")} />
          </Carousel>
        </div>
      </div>
    </section>
  );
}
