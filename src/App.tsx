import { Navigate, Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';
import { AppShell } from './components/layouts/AppShell';
import { useTheme } from './hooks/useTheme';
import { useAuthStore } from './store/authStore';
import { Dashboard } from './pages/Dashboard';
import { EmployeeDetails } from './pages/EmployeeDetails';
import { Employees } from './pages/Employees';
import { Equipments } from './pages/Equipments';
import { Login } from './pages/Login';
import { NotFound } from './pages/NotFound';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';

function RequireAuth({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export function App() {
  useTheme();

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/app" replace />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/app"
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="equipments" element={<Equipments />} />
        <Route path="employees" element={<Employees />} />
        <Route path="employees/:employeeId" element={<EmployeeDetails />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
