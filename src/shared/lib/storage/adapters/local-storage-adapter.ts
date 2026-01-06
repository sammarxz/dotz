import { StorageAdapter, JournalData } from "../../types/storage.types";
import { JournalEntry } from "../../types";
import { STORAGE_KEYS } from "../../constants/storage-constants";
import { logger } from "../../utils/logger";

/**
 * LocalStorage adapter implementation
 * Stores journal entries in browser's localStorage
 */
export class LocalStorageAdapter implements StorageAdapter {
  isSupported(): boolean {
    return typeof window !== "undefined" && "localStorage" in window;
  }

  async saveEntry(key: string, entry: JournalEntry): Promise<void> {
    const data = this.readJournalData();
    data.entries[key] = entry;
    this.writeJournalData(data);
  }

  async getEntry(key: string): Promise<JournalEntry | null> {
    const data = this.readJournalData();
    return data.entries[key] || null;
  }

  async getAllEntries(): Promise<Record<string, JournalEntry>> {
    const data = this.readJournalData();
    return data.entries;
  }

  async deleteEntry(key: string): Promise<void> {
    const data = this.readJournalData();
    delete data.entries[key];
    this.writeJournalData(data);
  }

  async getAllEntriesForMigration(): Promise<Record<string, JournalEntry>> {
    return this.getAllEntries();
  }

  async clearAll(): Promise<void> {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEYS.JOURNAL_ENTRIES);
  }

  private readJournalData(): JournalData {
    if (typeof window === "undefined") {
      return { entries: {} };
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.JOURNAL_ENTRIES);
      if (!stored) {
        return { entries: {} };
      }

      const data: JournalData = JSON.parse(stored);
      // Ensure entries object exists
      if (!data.entries) {
        data.entries = {};
      }

      return data;
    } catch (error) {
      logger.error("Failed to read from localStorage", error);
      return { entries: {} };
    }
  }

  private writeJournalData(data: JournalData): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(STORAGE_KEYS.JOURNAL_ENTRIES, JSON.stringify(data));
    } catch (error) {
      logger.error("Failed to write to localStorage", error);
    }
  }
}
