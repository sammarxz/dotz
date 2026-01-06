import { useState, useCallback } from "react";
import { CalendarUtils } from "@/features/journal/lib/date/calendar-utils";
import { JournalEntry } from "@/shared/lib/types";

/**
 * Hook to manage editor state
 * Handles selected day, initial text, and date formatting for the editor
 */
export function useEditorState(
  currentYear: number,
  getEntry: (key: string) => JournalEntry | undefined
) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const openEditor = useCallback((dayIndex: number) => {
    if (CalendarUtils.isFutureDay(currentYear, dayIndex)) return;
    setSelectedDay(dayIndex);
  }, [currentYear]);

  const closeEditor = useCallback(() => {
    setSelectedDay(null);
  }, []);

  const getInitialText = useCallback((): string => {
    if (selectedDay === null) return "";
    const key = CalendarUtils.getDayKey(currentYear, selectedDay);
    return getEntry(key)?.memory || "";
  }, [selectedDay, currentYear, getEntry]);

  const getEntryDate = useCallback((): string | null => {
    if (selectedDay === null) return null;
    const key = CalendarUtils.getDayKey(currentYear, selectedDay);
    return getEntry(key)?.date ?? null;
  }, [selectedDay, currentYear, getEntry]);

  const getEditorDate = useCallback((): string => {
    if (selectedDay === null) return "";
    return CalendarUtils.formatDate(
      CalendarUtils.getDayOfYear(currentYear, selectedDay)
    );
  }, [selectedDay, currentYear]);

  const getDayKey = useCallback((): string | null => {
    if (selectedDay === null) return null;
    return CalendarUtils.getDayKey(currentYear, selectedDay);
  }, [selectedDay, currentYear]);

  return {
    selectedDay,
    openEditor,
    closeEditor,
    getInitialText,
    getEntryDate,
    getEditorDate,
    getDayKey,
  };
}
