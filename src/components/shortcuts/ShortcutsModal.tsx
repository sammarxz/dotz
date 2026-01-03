import { Dialog, DialogContent } from "@/components/ui/Dialog";

import { SHORTCUTS, ShortcutMatcher } from "@/lib/keyboard/shortcuts";

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  const categories = {
    actions: "Actions",
    navigation: "Navigation",
    settings: "Settings",
  };

  const groupedShortcuts = Object.entries(SHORTCUTS).reduce(
    (acc, [_key, shortcut]) => {
      if (!acc[shortcut.category]) {
        acc[shortcut.category] = [];
      }
      acc[shortcut.category].push(shortcut);
      return acc;
    },
    {} as Record<string, (typeof SHORTCUTS)[keyof typeof SHORTCUTS][]>
  );

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent className="bg-black outline-none text-white max-w-2xl">
        <div className="p-6 space-y-6">
          <h2 className="text-2xl font-bold">Shortcuts</h2>

          {Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
            <div key={category} className="space-y-3">
              <h3 className="text-lg font-semibold text-zinc-400">
                {categories[category as keyof typeof categories]}
              </h3>
              <div className="space-y-2">
                {shortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 px-3 rounded bg-zinc-900/50"
                  >
                    <span className="text-zinc-300">
                      {shortcut.description}
                    </span>
                    <kbd className="px-3 py-1 text-sm font-mono bg-zinc-800 border border-zinc-700 rounded">
                      {ShortcutMatcher.getDisplayKey(shortcut)}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="pt-4 border-t border-zinc-800 text-sm text-zinc-500">
            <p>
              Press <kbd className="px-2 py-1 bg-zinc-800 rounded">Esc</kbd> to
              close
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
