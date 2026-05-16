-- AlterTable
ALTER TABLE "Agrupamento" ADD COLUMN     "fabricante" TEXT,
ADD COLUMN     "finalizadoEm" TIMESTAMP(3),
ADD COLUMN     "lote" TEXT,
ADD COLUMN     "notaFiscal" TEXT,
ADD COLUMN     "validade" TIMESTAMP(3);
