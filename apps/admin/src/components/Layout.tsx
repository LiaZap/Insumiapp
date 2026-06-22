import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  LayoutDashboard,
  ShoppingCart,
  Layers,
  Truck,
  FlaskConical,
  Package,
  DollarSign,
  Users,
  LogOut,
  ChevronRight,
  Menu,
} from 'lucide-react';
import { currentUser, logout } from '../lib/auth';
import { Logo } from './Logo';

/* ------------------------------------------------------------------ */
/*  Estrutura de navegação agrupada                                     */
/* ------------------------------------------------------------------ */

type NavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  end?: boolean;
};

type NavGroup = {
  heading: string;
  items: NavItem[];
  separator?: boolean;
};

const NAV_GROUPS: NavGroup[] = [
  {
    heading: 'Operação',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/pedidos', label: 'Pedidos', icon: ShoppingCart },
      { to: '/agrupamentos', label: 'Pedidos Agrupados', icon: Layers },
    ],
  },
  {
    heading: 'Catálogo',
    items: [
      { to: '/medicamentos', label: 'Catálogo', icon: FlaskConical },
      { to: '/estoque', label: 'Estoque', icon: Package },
      { to: '/fornecedores', label: 'Fornecedores', icon: Truck },
    ],
  },
  {
    heading: 'Financeiro',
    items: [
      { to: '/financeiro', label: 'Financeiro', icon: DollarSign },
    ],
  },
  {
    heading: 'Administração',
    separator: true,
    items: [
      { to: '/usuarios', label: 'Clientes', icon: Users },
    ],
  },
];

const ALL_NAV = NAV_GROUPS.flatMap((g) => g.items);

function currentPageLabel(path: string): string {
  const exact = ALL_NAV.find((n) => n.to === path);
  if (exact) return exact.label;
  const prefix = ALL_NAV.find((n) => n.to !== '/' && path.startsWith(n.to));
  return prefix?.label ?? 'Insumia';
}

function currentGroupLabel(path: string): string {
  for (const g of NAV_GROUPS) {
    for (const item of g.items) {
      const match = item.end ? path === item.to : path === item.to || path.startsWith(item.to + '/');
      if (match) return g.heading;
    }
  }
  return 'Insumia';
}

/* ------------------------------------------------------------------ */
/*  Avatar com iniciais                                                  */
/* ------------------------------------------------------------------ */

function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  const sizeClass = size === 'sm' ? 'h-7 w-7 text-[10px]' : 'h-8 w-8 text-xs';

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-brand-500 font-bold text-white ${sizeClass}`}
      aria-hidden
    >
      {initials}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  UserMenu — radix dropdown                                           */
/* ------------------------------------------------------------------ */

function UserMenu({
  user,
  onLogout,
}: {
  user: ReturnType<typeof currentUser>;
  onLogout: () => void;
}) {
  const nome = user?.nome ?? 'Usuário';
  const email = user?.email ?? '';
  const role = user?.role ?? '';

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm transition hover:bg-surface-base focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          aria-label={`Menu do usuário: ${nome}`}
        >
          <Avatar name={nome} />
          <span className="hidden max-w-[140px] truncate font-medium text-ink-900 md:block">
            {nome}
          </span>
          <ChevronRight size={14} className="hidden text-ink-400 md:block" aria-hidden />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 min-w-[200px] rounded-xl border border-black/5 bg-white p-1 shadow-lg"
          sideOffset={6}
          align="end"
        >
          <div className="px-3 py-2">
            <p className="truncate text-sm font-semibold text-ink-900">{nome}</p>
            <p className="truncate text-[11px] text-ink-400">{email}</p>
            {role ? (
              <span className="mt-1 inline-block rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-600">
                {role}
              </span>
            ) : null}
          </div>

          <DropdownMenu.Separator className="my-1 h-px bg-black/5" />

          <DropdownMenu.Item asChild>
            <button
              onClick={onLogout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-danger outline-none transition hover:bg-red-50"
            >
              <LogOut size={14} aria-hidden />
              Sair
            </button>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

/* ------------------------------------------------------------------ */
/*  SidebarContent                                                       */
/* ------------------------------------------------------------------ */

function SidebarContent({ onClose }: { onClose?: () => void }) {
  return (
    <>
      <div className="px-6 py-6">
        <Logo variant="white" height={26} />
        <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-white/45">Back Office</p>
      </div>

      <nav className="mt-2 flex-1 overflow-y-auto px-3" aria-label="Navegação principal">
        {NAV_GROUPS.map((group) => (
          <div key={group.heading}>
            {group.separator ? (
              <div className="my-2 border-t border-white/10" />
            ) : null}
            <p className="mb-1 mt-3 px-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">
              {group.heading}
            </p>
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `mb-0.5 flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition ${
                      isActive
                        ? 'bg-brand-500 font-semibold text-white'
                        : 'text-white/60 hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  <Icon size={16} aria-hidden className="shrink-0" />
                  {item.label}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Layout principal                                                     */
/* ------------------------------------------------------------------ */

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = currentUser();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => setDrawerOpen(false), [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const pageLabel = currentPageLabel(location.pathname);
  const groupLabel = currentGroupLabel(location.pathname);

  return (
    <div className="flex h-full">
      {/* Sidebar — desktop */}
      <aside className="hidden w-60 flex-col bg-brand-800 text-white md:flex">
        <SidebarContent />
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
        aria-label="Menu lateral"
      >
        <SidebarContent onClose={() => setDrawerOpen(false)} />
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
            <Menu size={22} aria-hidden />
          </button>
          <div className="flex items-center gap-2.5">
            <Logo height={20} />
            <span className="h-4 w-px bg-black/10" />
            <span className="text-sm font-bold text-brand-700">{pageLabel}</span>
          </div>
        </header>

        {/* AppHeader — desktop */}
        <header className="hidden h-14 shrink-0 items-center justify-between border-b border-black/5 bg-white px-6 md:flex">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-sm text-ink-400">
            <span>{groupLabel}</span>
            <ChevronRight size={14} aria-hidden />
            <span className="font-semibold text-ink-900">{pageLabel}</span>
          </div>

          {/* Ações à direita */}
          <div className="flex items-center gap-3">
            {/* Atalho ⌘K — inerte por enquanto (command palette é P3) */}
            <button
              disabled
              aria-label="Abrir paleta de comandos (em breve)"
              className="hidden items-center gap-1.5 rounded-lg border border-black/10 px-3 py-1.5 text-xs text-ink-400 xl:flex"
            >
              <span>Busca rápida</span>
              <kbd className="rounded bg-surface-base px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
            </button>

            <UserMenu user={user} onLogout={handleLogout} />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
