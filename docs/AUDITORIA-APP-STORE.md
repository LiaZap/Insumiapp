# Auditoria App Store — Insumia

Varredura completa do app para prever e eliminar motivos de rejeição da Apple
(e do Google Play) **antes** de reenviar. Baseada nas 3 rejeições já recebidas
+ análise do código atual.

> **Como usar este documento:** trate cada item 🔴/🟡 como tarefa. Os 🔴 são
> quase-certeza de rejeição; os 🟡 são risco real; os 🟢 já estão OK e ficam
> registrados para não regredir.

---

## 1. Histórico de rejeições (já resolvidas)

| Guideline | Problema | Status |
|-----------|----------|--------|
| 5.1.2(i) — Privacy/Tracking | Declarado tracking sem ATT + telefone que não coletamos | ✅ Corrigido na ficha (sem tracking, sem telefone) |
| 2.3.6 — Metadata | Age rating marcava "Restrição por idade" inexistente | ✅ Reclassificado para 4+ |
| 5.1.1(v) — Account deletion | App criava conta mas não excluía | ✅ Botão "Excluir minha conta" no Perfil + endpoint `DELETE /auth/me` |

---

## 2. 🔴 RISCO ALTO — contradições do catálogo "soft"

Mudamos o catálogo para insumos cosméticos (esmaltes, luvas, gaze), mas
**sobraram textos no app falando de medicamentos controlados**. Se o revisor
ler isso, questiona a categoria/classificação etária e pode reabrir a
discussão de "conteúdo médico".

### 2.1 — FAQ da tela Ajuda menciona toxinas e anestésicos
**Arquivo:** [apps/mobile/src/app/(app)/ajuda.tsx](apps/mobile/src/app/(app)/ajuda.tsx) (linhas ~25-28)
```
pergunta: 'Preciso enviar receituário para todos os medicamentos?'
resposta: 'Apenas para medicamentos controlados (toxinas, anestésicos, etc.)...'
```
**Ação:** reescrever sem "medicamentos controlados / toxinas / anestésicos".

### 2.2 — Seção "Receituário" no detalhe do pedido
**Arquivo:** [apps/mobile/src/app/(app)/pedido/[id].tsx](apps/mobile/src/app/(app)/pedido/[id].tsx) (linhas ~310-336)
Bloco inteiro "Enviar Receituário" implica venda de medicamento sob
prescrição — incoerente com catálogo cosmético.
**Ação:** remover a seção ou trocar por "Documentos do pedido" genérico.

### 2.3 — Palavra "medicamento" em textos visíveis
Aparece em empty states e FAQ. Internamente (código/schema) pode ficar, mas
**textos visíveis ao usuário** devem usar "produto" ou "item".
- [ajuda.tsx:20](apps/mobile/src/app/(app)/ajuda.tsx) "para o mesmo medicamento"
- [novo-pedido/index.tsx:80](apps/mobile/src/app/(app)/novo-pedido/index.tsx) empty state

### 2.4 — Empty state com texto de desenvolvedor
**Arquivo:** [novo-pedido/index.tsx](apps/mobile/src/app/(app)/novo-pedido/index.tsx) (~linha 80)
```
'Carregue medicamentos da API'
```
Mensagem dev-facing. Se o reviewer vê catálogo vazio, lê isso.
**Ação:** trocar por algo como "Nenhum produto disponível no momento".

---

## 3. 🟡 RISCO MÉDIO

### 3.1 — Notificações são MOCK
**Arquivo:** [notificacoes.hooks.ts](apps/mobile/src/features/notificacoes/notificacoes.hooks.ts)
Deriva de pedidos reais (não é dado falso puro), então o risco é baixo, mas o
texto "MOCK" e a ausência de endpoint real pode incomodar se cruzarem com a
descrição que promete notificações.
**Ação:** aceitável para v1. Idealmente ligar ao backend depois. O push real
(Expo) já cobre a promessa de "notificação de pedido".

### 3.2 — Estatística de movimentações com placeholder
**Arquivo:** [movimentacoes.tsx](apps/mobile/src/app/(app)/movimentacoes.tsx) (~linha 17)
```
// Stats placeholder (em produção viria do backend)
```
Número fabricado na tela. Baixo risco visual, mas é dado fictício.
**Ação:** derivar do array real de movimentações (já temos os dados).

### 3.3 — "Pagamento realizado via Pix"
**Arquivo:** [pedido/[id].tsx](apps/mobile/src/app/(app)/pedido/[id].tsx) (~linha 346)
Menção a pagamento. **Não é problema de IAP** (bens físicos são isentos da
regra 3.1.1), mas garanta que o reviewer entenda que o pagamento acontece
**fora do app**. Já está coberto nas notas de revisão.

---

## 4. 🟢 JÁ ESTÁ OK (não regredir)

