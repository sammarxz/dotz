import { JournalEntry } from "../types";
import { ERROR_CODES } from "../constants/error-codes";
import { STORAGE_KEYS, STORAGE_CONFIG, STORAGE_MESSAGES } from "../constants/storage-constants";
import { FILE_SYSTEM } from "../constants/app-constants";
import { logger } from "../utils/logger";

/// <reference path="file-system-types.d.ts" />

interface DirectoryHandleRecord {
  id: string;
  handle: FileSystemDirectoryHandle;
}

interface JournalData {
  entries: Record<string, JournalEntry>;
}

/**
 * File System Storage implementation
 * Manages journal entries using the File System Access API
 * Handles directory selection, persistence, and file operations
 */
export class FileSystemStorage {
  private static directoryHandle: FileSystemDirectoryHandle | null = null;
  private static readonly JOURNAL_FILE_NAME = STORAGE_CONFIG.JOURNAL_FILE_NAME;

  static isSupported(): boolean {
    return "showDirectoryPicker" in window;
  }

  static async requestDirectory(): Promise<{ success: boolean; cancelled?: boolean }> {
    if (!this.isSupported()) {
      throw new Error("File System Access API not supported");
    }

    try {
      this.directoryHandle = await window.showDirectoryPicker({
        mode: FILE_SYSTEM.DIRECTORY_PICKER_MODE,
        startIn: FILE_SYSTEM.DIRECTORY_PICKER_START_IN,
      });

      await this.persistDirectoryHandle();

      return { success: true };
    } catch (error) {
      // Check if user cancelled the operation
      if (error instanceof DOMException && error.name === "AbortError") {
        // User cancelled - this is not an error, just return cancelled flag
        return { success: false, cancelled: true };
      }
      // Other errors
      logger.error("Failed to request directory", error);
      return { success: false, cancelled: false };
    }
  }

  static async restoreDirectory(): Promise<boolean> {
    const savedHandle = localStorage.getItem(STORAGE_KEYS.FS_DIRECTORY_HANDLE);
    if (!savedHandle) return false;

    try {
      const db = await this.openDB();
      const tx = db.transaction(STORAGE_CONFIG.OBJECT_STORE_NAME, "readonly");
      const store = tx.objectStore(STORAGE_CONFIG.OBJECT_STORE_NAME);
      const result = await new Promise<DirectoryHandleRecord | undefined>(
        (resolve, reject) => {
          const request = store.get(STORAGE_CONFIG.DIRECTORY_HANDLE_ID);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        }
      );

      if (result?.handle) {
        this.directoryHandle = result.handle;

        try {
          const iterator = this.directoryHandle.keys();
          await iterator.next();
          return true;
        } catch (error) {
          logger.error("Permission revoked, need to request again", error);
          this.directoryHandle = null;
          return false;
        }
      }
    } catch (error) {
      logger.error("Failed to restore directory", error);
    }

    return false;
  }

  private static async persistDirectoryHandle(): Promise<void> {
    if (!this.directoryHandle) return;

    const db = await this.openDB();
    const tx = db.transaction(STORAGE_CONFIG.OBJECT_STORE_NAME, "readwrite");
    const store = tx.objectStore(STORAGE_CONFIG.OBJECT_STORE_NAME);
    await store.put({ id: STORAGE_CONFIG.DIRECTORY_HANDLE_ID, handle: this.directoryHandle });

    localStorage.setItem(STORAGE_KEYS.FS_DIRECTORY_HANDLE, "true");
  }

