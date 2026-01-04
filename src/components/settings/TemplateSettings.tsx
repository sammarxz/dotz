import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/Dialog";
import { Textarea } from "@/components/ui/Textarea";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { JournalStorage } from "@/lib/storage/journal-storage";

interface TemplateSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TemplateSettings({ isOpen, onClose }: TemplateSettingsProps) {
  const [template, setTemplate] = useState("");

  useEffect(() => {
    if (isOpen) {
      setTemplate(JournalStorage.getTemplate());
    }
  }, [isOpen]);

  const handleSave = () => {
    JournalStorage.saveTemplate(template);
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent className="bg-background border border-zinc-900 text-white max-w-4xl h-[85vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-zinc-900 px-8 py-5 flex items-center justify-between">
          <h2 className="text-xs text-zinc-700 font-light tracking-wide">
            Template
          </h2>
          <button
            onClick={handleSave}
            className="text-xs text-zinc-700 hover:text-white transition-colors px-3 py-1.5 border border-zinc-900 hover:border-zinc-700 rounded"
          >
            Save
          </button>
        </div>

        <ScrollArea className="flex-1">
          <Textarea
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            placeholder="Daily template..."
            className="w-full h-full bg-background text-white text-sm leading-relaxed px-8 py-6 border-0 min-h-[calc(85vh-120px)]"
            autoFocus
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