| Item | Estado |
|------|--------|
| Exclusão de conta in-app | ✅ Perfil → Zona de perigo |
| Esqueci minha senha funcional | ✅ Tela com input + fluxo Resend pré-codado |
| App restrito a iPhone | ✅ `UIDeviceFamily:[1]` + `requireFullScreen` |
| Sem login social | ✅ Só e-mail/senha → Sign in with Apple **não exigido** |
| Sem permissões sensíveis | ✅ Sem câmera, fotos, localização, contatos, mic → sem strings faltando |
| Criptografia declarada | ✅ `ITSAppUsesNonExemptEncryption:false` |
| HTTPS em tudo | ✅ API e back-office em TLS |
| Política de Privacidade pública | ✅ /privacidade |
| Termos de Uso público | ✅ /termos |
| Suporte público | ✅ /suporte |
| Classificação etária 4+ | ✅ |
| Sem tracking / ATT | ✅ Privacidade ajustada |

---

## 5. Checklist completo de Diretrizes Apple

### Segurança e Privacidade
- [x] **5.1.1(v)** Exclusão de conta no app
- [x] **5.1.2(i)** Tracking declarado corretamente (não rastreia)
- [x] **5.1.1(i)** Política de privacidade acessível
- [ ] **5.1.1(ii)** Dados coletados são mínimos e justificados → conferir labels = Nome, E-mail, ID
- [x] **5.1.5** Permissões: app não pede nenhuma sensível

### Performance
- [ ] **2.1** App completo, sem telas "a implementar" → ⚠️ ver seção 2 (receituário)
- [ ] **2.1** Todos os botões funcionam → ✅ varredura não achou onPress vazio
- [x] **2.3.1** Sem funcionalidade oculta
- [x] **2.3.6** Metadata e age rating precisos
- [ ] **2.3.10** Descrição bate com o app (sem "toxinas" na descrição) → conferir texto da App Store
- [x] **2.5.1** Usa só APIs públicas (Expo/RN)

### Negócio
- [x] **3.1.1** Sem venda de bens digitais → bens físicos, IAP não se aplica
- [x] **3.1.3(e)** Serviço B2B/empresarial → login obrigatório justificado

### Design
- [x] **4.0** Layout iPhone (iPad bloqueado)
- [ ] **4.2** Funcionalidade mínima → app tem fluxo real (pedido, estoque, financeiro) ✅
- [x] **4.8** Login: oferece e-mail/senha, sem obrigar login social

### Login / Conta demo
- [ ] Conta de teste ativa e populada (`marina@clinicaviva.com.br` / `demo12345`)
- [ ] WhatsApp do suporte respondendo no dia da revisão
- [ ] Pelo menos 1 pedido em status "cotado" na conta demo (mostra fluxo completo)

---

## 6. Riscos no fluxo de revisão (operacional)

| Risco | Mitigação |
|-------|-----------|
| Reviewer faz pedido e nunca recebe cotação (ninguém aprova no back-office) | Deixar pedido demo já cotado + explicar nas notas que cotação é manual (B2B) |
| WhatsApp "Falar com Atendente" não responde | Garantir número ativo ou resposta automática no dia |
| Reset de senha sem e-mail real (Resend ainda em sandbox) | Verificar domínio no Resend OU explicar nas notas que reset é assistido pelo suporte |
| Push não chega (token só funciona em build EAS, não Expo Go) | OK em produção; não testar push em Expo Go |
| Catálogo vazio no ambiente de revisão | Garantir que o seed rodou na API de produção |

---

## 7. Ações priorizadas (ordem de execução)

1. 🔴 **Limpar textos de "medicamento controlado / toxina / anestésico"**
   da tela Ajuda e do detalhe do pedido (seção 2.1, 2.2, 2.3, 2.4).
2. 🟡 Derivar stats reais em Movimentações (2.2) — opcional para v1.
3. 🟢 Conferir a **descrição na App Store** — não pode citar toxinas/medicamentos.
4. 🟢 Garantir conta demo populada + 1 pedido cotado + WhatsApp ativo.
5. 🟢 Rodar seed na API de produção (catálogo soft + clínicas).
6. Rebuild iOS + gravação do fluxo de exclusão de conta + reenviar.

---

## 8. Prompt reutilizável (rodar antes de cada submissão)

> Faça uma varredura no app mobile e na ficha da loja procurando motivos de
> rejeição da Apple/Google:
> 1. Telas/textos com "a implementar", "mock", "placeholder", "TODO"
> 2. Botões sem ação (`onPress={() => {}}`)
> 3. Termos sensíveis em textos visíveis (medicamento, toxina, anestésico,
>    controlado, prescrição) que contradigam a categoria declarada
> 4. Telas que exigem login sem explicação nas notas de revisão
> 5. Exclusão de conta acessível e funcional
> 6. Permissões iOS sem string de uso no Info.plist
> 7. Menções a pagamento dentro do app (verificar isenção de IAP)
> 8. Conta demo ativa e populada; canais de suporte respondendo
> 9. Descrição da loja consistente com o conteúdo real do app
> Liste cada achado com arquivo:linha, severidade e ação sugerida.
