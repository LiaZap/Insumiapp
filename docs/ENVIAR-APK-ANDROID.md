# Enviar o app Insumia (Android) para o cliente

Guia rápido para gerar o APK Android e mandar o link de instalação direta para
um cliente, sem passar pela Play Store.

---

## 1. Gerar o APK (no seu computador)

Abre o terminal na raiz do projeto:

```bash
cd apps/mobile
eas build --platform android --profile preview
```

> O perfil `preview` gera `.apk` (não `.aab`). Demora 15–25 min.
> Você pode fechar o terminal: a EAS te avisa por e-mail quando termina.

Acompanha o progresso em:
https://expo.dev/accounts/paulomelo777/projects/insumia/builds

---

## 2. Pegar o link de download

Quando o build terminar:

1. Acessa https://expo.dev/accounts/paulomelo777/projects/insumia/builds
2. Clica no build Android mais recente (status **finished**)
3. No topo da página, copia o link do botão **"Install"**
   - Formato: `https://expo.dev/artifacts/eas/XXXXXX.apk`

> Esse link aponta direto para o `.apk` e dá pra instalar abrindo no navegador
> do Android.

---

## 3. Mensagem pronta para o cliente (WhatsApp / e-mail)

Copia tudo abaixo e cola para o cliente:

> Oi, segue o app Insumia para Android.
>
> **Como instalar (1 minuto):**
>
> 1. Abre este link no seu Android: [COLE O LINK DO APK AQUI]
> 2. O navegador baixa o arquivo `Insumia.apk`. Toque nele quando terminar.
> 3. Vai aparecer "Permitir instalações desta fonte" — toque em **Permitir**.
> 4. Toque em **Instalar**.
> 5. Quando terminar, toque em **Abrir** (ou abre pelo ícone do Insumia).
>
> **Para entrar no app**, use uma destas contas de teste (todas com senha
> `demo12345`):
>
> • marina@clinicaviva.com.br (Clínica Viva Estética)
> • rafael@belezapura.com.br (Beleza Pura Pinheiros)
> • camila@dermaplus.com.br (DermaPlus Jardins)
>
> Qualquer dúvida me chama. Aproveita pra testar a tela inicial,
> fazer um pedido e dar uma olhada no Estoque.

---

## 4. Se o cliente travar na instalação

Casos comuns no Android e como resolver:

**"O app não pode ser instalado"**
- Versão do Android antiga (precisa Android 7+). Verifica em
  *Ajustes → Sobre o telefone → Versão do Android*.

**"Por motivos de segurança, seu telefone..."**
- Vai em *Ajustes → Aplicativos → Acesso especial → Instalar apps
  desconhecidos* → permite pro navegador (Chrome) usado pra baixar.

**Play Protect bloqueando**
- Tela com aviso amarelo do Google: clica em "**Mais detalhes**" → **"Instalar
  mesmo assim"**. Acontece porque o app não está na Play Store.

---

## Quando rebuildar

Se você fizer alterações no app (commit novo), repete o passo 1 e gera um
novo link. O cliente baixa por cima e o app atualiza.

> Cada build novo é gratuito até o limite mensal da EAS (cota generosa pra
> projeto pequeno).
