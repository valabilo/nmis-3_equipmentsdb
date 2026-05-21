import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-4 text-center">
      <div>
        <p className="microcopy">404</p>
        <h1 className="mt-3 text-3xl font-semibold text-zinc-950 dark:text-white">Page not found</h1>
        <p className="mt-2 text-zinc-500">The requested workspace view does not exist.</p>
        <Link to="/app" className="mt-6 inline-flex">
          <Button>Return to dashboard</Button>
        </Link>
      </div>
    </main>
  );
}
