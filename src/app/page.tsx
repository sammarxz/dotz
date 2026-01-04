"use client";

import { useState } from "react";

import { JournalInfo } from "@/components/journal/JournalInfo";
import { DayGrid } from "@/components/journal/DayGrid";
import { JournalEditor } from "@/components/editor/JournalEditor";
import { TemplateSettings } from "@/components/settings/TemplateSettings";
import { ShortcutsModal } from "@/components/shortcuts/ShortcutsModal";

import { useJournalEntries } from "@/hooks/useJournalEntries";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

import { CalendarUtils } from "@/lib/date/calendar-utils";
import { JournalStorage } from "@/lib/storage/journal-storage";

export default function JournalPage() {
  const currentYear = new Date().getFullYear();
  const { entries, saveEntry, getEntry } = useJournalEntries();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  const handleDayClick = (dayIndex: number) => {
    if (CalendarUtils.isFutureDay(currentYear, dayIndex)) return;
    setSelectedDay(dayIndex);
    setIsEditorOpen(true);
  };

  const handleSave = (memory: string) => {
    if (selectedDay === null) return;
    const key = CalendarUtils.getDayKey(currentYear, selectedDay);
    saveEntry(key, memory);
  };

  const getInitialText = () => {
    if (selectedDay === null) return "";
    const key = CalendarUtils.getDayKey(currentYear, selectedDay);
    return getEntry(key)?.memory || JournalStorage.getTemplate();
  };

  const getEntryDate = (): string | null => {
    if (selectedDay === null) return null;
    const key = CalendarUtils.getDayKey(currentYear, selectedDay);
    return getEntry(key)?.date ?? null;
  };

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
      onOpenTemplates: () => {
        setIsSettingsOpen(true);
      },
    },
  });

  const noiseSvg =
    "data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E";

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col relative">
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

      <TemplateSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      <footer className="absolute text-sm inset-x-0 bottom-0 w-full flex items-center justify-between px-8 pb-8">
        <div className="text-zinc-500">
          365 Dots • By{" "}
          <a href="https://marxz.me" className="text-zinc-300">
            Sam Marxz
          </a>
        </div>
        <div className=" text-zinc-600 flex items-center gap-4">
          <span>
            Press <kbd className="px-1.5 py-0.5 bg-zinc-900 rounded">?</kbd> for
            shortcuts
          </span>
        </div>
      </footer>

      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: `url("${noiseSvg}")` }}
      />
    </main>
  );
}
