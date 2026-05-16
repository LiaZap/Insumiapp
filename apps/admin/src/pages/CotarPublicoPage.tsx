import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Logo } from '../components/Logo';
import { Spinner } from '../components/ui';

type AgrupamentoPublico = {
  numero: string;
  status: string;
  aceitandoLances: boolean;
  medicamento: { nome: string; fabricante: string | null; apresentacao: string | null; dosagem: string | null };
  totalPedidos: number;
  totalVolume: number;
};

/** Página pública — fornecedor dá um lance sem login. URL: /cotar/:token */
export function CotarPublicoPage() {
  const { token } = useParams<{ token: string }>();
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [prazo, setPrazo] = useState('');
  const [obs, setObs] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

  const cotacao = useQuery({
    queryKey: ['publico', token],
    queryFn: async () =>
      (await api.get<AgrupamentoPublico>(`/api/v1/publico/agrupamentos/${token}`)).data,
    retry: false,
  });

  const enviar = useMutation({
    mutationFn: async () => {
      const precoNum = Number(preco.replace(',', '.'));
      const prazoNum = parseInt(prazo, 10);
      return api.post(`/api/v1/publico/agrupamentos/${token}/lance`, {
        fornecedorNome: nome.trim(),
        precoUnitario: precoNum,
        prazoEntregaDias: prazoNum,
        observacao: obs || undefined,
      });
    },
    onSuccess: () => setEnviado(true),
    onError: (e) =>
      setErro(
        (e as { response?: { data?: { message?: string } } }).response?.data?.message ??
          'Não foi possível enviar o lance',
      ),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    if (nome.trim().length < 2) return setErro('Informe o nome do fornecedor');
    if (!Number(preco.replace(',', '.'))) return setErro('Informe um preço válido');
    if (!parseInt(prazo, 10) && prazo !== '0') return setErro('Informe o prazo de entrega');
    enviar.mutate();
  };

  return (
    <div className="flex min-h-full items-center justify-center bg-brand-900 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <Logo size={40} />
          <span className="text-lg font-bold text-white">Insumia</span>
        </div>

        <div className="rounded-2xl bg-white p-7 shadow-xl">
          {cotacao.isLoading ? (
            <Spinner />
          ) : cotacao.isError || !cotacao.data ? (
            <div className="py-8 text-center">
              <p className="text-lg font-semibold text-ink-900">Cotação não encontrada</p>
              <p className="mt-1 text-sm text-ink-500">O link pode estar incorreto ou expirado.</p>
            </div>
          ) : enviado ? (
            <div className="py-8 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl text-success">
                ✓
              </div>
              <p className="text-lg font-semibold text-ink-900">Lance enviado!</p>
              <p className="mt-1 text-sm text-ink-500">
                Obrigado. A equipe Insumia vai avaliar e entrar em contato.
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
                Cotação {cotacao.data.numero}
              </p>
              <h1 className="mt-1 text-xl font-bold text-brand-700">
                {cotacao.data.medicamento.nome}
              </h1>
              <p className="text-sm text-ink-500">
                {[cotacao.data.medicamento.fabricante, cotacao.data.medicamento.apresentacao, cotacao.data.medicamento.dosagem]
                  .filter(Boolean)
                  .join(' · ')}
              </p>

              <div className="mt-4 flex gap-3">
                <div className="flex-1 rounded-xl bg-surface-base p-3 text-center">
                  <p className="text-2xl font-bold text-brand-700">{cotacao.data.totalVolume}</p>
                  <p className="text-xs text-ink-500">unidades</p>
                </div>
                <div className="flex-1 rounded-xl bg-surface-base p-3 text-center">
                  <p className="text-2xl font-bold text-brand-700">{cotacao.data.totalPedidos}</p>
                  <p className="text-xs text-ink-500">clínicas</p>
                </div>
              </div>

              {!cotacao.data.aceitandoLances ? (
                <p className="mt-5 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  Esta cotação não está aceitando lances no momento.
                </p>
              ) : (
                <form onSubmit={handleSubmit} className="mt-5 space-y-3">
                  <Field label="Nome do fornecedor" value={nome} onChange={setNome} placeholder="Sua empresa" />
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Preço unitário (R$)" value={preco} onChange={setPreco} placeholder="0,00" />
                    <Field label="Prazo entrega (dias)" value={prazo} onChange={setPrazo} placeholder="0" />
                  </div>
                  <Field label="Observação (opcional)" value={obs} onChange={setObs} placeholder="Condições, pagamento..." />
                  {erro ? <p className="text-sm text-danger">{erro}</p> : null}
                  <button
                    type="submit"
                    disabled={enviar.isPending}
                    className="w-full rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-50"
                  >
                    {enviar.isPending ? 'Enviando...' : 'Enviar meu lance'}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
        <p className="mt-4 text-center text-xs text-white/30">
          © {new Date().getFullYear()} Insumia · Compra coletiva de insumos
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-ink-700">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-black/10 px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
      />
    </div>
  );
}
