import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Pedido, PedidoStatus } from '@insumia/shared';
import { api } from '../lib/api';
import { money, dateTime } from '../lib/format';
import { STATUS_LABEL, NEXT_STATUS } from '../lib/labels';
import { useTableControls } from '../lib/useTableControls';
import { exportToCsv } from '../lib/csv';
import {
  PageHeader,
  Card,
  Badge,
  EmptyRow,
  Spinner,
  SearchInput,
  SortHeader,
  Pagination,
  ExportButton,
} from '../components/ui';
import { CotacaoForm } from '../components/CotacaoForm';

type PedidoAdmin = Pedido & {
  usuario?: { nome: string; empresa: string | null; email: string };
};

const FILTERS: Array<{ key: string; label: string; match: (p: Pedido) => boolean }> = [
  { key: 'todos', label: 'Todos', match: () => true },
  { key: 'pendentes', label: 'Pendentes', match: (p) => p.status === 'aguardando_cotacao' || p.status === 'cotado' },
  { key: 'andamento', label: 'Em andamento', match: (p) => ['confirmado', 'em_separacao', 'enviado'].includes(p.status) },
  { key: 'finalizados', label: 'Finalizados', match: (p) => p.status === 'entregue' || p.status === 'cancelado' },
];

export function PedidosPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState('todos');
  const [selected, setSelected] = useState<PedidoAdmin | null>(null);
  const [recotar, setRecotar] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['pedidos-todos'],
    queryFn: async () => (await api.get<PedidoAdmin[]>('/api/v1/pedidos?escopo=todos')).data,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: PedidoStatus }) =>
      (await api.patch<PedidoAdmin>(`/api/v1/pedidos/${id}/status`, { status })).data,
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ['pedidos-todos'] });
      setSelected(updated);
    },
  });

  const byFilter = useMemo(() => {
    const f = FILTERS.find((x) => x.key === filter)!;
    return (data ?? []).filter(f.match);
  }, [data, filter]);

  const table = useTableControls(byFilter, {
    searchText: (p) => `${p.numero} ${p.usuario?.empresa ?? ''} ${p.usuario?.nome ?? ''}`,
    sortAccessors: {
      numero: (p) => p.numero,
      cliente: (p) => p.usuario?.empresa ?? p.usuario?.nome ?? '',
      valor: (p) => Number(p.total),
      data: (p) => p.criadoEm,
      status: (p) => p.status,
    },
    initialSort: { key: 'data', dir: 'desc' },
  });

  const handleExport = () => {
    exportToCsv('pedidos', table.sorted, [
      { header: 'Pedido', value: (p) => p.numero },
      { header: 'Cliente', value: (p) => p.usuario?.empresa ?? p.usuario?.nome ?? '' },
      { header: 'Itens', value: (p) => p.itens.length },
      { header: 'Valor', value: (p) => Number(p.total).toFixed(2) },
      { header: 'Status', value: (p) => STATUS_LABEL[p.status] },
      { header: 'Data', value: (p) => dateTime(p.criadoEm) },
    ]);
  };

  return (
    <div>
      <PageHeader
        title="Pedidos"
        subtitle="Gestão de pedidos das clínicas"
        action={<ExportButton onClick={handleExport} />}
      />
      <div className="p-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  filter === f.key
                    ? 'bg-brand-500 text-white'
                    : 'bg-white text-ink-500 hover:bg-brand-50'
                }`}
              >
                {f.label} ({(data ?? []).filter(f.match).length})
              </button>
            ))}
          </div>
          <SearchInput
            value={table.query}
            onChange={table.setQuery}
            placeholder="Buscar pedido ou cliente..."
          />
        </div>

        <Card>
          {isLoading ? (
            <Spinner />
          ) : (
            <>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-black/5 text-xs uppercase tracking-wide text-ink-400">
                    <SortHeader label="Pedido" sortKey="numero" activeKey={table.sortKey} dir={table.sortDir} onSort={table.toggleSort} />
                    <SortHeader label="Cliente" sortKey="cliente" activeKey={table.sortKey} dir={table.sortDir} onSort={table.toggleSort} />
                    <th className="px-6 py-3 font-medium">Itens</th>
                    <SortHeader label="Valor" sortKey="valor" activeKey={table.sortKey} dir={table.sortDir} onSort={table.toggleSort} />
                    <SortHeader label="Data" sortKey="data" activeKey={table.sortKey} dir={table.sortDir} onSort={table.toggleSort} />
                    <SortHeader label="Status" sortKey="status" activeKey={table.sortKey} dir={table.sortDir} onSort={table.toggleSort} />
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {table.pageRows.length === 0 ? (
                    <EmptyRow colSpan={6} message="Nenhum pedido encontrado" />
                  ) : (
                    table.pageRows.map((p) => (
                      <tr
                        key={p.id}
                        onClick={() => {
                          setRecotar(false);
                          setSelected(p);
                        }}
                        className="cursor-pointer hover:bg-surface-base"
                      >
                        <td className="px-6 py-3 font-medium text-ink-900">{p.numero}</td>
                        <td className="px-6 py-3 text-ink-700">
                          {p.usuario?.empresa ?? p.usuario?.nome ?? '—'}
                        </td>
                        <td className="px-6 py-3 text-ink-500">{p.itens.length}</td>
                        <td className="px-6 py-3 font-semibold text-ink-900">{money(p.total)}</td>
                        <td className="px-6 py-3 text-ink-500">{dateTime(p.criadoEm)}</td>
                        <td className="px-6 py-3">
                          <Badge status={p.status} label={STATUS_LABEL[p.status]} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
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

      {/* Drawer detalhe */}
      {selected ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={() => setSelected(null)}>
          <div
            className="h-full w-[440px] overflow-y-auto bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-black/5 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-brand-700">{selected.numero}</h2>
                <p className="text-sm text-ink-500">
                  {selected.usuario?.empresa ?? selected.usuario?.nome ?? '—'}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-2xl leading-none text-ink-400 hover:text-ink-700"
              >
                ×
              </button>
            </div>

            <div className="px-6 py-5">
              <div className="flex items-center justify-between">
                <Badge status={selected.status} label={STATUS_LABEL[selected.status]} />
                <span className="text-lg font-bold text-brand-700">{money(selected.total)}</span>
              </div>

              {/* Motor de cotação */}
              {selected.status === 'aguardando_cotacao' ? (
                <div className="mt-5">
                  <CotacaoForm pedido={selected} onDone={() => setSelected(null)} />
                </div>
              ) : selected.status === 'cotado' ? (
                <div className="mt-5 rounded-xl border border-brand-100 bg-brand-50/40 p-4">
                  <p className="text-sm font-semibold text-brand-600">Cotação enviada</p>
                  <p className="mt-1 text-xs text-ink-500">
                    Aguardando resposta do cliente.
                    {selected.cotacaoValidaAte
                      ? ` Válida até ${dateTime(selected.cotacaoValidaAte)}.`
                      : ''}
                  </p>
                  {selected.prazoEntregaDias != null ? (
                    <p className="mt-1 text-xs text-ink-500">
                      Prazo de entrega: {selected.prazoEntregaDias} dias
                    </p>
                  ) : null}
                  <button
                    onClick={() => setRecotar(true)}
                    className="mt-3 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-brand-600 ring-1 ring-brand-100 hover:bg-brand-50"
                  >
                    Refazer cotação
                  </button>
                  {recotar ? (
                    <div className="mt-3">
                      <CotacaoForm pedido={selected} onDone={() => setSelected(null)} />
                    </div>
                  ) : null}
                </div>
              ) : NEXT_STATUS[selected.status].length > 0 ? (
                <div className="mt-5">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-400">
                    Avançar status
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {NEXT_STATUS[selected.status].map((next) => (
                      <button
                        key={next}
                        disabled={updateStatus.isPending}
                        onClick={() => updateStatus.mutate({ id: selected.id, status: next })}
                        className={`rounded-lg px-3 py-2 text-xs font-semibold transition disabled:opacity-50 ${
                          next === 'cancelado'
                            ? 'bg-red-50 text-danger hover:bg-red-100'
                            : 'bg-brand-500 text-white hover:bg-brand-600'
                        }`}
                      >
                        {STATUS_LABEL[next]}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="mt-5 text-sm text-ink-400">Pedido finalizado.</p>
              )}

              <div className="mt-6">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-400">
                  Itens ({selected.itens.length})
                </p>
                <div className="divide-y divide-black/5 rounded-xl border border-black/5">
                  {selected.itens.map((it) => (
                    <div key={it.id} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-ink-900">{it.medicamento.nome}</p>
                        <p className="text-xs text-ink-500">
                          {it.medicamento.fabricante} • {it.quantidade}x
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-ink-700">
                        {money(Number(it.precoUnitario) * it.quantidade)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="mt-6 text-xs text-ink-400">Criado em {dateTime(selected.criadoEm)}</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
