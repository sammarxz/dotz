import { useState, useEffect } from "react";

import { useAutoSave } from "@/hooks/useAutoSave";
import { useMarkdownEditor } from "@/hooks/useMarkdownEditor";

import { Dialog, DialogContent } from "@/components/ui/Dialog";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Textarea } from "@/components/ui/Textarea";

import { CalendarUtils } from "@/lib/date/calendar-utils";

interface JournalEditorProps {
  isOpen: boolean;
  onClose: () => void;
  initialText: string;
  date: string;
  entryDate?: string | null;
  onSave: (text: string) => void;
}

export function JournalEditor({
  isOpen,
  onClose,
  initialText,
  date,
  entryDate = null,
  onSave,
}: JournalEditorProps) {
  const [text, setText] = useState(initialText);
  const [hasEdited, setHasEdited] = useState(false);
  const [localLastSaved, setLocalLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    if (isOpen) {
      setText(initialText);
      setHasEdited(false);
      setLocalLastSaved(null);
    }
  }, [isOpen, initialText]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    if (!hasEdited) setHasEdited(true);
  };

  const handleTextChange = (newText: string) => {
    setText(newText);
    if (!hasEdited) setHasEdited(true);
  };

  const handleSave = (value: string) => {
    onSave(value);
    setLocalLastSaved(new Date());
  };

  const { handleKeyDown } = useMarkdownEditor({
    value: text,
    onChange: handleTextChange,
  });

  const { isSaving } = useAutoSave(hasEdited ? text : null, handleSave);

  const displayDate =
    localLastSaved || (entryDate ? new Date(entryDate) : null);

  const getDisplayText = () => {
    if (isSaving) return "Saving...";
    if (!displayDate) return "Never";
    return CalendarUtils.formatRelative(displayDate);
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent className="bg-background border border-zinc-900 text-white max-w-4xl h-[72vh] flex flex-col">
        <div className="flex-1 w-full p-4">
          <ScrollArea className="h-full">
            <Textarea
              value={text}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="w-full h-full bg-transparent resize-none focus:outline-none"
              placeholder="Comece a escrever..."
              autoFocus
            />
          </ScrollArea>
        </div>

        <div className="text-lg px-4 py-5 flex justify-between items-center border-t border-zinc-900">
          <h2 className="font-bold text-white">{date}</h2>

          <div className="text-lg flex items-baseline gap-2">
            <span className="font-bold text-white">Last Modified:</span>
            <span
              className={`font-normal transition-colors ${
                isSaving ? "text-yellow-500" : "text-zinc-500"
              }`}
            >
              {getDisplayText()}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
