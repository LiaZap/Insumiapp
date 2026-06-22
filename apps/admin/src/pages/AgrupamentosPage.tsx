import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AGRUPAMENTO_STATUS_LABEL,
  type AgrupamentoDetalhe,
  type AgrupamentoResumo,
} from '@insumia/shared';
import { api } from '../lib/api';
import { dateTime } from '../lib/format';
import { useTableControls } from '../lib/useTableControls';
import { exportToCsv } from '../lib/csv';
import { useToastMutation } from '../lib/useToastMutation';
import { toast } from 'sonner';
import {
  PageHeader,
  Card,
  Badge,
  EmptyRow,
  ErrorRow,
  Spinner,
  SearchInput,
  SortHeader,
  Pagination,
  ExportButton,
} from '../components/ui';
import { Drawer } from '../components/Modal';

const FILTERS = [
  { key: 'todos', label: 'Todos' },
  { key: 'aberto', label: 'Abertos' },
  { key: 'em_cotacao', label: 'Em cotação' },
  { key: 'cotado', label: 'Cotados' },
  { key: 'finalizado', label: 'Finalizados' },
] as const;

export function AgrupamentosPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<string>('todos');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['agrupamentos'],
    queryFn: async () => (await api.get<AgrupamentoResumo[]>('/api/v1/agrupamentos')).data,
  });

  const detalhe = useQuery({
    queryKey: ['agrupamento', selectedId],
    queryFn: async () =>
      (await api.get<AgrupamentoDetalhe>(`/api/v1/agrupamentos/${selectedId}`)).data,
    enabled: !!selectedId,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['agrupamentos'] });
    qc.invalidateQueries({ queryKey: ['agrupamento', selectedId] });
  };

  const fechar = useToastMutation({
    mutationFn: async (id: string) =>
      (await api.patch<AgrupamentoDetalhe>(`/api/v1/agrupamentos/${id}/fechar`)).data,
    successMessage: 'Agrupamento fechado e enviado para cotação.',
    onSuccess: invalidate,
  });

  const escolher = useToastMutation({
    mutationFn: async (p: { id: string; lanceId: string }) =>
      (await api.post(`/api/v1/agrupamentos/${p.id}/escolher/${p.lanceId}`)).data,
    successMessage: 'Lance selecionado com sucesso.',
    onSuccess: invalidate,
  });

  const finalizar = useToastMutation({
    mutationFn: async (p: {
      id: string;
      lote: string;
      validade?: string;
      fabricante?: string;
      notaFiscal?: string;
    }) => (await api.patch(`/api/v1/agrupamentos/${p.id}/finalizar`, p)).data,
    successMessage: 'Compra finalizada e rastreabilidade registrada.',
    onSuccess: invalidate,
  });

  const [trace, setTrace] = useState({ lote: '', validade: '', fabricante: '', notaFiscal: '' });

  const byFilter = useMemo(
    () => (data ?? []).filter((a) => filter === 'todos' || a.status === filter),
    [data, filter],
  );

  const table = useTableControls(byFilter, {
    searchText: (a) => `${a.numero} ${a.medicamento.nome} ${a.medicamento.fabricante ?? ''}`,
    sortAccessors: {
      medicamento: (a) => a.medicamento.nome,
      pedidos: (a) => a.totalPedidos,
      volume: (a) => a.totalVolume,
      status: (a) => a.status,
      criado: (a) => a.criadoEm,
    },
    initialSort: { key: 'volume', dir: 'desc' },
  });

  const handleExport = () =>
    exportToCsv('agrupamentos', table.sorted, [
      { header: 'Agrupamento', value: (a) => a.numero },
      { header: 'Medicamento', value: (a) => a.medicamento.nome },
      { header: 'Fabricante', value: (a) => a.medicamento.fabricante ?? '' },
      { header: 'Pedidos', value: (a) => a.totalPedidos },
      { header: 'Volume', value: (a) => a.totalVolume },
      { header: 'Status', value: (a) => AGRUPAMENTO_STATUS_LABEL[a.status] },
    ]);

  const handleCopiarLink = (token: string) => {
    navigator.clipboard
      .writeText(`${window.location.origin}/cotar/${token}`)
      .then(() => toast.success('Link copiado para a área de transferência.'))
      .catch(() => toast.error('Não foi possível copiar o link.'));
  };

  return (
    <div>
      <PageHeader
        title="Pedidos Agrupados"
        subtitle="Demanda de várias clínicas agregada por medicamento — base da cotação em volume"
        action={<ExportButton onClick={handleExport} />}
      />
      <div className="p-4 md:p-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
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
                {f.label} ({(data ?? []).filter((a) => f.key === 'todos' || a.status === f.key).length})
              </button>
            ))}
          </div>
          <SearchInput
            value={table.query}
            onChange={table.setQuery}
            placeholder="Buscar medicamento..."
          />
        </div>

        <Card>
          {isLoading ? (
            <Spinner />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-black/5 text-xs uppercase tracking-wide text-ink-400">
                      <SortHeader label="Medicamento" sortKey="medicamento" activeKey={table.sortKey} dir={table.sortDir} onSort={table.toggleSort} />
                      <th className="px-6 py-3 font-medium">Fabricante</th>
                      <SortHeader label="Pedidos" sortKey="pedidos" activeKey={table.sortKey} dir={table.sortDir} onSort={table.toggleSort} />
                      <SortHeader label="Volume total" sortKey="volume" activeKey={table.sortKey} dir={table.sortDir} onSort={table.toggleSort} />
                      <SortHeader label="Status" sortKey="status" activeKey={table.sortKey} dir={table.sortDir} onSort={table.toggleSort} />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {isError ? (
                      <ErrorRow colSpan={5} message="Não foi possível carregar os agrupamentos." onRetry={refetch} />
                    ) : table.pageRows.length === 0 ? (
                      <EmptyRow colSpan={5} message="Nenhum agrupamento encontrado" />
                    ) : (
                      table.pageRows.map((a) => (
                        <tr
                          key={a.id}
                          onClick={() => setSelectedId(a.id)}
                          className="cursor-pointer hover:bg-surface-base"
                          role="button"
                          tabIndex={0}
                          aria-label={`Ver agrupamento ${a.medicamento.nome}`}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') setSelectedId(a.id);
                          }}
                        >
                          <td className="px-6 py-3">
                            <p className="font-medium text-ink-900">{a.medicamento.nome}</p>
                            <p className="text-xs text-ink-400">{a.numero}</p>
                          </td>
                          <td className="px-6 py-3 text-ink-500">{a.medicamento.fabricante ?? '—'}</td>
                          <td className="px-6 py-3 text-ink-700">{a.totalPedidos}</td>
                          <td className="px-6 py-3 font-semibold text-brand-700">{a.totalVolume} un</td>
                          <td className="px-6 py-3">
                            <Badge status={a.status} label={AGRUPAMENTO_STATUS_LABEL[a.status]} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
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
      <Drawer
        open={!!selectedId}
        onClose={() => setSelectedId(null)}
        width="md:w-[480px]"
        title={detalhe.data?.medicamento.nome}
        subtitle={detalhe.data ? `${detalhe.data.numero} · ${detalhe.data.medicamento.fabricante ?? '—'}` : undefined}
      >
        {detalhe.isLoading ? (
          <Spinner />
        ) : detalhe.isError ? (
          <div className="py-10 text-center text-sm text-ink-400">
            Não foi possível carregar o agrupamento.
          </div>
        ) : detalhe.data ? (
          <>
            <div className="flex items-center justify-between">
              <Badge
                status={detalhe.data.status}
                label={AGRUPAMENTO_STATUS_LABEL[detalhe.data.status]}
              />
              <div className="text-right">
                <p className="text-2xl font-bold text-brand-700">{detalhe.data.totalVolume} un</p>
                <p className="text-xs text-ink-400">{detalhe.data.totalPedidos} pedidos de clínicas</p>
              </div>
            </div>

            {detalhe.data.status === 'aberto' ? (
              <button
                onClick={() => fechar.mutate(detalhe.data!.id)}
                disabled={fechar.isPending}
                className="mt-5 w-full rounded-xl bg-brand-500 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-50"
              >
                {fechar.isPending ? 'Fechando...' : 'Fechar agrupamento e cotar'}
              </button>
            ) : null}

            {/* Link público de lance */}
            {detalhe.data.status === 'em_cotacao' ? (
              <div className="mt-5 rounded-xl border border-brand-100 bg-brand-50/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                  Link para fornecedores
                </p>
                <p className="mt-1 text-xs text-ink-500">
                  Envie este link aos fornecedores — eles dão o lance sem precisar de login.
                </p>
                <div className="mt-2 flex gap-2">
                  <input
                    readOnly
                    value={`${window.location.origin}/cotar/${detalhe.data.publicToken}`}
                    className="flex-1 rounded-lg border border-black/10 bg-white px-2 py-1.5 text-xs text-ink-600"
                    aria-label="Link público para fornecedores"
                  />
                  <button
                    onClick={() => handleCopiarLink(detalhe.data!.publicToken)}
                    className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600"
                    aria-label="Copiar link"
                  >
                    Copiar
                  </button>
                </div>
              </div>
            ) : null}

            {/* Lances recebidos */}
            {detalhe.data.lances.length > 0 ? (
              <div className="mt-5">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-400">
                  Lances recebidos ({detalhe.data.lances.length})
                </p>
                <div className="space-y-2">
                  {[...detalhe.data.lances]
                    .sort((a, b) => Number(a.precoUnitario) - Number(b.precoUnitario))
                    .map((lance) => (
                      <div
                        key={lance.id}
                        className={`flex items-center justify-between rounded-xl border p-3 ${
                          lance.vencedor ? 'border-success bg-green-50' : 'border-black/10 bg-white'
                        }`}
                      >
                        <div>
                          <p className="text-sm font-semibold text-ink-900">
                            {lance.fornecedorNome}
                            {lance.vencedor ? (
                              <span className="ml-2 text-xs font-bold text-success">✓ Vencedor</span>
                            ) : null}
                          </p>
                          <p className="text-xs text-ink-500">
                            R$ {Number(lance.precoUnitario).toFixed(2)}/un · {lance.prazoEntregaDias} dias
                          </p>
                        </div>
                        {detalhe.data!.status === 'em_cotacao' ? (
                          <button
                            onClick={() => escolher.mutate({ id: detalhe.data!.id, lanceId: lance.id })}
                            disabled={escolher.isPending}
                            className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
                          >
                            Escolher
                          </button>
                        ) : null}
                      </div>
                    ))}
                </div>
              </div>
            ) : detalhe.data.status === 'em_cotacao' ? (
              <p className="mt-4 text-center text-xs text-ink-400">
                Aguardando lances dos fornecedores...
              </p>
            ) : null}

            {/* Finalizar compra */}
            {detalhe.data.status === 'cotado' ? (
              <div className="mt-5 rounded-xl border border-brand-100 bg-brand-50/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                  Finalizar compra · rastreabilidade
                </p>
                <p className="mt-1 text-xs text-ink-500">
                  Registre os dados exigidos pela Vigilância Sanitária.
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <TraceField label="Lote *" value={trace.lote} onChange={(v) => setTrace({ ...trace, lote: v })} />
                  <TraceField label="Validade" type="date" value={trace.validade} onChange={(v) => setTrace({ ...trace, validade: v })} />
                  <TraceField label="Fabricante" value={trace.fabricante} onChange={(v) => setTrace({ ...trace, fabricante: v })} />
                  <TraceField label="Nota fiscal" value={trace.notaFiscal} onChange={(v) => setTrace({ ...trace, notaFiscal: v })} />
                </div>
                <button
                  onClick={() =>
                    finalizar.mutate({
                      id: detalhe.data!.id,
                      lote: trace.lote,
                      validade: trace.validade ? new Date(trace.validade).toISOString() : undefined,
                      fabricante: trace.fabricante || undefined,
                      notaFiscal: trace.notaFiscal || undefined,
                    })
                  }
                  disabled={finalizar.isPending || !trace.lote.trim()}
                  className="mt-3 w-full rounded-xl bg-brand-500 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-50"
                >
                  {finalizar.isPending ? 'Finalizando...' : 'Finalizar e registrar'}
                </button>
              </div>
            ) : null}

            {/* Rastreabilidade registrada */}
            {detalhe.data.rastreabilidade ? (
              <div className="mt-5 rounded-xl border border-success/30 bg-green-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-success">
                  ✓ Rastreabilidade registrada
                </p>
                <dl className="mt-2 grid grid-cols-2 gap-y-1.5 text-xs">
                  <Trace term="Lote" def={detalhe.data.rastreabilidade.lote} />
                  <Trace
                    term="Validade"
                    def={
                      detalhe.data.rastreabilidade.validade
                        ? dateTime(detalhe.data.rastreabilidade.validade).slice(0, 10)
                        : null
                    }
                  />
                  <Trace term="Fabricante" def={detalhe.data.rastreabilidade.fabricante} />
                  <Trace term="Fornecedor" def={detalhe.data.rastreabilidade.fornecedor} />
                  <Trace term="Nota fiscal" def={detalhe.data.rastreabilidade.notaFiscal} />
                </dl>
              </div>
            ) : null}

            <p className="mb-2 mt-6 text-xs font-medium uppercase tracking-wide text-ink-400">
              Demanda por clínica
            </p>
            <div className="divide-y divide-black/5 rounded-xl border border-black/5">
              {detalhe.data.linhas.map((l) => (
                <div key={l.itemId} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-ink-900">{l.clinica}</p>
                    <p className="text-xs text-ink-400">
                      {l.pedidoNumero} · {dateTime(l.criadoEm)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-brand-700">{l.quantidade} un</span>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </Drawer>
    </div>
  );
}

function TraceField({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-medium text-ink-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-brand-100 px-2.5 py-1.5 text-xs outline-none focus:border-brand-500"
      />
    </div>
  );
}

function Trace({ term, def }: { term: string; def?: string | null }) {
  return (
    <>
      <dt className="text-ink-400">{term}</dt>
      <dd className="font-medium text-ink-900">{def || '—'}</dd>
    </>
  );
}
