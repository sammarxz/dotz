export class CalendarUtils {
  
  static getDayOfYear(year: number, dayIndex: number): Date {
    return new Date(year, 0, dayIndex + 1);
  }

  static getDayKey(year: number, dayIndex: number): string {
    return `${year}-${dayIndex}`;
  }

  static getDaysLeftInYear(year: number): number {
    const now = new Date();
    const endOfYear = new Date(year, 11, 31);
    const diff = endOfYear.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  static getTodayIndex(year: number): number {
    const now = new Date();
    const startOfYear = new Date(year, 0, 1); // 1º de janeiro
    const diff = now.getTime() - startOfYear.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayIndex = Math.floor(diff / oneDay);
    
    if (now.getFullYear() !== year) {
      return now.getFullYear() < year ? -1 : 365;
    }
    
    return dayIndex;
  }

  static isFutureDay(year: number, dayIndex: number): boolean {
    const now = new Date();
    
    if (year > now.getFullYear()) {
      return true;
    }
    
    if (year < now.getFullYear()) {
      return false;
    }
    
    return dayIndex > this.getTodayIndex(year);
  }

  static formatDate(date: Date): string {
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  static formatRelative(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime(); 

    const units: { unit: Intl.RelativeTimeFormatUnit; ms: number }[] = [
      { unit: "year", ms: 1000 * 60 * 60 * 24 * 365 },
      { unit: "month", ms: 1000 * 60 * 60 * 24 * 30 },
      { unit: "week", ms: 1000 * 60 * 60 * 24 * 7 },
      { unit: "day", ms: 1000 * 60 * 60 * 24 },
      { unit: "hour", ms: 1000 * 60 * 60 },
      { unit: "minute", ms: 1000 * 60 * 60 },
      { unit: "second", ms: 1000 * 60 * 60 },
    ];

    for (const { unit, ms } of units) {
      const value = Math.round(diffMs / ms);
      if (Math.abs(value) >= 1) {
        const rtf = new Intl.RelativeTimeFormat("en-US", {
          numeric: "auto",
          style: "long",
        });

        return rtf.format(-value, unit);
      }
    }

    return "now";
  }
}