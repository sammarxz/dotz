"use client";

import { FolderOpen } from "lucide-react";

import { Dialog, DialogContent } from "@/shared/components/ui/Dialog";
import { Button } from "@/shared/components/ui/Button";

interface FileSystemSetupProps {
  isOpen: boolean;
  onSetup: () => Promise<void>;
  isSupported: boolean;
}

export function FileSystemSetup({
  isOpen,
  onSetup,
  isSupported,
}: FileSystemSetupProps) {
  if (!isSupported) {
    return (
      <Dialog isOpen={isOpen} onClose={() => {}}>
        <DialogContent className="bg-background border border-zinc-900 text-white max-w-md">
          <div className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">File System Not Supported</h2>
            <p className="text-sm text-zinc-500">
              Your browser doesn't support the File System Access API. Please
              use a modern browser like Chrome, Edge, or Opera.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog isOpen={isOpen} onClose={() => {}}>
      <DialogContent className="bg-background border border-zinc-900 text-white max-w-md">
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <FolderOpen className="w-6 h-6 text-zinc-500" />
            <h2 className="text-xl font-semibold">Choose Storage Location</h2>
          </div>
          <p className="text-sm text-zinc-500">
            Select a folder on your computer to store your journal entries. This
            allows you to keep your data locally and access it from your file
            system.
          </p>
          <div className="flex gap-3 pt-2">
            <Button onClick={onSetup} variant="default" className="flex-1">
              Choose Folder
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
