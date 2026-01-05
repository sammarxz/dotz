import { useState, useCallback } from "react";

import { useJournalEntries } from "./useJournalEntries";
import { useKeyboardShortcuts } from "./useKeyboardShortcuts";
import { useFileSystemStorage } from "./useFileSystemStorage";

import { CalendarUtils } from "@/lib/date/calendar-utils";

export function useJournalApp() {
  const currentYear = new Date().getFullYear();
  const { entries, saveEntry, getEntry } = useJournalEntries();
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

    // Modal states
    isEditorOpen,
    isSettingsOpen,
    isShortcutsOpen,

    // Handlers
    handleDayClick,
    handleSave,
    handleOpenSettings,
    handleSetupFileSystem: async () => {
      await setupFileSystem();
    },

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
