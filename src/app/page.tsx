"use client";

import { DayGrid } from "@/components/journal/DayGrid";
import { JournalEditor } from "@/components/editor/JournalEditor";
import { SettingsPage } from "@/components/settings/SettingsPage";
import { ShortcutsModal } from "@/components/shortcuts/ShortcutsModal";
import { DirectoryRecoveryModal } from "@/components/storage/DirectoryRecoveryModal";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

import { useJournalApp } from "@/hooks/useJournalApp";

export default function JournalPage() {
  const {
    currentYear,
    entries,
    isSupported,
    storageMode,
    isEditorOpen,
    isSettingsOpen,
    isShortcutsOpen,
    directoryDeleted,
    selectedDayIndex,
    handleDayClick,
    handleSave,
    handleOpenSettings,
    migrateToFileSystem,
    handleSelectNewDirectory,
    handleUseLocalStorage,
    isSelectingNewDirectory,
    initialText,
    editorDate,
    entryDate,
    handleCloseEditor,
    handleCloseSettings,
    handleCloseShortcuts,
  } = useJournalApp();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden p-4 sm:p-6 md:p-8 lg:p-12">
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      <Header onSettingsClick={handleOpenSettings} />

      <main className="flex-1 min-h-screen my-12 md:my-24 relative flex flex-col items-center justify-center z-10 ">
        <DayGrid
          year={currentYear}
          entries={entries}
          onDayClick={handleDayClick}
          selectedDayIndex={selectedDayIndex}
        />
      </main>

      <Footer />

      <JournalEditor
        isOpen={isEditorOpen}
        onClose={handleCloseEditor}
        initialText={initialText}
        date={editorDate}
        onSave={handleSave}
        entryDate={entryDate}
      />

      <SettingsPage
        isOpen={isSettingsOpen}
        onClose={handleCloseSettings}
        storageMode={storageMode}
        migrateToFileSystem={migrateToFileSystem}
        isSupported={isSupported}
      />

      <ShortcutsModal isOpen={isShortcutsOpen} onClose={handleCloseShortcuts} />

      <DirectoryRecoveryModal
        isOpen={directoryDeleted}
        onSelectNewDirectory={handleSelectNewDirectory}
        onUseLocalStorage={handleUseLocalStorage}
        isSelecting={isSelectingNewDirectory}
      />
    </div>
  );
}
