import { cn } from "@/lib/utils";
import { Input as BaseInput } from "@base-ui/react/input";
import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <BaseInput
        ref={ref}
        className={cn(
          "w-full bg-background text-white border border-zinc-900 rounded px-3 py-2 text-sm",
          "focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-700",
          "placeholder:text-zinc-900",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
