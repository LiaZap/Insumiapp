import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { currentUser, logout } from '../lib/auth';
import { Logo } from './Logo';

const NAV = [
  { to: '/', label: 'Dashboard', icon: '◆', end: true },
  { to: '/pedidos', label: 'Pedidos', icon: '▣' },
  { to: '/medicamentos', label: 'Catálogo', icon: '✚' },
  { to: '/estoque', label: 'Estoque', icon: '▦' },
  { to: '/financeiro', label: 'Financeiro', icon: '$' },
];

export function Layout() {
  const navigate = useNavigate();
  const user = currentUser();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside className="flex w-60 flex-col bg-brand-800 text-white">
        <div className="flex items-center gap-2.5 px-6 py-6">
          <Logo size={38} />
          <div>
            <p className="text-sm font-bold leading-none">Insumia</p>
            <p className="mt-0.5 text-[10px] text-white/50">Back Office</p>
          </div>
        </div>

        <nav className="mt-2 flex-1 px-3">
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
            onClick={handleLogout}
            className="mt-3 w-full rounded-lg bg-white/10 py-2 text-xs font-medium text-white/80 transition hover:bg-white/20"
          >
            Sair
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
