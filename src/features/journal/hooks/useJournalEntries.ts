import { useState, useEffect, useCallback } from "react";

import { JournalEntry, StorageMode } from "@/shared/lib/types";
import { ERROR_CODES } from "@/shared/lib/constants/error-codes";
import { logger } from "@/shared/lib/utils/logger";
import { StorageFactory } from "@/shared/lib/storage/storage-factory";
import { StorageAdapter } from "@/shared/lib/types/storage.types";

interface UseJournalEntriesOptions {
  onDirectoryDeleted?: () => void;
}

/**
 * Hook for managing journal entries
 * Handles loading, saving, and migrating entries between storage backends
 * 
 * @param {UseJournalEntriesOptions} [options] - Optional configuration
 * @param {Function} [options.onDirectoryDeleted] - Callback when directory is deleted
 * @returns {Object} Journal entries state and operations
 * @returns {Record<string, JournalEntry>} entries - All journal entries
 * @returns {Function} saveEntry - Save a journal entry
 * @returns {Function} getEntry - Get a specific journal entry
 * @returns {StorageMode} storageMode - Current storage mode
 * @returns {Function} migrateToFileSystem - Migrate entries to file system storage
 */
export function useJournalEntries(options?: UseJournalEntriesOptions) {
  const { onDirectoryDeleted } = options || {};
  // Initialize with empty state to avoid hydration mismatch
  // This ensures server and client render the same initial state
  const [entries, setEntries] = useState<Record<string, JournalEntry>>(() => {
    // Always return empty object on initial render (both server and client)
    return {};
  });
  const [storageMode, setStorageMode] = useState<StorageMode>("localStorage");
  const [storageAdapter, setStorageAdapter] = useState<StorageAdapter | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Mark as hydrated on client side only
    setIsHydrated(true);
    
    const loadEntries = async () => {
      try {
        const { adapter, mode, directoryDeleted } = await StorageFactory.initializeStorage();
        
        if (directoryDeleted && onDirectoryDeleted) {
          onDirectoryDeleted();
        }

        setStorageAdapter(adapter);
        setStorageMode(mode);

        const allEntries = await adapter.getAllEntries();
        setEntries(allEntries);
      } catch (error) {
        logger.error("Failed to load entries", error);
        // Fallback to localStorage
        const localStorageAdapter = StorageFactory.getLocalStorageAdapter();
        setStorageAdapter(localStorageAdapter);
        setStorageMode("localStorage");
        const allEntries = await localStorageAdapter.getAllEntries();
        setEntries(allEntries);
      }
    };

    loadEntries();
  }, [onDirectoryDeleted]);

  const saveEntry = useCallback(async (key: string, memory: string) => {
    if (!storageAdapter) return;

    // Always save the entry, even if it's empty
    // This allows users to explicitly save empty entries
    const entry: JournalEntry = {
      date: new Date().toISOString(),
      memory: memory.trim(), // Save trimmed version but still save even if empty
    };
    
    try {
      await storageAdapter.saveEntry(key, entry);
      setEntries((prev) => ({ ...prev, [key]: entry }));
    } catch (error) {
      logger.error("Failed to save entry", error);
      // Check if directory was deleted
      if (StorageFactory.isDirectoryDeletedError(error)) {
        // Notify that directory was deleted
        if (onDirectoryDeleted) {
          onDirectoryDeleted();
        }
        // Fallback to localStorage
        const localStorageAdapter = StorageFactory.getLocalStorageAdapter();
        await localStorageAdapter.saveEntry(key, entry);
        setStorageAdapter(localStorageAdapter);
        setStorageMode("localStorage");
        setEntries((prev) => ({ ...prev, [key]: entry }));
      }
    }
  }, [storageAdapter, onDirectoryDeleted]);

  const getEntry = useCallback(
    (key: string): JournalEntry | undefined => {
      return entries[key];
    },
    [entries]
  );

  const migrateToFileSystem = useCallback(async (): Promise<{ success: boolean; cancelled?: boolean }> => {
    const fileSystemAdapter = StorageFactory.getFileSystemAdapter();
    
    if (!fileSystemAdapter.isSupported()) {
      return { success: false };
    }

    try {
      const result = await fileSystemAdapter.requestDirectory();
      if (result.success) {
        // Migrate all entries from current adapter to file system
        const currentAdapter = storageAdapter || StorageFactory.getLocalStorageAdapter();
        await StorageFactory.migrateEntries(currentAdapter, fileSystemAdapter);

        // Migrate from individual files to single journal.json if needed
        await fileSystemAdapter.migrateFromIndividualFiles();

        // Reload entries from File System
        const fileSystemEntries = await fileSystemAdapter.getAllEntries();
        setEntries(fileSystemEntries);
        setStorageAdapter(fileSystemAdapter);
        setStorageMode("fileSystem");
        
        return { success: true };
      }
      return result;
    } catch (error) {
      logger.error("Failed to migrate to File System", error);
      return { success: false };
    }
  }, [storageAdapter]);

  return { entries, saveEntry, getEntry, storageMode: isHydrated ? storageMode : "localStorage", migrateToFileSystem };
}
