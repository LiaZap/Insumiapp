-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'comprador', 'financeiro');

-- CreateEnum
CREATE TYPE "PedidoStatus" AS ENUM ('rascunho', 'aguardando_cotacao', 'cotado', 'confirmado', 'em_separacao', 'enviado', 'entregue', 'cancelado');

-- CreateEnum
CREATE TYPE "MovimentacaoTipo" AS ENUM ('entrada', 'saida', 'ajuste', 'perda', 'transferencia');

-- CreateEnum
CREATE TYPE "ContaTipo" AS ENUM ('pagar', 'receber');

-- CreateEnum
CREATE TYPE "ContaStatus" AS ENUM ('aberta', 'paga', 'vencida', 'cancelada');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "empresa" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'comprador',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Medicamento" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "principioAtivo" TEXT,
    "fabricante" TEXT,
    "apresentacao" TEXT,
    "categoria" TEXT NOT NULL,
    "precoUnitario" DECIMAL(12,2) NOT NULL,
    "ean" TEXT,
    "receituario" BOOLEAN NOT NULL DEFAULT false,
    "imagemUrl" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Medicamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pedido" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "status" "PedidoStatus" NOT NULL DEFAULT 'rascunho',
    "total" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "observacao" TEXT,
    "usuarioId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PedidoItem" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "medicamentoId" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "precoUnitario" DECIMAL(12,2) NOT NULL,
    "observacao" TEXT,

    CONSTRAINT "PedidoItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EstoqueItem" (
    "id" TEXT NOT NULL,
    "medicamentoId" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 0,
    "lote" TEXT,
    "validade" TIMESTAMP(3),
    "localizacao" TEXT,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EstoqueItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Movimentacao" (
    "id" TEXT NOT NULL,
    "medicamentoId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tipo" "MovimentacaoTipo" NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "lote" TEXT,
    "validade" TIMESTAMP(3),
    "motivo" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Movimentacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conta" (
    "id" TEXT NOT NULL,
    "tipo" "ContaTipo" NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor" DECIMAL(12,2) NOT NULL,
    "vencimento" TIMESTAMP(3) NOT NULL,
    "status" "ContaStatus" NOT NULL DEFAULT 'aberta',
    "pagoEm" TIMESTAMP(3),
    "pedidoId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Medicamento_ean_key" ON "Medicamento"("ean");

-- CreateIndex
CREATE INDEX "Medicamento_nome_idx" ON "Medicamento"("nome");

-- CreateIndex
CREATE INDEX "Medicamento_categoria_idx" ON "Medicamento"("categoria");

-- CreateIndex
CREATE UNIQUE INDEX "Pedido_numero_key" ON "Pedido"("numero");

-- CreateIndex
CREATE INDEX "Pedido_usuarioId_idx" ON "Pedido"("usuarioId");

-- CreateIndex
CREATE INDEX "Pedido_status_idx" ON "Pedido"("status");

-- CreateIndex
CREATE INDEX "PedidoItem_pedidoId_idx" ON "PedidoItem"("pedidoId");

-- CreateIndex
CREATE UNIQUE INDEX "EstoqueItem_medicamentoId_lote_key" ON "EstoqueItem"("medicamentoId", "lote");

-- CreateIndex
CREATE INDEX "Movimentacao_medicamentoId_idx" ON "Movimentacao"("medicamentoId");

-- CreateIndex
CREATE INDEX "Movimentacao_criadoEm_idx" ON "Movimentacao"("criadoEm");

-- CreateIndex
CREATE INDEX "Conta_status_idx" ON "Conta"("status");

-- CreateIndex
CREATE INDEX "Conta_vencimento_idx" ON "Conta"("vencimento");

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoItem" ADD CONSTRAINT "PedidoItem_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoItem" ADD CONSTRAINT "PedidoItem_medicamentoId_fkey" FOREIGN KEY ("medicamentoId") REFERENCES "Medicamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstoqueItem" ADD CONSTRAINT "EstoqueItem_medicamentoId_fkey" FOREIGN KEY ("medicamentoId") REFERENCES "Medicamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movimentacao" ADD CONSTRAINT "Movimentacao_medicamentoId_fkey" FOREIGN KEY ("medicamentoId") REFERENCES "Medicamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movimentacao" ADD CONSTRAINT "Movimentacao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conta" ADD CONSTRAINT "Conta_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE SET NULL ON UPDATE CASCADE;
