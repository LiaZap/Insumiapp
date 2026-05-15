import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Pedido } from '@insumia/shared';
import { api } from '../lib/api';
import { money } from '../lib/format';

type ItemState = { precoUnitario: string; disponivel: boolean };

/** Formulário que o admin usa para montar e enviar a cotação de um pedido. */
export function CotacaoForm({ pedido, onDone }: { pedido: Pedido; onDone: () => void }) {
  const qc = useQueryClient();
  const [itens, setItens] = useState<Record<string, ItemState>>(() =>
    Object.fromEntries(
      pedido.itens.map((it) => [
        it.id,
        {
          precoUnitario: String(Number(it.precoUnitario) || Number(it.medicamento.precoUnitario) || 0),
          disponivel: it.disponivel ?? true,
        },
      ]),
    ),
  );
  const [prazo, setPrazo] = useState('7');
  const [validade, setValidade] = useState('48');
  const [obs, setObs] = useState('');
  const [error, setError] = useState<string | null>(null);

  const setItem = (id: string, patch: Partial<ItemState>) =>
    setItens((s) => ({ ...s, [id]: { ...s[id], ...patch } }));

  const resumo = useMemo(() => {
    let total = 0;
    let custo = 0;
    for (const it of pedido.itens) {
      const st = itens[it.id];
      if (!st?.disponivel) continue;
      const preco = Number(st.precoUnitario.replace(',', '.')) || 0;
      total += preco * it.quantidade;
      custo += Number(it.medicamento.custo ?? 0) * it.quantidade;
    }
    const margem = total > 0 ? ((total - custo) / total) * 100 : 0;
    return { total, custo, margem, lucro: total - custo };
  }, [itens, pedido.itens]);

  const enviar = useMutation({
    mutationFn: async () => {
      const payload = {
        itens: pedido.itens.map((it) => ({
          itemId: it.id,
          precoUnitario: Number(itens[it.id].precoUnitario.replace(',', '.')) || 0,
          disponivel: itens[it.id].disponivel,
        })),
        prazoEntregaDias: Number(prazo) || 0,
        validadeHoras: Number(validade) || 48,
        observacao: obs || undefined,
      };
      return api.patch(`/api/v1/pedidos/${pedido.id}/cotacao`, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pedidos-todos'] });
      onDone();
    },
    onError: (e) =>
      setError(
        (e as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Erro ao enviar',
      ),
  });

  return (
    <div className="rounded-xl border border-brand-100 bg-brand-50/40 p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-brand-600">
        Montar cotação
      </p>

      {/* Itens */}
      <div className="space-y-2">
        {pedido.itens.map((it) => {
          const st = itens[it.id];
          const custoUn = Number(it.medicamento.custo ?? 0);
          const precoUn = Number(st.precoUnitario.replace(',', '.')) || 0;
          return (
            <div key={it.id} className="rounded-lg bg-white p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-ink-900">
                  {it.medicamento.nome}
                  <span className="ml-1 text-xs text-ink-400">×{it.quantidade}</span>
                </p>
                <label className="flex items-center gap-1.5 text-xs text-ink-500">
                  <input
                    type="checkbox"
                    checked={st.disponivel}
                    onChange={(e) => setItem(it.id, { disponivel: e.target.checked })}
                  />
                  Disponível
                </label>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-ink-400">R$</span>
                  <input
                    value={st.precoUnitario}
                    onChange={(e) => setItem(it.id, { precoUnitario: e.target.value })}
                    disabled={!st.disponivel}
                    className="w-24 rounded-lg border border-brand-100 px-2 py-1 text-sm outline-none focus:border-brand-500 disabled:bg-gray-50 disabled:text-ink-400"
                  />
                  <span className="text-xs text-ink-400">/un</span>
                </div>
                {custoUn > 0 && st.disponivel ? (
                  <span
                    className={`text-xs font-medium ${
                      precoUn > custoUn ? 'text-success' : 'text-danger'
                    }`}
                  >
                    margem {precoUn > 0 ? (((precoUn - custoUn) / precoUn) * 100).toFixed(0) : 0}%
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* Prazo + validade */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-700">Prazo entrega (dias)</label>
          <input
            value={prazo}
            onChange={(e) => setPrazo(e.target.value)}
            className="w-full rounded-lg border border-brand-100 px-2 py-1.5 text-sm outline-none focus:border-brand-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-700">Validade (horas)</label>
          <input
            value={validade}
            onChange={(e) => setValidade(e.target.value)}
            className="w-full rounded-lg border border-brand-100 px-2 py-1.5 text-sm outline-none focus:border-brand-500"
          />
        </div>
      </div>
      <div className="mt-2">
        <label className="mb-1 block text-xs font-medium text-ink-700">Observação (opcional)</label>
        <input
          value={obs}
          onChange={(e) => setObs(e.target.value)}
          placeholder="Ex: condições de pagamento"
          className="w-full rounded-lg border border-brand-100 px-2 py-1.5 text-sm outline-none focus:border-brand-500"
        />
      </div>

      {/* Resumo financeiro */}
      <div className="mt-3 rounded-lg bg-brand-800 p-3 text-white">
        <div className="flex justify-between text-sm">
          <span className="text-white/70">Total da cotação</span>
          <span className="font-bold">{money(resumo.total)}</span>
        </div>
        {resumo.custo > 0 ? (
          <div className="mt-1 flex justify-between text-xs">
            <span className="text-white/50">
              Lucro estimado {money(resumo.lucro)}
            </span>
            <span className={resumo.margem >= 20 ? 'text-accent-400' : 'text-amber-300'}>
              margem {resumo.margem.toFixed(1)}%
            </span>
          </div>
        ) : null}
      </div>

      {error ? <p className="mt-2 text-xs text-danger">{error}</p> : null}

      <button
        onClick={() => enviar.mutate()}
        disabled={enviar.isPending}
        className="mt-3 w-full rounded-xl bg-brand-500 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-50"
      >
        {enviar.isPending ? 'Enviando...' : 'Enviar cotação ao cliente'}
      </button>
    </div>
  );
}
