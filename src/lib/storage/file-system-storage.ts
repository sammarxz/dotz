import { JournalEntry } from "../types";

/// <reference path="./file-system-types.d.ts" />

interface DirectoryHandleRecord {
  id: string;
  handle: FileSystemDirectoryHandle;
}

export class FileSystemStorage {
  private static directoryHandle: FileSystemDirectoryHandle | null = null;
  private static readonly JOURNAL_FOLDER = "journal-data";

  /**
   * Verifica se o File System Access API está disponível
   */
  static isSupported(): boolean {
    return "showDirectoryPicker" in window;
  }

  /**
   * Solicita permissão ao usuário para escolher uma pasta
   */
  static async requestDirectory(): Promise<boolean> {
    if (!this.isSupported()) {
      throw new Error("File System Access API not supported");
    }

    try {
      // Usuário escolhe a pasta
      this.directoryHandle = await window.showDirectoryPicker({
        mode: "readwrite",
        startIn: "documents",
      });

      // Salva referência para próximas sessões
      await this.persistDirectoryHandle();

      return true;
    } catch (error) {
      console.error("User cancelled directory selection", error);
      return false;
    }
  }

  /**
   * Tenta restaurar acesso à pasta anterior
   */
  static async restoreDirectory(): Promise<boolean> {
    const savedHandle = localStorage.getItem("fs-directory-handle");
    if (!savedHandle) return false;

    try {
      // IndexedDB para persistir handles
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
        // Tenta acessar o diretório para verificar se ainda temos permissão
        // A permissão é persistida automaticamente, mas pode ser revogada
        // Verificamos tentando acessar o diretório
        try {
          // Tenta listar as entradas para verificar se temos acesso
          const iterator = this.directoryHandle.keys();
          await iterator.next();
          return true;
        } catch (error) {
          // Permissão foi revogada, precisa pedir novamente
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

  /**
   * Persiste o handle da pasta para próximas sessões
   */
  private static async persistDirectoryHandle(): Promise<void> {
    if (!this.directoryHandle) return;

    const db = await this.openDB();
    const tx = db.transaction("handles", "readwrite");
    const store = tx.objectStore("handles");
    await store.put({ id: "directory", handle: this.directoryHandle });
    
    localStorage.setItem("fs-directory-handle", "true");
  }

  /**
   * Abre/cria banco IndexedDB para persistir handles
   */
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

  /**
   * Salva uma entrada no arquivo local
   */
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

  /**
   * Lê uma entrada do arquivo local
   */
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
      // Arquivo não existe
      return null;
    }
  }

  /**
   * Lista todas as entradas
   */
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

  /**
   * Deleta uma entrada
   */
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

  /**
   * Retorna caminho da pasta (para mostrar ao usuário)
   */
  static getDirectoryPath(): string {
    return this.directoryHandle?.name || "No directory selected";
  }
}
