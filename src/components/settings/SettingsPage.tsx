"use client";

import { useState, useEffect } from "react";
import { Bell, Volume2, FolderOpen, RefreshCw, Database, Shield } from "lucide-react";

import { Dialog, DialogContent } from "@/components/ui/Dialog";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { SwitchComponent } from "@/components/ui/Switch";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

import { useSettings } from "@/hooks/useSettings";
import { useFileSystemStorage } from "@/hooks/useFileSystemStorage";

import { FileSystemStorage } from "@/lib/storage/file-system-storage";

interface SettingsPageProps {
  isOpen: boolean;
  onClose: () => void;
  storageMode?: "localStorage" | "fileSystem";
  migrateToFileSystem?: () => Promise<{ success: boolean; cancelled?: boolean }>;
  isSupported?: boolean;
}

export function SettingsPage({ 
  isOpen, 
  onClose, 
  storageMode = "localStorage",
  migrateToFileSystem,
  isSupported: isSupportedProp
}: SettingsPageProps) {
  const { settings, updateSettings, enableNotifications } = useSettings();
  const { success, error } = useToast();
  const { directoryPath, setupFileSystem, isSupported: isSupportedHook } =
    useFileSystemStorage();
  const isSupported = isSupportedProp ?? isSupportedHook;
  const [currentPath, setCurrentPath] = useState<string>("");
  const [isChangingDirectory, setIsChangingDirectory] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const path = FileSystemStorage.getDirectoryPath();
      setCurrentPath(path);
    }
  }, [isOpen, directoryPath]);

  const handleSoundToggle = (checked: boolean) => {
    updateSettings("soundEffects", checked);
    success(
      checked ? "Sound effects enabled" : "Sound effects disabled",
      checked ? "You'll hear typewriter sounds while typing" : undefined
    );
  };

  const handleNotificationToggle = async (checked: boolean) => {
    if (checked) {
      const granted = await enableNotifications();
      if (!granted) {
        error(
          "Permission denied",
          "Please enable notifications in your browser settings"
        );
        return;
      }
      success(
        "Notifications enabled",
        `Daily reminder set for ${settings.notifications.time}`
      );
    } else {
      updateSettings("notifications", {
        ...settings.notifications,
        enabled: false,
      });
      success("Notifications disabled");
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = e.target.value;
    updateSettings("notifications", {
      ...settings.notifications,
      time,
    });
  };

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
        // No need to show any message
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
        const newPath = FileSystemStorage.getDirectoryPath();
        setCurrentPath(newPath);
        success("Directory changed", `Files will now be saved to: ${newPath}`);
        // Reload to refresh entries
        setTimeout(() => window.location.reload(), 1000);
      } else if (result.cancelled) {
        // User cancelled - don't show error, just silently return
        // No need to show any message
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
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent className="bg-black border border-zinc-900 text-white max-w-2xl max-h-[90vh] sm:max-h-[85vh] flex flex-col m-2 sm:m-4">
        {/* Header */}
        <div className="border-b border-zinc-900 px-4 sm:px-8 py-4 sm:py-5">
          <h2 className="text-xl sm:text-2xl font-bold">Settings</h2>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Manage your preferences and data
          </p>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="px-4 sm:px-8 py-4 sm:py-6 space-y-6 sm:space-y-8">
            {/* Preferences Section */}
            <section className="space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-1">
                  Preferences
                </h3>
                <p className="text-xs sm:text-sm text-zinc-500">
                  Customize your writing experience
                </p>
              </div>

              {/* Sound Effects */}
              <div className="flex items-center justify-between py-3 border-b border-zinc-900 gap-4">
                <div className="flex items-start gap-3">
                  <Volume2 className="w-5 h-5 mt-0.5 text-zinc-500" />
                  <div>
                    <label className="text-sm font-medium cursor-pointer">
                      Sound Effects
                    </label>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Typewriter sounds while typing
                    </p>
                  </div>
                </div>
                <SwitchComponent
                  checked={settings.soundEffects}
                  onCheckedChange={handleSoundToggle}
                />
              </div>

              {/* Notifications */}
              <div className="space-y-3 py-3 border-b border-zinc-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <Bell className="w-5 h-5 mt-0.5 text-zinc-500" />
                    <div>
                      <label className="text-sm font-medium cursor-pointer">
                        Daily Reminder
                      </label>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Get notified to write in your journal
                      </p>
                    </div>
                  </div>
                  <SwitchComponent
                    checked={settings.notifications.enabled}
                    onCheckedChange={handleNotificationToggle}
                  />
                </div>

                {settings.notifications.enabled && (
                  <div className="ml-8 flex items-center gap-3">
                    <label className="text-xs text-zinc-500">Time:</label>
                    <Input
                      type="time"
                      value={settings.notifications.time}
                      onChange={handleTimeChange}
                      className="w-32"
                    />
                  </div>
                )}
              </div>
            </section>

            {/* Storage Management Section */}
            <section className="space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-1">
                  Storage
                </h3>
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
                    <label className="text-sm font-medium">
                      Storage Location
                    </label>
                    <p className="text-xs text-zinc-500 mt-0.5 break-all">
                      {storageMode === "fileSystem" 
                        ? (currentPath || "No directory selected")
                        : "Browser Local Storage (temporary)"}
                    </p>
                    {storageMode === "localStorage" && (
                      <p className="text-xs text-zinc-400 mt-1">
                        Your entries are stored in your browser. Use "Store Safely" to save to your file system.
                      </p>
                    )}
                  </div>
                </div>
                <div className="ml-8 mt-2 space-y-2">
                  {storageMode === "localStorage" && isSupported && migrateToFileSystem && (
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
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t border-zinc-900 px-4 sm:px-8 py-3 sm:py-4 flex justify-between items-center">
          <p className="text-[10px] sm:text-xs text-zinc-600">Version 1.0.0</p>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="min-h-[44px] min-w-[44px]"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
