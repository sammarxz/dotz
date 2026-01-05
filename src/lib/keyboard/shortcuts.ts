import { ShortcutDefinition } from "../types";

export const SHORTCUTS: Record<string, ShortcutDefinition> = {
  NEW_NOTE: {
    key: "n",
    description: "Create today's note",
    category: "actions",
  },
  CLOSE_MODAL: {
    key: "Escape",
    description: "Close modal",
    category: "navigation",
  },
  SHOW_SHORTCUTS: {
    key: "?",
    description: "Show Keyboard Shortcuts",
    category: "settings",
    modifiers: { shift: true },
  },
  OPEN_TEMPLATES: {
    key: "t",
    description: "open Templates",
    category: "settings",
  },
};

export class ShortcutMatcher {
  static matches(event: KeyboardEvent, shortcut: ShortcutDefinition): boolean {
    const { key, modifiers = {} } = shortcut;

    if (event.key !== key) return false;

    const ctrlMatch = modifiers.ctrl ? event.ctrlKey : !event.ctrlKey;
    const shiftMatch = modifiers.shift ? event.shiftKey : !event.shiftKey;
    const altMatch = modifiers.alt ? event.altKey : !event.altKey;
    const metaMatch = modifiers.meta ? event.metaKey : !event.metaKey;

    return ctrlMatch && shiftMatch && altMatch && metaMatch;
  }

  static getDisplayKey(shortcut: ShortcutDefinition): string {
    const parts: string[] = [];
    const { modifiers = {} } = shortcut;

    if (modifiers.ctrl) parts.push("Ctrl");
    if (modifiers.shift) parts.push("Shift");
    if (modifiers.alt) parts.push("Alt");
    if (modifiers.meta) parts.push("⌘");

    const keyDisplay = shortcut.key === " " ? "Space" : shortcut.key;
    parts.push(keyDisplay);

    return parts.join(" + ");
  }
}
