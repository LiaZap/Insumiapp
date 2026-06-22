-- P0 Fundacao de dados: Endereco/Notificacao em tabela, categoria enum,
-- soft-delete de Medicamento, destino de entrega no Pedido, integridade.
-- SQL defensivo: saneia dados antes de aplicar enums/constraints para nao
-- falhar no `migrate deploy` do start do container.

-- CreateEnum
CREATE TYPE "MedicamentoCategoria" AS ENUM ('estetica', 'higiene', 'descartaveis', 'material', 'antissepticos', 'solucoes', 'insumos');
CREATE TYPE "NotificacaoTipo" AS ENUM ('pedido', 'alerta', 'sistema');

-- Medicamento.categoria: String -> enum. Saneia valores fora do dominio antes do cast.
UPDATE "Medicamento"
  SET "categoria" = 'insumos'
  WHERE "categoria" NOT IN ('estetica', 'higiene', 'descartaveis', 'material', 'antissepticos', 'solucoes', 'insumos');
ALTER TABLE "Medicamento"
  ALTER COLUMN "categoria" TYPE "MedicamentoCategoria" USING "categoria"::"MedicamentoCategoria";

-- Medicamento.ativo (soft delete)
ALTER TABLE "Medicamento" ADD COLUMN "ativo" BOOLEAN NOT NULL DEFAULT true;

-- Pedido: destino de entrega (FK + snapshot textual)
ALTER TABLE "Pedido" ADD COLUMN "enderecoEntregaId" TEXT;
ALTER TABLE "Pedido" ADD COLUMN "enderecoEntregaTexto" TEXT;

-- Fornecedor.cnpj -> unique. Deduplica CNPJs repetidos mantendo o mais antigo
-- (por criadoEm; id e uuid aleatorio, MIN(id) nao reflete ordem cronologica).
UPDATE "Fornecedor" f
  SET "cnpj" = NULL
  WHERE f."cnpj" IS NOT NULL
    AND f."id" <> (
      SELECT f2."id" FROM "Fornecedor" f2
      WHERE f2."cnpj" = f."cnpj"
      ORDER BY f2."criadoEm" ASC, f2."id" ASC
      LIMIT 1
    );

-- CreateTable Endereco
CREATE TABLE "Endereco" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "apelido" TEXT NOT NULL,
    "logradouro" TEXT NOT NULL,
    "numero" TEXT,
    "complemento" TEXT,
    "bairro" TEXT,
    "cidade" TEXT NOT NULL,
    "uf" TEXT NOT NULL,
    "cep" TEXT NOT NULL,
    "principal" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Endereco_pkey" PRIMARY KEY ("id")
);

-- CreateTable Notificacao
CREATE TABLE "Notificacao" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tipo" "NotificacaoTipo" NOT NULL DEFAULT 'sistema',
    "titulo" TEXT NOT NULL,
    "corpo" TEXT NOT NULL,
    "pedidoId" TEXT,
    "lidaEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notificacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Endereco_usuarioId_idx" ON "Endereco"("usuarioId");
CREATE INDEX "Notificacao_usuarioId_lidaEm_idx" ON "Notificacao"("usuarioId", "lidaEm");
CREATE INDEX "Pedido_criadoEm_idx" ON "Pedido"("criadoEm");
CREATE UNIQUE INDEX "Fornecedor_cnpj_key" ON "Fornecedor"("cnpj");
CREATE INDEX "Lance_fornecedorId_idx" ON "Lance"("fornecedorId");
CREATE INDEX "EstoqueItem_medicamentoId_idx" ON "EstoqueItem"("medicamentoId");
CREATE INDEX "Movimentacao_usuarioId_idx" ON "Movimentacao"("usuarioId");
CREATE INDEX "Conta_pedidoId_idx" ON "Conta"("pedidoId");

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_enderecoEntregaId_fkey" FOREIGN KEY ("enderecoEntregaId") REFERENCES "Endereco"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Endereco" ADD CONSTRAINT "Endereco_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Notificacao" ADD CONSTRAINT "Notificacao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
