/**
 * MedicamentoForm — form compartilhado entre criar e editar medicamento.
 * Extrai o form do MedicamentosPage para manter arquivos < 500 linhas.
 */
import { type MedicamentoCategoria } from '@insumia/shared';
import { CATEGORIA_LABEL, medicamentoCategoriaSchema } from '@insumia/shared';
import { Field } from './ui';

export type MedForm = {
  nome: string;
  fabricante: string;
  principioAtivo: string;
  apresentacao: string;
  dosagem: string;
  categoria: MedicamentoCategoria;
  precoUnitario: string;
  custo: string;
  ean: string;
  receituario: boolean;
  imagemUrl: string;
};

export const MED_FORM_EMPTY: MedForm = {
  nome: '',
  fabricante: '',
  principioAtivo: '',
  apresentacao: '',
  dosagem: '',
  categoria: 'estetica',
  precoUnitario: '',
  custo: '',
  ean: '',
  receituario: false,
  imagemUrl: '',
};

const CATEGORIAS = medicamentoCategoriaSchema.options;

interface Props {
  form: MedForm;
  onChange: (f: MedForm) => void;
  error: string | null;
  isPending: boolean;
  onCancel: () => void;
  submitLabel?: string;
}

export function MedicamentoForm({ form, onChange, error, isPending, onCancel, submitLabel = 'Salvar' }: Props) {
  const set = (patch: Partial<MedForm>) => onChange({ ...form, ...patch });

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="space-y-3"
      id="med-form"
    >
      <Field label="Nome *" value={form.nome} onChange={(v) => set({ nome: v })} />
      <Field label="Fabricante" value={form.fabricante} onChange={(v) => set({ fabricante: v })} />
      <Field label="Princípio Ativo" value={form.principioAtivo} onChange={(v) => set({ principioAtivo: v })} />

      <div className="grid grid-cols-2 gap-3">
        <Field label="Apresentação" value={form.apresentacao} onChange={(v) => set({ apresentacao: v })} />
        <Field label="Dosagem" value={form.dosagem} onChange={(v) => set({ dosagem: v })} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-400">
            Categoria
          </label>
          <select
            value={form.categoria}
            onChange={(e) => set({ categoria: e.target.value as MedicamentoCategoria })}
            className="w-full rounded-lg border border-brand-100 px-3 py-2 text-sm outline-none focus:border-brand-500"
          >
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>
                {CATEGORIA_LABEL[c]}
              </option>
            ))}
          </select>
        </div>
        <Field label="EAN" value={form.ean} onChange={(v) => set({ ean: v })} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Preço (R$) *" value={form.precoUnitario} onChange={(v) => set({ precoUnitario: v })} />
        <Field label="Custo (R$)" value={form.custo} onChange={(v) => set({ custo: v })} />
      </div>

      <Field label="Imagem URL" value={form.imagemUrl} onChange={(v) => set({ imagemUrl: v })} />

      <label className="flex items-center gap-2 text-sm text-ink-700">
        <input
          type="checkbox"
          checked={form.receituario}
          onChange={(e) => set({ receituario: e.target.checked })}
        />
        Exige receituário
      </label>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl border border-black/10 py-2.5 text-sm font-medium text-ink-700"
        >
          Cancelar
        </button>
        <button
          type="submit"
          form="med-form"
          disabled={isPending}
          className="flex-1 rounded-xl bg-brand-500 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {isPending ? 'Salvando...' : submitLabel}
        </button>
      </div>
    </form>
  );
}

/** Converte MedForm em payload da API, parseando decimais. */
export function formToPayload(f: MedForm) {
  const parseDecimal = (s: string) => {
    const n = Number(s.replace(',', '.'));
    return isNaN(n) ? null : n;
  };
  return {
    nome: f.nome.trim(),
    principioAtivo: f.principioAtivo.trim() || null,
    fabricante: f.fabricante.trim() || null,
    apresentacao: f.apresentacao.trim() || null,
    dosagem: f.dosagem.trim() || null,
    categoria: f.categoria,
    precoUnitario: parseDecimal(f.precoUnitario) ?? 0,
    custo: parseDecimal(f.custo),
    ean: f.ean.trim() || null,
    receituario: f.receituario,
    imagemUrl: f.imagemUrl.trim() || null,
  };
}

/** Valida o form localmente antes de enviar. Retorna string de erro ou null. */
export function validateMedForm(f: MedForm): string | null {
  if (f.nome.trim().length < 2) return 'Nome deve ter pelo menos 2 caracteres.';
  const preco = Number(f.precoUnitario.replace(',', '.'));
  if (!f.precoUnitario.trim() || isNaN(preco) || preco < 0) return 'Preço inválido.';
  if (f.custo.trim()) {
    const custo = Number(f.custo.replace(',', '.'));
    if (isNaN(custo) || custo < 0) return 'Custo inválido.';
  }
  if (f.imagemUrl.trim() && !/^https?:\/\/.+/.test(f.imagemUrl.trim())) {
    return 'URL da imagem inválida.';
  }
  return null;
}
