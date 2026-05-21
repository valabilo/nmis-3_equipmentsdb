import { ArrowRightOnRectangleIcon, Bars3Icon, MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import { useLocation } from 'react-router-dom';
import { Button } from '../ui/Button';
import { SearchBar } from '../ui/SearchBar';
import { useTheme } from '../../hooks/useTheme';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';

export function TopNav() {
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const setSidebarOpen = useAppStore((state) => state.setSidebarOpen);
  const sidebarCollapsed = useAppStore((state) => state.sidebarCollapsed);
  const logout = useAuthStore((state) => state.logout);
  const title = location.pathname.split('/').filter(Boolean).at(-1) ?? 'Dashboard';

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b border-zinc-200 bg-white/92 px-3 py-2.5 backdrop-blur-xl transition-[left] duration-300 sm:px-4 sm:py-4 dark:border-zinc-800 dark:bg-zinc-950/90 ${
        sidebarCollapsed ? 'lg:left-20' : 'lg:left-72'
      }`}
    >
      <div className="flex min-w-0 items-center gap-2 sm:gap-4">
        <div className="min-w-0">
          <p className="microcopy hidden sm:block">Module</p>
          <h1 className="truncate text-base font-semibold capitalize text-zinc-950 sm:text-lg dark:text-white">{title}</h1>
        </div>
        <SearchBar value="" onChange={() => undefined} placeholder="Quick search..." className="ml-auto hidden w-80 md:block" />
        <Button
          variant="ghost"
          className="ml-auto shrink-0 px-3 md:ml-0"
          aria-label="Toggle theme"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          icon={theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        />
        <Button variant="secondary" className="hidden h-9 min-w-fit shrink-0 gap-2 px-3 sm:inline-flex" onClick={logout} icon={<ArrowRightOnRectangleIcon />}>
          Sign out
        </Button>
        <Button variant="secondary" className="h-9 shrink-0 px-3 sm:hidden" onClick={logout} aria-label="Sign out" icon={<ArrowRightOnRectangleIcon />} />
        <button
          className="shrink-0 rounded-lg p-2 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950 lg:hidden dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <Bars3Icon className="size-5" />
        </button>
      </div>
    </header>
  );
}
