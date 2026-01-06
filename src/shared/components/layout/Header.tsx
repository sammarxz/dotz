interface HeaderProps {
  onSettingsClick: () => void;
}

export function Header({ onSettingsClick }: HeaderProps) {
  return (
    <header
      className="flex justify-between items-start sm:items-center z-10 mb-6 sm:mb-12 
    md:fixed top-0 left-0 right-0 p-4 md:p-12"
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-foreground flex items-center justify-center"
            aria-hidden="true"
          >
            <div className="w-1 h-1 bg-background rounded-full"></div>
          </div>
          <span className="text-base sm:text-base font-bold tracking-tighter uppercase">
            dotz
          </span>
        </div>
        <span className="text-base text-zinc-600 uppercase">
          By{" "}
          <a
            href="https://marxz.me"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-zinc-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground rounded"
            aria-label="Visit @sammarxz website (opens in new tab)"
          >
            @sammarxz
          </a>
        </span>
      </div>
      <nav className="flex uppercase flex-col items-end gap-2">
        <button
          onClick={onSettingsClick}
          className="text-base  text-muted-foreground 
          hover:text-foreground active:text-foreground transition-colors cursor-pointer 
          uppercase flex items-center 
          justify-center focus-visible:outline-none focus-visible:ring-2 
          focus-visible:ring-foreground rounded"
          aria-label="Open settings"
        >
          Settings
        </button>
        <span className="text-zinc-600 hidden sm:block">
          press <span className="text-zinc-400">Shift + ?</span> for shortcuts
        </span>
      </nav>
    </header>
  );
}
