import { cn } from "@/shared/lib/utils";
import { ScrollArea as BaseScrollArea } from "@base-ui/react/scroll-area";
import { ReactNode } from "react";

interface ScrollAreaProps {
  children: ReactNode;
  className?: string;
}

export function ScrollArea({ children, className }: ScrollAreaProps) {
  return (
    <BaseScrollArea.Root className={cn("overflow-hidden", className)}>
      <BaseScrollArea.Viewport className="w-full h-full">
        {children}
      </BaseScrollArea.Viewport>
      <BaseScrollArea.Scrollbar 
        orientation="vertical" 
        className="flex touch-none select-none transition-colors"
      >
        <BaseScrollArea.Thumb className="flex-1 bg-zinc-800 rounded-full relative" />
      </BaseScrollArea.Scrollbar>
    </BaseScrollArea.Root>
  );
}
