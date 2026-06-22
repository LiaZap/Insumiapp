import type { ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { getBadgeClass } from '../lib/statusTokens';

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
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
  value: string | number;
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

export function Badge({ status, label }: { status: string; label: string }) {
  const tone = getBadgeClass(status);
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

/** Campo de detalhe somente-leitura reutilizável (drawers, formulários de visualização). */
export function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  if (onChange) {
    return (
      <div className="mb-3">
        <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-400">
          {label}
        </label>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-brand-100 px-3 py-2 text-sm outline-none focus:border-brand-500"
        />
      </div>
    );
  }
  return (
    <div className="mb-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-ink-400">{label}</p>
      <p className="mt-1 text-sm text-ink-900">{value}</p>
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
  const ariaSort: 'ascending' | 'descending' | 'none' = active
    ? dir === 'asc'
      ? 'ascending'
      : 'descending'
    : 'none';

  return (
    <th className={`px-6 py-3 font-medium ${className}`} aria-sort={ariaSort}>
      <button
        onClick={() => onSort(sortKey)}
        className={`inline-flex items-center gap-1 transition hover:text-brand-600 ${
          active ? 'text-brand-600' : ''
        }`}
      >
        {label}
        <span className="text-[9px]" aria-hidden>
          {active ? (dir === 'asc' ? '▲' : '▼') : '⇅'}
        </span>
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
          aria-label="Página anterior"
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
          aria-label="Próxima página"
        >
          Próxima
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ErrorState — falha de API com retry                                */
/* ------------------------------------------------------------------ */

export function ErrorState({
  message = 'Não foi possível carregar os dados.',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <AlertCircle className="mb-3 h-10 w-10 text-danger/60" aria-hidden />
      <p className="text-sm font-medium text-ink-700">{message}</p>
      {onRetry ? (
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-600 transition hover:bg-brand-100"
        >
          <RefreshCw size={14} aria-hidden />
          Tentar novamente
        </button>
      ) : null}
    </div>
  );
}

export function ErrorRow({
  colSpan,
  message,
  onRetry,
}: {
  colSpan: number;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <tr>
      <td colSpan={colSpan}>
        <ErrorState message={message} onRetry={onRetry} />
      </td>
    </tr>
  );
}

/* ------------------------------------------------------------------ */
/*  Skeleton — shimmer para estados de carregamento                    */
/* ------------------------------------------------------------------ */

function shimmer(className: string) {
  return (
    <div
      className={`animate-shimmer rounded bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] ${className}`}
      aria-hidden
    />
  );
}

export function SkeletonTableRow({ cols = 5 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          {shimmer('h-4 w-full max-w-[140px]')}
        </td>
      ))}
    </tr>
  );
}

export function SkeletonTable({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonTableRow key={i} cols={cols} />
      ))}
    </>
  );
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <Card className={`p-5 ${className}`}>
      {shimmer('h-3 w-20 mb-3')}
      {shimmer('h-7 w-32')}
    </Card>
  );
}

export function SkeletonChartBlock({ className = '' }: { className?: string }) {
  return (
    <Card className={`p-5 ${className}`}>
      {shimmer('h-4 w-32 mb-4')}
      {shimmer('h-[260px] w-full rounded-xl')}
    </Card>
  );
}
