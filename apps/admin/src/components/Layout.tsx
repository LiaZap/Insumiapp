import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { currentUser, logout } from '../lib/auth';
import { Logo } from './Logo';

const NAV = [
  { to: '/', label: 'Dashboard', icon: '◆', end: true },
  { to: '/pedidos', label: 'Pedidos', icon: '▣' },
  { to: '/agrupamentos', label: 'Pedidos Agrupados', icon: '⊞' },
  { to: '/fornecedores', label: 'Fornecedores', icon: '⇄' },
  { to: '/medicamentos', label: 'Catálogo', icon: '✚' },
  { to: '/estoque', label: 'Estoque', icon: '▦' },
  { to: '/financeiro', label: 'Financeiro', icon: '$' },
];

function currentPageLabel(path: string): string {
  const exact = NAV.find((n) => n.to === path);
  if (exact) return exact.label;
  const prefix = NAV.find((n) => n.to !== '/' && path.startsWith(n.to));
  return prefix?.label ?? 'Insumia';
}

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = currentUser();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Fecha o drawer ao trocar de rota.
  useEffect(() => setDrawerOpen(false), [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex h-full">
      {/* Sidebar — desktop */}
      <aside className="hidden w-60 flex-col bg-brand-800 text-white md:flex">
        <SidebarContent user={user} onLogout={handleLogout} />
      </aside>

      {/* Drawer overlay — mobile */}
      {drawerOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setDrawerOpen(false)}
          aria-hidden
        />
      ) : null}

      {/* Drawer — mobile */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-64 flex-col bg-brand-800 text-white shadow-xl transition-transform duration-200 md:hidden ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent user={user} onLogout={handleLogout} />
      </aside>

      {/* Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar — mobile */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-black/5 bg-white px-4 md:hidden">
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-brand-700 active:bg-brand-50"
            aria-label="Abrir menu"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="4" y1="7" x2="20" y2="7" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="17" x2="20" y2="17" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <Logo size={26} />
            <span className="text-sm font-bold text-brand-700">
              {currentPageLabel(location.pathname)}
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function SidebarContent({
  user,
  onLogout,
}: {
  user: ReturnType<typeof currentUser>;
  onLogout: () => void;
}) {
  return (
    <>
      <div className="flex items-center gap-2.5 px-6 py-6">
        <Logo size={38} />
        <div>
          <p className="text-sm font-bold leading-none">Insumia</p>
          <p className="mt-0.5 text-[10px] text-white/50">Back Office</p>
        </div>
      </div>

      <nav className="mt-2 flex-1 overflow-y-auto px-3">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `mb-1 flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition ${
                isActive
                  ? 'bg-brand-500 font-semibold text-white'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <span className="w-4 text-center text-xs">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <p className="truncate text-sm font-medium">{user?.nome ?? 'Usuário'}</p>
        <p className="truncate text-[11px] text-white/40">{user?.empresa ?? user?.email}</p>
        <button
          onClick={onLogout}
          className="mt-3 w-full rounded-lg bg-white/10 py-2 text-xs font-medium text-white/80 transition hover:bg-white/20"
        >
          Sair
        </button>
      </div>
    </>
  );
}
