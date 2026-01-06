import { StorageAdapter, JournalData } from "../../types/storage.types";
import { JournalEntry } from "../../types";
import { ERROR_CODES } from "../../constants/error-codes";
import { STORAGE_CONFIG, STORAGE_KEYS } from "../../constants/storage-constants";
import { logger } from "../../utils/logger";
import { FileSystemStorage } from "../file-system-storage";

/// <reference path="../file-system-types.d.ts" />

/**
 * FileSystem adapter implementation
 * Stores journal entries using the File System Access API
 */
export class FileSystemAdapter implements StorageAdapter {
  isSupported(): boolean {
    return FileSystemStorage.isSupported();
  }

  async saveEntry(key: string, entry: JournalEntry): Promise<void> {
    await FileSystemStorage.saveEntry(key, entry);
  }

  async getEntry(key: string): Promise<JournalEntry | null> {
    return await FileSystemStorage.getEntry(key);
  }

  async getAllEntries(): Promise<Record<string, JournalEntry>> {
    return await FileSystemStorage.getAllEntries();
  }

  async deleteEntry(key: string): Promise<void> {
    await FileSystemStorage.deleteEntry(key);
  }

  async getAllEntriesForMigration(): Promise<Record<string, JournalEntry>> {
    return await FileSystemStorage.getAllEntries();
  }

  async clearAll(): Promise<void> {
    await FileSystemStorage.clearDirectoryHandle();
  }

  /**
   * Request directory access (FileSystem-specific)
   */
  async requestDirectory(): Promise<{ success: boolean; cancelled?: boolean }> {
    return await FileSystemStorage.requestDirectory();
  }

  /**
   * Restore previously selected directory (FileSystem-specific)
   */
  async restoreDirectory(): Promise<boolean> {
    return await FileSystemStorage.restoreDirectory();
  }

  /**
   * Check if directory is still accessible (FileSystem-specific)
   */
  async checkDirectoryAccess(): Promise<boolean> {
    return await FileSystemStorage.checkDirectoryAccess();
  }

  /**
   * Migrate from individual files to journal.json (FileSystem-specific)
   */
  async migrateFromIndividualFiles(): Promise<void> {
    return await FileSystemStorage.migrateFromIndividualFiles();
  }

  /**
   * Get current directory path (FileSystem-specific)
   */
  getDirectoryPath(): string {
    return FileSystemStorage.getDirectoryPath();
  }
}
