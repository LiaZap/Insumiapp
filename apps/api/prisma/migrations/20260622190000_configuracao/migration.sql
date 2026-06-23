-- ConfiguracaoSistema: parâmetros de negócio editáveis (key-value).

-- CreateTable
CREATE TABLE "ConfiguracaoSistema" (
    "chave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "descricao" TEXT,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConfiguracaoSistema_pkey" PRIMARY KEY ("chave")
);
