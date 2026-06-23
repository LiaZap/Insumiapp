import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConfigService {
  constructor(private readonly prisma: PrismaService) {}

  listar() {
    return this.prisma.configuracaoSistema.findMany({ orderBy: { chave: 'asc' } });
  }

  /** Lê um parâmetro numérico, com fallback se ausente/inválido. */
  async getNumero(chave: string, fallback: number): Promise<number> {
    const c = await this.prisma.configuracaoSistema.findUnique({ where: { chave } });
    const n = c ? Number(c.valor) : NaN;
    return Number.isFinite(n) ? n : fallback;
  }

  async upsertMany(itens: Array<{ chave: string; valor: string }>) {
    await this.prisma.$transaction(
      itens.map((i) =>
        this.prisma.configuracaoSistema.upsert({
          where: { chave: i.chave },
          update: { valor: i.valor },
          create: { chave: i.chave, valor: i.valor },
        }),
      ),
    );
    return this.listar();
  }
}
