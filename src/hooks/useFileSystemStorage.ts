import { useState, useEffect, useCallback } from "react";
import { FileSystemStorage } from "@/lib/storage/file-system-storage";
import { JournalEntry } from "@/lib/types";

export function useFileSystemStorage() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [directoryPath, setDirectoryPath] = useState<string>("");

  const migrateFromLocalStorage = async () => {
    try {
      // Migrate entries
      const entriesKey = "journal-entries";
      const storedEntries = localStorage.getItem(entriesKey);

      if (storedEntries) {
        const entries: Record<string, JournalEntry> = JSON.parse(storedEntries);
        for (const [key, entry] of Object.entries(entries)) {
          await FileSystemStorage.saveEntry(key, entry);
        }
        // Remove from localStorage after successful migration
        localStorage.removeItem(entriesKey);
      }
    } catch (error) {
      console.error("Failed to migrate data from localStorage", error);
    }
  };

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
          setIsInitialized(true);
          setNeedsSetup(true);
        }
      } catch (error) {
        console.error("Failed to initialize storage", error);
        setIsInitialized(true);
        setNeedsSetup(true);
      }
    };

    checkSupport();
  }, []);

  const setupFileSystem = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      return false;
    }

    try {
      const granted = await FileSystemStorage.requestDirectory();
      if (granted) {
        // Migrate data from localStorage if it exists
        await migrateFromLocalStorage();
        // Migrate from individual files to single journal.json if needed
        await FileSystemStorage.migrateFromIndividualFiles();
        
        const newPath = FileSystemStorage.getDirectoryPath();
        setIsInitialized(true);
        setNeedsSetup(false);
        setDirectoryPath(newPath);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to setup file system", error);
      return false;
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
