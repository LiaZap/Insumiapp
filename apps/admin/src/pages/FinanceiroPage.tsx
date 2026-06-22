import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  STATUS_LABEL,
  TIPO_LABEL,
  criarContaSchema,
  type Conta,
  type ContaStatus,
  type ContaTipo,
  type DashboardFinanceiro,
} from '@insumia/shared';
import { api } from '../lib/api';
import { money, date } from '../lib/format';
import { useTableControls } from '../lib/useTableControls';
import { exportToCsv } from '../lib/csv';
import { useToastMutation } from '../lib/useToastMutation';
import {
  PageHeader,
  Card,
  StatCard,
  Badge,
  EmptyRow,
  ErrorRow,
  Spinner,
  SearchInput,
  SortHeader,
  Pagination,
  ExportButton,
  Field,
} from '../components/ui';
import { Modal, ConfirmDialog } from '../components/Modal';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type NovaContaForm = {
  tipo: ContaTipo;
  descricao: string;
  valor: string;
  vencimento: string;
  pedidoId: string;
};

const NOVA_CONTA_EMPTY: NovaContaForm = {
  tipo: 'pagar',
  descricao: '',
  valor: '',
  vencimento: '',
  pedidoId: '',
};

type StatusFilter = ContaStatus | 'todos';
type TipoFilter = ContaTipo | 'todos';

/* ------------------------------------------------------------------ */
/*  DRE Mensal block                                                   */
/* ------------------------------------------------------------------ */

const BRAND = '#1B498C';
const SUCCESS_COLOR = '#16a34a';
const DANGER_COLOR = '#dc2626';

