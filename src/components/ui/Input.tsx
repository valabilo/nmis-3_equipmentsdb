import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`h-11 w-full rounded-lg border border-zinc-200 bg-white/80 px-3.5 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-4 focus:ring-zinc-950/5 dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-50 dark:focus:border-zinc-600 ${className}`}
      {...props}
    />
  );
}

export function Textarea({ className = '', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`min-h-28 w-full rounded-lg border border-zinc-200 bg-white/80 px-3.5 py-3 text-sm leading-6 text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-4 focus:ring-zinc-950/5 dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-50 dark:focus:border-zinc-600 ${className}`}
      {...props}
    />
  );
}
