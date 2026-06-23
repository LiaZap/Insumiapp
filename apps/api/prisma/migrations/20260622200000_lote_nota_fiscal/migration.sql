-- Lote e NotaFiscal: rastreabilidade por entidade (Vigilância Sanitária).
-- Aditivo: novas tabelas, sem tocar no `lote` texto-livre legado nem no
-- @@unique do estoque. Sem backfill.

-- CreateTable
CREATE TABLE "Lote" (
    "id" TEXT NOT NULL,
    "medicamentoId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "validade" TIMESTAMP(3),
    "fabricante" TEXT,
    "agrupamentoId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotaFiscal" (
    "id" TEXT NOT NULL,
    "fornecedorId" TEXT,
    "numero" TEXT NOT NULL,
    "serie" TEXT,
    "valor" DECIMAL(12,2),
    "emitidaEm" TIMESTAMP(3),
    "agrupamentoId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotaFiscal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Lote_medicamentoId_idx" ON "Lote"("medicamentoId");
CREATE INDEX "Lote_agrupamentoId_idx" ON "Lote"("agrupamentoId");
CREATE INDEX "NotaFiscal_fornecedorId_idx" ON "NotaFiscal"("fornecedorId");
CREATE INDEX "NotaFiscal_agrupamentoId_idx" ON "NotaFiscal"("agrupamentoId");

-- AddForeignKey
ALTER TABLE "Lote" ADD CONSTRAINT "Lote_medicamentoId_fkey" FOREIGN KEY ("medicamentoId") REFERENCES "Medicamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Lote" ADD CONSTRAINT "Lote_agrupamentoId_fkey" FOREIGN KEY ("agrupamentoId") REFERENCES "Agrupamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "NotaFiscal" ADD CONSTRAINT "NotaFiscal_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "Fornecedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "NotaFiscal" ADD CONSTRAINT "NotaFiscal_agrupamentoId_fkey" FOREIGN KEY ("agrupamentoId") REFERENCES "Agrupamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;
