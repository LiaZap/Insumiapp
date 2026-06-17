import { Logo } from '../components/Logo';

export function PrivacidadePage() {
  return (
    <div className="min-h-full bg-surface-base">
      {/* Topbar simples — sem login */}
      <header className="border-b border-black/5 bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-2.5 px-6 py-5">
          <Logo size={32} />
          <div className="leading-tight">
            <p className="text-sm font-bold text-brand-700">Insumia</p>
            <p className="text-[10px] uppercase tracking-[0.18em] text-ink-400">Política de Privacidade</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-bold text-brand-700">Política de Privacidade</h1>
        <p className="mt-1 text-sm text-ink-500">
          Última atualização: junho de 2026
        </p>

        <Section title="1. Quem somos">
          A Insumia é uma plataforma B2B operada por BahTech Sistemas LTDA
          (CNPJ a ser informado), com sede no Brasil. A plataforma conecta clínicas
          de estética à equipe Insumia para cotação, pedido e gestão de insumos
          estéticos e farmacêuticos.
        </Section>

        <Section title="2. Quais dados coletamos">
          Coletamos apenas os dados necessários para operar a plataforma:
          <List>
            <li><b>Dados de cadastro:</b> nome do responsável, e-mail, nome da clínica e função.</li>
            <li><b>Dados operacionais:</b> pedidos realizados, estoque informado, movimentações registradas, endereços de entrega e contas financeiras vinculadas aos pedidos.</li>
            <li><b>Dados técnicos:</b> identificador anônimo de sessão e logs essenciais ao funcionamento (não usamos rastreamento publicitário, cookies de terceiros ou ferramentas de analytics).</li>
          </List>
          Não coletamos dados de localização, contatos da agenda, fotos da galeria
          ou dados de saúde pessoais.
        </Section>

        <Section title="3. Como usamos seus dados">
          <List>
            <li>Para processar e cotar seus pedidos junto à equipe Insumia e aos fornecedores parceiros.</li>
            <li>Para manter o histórico de movimentações de estoque e as contas financeiras vinculadas a cada pedido.</li>
            <li>Para enviar notificações operacionais (status de pedido, alerta de validade, cotação disponível).</li>
            <li>Para atender exigências legais e regulatórias, em especial a rastreabilidade exigida pela Vigilância Sanitária.</li>
          </List>
          Não usamos seus dados para marketing direto sem consentimento prévio,
          não vendemos dados a terceiros, e não tomamos decisões automatizadas com
          impacto jurídico ou financeiro relevante sem revisão humana.
        </Section>

        <Section title="4. Com quem compartilhamos">
          <List>
            <li><b>Fornecedores de insumos:</b> recebem apenas os dados estritamente necessários para cotação e entrega — nome da clínica, endereço e itens pedidos. Nunca recebem dados financeiros ou de contato pessoal.</li>
            <li><b>Provedores de infraestrutura:</b> hospedagem em servidores no Brasil e parceiros estritos de operação (banco de dados, envio de e-mail transacional).</li>
            <li><b>Autoridades públicas:</b> quando legalmente requisitado por ordem judicial ou exigência regulatória.</li>
          </List>
        </Section>

        <Section title="5. Por quanto tempo guardamos">
          Mantemos seus dados enquanto sua conta estiver ativa. Após o
          encerramento, dados operacionais (pedidos, notas fiscais, rastreabilidade)
          são preservados pelo prazo legal de 5 anos por força das exigências da
          Vigilância Sanitária e da legislação fiscal. Demais dados são eliminados
          em até 30 dias após o pedido de exclusão.
        </Section>

        <Section title="6. Seus direitos (LGPD)">
          Em conformidade com a Lei Geral de Proteção de Dados (Lei 13.709/2018),
          você pode a qualquer momento:
          <List>
            <li>Confirmar a existência e acessar seus dados pessoais.</li>
            <li>Corrigir dados incompletos, inexatos ou desatualizados.</li>
            <li>Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários.</li>
            <li>Solicitar a portabilidade dos seus dados.</li>
            <li>Revogar o consentimento e excluir sua conta.</li>
          </List>
          Para exercer qualquer destes direitos, envie um e-mail para{' '}
          <a className="text-brand-500 underline" href="mailto:privacidade@insumia.app">
            privacidade@insumia.app
          </a>{' '}
          identificando o seu pedido. Responderemos em até 15 dias.
        </Section>

        <Section title="7. Segurança">
          Utilizamos criptografia TLS em todas as comunicações entre o app e
          nossos servidores. Senhas são armazenadas com hash bcrypt. O acesso aos
          dados é controlado por perfis (RBAC) e auditado. Mantemos backups
          regulares e testamos periodicamente os procedimentos de recuperação.
        </Section>

        <Section title="8. Crianças e adolescentes">
          A Insumia é destinada exclusivamente a profissionais da área da saúde
          (médicos, enfermeiros, biomédicos e equipes administrativas de clínicas).
          Não coletamos intencionalmente dados de pessoas com menos de 18 anos.
        </Section>

        <Section title="9. Alterações desta política">
          Esta política pode ser atualizada periodicamente para refletir mudanças
          legais, operacionais ou de funcionalidades. Quando houver alterações
          relevantes, notificaremos pelo app e pelo e-mail cadastrado.
        </Section>

        <Section title="10. Contato">
          Encarregado pelo Tratamento de Dados (DPO):<br />
          <b>BahTech Sistemas LTDA</b><br />
          E-mail:{' '}
          <a className="text-brand-500 underline" href="mailto:privacidade@insumia.app">
            privacidade@insumia.app
          </a>
        </Section>

        <footer className="mt-12 border-t border-black/5 pt-6 text-center text-xs text-ink-400">
          <a href="/termos" className="hover:text-ink-700">Termos de Uso</a>
          <span className="mx-2">•</span>
          <a href="/suporte" className="hover:text-ink-700">Suporte</a>
          <span className="mx-2">•</span>
          <span>© 2026 BahTech Sistemas LTDA · Insumia</span>
        </footer>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-brand-700">{title}</h2>
      <div className="mt-2 text-[15px] leading-relaxed text-ink-700">{children}</div>
    </section>
  );
}

function List({ children }: { children: React.ReactNode }) {
  return <ul className="mt-2 list-disc space-y-1.5 pl-5">{children}</ul>;
}
