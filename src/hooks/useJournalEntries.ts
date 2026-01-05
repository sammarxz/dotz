import { useState, useEffect, useCallback } from "react";

import { FileSystemStorage } from "@/lib/storage/file-system-storage";
import { JournalEntry } from "@/lib/types";

export function useJournalEntries() {
  const [entries, setEntries] = useState<Record<string, JournalEntry>>({});

  useEffect(() => {
    const loadEntries = async () => {
      try {
        if (FileSystemStorage.isSupported()) {
          // Check if directory is set up
          const hasDirectory = await FileSystemStorage.restoreDirectory();
          if (hasDirectory) {
            const allEntries = await FileSystemStorage.getAllEntries();
            setEntries(allEntries);
          }
        }
      } catch (error) {
        console.error("Failed to load entries", error);
      }
    };

    loadEntries();
  }, []);

  const saveEntry = useCallback(async (key: string, memory: string) => {
    if (!FileSystemStorage.isSupported()) {
      console.warn("FileSystem not supported, cannot save entry");
      return;
    }

    if (memory.trim() === "") {
      try {
        await FileSystemStorage.deleteEntry(key);
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
        await FileSystemStorage.saveEntry(key, entry);
        setEntries((prev) => ({ ...prev, [key]: entry }));
      } catch (error) {
        console.error("Failed to save entry", error);
      }
    }
  }, []);

  const getEntry = useCallback(
    (key: string): JournalEntry | undefined => {
      return entries[key];
    },
    [entries]
  );

  return { entries, saveEntry, getEntry };
}
