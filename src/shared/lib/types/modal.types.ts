/**
 * Modal types available in the application
 */
export type ModalType = "editor" | "settings" | "shortcuts" | "directoryRecovery";

/**
 * Modal state
 */
export interface ModalState {
  isEditorOpen: boolean;
  isSettingsOpen: boolean;
  isShortcutsOpen: boolean;
  directoryDeleted: boolean;
}

/**
 * Modal actions
 */
export interface ModalActions {
  openEditor: () => void;
  closeEditor: () => void;
  openSettings: () => void;
  closeSettings: () => void;
  openShortcuts: () => void;
  closeShortcuts: () => void;
  setDirectoryDeleted: (deleted: boolean) => void;
  closeAll: () => void;
}
