"use client";

import { useState, useEffect } from "react";
import { FolderOpen, RefreshCw, Database, Shield } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { useToast } from "@/shared/components/ui/Toast";
import { useFileSystemStorage } from "@/features/settings/hooks/useFileSystemStorage";
import { StorageFactory } from "@/shared/lib/storage/storage-factory";
import { StorageMode } from "@/shared/lib/types";

interface SettingsStorageProps {
  storageMode: StorageMode;
  migrateToFileSystem?: () => Promise<{
    success: boolean;
    cancelled?: boolean;
  }>;
  isSupported?: boolean;
}

/**
 * Storage section of the settings page
 * Handles file system storage configuration and migration
 */
export function SettingsStorage({
  storageMode,
  migrateToFileSystem,
  isSupported: isSupportedProp,
}: SettingsStorageProps) {
  const { success, error } = useToast();
  const {
    directoryPath,
    setupFileSystem,
    isSupported: isSupportedHook,
  } = useFileSystemStorage();
  const isSupported = isSupportedProp ?? isSupportedHook;
  const [currentPath, setCurrentPath] = useState<string>("");
  const [isChangingDirectory, setIsChangingDirectory] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);

  useEffect(() => {
    const fileSystemAdapter = StorageFactory.getFileSystemAdapter();
    const path = fileSystemAdapter.getDirectoryPath();
    setCurrentPath(path);
  }, [directoryPath]);

  const handleStoreSafely = async () => {
    if (!migrateToFileSystem) return;

    setIsMigrating(true);
    try {
      const result = await migrateToFileSystem();
      if (result.success) {
        success(
          "Stored safely!",
          "Your entries are now saved to your local file system"
        );
        // Reload to refresh the UI
        setTimeout(() => window.location.reload(), 1000);
      } else if (result.cancelled) {
        // User cancelled - don't show error, just silently return
      } else {
        error("Failed to store safely", "Please try again");
      }
    } catch (err) {
      error("Failed to store safely", "Please try again");
    } finally {
      setIsMigrating(false);
    }
  };

  const handleChangeDirectory = async () => {
    if (!isSupported) {
      error(
        "Not supported",
        "File System Access API is not supported in your browser"
      );
      return;
    }

    setIsChangingDirectory(true);
    try {
      const result = await setupFileSystem();
      if (result.success) {
        const fileSystemAdapter = StorageFactory.getFileSystemAdapter();
        const newPath = fileSystemAdapter.getDirectoryPath();
        setCurrentPath(newPath);
        success("Directory changed", `Files will now be saved to: ${newPath}`);
        // Reload to refresh entries
        setTimeout(() => window.location.reload(), 1000);
      } else if (result.cancelled) {
        // User cancelled - don't show error, just silently return
      } else {
        error("Failed", "Could not change directory");
      }
    } catch (err) {
      error("Failed", "Could not change directory");
    } finally {
      setIsChangingDirectory(false);
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <h3 className="text-base sm:text-lg font-semibold mb-1">Storage</h3>
        <p className="text-xs sm:text-sm text-zinc-500">
          Manage where your journal entries are saved
        </p>
      </div>

      <div className="space-y-3 py-3 border-b border-zinc-900">
        <div className="flex items-start gap-3">
          {storageMode === "fileSystem" ? (
            <FolderOpen className="w-5 h-5 mt-0.5 text-zinc-500" />
          ) : (
            <Database className="w-5 h-5 mt-0.5 text-zinc-500" />
          )}
          <div className="flex-1">
            <label className="text-sm font-medium">Storage Location</label>
            <p className="text-xs text-zinc-500 mt-0.5 break-all">
              {storageMode === "fileSystem"
                ? currentPath || "No directory selected"
                : "Browser Local Storage (temporary)"}
            </p>
            {storageMode === "localStorage" && (
              <p className="text-xs text-zinc-400 mt-1">
                Your entries are stored in your browser. Use "Store Safely" to
                save to your file system.
              </p>
            )}
          </div>
        </div>
        <div className="ml-8 mt-2 space-y-2">
          {storageMode === "localStorage" &&
            isSupported &&
            migrateToFileSystem && (
              <Button
                onClick={handleStoreSafely}
                disabled={isMigrating}
                variant="default"
                size="sm"
                className="w-full sm:w-auto"
              >
                {isMigrating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Storing...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Store Safely
                  </>
                )}
              </Button>
            )}
          {storageMode === "fileSystem" && (
            <Button
              onClick={handleChangeDirectory}
              disabled={isChangingDirectory || !isSupported}
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
            >
              {isChangingDirectory ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Changing...
                </>
              ) : (
                <>
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Change Location
                </>
              )}
            </Button>
          )}
          {!isSupported && (
            <p className="text-xs text-zinc-500 mt-2">
              File System Access API is not supported in your browser
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