function DreMensalBlock({ data }: { data: DashboardFinanceiro }) {
  if (!data.fluxoMensal || data.fluxoMensal.length === 0) return null;

  const rows = data.fluxoMensal.map((m) => {
    const entradas = Number(m.entradas);
    const saidas = Number(m.saidas);
    return { mes: m.mes, entradas, saidas, resultado: entradas - saidas };
  });

  const totalEntradas = rows.reduce((s, r) => s + r.entradas, 0);
  const totalSaidas = rows.reduce((s, r) => s + r.saidas, 0);
  const totalResultado = totalEntradas - totalSaidas;

  const chartData = rows.map((r) => ({
    mes: r.mes,
    Entradas: r.entradas,
    Saidas: r.saidas,
    Resultado: r.resultado,
  }));

  return (
    <Card className="mb-6 p-5">
      <h2 className="mb-4 text-sm font-bold text-ink-700">Resultado Mensal</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="border-b border-black/5 text-xs uppercase tracking-wide text-ink-400">
              <th className="py-2 pr-4 text-left font-medium">Mês</th>
              <th className="py-2 pr-4 text-right font-medium">Entradas</th>
              <th className="py-2 pr-4 text-right font-medium">Saídas</th>
              <th className="py-2 text-right font-medium">Resultado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {rows.map((r) => (
              <tr key={r.mes}>
                <td className="py-2 pr-4 text-ink-700">{r.mes}</td>
                <td className="py-2 pr-4 text-right text-success">{money(r.entradas)}</td>
                <td className="py-2 pr-4 text-right text-danger">{money(r.saidas)}</td>
                <td className={`py-2 text-right font-semibold ${r.resultado >= 0 ? 'text-success' : 'text-danger'}`}>
                  {r.resultado >= 0 ? '+' : ''}{money(r.resultado)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-black/10 font-semibold">
              <td className="py-2 pr-4 text-ink-900">Total</td>
              <td className="py-2 pr-4 text-right text-success">{money(totalEntradas)}</td>
              <td className="py-2 pr-4 text-right text-danger">{money(totalSaidas)}</td>
              <td className={`py-2 text-right ${totalResultado >= 0 ? 'text-success' : 'text-danger'}`}>
                {totalResultado >= 0 ? '+' : ''}{money(totalResultado)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Gráfico de barras agrupadas */}
      <div className="mt-6">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 4, right: 8, left: 8, bottom: 0 }} barSize={14}>
            <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#9AA3B2' }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 11, fill: '#9AA3B2' }}
              axisLine={false}
              tickLine={false}
              width={60}
              tickFormatter={(v) => (Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v))}
            />
            <Tooltip
              formatter={(v: unknown, name: unknown) => [money(Number(v)), String(name)]}
              contentStyle={{ borderRadius: 12, border: '1px solid #eee', fontSize: 12 }}
            />
            <Bar dataKey="Entradas" fill={SUCCESS_COLOR} radius={[4, 4, 0, 0]} />
            <Bar dataKey="Saidas" fill={DANGER_COLOR} radius={[4, 4, 0, 0]} />
            <Bar dataKey="Resultado" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, idx) => (
                <Cell key={idx} fill={entry.Resultado >= 0 ? BRAND : DANGER_COLOR} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-2 flex justify-center gap-4 text-xs text-ink-500">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-success" />Entradas</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-danger" />Saídas</span>
          <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full" style={{ background: BRAND }} />Resultado</span>
        </div>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export function FinanceiroPage() {
  const qc = useQueryClient();

  // Filtros
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos');
  const [tipoFilter, setTipoFilter] = useState<TipoFilter>('todos');

  // Nova conta
  const [novaContaOpen, setNovaContaOpen] = useState(false);
  const [novaContaForm, setNovaContaForm] = useState<NovaContaForm>(NOVA_CONTA_EMPTY);
  const [novaContaError, setNovaContaError] = useState<string | null>(null);

  // Cancelar
  const [confirmCancelar, setConfirmCancelar] = useState<Conta | null>(null);

  /* ---- queries ---- */
  const dashboard = useQuery({
    queryKey: ['fin-dashboard'],
    queryFn: async () => (await api.get<DashboardFinanceiro>('/api/v1/financeiro/dashboard')).data,
  });

  const contas = useQuery({
    queryKey: ['contas', statusFilter, tipoFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== 'todos') params.set('status', statusFilter);
      if (tipoFilter !== 'todos') params.set('tipo', tipoFilter);
      const qs = params.toString();
      return (await api.get<Conta[]>(`/api/v1/financeiro/contas${qs ? `?${qs}` : ''}`)).data;
    },
  });

  /* ---- mutations ---- */
  const pagar = useToastMutation({
    mutationFn: async (id: string) => api.patch(`/api/v1/financeiro/contas/${id}/pagar`),
    successMessage: 'Conta marcada como paga.',
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contas'] });
      qc.invalidateQueries({ queryKey: ['fin-dashboard'] });
    },
  });

  const cancelar = useToastMutation({
    mutationFn: async (id: string) => api.patch(`/api/v1/financeiro/contas/${id}/cancelar`),
    successMessage: 'Conta cancelada.',
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contas'] });
      qc.invalidateQueries({ queryKey: ['fin-dashboard'] });
      setConfirmCancelar(null);
    },
  });

  const criarConta = useToastMutation({
    mutationFn: async (f: NovaContaForm) => {
      const payload = {
        tipo: f.tipo,
        descricao: f.descricao.trim(),
        valor: Number(f.valor.replace(',', '.')),
        vencimento: new Date(f.vencimento).toISOString(),
        ...(f.pedidoId.trim() ? { pedidoId: f.pedidoId.trim() } : {}),
      };
      const parsed = criarContaSchema.safeParse(payload);
      if (!parsed.success) {
        throw new Error(parsed.error.errors.map((e) => e.message).join('; '));
      }
      return api.post('/api/v1/financeiro/contas', payload);
    },
    successMessage: 'Conta cadastrada.',
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contas'] });
      qc.invalidateQueries({ queryKey: ['fin-dashboard'] });
      setNovaContaOpen(false);
      setNovaContaForm(NOVA_CONTA_EMPTY);
    },
    onError: (e) =>
      setNovaContaError(
        (e as { response?: { data?: { message?: string } } }).response?.data?.message ??
          (e as Error).message ??
          'Erro',
      ),
  });

  /* ---- helpers ---- */
  const handleCriarConta = (ev: React.FormEvent) => {
    ev.preventDefault();
    setNovaContaError(null);
    if (novaContaForm.descricao.trim().length < 2) {
      setNovaContaError('Descrição muito curta.');
      return;
    }
    const v = Number(novaContaForm.valor.replace(',', '.'));
    if (!novaContaForm.valor.trim() || isNaN(v) || v < 0) {
      setNovaContaError('Valor inválido.');
      return;
    }
    if (!novaContaForm.vencimento) {
      setNovaContaError('Vencimento obrigatório.');
      return;
    }
    criarConta.mutate(novaContaForm);
  };

  const set = (patch: Partial<NovaContaForm>) =>
    setNovaContaForm((prev) => ({ ...prev, ...patch }));

  /* ---- table ---- */
  const table = useTableControls(contas.data ?? [], {
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
      { header: 'Tipo', value: (c) => TIPO_LABEL[c.tipo] },
      { header: 'Vencimento', value: (c) => date(c.vencimento) },
      { header: 'Valor', value: (c) => Number(c.valor).toFixed(2) },
      { header: 'Status', value: (c) => STATUS_LABEL[c.status] },
    ]);

  /* ---- filter chips ---- */
  const STATUS_FILTERS: Array<{ key: StatusFilter; label: string }> = [
    { key: 'todos', label: 'Todos status' },
    { key: 'aberta', label: 'Aberta' },
    { key: 'vencida', label: 'Vencida' },
    { key: 'paga', label: 'Paga' },
    { key: 'cancelada', label: 'Cancelada' },
  ];

  const TIPO_FILTERS: Array<{ key: TipoFilter; label: string }> = [
    { key: 'todos', label: 'Todos' },
    { key: 'pagar', label: 'A Pagar' },
    { key: 'receber', label: 'A Receber' },
  ];

  return (
    <div>
      <PageHeader
        title="Financeiro"
        subtitle="Contas a pagar e a receber"
        action={
          <div className="flex gap-2">
            <ExportButton onClick={handleExport} />
            <button
              onClick={() => { setNovaContaError(null); setNovaContaForm(NOVA_CONTA_EMPTY); setNovaContaOpen(true); }}
              className="rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600"
            >
              + Nova conta
            </button>
          </div>
        }
      />

      <div className="p-4 md:p-8">
        {/* KPI cards */}
        {dashboard.isError ? null : dashboard.data ? (
          <div className="mb-6 grid grid-cols-3 gap-4">
            <StatCard label="A pagar" value={money(dashboard.data.totalAPagar)} tone="danger" />
            <StatCard label="A receber" value={money(dashboard.data.totalAReceber)} tone="success" />
            <StatCard label="Contas vencidas" value={String(dashboard.data.vencidasCount)} tone="warning" />
          </div>
        ) : null}

        {/* DRE Mensal */}
        {dashboard.data && <DreMensalBlock data={dashboard.data} />}

        {/* Filtros */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-1.5">
            {TIPO_FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setTipoFilter(f.key)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  tipoFilter === f.key
                    ? 'bg-brand-500 text-white'
                    : 'bg-white border border-black/10 text-ink-500 hover:bg-brand-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="mx-1 h-4 w-px bg-black/10" />
          <div className="flex flex-wrap gap-1.5">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  statusFilter === f.key
                    ? 'bg-ink-700 text-white'
                    : 'bg-white border border-black/10 text-ink-500 hover:bg-surface-base'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="ml-auto">
            <SearchInput value={table.query} onChange={table.setQuery} placeholder="Buscar conta..." />
          </div>
        </div>

        {/* Tabela */}
        <Card>
          {contas.isLoading ? (
            <Spinner />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
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
                    {contas.isError ? (
                      <ErrorRow colSpan={6} message="Não foi possível carregar as contas." onRetry={contas.refetch} />
                    ) : table.pageRows.length === 0 ? (
                      <EmptyRow colSpan={6} message="Nenhuma conta encontrada" />
                    ) : (
                      table.pageRows.map((c) => (
                        <tr key={c.id} className="hover:bg-surface-base">
                          <td className="px-6 py-3 font-medium text-ink-900">{c.descricao}</td>
                          <td className="px-6 py-3 text-ink-500">{TIPO_LABEL[c.tipo]}</td>
                          <td className="px-6 py-3 text-ink-500">{date(c.vencimento)}</td>
                          <td className={`px-6 py-3 font-semibold ${c.tipo === 'pagar' ? 'text-danger' : 'text-success'}`}>
                            {c.tipo === 'pagar' ? '-' : '+'}
                            {money(c.valor)}
                          </td>
                          <td className="px-6 py-3">
                            <Badge status={c.status} label={STATUS_LABEL[c.status]} />
                          </td>
                          <td className="px-6 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              {c.status !== 'paga' && c.status !== 'cancelada' ? (
                                <button
                                  onClick={() => pagar.mutate(c.id)}
                                  disabled={pagar.isPending}
                                  className="rounded-lg bg-green-50 px-3 py-1.5 text-xs font-semibold text-success transition hover:bg-green-100 disabled:opacity-50"
                                >
                                  Marcar paga
                                </button>
                              ) : null}
                              {c.status === 'aberta' || c.status === 'vencida' ? (
                                <button
                                  onClick={() => setConfirmCancelar(c)}
                                  className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-danger transition hover:bg-red-100"
                                >
                                  Cancelar
                                </button>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination page={table.page} totalPages={table.totalPages} total={table.total} onPage={table.setPage} />
            </>
          )}
        </Card>
      </div>

      {/* Modal — Nova conta */}
      <Modal
        open={novaContaOpen}
        onClose={() => { setNovaContaOpen(false); setNovaContaError(null); setNovaContaForm(NOVA_CONTA_EMPTY); }}
        title="Nova conta"
      >
        <form onSubmit={handleCriarConta} className="space-y-3">
          <div>
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-400">
              Tipo *
            </label>
            <div className="flex gap-2">
              {(['pagar', 'receber'] as ContaTipo[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => set({ tipo: t })}
                  className={`flex-1 rounded-lg border py-2 text-sm font-medium transition ${
                    novaContaForm.tipo === t
                      ? t === 'pagar'
                        ? 'border-danger bg-red-50 text-danger'
                        : 'border-success bg-green-50 text-success'
                      : 'border-black/10 text-ink-500 hover:bg-surface-base'
                  }`}
                >
                  {TIPO_LABEL[t]}
                </button>
              ))}
            </div>
          </div>

          <Field
            label="Descrição *"
            value={novaContaForm.descricao}
            onChange={(v) => set({ descricao: v })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Valor (R$) *"
              value={novaContaForm.valor}
              onChange={(v) => set({ valor: v })}
            />
            <div>
              <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-400">
                Vencimento *
              </label>
              <input
                type="date"
                value={novaContaForm.vencimento}
                onChange={(e) => set({ vencimento: e.target.value })}
                className="w-full rounded-lg border border-brand-100 px-3 py-2 text-sm outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <Field
            label="ID do Pedido (opcional)"
            value={novaContaForm.pedidoId}
            onChange={(v) => set({ pedidoId: v })}
          />

          {novaContaError ? <p className="text-sm text-danger">{novaContaError}</p> : null}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => { setNovaContaOpen(false); setNovaContaError(null); setNovaContaForm(NOVA_CONTA_EMPTY); }}
              className="flex-1 rounded-xl border border-black/10 py-2.5 text-sm font-medium text-ink-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={criarConta.isPending}
              className="flex-1 rounded-xl bg-brand-500 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {criarConta.isPending ? 'Salvando...' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ConfirmDialog — Cancelar conta */}
      <ConfirmDialog
        open={!!confirmCancelar}
        onClose={() => setConfirmCancelar(null)}
        onConfirm={() => confirmCancelar && cancelar.mutate(confirmCancelar.id)}
        title="Cancelar conta"
        description={`Deseja cancelar a conta "${confirmCancelar?.descricao ?? ''}" de ${money(confirmCancelar?.valor ?? 0)}? Esta ação não pode ser desfeita.`}
        confirmLabel="Cancelar conta"
        variant="danger"
        isPending={cancelar.isPending}
      />
    </div>
  );
}
