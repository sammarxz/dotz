import { CalendarUtils } from "@/lib/date/calendar-utils";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const daysLeft = CalendarUtils.getDaysLeftInYear(currentYear);

  return (
    <footer
      className="flex justify-between items-end text-zinc-600 uppercase 
    tracking-widest z-10 mt-6 sm:mt-8 text-base md:fixed inset-x-0 bottom-0 p-4 md:p-12"
    >
      <div>
        <span className="block text-foreground mb-1 text-base sm:text-base">
          {currentYear}
        </span>
        <span>Year Progress</span>
      </div>
      <div className="text-right">
        <span className="block text-foreground mb-1 text-base sm:text-base">
          {daysLeft} {daysLeft === 1 ? "day" : "days"} left
        </span>
        <span>Keep going</span>
      </div>
    </footer>
  );
}
