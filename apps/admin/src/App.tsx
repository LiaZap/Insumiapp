import { Navigate, Route, Routes } from 'react-router-dom';
import { isAuthenticated } from './lib/auth';
import { Layout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { PedidosPage } from './pages/PedidosPage';
import { AgrupamentosPage } from './pages/AgrupamentosPage';
import { FornecedoresPage } from './pages/FornecedoresPage';
import { MedicamentosPage } from './pages/MedicamentosPage';
import { EstoquePage } from './pages/EstoquePage';
import { FinanceiroPage } from './pages/FinanceiroPage';
import { UsuariosPage } from './pages/UsuariosPage';
import { RecuperarPage } from './pages/RecuperarPage';
import { CotarPublicoPage } from './pages/CotarPublicoPage';
import { PrivacidadePage } from './pages/PrivacidadePage';
import { SuportePage } from './pages/SuportePage';
import { TermosPage } from './pages/TermosPage';

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
      <Route path="/termos" element={<TermosPage />} />
      <Route path="/recuperar" element={<RecuperarPage />} />
      <Route
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route
          path="/"
          element={
            <ErrorBoundary>
              <DashboardPage />
            </ErrorBoundary>
          }
        />
        <Route
          path="/pedidos"
          element={
            <ErrorBoundary>
              <PedidosPage />
            </ErrorBoundary>
          }
        />
        <Route
          path="/agrupamentos"
          element={
            <ErrorBoundary>
              <AgrupamentosPage />
            </ErrorBoundary>
          }
        />
        <Route
          path="/fornecedores"
          element={
            <ErrorBoundary>
              <FornecedoresPage />
            </ErrorBoundary>
          }
        />
        <Route
          path="/medicamentos"
          element={
            <ErrorBoundary>
              <MedicamentosPage />
            </ErrorBoundary>
          }
        />
        <Route
          path="/estoque"
          element={
            <ErrorBoundary>
              <EstoquePage />
            </ErrorBoundary>
          }
        />
        <Route
          path="/financeiro"
          element={
            <ErrorBoundary>
              <FinanceiroPage />
            </ErrorBoundary>
          }
        />
        <Route
          path="/usuarios"
          element={
            <ErrorBoundary>
              <UsuariosPage />
            </ErrorBoundary>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
