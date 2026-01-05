import { JournalEntry } from "../types";

/// <reference path="./file-system-types.d.ts" />

interface DirectoryHandleRecord {
  id: string;
  handle: FileSystemDirectoryHandle;
}

export class FileSystemStorage {
  private static directoryHandle: FileSystemDirectoryHandle | null = null;

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

  static async saveEntry(key: string, entry: JournalEntry): Promise<void> {
    if (!this.directoryHandle) {
      throw new Error("No directory selected");
    }

    const fileName = `${key}.json`;
    const fileHandle = await this.directoryHandle.getFileHandle(fileName, {
      create: true,
    });

    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(entry, null, 2));
    await writable.close();
  }

  static async getEntry(key: string): Promise<JournalEntry | null> {
    if (!this.directoryHandle) {
      throw new Error("No directory selected");
    }

    try {
      const fileName = `${key}.json`;
      const fileHandle = await this.directoryHandle.getFileHandle(fileName);
      const file = await fileHandle.getFile();
      const text = await file.text();
      return JSON.parse(text);
    } catch (error) {
      return null;
    }
  }

  static async getAllEntries(): Promise<Record<string, JournalEntry>> {
    if (!this.directoryHandle) {
      throw new Error("No directory selected");
    }

    const entries: Record<string, JournalEntry> = {};

    try {
      for await (const [name, handle] of this.directoryHandle.entries()) {
        if (handle.kind === "file" && name.endsWith(".json")) {
          const key = name.replace(".json", "");
          const fileHandle = handle as FileSystemFileHandle;
          const file = await fileHandle.getFile();
          const text = await file.text();
          entries[key] = JSON.parse(text);
        }
      }
    } catch (error) {
      console.error("Failed to read entries", error);
    }

    return entries;
  }

  static async deleteEntry(key: string): Promise<void> {
    if (!this.directoryHandle) {
      throw new Error("No directory selected");
    }

    try {
      const fileName = `${key}.json`;
      await this.directoryHandle.removeEntry(fileName);
    } catch (error) {
      console.error("Failed to delete entry", error);
    }
  }

  static getDirectoryPath(): string {
    return this.directoryHandle?.name || "No directory selected";
  }
}
