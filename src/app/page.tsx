"use client";

import { useState } from "react";

import { JournalInfo } from "@/components/journal/JournalInfo";
import { DayGrid } from "@/components/journal/DayGrid";
import { JournalEditor } from "@/components/editor/JournalEditor";
import { SettingsPage } from "@/components/settings/SettingsPage";
import { ShortcutsModal } from "@/components/shortcuts/ShortcutsModal";
import { SettingsButton } from "@/components/settings/SettingsButton";
import { FileSystemSetup } from "@/components/storage/FileSystemSetup";

import { useJournalEntries } from "@/hooks/useJournalEntries";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useFileSystemStorage } from "@/hooks/useFileSystemStorage";

import { CalendarUtils } from "@/lib/date/calendar-utils";

export default function JournalPage() {
  const currentYear = new Date().getFullYear();
  const { entries, saveEntry, getEntry } = useJournalEntries();
  const {
    isInitialized,
    isSupported,
    needsSetup,
    setupFileSystem,
  } = useFileSystemStorage();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  const handleDayClick = (dayIndex: number) => {
    if (CalendarUtils.isFutureDay(currentYear, dayIndex)) return;
    setSelectedDay(dayIndex);
    setIsEditorOpen(true);
  };

  const handleSave = async (memory: string) => {
    if (selectedDay === null) return;
    const key = CalendarUtils.getDayKey(currentYear, selectedDay);
    await saveEntry(key, memory);
  };

  const getInitialText = () => {
    if (selectedDay === null) return "";
    const key = CalendarUtils.getDayKey(currentYear, selectedDay);
    return getEntry(key)?.memory || "";
  };

  const handleSetupFileSystem = async () => {
    await setupFileSystem();
  };

  const getEntryDate = (): string | null => {
    if (selectedDay === null) return null;
    const key = CalendarUtils.getDayKey(currentYear, selectedDay);
    return getEntry(key)?.date ?? null;
  };

  // Atalhos do teclado
  useKeyboardShortcuts({
    enabled: true,
    handlers: {
      onNewNote: () => {
        const today = CalendarUtils.getTodayIndex(currentYear);
        if (!CalendarUtils.isFutureDay(currentYear, today)) {
          handleDayClick(today);
        }
      },
      onCloseModal: () => {
        if (isEditorOpen) setIsEditorOpen(false);
        else if (isSettingsOpen) setIsSettingsOpen(false);
        else if (isShortcutsOpen) setIsShortcutsOpen(false);
      },
      onShowShortcuts: () => {
        setIsShortcutsOpen(true);
      },
      onOpenSettings: () => {
        setIsSettingsOpen(true);
      },
    },
  });

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <SettingsButton onClick={() => setIsSettingsOpen(true)} />

      <div className="flex-1 flex items-center justify-center px-8 py-16">
        <div className="w-full max-w-4xl space-y-8">
          <DayGrid
            year={currentYear}
            entries={entries}
            onDayClick={handleDayClick}
          />
          <JournalInfo
            year={currentYear}
            daysLeft={CalendarUtils.getDaysLeftInYear(currentYear)}
          />
        </div>
      </div>

      <JournalEditor
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        initialText={getInitialText()}
        date={
          selectedDay !== null
            ? CalendarUtils.formatDate(
                CalendarUtils.getDayOfYear(currentYear, selectedDay)
              )
            : ""
        }
        onSave={handleSave}
        entryDate={getEntryDate()}
      />

      <SettingsPage
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      <FileSystemSetup
        isOpen={isInitialized && needsSetup}
        onSetup={handleSetupFileSystem}
        isSupported={isSupported}
      />
    </main>
  );
}
