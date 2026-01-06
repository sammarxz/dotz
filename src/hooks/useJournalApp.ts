import { useState, useCallback, useEffect } from "react";

import { useJournalEntries } from "./useJournalEntries";
import { useKeyboardShortcuts } from "./useKeyboardShortcuts";
import { useFileSystemStorage } from "./useFileSystemStorage";
import { useDayNavigation } from "./useDayNavigation";

import { CalendarUtils } from "@/lib/date/calendar-utils";

export function useJournalApp() {
  // Use state to ensure consistent year between server and client
  const [currentYear, setCurrentYear] = useState(() => {
    if (typeof window === "undefined") {
      // Server-side: use a consistent value
      return new Date().getFullYear();
    }
    // Client-side: will be set in useEffect
    return new Date().getFullYear();
  });

  useEffect(() => {
    // Ensure year is set correctly on client
    setCurrentYear(new Date().getFullYear());
  }, []);
  const { entries, saveEntry, getEntry, storageMode, migrateToFileSystem } = useJournalEntries();
  const { isInitialized, isSupported, needsSetup, setupFileSystem } =
    useFileSystemStorage();

  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  const handleDayClick = useCallback(
    (dayIndex: number) => {
      if (CalendarUtils.isFutureDay(currentYear, dayIndex)) return;
      setSelectedDay(dayIndex);
      setIsEditorOpen(true);
    },
    [currentYear]
  );

  // Day navigation - only enabled when no modals are open
  const isNavigationEnabled = !isEditorOpen && !isSettingsOpen && !isShortcutsOpen;
  const { selectedDayIndex, setSelectedDayIndex } = useDayNavigation({
    year: currentYear,
    enabled: isNavigationEnabled,
    onEnter: (dayIndex) => {
      handleDayClick(dayIndex);
    },
  });

  // Update navigation selection when user clicks a day
  const handleDayClickWithNavigation = useCallback(
    (dayIndex: number) => {
      setSelectedDayIndex(dayIndex);
      handleDayClick(dayIndex);
    },
    [handleDayClick, setSelectedDayIndex]
  );

  const handleSave = useCallback(
    async (memory: string) => {
      if (selectedDay === null) return;
      const key = CalendarUtils.getDayKey(currentYear, selectedDay);
      await saveEntry(key, memory);
    },
    [selectedDay, currentYear, saveEntry]
  );

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

  const handleOpenSettings = useCallback(() => {
    setIsSettingsOpen(true);
  }, []);

  const handleCloseEditor = useCallback(() => {
    setIsEditorOpen(false);
  }, []);

  const handleCloseSettings = useCallback(() => {
    setIsSettingsOpen(false);
  }, []);

  const handleCloseShortcuts = useCallback(() => {
    setIsShortcutsOpen(false);
  }, []);

  const handleOpenShortcuts = useCallback(() => {
    setIsShortcutsOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    if (isEditorOpen) setIsEditorOpen(false);
    else if (isSettingsOpen) setIsSettingsOpen(false);
    else if (isShortcutsOpen) setIsShortcutsOpen(false);
  }, [isEditorOpen, isSettingsOpen, isShortcutsOpen]);

  const handleNewNote = useCallback(() => {
    const today = CalendarUtils.getTodayIndex(currentYear);
    if (!CalendarUtils.isFutureDay(currentYear, today)) {
      handleDayClick(today);
    }
  }, [currentYear, handleDayClick]);

  useKeyboardShortcuts({
    enabled: true,
    handlers: {
      onNewNote: handleNewNote,
      onCloseModal: handleCloseModal,
      onShowShortcuts: handleOpenShortcuts,
      onOpenSettings: handleOpenSettings,
    },
  });

  return {
    // Data
    currentYear,
    entries,
    isInitialized,
    isSupported,
    needsSetup,
    storageMode,

    // Modal states
    isEditorOpen,
    isSettingsOpen,
    isShortcutsOpen,

    // Navigation
    selectedDayIndex,

    // Handlers
    handleDayClick: handleDayClickWithNavigation,
    handleSave,
    handleOpenSettings,
    handleSetupFileSystem: async () => {
      await setupFileSystem();
    },
    migrateToFileSystem,

    // Editor data
    initialText: getInitialText(),
    editorDate: getEditorDate(),
    entryDate: getEntryDate(),

    // Modal close handlers
    handleCloseEditor,
    handleCloseSettings,
    handleCloseShortcuts,
  };
}
