import { useState, useCallback, useEffect, useMemo } from "react";

import { useJournalEntries } from "./useJournalEntries";
import { useKeyboardShortcuts } from "@/shared/hooks/useKeyboardShortcuts";
import { useFileSystemStorage } from "@/features/settings/hooks/useFileSystemStorage";
import { useDayNavigation } from "./useDayNavigation";
import { useModalState } from "./useModalState";
import { useEditorState } from "./useEditorState";

import { CalendarUtils } from "@/features/journal/lib/date/calendar-utils";
import { logger } from "@/shared/lib/utils/logger";

/**
 * Main hook for the journal application
 * Orchestrates all sub-hooks and provides a unified interface for the journal page
 * 
 * @returns {Object} Journal app state and handlers
 * @returns {number} currentYear - Current year being displayed
 * @returns {Record<string, JournalEntry>} entries - All journal entries
 * @returns {boolean} isEditorOpen - Whether the editor modal is open
 * @returns {boolean} isSettingsOpen - Whether the settings modal is open
 * @returns {boolean} isShortcutsOpen - Whether the shortcuts modal is open
 * @returns {boolean} directoryDeleted - Whether the file system directory was deleted
 * @returns {number|null} selectedDayIndex - Currently selected day index
 * @returns {Function} handleDayClick - Handler for clicking on a day
 * @returns {Function} handleSave - Handler for saving an entry
 * @returns {Function} handleOpenSettings - Handler for opening settings
 * @returns {Function} migrateToFileSystem - Handler for migrating to file system storage
 * @returns {Function} handleSelectNewDirectory - Handler for selecting a new directory
 * @returns {Function} handleUseLocalStorage - Handler for switching to localStorage
 * @returns {string} initialText - Initial text for the editor
 * @returns {string} editorDate - Formatted date for the editor
 * @returns {string|null} entryDate - Date of the current entry
 */
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

  const [isSelectingNewDirectory, setIsSelectingNewDirectory] = useState(false);

  const {
    isEditorOpen,
    isSettingsOpen,
    isShortcutsOpen,
    directoryDeleted,
    openEditor: openEditorModal,
    closeEditor: closeEditorModal,
    openSettings,
    closeSettings,
    openShortcuts,
    closeShortcuts,
    setDirectoryDeleted,
    closeAll: closeAllModals,
  } = useModalState();

  // Memoize onDirectoryDeleted to prevent unnecessary re-execution of useEffect in useJournalEntries
  const handleDirectoryDeleted = useCallback(() => {
    setDirectoryDeleted(true);
  }, [setDirectoryDeleted]);

  const { entries, saveEntry, getEntry, storageMode, migrateToFileSystem } = useJournalEntries({
    onDirectoryDeleted: handleDirectoryDeleted,
  });

  const { isInitialized, isSupported, needsSetup, setupFileSystem, clearDirectoryAndUseLocalStorage } =
    useFileSystemStorage();

  const {
    selectedDay,
    openEditor: openEditorForDay,
    closeEditor: closeEditorState,
    getInitialText,
    getEntryDate,
    getEditorDate,
    getDayKey,
  } = useEditorState(currentYear, getEntry);

  const handleDayClick = useCallback(
    (dayIndex: number) => {
      openEditorForDay(dayIndex);
      openEditorModal();
    },
    [openEditorForDay, openEditorModal]
  );

  // Memoize onEnter callback to prevent unnecessary re-renders in useDayNavigation
  const handleDayNavigationEnter = useCallback(
    (dayIndex: number) => {
      handleDayClick(dayIndex);
    },
    [handleDayClick]
  );

  // Day navigation - only enabled when no modals are open
  const isNavigationEnabled = !isEditorOpen && !isSettingsOpen && !isShortcutsOpen;
  const { selectedDayIndex, setSelectedDayIndex } = useDayNavigation({
    year: currentYear,
    enabled: isNavigationEnabled,
    onEnter: handleDayNavigationEnter,
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
      const key = getDayKey();
      if (!key) return;
      await saveEntry(key, memory);
    },
    [getDayKey, saveEntry]
  );

  const handleCloseEditor = useCallback(() => {
    closeEditorModal();
    closeEditorState();
  }, [closeEditorModal, closeEditorState]);

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
      onCloseModal: closeAllModals,
      onShowShortcuts: openShortcuts,
      onOpenSettings: openSettings,
    },
  });

  const handleSelectNewDirectory = useCallback(async () => {
    setIsSelectingNewDirectory(true);
    try {
      const result = await setupFileSystem();
      if (result.success) {
        setDirectoryDeleted(false);
        // Reload entries from new directory
        window.location.reload();
      }
    } catch (error) {
      logger.error("Failed to select new directory", error);
    } finally {
      setIsSelectingNewDirectory(false);
    }
  }, [setupFileSystem]);

  const handleUseLocalStorage = useCallback(async () => {
    await clearDirectoryAndUseLocalStorage();
    setDirectoryDeleted(false);
    // Reload to refresh state
    window.location.reload();
  }, [clearDirectoryAndUseLocalStorage, setDirectoryDeleted]);

  // Memoize editor data to prevent unnecessary recalculations
  const initialText = useMemo(() => getInitialText(), [getInitialText]);
  const editorDate = useMemo(() => getEditorDate(), [getEditorDate]);
  const entryDate = useMemo(() => getEntryDate(), [getEntryDate]);

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
    directoryDeleted,

    // Navigation
    selectedDayIndex,

    // Handlers
    handleDayClick: handleDayClickWithNavigation,
    handleSave,
    handleOpenSettings: openSettings,
    handleSetupFileSystem: async () => {
      await setupFileSystem();
    },
    migrateToFileSystem,
    handleSelectNewDirectory,
    handleUseLocalStorage,
    isSelectingNewDirectory,

    // Editor data
    initialText,
    editorDate,
    entryDate,

    // Modal close handlers
    handleCloseEditor,
    handleCloseSettings: closeSettings,
    handleCloseShortcuts: closeShortcuts,
  };
}
