import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CATEGORIA_LABEL, type EstoqueResumo, type Movimentacao } from '@insumia/shared';
import { api } from '../lib/api';
import { money, dateTime } from '../lib/format';
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

const TIPO_LABEL: Record<string, string> = {
  entrada: 'Entrada',
  saida: 'Saída',
  ajuste: 'Ajuste',
  perda: 'Perda',
  transferencia: 'Transferência',
};

const STATUS_LABEL: Record<string, string> = { ok: 'OK', baixo: 'Baixo', esgotado: 'Esgotado' };

function EstoqueTab({ rows }: { rows: EstoqueResumo[] }) {
  const table = useTableControls(rows, {
    searchText: (i) => `${i.medicamento.nome} ${i.medicamento.fabricante ?? ''}`,
    sortAccessors: {
      produto: (i) => i.medicamento.nome ?? '',
      quantidade: (i) => i.quantidade,
      valor: (i) => Number(i.medicamento.precoUnitario ?? 0) * i.quantidade,
      status: (i) => i.status,
    },
    initialSort: { key: 'produto', dir: 'asc' },
  });

  const handleExport = () =>
    exportToCsv('estoque', table.sorted, [
      { header: 'Produto', value: (i) => i.medicamento.nome ?? '' },
      { header: 'Fabricante', value: (i) => i.medicamento.fabricante ?? '' },
      { header: 'Quantidade', value: (i) => i.quantidade },
      {
        header: 'Valor em estoque',
        value: (i) => (Number(i.medicamento.precoUnitario ?? 0) * i.quantidade).toFixed(2),
      },
      { header: 'Status', value: (i) => STATUS_LABEL[i.status] },
    ]);

  return (
    <>
      <div className="mb-4 flex justify-between">
        <SearchInput value={table.query} onChange={table.setQuery} placeholder="Buscar produto..." />
        <ExportButton onClick={handleExport} />
      </div>
      <Card>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-black/5 text-xs uppercase tracking-wide text-ink-400">
              <SortHeader label="Produto" sortKey="produto" activeKey={table.sortKey} dir={table.sortDir} onSort={table.toggleSort} />
              <th className="px-6 py-3 font-medium">Categoria</th>
              <SortHeader label="Quantidade" sortKey="quantidade" activeKey={table.sortKey} dir={table.sortDir} onSort={table.toggleSort} />
              <SortHeader label="Valor em estoque" sortKey="valor" activeKey={table.sortKey} dir={table.sortDir} onSort={table.toggleSort} />
              <SortHeader label="Status" sortKey="status" activeKey={table.sortKey} dir={table.sortDir} onSort={table.toggleSort} />
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {table.pageRows.length === 0 ? (
              <EmptyRow colSpan={5} message="Nenhum produto encontrado" />
            ) : (
              table.pageRows.map((i) => (
                <tr key={i.medicamento.id} className="hover:bg-surface-base">
                  <td className="px-6 py-3 font-medium text-ink-900">{i.medicamento.nome}</td>
                  <td className="px-6 py-3 text-ink-500">
                    {i.medicamento.categoria ? CATEGORIA_LABEL[i.medicamento.categoria] : '—'}
                  </td>
                  <td className="px-6 py-3 font-semibold text-ink-900">{i.quantidade} un</td>
                  <td className="px-6 py-3 text-ink-700">
                    {money(Number(i.medicamento.precoUnitario ?? 0) * i.quantidade)}
                  </td>
                  <td className="px-6 py-3">
                    <Badge status={i.status} label={STATUS_LABEL[i.status]} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <Pagination page={table.page} totalPages={table.totalPages} total={table.total} onPage={table.setPage} />
      </Card>
    </>
  );
}

function MovimentacoesTab({ rows }: { rows: Movimentacao[] }) {
  const table = useTableControls(rows, {
    searchText: (m) => `${m.medicamento.nome} ${m.usuario?.nome ?? ''} ${TIPO_LABEL[m.tipo]}`,
    sortAccessors: {
      produto: (m) => m.medicamento.nome ?? '',
      tipo: (m) => m.tipo,
      quantidade: (m) => m.quantidade,
      data: (m) => m.criadoEm,
    },
    initialSort: { key: 'data', dir: 'desc' },
  });

  const handleExport = () =>
    exportToCsv('movimentacoes', table.sorted, [
      { header: 'Produto', value: (m) => m.medicamento.nome ?? '' },
      { header: 'Tipo', value: (m) => TIPO_LABEL[m.tipo] },
      { header: 'Quantidade', value: (m) => m.quantidade },
      { header: 'Responsável', value: (m) => m.usuario?.nome ?? '' },
      { header: 'Data', value: (m) => dateTime(m.criadoEm) },
    ]);

  return (
    <>
      <div className="mb-4 flex justify-between">
        <SearchInput value={table.query} onChange={table.setQuery} placeholder="Buscar movimentação..." />
        <ExportButton onClick={handleExport} />
      </div>
      <Card>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-black/5 text-xs uppercase tracking-wide text-ink-400">
              <SortHeader label="Produto" sortKey="produto" activeKey={table.sortKey} dir={table.sortDir} onSort={table.toggleSort} />
              <SortHeader label="Tipo" sortKey="tipo" activeKey={table.sortKey} dir={table.sortDir} onSort={table.toggleSort} />
              <SortHeader label="Quantidade" sortKey="quantidade" activeKey={table.sortKey} dir={table.sortDir} onSort={table.toggleSort} />
              <th className="px-6 py-3 font-medium">Responsável</th>
              <SortHeader label="Data" sortKey="data" activeKey={table.sortKey} dir={table.sortDir} onSort={table.toggleSort} />
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {table.pageRows.length === 0 ? (
              <EmptyRow colSpan={5} message="Sem movimentações" />
            ) : (
              table.pageRows.map((m) => {
                const isSaida = ['saida', 'perda', 'transferencia'].includes(m.tipo);
                return (
                  <tr key={m.id} className="hover:bg-surface-base">
                    <td className="px-6 py-3 font-medium text-ink-900">{m.medicamento.nome}</td>
                    <td className="px-6 py-3 text-ink-500">{TIPO_LABEL[m.tipo]}</td>
                    <td className={`px-6 py-3 font-semibold ${isSaida ? 'text-danger' : 'text-success'}`}>
                      {isSaida ? '-' : '+'}
                      {m.quantidade}
                    </td>
                    <td className="px-6 py-3 text-ink-700">{m.usuario?.nome ?? '—'}</td>
                    <td className="px-6 py-3 text-ink-500">{dateTime(m.criadoEm)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        <Pagination page={table.page} totalPages={table.totalPages} total={table.total} onPage={table.setPage} />
      </Card>
    </>
  );
}

export function EstoquePage() {
  const [tab, setTab] = useState<'estoque' | 'movimentacoes'>('estoque');

  const estoque = useQuery({
    queryKey: ['estoque'],
    queryFn: async () => (await api.get<EstoqueResumo[]>('/api/v1/estoque')).data,
  });
  const movs = useQuery({
    queryKey: ['movimentacoes'],
    queryFn: async () => (await api.get<Movimentacao[]>('/api/v1/estoque/movimentacoes')).data,
    enabled: tab === 'movimentacoes',
  });

  const valorTotal = useMemo(
    () =>
      (estoque.data ?? []).reduce(
        (s, i) => s + Number(i.medicamento.precoUnitario ?? 0) * i.quantidade,
        0,
      ),
    [estoque.data],
  );

  return (
    <div>
      <PageHeader title="Estoque" subtitle={`Valor total: ${money(valorTotal)}`} />
      <div className="p-8">
        <div className="mb-4 flex gap-2">
          {(['estoque', 'movimentacoes'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                tab === t ? 'bg-brand-500 text-white' : 'bg-white text-ink-500 hover:bg-brand-50'
              }`}
            >
              {t === 'estoque' ? 'Posição de estoque' : 'Movimentações'}
            </button>
          ))}
        </div>

        {tab === 'estoque' ? (
          estoque.isLoading ? (
            <Card>
              <Spinner />
            </Card>
          ) : (
            <EstoqueTab rows={estoque.data ?? []} />
          )
        ) : movs.isLoading ? (
          <Card>
            <Spinner />
          </Card>
        ) : (
          <MovimentacoesTab rows={movs.data ?? []} />
        )}
      </div>
    </div>
  );
}
