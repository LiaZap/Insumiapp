import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { money, dateTime } from '../lib/format';
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
import { Drawer } from '../components/Modal';
import { ConfirmDialog } from '../components/Modal';

type UserAdmin = {
  id: string;
  nome: string;
  email: string;
  empresa: string | null;
  role: 'admin' | 'comprador' | 'financeiro' | 'vendedor';
  bloqueado: boolean;
  criadoEm: string;
  pedidosCount: number;
  pedidosValor: number;
};

const FILTERS: Array<{ key: string; label: string; match: (u: UserAdmin) => boolean }> = [
  { key: 'todos', label: 'Todos', match: () => true },
  { key: 'ativos', label: 'Ativos', match: (u) => !u.bloqueado },
  { key: 'bloqueados', label: 'Bloqueados', match: (u) => u.bloqueado },
];

const ROLE_LABEL: Record<UserAdmin['role'], string> = {
  admin: 'Administrador',
  comprador: 'Comprador',
  financeiro: 'Financeiro',
  vendedor: 'Vendedor',
};

export function UsuariosPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState('todos');
  const [selected, setSelected] = useState<UserAdmin | null>(null);
  const [confirmToggle, setConfirmToggle] = useState<UserAdmin | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<UserAdmin | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: async () => (await api.get<UserAdmin[]>('/api/v1/users')).data,
  });

  const toggleBloqueio = useToastMutation({
    mutationFn: async (id: string) =>
      (await api.patch<{ id: string; bloqueado: boolean }>(`/api/v1/users/${id}/bloquear`)).data,
    successMessage: 'Acesso atualizado com sucesso.',
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      setConfirmToggle(null);
    },
  });

  const remove = useToastMutation({
    mutationFn: async (id: string) => api.delete(`/api/v1/users/${id}`),
    successMessage: 'Cliente excluído com sucesso.',
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      setSelected(null);
      setConfirmRemove(null);
    },
  });

  const byFilter = useMemo(() => {
    const f = FILTERS.find((x) => x.key === filter)!;
    return (data ?? []).filter(f.match);
  }, [data, filter]);

  const table = useTableControls(byFilter, {
    searchText: (u) => `${u.nome} ${u.empresa ?? ''} ${u.email}`,
    sortAccessors: {
      nome: (u) => u.nome,
      empresa: (u) => u.empresa ?? '',
      email: (u) => u.email,
      pedidos: (u) => u.pedidosCount,
      valor: (u) => u.pedidosValor,
      data: (u) => u.criadoEm,
    },
    initialSort: { key: 'data', dir: 'desc' },
  });

  const total = data?.length ?? 0;
  const ativos = data?.filter((u) => !u.bloqueado).length ?? 0;
  const bloqueados = data?.filter((u) => u.bloqueado).length ?? 0;

  const handleExport = () => {
    exportToCsv('clientes', table.sorted, [
      { header: 'Nome', value: (u) => u.nome },
      { header: 'Empresa', value: (u) => u.empresa ?? '' },
      { header: 'E-mail', value: (u) => u.email },
      { header: 'Perfil', value: (u) => ROLE_LABEL[u.role] },
      { header: 'Pedidos', value: (u) => u.pedidosCount },
      { header: 'Valor total', value: (u) => u.pedidosValor.toFixed(2) },
      { header: 'Status', value: (u) => (u.bloqueado ? 'Bloqueado' : 'Ativo') },
      { header: 'Cadastro', value: (u) => dateTime(u.criadoEm) },
    ]);
  };

  return (
    <div>
      <PageHeader
        title="Clientes"
        subtitle="Clínicas cadastradas na plataforma"
        action={<ExportButton onClick={handleExport} />}
      />
      <div className="p-4 md:p-8">
        {/* Stats */}
        <div className="mb-4 grid grid-cols-3 gap-3">
          <StatCard label="Total" value={total} tone="brand" />
          <StatCard label="Ativas" value={ativos} tone="success" />
          <StatCard label="Bloqueadas" value={bloqueados} tone="danger" />
        </div>

        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition md:px-4 md:text-sm ${
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
            placeholder="Buscar nome, empresa ou e-mail..."
          />
        </div>

        <Card className="overflow-hidden">
          {isLoading ? (
            <Spinner />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-black/5 text-xs uppercase tracking-wide text-ink-400">
                      <SortHeader label="Cliente" sortKey="empresa" activeKey={table.sortKey} dir={table.sortDir} onSort={table.toggleSort} />
                      <th className="px-6 py-3 font-medium">E-mail</th>
                      <SortHeader label="Pedidos" sortKey="pedidos" activeKey={table.sortKey} dir={table.sortDir} onSort={table.toggleSort} />
                      <SortHeader label="Valor total" sortKey="valor" activeKey={table.sortKey} dir={table.sortDir} onSort={table.toggleSort} />
                      <SortHeader label="Cadastro" sortKey="data" activeKey={table.sortKey} dir={table.sortDir} onSort={table.toggleSort} />
                      <th className="px-6 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {isError ? (
                      <ErrorRow colSpan={6} message="Não foi possível carregar os clientes." onRetry={refetch} />
                    ) : table.pageRows.length === 0 ? (
                      <EmptyRow colSpan={6} message="Nenhum cliente encontrado" />
                    ) : (
                      table.pageRows.map((u) => (
                        <tr
                          key={u.id}
                          onClick={() => setSelected(u)}
                          className="cursor-pointer hover:bg-surface-base"
                          role="button"
                          tabIndex={0}
                          aria-label={`Ver detalhes de ${u.empresa ?? u.nome}`}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') setSelected(u);
                          }}
                        >
                          <td className="px-6 py-3">
                            <p className="font-medium text-ink-900">{u.empresa ?? u.nome}</p>
                            {u.empresa ? <p className="text-xs text-ink-500">{u.nome}</p> : null}
                          </td>
                          <td className="px-6 py-3 text-ink-700">{u.email}</td>
                          <td className="px-6 py-3 text-ink-500">{u.pedidosCount}</td>
                          <td className="px-6 py-3 font-semibold text-ink-900">{money(u.pedidosValor)}</td>
                          <td className="px-6 py-3 text-ink-500">{dateTime(u.criadoEm)}</td>
                          <td className="px-6 py-3">
                            {u.bloqueado ? (
                              <Badge status="cancelado" label="Bloqueada" />
                            ) : (
                              <Badge status="confirmado" label="Ativa" />
                            )}
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
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.empresa ?? selected?.nome ?? ''}
        subtitle={selected?.nome}
      >
        {selected ? (
          <>
            <div className="mb-5 flex items-center gap-2">
              {selected.bloqueado ? (
                <Badge status="cancelado" label="Bloqueada" />
              ) : (
                <Badge status="confirmado" label="Ativa" />
              )}
              <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-semibold text-brand-600">
                {ROLE_LABEL[selected.role]}
              </span>
            </div>

            <Field label="E-mail" value={selected.email} />
            <Field label="Cadastro" value={dateTime(selected.criadoEm)} />
            <Field label="Pedidos" value={String(selected.pedidosCount)} />
            <Field label="Valor total em pedidos" value={money(selected.pedidosValor)} />

            {selected.role !== 'admin' ? (
              <div className="mt-8 space-y-3">
                <button
                  onClick={() => setConfirmToggle(selected)}
                  disabled={toggleBloqueio.isPending}
                  className={`w-full rounded-lg px-3 py-2.5 text-sm font-semibold transition disabled:opacity-50 ${
                    selected.bloqueado
                      ? 'bg-brand-500 text-white hover:bg-brand-600'
                      : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                  }`}
                >
                  {selected.bloqueado ? 'Desbloquear acesso' : 'Bloquear acesso'}
                </button>
                <button
                  onClick={() => setConfirmRemove(selected)}
                  disabled={remove.isPending}
                  className="w-full rounded-lg bg-red-50 px-3 py-2.5 text-sm font-semibold text-danger transition hover:bg-red-100 disabled:opacity-50"
                >
                  Excluir cliente
                </button>
                <p className="text-[11px] leading-4 text-ink-400">
                  Bloquear impede o cliente de logar mas mantém os dados. Excluir apaga conta,
                  pedidos, estoque e histórico em definitivo.
                </p>
              </div>
            ) : (
              <p className="mt-8 rounded-lg bg-brand-50 px-3 py-3 text-xs text-brand-700">
                Contas administradoras não podem ser bloqueadas ou excluídas pelo painel.
              </p>
            )}
          </>
        ) : null}
      </Drawer>

      {/* Confirmar bloqueio/desbloqueio */}
      <ConfirmDialog
        open={!!confirmToggle}
        onClose={() => setConfirmToggle(null)}
        onConfirm={() => confirmToggle && toggleBloqueio.mutate(confirmToggle.id)}
        title={confirmToggle?.bloqueado ? 'Desbloquear acesso' : 'Bloquear acesso'}
        description={`Tem certeza que deseja ${confirmToggle?.bloqueado ? 'desbloquear' : 'bloquear'} ${confirmToggle?.empresa ?? confirmToggle?.nome ?? 'este cliente'}?`}
        confirmLabel={confirmToggle?.bloqueado ? 'Desbloquear' : 'Bloquear'}
        variant={confirmToggle?.bloqueado ? 'default' : 'danger'}
        isPending={toggleBloqueio.isPending}
      />

      {/* Confirmar exclusão definitiva — requer digitar nome */}
      <ConfirmDialog
        open={!!confirmRemove}
        onClose={() => setConfirmRemove(null)}
        onConfirm={() => confirmRemove && remove.mutate(confirmRemove.id)}
        title="Excluir cliente definitivamente"
        description={`Esta ação apaga ${confirmRemove?.pedidosCount ?? 0} pedido(s), estoque, movimentações e contas vinculadas. Não há como desfazer.`}
        confirmLabel="Excluir"
        confirmText={confirmRemove?.empresa ?? confirmRemove?.nome ?? ''}
        variant="danger"
        isPending={remove.isPending}
      />
    </div>
  );
}
