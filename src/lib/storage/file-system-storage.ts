import { JournalEntry } from "../types";

/// <reference path="./file-system-types.d.ts" />

interface DirectoryHandleRecord {
  id: string;
  handle: FileSystemDirectoryHandle;
}

interface JournalData {
  entries: Record<string, JournalEntry>;
}

export class FileSystemStorage {
  private static directoryHandle: FileSystemDirectoryHandle | null = null;
  private static readonly JOURNAL_FILE_NAME = "journal.json";

  static isSupported(): boolean {
    return "showDirectoryPicker" in window;
  }

  static async requestDirectory(): Promise<boolean> {
    if (!this.isSupported()) {
      throw new Error("File System Access API not supported");
    }

    try {
      this.directoryHandle = await window.showDirectoryPicker({
        mode: "readwrite",
        startIn: "documents",
      });

      await this.persistDirectoryHandle();

      return true;
    } catch (error) {
      console.error("User cancelled directory selection", error);
      return false;
    }
  }

  static async restoreDirectory(): Promise<boolean> {
    const savedHandle = localStorage.getItem("fs-directory-handle");
    if (!savedHandle) return false;

    try {
      const db = await this.openDB();
      const tx = db.transaction("handles", "readonly");
      const store = tx.objectStore("handles");
      const result = await new Promise<DirectoryHandleRecord | undefined>(
        (resolve, reject) => {
          const request = store.get("directory");
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
          console.error("Permission revoked, need to request again", error);
          this.directoryHandle = null;
          return false;
        }
      }
    } catch (error) {
      console.error("Failed to restore directory", error);
    }

    return false;
  }

  private static async persistDirectoryHandle(): Promise<void> {
    if (!this.directoryHandle) return;

    const db = await this.openDB();
    const tx = db.transaction("handles", "readwrite");
    const store = tx.objectStore("handles");
    await store.put({ id: "directory", handle: this.directoryHandle });

    localStorage.setItem("fs-directory-handle", "true");
  }

  private static openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("JournalFS", 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains("handles")) {
          db.createObjectStore("handles", { keyPath: "id" });
        }
      };
    });
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
      // File doesn't exist yet, return empty structure
      return { entries: {} };
    }
  }

  private static async writeJournalFile(data: JournalData): Promise<void> {
    if (!this.directoryHandle) {
      throw new Error("No directory selected");
    }

    const fileHandle = await this.directoryHandle.getFileHandle(
      this.JOURNAL_FILE_NAME,
      { create: true }
    );

    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(data, null, 2));
    await writable.close();
  }

  static async saveEntry(key: string, entry: JournalEntry): Promise<void> {
    if (!this.directoryHandle) {
      throw new Error("No directory selected");
    }

    const data = await this.readJournalFile();
    data.entries[key] = entry;
    await this.writeJournalFile(data);
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
      console.error("Failed to read entries", error);
      return {};
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
      console.error("Failed to delete entry", error);
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
            console.error(`Failed to read entry from ${name}`, error);
          }
        }
      }

      // If we found old files, create the new journal.json and remove old files
      if (hasOldFiles && Object.keys(entries).length > 0) {
        const data: JournalData = { entries };
        await this.writeJournalFile(data);

        // Remove old individual files
        for (const key of Object.keys(entries)) {
          try {
            const fileName = `${key}.json`;
            await this.directoryHandle.removeEntry(fileName);
          } catch (error) {
            console.error(`Failed to remove old file ${fileName}`, error);
          }
        }

        console.log(`Migrated ${Object.keys(entries).length} entries to journal.json`);
      }
    } catch (error) {
      console.error("Failed to migrate from individual files", error);
    }
  }

  static getDirectoryPath(): string {
    return this.directoryHandle?.name || "No directory selected";
  }
}
