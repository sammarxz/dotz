import { StorageAdapter, StorageMode } from "../types/storage.types";
import { LocalStorageAdapter } from "./adapters/local-storage-adapter";
import { FileSystemAdapter } from "./adapters/file-system-adapter";
import { logger } from "../utils/logger";
import { ERROR_CODES } from "../constants/error-codes";

/**
 * Factory for creating and managing storage adapters
 * Handles the selection and switching between different storage backends
 */
export class StorageFactory {
  private static localStorageAdapter: LocalStorageAdapter | null = null;
  private static fileSystemAdapter: FileSystemAdapter | null = null;

  /**
   * Get the localStorage adapter (singleton)
   */
  static getLocalStorageAdapter(): LocalStorageAdapter {
    if (!this.localStorageAdapter) {
      this.localStorageAdapter = new LocalStorageAdapter();
    }
    return this.localStorageAdapter;
  }

  /**
   * Get the file system adapter (singleton)
   */
  static getFileSystemAdapter(): FileSystemAdapter {
    if (!this.fileSystemAdapter) {
      this.fileSystemAdapter = new FileSystemAdapter();
    }
    return this.fileSystemAdapter;
  }

  /**
   * Get the appropriate storage adapter based on mode
   */
  static getAdapter(mode: StorageMode): StorageAdapter {
    if (mode === "fileSystem") {
      return this.getFileSystemAdapter();
    }
    return this.getLocalStorageAdapter();
  }

  /**
   * Initialize storage and determine the best available mode
   * Tries file system first, falls back to localStorage
   */
  static async initializeStorage(): Promise<{
    adapter: StorageAdapter;
    mode: StorageMode;
    directoryDeleted?: boolean;
  }> {
    const fileSystemAdapter = this.getFileSystemAdapter();

    // Try to restore file system if supported
    if (fileSystemAdapter.isSupported()) {
      try {
        const hasDirectory = await fileSystemAdapter.restoreDirectory();
        if (hasDirectory) {
          // Check if directory is still accessible
          const isAccessible = await fileSystemAdapter.checkDirectoryAccess();
          if (!isAccessible) {
            // Directory was deleted
            logger.warn("File system directory was deleted, falling back to localStorage");
            return {
              adapter: this.getLocalStorageAdapter(),
              mode: "localStorage",
              directoryDeleted: true,
            };
          }

          // Migrate from individual files if needed
          await fileSystemAdapter.migrateFromIndividualFiles();

          return {
            adapter: fileSystemAdapter,
            mode: "fileSystem",
          };
        }
      } catch (error) {
        logger.error("Failed to initialize file system storage", error);
        // Fallback to localStorage
      }
    }

    // Default to localStorage
    return {
      adapter: this.getLocalStorageAdapter(),
      mode: "localStorage",
    };
  }

  /**
   * Migrate entries from one adapter to another
   */
  static async migrateEntries(
    fromAdapter: StorageAdapter,
    toAdapter: StorageAdapter
  ): Promise<void> {
    try {
      const entries = await fromAdapter.getAllEntriesForMigration();
      
      for (const [key, entry] of Object.entries(entries)) {
        await toAdapter.saveEntry(key, entry);
      }

      // Clear source after successful migration
      await fromAdapter.clearAll();
      
      logger.info(`Migrated ${Object.keys(entries).length} entries between storage adapters`);
    } catch (error) {
      logger.error("Failed to migrate entries", error);
      throw error;
    }
  }

  /**
   * Handle directory deleted error and fallback to localStorage
   */
  static isDirectoryDeletedError(error: unknown): boolean {
    return (
      error instanceof Error && error.message === ERROR_CODES.DIRECTORY_DELETED
    );
  }
}
