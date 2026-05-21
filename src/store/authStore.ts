import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type AuthState = {
  isAuthenticated: boolean;
  userName: string;
  login: (password: string) => boolean;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      userName: 'Property Custodian',
      login: (password) => {
        const expected = import.meta.env.VITE_AUTH_PASSWORD || 'change-this-password';
        const ok = password === expected;
        if (ok) set({ isAuthenticated: true });
        return ok;
      },
      logout: () => set({ isAuthenticated: false }),
    }),
    { name: 'equipment-auth' },
  ),
);
