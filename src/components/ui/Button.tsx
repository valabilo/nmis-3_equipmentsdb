import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  icon?: ReactNode;
  loading?: boolean;
};

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200',
  secondary:
    'border border-zinc-200 bg-white/75 text-zinc-950 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-50 dark:hover:bg-zinc-800',
  ghost: 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white',
  danger: 'bg-rose-600 text-white hover:bg-rose-500',
};

export function Button({ className = '', variant = 'primary', icon, loading = false, children, disabled, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex h-10 max-w-full items-center justify-center gap-2.5 rounded-lg px-4 text-sm font-medium leading-normal transition disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <span className="size-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
      ) : icon ? (
        <span className="flex size-4 shrink-0 items-center justify-center overflow-visible [&>svg]:size-4 [&>svg]:overflow-visible">{icon}</span>
      ) : null}
      {children ? <span className="min-w-0 truncate">{children}</span> : null}
    </button>
  );
}
