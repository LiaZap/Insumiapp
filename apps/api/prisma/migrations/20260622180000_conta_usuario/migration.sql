-- Conta.usuarioId: dono da conta (escopo multi-tenant do financeiro).
-- Backfill: contas vinculadas a pedido herdam o dono do pedido. Contas avulsas
-- (sem pedido) ficam null e so aparecem para admin/financeiro.

-- AlterTable
ALTER TABLE "Conta" ADD COLUMN "usuarioId" TEXT;

-- Backfill a partir do pedido vinculado
UPDATE "Conta" c
  SET "usuarioId" = p."usuarioId"
  FROM "Pedido" p
  WHERE c."pedidoId" = p."id" AND c."pedidoId" IS NOT NULL;

-- CreateIndex
CREATE INDEX "Conta_usuarioId_idx" ON "Conta"("usuarioId");

-- AddForeignKey
ALTER TABLE "Conta" ADD CONSTRAINT "Conta_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
