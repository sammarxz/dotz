import { useState, useEffect, useCallback } from "react";

import { FileSystemStorage } from "@/lib/storage/file-system-storage";
import { LocalStorageManager } from "@/lib/storage/local-storage-manager";
import { JournalEntry } from "@/lib/types";

export function useJournalEntries() {
  // Initialize with empty state to avoid hydration mismatch
  // This ensures server and client render the same initial state
  const [entries, setEntries] = useState<Record<string, JournalEntry>>(() => {
    // Always return empty object on initial render (both server and client)
    return {};
  });
  const [storageMode, setStorageMode] = useState<"localStorage" | "fileSystem">("localStorage");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Mark as hydrated on client side only
    setIsHydrated(true);
    
    const loadEntries = async () => {
      try {
        // First, try to restore File System if it was previously set up
        if (FileSystemStorage.isSupported()) {
          const hasDirectory = await FileSystemStorage.restoreDirectory();
          if (hasDirectory) {
            // Migrate from individual files to single journal.json if needed
            await FileSystemStorage.migrateFromIndividualFiles();
            const allEntries = await FileSystemStorage.getAllEntries();
            setEntries(allEntries);
            setStorageMode("fileSystem");
            return;
          }
        }

        // Otherwise, use localStorage
        const allEntries = LocalStorageManager.getAllEntries();
        setEntries(allEntries);
        setStorageMode("localStorage");
      } catch (error) {
        console.error("Failed to load entries", error);
        // Fallback to localStorage
        const allEntries = LocalStorageManager.getAllEntries();
        setEntries(allEntries);
        setStorageMode("localStorage");
      }
    };

    loadEntries();
  }, []);

  const saveEntry = useCallback(async (key: string, memory: string) => {
    if (memory.trim() === "") {
      try {
        if (storageMode === "fileSystem") {
          await FileSystemStorage.deleteEntry(key);
        } else {
          LocalStorageManager.deleteEntry(key);
        }
        setEntries((prev) => {
          const newEntries = { ...prev };
          delete newEntries[key];
          return newEntries;
        });
      } catch (error) {
        console.error("Failed to delete entry", error);
      }
    } else {
      const entry: JournalEntry = {
        date: new Date().toISOString(),
        memory,
      };
      try {
        if (storageMode === "fileSystem") {
          await FileSystemStorage.saveEntry(key, entry);
        } else {
          LocalStorageManager.saveEntry(key, entry);
        }
        setEntries((prev) => ({ ...prev, [key]: entry }));
      } catch (error) {
        console.error("Failed to save entry", error);
      }
    }
  }, [storageMode]);

  const getEntry = useCallback(
    (key: string): JournalEntry | undefined => {
      return entries[key];
    },
    [entries]
  );

  const migrateToFileSystem = useCallback(async (): Promise<{ success: boolean; cancelled?: boolean }> => {
    if (!FileSystemStorage.isSupported()) {
      return { success: false };
    }

    try {
      const result = await FileSystemStorage.requestDirectory();
      if (result.success) {
        // Migrate all entries from localStorage to File System
        const allEntries = LocalStorageManager.getAllEntriesForMigration();
        
        for (const [key, entry] of Object.entries(allEntries)) {
          await FileSystemStorage.saveEntry(key, entry);
        }

        // Clear localStorage after successful migration
        LocalStorageManager.clearAll();

        // Migrate from individual files to single journal.json if needed
        await FileSystemStorage.migrateFromIndividualFiles();

        // Reload entries from File System
        const fileSystemEntries = await FileSystemStorage.getAllEntries();
        setEntries(fileSystemEntries);
        setStorageMode("fileSystem");
        
        return { success: true };
      }
      return result;
    } catch (error) {
      console.error("Failed to migrate to File System", error);
      return { success: false };
    }
  }, []);

  return { entries, saveEntry, getEntry, storageMode: isHydrated ? storageMode : "localStorage", migrateToFileSystem };
}
