import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Input } from './Input';

export function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = 'Search records...',
  className = '',
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={`relative block ${className}`}>
      <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') onSubmit?.(value);
        }}
        placeholder={placeholder}
        className="pl-9"
      />
    </label>
  );
}
