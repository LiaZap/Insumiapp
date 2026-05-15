# AGENTS.md — Operação de Agentes no Insumia

Guia para qualquer agente de IA (Claude Code, Cursor, etc.) trabalhando neste repositório.
As **instruções do projeto** estão em [`CLAUDE.md`](CLAUDE.md) — leia primeiro.

## Antes de qualquer mudança

1. Ler `CLAUDE.md` e o(s) doc(s) relevante(s) em `docs/`.
2. Ler o arquivo-alvo inteiro antes de editar.
3. Mudou schema/contrato? Atualizar `packages/shared` **e** os consumidores (api, mobile, admin).

## Definição de pronto (Definition of Done)

Uma tarefa só está concluída quando:

- [ ] `pnpm typecheck` passa em todos os pacotes afetados
- [ ] Mudou a API? endpoint testado (curl ou client) e schema Zod atualizado
- [ ] Mudou regra de negócio? `docs/REGRAS-DE-NEGOCIO.md` atualizado
- [ ] Mudou permissão/papel? `docs/RBAC.md` atualizado
- [ ] Sem `.env`/segredo commitado; sem arquivo solto na raiz

## Fluxo recomendado

```
Entender (docs + código)  →  Implementar  →  Typecheck  →  Validar e2e  →  Commit
```

- **Não** commitar nem fazer push sem o usuário pedir.
- Mudanças em 3+ arquivos ou cross-módulo: planejar antes (lista de etapas).
- Migrações de banco: `prisma migrate dev --name <descricao>` — nunca editar SQL aplicado.

## Limites

- Não expor serviços/portas publicamente sem autorização explícita do usuário.
- Não rodar ações destrutivas (drop, reset, force push) sem confirmação.
- Dados sensíveis (saúde, LGPD): tratar com cuidado; não logar PII.

## Convenções de commit

Mensagens em português, formato `tipo: resumo` (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`).
