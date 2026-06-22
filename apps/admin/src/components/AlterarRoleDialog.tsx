import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import * as Dialog from '@radix-ui/react-dialog';
import { api } from '../lib/api';
import { useToastMutation } from '../lib/useToastMutation';
import type { UserRole } from '@insumia/shared';

const ROLE_LABEL: Record<UserRole, string> = {
  admin: 'Administrador',
  comprador: 'Comprador',
  financeiro: 'Financeiro',
};

interface TargetUser {
  id: string;
  nome: string;
  empresa: string | null;
  role: UserRole;
}

interface Props {
  user: TargetUser | null;
  onClose: () => void;
}

export function AlterarRoleDialog({ user, onClose }: Props) {
  const qc = useQueryClient();
  const [role, setRole] = useState<UserRole>('financeiro');

  useEffect(() => {
    if (user) setRole(user.role);
  }, [user]);

  const alterar = useToastMutation({
    mutationFn: async ({ id, newRole }: { id: string; newRole: UserRole }) =>
      (await api.patch(`/api/v1/users/${id}/role`, { role: newRole })).data,
    successMessage: 'Perfil alterado com sucesso.',
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      onClose();
    },
  });

  const open = Boolean(user);
  const displayName = user?.empresa ?? user?.nome ?? '';

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm mx-4 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          aria-describedby="alterar-role-desc"
        >
          <Dialog.Title className="text-base font-bold text-ink-900">Alterar perfil</Dialog.Title>
          <Dialog.Description id="alterar-role-desc" className="mt-2 text-sm text-ink-500 leading-relaxed">
            Alteração de perfil para <strong>{displayName}</strong>. Esta ação é auditável.
          </Dialog.Description>

          <div className="mt-4">
            <label className="mb-1.5 block text-xs font-medium text-ink-700">
              Novo perfil
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-500"
            >
              {(Object.keys(ROLE_LABEL) as UserRole[]).map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABEL[r]}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-5 flex gap-2">
            <Dialog.Close asChild>
              <button className="flex-1 rounded-xl border border-black/10 py-2.5 text-sm font-medium text-ink-700 transition hover:bg-surface-base">
                Cancelar
              </button>
            </Dialog.Close>
            <button
              onClick={() => user && alterar.mutate({ id: user.id, newRole: role })}
              disabled={alterar.isPending || role === user?.role}
              className="flex-1 rounded-xl bg-brand-500 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {alterar.isPending ? 'Salvando...' : 'Confirmar'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