  private static openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(STORAGE_CONFIG.INDEXED_DB_NAME, STORAGE_CONFIG.INDEXED_DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORAGE_CONFIG.OBJECT_STORE_NAME)) {
          db.createObjectStore(STORAGE_CONFIG.OBJECT_STORE_NAME, { keyPath: "id" });
        }
      };
    });
  }

  private static isDirectoryDeletedError(error: unknown): boolean {
    if (error instanceof DOMException) {
      // Check for common errors that indicate directory was deleted
      return (
        error.name === "NotFoundError" ||
        error.name === "InvalidStateError" ||
        error.message.includes("directory") ||
        error.message.includes("not found")
      );
    }
    return false;
  }

  static async checkDirectoryAccess(): Promise<boolean> {
    if (!this.directoryHandle) {
      return false;
    }

    try {
      // Try to access the directory
      const iterator = this.directoryHandle.keys();
      await iterator.next();
      return true;
    } catch (error) {
      // Directory was deleted or permission revoked
      if (this.isDirectoryDeletedError(error)) {
        // Clear the directory handle
        this.directoryHandle = null;
        // Clear from IndexedDB
        try {
          const db = await this.openDB();
          const tx = db.transaction(STORAGE_CONFIG.OBJECT_STORE_NAME, "readwrite");
          const store = tx.objectStore(STORAGE_CONFIG.OBJECT_STORE_NAME);
          await store.delete(STORAGE_CONFIG.DIRECTORY_HANDLE_ID);
        } catch {
          // Ignore errors clearing IndexedDB
        }
        localStorage.removeItem(STORAGE_KEYS.FS_DIRECTORY_HANDLE);
        return false;
      }
      return false;
    }
  }

  private static async readJournalFile(): Promise<JournalData> {
    if (!this.directoryHandle) {
      throw new Error("No directory selected");
    }

    try {
      const fileHandle = await this.directoryHandle.getFileHandle(
        this.JOURNAL_FILE_NAME
      );
      const file = await fileHandle.getFile();
      const text = await file.text();
      const data: JournalData = JSON.parse(text);
      
      // Ensure entries object exists
      if (!data.entries) {
        data.entries = {};
      }
      
      return data;
    } catch (error) {
      // If file doesn't exist (NotFoundError), that's normal for a new directory
      // Only treat as directory deleted if it's an InvalidStateError or other directory-level error
      if (error instanceof DOMException) {
        if (error.name === "NotFoundError") {
          // File doesn't exist yet - this is normal, not an error
          return { entries: {} };
        }
        // Check if it's a directory-level error (not just file not found)
        if (error.name === "InvalidStateError" || error.name === "SecurityError") {
          // Directory was deleted or permission revoked
          this.directoryHandle = null;
          throw new Error(ERROR_CODES.DIRECTORY_DELETED);
        }
      }
      // For any other error, assume file doesn't exist yet
      return { entries: {} };
    }
  }

  private static async writeJournalFile(data: JournalData): Promise<void> {
    if (!this.directoryHandle) {
      throw new Error("No directory selected");
    }

    try {
      const fileHandle = await this.directoryHandle.getFileHandle(
        this.JOURNAL_FILE_NAME,
        { create: true }
      );

      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(data, null, 2));
      await writable.close();
    } catch (error) {
      // Check if directory was deleted (InvalidStateError or SecurityError)
      if (error instanceof DOMException) {
        if (error.name === "InvalidStateError" || error.name === "SecurityError") {
          // Directory was deleted or permission revoked
          this.directoryHandle = null;
          throw new Error(ERROR_CODES.DIRECTORY_DELETED);
        }
      }
      throw error;
    }
  }

  static async saveEntry(key: string, entry: JournalEntry): Promise<void> {
    if (!this.directoryHandle) {
      throw new Error("No directory selected");
    }

    try {
      const data = await this.readJournalFile();
      data.entries[key] = entry;
      await this.writeJournalFile(data);
    } catch (error) {
      if (error instanceof Error && error.message === ERROR_CODES.DIRECTORY_DELETED) {
        throw error;
      }
      throw error;
    }
  }

  static async getEntry(key: string): Promise<JournalEntry | null> {
    if (!this.directoryHandle) {
      throw new Error("No directory selected");
    }

    try {
      const data = await this.readJournalFile();
      return data.entries[key] || null;
    } catch (error) {
      return null;
    }
  }

  static async getAllEntries(): Promise<Record<string, JournalEntry>> {
    if (!this.directoryHandle) {
      throw new Error("No directory selected");
    }

    try {
      const data = await this.readJournalFile();
      return data.entries;
    } catch (error) {
      if (error instanceof Error && error.message === ERROR_CODES.DIRECTORY_DELETED) {
        throw error;
      }
      logger.error("Failed to read entries", error);
      return {};
    }
  }

  static async clearDirectoryHandle(): Promise<void> {
    this.directoryHandle = null;
    localStorage.removeItem(STORAGE_KEYS.FS_DIRECTORY_HANDLE);
    // Clear from IndexedDB
    try {
      const db = await this.openDB();
      const tx = db.transaction(STORAGE_CONFIG.OBJECT_STORE_NAME, "readwrite");
      const store = tx.objectStore(STORAGE_CONFIG.OBJECT_STORE_NAME);
      await store.delete(STORAGE_CONFIG.DIRECTORY_HANDLE_ID);
    } catch (error) {
      logger.error("Failed to clear directory from IndexedDB", error);
    }
  }

  static async deleteEntry(key: string): Promise<void> {
    if (!this.directoryHandle) {
      throw new Error("No directory selected");
    }

    try {
      const data = await this.readJournalFile();
      delete data.entries[key];
      await this.writeJournalFile(data);
    } catch (error) {
      logger.error("Failed to delete entry", error);
    }
  }

  /**
   * Migrates existing individual JSON files to the single journal.json file
   * This should be called once during initialization if old format files exist
   */
  static async migrateFromIndividualFiles(): Promise<void> {
    if (!this.directoryHandle) {
      throw new Error("No directory selected");
    }

    try {
      // Check if journal.json already exists - if so, migration already done
      try {
        await this.directoryHandle.getFileHandle(this.JOURNAL_FILE_NAME);
        // File exists, migration not needed
        return;
      } catch {
        // File doesn't exist, proceed with migration
      }

      const entries: Record<string, JournalEntry> = {};
      let hasOldFiles = false;

      // Read all individual JSON files
      for await (const [name, handle] of this.directoryHandle.entries()) {
        if (handle.kind === "file" && name.endsWith(".json") && name !== this.JOURNAL_FILE_NAME) {
          hasOldFiles = true;
          try {
            const key = name.replace(".json", "");
            const fileHandle = handle as FileSystemFileHandle;
            const file = await fileHandle.getFile();
            const text = await file.text();
            entries[key] = JSON.parse(text);
          } catch (error) {
            logger.error(`Failed to read entry from ${name}`, error);
          }
        }
      }

      // If we found old files, create the new journal.json and remove old files
      if (hasOldFiles && Object.keys(entries).length > 0) {
        const data: JournalData = { entries };
        await this.writeJournalFile(data);

        // Remove old individual files
        for (const key of Object.keys(entries)) {
          const fileName = `${key}.json`;
          try {
            await this.directoryHandle.removeEntry(fileName);
          } catch (error) {
            logger.error(`Failed to remove old file ${fileName}`, error);
          }
        }

        logger.info(`Migrated ${Object.keys(entries).length} entries to journal.json`);
      }
    } catch (error) {
      logger.error("Failed to migrate from individual files", error);
    }
  }

  static getDirectoryPath(): string {
    return this.directoryHandle?.name || STORAGE_MESSAGES.NO_DIRECTORY_SELECTED;
  }
}
