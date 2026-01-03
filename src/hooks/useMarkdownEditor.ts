import { useCallback } from "react";

import { MarkdownUtils } from "@/lib/markdown/markdown-utils";

interface UseMarkdownEditorOptions {
  value: string;
  onChange: (value: string) => void;
}

export function useMarkdownEditor({
  value,
  onChange,
}: UseMarkdownEditorOptions) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        const textarea = e.currentTarget;
        const cursorPosition = textarea.selectionStart;

        const result = MarkdownUtils.handleListEnter(value, cursorPosition);

        if (result) {
          e.preventDefault();
          onChange(result.newText);

          requestAnimationFrame(() => {
            textarea.selectionStart = result.newCursorPosition;
            textarea.selectionEnd = result.newCursorPosition;
          });
        }
      }
    },
    [value, onChange]
  );

  return { handleKeyDown };
}
