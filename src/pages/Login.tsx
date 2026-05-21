import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { useAuthStore } from '../store/authStore';

export function Login() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const login = useAuthStore((state) => state.login);

  if (isAuthenticated) return <Navigate to="/app" replace />;

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto grid size-12 place-items-center rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
            <ShieldCheckIcon className="size-6" />
          </div>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white">Equipment Database</h1>
          <p className="mt-2 text-sm text-zinc-500">Secure property accountability workspace</p>
        </div>
        <Card className="p-7">
          <form
            className="space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              setError('');
              if (!login(password)) setError('Invalid access password.');
            }}
          >
            <label className="field-stack">
              <span className="microcopy">Password gate</span>
              <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoFocus />
            </label>
            {error ? <p className="text-sm text-rose-600">{error}</p> : null}
            <Button className="w-full">Enter workspace</Button>
          </form>
        </Card>
      </motion.div>
    </main>
  );
}
