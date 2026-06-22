import { Logo } from '../components/Logo';

export function TermosPage() {
  return (
    <div className="min-h-full bg-surface-base">
      {/* Topbar simples — sem login */}
      <header className="border-b border-black/5 bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-2.5 px-6 py-5">
          <Logo height={24} />
          <span className="h-7 w-px bg-black/10" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-400">Termos de Uso</p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-bold text-brand-700">Termos de Uso</h1>
        <p className="mt-1 text-sm text-ink-500">Última atualização: junho de 2026</p>

        <p className="mt-6 text-[15px] leading-relaxed text-ink-700">
          Estes Termos de Uso (“Termos”) regem o acesso e a utilização da plataforma
          Insumia (“Insumia”, “nós”). Ao criar uma conta ou usar o app, você
          (“Cliente” ou “você”) concorda integralmente com estes Termos. Se não
          concordar, não utilize a plataforma.
        </p>

        <Section title="1. O que é a Insumia">
          A Insumia é uma plataforma B2B (negócio-para-negócio) que conecta clínicas
          de estética à equipe Insumia para cotação, pedido e gestão de insumos
          e correlatos para procedimentos estéticos (cosméticos, materiais
          descartáveis, antissépticos, soluções e instrumentais). A Insumia atua
          como intermediária comercial e prestadora de serviço de tecnologia. A
          venda e a entrega dos insumos são realizadas em conformidade com a
          legislação brasileira aplicável.
        </Section>

        <Section title="2. Quem pode usar">
          A plataforma destina-se exclusivamente a pessoas jurídicas ou profissionais
          da área da saúde habilitados, com responsável técnico devidamente
          registrado nos respectivos conselhos de classe. Ao se cadastrar, você
          declara:
          <List>
            <li>Ser maior de 18 anos.</li>
            <li>Ter poderes para representar a clínica/empresa cadastrada.</li>
            <li>Cumprir as exigências da Vigilância Sanitária aplicáveis à sua atividade.</li>
            <li>Que as informações fornecidas no cadastro são verdadeiras, completas e atualizadas.</li>
          </List>
        </Section>

        <Section title="3. Cadastro, login e segurança da conta">
          O cadastro pode ser sujeito à validação prévia pela equipe Insumia.
          Você é o único responsável pela guarda das suas credenciais (e-mail e
          senha) e por todas as atividades realizadas com a sua conta. Em caso de
          suspeita de acesso indevido, você deve nos avisar imediatamente pelo
          e-mail{' '}
          <a className="text-brand-500 underline" href="mailto:contato@bahtech.com.br">
            contato@bahtech.com.br
          </a>.
        </Section>

        <Section title="4. Pedidos, cotação e compra coletiva">
          Os pedidos enviados pelo app são tratados como solicitação de cotação.
          A Insumia agrupa, quando aplicável, pedidos de várias clínicas pelo mesmo
          medicamento ou insumo, e responde com uma cotação contendo preço,
          condições, prazo de entrega e validade da oferta.
          <List>
            <li>O pedido só é considerado <b>fechado</b> após o aceite da cotação dentro do prazo de validade.</li>
            <li>O Cliente pode <b>recusar</b> a cotação sem nenhum custo dentro do prazo de validade.</li>
            <li>Cotações expiradas precisam ser refeitas, e os valores poderão divergir em função do mercado.</li>
            <li>Itens marcados como <b>indisponíveis</b> na cotação não compõem o valor final.</li>
            <li>Para medicamentos sob prescrição ou de controle especial, o Cliente deve enviar o receituário válido antes da liberação do envio.</li>
          </List>
        </Section>

        <Section title="5. Pagamento e entrega">
          As condições de pagamento (forma, prazo e meios) são definidas na cotação
          de cada pedido e podem variar conforme o histórico do Cliente, o volume
          contratado e exigências do fornecedor parceiro. A entrega é realizada no
          endereço cadastrado pelo Cliente, dentro do prazo informado na cotação,
          observadas eventuais restrições logísticas e regulatórias para os insumos
          envolvidos.
        </Section>

        <Section title="6. Rastreabilidade e conformidade regulatória">
          A Insumia mantém o registro de lote, fabricante, fornecedor e nota fiscal
          de cada item entregue ao Cliente. O Cliente é responsável por armazenar
          os insumos conforme as instruções do fabricante, manter sua escrituração
          fiscal e sanitária em dia, e responder por qualquer uso indevido dos
          produtos adquiridos.
        </Section>

        <Section title="7. Uso permitido">
          Você concorda em usar a plataforma <b>somente</b> para finalidades
          legítimas da sua clínica, sem violar leis aplicáveis ou direitos de
          terceiros. É <b>vedado</b>:
          <List>
            <li>Revender, sublicenciar ou ceder o acesso à plataforma a terceiros sem autorização.</li>
            <li>Tentar acessar áreas restritas, contas de outros clientes ou dados que não lhe pertençam.</li>
            <li>Realizar engenharia reversa, descompilar, modificar ou interferir no funcionamento do app, da API ou do back-office.</li>
            <li>Usar a plataforma para divulgar conteúdo ofensivo, ilegal, fraudulento ou que viole direitos de propriedade intelectual.</li>
            <li>Burlar limites técnicos, automatizar acessos em larga escala ou prejudicar a estabilidade do serviço.</li>
          </List>
        </Section>

        <Section title="8. Propriedade intelectual">
          Todos os direitos sobre a plataforma Insumia, incluindo o código,
          design, marca, logotipos, textos, ilustrações e bases de dados, são de
          titularidade exclusiva da Insumia ou de seus licenciadores.
          Concedemos a você uma licença pessoal, limitada, não exclusiva e
          revogável para usar o app durante a vigência destes Termos. Você não
          adquire nenhum direito de propriedade sobre a plataforma.
        </Section>

        <Section title="9. Conteúdo enviado pelo Cliente">
          Você é o único responsável pelos dados, mensagens, receituários, fotos e
          quaisquer outras informações que enviar pela plataforma. Ao enviá-los,
          você concede à Insumia uma licença gratuita e limitada para processar,
          armazenar e exibir esses conteúdos exclusivamente para a operação dos
          serviços contratados.
        </Section>

        <Section title="10. Disponibilidade do serviço">
          A Insumia se esforça para manter a plataforma disponível 24/7, mas não
          garante operação ininterrupta. Manutenções programadas, falhas de
          terceiros, problemas de conectividade do Cliente ou eventos de caso
          fortuito ou força maior podem interromper o serviço temporariamente.
          Sempre que possível, comunicaremos paradas planejadas com antecedência.
        </Section>

        <Section title="11. Limitação de responsabilidade">
          Dentro do permitido pela legislação aplicável, a responsabilidade da
          Insumia perante o Cliente limita-se aos valores efetivamente pagos pelos
          serviços de intermediação nos 6 meses anteriores ao evento que motivou a
          reclamação. A Insumia não responde por:
          <List>
            <li>Danos indiretos, lucros cessantes, perda de oportunidade comercial ou de receita.</li>
            <li>Atos ou omissões dos fornecedores parceiros, transportadoras ou terceiros não controlados pela Insumia.</li>
            <li>Decisões clínicas ou condutas médicas adotadas pelo Cliente com base em insumos adquiridos pela plataforma.</li>
          </List>
        </Section>

        <Section title="12. Suspensão e encerramento">
          A Insumia pode <b>suspender</b> ou <b>encerrar</b> o acesso de Clientes
          que violem estes Termos, descumpram exigências regulatórias, mantenham
          débitos em aberto ou utilizem a plataforma de modo abusivo, com
          notificação prévia sempre que possível. Você pode encerrar a sua conta a
          qualquer momento solicitando pelo canal de suporte.
        </Section>

        <Section title="13. Privacidade">
          O tratamento dos seus dados pessoais é regido pela nossa{' '}
          <a className="text-brand-500 underline" href="/privacidade">
            Política de Privacidade
          </a>
          , que faz parte integrante destes Termos.
        </Section>

        <Section title="14. Alterações destes Termos">
          Estes Termos podem ser atualizados periodicamente para refletir mudanças
          legais, operacionais ou de funcionalidades. Quando houver alterações
          relevantes, notificaremos pelo app e pelo e-mail cadastrado. O uso
          continuado da plataforma após a notificação implica concordância com a
          nova versão.
        </Section>

        <Section title="15. Lei aplicável e foro">
          Estes Termos são regidos pelas leis da República Federativa do Brasil.
          Fica eleito o foro da Comarca de São Paulo/SP para dirimir quaisquer
          questões decorrentes deles, com renúncia a qualquer outro, por mais
          privilegiado que seja.
        </Section>

        <Section title="16. Contato">
          Dúvidas, sugestões ou notificações relativas a estes Termos:<br />
          <b>Insumia</b><br />
          E-mail:{' '}
          <a className="text-brand-500 underline" href="mailto:contato@bahtech.com.br">
            contato@bahtech.com.br
          </a>
        </Section>

        <footer className="mt-12 border-t border-black/5 pt-6 text-center text-xs text-ink-400">
          <a href="/privacidade" className="hover:text-ink-700">Política de Privacidade</a>
          <span className="mx-2">•</span>
          <a href="/suporte" className="hover:text-ink-700">Suporte</a>
          <span className="mx-2">•</span>
          <span>© 2026 Insumia · Todos os direitos reservados</span>
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
