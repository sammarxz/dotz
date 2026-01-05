interface HeaderProps {
  onSettingsClick: () => void;
}

export function Header({ onSettingsClick }: HeaderProps) {
  return (
    <header className="flex justify-between items-center z-10 mb-12">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-foreground flex items-center justify-center">
            <div className="w-1 h-1 bg-background rounded-full"></div>
          </div>
          <span className="text-base font-bold tracking-tighter uppercase">
            dotz
          </span>
        </div>
        <span className="text-zinc-600 uppercase">
          By{" "}
          <a
            href="https://marxz.me"
            target="_blank"
            className="text-zinc-400 hover:text-zinc-300 transition-colors"
          >
            @sammarxz
          </a>
        </span>
      </div>
      <nav className="flex uppercase flex-col items-end gap-1">
        <button
          onClick={onSettingsClick}
          className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer uppercase"
          aria-label="Open settings"
        >
          Settings
        </button>
        <span className="text-zinc-600">
          press <span className="text-zinc-400">Shift + ?</span> for shortcuts
        </span>
      </nav>
    </header>
  );
}
