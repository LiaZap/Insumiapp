# Insumia — Guia de Acesso para Teste

Bem-vindo! Este guia mostra como testar a plataforma Insumia de ponta a ponta:
fazer um pedido no **app da clínica** e acompanhá-lo no **back-office**.

---

## 1. Como funciona

A plataforma tem dois lados que conversam entre si:

| Lado | Quem usa | Onde acessa |
|------|----------|-------------|
| **App da clínica** | As clínicas | Celular (iPhone/Android), via Expo Go |
| **Back-office** | Equipe Insumia (admin) | Navegador |

Fluxo do teste: a clínica faz um pedido no app → o pedido chega no
back-office para a equipe Insumia analisar e cotar.

---

## 2. Instalar o app no celular

1. Abra a **App Store** (iPhone) ou **Play Store** (Android).
2. Busque por **"Expo Go"** e instale — é gratuito.
3. Abra este link no celular (ou escaneie o QR Code com a câmera):

   `exp://sistemas-metro.cusrzj.easypanel.host`

4. O app Insumia abre dentro do Expo Go. Na primeira vez ele baixa os
   arquivos (uns 30 segundos).

> O app fica salvo na aba "Recentes" do Expo Go — não some.

---

## 3. Logins das clínicas de teste

São 8 clínicas prontas para teste. **A senha de todas é `demo12345`.**

| Responsável | Clínica | E-mail (login) |
|-------------|---------|----------------|
| Dra. Marina Costa | Clínica Viva Estética | marina@clinicaviva.com.br |
| Dr. Rafael Lima | Beleza Pura Pinheiros | rafael@belezapura.com.br |
| Dra. Camila Souza | DermaPlus Jardins | camila@dermaplus.com.br |
| Dr. Bruno Almeida | Instituto Face | bruno@institutoface.com.br |
| Dra. Patrícia Reis | Estética Premium | patricia@esteticapremium.com.br |
| Dra. Juliana Martins | Clínica Bella Moema | juliana@clinicabella.com.br |
| Dr. Thiago Nunes | Harmonia Clínica | thiago@harmoniaclinica.com.br |
| Dra. Fernanda Dias | Revive Estética | fernanda@reviveestetica.com.br |

Cada clínica tem **os seus próprios dados**: estoque, pedidos, alertas de
validade e histórico de movimentações. Ao entrar, a tela inicial mostra
tudo da clínica escolhida.

> Para trocar de clínica: aba **Menu** → **Sair** → entrar com outro e-mail.

---

## 4. Fazer um pedido no app

1. Na tela inicial, toque em **Solicitar** (ou na aba **+** no rodapé).
2. Busque os medicamentos e toque para adicioná-los ao pedido.
3. Toque em **Ver Pedido**.
4. Confira as quantidades e toque em **Enviar Pedido**.
5. Pronto — o pedido foi enviado para a Insumia analisar.

Na tela inicial, o card **"Último Pedido"** passa a mostrar o status
desse pedido.

---

## 5. Acessar o back-office (admin)

O back-office é onde a equipe Insumia vê e gerencia todos os pedidos.

- **Endereço:** https://insumiaapp.bahflash.tech
- **Login do administrador:**
  - E-mail: `valerio@insumia.app`
  - Senha: `demo12345`

---

## 6. O teste completo — ver o pedido chegar

1. **No celular** — entre numa clínica (ex: Clínica Viva Estética) e faça
   um pedido seguindo o passo 4.
2. **No navegador** — acesse https://insumiaapp.bahflash.tech e entre com
   o login admin (`valerio@insumia.app` / `demo12345`).
3. Abra a página **Pedidos**.
4. O pedido que você acabou de enviar pelo app aparece na lista, junto
   com o nome da clínica que o fez.

A partir daí, o admin analisa o pedido, agrupa pedidos do mesmo
medicamento e monta a cotação — o ciclo de compra coletiva da Insumia.

---

## Resumo dos acessos

| Acesso | Endereço | Login | Senha |
|--------|----------|-------|-------|
| App da clínica | `exp://sistemas-metro.cusrzj.easypanel.host` | clínicas da tabela (seção 3) | `demo12345` |
| Back-office | https://insumiaapp.bahflash.tech | `valerio@insumia.app` | `demo12345` |

Qualquer dúvida durante o teste, é só chamar.
