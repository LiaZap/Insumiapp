import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Fornecedor } from '@insumia/shared';
import { api } from '../lib/api';
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

type Form = { nome: string; cnpj: string; email: string; telefone: string };
const EMPTY: Form = { nome: '', cnpj: '', email: '', telefone: '' };

export function FornecedoresPage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<Form>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['fornecedores'],
    queryFn: async () => (await api.get<Fornecedor[]>('/api/v1/fornecedores')).data,
  });

  const criar = useMutation({
    mutationFn: async (f: Form) =>
      api.post('/api/v1/fornecedores', {
        nome: f.nome,
        cnpj: f.cnpj || undefined,
        email: f.email || undefined,
        telefone: f.telefone || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fornecedores'] });
      setModalOpen(false);
      setForm(EMPTY);
    },
    onError: (e) =>
      setError(
        (e as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Erro',
      ),
  });

  const toggleAtivo = useMutation({
    mutationFn: async (f: Fornecedor) =>
      api.patch(`/api/v1/fornecedores/${f.id}`, { ativo: !f.ativo }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fornecedores'] }),
  });

  const table = useTableControls(data ?? [], {
    searchText: (f) => `${f.nome} ${f.cnpj ?? ''} ${f.email ?? ''}`,
    sortAccessors: {
      nome: (f) => f.nome,
      email: (f) => f.email ?? '',
      ativo: (f) => (f.ativo ? 1 : 0),
    },
    initialSort: { key: 'nome', dir: 'asc' },
  });

  const handleExport = () =>
    exportToCsv('fornecedores', table.sorted, [
      { header: 'Nome', value: (f) => f.nome },
      { header: 'CNPJ', value: (f) => f.cnpj ?? '' },
      { header: 'E-mail', value: (f) => f.email ?? '' },
      { header: 'Telefone', value: (f) => f.telefone ?? '' },
      { header: 'Ativo', value: (f) => (f.ativo ? 'Sim' : 'Não') },
    ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.nome.trim().length < 2) return setError('Nome muito curto');
    criar.mutate(form);
  };

  return (
    <div>
      <PageHeader
        title="Fornecedores"
        subtitle="Quem oferta preço nos agrupamentos de compra"
        action={
          <div className="flex gap-2">
            <ExportButton onClick={handleExport} />
            <button
              onClick={() => setModalOpen(true)}
              className="rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600"
            >
              + Novo fornecedor
            </button>
          </div>
        }
      />
      <div className="p-4 md:p-8">
        <div className="mb-4 flex justify-end">
          <SearchInput value={table.query} onChange={table.setQuery} placeholder="Buscar fornecedor..." />
        </div>
        <Card>
          {isLoading ? (
            <Spinner />
          ) : (
            <>
              <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-black/5 text-xs uppercase tracking-wide text-ink-400">
                    <SortHeader label="Nome" sortKey="nome" activeKey={table.sortKey} dir={table.sortDir} onSort={table.toggleSort} />
                    <th className="px-6 py-3 font-medium">CNPJ</th>
                    <SortHeader label="E-mail" sortKey="email" activeKey={table.sortKey} dir={table.sortDir} onSort={table.toggleSort} />
                    <th className="px-6 py-3 font-medium">Telefone</th>
                    <SortHeader label="Status" sortKey="ativo" activeKey={table.sortKey} dir={table.sortDir} onSort={table.toggleSort} />
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {table.pageRows.length === 0 ? (
                    <EmptyRow colSpan={5} message="Nenhum fornecedor cadastrado" />
                  ) : (
                    table.pageRows.map((f) => (
                      <tr key={f.id} className="hover:bg-surface-base">
                        <td className="px-6 py-3 font-medium text-ink-900">{f.nome}</td>
                        <td className="px-6 py-3 text-ink-500">{f.cnpj ?? '—'}</td>
                        <td className="px-6 py-3 text-ink-500">{f.email ?? '—'}</td>
                        <td className="px-6 py-3 text-ink-500">{f.telefone ?? '—'}</td>
                        <td className="px-6 py-3">
                          <button onClick={() => toggleAtivo.mutate(f)}>
                            <Badge
                              status={f.ativo ? 'ok' : 'cancelado'}
                              label={f.ativo ? 'Ativo' : 'Inativo'}
                            />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table></div>
              <Pagination page={table.page} totalPages={table.totalPages} total={table.total} onPage={table.setPage} />
            </>
          )}
        </Card>
      </div>

      {modalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6"
          onClick={() => setModalOpen(false)}
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-brand-700">Novo fornecedor</h2>
            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <Field label="Nome" value={form.nome} onChange={(v) => setForm({ ...form, nome: v })} />
              <Field label="CNPJ" value={form.cnpj} onChange={(v) => setForm({ ...form, cnpj: v })} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="E-mail" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
                <Field label="Telefone" value={form.telefone} onChange={(v) => setForm({ ...form, telefone: v })} />
              </div>
              {error ? <p className="text-sm text-danger">{error}</p> : null}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 rounded-xl border border-black/10 py-2.5 text-sm font-medium text-ink-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={criar.isPending}
                  className="flex-1 rounded-xl bg-brand-500 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {criar.isPending ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-ink-700">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-brand-100 px-3 py-2 text-sm outline-none focus:border-brand-500"
      />
    </div>
  );
}
