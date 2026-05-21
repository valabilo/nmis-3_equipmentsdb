import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, type ReactNode } from 'react';

type ModalProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
};

export function Modal({ open, title, children, onClose, footer }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose, open]);

  return (
    <AnimatePresence>
      {open ? (
        <div className="relative z-50" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <motion.div
            className="fixed inset-0 bg-zinc-950/35 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <div className="fixed inset-0 grid place-items-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              className="max-h-[calc(100dvh-1.5rem)] w-full max-w-3xl overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="border-b border-zinc-200 px-4 py-4 sm:px-6 sm:py-5 dark:border-zinc-800">
                <h2 id="modal-title" className="text-base font-semibold text-zinc-950 dark:text-white">
                  {title}
                </h2>
              </div>
              <div className="max-h-[calc(100dvh-11rem)] overflow-y-auto p-4 sm:p-7 thin-scrollbar">{children}</div>
              {footer ? <div className="border-t border-zinc-200 px-4 py-4 sm:px-6 sm:py-5 dark:border-zinc-800">{footer}</div> : null}
            </motion.div>
          </div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
