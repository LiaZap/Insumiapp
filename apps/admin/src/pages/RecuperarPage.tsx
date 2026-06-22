import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Logo } from '../components/Logo';

export function RecuperarPage() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  const reset = useMutation({
    mutationFn: async (novaSenha: string) =>
      api.post('/api/v1/auth/reset-password', { token, password: novaSenha }),
    onSuccess: () => setSucesso(true),
    onError: (e: { response?: { data?: { message?: string } } }) =>
      setError(e.response?.data?.message ?? 'Não foi possível redefinir. Solicite um novo link.'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError('A senha precisa ter pelo menos 8 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('As duas senhas não coincidem.');
      return;
    }
    reset.mutate(password);
  };

  if (!token) {
    return (
      <Layout>
        <Card>
          <h1 className="text-xl font-bold text-brand-700">Link inválido</h1>
          <p className="mt-2 text-sm text-ink-500">
            O link de redefinição parece inválido ou incompleto. Verifique o e-mail que você
            recebeu ou solicite uma nova redefinição pelo app.
          </p>
        </Card>
      </Layout>
    );
  }

  if (sucesso) {
    return (
      <Layout>
        <Card>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#16A34A" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className="mt-5 text-xl font-bold text-brand-700">Senha atualizada</h1>
          <p className="mt-2 text-sm leading-5 text-ink-500">
            Tudo certo. Volte para o app Insumia e entre com a sua nova senha.
          </p>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <Card>
        <h1 className="text-xl font-bold text-brand-700">Definir nova senha</h1>
        <p className="mt-1 text-sm text-ink-500">
          Escolha uma senha com pelo menos 8 caracteres.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-[13px] font-semibold text-ink-700">Nova senha</label>
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="text-[12px] font-medium text-brand-500 hover:text-brand-600"
              >
                {showPass ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            <input
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              className="w-full rounded-xl border border-black/[0.12] bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-ink-700">
              Confirmar nova senha
            </label>
            <input
              type={showPass ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              className="w-full rounded-xl border border-black/[0.12] bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
              placeholder="Repita a senha"
            />
          </div>

          {error ? (
            <div className="rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5 text-[13px] text-danger">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={reset.isPending}
            className="w-full rounded-xl bg-brand-500 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60"
          >
            {reset.isPending ? 'Salvando…' : 'Definir nova senha'}
          </button>
        </form>
      </Card>
    </Layout>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full bg-surface-base">
      <header className="border-b border-black/5 bg-white">
        <div className="mx-auto flex max-w-md items-center gap-2.5 px-6 py-5">
          <Logo height={24} />
          <span className="h-7 w-px bg-black/10" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-400">Recuperar acesso</p>
        </div>
      </header>
      <main className="mx-auto max-w-md px-6 py-10">{children}</main>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-black/5 bg-white p-6 md:p-8">{children}</div>;
}
