import { useRef, useEffect, useTransition } from "react";

export function useAutoSave(
  value: string | null,
  onSave: (value: string) => void,
  delay = 1000
): { isSaving: boolean } {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const previousValueRef = useRef<string | null>(value);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (value === null) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
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
