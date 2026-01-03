import { cn } from "@/lib/utils";
import { Button as BaseButton } from "@base-ui/react/button";
import { ReactNode } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "default" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
}

export function Button({
  children,
  variant = "default",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  const variantClasses = {
    default: "bg-white text-black hover:bg-zinc-200",
    ghost: "bg-transparent text-zinc-700 hover:text-white hover:bg-zinc-900",
    outline: "border border-zinc-900 text-zinc-700 hover:border-zinc-700 hover:text-white",
  };

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-xs",
    lg: "px-4 py-2 text-sm",
  };

  return (
    <BaseButton
      className={cn(
        "inline-flex items-center justify-center rounded transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-500",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </BaseButton>
  );
}
