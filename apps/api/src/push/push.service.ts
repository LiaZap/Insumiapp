import { Injectable, Logger } from '@nestjs/common';
import { NotificacaoTipo } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type ExpoPushMessage = {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: 'default';
};

/**
 * Envia push notifications via Expo Push API.
 * https://docs.expo.dev/push-notifications/sending-notifications/
 *
 * Não precisa de chave: Expo Push é gratuito e usa o ExpoPushToken
 * que o app registra no primeiro login.
 */
@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);
  private readonly endpoint = 'https://exp.host/--/api/v2/push/send';

  constructor(private readonly prisma: PrismaService) {}

  /** Salva ou atualiza o token de push de um usuário (UPSERT por token). */
  async registrarToken(usuarioId: string, token: string, plataforma: 'ios' | 'android') {
    await this.prisma.pushToken.upsert({
      where: { token },
      update: { userId: usuarioId, plataforma },
      create: { userId: usuarioId, token, plataforma },
    });
  }

  /** Remove um token (usado no logout ou em caso de DeviceNotRegistered). */
  async removerToken(token: string) {
    await this.prisma.pushToken.deleteMany({ where: { token } });
  }

  /**
   * Persiste a notificação no histórico do usuário (centro de notificações
   * in-app). Gravada SEMPRE — independe de o usuário ter token de push.
   */
  private async persistirNotificacao(
    usuarioId: string,
    titulo: string,
    corpo: string,
    data?: Record<string, unknown>,
  ): Promise<void> {
    const tipoRaw = typeof data?.tipo === 'string' ? data.tipo : null;
    const tipo: NotificacaoTipo =
      tipoRaw === 'pedido' || tipoRaw === 'alerta' ? tipoRaw : NotificacaoTipo.sistema;
    const pedidoId = typeof data?.pedidoId === 'string' ? data.pedidoId : null;
    try {
      await this.prisma.notificacao.create({
        data: { usuarioId, titulo, corpo, tipo, pedidoId },
      });
    } catch (err) {
      this.logger.warn(`Falha ao persistir notificação para user ${usuarioId}`, err as Error);
    }
  }

  /** Envia uma notificação para todos os dispositivos de um usuário. */
  async enviarParaUsuario(
    usuarioId: string,
    titulo: string,
    corpo: string,
    data?: Record<string, unknown>,
  ): Promise<void> {
    // Histórico primeiro: a notificação fica salva mesmo sem dispositivo registrado.
    await this.persistirNotificacao(usuarioId, titulo, corpo, data);

    const tokens = await this.prisma.pushToken.findMany({
      where: { userId: usuarioId },
      select: { token: true },
    });
    if (tokens.length === 0) return;

    const messages: ExpoPushMessage[] = tokens.map((t) => ({
      to: t.token,
      title: titulo,
      body: corpo,
      data,
      sound: 'default',
    }));

    try {
      const res = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messages),
      });
      if (!res.ok) {
        this.logger.warn(`Expo Push retornou ${res.status} ao enviar para user ${usuarioId}`);
        return;
      }
      const json = (await res.json()) as {
        data?: Array<{ status: string; details?: { error?: string }; message?: string }>;
      };
      // Trata tokens invalidos (DeviceNotRegistered): remove do banco
      const data2 = json.data ?? [];
      for (let i = 0; i < data2.length; i++) {
        const item = data2[i];
        if (item?.status === 'error' && item.details?.error === 'DeviceNotRegistered') {
          const expoToken = tokens[i]?.token;
          if (expoToken) await this.removerToken(expoToken);
        }
      }
    } catch (err) {
      this.logger.error(`Erro de rede ao enviar push para user ${usuarioId}`, err);
    }
  }
}
