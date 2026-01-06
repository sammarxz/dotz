import { useMemo } from "react";
import { CalendarUtils } from "@/features/journal/lib/date/calendar-utils";
import { JournalEntry } from "@/shared/lib/types";
import { CALENDAR } from "@/shared/lib/constants/app-constants";

import { DayDot } from "./DayDot";

interface DayGridProps {
  year: number;
  entries: Record<string, JournalEntry>;
  onDayClick: (dayIndex: number) => void;
  selectedDayIndex?: number | null;
}

export function DayGrid({ year, entries, onDayClick, selectedDayIndex }: DayGridProps) {
  // Memoize days array to avoid recreating it on every render
  const days = useMemo(() => Array.from({ length: CALENDAR.DAYS_IN_YEAR }, (_, i) => i), []);

  // Memoize day data to avoid recalculating on every render
  const dayData = useMemo(() => {
    return days.map((dayIndex) => {
      const key = CalendarUtils.getDayKey(year, dayIndex);
      const entry = entries[key];
      // Consider entry as "has entry" only if it has non-empty content
      const hasEntry = !!entry && entry.memory.trim() !== "";
      const isSelected = selectedDayIndex === dayIndex;
      return { dayIndex, hasEntry, isSelected };
    });
  }, [days, year, entries, selectedDayIndex]);

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4">
      <div className="flex flex-wrap gap-1.5 sm:gap-2 md:gap-3 lg:gap-4 justify-center">
        {dayData.map(({ dayIndex, hasEntry, isSelected }) => (
          <DayDot
            key={dayIndex}
            dayIndex={dayIndex}
            year={year}
            hasEntry={hasEntry}
            isSelected={isSelected}
            onDayClick={onDayClick}
          />
        ))}
      </div>
    </div>
  );
}
