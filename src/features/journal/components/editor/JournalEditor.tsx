import { useState, useEffect, useCallback } from "react";

import { Dialog, DialogContent } from "@/shared/components/ui/Dialog";
import { ScrollArea } from "@/shared/components/ui/ScrollArea";
import { Textarea } from "@/shared/components/ui/Textarea";

import { useAutoSave } from "@/features/journal/hooks/useAutoSave";
import { useMarkdownEditor } from "@/features/journal/hooks/useMarkdownEditor";
import { useTypewriterSound } from "@/shared/hooks/useTypewriterSound";

import { CalendarUtils } from "@/features/journal/lib/date/calendar-utils";

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
    const newText = e.target.value;
    setText(newText);
    // Mark as edited if text changed (even if it's now empty)
    if (newText !== initialText) {
      setHasEdited(true);
    }
  };

  const handleTextChange = (newText: string) => {
    setText(newText);
    // Mark as edited if text changed (even if it's now empty)
    if (newText !== initialText) {
      setHasEdited(true);
    }
  };

  const handleSave = useCallback(
    (value: string) => {
      onSave(value);
      setLocalLastSaved(new Date());
    },
    [onSave]
  );

  const { handleKeyDown: handleMarkdownKeyDown } = useMarkdownEditor({
    value: text,
    onChange: handleTextChange,
  });

  const { handleKeyDown: handleSoundKeyDown, handleKeyUp: handleSoundKeyUp } =
    useTypewriterSound();

  // Always pass text to auto-save when editor is open and has been edited
  // This ensures empty strings are also saved
  const { isSaving } = useAutoSave(
    isOpen && hasEdited ? text : null,
    handleSave
  );

  const displayDate =
    localLastSaved || (entryDate ? new Date(entryDate) : null);

  const getDisplayText = () => {
    if (isSaving) return "Saving...";
    if (!displayDate) return "Never";
    return CalendarUtils.formatRelative(displayDate);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    handleSoundKeyDown(e);
    handleMarkdownKeyDown(e);
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    handleSoundKeyUp(e);
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent className="bg-background border border-zinc-900 text-white max-w-4xl h-[85vh] sm:h-[72vh] flex flex-col m-2 sm:m-4">
        <div className="flex-1 w-full p-3 sm:p-4 min-h-0">
          <ScrollArea className="h-full">
            <Textarea
              value={text}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onKeyUp={handleKeyUp}
              className="w-full h-full bg-transparent resize-none focus:outline-none text-sm sm:text-base"
              placeholder="Comece a escrever..."
              autoFocus
              aria-label="Journal entry editor"
            />
          </ScrollArea>
        </div>

        <div className="text-sm sm:text-lg px-3 sm:px-4 py-3 sm:py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 border-t border-zinc-900">
          <h2 className="font-bold text-white">{date}</h2>

          <div className="text-sm sm:text-lg flex flex-col sm:flex-row items-start sm:items-baseline gap-1 sm:gap-2">
            <span className="font-bold text-white">Last Modified:</span>
            <span
              className={`font-normal transition-colors ${
                isSaving ? "text-yellow-500" : "text-zinc-500"
              }`}
              aria-live="polite"
              aria-atomic="true"
            >
              {getDisplayText()}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
