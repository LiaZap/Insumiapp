import { useState } from 'react';
import { Logo } from '../components/Logo';

const EMAIL_SUPORTE = 'suporte@insumia.app';
const WHATSAPP_NUMERO = '5511999999999'; // ajustar para o número real
const WHATSAPP_DISPLAY = '+55 (11) 99999-9999';

export function SuportePage() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [assunto, setAssunto] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const body =
      `Nome: ${nome}\n` +
      `E-mail: ${email}\n\n` +
      `${mensagem}\n\n` +
      `— Enviado pelo formulário de suporte do Insumia`;
    const url = `mailto:${EMAIL_SUPORTE}?subject=${encodeURIComponent(
      `[Suporte Insumia] ${assunto}`,
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
    setEnviado(true);
  };

  return (
    <div className="min-h-full bg-surface-base">
      {/* Topbar */}
      <header className="border-b border-black/5 bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-2.5 px-6 py-5">
          <Logo size={32} />
          <div className="leading-tight">
            <p className="text-sm font-bold text-brand-700">Insumia</p>
            <p className="text-[10px] uppercase tracking-[0.18em] text-ink-400">Suporte</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-bold text-brand-700">Central de Suporte</h1>
        <p className="mt-1 text-sm text-ink-500">
          Como podemos te ajudar? Atendimento em horário comercial (seg–sex, 8h–18h).
        </p>

        {/* Contato rápido */}
        <section className="mt-8 grid gap-3 md:grid-cols-2">
          <a
            href={`https://wa.me/${WHATSAPP_NUMERO}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-4 rounded-2xl border border-black/5 bg-white px-5 py-4 transition hover:border-brand-200 hover:shadow-sm"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-ink-900">WhatsApp</p>
              <p className="mt-0.5 text-xs text-ink-500">{WHATSAPP_DISPLAY}</p>
            </div>
          </a>

          <a
            href={`mailto:${EMAIL_SUPORTE}`}
            className="flex items-center gap-4 rounded-2xl border border-black/5 bg-white px-5 py-4 transition hover:border-brand-200 hover:shadow-sm"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#1B498C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 6-10 7L2 6" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-ink-900">E-mail</p>
              <p className="mt-0.5 text-xs text-ink-500">{EMAIL_SUPORTE}</p>
            </div>
          </a>
        </section>

        {/* Formulário */}
        <section className="mt-10 rounded-2xl border border-black/5 bg-white p-6">
          <h2 className="text-lg font-semibold text-brand-700">Mande sua mensagem</h2>
          <p className="mt-1 text-sm text-ink-500">
            Preencha o formulário abaixo. Vamos responder em até 1 dia útil pelo e-mail informado.
          </p>

          {enviado ? (
            <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-5 py-4">
              <p className="font-semibold text-green-700">Tudo certo!</p>
              <p className="mt-1 text-sm text-green-700/80">
                Seu cliente de e-mail abriu com a mensagem pronta. Se não abriu automaticamente,
                envie diretamente para{' '}
                <a className="underline" href={`mailto:${EMAIL_SUPORTE}`}>
                  {EMAIL_SUPORTE}
                </a>.
              </p>
              <button
                onClick={() => setEnviado(false)}
                className="mt-3 text-xs font-semibold text-brand-500 hover:text-brand-600"
              >
                Enviar outra mensagem
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Seu nome" required>
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Como prefere ser chamado(a)"
                    className="w-full rounded-xl border border-black/[0.12] bg-white px-4 py-3 text-sm text-ink-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
                  />
                </Field>
                <Field label="Seu e-mail" required>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="voce@clinica.com.br"
                    className="w-full rounded-xl border border-black/[0.12] bg-white px-4 py-3 text-sm text-ink-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
                  />
                </Field>
              </div>
              <Field label="Assunto" required>
                <input
                  type="text"
                  required
                  value={assunto}
                  onChange={(e) => setAssunto(e.target.value)}
                  placeholder="Ex: dúvida sobre um pedido, problema no app, etc."
                  className="w-full rounded-xl border border-black/[0.12] bg-white px-4 py-3 text-sm text-ink-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
                />
              </Field>
              <Field label="Mensagem" required>
                <textarea
                  required
                  rows={6}
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  placeholder="Descreva sua dúvida ou problema com o maior detalhe possível."
                  className="w-full resize-y rounded-xl border border-black/[0.12] bg-white px-4 py-3 text-sm text-ink-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
                />
              </Field>

              <button
                type="submit"
                className="w-full rounded-xl bg-brand-500 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-600 md:w-auto md:px-8"
              >
                Enviar mensagem
              </button>
            </form>
          )}
        </section>

        {/* FAQ enxuta */}
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-brand-700">Perguntas frequentes</h2>
          <div className="mt-4 space-y-3">
            <Faq pergunta="Quanto tempo a Insumia leva pra cotar meu pedido?">
              Em geral, a equipe responde com a cotação completa em até 2 horas úteis.
              Pedidos enviados fora do horário comercial entram na fila do próximo dia útil.
            </Faq>
            <Faq pergunta="Como funciona a compra coletiva?">
              Pedidos de várias clínicas para o mesmo medicamento são agrupados. A
              Insumia leva esse volume aos fornecedores e consegue preços melhores,
              repassados a cada clínica do grupo.
            </Faq>
            <Faq pergunta="Onde fica meu histórico de notas fiscais?">
              Cada pedido entregue tem a nota fiscal anexada — abra o detalhe do
              pedido na aba Pedidos para visualizá-la ou baixá-la.
            </Faq>
            <Faq pergunta="Quero excluir minha conta. Como faço?">
              Envie um e-mail para{' '}
              <a className="text-brand-500 underline" href="mailto:privacidade@insumia.app">
                privacidade@insumia.app
              </a>{' '}
              do mesmo endereço cadastrado, com o assunto “Excluir conta”. Confirmamos
              a exclusão em até 15 dias.
            </Faq>
          </div>
        </section>

        <footer className="mt-12 border-t border-black/5 pt-6 text-center text-xs text-ink-400">
          <a href="/privacidade" className="hover:text-ink-700">Política de Privacidade</a>
          <span className="mx-2">•</span>
          <span>© 2026 BahTech Sistemas LTDA · Insumia</span>
        </footer>
      </main>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-semibold text-ink-700">
        {label}
        {required ? <span className="ml-1 text-danger">*</span> : null}
      </label>
      {children}
    </div>
  );
}

function Faq({ pergunta, children }: { pergunta: string; children: React.ReactNode }) {
  return (
    <details className="group rounded-xl border border-black/5 bg-white px-5 py-4">
      <summary className="cursor-pointer list-none">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-ink-900">{pergunta}</span>
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="#9AA3B2"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0 transition group-open:rotate-180"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </summary>
      <p className="mt-3 text-sm leading-relaxed text-ink-500">{children}</p>
    </details>
  );
}
