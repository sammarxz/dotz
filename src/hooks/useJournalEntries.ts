import { useState, useEffect, useCallback } from "react";

import { JournalStorage } from "@/lib/storage/journal-storage";
import { JournalEntry } from "@/lib/types";

export function useJournalEntries() {
  const [entries, setEntries] = useState<Record<string, JournalEntry>>({});

  useEffect(() => {
    setEntries(JournalStorage.getEntries());
  }, []);

  const saveEntry = useCallback((key: string, memory: string) => {
    if (memory.trim() === "") {
      JournalStorage.deleteEntry(key);
      setEntries((prev) => {
        const newEntries = { ...prev };
        delete newEntries[key];
        return newEntries;
      });
    } else {
      const entry: JournalEntry = {
        date: new Date().toISOString(),
        memory,
      };
      JournalStorage.saveEntry(key, entry);
      setEntries((prev) => ({ ...prev, [key]: entry }));
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
