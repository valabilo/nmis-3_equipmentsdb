import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Children,
  isValidElement,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from 'react';

type SelectProps = {
  children: ReactNode;
  className?: string;
  defaultValue?: string | number;
  disabled?: boolean;
  id?: string;
  name?: string;
  onChange?: (event: ChangeEvent<HTMLSelectElement>) => void;
  value?: string | number;
};

type SelectOption = {
  value: string;
  label: string;
  disabled: boolean;
};

export function Select({ className = '', children, value, defaultValue, onChange, disabled, id, name }: SelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const options = useMemo(() => getOptions(children), [children]);
  const selectedValue = String(value ?? defaultValue ?? options[0]?.value ?? '');
  const selected = options.find((option) => option.value === selectedValue);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  const selectOption = (nextValue: string) => {
    const event = {
      target: { value: nextValue, name },
      currentTarget: { value: nextValue, name },
    } as ChangeEvent<HTMLSelectElement>;
    onChange?.(event);
    setOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        disabled={disabled}
        id={id}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setOpen(false);
          if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setOpen(true);
          }
        }}
        className="flex h-11 w-full items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-white/80 px-3.5 text-left text-sm text-zinc-950 outline-none transition focus:border-zinc-400 focus:ring-4 focus:ring-zinc-950/5 disabled:pointer-events-none disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-50"
      >
        <span className="min-w-0 truncate">{selected?.label ?? selectedValue}</span>
        <ChevronDownIcon className={`size-4 shrink-0 text-zinc-400 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            id={listboxId}
            role="listbox"
            initial={{ opacity: 0, y: 4, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.99 }}
            className="absolute left-0 top-full z-50 mt-1 max-h-[13.75rem] w-full overflow-y-auto rounded-lg border border-zinc-200 bg-white p-1 shadow-lg shadow-zinc-950/10 thin-scrollbar dark:border-zinc-800 dark:bg-zinc-950"
          >
            {options.map((option) => (
              <button
                key={`${option.value}-${option.label}`}
                type="button"
                role="option"
                aria-selected={option.value === selectedValue}
                disabled={option.disabled}
                onClick={() => selectOption(option.value)}
                className={`flex h-11 w-full items-center rounded-md px-3 text-left text-sm transition disabled:pointer-events-none disabled:opacity-45 ${
                  option.value === selectedValue
                    ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950'
                    : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900'
                }`}
              >
                <span className="min-w-0 truncate">{option.label}</span>
              </button>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function getOptions(children: ReactNode): SelectOption[] {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement<{ value?: string | number; disabled?: boolean; children?: ReactNode }>(child)) return [];
    const label = getText(child.props.children);
    return [
      {
        value: String(child.props.value ?? label),
        label,
        disabled: Boolean(child.props.disabled),
      },
    ];
  });
}

function getText(value: ReactNode): string {
  return Children.toArray(value)
    .map((child) => (typeof child === 'string' || typeof child === 'number' ? String(child) : ''))
    .join('')
    .trim();
}
