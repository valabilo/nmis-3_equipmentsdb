import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';

export function AppShell() {
  return (
    <div className="flex min-h-screen overflow-x-clip">
      <Sidebar />
      <div className="min-w-0 flex-1 overflow-x-clip">
        <TopNav />
        <main className="mx-auto w-full max-w-[1500px] px-3 pb-5 pt-20 sm:px-6 sm:pb-7 sm:pt-24 lg:px-8 lg:pb-8 lg:pt-24">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
