"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/Dialog";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { SwitchComponent } from "@/components/ui/Switch";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useSettings } from "@/hooks/useSettings";
import { useToast } from "@/components/ui/Toast";
import { BackupManager } from "@/lib/storage/backup-manager";
import { Download, Upload, Trash2, Bell, Volume2 } from "lucide-react";

interface SettingsPageProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsPage({ isOpen, onClose }: SettingsPageProps) {
  const { settings, updateSettings, enableNotifications } = useSettings();
  const { success, error } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

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

  const handleDownloadBackup = async () => {
    try {
      setIsDownloading(true);
      const backup = await BackupManager.createBackup();
      BackupManager.downloadBackup(backup);
      success("Backup created", "Your data has been downloaded");
    } catch (err) {
      error("Backup failed", "Could not create backup file");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRestoreBackup = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        await BackupManager.restoreBackup(file);
        success("Backup restored", "Your data has been restored successfully");
        setTimeout(() => window.location.reload(), 1500);
      } catch (err) {
        error("Restore failed", "Could not restore backup file");
      }
    };
    input.click();
  };

  const handleDeleteAccount = () => {
    // Placeholder - implementar confirmação real
    error("Feature not available", "Account deletion is coming soon");
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent className="bg-black border border-zinc-900 text-white max-w-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-zinc-900 px-8 py-5">
          <h2 className="text-2xl font-bold">Settings</h2>
          <p className="text-sm text-zinc-500 mt-1">
            Manage your preferences and data
          </p>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="px-8 py-6 space-y-8">
            {/* Preferences Section */}
            <section className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-1">Preferences</h3>
                <p className="text-sm text-zinc-500">
                  Customize your writing experience
                </p>
              </div>

              {/* Sound Effects */}
              <div className="flex items-center justify-between py-3 border-b border-zinc-900">
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

            {/* Data Management Section */}
            <section className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-1">Data Management</h3>
                <p className="text-sm text-zinc-500">
                  Backup and restore your journal
                </p>
              </div>

              <div className="space-y-3">
                {/* Download Backup */}
                <div className="flex items-center justify-between py-3 border-b border-zinc-900">
                  <div className="flex items-start gap-3">
                    <Download className="w-5 h-5 mt-0.5 text-zinc-500" />
                    <div>
                      <p className="text-sm font-medium">Download Backup</p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Export all your entries and settings
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleDownloadBackup}
                    disabled={isDownloading}
                    variant="outline"
                    size="sm"
                  >
                    {isDownloading ? "Downloading..." : "Download"}
                  </Button>
                </div>

                {/* Restore Backup */}
                <div className="flex items-center justify-between py-3 border-b border-zinc-900">
                  <div className="flex items-start gap-3">
                    <Upload className="w-5 h-5 mt-0.5 text-zinc-500" />
                    <div>
                      <p className="text-sm font-medium">Restore Backup</p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Import a previously exported backup
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleRestoreBackup}
                    variant="outline"
                    size="sm"
                  >
                    Restore
                  </Button>
                </div>
              </div>
            </section>

            {/* Danger Zone */}
            <section className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-1 text-red-500">
                  Danger Zone
                </h3>
                <p className="text-sm text-zinc-500">Irreversible actions</p>
              </div>

              <div className="border border-red-900/50 rounded-lg p-4 bg-red-950/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <Trash2 className="w-5 h-5 mt-0.5 text-red-500" />
                    <div>
                      <p className="text-sm font-medium text-red-400">
                        Delete Account
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Permanently delete all your data
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleDeleteAccount}
                    variant="outline"
                    size="sm"
                    className="border-red-800 text-red-400 hover:bg-red-950 hover:border-red-700"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </section>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t border-zinc-900 px-8 py-4 flex justify-between items-center">
          <p className="text-xs text-zinc-600">Version 1.0.0</p>
          <Button onClick={onClose} variant="ghost" size="sm">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
