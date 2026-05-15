# Regras de Negócio

Regras do domínio Insumia. Fonte de verdade para o comportamento esperado do sistema.

## Atores

- **Clínica** (cliente) — cria pedidos pelo app mobile.
- **Insumia** (operação) — cota, aprova e processa pedidos pelo back-office.

## Ciclo de vida do pedido

```
rascunho → aguardando_cotacao → cotado → confirmado → em_separacao → enviado → entregue
                                   ↓ (cliente recusa / cotação expira)
                                cancelado
```

1. A clínica monta o carrinho e envia → pedido nasce **`aguardando_cotacao`**.
2. Ao criar o pedido, o sistema gera automaticamente uma **conta a pagar** vinculada
   (vencimento +7 dias, descrição `Pedido <número>`).
3. A Insumia monta a **cotação** → status **`cotado`**.
4. A clínica **aceita** → `confirmado`; **recusa** → `cancelado`.
5. A Insumia avança manualmente: `confirmado → em_separacao → enviado → entregue`.

## Motor de Cotação

- Só pedidos em `aguardando_cotacao` ou `cotado` podem ser (re)cotados.
- A cotação define, **por item**: preço unitário e disponibilidade (`disponivel`).
- Define ainda: **prazo de entrega** (dias) e **validade** da cotação (horas → `cotacaoValidaAte`).
- O **total** é recalculado no servidor, somando **apenas itens disponíveis**.
- A conta a pagar vinculada é atualizada com o novo total.
- O cliente só aceita se a cotação **não expirou** (`cotacaoValidaAte > agora`).
- Recusar a cotação cancela o pedido **e** cancela as contas em aberto vinculadas.
- Margem (back-office): `(preço − custo) / preço`. `custo` vem do `Medicamento`.

## Estoque

- `EstoqueItem` agrega quantidade por medicamento (e lote, quando houver).
- **Movimentações**: `entrada`, `saida`, `ajuste`, `perda`, `transferencia`.
  - Entradas somam; `saida`/`perda`/`transferencia` subtraem.
- Saída que deixaria o saldo **negativo é bloqueada**.
- Status derivado da quantidade: `esgotado` (0) · `baixo` (< 10) · `ok` (≥ 10).
- Toda movimentação registra usuário responsável e data.

## Financeiro

- **Conta a pagar**: gerada por pedido (a Insumia recebe da clínica).
- **Conta a receber**: lançada manualmente.
- Status: `aberta` · `paga` · `vencida` · `cancelada`.
- Conta `aberta` com `vencimento < hoje` vira `vencida` automaticamente (no cálculo do dashboard).
- Dashboard financeiro: total a pagar/receber, contas vencidas e fluxo de caixa dos últimos 6 meses
  (entradas = `receber` pagas; saídas = `pagar` pagas).

## Catálogo

- Categorias: preenchedores, bioestimuladores, neuromoduladores, anestésicos, corticoides,
  enzimas, antissépticos, soluções, insumos.
- `receituario = true` → produto exige receita (ex.: toxinas, hialuronidase). *Validação de
  receituário no fluxo de pedido: a implementar.*

## Invariantes

- Valor de pedido/cotação **nunca** é confiado do cliente — sempre recalculado no servidor.
- Cliente só age sobre os próprios pedidos (ver [RBAC](RBAC.md)).
- Numeração de pedido é única (`numero`, formato `PED-XXXX`).
- Dinheiro sempre `Decimal(12,2)`.

## Pendências de regra (roadmap)

- Tabela de **preço negociado por cliente/tier**.
- **Receituário**: upload e validação obrigatória para itens controlados.
- **Lote + validade** com alerta de vencimento (FEFO).
- Pedido recorrente / sugestão de recompra por consumo.
