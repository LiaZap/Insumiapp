import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../lib/auth';
import { Logo } from '../components/Logo';

/* Ícones de linha — traço fino, estilo editorial */
function IconPedidos() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M9 4h6a2 2 0 0 1 2 2v0h1a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h1v0a2 2 0 0 1 2-2Z" stroke="#9AECFF" strokeWidth="1.5" />
      <path d="M9 4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V4Z" stroke="#9AECFF" strokeWidth="1.5" />
      <path d="M8.5 12h7M8.5 15.5h4.5" stroke="#9AECFF" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function IconEstoque() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 3 4 7v10l8 4 8-4V7l-8-4Z" stroke="#9AECFF" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="m4 7 8 4 8-4M12 21V11" stroke="#9AECFF" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}
function IconFinanceiro() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="6" width="18" height="13" rx="2.5" stroke="#9AECFF" strokeWidth="1.5" />
      <path d="M3 10h18" stroke="#9AECFF" strokeWidth="1.5" />
      <circle cx="16.5" cy="14.5" r="1.6" stroke="#9AECFF" strokeWidth="1.5" />
    </svg>
  );
}

const HIGHLIGHTS = [
  { Icon: IconPedidos, title: 'Pedidos & cotações', desc: 'Fluxo de cotação de ponta a ponta' },
  { Icon: IconEstoque, title: 'Estoque inteligente', desc: 'Posição e movimentações em tempo real' },
  { Icon: IconFinanceiro, title: 'Financeiro integrado', desc: 'Contas conectadas a cada pedido' },
];

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('demo@insumia.app');
  const [password, setPassword] = useState('demo12345');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ??
        'E-mail ou senha incorretos';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid h-full grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
      {/* Painel de marca */}
      <div className="relative hidden overflow-hidden lg:block">
        {/* Fundo navy refinado */}
        <div className="absolute inset-0 bg-brand-900" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(900px 520px at 78% -8%, rgba(76,130,204,0.45), transparent 60%), radial-gradient(700px 600px at -10% 110%, rgba(45,190,230,0.16), transparent 55%)',
          }}
        />
        {/* Filete de marca */}
        <div className="absolute left-0 top-0 h-full w-1 bg-accent-400/70" />

        <div className="relative flex h-full flex-col justify-between p-14">
          {/* Topo */}
          <div className="flex items-center gap-3">
            <div className="drop-shadow-[0_8px_20px_rgba(0,0,0,0.45)]">
              <Logo size={46} />
            </div>
            <div className="leading-tight">
              <p className="text-[15px] font-bold tracking-tight text-white">Insumia</p>
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-accent-400/80">
                Back Office
              </p>
            </div>
          </div>

          {/* Centro */}
          <div className="max-w-md">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-accent-400/80">
              Gestão de insumos estéticos
            </p>
            <h1 className="text-[2.05rem] font-bold leading-[1.18] tracking-tight text-white">
              Controle total da sua operação, do pedido à entrega.
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-white/55">
              Cotações, pedidos, estoque e financeiro das suas clínicas reunidos em um único painel.
            </p>

            {/* Capacidades — lista editorial com divisórias */}
            <div className="mt-10 border-t border-white/10">
              {HIGHLIGHTS.map(({ Icon, title, desc }) => (
                <div key={title} className="flex items-center gap-4 border-b border-white/10 py-4">
                  <Icon />
                  <div>
                    <p className="text-sm font-semibold text-white">{title}</p>
                    <p className="text-[13px] text-white/45">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rodapé */}
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} Insumia · Plataforma B2B de insumos estéticos
          </p>
        </div>
      </div>

      {/* Painel de formulário */}
      <div className="flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-[360px]">
          {/* Logo (aparece em telas menores) */}
          <div className="mb-10 flex items-center gap-2.5 lg:hidden">
            <Logo size={40} />
            <span className="text-[15px] font-bold tracking-tight text-brand-700">Insumia</span>
          </div>

          <h2 className="text-[1.6rem] font-bold tracking-tight text-brand-700">Acessar painel</h2>
          <p className="mt-1.5 text-sm text-ink-500">Entre com sua conta para continuar</p>

          <form onSubmit={handleSubmit} className="mt-9 space-y-5">
            <div>
              <label className="mb-2 block text-[13px] font-semibold text-ink-700">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full rounded-xl border border-black/[0.12] bg-white px-4 py-3 text-sm text-ink-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
                placeholder="voce@empresa.com.br"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-[13px] font-semibold text-ink-700">Senha</label>
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
                autoComplete="current-password"
                className="w-full rounded-xl border border-black/[0.12] bg-white px-4 py-3 text-sm text-ink-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
                placeholder="••••••••"
              />
            </div>

            {error ? (
              <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5 text-[13px] text-danger">
                <span className="mt-px">⚠</span>
                <span>{error}</span>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Entrando…
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          <div className="mt-7 flex items-center gap-3 rounded-xl bg-surface-base px-4 py-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-xs font-bold text-brand-600">
              D
            </div>
            <div className="text-[12px] leading-tight text-ink-500">
              <span className="font-semibold text-ink-700">Conta de demonstração</span>
              <br />
              demo@insumia.app · demo12345
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
