import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';

export function AppShell() {
  return (
    <div className="flex min-h-screen overflow-x-clip">
      <Sidebar />
      <div className="min-w-0 flex-1 overflow-x-clip">
        <TopNav />
        <main className="mx-auto w-full max-w-[1500px] px-3 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
