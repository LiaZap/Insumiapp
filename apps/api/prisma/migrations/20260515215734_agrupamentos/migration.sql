-- CreateEnum
CREATE TYPE "AgrupamentoStatus" AS ENUM ('aberto', 'em_cotacao', 'cotado', 'finalizado', 'cancelado');

-- AlterTable
ALTER TABLE "PedidoItem" ADD COLUMN     "agrupamentoId" TEXT;

-- CreateTable
CREATE TABLE "Agrupamento" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "medicamentoId" TEXT NOT NULL,
    "status" "AgrupamentoStatus" NOT NULL DEFAULT 'aberto',
    "publicToken" TEXT NOT NULL,
    "observacao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechadoEm" TIMESTAMP(3),
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agrupamento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Agrupamento_numero_key" ON "Agrupamento"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "Agrupamento_publicToken_key" ON "Agrupamento"("publicToken");

-- CreateIndex
CREATE INDEX "Agrupamento_status_idx" ON "Agrupamento"("status");

-- CreateIndex
CREATE INDEX "Agrupamento_medicamentoId_idx" ON "Agrupamento"("medicamentoId");

-- CreateIndex
CREATE INDEX "PedidoItem_agrupamentoId_idx" ON "PedidoItem"("agrupamentoId");

-- AddForeignKey
ALTER TABLE "PedidoItem" ADD CONSTRAINT "PedidoItem_agrupamentoId_fkey" FOREIGN KEY ("agrupamentoId") REFERENCES "Agrupamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agrupamento" ADD CONSTRAINT "Agrupamento_medicamentoId_fkey" FOREIGN KEY ("medicamentoId") REFERENCES "Medicamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
