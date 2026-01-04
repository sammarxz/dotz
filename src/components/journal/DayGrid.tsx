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
    <div
      className={`
        grid
        gap-2                 
        w-full
        grid-cols-[repeat(auto-fill,minmax(24px,1fr))]
      `}
    >
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
  );
}
