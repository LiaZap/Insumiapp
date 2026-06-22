import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Response } from 'express';

/**
 * Traduz erros conhecidos do Prisma em respostas HTTP claras, em vez de 500
 * genérico. Aditivo: só intercepta PrismaClientKnownRequestError — todo o
 * resto segue pelo tratamento padrão do Nest.
 */
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    switch (exception.code) {
      case 'P2025': // registro não encontrado (update/delete)
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ statusCode: 404, message: 'Registro não encontrado' });
      case 'P2002': // violação de unicidade
        return res
          .status(HttpStatus.CONFLICT)
          .json({ statusCode: 409, message: 'Registro já existe' });
      case 'P2003': // violação de chave estrangeira
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ statusCode: 400, message: 'Referência inválida' });
      default:
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ statusCode: 400, message: 'Requisição inválida' });
    }
  }
}
