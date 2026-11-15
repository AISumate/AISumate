import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

/** The existing "showing X of Y" + load-more control, wired to the next page. */
export function LoadMoreButton({
  shown,
  total,
  hasMore,
  pending,
  onClick,
}: {
  shown: number;
  total: number;
  hasMore: boolean;
  pending: boolean;
  onClick: () => void;
}) {
  const { t } = useLanguage();
  if (!hasMore) return null;
  return (
    <div className="mt-8 flex flex-col items-center gap-3">
      <p className="text-xs text-muted-foreground">
        {t("showingResults")
          .replace("{shown}", String(shown))
          .replace("{total}", String(total))}
      </p>
      <Button
        variant="outline"
        size="sm"
        onClick={onClick}
        disabled={pending}
        className="border-primary/30 text-primary hover:bg-primary/5"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : t("loadMore")}
      </Button>
    </div>
  );
}
