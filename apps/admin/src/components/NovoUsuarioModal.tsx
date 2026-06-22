import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useToastMutation } from '../lib/useToastMutation';
import { Modal } from './Modal';
import { Field } from './ui';
import type { UserRole } from '@insumia/shared';

const ROLE_LABEL: Record<UserRole, string> = {
  admin: 'Administrador',
  comprador: 'Comprador',
  financeiro: 'Financeiro',
};

interface Props {
  open: boolean;
  onClose: () => void;
  defaultRole: UserRole;
}

interface FormState {
  nome: string;
  email: string;
  password: string;
  empresa: string;
  role: UserRole;
}

function validate(form: FormState): string | null {
  if (form.nome.trim().length < 2) return 'Nome deve ter ao menos 2 caracteres.';
  if (!form.email.includes('@')) return 'E-mail inválido.';
  if (form.password.length < 8) return 'Senha deve ter ao menos 8 caracteres.';
  return null;
}

export function NovoUsuarioModal({ open, onClose, defaultRole }: Props) {
  const qc = useQueryClient();

  const emptyForm = (): FormState => ({
    nome: '',
    email: '',
    password: '',
    empresa: '',
    role: defaultRole,
  });

  const [form, setForm] = useState<FormState>(emptyForm);
  const [validationError, setValidationError] = useState<string | null>(null);

  const criar = useToastMutation({
    mutationFn: async (payload: FormState) => {
      const body: Record<string, unknown> = {
        nome: payload.nome.trim(),
        email: payload.email.trim(),
        password: payload.password,
        role: payload.role,
      };
      if (payload.empresa.trim().length >= 2) {
        body.empresa = payload.empresa.trim();
      }
      return (await api.post('/api/v1/users', body)).data;
    },
    successMessage: 'Usuário criado com sucesso.',
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      setForm(emptyForm());
      setValidationError(null);
      onClose();
    },
  });

  const set = (key: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = () => {
    const err = validate(form);
    if (err) {
      setValidationError(err);
      return;
    }
    setValidationError(null);
    criar.mutate(form);
  };

  const handleClose = () => {
    setForm(emptyForm());
    setValidationError(null);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Novo usuário"
      description="Preencha os dados para criar a conta."
    >
      <div className="space-y-1">
        <Field label="Nome completo" value={form.nome} onChange={(v) => set('nome', v)} />
        <Field label="E-mail" value={form.email} onChange={(v) => set('email', v)} />
        <Field
          label="Senha (mín. 8 caracteres)"
          type="password"
          value={form.password}
          onChange={(v) => set('password', v)}
        />
        <Field label="Empresa (opcional)" value={form.empresa} onChange={(v) => set('empresa', v)} />

        <div className="mb-3">
          <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-400">
            Perfil
          </label>
          <select
            value={form.role}
            onChange={(e) => set('role', e.target.value as UserRole)}
            className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-500"
          >
            {(Object.keys(ROLE_LABEL) as UserRole[]).map((r) => (
              <option key={r} value={r}>
                {ROLE_LABEL[r]}
              </option>
            ))}
          </select>
        </div>

        {validationError ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-danger">{validationError}</p>
        ) : null}

        <div className="mt-5 flex gap-2 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 rounded-xl border border-black/10 py-2.5 text-sm font-medium text-ink-700 transition hover:bg-surface-base"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={criar.isPending}
            className="flex-1 rounded-xl bg-brand-500 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-50"
          >
            {criar.isPending ? 'Criando...' : 'Criar usuário'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
