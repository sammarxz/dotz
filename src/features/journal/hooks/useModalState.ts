import { useState, useCallback } from "react";
import { ModalState, ModalActions } from "@/shared/lib/types/modal.types";

/**
 * Hook to manage modal states
 * Centralizes all modal open/close logic
 */
export function useModalState() {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [directoryDeleted, setDirectoryDeleted] = useState(false);

  const openEditor = useCallback(() => {
    setIsEditorOpen(true);
  }, []);

  const closeEditor = useCallback(() => {
    setIsEditorOpen(false);
  }, []);

  const openSettings = useCallback(() => {
    setIsSettingsOpen(true);
  }, []);

  const closeSettings = useCallback(() => {
    setIsSettingsOpen(false);
  }, []);

  const openShortcuts = useCallback(() => {
    setIsShortcutsOpen(true);
  }, []);

  const closeShortcuts = useCallback(() => {
    setIsShortcutsOpen(false);
  }, []);

  const closeAll = useCallback(() => {
    if (isEditorOpen) setIsEditorOpen(false);
    else if (isSettingsOpen) setIsSettingsOpen(false);
    else if (isShortcutsOpen) setIsShortcutsOpen(false);
  }, [isEditorOpen, isSettingsOpen, isShortcutsOpen]);

  const state: ModalState = {
    isEditorOpen,
    isSettingsOpen,
    isShortcutsOpen,
    directoryDeleted,
  };

  const actions: ModalActions = {
    openEditor,
    closeEditor,
    openSettings,
    closeSettings,
    openShortcuts,
    closeShortcuts,
    setDirectoryDeleted,
    closeAll,
  };

  return {
    ...state,
    ...actions,
  };
}
