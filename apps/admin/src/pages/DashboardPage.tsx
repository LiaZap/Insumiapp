import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { money } from '../lib/format';
import { PageHeader, Card, Badge, SkeletonCard, SkeletonChartBlock, ErrorState } from '../components/ui';
import { RevenueAreaChart, StatusDonut, RankingBars, Sparkline } from '../components/charts';
import { STATUS_LABEL } from '../lib/labels';
import { getChartHex } from '../lib/statusTokens';
import type { DashboardFinanceiro, EstoqueResumo } from '@insumia/shared';

type PedidoAdmin = {
  id: string;
  numero: string;
  status: string;
  total: string | number;
  criadoEm: string;
  itens: Array<{ medicamento: { nome: string }; quantidade: number; precoUnitario: string | number }>;
  usuario?: { nome: string; empresa: string | null };
};

const PERIODOS = [
  { key: 7, label: '7 dias' },
  { key: 30, label: '30 dias' },
  { key: 90, label: '90 dias' },
] as const;

const MES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function KpiCard({
  label,
  value,
  trend,
  spark,
  color = '#1B498C',
}: {
  label: string;
  value: string;
  trend?: number;
  spark?: number[];
  color?: string;
}) {
  const up = (trend ?? 0) >= 0;
  return (
    <Card className="p-4 md:p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 flex-1 text-[10px] font-medium uppercase tracking-wide text-ink-400 md:text-xs">
          {label}
        </p>
        {trend !== undefined ? (
          <span
            className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold md:text-[11px] ${
              up ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
            }`}
            aria-label={`${up ? 'Alta' : 'Queda'} de ${Math.abs(trend).toFixed(0)}%`}
          >
            {up ? '▲' : '▼'} {Math.abs(trend).toFixed(0)}%
          </span>
        ) : null}
      </div>
      <p className="mt-2 break-words text-lg font-bold text-brand-700 md:text-2xl">{value}</p>
      {spark ? (
        <div className="mt-2">
          <Sparkline data={spark} color={color} />
        </div>
      ) : null}
    </Card>
  );
}

export function DashboardPage() {
  const [periodo, setPeriodo] = useState<number>(30);

  const pedidosQ = useQuery({
    queryKey: ['pedidos-todos'],
    queryFn: async () => (await api.get<PedidoAdmin[]>('/api/v1/pedidos?escopo=todos')).data,
  });
  const finQ = useQuery({
    queryKey: ['fin-dashboard'],
    queryFn: async () => (await api.get<DashboardFinanceiro>('/api/v1/financeiro/dashboard')).data,
  });
  const estoqueQ = useQuery({
    queryKey: ['estoque'],
    queryFn: async () => (await api.get<EstoqueResumo[]>('/api/v1/estoque?escopo=todos')).data,
  });

  const loading = pedidosQ.isLoading || finQ.isLoading || estoqueQ.isLoading;
  const hasError = pedidosQ.isError || finQ.isError || estoqueQ.isError;
  const todos = pedidosQ.data ?? [];

  const m = useMemo(() => {
    const now = new Date();
    const inicio = new Date(now);
    inicio.setDate(inicio.getDate() - periodo);
    const inicioPrev = new Date(now);
    inicioPrev.setDate(inicioPrev.getDate() - periodo * 2);

    const atual = todos.filter((p) => new Date(p.criadoEm) >= inicio);
    const anterior = todos.filter((p) => {
      const d = new Date(p.criadoEm);
      return d >= inicioPrev && d < inicio;
    });

    const fat = (arr: PedidoAdmin[]) => arr.reduce((s, p) => s + Number(p.total), 0);
    const faturamento = fat(atual);
    const faturamentoPrev = fat(anterior);
    const ticket = atual.length ? faturamento / atual.length : 0;
    const ticketPrev = anterior.length ? faturamentoPrev / anterior.length : 0;
    const clientesAtivos = new Set(atual.map((p) => p.usuario?.empresa ?? p.numero)).size;
    const clientesPrev = new Set(anterior.map((p) => p.usuario?.empresa ?? p.numero)).size;

    const trend = (cur: number, prev: number) =>
      prev === 0 ? (cur > 0 ? 100 : 0) : ((cur - prev) / prev) * 100;

    const bucket = new Map<string, { valor: number; pedidos: number }>();
    for (let i = periodo - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      bucket.set(d.toISOString().slice(0, 10), { valor: 0, pedidos: 0 });
    }
    for (const p of atual) {
      const key = p.criadoEm.slice(0, 10);
      const b = bucket.get(key);
      if (b) {
        b.valor += Number(p.total);
        b.pedidos += 1;
      }
    }
    const serie = Array.from(bucket.entries()).map(([k, v]) => {
      const d = new Date(k);
      return {
        label: `${d.getDate()} ${MES[d.getMonth()]}`,
        valor: Math.round(v.valor),
        pedidos: v.pedidos,
      };
    });

    const statusCount = new Map<string, number>();
    for (const p of todos) statusCount.set(p.status, (statusCount.get(p.status) ?? 0) + 1);
    const donut = Array.from(statusCount.entries())
      .map(([s, value]) => ({
        label: STATUS_LABEL[s as never] ?? s,
        value,
        color: getChartHex(s),
      }))
      .sort((a, b) => b.value - a.value);

    const porCliente = new Map<string, number>();
    for (const p of atual) {
      const nome = p.usuario?.empresa ?? p.usuario?.nome ?? '—';
      porCliente.set(nome, (porCliente.get(nome) ?? 0) + Number(p.total));
    }
    const topClientes = Array.from(porCliente.entries())
      .map(([label, value]) => ({ label, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    const porProduto = new Map<string, number>();
    for (const p of atual) {
      for (const it of p.itens) {
        const v = Number(it.precoUnitario) * it.quantidade;
        porProduto.set(it.medicamento.nome, (porProduto.get(it.medicamento.nome) ?? 0) + v);
      }
    }
    const topProdutos = Array.from(porProduto.entries())
      .map(([label, value]) => ({ label, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    return {
      faturamento,
      ticket,
      pedidosCount: atual.length,
      clientesAtivos,
      trendFat: trend(faturamento, faturamentoPrev),
      trendPedidos: trend(atual.length, anterior.length),
      trendTicket: trend(ticket, ticketPrev),
      trendClientes: trend(clientesAtivos, clientesPrev),
      serie,
      sparkFat: serie.map((s) => s.valor),
      sparkPedidos: serie.map((s) => s.pedidos),
      donut,
      topClientes,
      topProdutos,
    };
  }, [todos, periodo]);

  const aguardando = todos.filter((p) => p.status === 'aguardando_cotacao' || p.status === 'cotado');
  const baixoEstoque = (estoqueQ.data ?? []).filter((i) => i.status !== 'ok');
  const vencimentos = (estoqueQ.data ?? [])
    .filter((i) => i.validadeStatus !== 'ok')
    .sort((a, b) => (a.diasParaVencer ?? 0) - (b.diasParaVencer ?? 0));

  const handleRetry = () => {
    pedidosQ.refetch();
    finQ.refetch();
    estoqueQ.refetch();
  };

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral da operação Insumia"
        action={
          <div className="flex gap-1 rounded-xl bg-surface-base p-1">
            {PERIODOS.map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriodo(p.key)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  periodo === p.key ? 'bg-white text-brand-600 shadow-sm' : 'text-ink-500'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        }
      />
      <div className="p-4 md:p-8">
        {hasError ? (
          <ErrorState
            message="Não foi possível carregar o dashboard."
            onRetry={handleRetry}
          />
        ) : loading ? (
          <>
            {/* KPI skeletons */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
              <SkeletonChartBlock className="lg:col-span-2" />
              <SkeletonChartBlock />
            </div>
          </>
        ) : (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              <KpiCard
                label={`Faturamento · ${periodo}d`}
                value={money(m.faturamento)}
                trend={m.trendFat}
                spark={m.sparkFat}
              />
              <KpiCard
                label={`Pedidos · ${periodo}d`}
                value={String(m.pedidosCount)}
                trend={m.trendPedidos}
                spark={m.sparkPedidos}
                color="#16A34A"
              />
              <KpiCard
                label="Ticket médio"
                value={money(m.ticket)}
                trend={m.trendTicket}
                spark={m.sparkFat}
                color="#5DDDF5"
              />
              <KpiCard
                label="Clientes ativos"
                value={String(m.clientesAtivos)}
                trend={m.trendClientes}
                color="#F59E0B"
              />
            </div>

            {/* Faturamento + Status */}
            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
              <Card className="p-5 lg:col-span-2">
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="font-semibold text-brand-700">Faturamento</h2>
                  <span className="text-xs text-ink-400">Últimos {periodo} dias</span>
                </div>
                <RevenueAreaChart data={m.serie} />
              </Card>
              <Card className="p-5">
                <h2 className="mb-4 font-semibold text-brand-700">Pedidos por status</h2>
                <StatusDonut data={m.donut} />
              </Card>
            </div>

            {/* Rankings */}
            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
              <Card className="p-5">
                <h2 className="mb-2 font-semibold text-brand-700">Top clientes · {periodo}d</h2>
                {m.topClientes.length ? (
                  <RankingBars data={m.topClientes} />
                ) : (
                  <p className="py-10 text-center text-sm text-ink-400">Sem dados no período</p>
                )}
              </Card>
              <Card className="p-5">
                <h2 className="mb-2 font-semibold text-brand-700">Top produtos · {periodo}d</h2>
                {m.topProdutos.length ? (
                  <RankingBars data={m.topProdutos} />
                ) : (
                  <p className="py-10 text-center text-sm text-ink-400">Sem dados no período</p>
                )}
              </Card>
            </div>

            {/* Listas operacionais */}
            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
              <Card>
                <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
                  <h2 className="font-semibold text-brand-700">Pedidos aguardando ação</h2>
                  <Link to="/pedidos" className="text-xs font-medium text-brand-500 hover:underline">
                    Ver todos
                  </Link>
                </div>
                <div className="divide-y divide-black/5">
                  {aguardando.slice(0, 6).map((p) => (
                    <Link
                      to="/pedidos"
                      key={p.id}
                      className="flex items-center justify-between px-5 py-3 hover:bg-surface-base"
                    >
                      <div>
                        <p className="text-sm font-medium text-ink-900">{p.numero}</p>
                        <p className="text-xs text-ink-500">
                          {p.usuario?.empresa ?? '—'} · {p.itens.length} itens
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-ink-700">{money(p.total)}</span>
                        <Badge status={p.status} label={STATUS_LABEL[p.status as never] ?? p.status} />
                      </div>
                    </Link>
                  ))}
                  {aguardando.length === 0 ? (
                    <p className="px-5 py-10 text-center text-sm text-ink-400">
                      Nenhum pedido pendente
                    </p>
                  ) : null}
                </div>
              </Card>

              <Card>
                <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
                  <h2 className="font-semibold text-brand-700">Estoque em alerta</h2>
                  <Link to="/estoque" className="text-xs font-medium text-brand-500 hover:underline">
                    Ver estoque
                  </Link>
                </div>
                <div className="divide-y divide-black/5">
                  {baixoEstoque.slice(0, 6).map((i) => (
                    <div key={i.medicamento.id} className="flex items-center justify-between px-5 py-3">
                      <div>
                        <p className="text-sm font-medium text-ink-900">{i.medicamento.nome}</p>
                        <p className="text-xs text-ink-500">{i.medicamento.fabricante}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-ink-700">{i.quantidade} un</span>
                        <Badge status={i.status} label={i.status === 'esgotado' ? 'Esgotado' : 'Baixo'} />
                      </div>
                    </div>
                  ))}
                  {baixoEstoque.length === 0 ? (
                    <p className="px-5 py-10 text-center text-sm text-ink-400">
                      Estoque saudável
                    </p>
                  ) : null}
                </div>
              </Card>
            </div>

            {/* Alerta de vencimento (FEFO) */}
            <div className="mt-6">
              <Card>
                <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
                  <h2 className="font-semibold text-brand-700">
                    Vencimentos próximos
                    {vencimentos.length > 0 ? (
                      <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
                        {vencimentos.length}
                      </span>
                    ) : null}
                  </h2>
                  <Link to="/estoque" className="text-xs font-medium text-brand-500 hover:underline">
                    Ver estoque
                  </Link>
                </div>
                <div className="divide-y divide-black/5">
                  {vencimentos.slice(0, 8).map((i) => (
                    <div
                      key={i.medicamento.id}
                      className="flex items-center justify-between px-5 py-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-ink-900">{i.medicamento.nome}</p>
                        <p className="text-xs text-ink-500">
                          Lote {i.lote ?? '—'} · {i.quantidade} un
                        </p>
                      </div>
                      {i.validadeStatus === 'vencido' ? (
                        <span className="rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-semibold text-red-600">
                          Vencido
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                          Vence em {i.diasParaVencer}d
                        </span>
                      )}
                    </div>
                  ))}
                  {vencimentos.length === 0 ? (
                    <p className="px-5 py-10 text-center text-sm text-ink-400">
                      Nenhum lote próximo do vencimento
                    </p>
                  ) : null}
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
