import { useState, useEffect, useCallback } from "react";
import { logger } from "@/shared/lib/utils/logger";
import { StorageFactory } from "@/shared/lib/storage/storage-factory";
import { FileSystemAdapter } from "@/shared/lib/storage/adapters/file-system-adapter";

/**
 * Hook for managing file system storage setup and state
 * Handles initialization, directory selection, and directory access checks
 * 
 * @returns {Object} File system storage state and operations
 * @returns {boolean} isInitialized - Whether storage has been initialized
 * @returns {boolean} isSupported - Whether File System Access API is supported
 * @returns {boolean} needsSetup - Whether file system setup is needed
 * @returns {string} directoryPath - Current directory path
 * @returns {boolean} directoryDeleted - Whether the directory was deleted
 * @returns {Function} setDirectoryDeleted - Set directory deleted state
 * @returns {Function} setupFileSystem - Request directory access and setup
 * @returns {Function} clearDirectoryAndUseLocalStorage - Clear directory and fallback to localStorage
 */
export function useFileSystemStorage() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [directoryPath, setDirectoryPath] = useState<string>("");
  const [directoryDeleted, setDirectoryDeleted] = useState(false);


  useEffect(() => {
    const checkSupport = () => {
      const fileSystemAdapter = StorageFactory.getFileSystemAdapter();
      const supported = fileSystemAdapter.isSupported();
      setIsSupported(supported);
      
      if (supported) {
        initializeStorage(fileSystemAdapter);
      } else {
        setIsInitialized(true);
        setNeedsSetup(false);
      }
    };

    const initializeStorage = async (adapter: FileSystemAdapter) => {
      try {
        const restored = await adapter.restoreDirectory();
        if (restored) {
          // Check if directory is still accessible
          const isAccessible = await adapter.checkDirectoryAccess();
          if (!isAccessible) {
            // Directory was deleted
            setDirectoryDeleted(true);
            setIsInitialized(true);
            setNeedsSetup(false);
            return;
          }
          // Migrate from individual files to single journal.json if needed
          await adapter.migrateFromIndividualFiles();
          setIsInitialized(true);
          setNeedsSetup(false);
          setDirectoryPath(adapter.getDirectoryPath());
        } else {
          // Don't require setup - use localStorage by default
          setIsInitialized(true);
          setNeedsSetup(false);
        }
      } catch (error) {
        logger.error("Failed to initialize storage", error);
        setIsInitialized(true);
        setNeedsSetup(false);
      }
    };

    checkSupport();
  }, []);

  const setupFileSystem = useCallback(async (): Promise<{ success: boolean; cancelled?: boolean }> => {
    if (!isSupported) {
      return { success: false };
    }

    try {
      const fileSystemAdapter = StorageFactory.getFileSystemAdapter();
      const result = await fileSystemAdapter.requestDirectory();
      if (result.success) {
        // Migrate from individual files to single journal.json if needed
        await fileSystemAdapter.migrateFromIndividualFiles();
        
        const newPath = fileSystemAdapter.getDirectoryPath();
        setIsInitialized(true);
        setNeedsSetup(false);
        setDirectoryPath(newPath);
        return { success: true };
      }
      return result;
    } catch (error) {
      logger.error("Failed to setup file system", error);
      return { success: false };
    }
  }, [isSupported]);

  const clearDirectoryAndUseLocalStorage = useCallback(async () => {
    const fileSystemAdapter = StorageFactory.getFileSystemAdapter();
    await fileSystemAdapter.clearAll();
    setDirectoryDeleted(false);
    setDirectoryPath("");
  }, []);

  return {
    isInitialized,
    isSupported,
    needsSetup,
    directoryPath,
    directoryDeleted,
    setDirectoryDeleted,
    setupFileSystem,
    clearDirectoryAndUseLocalStorage,
  };
}
