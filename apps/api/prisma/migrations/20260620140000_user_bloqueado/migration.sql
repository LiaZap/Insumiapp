-- Campo "bloqueado" no User para o admin poder suspender clínicas
-- sem precisar excluir definitivamente.
ALTER TABLE "User" ADD COLUMN "bloqueado" BOOLEAN NOT NULL DEFAULT false;
