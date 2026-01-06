import { useState, useEffect, useCallback } from "react";
import { FileSystemStorage } from "@/lib/storage/file-system-storage";
import { JournalEntry } from "@/lib/types";

export function useFileSystemStorage() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [directoryPath, setDirectoryPath] = useState<string>("");


  useEffect(() => {
    const checkSupport = () => {
      const supported = FileSystemStorage.isSupported();
      setIsSupported(supported);
      
      if (supported) {
        initializeStorage();
      } else {
        setIsInitialized(true);
        setNeedsSetup(false);
      }
    };

    const initializeStorage = async () => {
      try {
        const restored = await FileSystemStorage.restoreDirectory();
        if (restored) {
          // Migrate from individual files to single journal.json if needed
          await FileSystemStorage.migrateFromIndividualFiles();
          setIsInitialized(true);
          setNeedsSetup(false);
          setDirectoryPath(FileSystemStorage.getDirectoryPath());
        } else {
          // Don't require setup - use localStorage by default
          setIsInitialized(true);
          setNeedsSetup(false);
        }
      } catch (error) {
        console.error("Failed to initialize storage", error);
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
      const result = await FileSystemStorage.requestDirectory();
      if (result.success) {
        // Migrate from individual files to single journal.json if needed
        await FileSystemStorage.migrateFromIndividualFiles();
        
        const newPath = FileSystemStorage.getDirectoryPath();
        setIsInitialized(true);
        setNeedsSetup(false);
        setDirectoryPath(newPath);
        return { success: true };
      }
      return result;
    } catch (error) {
      console.error("Failed to setup file system", error);
      return { success: false };
    }
  }, [isSupported]);

  return {
    isInitialized,
    isSupported,
    needsSetup,
    directoryPath,
    setupFileSystem,
  };
}
