import { Navigate, Route, Routes } from 'react-router-dom';
import { isAuthenticated } from './lib/auth';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { PedidosPage } from './pages/PedidosPage';
import { MedicamentosPage } from './pages/MedicamentosPage';
import { EstoquePage } from './pages/EstoquePage';
import { FinanceiroPage } from './pages/FinanceiroPage';

function RequireAuth({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/pedidos" element={<PedidosPage />} />
        <Route path="/medicamentos" element={<MedicamentosPage />} />
        <Route path="/estoque" element={<EstoquePage />} />
        <Route path="/financeiro" element={<FinanceiroPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
