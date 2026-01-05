import { useCallback, useEffect } from "react";
import { TypewriterSound } from "@/lib/audio/typewriter-sound";
import { SettingsStorage } from "@/lib/storage/settings-storage";

export function useTypewriterSound() {
  useEffect(() => {
    const settings = SettingsStorage.getSettings();
    if (settings.soundEffects) {
      TypewriterSound.enable();
    }
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Ignora teclas modificadoras
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    
    // Ignora teclas especiais que não fazem som
    const ignoredKeys = [
      'Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab',
      'Escape', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
      'Home', 'End', 'PageUp', 'PageDown', 'Insert',
    ];
    
    if (ignoredKeys.includes(e.key)) return;

    // Sons específicos para teclas especiais
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

    // Som genérico para outras teclas
    TypewriterSound.playPress();
  }, []);

  const handleKeyUp = useCallback((e: React.KeyboardEvent) => {
    // Ignora teclas modificadoras
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    
    const ignoredKeys = [
      'Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab',
      'Escape', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
      'Home', 'End', 'PageUp', 'PageDown', 'Insert',
    ];
    
    if (ignoredKeys.includes(e.key)) return;

    // Sons de release específicos
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

    // Som genérico de release
    TypewriterSound.playRelease();
  }, []);

  return { handleKeyDown, handleKeyUp };
}

