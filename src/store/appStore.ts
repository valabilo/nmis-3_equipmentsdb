import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Theme } from '../types';

type Toast = {
  id: string;
  title: string;
  description?: string;
  tone?: 'default' | 'success' | 'danger';
};

type AppState = {
  theme: Theme;
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  toasts: Toast[];
  setTheme: (theme: Theme) => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  pushToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'system',
      sidebarOpen: false,
      sidebarCollapsed: false,
      toasts: [],
      setTheme: (theme) => set({ theme }),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      pushToast: (toast) =>
        set((state) => ({
          toasts: [{ ...toast, id: crypto.randomUUID() }, ...state.toasts].slice(0, 4),
        })),
      removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
    }),
    {
      name: 'equipment-app-state',
      partialize: (state) => ({ theme: state.theme, sidebarCollapsed: state.sidebarCollapsed }),
    },
  ),
);
