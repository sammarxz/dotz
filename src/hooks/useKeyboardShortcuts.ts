import { useEffect, useCallback } from "react";

import { SHORTCUTS, ShortcutMatcher } from "@/lib/keyboard/shortcuts";

export interface ShortcutHandlers {
  onNewNote: () => void;
  onCloseModal: () => void;
  onShowShortcuts: () => void;
  onOpenSettings: () => void;
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  handlers: ShortcutHandlers;
}

export function useKeyboardShortcuts({
  enabled = true,
  handlers,
}: UseKeyboardShortcutsOptions) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      const target = event.target as HTMLElement;
      const isTyping = ["INPUT", "TEXTAREA"].includes(target.tagName);

      if (isTyping && event.key !== "Escape") return;

      const shortcutMap = [
        { shortcut: SHORTCUTS.NEW_NOTE, handler: handlers.onNewNote },
        { shortcut: SHORTCUTS.CLOSE_MODAL, handler: handlers.onCloseModal },
        {
          shortcut: SHORTCUTS.SHOW_SHORTCUTS,
          handler: handlers.onShowShortcuts,
        },
        {
          shortcut: SHORTCUTS.OPEN_SETTINGS,
          handler: handlers.onOpenSettings,
        },
      ];

      for (const { shortcut, handler } of shortcutMap) {
        if (ShortcutMatcher.matches(event, shortcut)) {
          event.preventDefault();
          handler();
          break;
        }
        // Also check for Ctrl+, if the shortcut is meta+, (for cross-platform support)
        if (
          shortcut.modifiers?.meta &&
          shortcut.key === "," &&
          event.key === "," &&
          (event.ctrlKey || event.metaKey) &&
          !event.shiftKey &&
          !event.altKey
        ) {
          event.preventDefault();
          handler();
          break;
        }
      }
    },
    [enabled, handlers]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, handleKeyDown]);
}
