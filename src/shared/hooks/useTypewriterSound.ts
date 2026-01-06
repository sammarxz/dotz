import { useCallback, useEffect } from "react";
import { TypewriterSound } from "@/shared/lib/audio/typewriter-sound";
import { SettingsStorage } from "@/shared/lib/storage/settings-storage";

export function useTypewriterSound() {
  useEffect(() => {
    const settings = SettingsStorage.getSettings();
    if (settings.soundEffects) {
      TypewriterSound.enable();
    }
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    
    const ignoredKeys = [
      'Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab',
      'Escape', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
      'Home', 'End', 'PageUp', 'PageDown', 'Insert',
    ];
    
    if (ignoredKeys.includes(e.key)) return;

    if (e.key === 'Enter') {
      TypewriterSound.playPressEnter();
      return;
    }

    if (e.key === ' ') {
      TypewriterSound.playPressSpace();
      return;
    }

    if (e.key === 'Backspace' || e.key === 'Delete') {
      TypewriterSound.playPressBackspace();
      return;
    }

    TypewriterSound.playPress();
  }, []);

  const handleKeyUp = useCallback((e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    
    const ignoredKeys = [
      'Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab',
      'Escape', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
      'Home', 'End', 'PageUp', 'PageDown', 'Insert',
    ];
    
    if (ignoredKeys.includes(e.key)) return;

    if (e.key === 'Enter') {
      TypewriterSound.playReleaseEnter();
      return;
    }

    if (e.key === ' ') {
      TypewriterSound.playReleaseSpace();
      return;
    }

    if (e.key === 'Backspace' || e.key === 'Delete') {
      TypewriterSound.playReleaseBackspace();
      return;
    }

    TypewriterSound.playRelease();
  }, []);

  return { handleKeyDown, handleKeyUp };
}

