import { cn } from "@/lib/utils";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Dialog({ isOpen, onClose, children }: DialogProps) {
  return (
    <BaseDialog.Root
      open={isOpen}
      onOpenChange={(open: boolean) => !open && onClose()}
    >
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" />
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {children}
        </div>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

export function DialogContent({
  children,
  className = "",
}: DialogContentProps) {
  return (
    <BaseDialog.Popup
      className={cn("relative z-50 w-full mx-auto", className)}
      render={(props: React.HTMLAttributes<HTMLDivElement>) => (
        <div {...props} onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
      )}
    />
  );
}
