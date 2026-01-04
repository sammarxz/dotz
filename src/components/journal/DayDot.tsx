import { CalendarUtils } from "@/lib/date/calendar-utils";
import { cn } from "@/lib/utils";

interface DayDotProps {
  dayIndex: number;
  year: number;
  hasEntry: boolean;
  onClick: () => void;
}

export function DayDot({ dayIndex, year, hasEntry, onClick }: DayDotProps) {
  const isToday = dayIndex === CalendarUtils.getTodayIndex(year);
  const isFuture = CalendarUtils.isFutureDay(year, dayIndex);

  const ariaDesc = [
    `Dia ${dayIndex + 1}`,
    isToday ? "(hoje)" : null,
    isFuture ? "(dia futuro – não editável)" : null,
    hasEntry ? "(tem memória)" : "(sem memória)",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      onClick={onClick}
      disabled={isFuture}
      className={cn(
        "relative flex items-center justify-center p-2 transition-opacity",
        isFuture
          ? "cursor-default opacity-30"
          : "cursor-pointer hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white"
      )}
      aria-label={ariaDesc}
    >
      <span
        className={cn(
          "w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 cursor-pointer bg-zinc-900/50 hover:bg-zinc-800",
          hasEntry
            ? "bg-foreground shadow-[0_0_10px_rgba(255,255,255,0.8)] "
            : "bg-zinc-800",
          isToday &&
            "ring-2 ring-white/30 ring-offset-2 ring-offset-background animate-pulse scale-125"
        )}
      />
    </button>
  );
}
