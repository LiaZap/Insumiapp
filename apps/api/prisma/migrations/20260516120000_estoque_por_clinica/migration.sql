-- Estoque passa a pertencer a cada clínica (usuário).
-- Os itens globais antigos são removidos; o seed recria o estoque por clínica.
DELETE FROM "EstoqueItem";

-- DropIndex
DROP INDEX "EstoqueItem_medicamentoId_lote_key";

-- AlterTable
ALTER TABLE "EstoqueItem" ADD COLUMN     "usuarioId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "EstoqueItem_usuarioId_medicamentoId_lote_key" ON "EstoqueItem"("usuarioId", "medicamentoId", "lote");

-- AddForeignKey
ALTER TABLE "EstoqueItem" ADD CONSTRAINT "EstoqueItem_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
