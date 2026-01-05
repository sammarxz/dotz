import { CalendarUtils } from "@/lib/date/calendar-utils";
import { JournalEntry } from "@/lib/types";

import { DayDot } from "./DayDot";

interface DayGridProps {
  year: number;
  entries: Record<string, JournalEntry>;
  onDayClick: (dayIndex: number) => void;
}

export function DayGrid({ year, entries, onDayClick }: DayGridProps) {
  const days = Array.from({ length: 365 }, (_, i) => i);

  return (
    <div className="w-full grid grid-cols-[repeat(auto-fit,minmax(12px,1fr))] gap-3 md:gap-4 max-w-5xl p-4 mx-auto">
      <div className="flex flex-wrap gap-3 md:gap-4 justify-center">
        {days.map((dayIndex) => {
          const key = CalendarUtils.getDayKey(year, dayIndex);
          const hasEntry = !!entries[key];

          return (
            <DayDot
              key={dayIndex}
              dayIndex={dayIndex}
              year={year}
              hasEntry={hasEntry}
              onClick={() => onDayClick(dayIndex)}
            />
          );
        })}
      </div>
    </div>
  );
}
