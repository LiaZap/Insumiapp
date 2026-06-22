import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { currentUser } from '../lib/auth';
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
import { Drawer, ConfirmDialog } from '../components/Modal';
import { NovoUsuarioModal } from '../components/NovoUsuarioModal';
import { AlterarRoleDialog } from '../components/AlterarRoleDialog';
import type { UserRole } from '@insumia/shared';

/* ------------------------------------------------------------------ */
/*  Tipos e constantes                                                  */
/* ------------------------------------------------------------------ */

type UserAdmin = {
  id: string;
  nome: string;
  email: string;
  empresa: string | null;
  role: UserRole;
  bloqueado: boolean;
  criadoEm: string;
  pedidosCount: number;
  pedidosValor: number;
};

const ROLE_LABEL: Record<UserRole, string> = {
  admin: 'Administrador',
  comprador: 'Comprador',
  financeiro: 'Financeiro',
};

const STATUS_FILTERS: Array<{ key: string; label: string; match: (u: UserAdmin) => boolean }> = [
  { key: 'todos', label: 'Todos', match: () => true },
  { key: 'ativos', label: 'Ativos', match: (u) => !u.bloqueado },
  { key: 'bloqueados', label: 'Bloqueados', match: (u) => u.bloqueado },
];

type ViewTab = 'clientes' | 'equipe';

const VIEW_TABS: Array<{ key: ViewTab; label: string; match: (u: UserAdmin) => boolean; defaultRole: UserRole }> = [
  {
    key: 'clientes',
    label: 'Clientes',
    match: (u) => u.role === 'comprador',
    defaultRole: 'comprador',
  },
  {
    key: 'equipe',
    label: 'Equipe',
    match: (u) => u.role === 'admin' || u.role === 'financeiro',
    defaultRole: 'financeiro',
  },
];

/* ------------------------------------------------------------------ */
/*  Componente principal                                               */
/* ------------------------------------------------------------------ */

