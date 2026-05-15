import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CATEGORIA_LABEL,
  medicamentoCategoriaSchema,
  type Medicamento,
  type MedicamentoCategoria,
} from '@insumia/shared';
import { api } from '../lib/api';
import { money } from '../lib/format';
import { useTableControls } from '../lib/useTableControls';
import { exportToCsv } from '../lib/csv';
import {
  PageHeader,
  Card,
  EmptyRow,
  Spinner,
  SearchInput,
  SortHeader,
  Pagination,
  ExportButton,
} from '../components/ui';

type Form = {
  nome: string;
  fabricante: string;
  apresentacao: string;
  dosagem: string;
  categoria: MedicamentoCategoria;
  precoUnitario: string;
  receituario: boolean;
};

const EMPTY: Form = {
  nome: '',
  fabricante: '',
  apresentacao: '',
  dosagem: '',
  categoria: 'preenchedores',
  precoUnitario: '',
  receituario: false,
};

const CATEGORIAS = medicamentoCategoriaSchema.options;

export function MedicamentosPage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<Form>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['medicamentos-admin'],
    queryFn: async () =>
      (await api.get<{ data: Medicamento[] }>('/api/v1/medicamentos?perPage=100')).data.data,
  });

  const criar = useMutation({
    mutationFn: async (f: Form) =>
      api.post('/api/v1/medicamentos', {
        nome: f.nome,
        fabricante: f.fabricante || null,
        apresentacao: f.apresentacao || null,
        dosagem: f.dosagem || null,
        categoria: f.categoria,
        precoUnitario: Number(f.precoUnitario.replace(',', '.')),
        receituario: f.receituario,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['medicamentos-admin'] });
      setModalOpen(false);
      setForm(EMPTY);
    },
    onError: (e) =>
      setError(
        (e as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Erro',
      ),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.nome.length < 2) return setError('Nome muito curto');
    if (!Number(form.precoUnitario.replace(',', '.'))) return setError('Preço inválido');
    criar.mutate(form);
  };

  const table = useTableControls(data ?? [], {
    searchText: (m) => `${m.nome} ${m.fabricante ?? ''} ${m.principioAtivo ?? ''}`,
    sortAccessors: {
      nome: (m) => m.nome,
      fabricante: (m) => m.fabricante ?? '',
      categoria: (m) => CATEGORIA_LABEL[m.categoria],
      preco: (m) => Number(m.precoUnitario),
    },
    initialSort: { key: 'nome', dir: 'asc' },
  });

  const handleExport = () => {
    exportToCsv('catalogo', table.sorted, [
      { header: 'Produto', value: (m) => m.nome },
      { header: 'Fabricante', value: (m) => m.fabricante ?? '' },
      { header: 'Categoria', value: (m) => CATEGORIA_LABEL[m.categoria] },
      { header: 'Apresentação', value: (m) => [m.apresentacao, m.dosagem].filter(Boolean).join(' ') },
      { header: 'Preço', value: (m) => Number(m.precoUnitario).toFixed(2) },
      { header: 'Receituário', value: (m) => (m.receituario ? 'Sim' : 'Não') },
    ]);
  };

  return (
    <div>
      <PageHeader
        title="Catálogo"
        subtitle="Medicamentos e insumos disponíveis"
        action={
          <div className="flex gap-2">
            <ExportButton onClick={handleExport} />
            <button
              onClick={() => setModalOpen(true)}
              className="rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600"
            >
              + Novo produto
            </button>
          </div>
        }
      />
      <div className="p-8">
        <div className="mb-4 flex justify-end">
          <SearchInput
            value={table.query}
            onChange={table.setQuery}
            placeholder="Buscar produto..."
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
                    <SortHeader label="Produto" sortKey="nome" activeKey={table.sortKey} dir={table.sortDir} onSort={table.toggleSort} />
                    <SortHeader label="Fabricante" sortKey="fabricante" activeKey={table.sortKey} dir={table.sortDir} onSort={table.toggleSort} />
                    <SortHeader label="Categoria" sortKey="categoria" activeKey={table.sortKey} dir={table.sortDir} onSort={table.toggleSort} />
                    <th className="px-6 py-3 font-medium">Apresentação</th>
                    <SortHeader label="Preço" sortKey="preco" activeKey={table.sortKey} dir={table.sortDir} onSort={table.toggleSort} />
                    <th className="px-6 py-3 font-medium">Receita</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {table.pageRows.length === 0 ? (
                    <EmptyRow colSpan={6} message="Nenhum produto encontrado" />
                  ) : (
                    table.pageRows.map((m) => (
                      <tr key={m.id} className="hover:bg-surface-base">
                        <td className="px-6 py-3 font-medium text-ink-900">{m.nome}</td>
                        <td className="px-6 py-3 text-ink-700">{m.fabricante ?? '—'}</td>
                        <td className="px-6 py-3 text-ink-500">{CATEGORIA_LABEL[m.categoria]}</td>
                        <td className="px-6 py-3 text-ink-500">
                          {[m.apresentacao, m.dosagem].filter(Boolean).join(' • ') || '—'}
                        </td>
                        <td className="px-6 py-3 font-semibold text-ink-900">
                          {money(m.precoUnitario)}
                        </td>
                        <td className="px-6 py-3 text-ink-500">{m.receituario ? 'Sim' : 'Não'}</td>
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

      {modalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-brand-700">Novo produto</h2>
            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <Field label="Nome" value={form.nome} onChange={(v) => setForm({ ...form, nome: v })} />
              <Field
                label="Fabricante"
                value={form.fabricante}
                onChange={(v) => setForm({ ...form, fabricante: v })}
              />
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Apresentação"
                  value={form.apresentacao}
                  onChange={(v) => setForm({ ...form, apresentacao: v })}
                />
                <Field
                  label="Dosagem"
                  value={form.dosagem}
                  onChange={(v) => setForm({ ...form, dosagem: v })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-ink-700">Categoria</label>
                  <select
                    value={form.categoria}
                    onChange={(e) =>
                      setForm({ ...form, categoria: e.target.value as MedicamentoCategoria })
                    }
                    className="w-full rounded-lg border border-brand-100 px-3 py-2 text-sm outline-none focus:border-brand-500"
                  >
                    {CATEGORIAS.map((c) => (
                      <option key={c} value={c}>
                        {CATEGORIA_LABEL[c]}
                      </option>
                    ))}
                  </select>
                </div>
                <Field
                  label="Preço (R$)"
                  value={form.precoUnitario}
                  onChange={(v) => setForm({ ...form, precoUnitario: v })}
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-ink-700">
                <input
                  type="checkbox"
                  checked={form.receituario}
                  onChange={(e) => setForm({ ...form, receituario: e.target.checked })}
                />
                Exige receituário
              </label>
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
