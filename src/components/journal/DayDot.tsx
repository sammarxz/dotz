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
          "relative transition-all",
          isFuture
            ? "cursor-default opacity-20"
            : "cursor-pointer focus-visible:outline-none"
        )}
        aria-label={ariaDesc}
      >
        <div
          className={cn(
            "w-2 h-2 md:w-2.5 md:h-2.5 rounded-full transition-all duration-300 cursor-pointer",
            hasEntry
              ? "bg-foreground shadow-[0_0_10px_rgba(255,255,255,0.8)]"
              : "bg-zinc-700",
            isToday && "animate-pulse scale-125",
            !isFuture && !hasEntry && "bg-zinc-900/50 hover:bg-zinc-800"
          )}
        />
      </button>
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
        <span className="text-[10px] bg-zinc-800 px-2 py-1 rounded text-zinc-300">
          Day {dayIndex + 1}
        </span>
      </div>
    </div>
  );
}