export function UsuariosPage() {
  const qc = useQueryClient();
  const me = currentUser();

  // Visão (Clientes / Equipe)
  const [view, setView] = useState<ViewTab>('clientes');

  // Filtro de status dentro da visão
  const [statusFilter, setStatusFilter] = useState('todos');

  // Detalhes / modais
  const [selected, setSelected] = useState<UserAdmin | null>(null);
  const [confirmToggle, setConfirmToggle] = useState<UserAdmin | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<UserAdmin | null>(null);
  const [alterarRole, setAlterarRole] = useState<UserAdmin | null>(null);
  const [novoUsuario, setNovoUsuario] = useState(false);

  /* ---------------------------------------------------------------- */
  /*  Query                                                            */
  /* ---------------------------------------------------------------- */

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: async () => (await api.get<UserAdmin[]>('/api/v1/users')).data,
  });

  /* ---------------------------------------------------------------- */
  /*  Mutações                                                         */
  /* ---------------------------------------------------------------- */

  const toggleBloqueio = useToastMutation({
    mutationFn: async (id: string) =>
      (await api.patch<{ id: string; bloqueado: boolean }>(`/api/v1/users/${id}/bloquear`)).data,
    successMessage: 'Acesso atualizado com sucesso.',
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      setConfirmToggle(null);
      setSelected(null);
    },
  });

  const remove = useToastMutation({
    mutationFn: async (id: string) => api.delete(`/api/v1/users/${id}`),
    successMessage: 'Usuário excluído com sucesso.',
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      setSelected(null);
      setConfirmRemove(null);
    },
  });

  /* ---------------------------------------------------------------- */
  /*  Dados derivados                                                  */
  /* ---------------------------------------------------------------- */

  const currentTab = VIEW_TABS.find((t) => t.key === view)!;
  const statusMatch = STATUS_FILTERS.find((f) => f.key === statusFilter)!;

  // Filtra pela visão (clientes / equipe) e depois pelo status
  const byView = useMemo(() => (data ?? []).filter(currentTab.match), [data, view]); // eslint-disable-line react-hooks/exhaustive-deps
  const byFilter = useMemo(() => byView.filter(statusMatch.match), [byView, statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

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

  // KPIs — separados por visão
  const totalClientes = useMemo(() => (data ?? []).filter((u) => u.role === 'comprador').length, [data]);
  const totalEquipe = useMemo(() => (data ?? []).filter((u) => u.role !== 'comprador').length, [data]);
  const ativosView = useMemo(() => byView.filter((u) => !u.bloqueado).length, [byView]);
  const bloqueadosView = useMemo(() => byView.filter((u) => u.bloqueado).length, [byView]);

  /* ---------------------------------------------------------------- */
  /*  Exportar CSV                                                     */
  /* ---------------------------------------------------------------- */

  const handleExport = () => {
    exportToCsv(view === 'clientes' ? 'clientes' : 'equipe', table.sorted, [
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

  /* ---------------------------------------------------------------- */
  /*  Helpers de permissão                                             */
  /* ---------------------------------------------------------------- */

  const isSelf = (u: UserAdmin) => me?.id === u.id;
  const isAdminUser = (u: UserAdmin) => u.role === 'admin';

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div>
      <PageHeader
        title="Usuários"
        subtitle="Clientes e equipe interna da plataforma"
        action={
          <div className="flex items-center gap-2">
            <ExportButton onClick={handleExport} />
            <button
              onClick={() => setNovoUsuario(true)}
              className="rounded-xl bg-brand-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-brand-600"
            >
              + Novo usuário
            </button>
          </div>
        }
      />

      <div className="p-4 md:p-8">
        {/* KPIs */}
        <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="Clientes" value={totalClientes} tone="brand" />
          <StatCard label="Equipe" value={totalEquipe} tone="brand" />
          <StatCard label={`Ativos (${view === 'clientes' ? 'clientes' : 'equipe'})`} value={ativosView} tone="success" />
          <StatCard label={`Bloqueados (${view === 'clientes' ? 'clientes' : 'equipe'})`} value={bloqueadosView} tone="danger" />
        </div>

        {/* Seletor de visão: Clientes / Equipe */}
        <div className="mb-4 flex gap-1 rounded-xl border border-black/5 bg-white p-1 w-fit">
          {VIEW_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setView(tab.key);
                setStatusFilter('todos');
              }}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                view === tab.key
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'text-ink-500 hover:text-brand-600'
              }`}
            >
              {tab.label} ({(data ?? []).filter(tab.match).length})
            </button>
          ))}
        </div>

        {/* Filtros de status + busca */}
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition md:px-4 md:text-sm ${
                  statusFilter === f.key
                    ? 'bg-brand-500 text-white'
                    : 'bg-white text-ink-500 hover:bg-brand-50'
                }`}
              >
                {f.label} ({byView.filter(f.match).length})
              </button>
            ))}
          </div>
          <SearchInput
            value={table.query}
            onChange={(v) => { table.setQuery(v); }}
            placeholder={
              view === 'clientes'
                ? 'Buscar nome, empresa ou e-mail...'
                : 'Buscar nome ou e-mail...'
            }
          />
        </div>

        {/* Tabela */}
        <Card className="overflow-hidden">
          {isLoading ? (
            <Spinner />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-black/5 text-xs uppercase tracking-wide text-ink-400">
                      <SortHeader label="Usuário" sortKey="empresa" activeKey={table.sortKey} dir={table.sortDir} onSort={table.toggleSort} />
                      <th className="px-6 py-3 font-medium">E-mail</th>
                      <th className="px-6 py-3 font-medium">Perfil</th>
                      {view === 'clientes' ? (
                        <>
                          <SortHeader label="Pedidos" sortKey="pedidos" activeKey={table.sortKey} dir={table.sortDir} onSort={table.toggleSort} />
                          <SortHeader label="Valor total" sortKey="valor" activeKey={table.sortKey} dir={table.sortDir} onSort={table.toggleSort} />
                        </>
                      ) : null}
                      <SortHeader label="Cadastro" sortKey="data" activeKey={table.sortKey} dir={table.sortDir} onSort={table.toggleSort} />
                      <th className="px-6 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {isError ? (
                      <ErrorRow
                        colSpan={view === 'clientes' ? 7 : 5}
                        message="Não foi possível carregar os usuários."
                        onRetry={refetch}
                      />
                    ) : table.pageRows.length === 0 ? (
                      <EmptyRow
                        colSpan={view === 'clientes' ? 7 : 5}
                        message={`Nenhum ${view === 'clientes' ? 'cliente' : 'membro de equipe'} encontrado`}
                      />
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
                          <td className="px-6 py-3">
                            <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-semibold text-brand-600">
                              {ROLE_LABEL[u.role]}
                            </span>
                          </td>
                          {view === 'clientes' ? (
                            <>
                              <td className="px-6 py-3 text-ink-500">{u.pedidosCount}</td>
                              <td className="px-6 py-3 font-semibold text-ink-900">{money(u.pedidosValor)}</td>
                            </>
                          ) : null}
                          <td className="px-6 py-3 text-ink-500">{dateTime(u.criadoEm)}</td>
                          <td className="px-6 py-3">
                            {u.bloqueado ? (
                              <Badge status="cancelado" label="Bloqueado" />
                            ) : (
                              <Badge status="confirmado" label="Ativo" />
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

      {/* Drawer de detalhe */}
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
                <Badge status="cancelado" label="Bloqueado" />
              ) : (
                <Badge status="confirmado" label="Ativo" />
              )}
              <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-semibold text-brand-600">
                {ROLE_LABEL[selected.role]}
              </span>
              {isSelf(selected) ? (
                <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-600">
                  Você
                </span>
              ) : null}
            </div>

            <Field label="E-mail" value={selected.email} />
            <Field label="Cadastro" value={dateTime(selected.criadoEm)} />
            {view === 'clientes' ? (
              <>
                <Field label="Pedidos" value={String(selected.pedidosCount)} />
                <Field label="Valor total em pedidos" value={money(selected.pedidosValor)} />
              </>
            ) : null}

            {/* Alterar papel — disponível para todos exceto o próprio usuário logado */}
            {!isSelf(selected) ? (
              <div className="mt-6">
                <button
                  onClick={() => setAlterarRole(selected)}
                  className="w-full rounded-lg bg-brand-50 px-3 py-2.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-100"
                >
                  Alterar perfil
                </button>
              </div>
            ) : (
              <p className="mt-6 rounded-lg bg-amber-50 px-3 py-3 text-xs text-amber-700">
                Você não pode alterar o próprio perfil.
              </p>
            )}

            {/* Bloquear / Excluir — não se aplica a admins nem ao próprio usuário */}
            {!isAdminUser(selected) && !isSelf(selected) ? (
              <div className="mt-3 space-y-3">
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
                  Excluir usuário
                </button>
                <p className="text-[11px] leading-4 text-ink-400">
                  Bloquear impede o acesso mas mantém os dados. Excluir apaga conta,
                  pedidos e histórico em definitivo.
                </p>
              </div>
            ) : isAdminUser(selected) && !isSelf(selected) ? (
              <p className="mt-3 rounded-lg bg-brand-50 px-3 py-3 text-xs text-brand-700">
                Contas administradoras não podem ser bloqueadas ou excluídas pelo painel.
              </p>
            ) : null}
          </>
        ) : null}
      </Drawer>

      {/* Confirmar bloqueio/desbloqueio */}
      <ConfirmDialog
        open={!!confirmToggle}
        onClose={() => setConfirmToggle(null)}
        onConfirm={() => confirmToggle && toggleBloqueio.mutate(confirmToggle.id)}
        title={confirmToggle?.bloqueado ? 'Desbloquear acesso' : 'Bloquear acesso'}
        description={`Tem certeza que deseja ${confirmToggle?.bloqueado ? 'desbloquear' : 'bloquear'} ${confirmToggle?.empresa ?? confirmToggle?.nome ?? 'este usuário'}?`}
        confirmLabel={confirmToggle?.bloqueado ? 'Desbloquear' : 'Bloquear'}
        variant={confirmToggle?.bloqueado ? 'default' : 'danger'}
        isPending={toggleBloqueio.isPending}
      />

      {/* Confirmar exclusão definitiva */}
      <ConfirmDialog
        open={!!confirmRemove}
        onClose={() => setConfirmRemove(null)}
        onConfirm={() => confirmRemove && remove.mutate(confirmRemove.id)}
        title="Excluir usuário definitivamente"
        description={`Esta ação apaga ${confirmRemove?.pedidosCount ?? 0} pedido(s), estoque, movimentações e contas vinculadas. Não há como desfazer.`}
        confirmLabel="Excluir"
        confirmText={confirmRemove?.empresa ?? confirmRemove?.nome ?? ''}
        variant="danger"
        isPending={remove.isPending}
      />

      {/* Alterar perfil */}
      <AlterarRoleDialog
        user={alterarRole}
        onClose={() => setAlterarRole(null)}
      />

      {/* Criar novo usuário */}
      <NovoUsuarioModal
        open={novoUsuario}
        onClose={() => setNovoUsuario(false)}
        defaultRole={currentTab.defaultRole}
      />
    </div>
  );
}
