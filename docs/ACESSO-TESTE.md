# Insumia — Guia de Acesso para Teste

Guia para o cliente testar a plataforma de ponta a ponta: fazer um pedido
no **app da clínica** e vê-lo chegar no **back-office**.

---

## 1. Visão geral

A plataforma tem dois lados:

| Lado | Quem usa | Onde |
|------|----------|------|
| **App mobile** | As clínicas | Expo Go (iPhone/Android) |
| **Back-office web** | Equipe Insumia (admin) | Navegador |

O fluxo do teste é: a clínica faz um pedido no app → o pedido aparece
no back-office para a equipe analisar e cotar.

---

## 2. Acessar o app da clínica (iPhone)

**2.1 — Instalar o Expo Go**
- Abra a **App Store**, busque por **"Expo Go"** e instale (gratuito).

**2.2 — Abrir o app Insumia**
- Toque neste link no iPhone (ou escaneie o QR com a câmera nativa):

  `exp://sistemas-metro.cusrzj.easypanel.host`

- O app abre dentro do Expo Go. Na primeira vez baixa os arquivos (~30s).

**2.3 — Logins das clínicas de teste**

Use qualquer uma destas contas — **senha de todas: `demo12345`**

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

> Cada clínica já tem pedidos no histórico — a aba **Pedidos** não fica vazia.
> Para trocar de clínica: aba **Menu** → **Sair** → entrar com outro e-mail.

---

## 3. Fazer um pedido no app

1. Na tela inicial, toque em **Solicitar** (ou na aba **+** no rodapé).
2. Busque os medicamentos e toque para adicioná-los ao pedido.
3. Toque em **Ver Pedido**.
4. Ajuste as quantidades e toque em **Enviar Pedido**.
5. Pronto — o pedido foi enviado para a Insumia.

---

## 4. Acessar o back-office (admin)

O back-office é onde a equipe Insumia vê e gerencia os pedidos.

- **Endereço:** https://insumiaapp.bahflash.tech
- **Login do admin (Valério):**
  - E-mail: `demo@insumia.app`
  - Senha: `demo12345`

---

## 5. Ver o pedido chegar (o teste completo)

1. **No celular** — entre numa clínica (ex: Clínica Viva) e faça um pedido
   seguindo o passo 3.
2. **No navegador** — acesse https://insumiaapp.bahflash.tech e faça login
   como **Valério** (`demo@insumia.app` / `demo12345`).
3. Vá até a página **Pedidos**.
4. O pedido que você acabou de fazer no app aparece na lista, com o nome
   da clínica que o enviou.

A partir daí o admin pode analisar, agrupar pedidos por medicamento e
montar a cotação — o ciclo de compra coletiva da Insumia.

---

## Resumo dos acessos

| O quê | Endereço | Login | Senha |
|-------|----------|-------|-------|
| App da clínica | exp://sistemas-metro.cusrzj.easypanel.host | (clínicas da tabela) | demo12345 |
| Back-office | https://insumiaapp.bahflash.tech | demo@insumia.app | demo12345 |
