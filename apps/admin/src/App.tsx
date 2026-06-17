import { Navigate, Route, Routes } from 'react-router-dom';
import { isAuthenticated } from './lib/auth';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { PedidosPage } from './pages/PedidosPage';
import { AgrupamentosPage } from './pages/AgrupamentosPage';
import { FornecedoresPage } from './pages/FornecedoresPage';
import { MedicamentosPage } from './pages/MedicamentosPage';
import { EstoquePage } from './pages/EstoquePage';
import { FinanceiroPage } from './pages/FinanceiroPage';
import { CotarPublicoPage } from './pages/CotarPublicoPage';
import { PrivacidadePage } from './pages/PrivacidadePage';
import { SuportePage } from './pages/SuportePage';

function RequireAuth({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      {/* Páginas públicas — sem login */}
      <Route path="/cotar/:token" element={<CotarPublicoPage />} />
      <Route path="/privacidade" element={<PrivacidadePage />} />
      <Route path="/suporte" element={<SuportePage />} />
      <Route
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/pedidos" element={<PedidosPage />} />
        <Route path="/agrupamentos" element={<AgrupamentosPage />} />
        <Route path="/fornecedores" element={<FornecedoresPage />} />
        <Route path="/medicamentos" element={<MedicamentosPage />} />
        <Route path="/estoque" element={<EstoquePage />} />
        <Route path="/financeiro" element={<FinanceiroPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
