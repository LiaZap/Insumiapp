# Regras de Negócio

Regras do domínio Insumia. Fonte de verdade para o comportamento esperado do sistema.

## Modelo de negócio — compra coletiva

A Insumia é uma plataforma de **compra coletiva** de insumos para clínicas
(estéticas, odontológicas, médicas) — uma espécie de "Groupon de medicamentos".

> Várias clínicas pedem individualmente. A Insumia **agrupa os pedidos por medicamento**,
> cota esse volume agregado com fornecedores e compra mais barato. O **agrupamento** é o
> diferencial do produto.

```
Clínicas pedem (cada uma o seu)
   → sistema AGRUPA os itens por medicamento (Agrupamento)
   → back-office vê o volume agregado e fecha o agrupamento
   → envia para FORNECEDORES → recebem LANCES (preço)
   → Insumia escolhe o fornecedor vencedor
   → preço volta a cada clínica + rastreabilidade (lote/fabricante)
```

## Atores

- **Clínica** (cliente) — cria pedidos pelo app mobile.
- **Insumia** (operação) — agrupa, cota e compra pelo back-office.
- **Fornecedor** — recebe agrupamentos e oferta preço (lance). *Fase 2.*

## Agrupamento (compra coletiva)

- Um `Agrupamento` junta `PedidoItem` do **mesmo medicamento** vindos de pedidos de
  várias clínicas.
- Existe **no máximo um agrupamento `aberto`** por medicamento. Todo item novo daquele
  medicamento entra nele automaticamente ao criar o pedido.
- Status: `aberto` → `em_cotacao` → `cotado` → `finalizado` (ou `cancelado`).
- O admin **fecha manualmente** o agrupamento (`aberto → em_cotacao`). Ao fechar, o
  próximo item daquele medicamento abre um **novo** agrupamento (ciclos).
- A tela "Pedidos Agrupados" mostra, por medicamento: nº de pedidos e volume total;
  o detalhe mostra a demanda quebrada por clínica.

### A implementar (Fase 2 — fornecedores)

- `Fornecedor` (cadastro) e `Lance` (oferta por agrupamento).
- **Link público** por agrupamento → fornecedor dá o lance sem login (`publicToken` já existe).
- Admin escolhe o lance vencedor → preço propaga para os pedidos.
- Faturamento split: o fornecedor fatura cada clínica conforme sua fatia do volume.

## Ciclo de vida do pedido

```
rascunho → aguardando_cotacao → cotado → confirmado → em_separacao → enviado → entregue
                                   ↓ (cliente recusa / cotação expira)
                                cancelado
```

1. A clínica monta o carrinho e envia → pedido nasce **`aguardando_cotacao`**;
   cada item entra no agrupamento aberto do seu medicamento.
2. Ao criar o pedido, gera-se automaticamente uma **conta a pagar** vinculada
   (vencimento +7 dias).
3. O preço final virá do agrupamento (Fase 2). Hoje o motor de cotação por pedido
   ainda coexiste como fallback (admin cota um pedido direto).
4. A clínica **aceita** → `confirmado`; **recusa** → `cancelado`.
5. A Insumia avança: `confirmado → em_separacao → enviado → entregue`.

> Um pedido pode ser **parcialmente atendido** — seus itens podem cair em agrupamentos
> diferentes, processados em momentos diferentes.

## Motor de Cotação (por pedido — coexiste)

- Só pedidos em `aguardando_cotacao`/`cotado` podem ser (re)cotados.
- A cotação define, por item: preço unitário e disponibilidade (`disponivel`).
- Define prazo de entrega (dias) e validade (horas → `cotacaoValidaAte`).
- O **total** é recalculado no servidor, somando só itens disponíveis.
- O cliente só aceita se a cotação não expirou. Recusar cancela pedido e contas vinculadas.
- Margem (back-office): `(preço − custo) / preço`.

## Estoque

- `EstoqueItem` agrega quantidade por medicamento (e lote, quando houver).
- Movimentações: `entrada`, `saida`, `ajuste`, `perda`, `transferencia`.
  Entradas somam; `saida`/`perda`/`transferencia` subtraem.
- Saída que deixaria saldo negativo é **bloqueada**.
- Status: `esgotado` (0) · `baixo` (< 10) · `ok` (≥ 10).

## Financeiro

- **Conta a pagar**: gerada por pedido. **Conta a receber**: lançada manualmente.
- Status: `aberta` · `paga` · `vencida` · `cancelada`.
- Conta `aberta` vencida vira `vencida` automaticamente.
- Dashboard: total a pagar/receber, vencidas e fluxo de caixa (6 meses).

## Rastreabilidade (Vigilância Sanitária)

Exigência regulatória: para cada medicamento entregue, registrar **fabricante, lote,
validade, fornecedor e nota fiscal** — documentação da fábrica até a clínica.

- Ao **finalizar** um agrupamento cotado, o admin registra lote, validade, fabricante e NF;
  o status vai para `finalizado`.
- A rastreabilidade fica no `Agrupamento` e é exposta em **cada item de pedido** das clínicas
  daquele agrupamento — cada clínica vê o comprovante da sua fatia da compra.
- O fornecedor é derivado do lance vencedor.

## Catálogo

- Categorias: preenchedores, bioestimuladores, neuromoduladores, anestésicos, corticoides,
  enzimas, antissépticos, soluções, insumos.
- `receituario = true` → produto exige receita.
- **Importação/exportação de catálogo** (CSV) — a implementar.

## Invariantes

- Valor de pedido/cotação **nunca** é confiado do cliente — sempre recalculado no servidor.
- No máximo um agrupamento `aberto` por medicamento.
- Cliente só age sobre os próprios pedidos (ver [RBAC](RBAC.md)).
- Numeração única: `PED-XXXX` (pedido), `AGR-XXXX` (agrupamento).
- Dinheiro sempre `Decimal(12,2)`.

## Roadmap de regras

- Alerta de vencimento por validade/lote (FEFO).
- Faturamento split por clínica.
- Grupos de clínicas (odontológicas/médicas/estéticas) que se comunicam.
- Tabela de preço negociado por cliente/tier.
- Importação de catálogo via CSV.
