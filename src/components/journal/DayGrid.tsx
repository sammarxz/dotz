import { CalendarUtils } from "@/lib/date/calendar-utils";
import { JournalEntry } from "@/lib/types";

import { DayDot } from "./DayDot";

interface DayGridProps {
  year: number;
  entries: Record<string, JournalEntry>;
  onDayClick: (dayIndex: number) => void;
  selectedDayIndex?: number | null;
}

export function DayGrid({ year, entries, onDayClick, selectedDayIndex }: DayGridProps) {
  const days = Array.from({ length: 365 }, (_, i) => i);

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4">
      <div className="flex flex-wrap gap-1.5 sm:gap-2 md:gap-3 lg:gap-4 justify-center">
        {days.map((dayIndex) => {
          const key = CalendarUtils.getDayKey(year, dayIndex);
          const entry = entries[key];
          // Consider entry as "has entry" only if it has non-empty content
          const hasEntry = !!entry && entry.memory.trim() !== "";
          const isSelected = selectedDayIndex === dayIndex;

          return (
            <DayDot
              key={dayIndex}
              dayIndex={dayIndex}
              year={year}
              hasEntry={hasEntry}
              isSelected={isSelected}
              onClick={() => onDayClick(dayIndex)}
            />
          );
        })}
      </div>
    </div>
  );
}
