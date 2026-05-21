import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { useTheme } from '../hooks/useTheme';

export function Settings() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="page-stack">
      <section className="section-heading">
        <p className="microcopy">Settings</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white">Workspace configuration</h2>
        <p className="mt-2 text-sm text-zinc-500">Serverless deployment, theme, and Google Apps Script connection details.</p>
      </section>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-7">
          <p className="microcopy">Appearance</p>
          <label className="field-stack mt-5">
            <span className="text-sm font-medium">Theme preference</span>
            <Select value={theme} onChange={(event) => setTheme(event.target.value as typeof theme)}>
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </Select>
          </label>
        </Card>
        <Card className="p-7">
          <p className="microcopy">Google Apps Script API</p>
          <label className="field-stack mt-5">
            <span className="text-sm font-medium">Current endpoint</span>
            <Input value={import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL || 'Mock mode enabled'} readOnly />
          </label>
          <p className="mt-3 text-sm leading-6 text-zinc-500">Set VITE_GOOGLE_APPS_SCRIPT_URL in Vercel to connect live Google Sheets data.</p>
        </Card>
      </div>
    </div>
  );
}
