import { Link, useLocation } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { navigation } from '../../constants/navigation';
import { useAppStore } from '../../store/appStore';

export function Sidebar() {
  const open = useAppStore((state) => state.sidebarOpen);
  const setOpen = useAppStore((state) => state.setSidebarOpen);
  const collapsed = useAppStore((state) => state.sidebarCollapsed);
  const setCollapsed = useAppStore((state) => state.setSidebarCollapsed);
  const location = useLocation();
  const currentHref = `${location.pathname}${location.search}`;

  const isActive = (href: string) => {
    if (href.includes('?')) return currentHref === href;
    if (href === '/app') return location.pathname === '/app' && !location.search;
    return location.pathname === href || location.pathname.startsWith(`${href}/`);
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-zinc-950/30 backdrop-blur-sm transition lg:hidden ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={() => setOpen(false)}
      />
      <aside
        className={`group fixed inset-y-0 left-0 z-40 flex h-dvh max-h-dvh w-72 flex-col overflow-hidden border-r border-zinc-200/80 bg-zinc-100/92 px-4 py-5 backdrop-blur-xl transition-[width,transform,background-color] duration-300 lg:translate-x-0 dark:border-zinc-800 dark:bg-zinc-950 ${
          collapsed ? 'lg:w-20' : ''
        } ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className={`relative shrink-0 flex items-center gap-3 px-2 py-2 ${collapsed ? 'lg:justify-center lg:px-0' : ''}`}>
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-zinc-950 text-sm font-semibold text-white dark:bg-white dark:text-zinc-950">
            ED
          </div>
          <div className={`min-w-0 transition ${collapsed ? 'lg:hidden' : ''}`}>
            <p className="text-sm font-semibold text-zinc-950 dark:text-white">Equipment Database</p>
            <p className="text-xs text-zinc-500">Asset management system</p>
          </div>
          <button className="ml-auto rounded-lg p-2 lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
            <XMarkIcon className="size-5" />
          </button>
        </div>
        <button
          className="pointer-events-none absolute right-2 top-6 hidden size-8 place-items-center rounded-lg border border-zinc-200 bg-white text-zinc-600 opacity-0 shadow-sm transition hover:text-zinc-950 focus-visible:pointer-events-auto focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 group-hover:pointer-events-auto group-hover:opacity-100 lg:grid dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:text-white"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRightIcon className="size-4" /> : <ChevronLeftIcon className="size-4" />}
        </button>
        <nav className="mt-8 min-h-0 shrink space-y-1.5 overflow-hidden">
          {navigation.map((item) => {
            const active = isActive(item.href);

            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setOpen(false)}
                title={collapsed ? item.name : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                  collapsed ? 'lg:justify-center lg:px-2.5' : ''
                } ${
                  active
                    ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950'
                    : 'text-zinc-600 hover:bg-white hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white'
                }`}
              >
                <item.icon className="size-5 shrink-0" />
                <span className={`truncate ${collapsed ? 'lg:hidden' : ''}`}>{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <div
          className={`mt-auto shrink-0 rounded-xl border border-zinc-200 bg-white/62 p-4 dark:border-zinc-800 dark:bg-zinc-900/45 ${
            collapsed ? 'lg:hidden' : ''
          }`}
        >
            <p className="microcopy">Workspace</p>
            <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-200">{import.meta.env.VITE_ORGANIZATION_NAME}</p>
        </div>
      </aside>
      <div className={`hidden shrink-0 transition-[width] duration-300 lg:block ${collapsed ? 'w-20' : 'w-72'}`} aria-hidden />
    </>
  );
}
