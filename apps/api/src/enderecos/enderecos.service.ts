import { Injectable, NotFoundException } from '@nestjs/common';
import type { AtualizarEnderecoInput, CriarEnderecoInput } from '@insumia/shared';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EnderecosService {
  constructor(private readonly prisma: PrismaService) {}

  /** Endereços do usuário — principal primeiro. */
  listar(usuarioId: string) {
    return this.prisma.endereco.findMany({
      where: { usuarioId },
      orderBy: [{ principal: 'desc' }, { criadoEm: 'asc' }],
    });
  }

  async criar(usuarioId: string, dto: CriarEnderecoInput) {
    const total = await this.prisma.endereco.count({ where: { usuarioId } });
    // O primeiro endereço sempre vira principal.
    const principal = dto.principal ?? total === 0;
    return this.prisma.$transaction(async (tx) => {
      if (principal) {
        await tx.endereco.updateMany({ where: { usuarioId }, data: { principal: false } });
      }
      return tx.endereco.create({
        data: {
          usuarioId,
          apelido: dto.apelido,
          logradouro: dto.logradouro,
          numero: dto.numero ?? null,
          complemento: dto.complemento ?? null,
          bairro: dto.bairro ?? null,
          cidade: dto.cidade,
          uf: dto.uf.toUpperCase(),
          cep: dto.cep,
          principal,
        },
      });
    });
  }

  async atualizar(usuarioId: string, id: string, dto: AtualizarEnderecoInput) {
    await this.assertOwner(usuarioId, id);
    // `principal` só pode ser DEFINIDO (true) por aqui — trocar de principal é
    // marcar outro como true (isto rebaixa o anterior). Aceitar principal=false
    // deixaria a conta com zero principais; por isso é ignorado de propósito.
    const tornarPrincipal = dto.principal === true;
    return this.prisma.$transaction(async (tx) => {
      if (tornarPrincipal) {
        await tx.endereco.updateMany({ where: { usuarioId }, data: { principal: false } });
      }
      return tx.endereco.update({
        where: { id },
        data: {
          ...(dto.apelido !== undefined && { apelido: dto.apelido }),
          ...(dto.logradouro !== undefined && { logradouro: dto.logradouro }),
          ...(dto.numero !== undefined && { numero: dto.numero ?? null }),
          ...(dto.complemento !== undefined && { complemento: dto.complemento ?? null }),
          ...(dto.bairro !== undefined && { bairro: dto.bairro ?? null }),
          ...(dto.cidade !== undefined && { cidade: dto.cidade }),
          ...(dto.uf !== undefined && { uf: dto.uf.toUpperCase() }),
          ...(dto.cep !== undefined && { cep: dto.cep }),
          ...(tornarPrincipal && { principal: true }),
        },
      });
    });
  }

  async remover(usuarioId: string, id: string) {
    const alvo = await this.assertOwner(usuarioId, id);
    await this.prisma.$transaction(async (tx) => {
      await tx.endereco.delete({ where: { id } });
      // Se removeu o principal, promove o mais antigo restante.
      if (alvo.principal) {
        const proximo = await tx.endereco.findFirst({
          where: { usuarioId },
          orderBy: { criadoEm: 'asc' },
        });
        if (proximo) {
          await tx.endereco.update({ where: { id: proximo.id }, data: { principal: true } });
        }
      }
    });
  }

  /** Garante posse — bloqueia IDOR (ler/alterar endereço de outro usuário). */
  private async assertOwner(usuarioId: string, id: string) {
    const endereco = await this.prisma.endereco.findUnique({ where: { id } });
    if (!endereco || endereco.usuarioId !== usuarioId) {
      throw new NotFoundException('Endereço não encontrado');
    }
    return endereco;
  }
}
