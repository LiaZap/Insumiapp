import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CATEGORIA_LABEL,
  upsertMedicamentoSchema,
  type Medicamento,
} from '@insumia/shared';
import { api } from '../lib/api';
import { money } from '../lib/format';
import { useTableControls } from '../lib/useTableControls';
import { exportToCsv } from '../lib/csv';
import { useToastMutation } from '../lib/useToastMutation';
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
import { Drawer, Modal, ConfirmDialog } from '../components/Modal';
import {
  MedicamentoForm,
  MED_FORM_EMPTY,
  type MedForm,
  formToPayload,
  validateMedForm,
} from '../components/MedicamentoForm';

/* ------------------------------------------------------------------ */
/*  CSV Import types                                                   */
/* ------------------------------------------------------------------ */

type CsvRow = {
  linha: number;
  data: MedForm;
};
type CsvError = {
  linha: number;
  motivo: string;
};

const CSV_HEADERS = 'nome,categoria,precoUnitario,custo,fabricante,ean';

function parseCsvText(text: string): { valid: CsvRow[]; errors: CsvError[] } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length === 0) return { valid: [], errors: [] };

  // Remove BOM se presente
  const firstLine = lines[0].replace(/^﻿/, '');
  const headers = firstLine.split(',').map((h) => h.trim().toLowerCase());

  const valid: CsvRow[] = [];
  const errors: CsvError[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = (cols[idx] ?? '').trim();
    });

    const form: MedForm = {
      nome: row['nome'] ?? '',
      categoria: (row['categoria'] ?? 'estetica') as MedForm['categoria'],
      precoUnitario: row['precounitario'] ?? row['precouniciario'] ?? row['preco'] ?? '',
      custo: row['custo'] ?? '',
      fabricante: row['fabricante'] ?? '',
      principioAtivo: row['principioativo'] ?? '',
      apresentacao: row['apresentacao'] ?? '',
      dosagem: row['dosagem'] ?? '',
      ean: row['ean'] ?? '',
      receituario: (row['receituario'] ?? '').toLowerCase() === 'sim',
      imagemUrl: row['imagemurl'] ?? '',
    };

    const localError = validateMedForm(form);
    if (localError) {
      errors.push({ linha: i + 1, motivo: localError });
      continue;
    }

    const payload = formToPayload(form);
    const parsed = upsertMedicamentoSchema.safeParse(payload);
    if (!parsed.success) {
      errors.push({
        linha: i + 1,
        motivo: parsed.error.errors.map((e) => e.message).join('; '),
      });
    } else {
      valid.push({ linha: i + 1, data: form });
    }
  }

  return { valid, errors };
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export function MedicamentosPage() {
  const qc = useQueryClient();

  // Criar
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<MedForm>(MED_FORM_EMPTY);
  const [createError, setCreateError] = useState<string | null>(null);

  // Editar
  const [editMed, setEditMed] = useState<Medicamento | null>(null);
  const [editForm, setEditForm] = useState<MedForm>(MED_FORM_EMPTY);
  const [editError, setEditError] = useState<string | null>(null);

  // Inativar
  const [confirmInativo, setConfirmInativo] = useState<Medicamento | null>(null);

  // CSV import
  const csvInputRef = useRef<HTMLInputElement>(null);
  const [csvPreview, setCsvPreview] = useState<{ valid: CsvRow[]; errors: CsvError[] } | null>(null);
  const [csvModalOpen, setCsvModalOpen] = useState(false);

  /* ---- queries ---- */
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['medicamentos-admin'],
    queryFn: async () =>
      (await api.get<{ data: Medicamento[] }>('/api/v1/medicamentos?perPage=100&incluirInativos=true')).data.data,
  });

  /* ---- mutations ---- */
  const criar = useToastMutation({
    mutationFn: async (f: MedForm) => api.post('/api/v1/medicamentos', formToPayload(f)),
    successMessage: 'Produto cadastrado com sucesso.',
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['medicamentos-admin'] });
      setCreateOpen(false);
      setCreateForm(MED_FORM_EMPTY);
    },
    onError: (e) =>
      setCreateError(
        (e as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Erro',
      ),
  });

  const editar = useToastMutation({
    mutationFn: async ({ id, f }: { id: string; f: MedForm }) =>
      api.patch(`/api/v1/medicamentos/${id}`, formToPayload(f)),
    successMessage: 'Produto atualizado com sucesso.',
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['medicamentos-admin'] });
      setEditMed(null);
    },
    onError: (e) =>
      setEditError(
        (e as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Erro',
      ),
  });

  const toggleAtivo = useToastMutation({
    mutationFn: async ({ id, ativo }: { id: string; ativo: boolean }) =>
      api.patch(`/api/v1/medicamentos/${id}`, { ativo }),
    successMessage: 'Status atualizado.',
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['medicamentos-admin'] });
      setConfirmInativo(null);
    },
  });

  const importarCsv = useToastMutation({
    mutationFn: async (rows: CsvRow[]) => {
      const results = await Promise.allSettled(
        rows.map((r) => api.post('/api/v1/medicamentos', formToPayload(r.data))),
      );
      const ok = results.filter((r) => r.status === 'fulfilled').length;
      const fail = results.length - ok;
      return { ok, fail };
    },
    successMessage: '',
    onSuccess: ({ ok, fail }) => {
      qc.invalidateQueries({ queryKey: ['medicamentos-admin'] });
      setCsvModalOpen(false);
      setCsvPreview(null);
      const msg = fail > 0 ? `${ok} criado(s), ${fail} com erro.` : `${ok} produto(s) importado(s).`;
      toast.success(msg);
    },
  });

  /* ---- helpers ---- */
  const openEdit = (m: Medicamento) => {
    setEditError(null);
    setEditForm({
      nome: m.nome,
      fabricante: m.fabricante ?? '',
      principioAtivo: m.principioAtivo ?? '',
      apresentacao: m.apresentacao ?? '',
      dosagem: m.dosagem ?? '',
      categoria: m.categoria,
      precoUnitario: String(m.precoUnitario),
      custo: m.custo != null ? String(m.custo) : '',
      ean: m.ean ?? '',
      receituario: m.receituario,
      imagemUrl: m.imagemUrl ?? '',
    });
    setEditMed(m);
  };

  const handleCreate = () => {
    const err = validateMedForm(createForm);
    if (err) { setCreateError(err); return; }
    setCreateError(null);
    criar.mutate(createForm);
  };

  const handleEdit = () => {
    if (!editMed) return;
    const err = validateMedForm(editForm);
    if (err) { setEditError(err); return; }
    setEditError(null);
    editar.mutate({ id: editMed.id, f: editForm });
  };

  const handleCsvFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const result = parseCsvText(text);
      setCsvPreview(result);
      setCsvModalOpen(true);
    };
    reader.readAsText(file, 'utf-8');
    // reset input para permitir reimportar o mesmo arquivo
    e.target.value = '';
  };

  /* ---- table ---- */
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
      { header: 'Ativo', value: (m) => ((m as Medicamento & { ativo?: boolean }).ativo === false ? 'Não' : 'Sim') },
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
              onClick={() => csvInputRef.current?.click()}
              className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-medium text-ink-700 transition hover:bg-surface-base"
            >
              ↑ Importar CSV
            </button>
            <input
              ref={csvInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={handleCsvFile}
            />
            <button
              onClick={() => { setCreateError(null); setCreateForm(MED_FORM_EMPTY); setCreateOpen(true); }}
              className="rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600"
            >
              + Novo produto
            </button>
          </div>
        }
      />

      <div className="p-4 md:p-8">
        <div className="mb-4 flex justify-end">
          <SearchInput value={table.query} onChange={table.setQuery} placeholder="Buscar produto..." />
        </div>

        <Card>
          {isLoading ? (
            <Spinner />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-black/5 text-xs uppercase tracking-wide text-ink-400">
                      <SortHeader label="Produto" sortKey="nome" activeKey={table.sortKey} dir={table.sortDir} onSort={table.toggleSort} />
                      <SortHeader label="Fabricante" sortKey="fabricante" activeKey={table.sortKey} dir={table.sortDir} onSort={table.toggleSort} />
                      <SortHeader label="Categoria" sortKey="categoria" activeKey={table.sortKey} dir={table.sortDir} onSort={table.toggleSort} />
                      <th className="px-6 py-3 font-medium">Apresentação</th>
                      <SortHeader label="Preço" sortKey="preco" activeKey={table.sortKey} dir={table.sortDir} onSort={table.toggleSort} />
                      <th className="px-6 py-3 font-medium">Status</th>
                      <th className="px-6 py-3 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {isError ? (
                      <ErrorRow colSpan={7} message="Não foi possível carregar o catálogo." onRetry={refetch} />
                    ) : table.pageRows.length === 0 ? (
                      <EmptyRow colSpan={7} message="Nenhum produto encontrado" />
                    ) : (
                      table.pageRows.map((m) => {
                        const isInativo = (m as Medicamento & { ativo?: boolean }).ativo === false;
                        return (
                          <tr
                            key={m.id}
                            onClick={() => openEdit(m)}
                            className={`cursor-pointer hover:bg-surface-base ${isInativo ? 'opacity-50' : ''}`}
                          >
                            <td className="px-6 py-3 font-medium text-ink-900">{m.nome}</td>
                            <td className="px-6 py-3 text-ink-700">{m.fabricante ?? '—'}</td>
                            <td className="px-6 py-3 text-ink-500">{CATEGORIA_LABEL[m.categoria]}</td>
                            <td className="px-6 py-3 text-ink-500">
                              {[m.apresentacao, m.dosagem].filter(Boolean).join(' • ') || '—'}
                            </td>
                            <td className="px-6 py-3 font-semibold text-ink-900">
                              {money(m.precoUnitario)}
                            </td>
                            <td className="px-6 py-3">
                              {isInativo
                                ? <Badge status="cancelada" label="Inativo" />
                                : <Badge status="aberta" label="Ativo" />}
                            </td>
                            <td className="px-6 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                              {isInativo ? (
                                <button
                                  onClick={() => toggleAtivo.mutate({ id: m.id, ativo: true })}
                                  disabled={toggleAtivo.isPending}
                                  className="rounded-lg bg-green-50 px-3 py-1.5 text-xs font-semibold text-success transition hover:bg-green-100 disabled:opacity-50"
                                >
                                  Reativar
                                </button>
                              ) : (
                                <button
                                  onClick={() => setConfirmInativo(m)}
                                  className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-danger transition hover:bg-red-100"
                                >
                                  Inativar
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination page={table.page} totalPages={table.totalPages} total={table.total} onPage={table.setPage} />
            </>
          )}
        </Card>
      </div>

      {/* Drawer — Criar */}
      <Drawer
        open={createOpen}
        onClose={() => { setCreateOpen(false); setCreateError(null); setCreateForm(MED_FORM_EMPTY); }}
        title="Novo produto"
      >
        <MedicamentoForm
          form={createForm}
          onChange={setCreateForm}
          error={createError}
          isPending={criar.isPending}
          onCancel={() => { setCreateOpen(false); setCreateError(null); setCreateForm(MED_FORM_EMPTY); }}
          submitLabel="Cadastrar"
        />
        <div className="mt-4">
          <button
            type="button"
            onClick={handleCreate}
            disabled={criar.isPending}
            className="w-full rounded-xl bg-brand-500 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {criar.isPending ? 'Salvando...' : 'Cadastrar'}
          </button>
        </div>
      </Drawer>

      {/* Drawer — Editar */}
      <Drawer
        open={!!editMed}
        onClose={() => { setEditMed(null); setEditError(null); }}
        title={editMed ? `Editar: ${editMed.nome}` : 'Editar produto'}
        subtitle={editMed ? CATEGORIA_LABEL[editMed.categoria] : undefined}
      >
        <MedicamentoForm
          form={editForm}
          onChange={setEditForm}
          error={editError}
          isPending={editar.isPending}
          onCancel={() => { setEditMed(null); setEditError(null); }}
        />
        {editMed && (
          <div className="mt-4 space-y-2">
            <button
              type="button"
              onClick={handleEdit}
              disabled={editar.isPending}
              className="w-full rounded-xl bg-brand-500 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {editar.isPending ? 'Salvando...' : 'Salvar alterações'}
            </button>
            {(editMed as Medicamento & { ativo?: boolean }).ativo !== false ? (
              <button
                type="button"
                onClick={() => setConfirmInativo(editMed)}
                className="w-full rounded-xl border border-danger/30 py-2.5 text-sm font-medium text-danger transition hover:bg-red-50"
              >
                Inativar produto
              </button>
            ) : (
              <button
                type="button"
                onClick={() => { toggleAtivo.mutate({ id: editMed.id, ativo: true }); setEditMed(null); }}
                disabled={toggleAtivo.isPending}
                className="w-full rounded-xl border border-success/30 py-2.5 text-sm font-medium text-success transition hover:bg-green-50 disabled:opacity-50"
              >
                Reativar produto
              </button>
            )}
          </div>
        )}
      </Drawer>

      {/* ConfirmDialog — Inativar */}
      <ConfirmDialog
        open={!!confirmInativo}
        onClose={() => setConfirmInativo(null)}
        onConfirm={() => confirmInativo && toggleAtivo.mutate({ id: confirmInativo.id, ativo: false })}
        title="Inativar produto"
        description={`O produto "${confirmInativo?.nome ?? ''}" ficará invisível no catálogo das clínicas. Você pode reativá-lo a qualquer momento.`}
        confirmLabel="Inativar"
        variant="danger"
        isPending={toggleAtivo.isPending}
      />

      {/* Modal — Preview CSV Import */}
      <Modal
        open={csvModalOpen}
        onClose={() => { setCsvModalOpen(false); setCsvPreview(null); }}
        title="Importar CSV — Preview"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4 text-sm">
          <div className="rounded-xl bg-surface-base p-3 text-xs text-ink-500">
            <p className="font-semibold text-ink-700">Cabeçalho esperado:</p>
            <code className="mt-1 block font-mono">{CSV_HEADERS}</code>
            <p className="mt-1">
              Colunas adicionais aceitas: <code>principioAtivo, apresentacao, dosagem, receituario (Sim/Não), imagemUrl</code>
            </p>
          </div>

          {csvPreview && (
            <>
              <div className="flex gap-4">
                <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-xs font-semibold text-success">
                  ✓ {csvPreview.valid.length} linha(s) válida(s)
                </div>
                <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold ${csvPreview.errors.length > 0 ? 'bg-red-50 text-danger' : 'bg-gray-50 text-ink-400'}`}>
                  ✗ {csvPreview.errors.length} erro(s)
                </div>
              </div>

              {csvPreview.valid.length > 0 && (
                <div>
                  <p className="mb-2 font-semibold text-ink-700">Serão criados:</p>
                  <div className="max-h-40 overflow-y-auto rounded-lg border border-black/5">
                    {csvPreview.valid.map((r) => (
                      <div key={r.linha} className="flex items-center gap-3 border-b border-black/5 px-3 py-2 last:border-0 text-xs">
                        <span className="w-8 text-ink-400">#{r.linha}</span>
                        <span className="font-medium text-ink-900">{r.data.nome}</span>
                        <span className="text-ink-500">{r.data.fabricante || '—'}</span>
                        <span className="ml-auto text-ink-700">R$ {r.data.precoUnitario}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {csvPreview.errors.length > 0 && (
                <div>
                  <p className="mb-2 font-semibold text-danger">Linhas ignoradas:</p>
                  <div className="max-h-32 overflow-y-auto rounded-lg border border-red-100">
                    {csvPreview.errors.map((e) => (
                      <div key={e.linha} className="flex items-start gap-3 border-b border-red-50 px-3 py-2 last:border-0 text-xs">
                        <span className="w-8 shrink-0 text-ink-400">#{e.linha}</span>
                        <span className="text-danger">{e.motivo}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => { setCsvModalOpen(false); setCsvPreview(null); }}
                  className="flex-1 rounded-xl border border-black/10 py-2.5 text-sm font-medium text-ink-700"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => csvPreview.valid.length > 0 && importarCsv.mutate(csvPreview.valid)}
                  disabled={importarCsv.isPending || csvPreview.valid.length === 0}
                  className="flex-1 rounded-xl bg-brand-500 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {importarCsv.isPending
                    ? 'Importando...'
                    : `Importar ${csvPreview.valid.length} produto(s)`}
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
