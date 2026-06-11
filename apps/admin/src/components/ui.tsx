import type { ReactNode } from 'react';

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-black/5 bg-white px-4 py-4 md:px-8 md:py-6">
      <div className="min-w-0">
        <h1 className="text-lg font-bold text-brand-700 md:text-xl">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-ink-500">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-black/5 bg-white ${className}`}>{children}</div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone = 'brand',
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: 'brand' | 'success' | 'danger' | 'warning';
}) {
  const toneColor = {
    brand: 'text-brand-500',
    success: 'text-success',
    danger: 'text-danger',
    warning: 'text-warning',
  }[tone];
  return (
    <Card className="p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-400">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${toneColor}`}>{value}</p>
      {hint ? <p className="mt-1 text-xs text-ink-500">{hint}</p> : null}
    </Card>
  );
}

const STATUS_TONE: Record<string, string> = {
  rascunho: 'bg-gray-100 text-gray-600',
  aguardando_cotacao: 'bg-brand-50 text-brand-600',
  cotado: 'bg-accent-200 text-brand-700',
  confirmado: 'bg-green-100 text-green-700',
  em_separacao: 'bg-amber-100 text-amber-700',
  enviado: 'bg-blue-100 text-blue-700',
  entregue: 'bg-green-100 text-green-700',
  cancelado: 'bg-red-100 text-red-600',
  aberta: 'bg-gray-100 text-gray-600',
  paga: 'bg-green-100 text-green-700',
  vencida: 'bg-amber-100 text-amber-700',
  ok: 'bg-green-100 text-green-700',
  baixo: 'bg-amber-100 text-amber-700',
  esgotado: 'bg-red-100 text-red-600',
};

export function Badge({ status, label }: { status: string; label: string }) {
  const tone = STATUS_TONE[status] ?? 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${tone}`}>
      {label}
    </span>
  );
}

export function EmptyRow({ colSpan, message }: { colSpan: number; message: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-16 text-center text-sm text-ink-400">
        {message}
      </td>
    </tr>
  );
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-100 border-t-brand-500" />
    </div>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Buscar...',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400">
        ⌕
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-64 rounded-xl border border-black/10 bg-white py-2 pl-8 pr-3 text-sm outline-none focus:border-brand-500"
      />
    </div>
  );
}

export function ExportButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-medium text-ink-700 transition hover:bg-surface-base"
    >
      ↓ Exportar CSV
    </button>
  );
}

export function SortHeader({
  label,
  sortKey,
  activeKey,
  dir,
  onSort,
  className = '',
}: {
  label: string;
  sortKey: string;
  activeKey: string | null;
  dir: 'asc' | 'desc';
  onSort: (key: string) => void;
  className?: string;
}) {
  const active = activeKey === sortKey;
  return (
    <th className={`px-6 py-3 font-medium ${className}`}>
      <button
        onClick={() => onSort(sortKey)}
        className={`inline-flex items-center gap-1 transition hover:text-brand-600 ${
          active ? 'text-brand-600' : ''
        }`}
      >
        {label}
        <span className="text-[9px]">{active ? (dir === 'asc' ? '▲' : '▼') : '⇅'}</span>
      </button>
    </th>
  );
}

export function Pagination({
  page,
  totalPages,
  total,
  onPage,
}: {
  page: number;
  totalPages: number;
  total: number;
  onPage: (p: number) => void;
}) {
  if (total === 0) return null;
  return (
    <div className="flex items-center justify-between border-t border-black/5 px-6 py-3 text-sm">
      <span className="text-ink-400">{total} registro(s)</span>
      <div className="flex items-center gap-2">
        <button
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          className="rounded-lg border border-black/10 px-3 py-1 text-ink-700 disabled:opacity-40"
        >
          Anterior
        </button>
        <span className="text-ink-500">
          {page} / {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => onPage(page + 1)}
          className="rounded-lg border border-black/10 px-3 py-1 text-ink-700 disabled:opacity-40"
        >
          Próxima
        </button>
      </div>
    </div>
  );
}
