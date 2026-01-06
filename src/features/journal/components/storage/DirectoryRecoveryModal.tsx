"use client";

import { FolderOpen, Database, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent } from "@/shared/components/ui/Dialog";
import { Button } from "@/shared/components/ui/Button";

interface DirectoryRecoveryModalProps {
  isOpen: boolean;
  onSelectNewDirectory: () => Promise<void>;
  onUseLocalStorage: () => void;
  isSelecting?: boolean;
}

export function DirectoryRecoveryModal({
  isOpen,
  onSelectNewDirectory,
  onUseLocalStorage,
  isSelecting = false,
}: DirectoryRecoveryModalProps) {
  return (
    <Dialog isOpen={isOpen} onClose={() => {}}>
      <DialogContent className="bg-background border border-zinc-900 text-white max-w-md">
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-500" />
            <h2 className="text-xl font-semibold">Directory Not Found</h2>
          </div>
          <p className="text-sm text-zinc-500">
            The directory you previously selected for storing your journal entries
            has been deleted or moved. Please choose a new location or switch back
            to browser storage.
          </p>
          <div className="flex flex-col gap-3 pt-2">
            <Button
              onClick={onSelectNewDirectory}
              disabled={isSelecting}
              variant="default"
              className="flex-1 flex items-center justify-center gap-2"
            >
              {isSelecting ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Selecting...
                </>
              ) : (
                <>
                  <FolderOpen className="w-4 h-4" />
                  Select New Directory
                </>
              )}
            </Button>
            <Button
              onClick={onUseLocalStorage}
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2"
            >
              <Database className="w-4 h-4" />
              Use Browser Storage
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
