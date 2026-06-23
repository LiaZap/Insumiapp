import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Configuracao } from '@insumia/shared';
import { api } from '../lib/api';
import { useToastMutation } from '../lib/useToastMutation';
import { Card, PageHeader, Spinner, ErrorState } from '../components/ui';

const LABELS: Record<string, string> = {
  'estoque.limiar_baixo': 'Limiar de estoque baixo (unidades)',
  'cotacao.validade_horas': 'Validade da cotação (horas)',
  'cotacao.margem_padrao': 'Margem padrão sugerida (%)',
};

export function ConfiguracoesPage() {
  const qc = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['configuracoes'],
    queryFn: async () => (await api.get<Configuracao[]>('/api/v1/configuracoes')).data,
  });

  const [valores, setValores] = useState<Record<string, string>>({});
  useEffect(() => {
    if (data) setValores(Object.fromEntries(data.map((c) => [c.chave, c.valor])));
  }, [data]);

  const dirty = useMemo(
    () => (data ?? []).some((c) => (valores[c.chave] ?? c.valor) !== c.valor),
    [data, valores],
  );

  const salvar = useToastMutation({
    mutationFn: () =>
      api.patch('/api/v1/configuracoes', {
        itens: (data ?? []).map((c) => ({ chave: c.chave, valor: valores[c.chave] ?? c.valor })),
      }),
    successMessage: 'Configurações salvas.',
    onSuccess: () => qc.invalidateQueries({ queryKey: ['configuracoes'] }),
  });

  return (
    <div className="p-6">
      <PageHeader title="Configurações" subtitle="Parâmetros de negócio do sistema (sem deploy)." />

      {isLoading ? (
        <Spinner />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : (
        <Card className="max-w-2xl">
          <div className="space-y-6 p-6">
            {(data ?? []).map((c) => (
              <div key={c.chave}>
                <label className="block text-sm font-medium text-ink-900">
                  {LABELS[c.chave] ?? c.chave}
                </label>
                {c.descricao ? <p className="mt-0.5 text-xs text-ink-400">{c.descricao}</p> : null}
                <div className="mt-1.5 flex items-center gap-2">
                  <input
                    value={valores[c.chave] ?? ''}
                    onChange={(e) => setValores((v) => ({ ...v, [c.chave]: e.target.value }))}
                    className="w-40 rounded-lg border border-brand-100 px-3 py-2 text-sm outline-none focus:border-brand-500"
                  />
                  <code className="text-[11px] text-ink-300">{c.chave}</code>
                </div>
              </div>
            ))}

            <div className="flex justify-end border-t border-black/5 pt-4">
              <button
                onClick={() => salvar.mutate()}
                disabled={!dirty || salvar.isPending}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-50"
              >
                {salvar.isPending ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
