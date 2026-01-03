import { cn } from "@/lib/utils";
import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { memo } from "react";

interface CheckboxProps {
  checked: boolean;
  onToggle: (e: React.MouseEvent) => void;
  className?: string;
}

export const Checkbox = memo(function Checkbox({
  checked,
  onToggle,
  className,
}: CheckboxProps) {
  return (
    <BaseCheckbox.Root
      checked={checked}
      onCheckedChange={() => onToggle({} as React.MouseEvent)}
      render={(props) => (
        <label
          {...props}
          data-checkbox
          className={cn(
            "inline-flex items-center align-middle cursor-pointer select-none",
            className
          )}
          onClick={onToggle}
        >
          <BaseCheckbox.Indicator className="inline-flex items-center justify-center w-3.5 h-3.5 rounded border border-zinc-700 hover:border-zinc-500 transition-colors bg-transparent">
            {checked && <span className="w-2 h-2 bg-white rounded-sm" />}
          </BaseCheckbox.Indicator>
        </label>
      )}
    />
  );
});
