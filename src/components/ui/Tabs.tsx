type Tab<T extends string> = {
  value: T;
  label: string;
};

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: Tab<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex w-full flex-wrap gap-1 rounded-lg border border-zinc-200 bg-zinc-100/70 p-1 sm:inline-flex sm:w-auto dark:border-zinc-800 dark:bg-zinc-900">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={`min-w-0 flex-1 rounded-md px-3 py-1.5 text-sm transition sm:flex-none ${
            value === tab.value
              ? 'bg-white text-zinc-950 dark:bg-zinc-800 dark:text-white'
              : 'text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
