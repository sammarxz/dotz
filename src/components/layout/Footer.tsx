import { CalendarUtils } from "@/lib/date/calendar-utils";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const daysLeft = CalendarUtils.getDaysLeftInYear(currentYear);

  return (
    <footer className="flex justify-between items-end text-zinc-600 uppercase tracking-widest z-10 mt-8">
      <div>
        <span className="block text-foreground mb-1">{currentYear}</span>
        <span>Year Progress</span>
      </div>
      <div className="text-right">
        <span className="block text-foreground mb-1">
          {daysLeft} {daysLeft === 1 ? "day" : "days"} left
        </span>
        <span>Keep going</span>
      </div>
    </footer>
  );
}
