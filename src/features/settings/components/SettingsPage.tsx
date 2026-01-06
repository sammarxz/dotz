"use client";

import { Dialog, DialogContent } from "@/shared/components/ui/Dialog";
import { ScrollArea } from "@/shared/components/ui/ScrollArea";
import { Button } from "@/shared/components/ui/Button";
import { SettingsPreferences } from "./SettingsPreferences";
import { SettingsStorage } from "./SettingsStorage";
import { StorageMode } from "@/shared/lib/types";

interface SettingsPageProps {
  isOpen: boolean;
  onClose: () => void;
  storageMode?: StorageMode;
  migrateToFileSystem?: () => Promise<{
    success: boolean;
    cancelled?: boolean;
  }>;
  isSupported?: boolean;
}

export function SettingsPage({
  isOpen,
  onClose,
  storageMode = "localStorage",
  migrateToFileSystem,
  isSupported: isSupportedProp,
}: SettingsPageProps) {
  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent className="bg-background border border-zinc-900 text-white max-w-2xl max-h-[90vh] sm:max-h-[85vh] flex flex-col m-2 sm:m-4">
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
            <SettingsPreferences />
            <SettingsStorage
              storageMode={storageMode}
              migrateToFileSystem={migrateToFileSystem}
              isSupported={isSupportedProp}
            />
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t border-zinc-900 px-4 sm:px-8 py-3 sm:py-4 flex justify-between items-center">
          <p className="text-[10px] sm:text-xs text-zinc-600">Version 1.0.1</p>
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
