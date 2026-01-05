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
    `Day ${dayIndex + 1}`,
    isToday ? "(Today)" : null,
    isFuture ? "(Future day – not editable)" : null,
    hasEntry ? "(has memory)" : "(no memory)",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="relative group">
      <button
        onClick={onClick}
        disabled={isFuture}
        className={cn(
          "relative transition-all touch-manipulation",
          "min-w-[44px] min-h-[44px] flex items-center justify-center",
          "sm:min-w-[32px] sm:min-h-[32px]",
          isFuture
            ? "cursor-default opacity-20"
            : "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-full"
        )}
        aria-label={ariaDesc}
        aria-pressed={hasEntry}
        tabIndex={isFuture ? -1 : 0}
      >
        <div
          className={cn(
            "w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full transition-all duration-300",
            hasEntry
              ? "bg-foreground shadow-[0_0_10px_rgba(255,255,255,0.8)]"
              : "bg-zinc-700",
            isToday && "animate-pulse scale-125",
            !isFuture &&
              !hasEntry &&
              "bg-zinc-900/50 active:bg-zinc-800 sm:hover:bg-zinc-800"
          )}
        />
      </button>
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 hidden sm:block">
        <span className="text-[10px] bg-zinc-800 px-2 py-1 rounded text-zinc-300 shadow-lg">
          Day {dayIndex + 1}
        </span>
      </div>
    </div>
  );
}
