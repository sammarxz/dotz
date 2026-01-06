import { useRef, useEffect, useTransition } from "react";
import { AUTO_SAVE_DELAY_MS } from "@/shared/lib/constants/app-constants";

/**
 * Hook for auto-saving values with debouncing
 * Automatically saves the value after a delay when it changes
 * 
 * @param {string|null} value - Value to auto-save
 * @param {Function} onSave - Callback to save the value
 * @param {number} [delay=AUTO_SAVE_DELAY_MS] - Delay in milliseconds before saving
 * @returns {Object} Auto-save state
 * @returns {boolean} isSaving - Whether a save operation is in progress
 */
export function useAutoSave(
  value: string | null,
  onSave: (value: string) => void,
  delay = AUTO_SAVE_DELAY_MS
): { isSaving: boolean } {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const previousValueRef = useRef<string | null>(value);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (value === null) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      // Always save if value changed, even if it's empty string
      // This ensures that clearing the text is saved
      if (value !== previousValueRef.current) {
        startTransition(() => {
          onSave(value);
          previousValueRef.current = value;
        });
      }
    }, delay);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [value, onSave, delay]);

  return { isSaving: isPending };
}
