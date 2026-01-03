import { Settings } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface SettingsButtonProps {
  onClick: () => void;
}

export function SettingsButton({ onClick }: SettingsButtonProps) {
  return (
    <Button
      onClick={onClick}
      variant="ghost"
      className="fixed top-6 right-6 text-zinc-600 hover:text-zinc-400"
      aria-label="Open settings"
      size="sm"
    >
      <Settings className="w-4 h-4" />
    </Button>
  );
}
