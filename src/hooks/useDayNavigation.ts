import { useState, useEffect, useCallback, useRef } from "react";
import { CalendarUtils } from "@/lib/date/calendar-utils";

interface UseDayNavigationOptions {
  year: number;
  enabled?: boolean;
  onEnter?: (dayIndex: number) => void;
}

export function useDayNavigation({
  year,
  enabled = true,
  onEnter,
}: UseDayNavigationOptions) {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  const selectedDayRef = useRef<number | null>(null);

  // Update ref when selectedDayIndex changes
  useEffect(() => {
    selectedDayRef.current = selectedDayIndex;
  }, [selectedDayIndex]);

  // Initialize to today if enabled
  useEffect(() => {
    if (enabled && selectedDayIndex === null) {
      const today = CalendarUtils.getTodayIndex(year);
      if (!CalendarUtils.isFutureDay(year, today)) {
        setSelectedDayIndex(today);
      } else {
        // If today is in the future, select day 0
        setSelectedDayIndex(0);
      }
    }
  }, [enabled, year, selectedDayIndex]);

  // Scroll to selected day when it changes
  useEffect(() => {
    if (selectedDayIndex !== null && enabled) {
      // Use a small delay to ensure DOM is updated
      const timer = setTimeout(() => {
        const element = document.querySelector(`[data-day-index="${selectedDayIndex}"]`);
        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "center",
          });
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [selectedDayIndex, enabled]);

  const navigateToDay = useCallback(
    (dayIndex: number) => {
      if (dayIndex < 0 || dayIndex >= 365) return;
      if (CalendarUtils.isFutureDay(year, dayIndex)) return;
      setSelectedDayIndex(dayIndex);
    },
    [year]
  );

  const navigateUp = useCallback(() => {
    if (selectedDayRef.current === null) return;
    // Move up by approximately 7 days (one week)
    // But we need to account for the grid layout
    // For simplicity, let's move by 7 days
    const newIndex = selectedDayRef.current - 7;
    if (newIndex >= 0) {
      navigateToDay(newIndex);
    }
  }, [navigateToDay]);

  const navigateDown = useCallback(() => {
    if (selectedDayRef.current === null) return;
    // Move down by approximately 7 days (one week)
    const newIndex = selectedDayRef.current + 7;
    if (newIndex < 365) {
      navigateToDay(newIndex);
    }
  }, [navigateToDay]);

  const navigateLeft = useCallback(() => {
    if (selectedDayRef.current === null) return;
    const newIndex = selectedDayRef.current - 1;
    if (newIndex >= 0) {
      navigateToDay(newIndex);
    }
  }, [navigateToDay]);

  const navigateRight = useCallback(() => {
    if (selectedDayRef.current === null) return;
    const newIndex = selectedDayRef.current + 1;
    if (newIndex < 365) {
      navigateToDay(newIndex);
    }
  }, [navigateToDay]);

  const handleEnter = useCallback(() => {
    if (selectedDayRef.current !== null && onEnter) {
      onEnter(selectedDayRef.current);
    }
  }, [onEnter]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      const target = event.target as HTMLElement;
      const isTyping = ["INPUT", "TEXTAREA"].includes(target.tagName);

      // Don't handle navigation when typing in inputs
      if (isTyping) return;

      switch (event.key) {
        case "ArrowUp":
          event.preventDefault();
          navigateUp();
          break;
        case "ArrowDown":
          event.preventDefault();
          navigateDown();
          break;
        case "ArrowLeft":
          event.preventDefault();
          navigateLeft();
          break;
        case "ArrowRight":
          event.preventDefault();
          navigateRight();
          break;
        case "Enter":
          event.preventDefault();
          handleEnter();
          break;
      }
    },
    [enabled, navigateUp, navigateDown, navigateLeft, navigateRight, handleEnter]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, handleKeyDown]);

  return {
    selectedDayIndex,
    setSelectedDayIndex: navigateToDay,
  };
}
