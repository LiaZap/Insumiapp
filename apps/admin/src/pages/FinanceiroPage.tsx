import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Conta, ContaStatus, DashboardFinanceiro } from '@insumia/shared';
import { api } from '../lib/api';
import { money, date } from '../lib/format';
import { useTableControls } from '../lib/useTableControls';
import { exportToCsv } from '../lib/csv';
import {
  PageHeader,
  Card,
  StatCard,
  Badge,
  EmptyRow,
  Spinner,
  SearchInput,
  SortHeader,
  Pagination,
  ExportButton,
} from '../components/ui';

const STATUS_LABEL: Record<ContaStatus, string> = {
  aberta: 'Aberta',
  paga: 'Paga',
  vencida: 'Vencida',
  cancelada: 'Cancelada',
};

const FILTERS = [
  { key: 'todos', label: 'Todas' },
  { key: 'pagar', label: 'A Pagar' },
  { key: 'receber', label: 'A Receber' },
] as const;

export function FinanceiroPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<'todos' | 'pagar' | 'receber'>('todos');

  const dashboard = useQuery({
    queryKey: ['fin-dashboard'],
    queryFn: async () => (await api.get<DashboardFinanceiro>('/api/v1/financeiro/dashboard')).data,
  });
  const contas = useQuery({
    queryKey: ['contas'],
    queryFn: async () => (await api.get<Conta[]>('/api/v1/financeiro/contas')).data,
  });

  const pagar = useMutation({
    mutationFn: async (id: string) => api.patch(`/api/v1/financeiro/contas/${id}/pagar`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contas'] });
      qc.invalidateQueries({ queryKey: ['fin-dashboard'] });
    },
  });

  const byFilter = (contas.data ?? []).filter((c) => filter === 'todos' || c.tipo === filter);

  const table = useTableControls(byFilter, {
    searchText: (c) => `${c.descricao} ${c.tipo}`,
    sortAccessors: {
      descricao: (c) => c.descricao,
      vencimento: (c) => c.vencimento,
      valor: (c) => Number(c.valor),
      status: (c) => c.status,
    },
    initialSort: { key: 'vencimento', dir: 'asc' },
  });

  const handleExport = () =>
    exportToCsv('financeiro', table.sorted, [
      { header: 'Descrição', value: (c) => c.descricao },
      { header: 'Tipo', value: (c) => (c.tipo === 'pagar' ? 'A pagar' : 'A receber') },
      { header: 'Vencimento', value: (c) => date(c.vencimento) },
      { header: 'Valor', value: (c) => Number(c.valor).toFixed(2) },
      { header: 'Status', value: (c) => STATUS_LABEL[c.status] },
    ]);

  return (
    <div>
      <PageHeader
        title="Financeiro"
        subtitle="Contas a pagar e a receber"
        action={<ExportButton onClick={handleExport} />}
      />
      <div className="p-4 md:p-8">
        {dashboard.data ? (
          <div className="mb-6 grid grid-cols-3 gap-4">
            <StatCard label="A pagar" value={money(dashboard.data.totalAPagar)} tone="danger" />
            <StatCard label="A receber" value={money(dashboard.data.totalAReceber)} tone="success" />
            <StatCard
              label="Contas vencidas"
              value={String(dashboard.data.vencidasCount)}
              tone="warning"
            />
          </div>
        ) : null}

        <div className="mb-4 flex items-center justify-between">
          <div className="flex gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  filter === f.key ? 'bg-brand-500 text-white' : 'bg-white text-ink-500 hover:bg-brand-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <SearchInput value={table.query} onChange={table.setQuery} placeholder="Buscar conta..." />
        </div>

        <Card>
          {contas.isLoading ? (
            <Spinner />
          ) : (
            <>
              <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-black/5 text-xs uppercase tracking-wide text-ink-400">
                    <SortHeader label="Descrição" sortKey="descricao" activeKey={table.sortKey} dir={table.sortDir} onSort={table.toggleSort} />
                    <th className="px-6 py-3 font-medium">Tipo</th>
                    <SortHeader label="Vencimento" sortKey="vencimento" activeKey={table.sortKey} dir={table.sortDir} onSort={table.toggleSort} />
                    <SortHeader label="Valor" sortKey="valor" activeKey={table.sortKey} dir={table.sortDir} onSort={table.toggleSort} />
                    <SortHeader label="Status" sortKey="status" activeKey={table.sortKey} dir={table.sortDir} onSort={table.toggleSort} />
                    <th className="px-6 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {table.pageRows.length === 0 ? (
                    <EmptyRow colSpan={6} message="Nenhuma conta encontrada" />
                  ) : (
                    table.pageRows.map((c) => (
                      <tr key={c.id} className="hover:bg-surface-base">
                        <td className="px-6 py-3 font-medium text-ink-900">{c.descricao}</td>
                        <td className="px-6 py-3 text-ink-500">
                          {c.tipo === 'pagar' ? 'A pagar' : 'A receber'}
                        </td>
                        <td className="px-6 py-3 text-ink-500">{date(c.vencimento)}</td>
                        <td
                          className={`px-6 py-3 font-semibold ${
                            c.tipo === 'pagar' ? 'text-danger' : 'text-success'
                          }`}
                        >
                          {c.tipo === 'pagar' ? '-' : '+'}
                          {money(c.valor)}
                        </td>
                        <td className="px-6 py-3">
                          <Badge status={c.status} label={STATUS_LABEL[c.status]} />
                        </td>
                        <td className="px-6 py-3 text-right">
                          {c.status !== 'paga' && c.status !== 'cancelada' ? (
                            <button
                              onClick={() => pagar.mutate(c.id)}
                              disabled={pagar.isPending}
                              className="rounded-lg bg-green-50 px-3 py-1.5 text-xs font-semibold text-success transition hover:bg-green-100 disabled:opacity-50"
                            >
                              Marcar paga
                            </button>
                          ) : null}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table></div>
              <Pagination
                page={table.page}
                totalPages={table.totalPages}
                total={table.total}
                onPage={table.setPage}
              />
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
