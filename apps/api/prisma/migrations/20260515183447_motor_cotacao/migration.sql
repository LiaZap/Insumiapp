-- AlterTable
ALTER TABLE "Medicamento" ADD COLUMN     "custo" DECIMAL(12,2);

-- AlterTable
ALTER TABLE "Pedido" ADD COLUMN     "cotacaoEnviadaEm" TIMESTAMP(3),
ADD COLUMN     "cotacaoObservacao" TEXT,
ADD COLUMN     "cotacaoValidaAte" TIMESTAMP(3),
ADD COLUMN     "prazoEntregaDias" INTEGER,
ADD COLUMN     "respondidaEm" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "PedidoItem" ADD COLUMN     "disponivel" BOOLEAN NOT NULL DEFAULT true;
