import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { useAppStore } from '../../store/appStore';

export function ToastViewport() {
  const toasts = useAppStore((state) => state.toasts);
  const removeToast = useAppStore((state) => state.removeToast);

  useEffect(() => {
    const timers = toasts.map((toast) => window.setTimeout(() => removeToast(toast.id), 3600));
    return () => timers.forEach(window.clearTimeout);
  }, [removeToast, toasts]);

  return (
    <div className="fixed right-4 top-4 z-[70] flex w-full max-w-sm flex-col gap-2 no-print">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 16, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 16, scale: 0.98 }}
            className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <p className="text-sm font-semibold text-zinc-950 dark:text-white">{toast.title}</p>
            {toast.description ? <p className="mt-1 text-sm text-zinc-500">{toast.description}</p> : null}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
