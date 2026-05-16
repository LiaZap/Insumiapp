-- CreateTable
CREATE TABLE "Fornecedor" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cnpj" TEXT,
    "email" TEXT,
    "telefone" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fornecedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lance" (
    "id" TEXT NOT NULL,
    "agrupamentoId" TEXT NOT NULL,
    "fornecedorId" TEXT,
    "fornecedorNome" TEXT NOT NULL,
    "precoUnitario" DECIMAL(12,2) NOT NULL,
    "prazoEntregaDias" INTEGER NOT NULL,
    "observacao" TEXT,
    "vencedor" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Lance_agrupamentoId_idx" ON "Lance"("agrupamentoId");

-- AddForeignKey
ALTER TABLE "Lance" ADD CONSTRAINT "Lance_agrupamentoId_fkey" FOREIGN KEY ("agrupamentoId") REFERENCES "Agrupamento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lance" ADD CONSTRAINT "Lance_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "Fornecedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
