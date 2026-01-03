interface JournalInfoProps {
  year: number;
  daysLeft: number;
}

export function JournalInfo({ year, daysLeft }: JournalInfoProps) {
  return (
    <div className="flex items-baseline justify-between w-full px-3">
      <h1 className="text-lg font-bold text-white">{year}</h1>
      <div className="text-lg flex items-baseline gap-2">
        <span className="font-bold text-white">{daysLeft}</span>
        <span className="font-normal text-zinc-500">days left</span>
      </div>
    </div>
  );
}
