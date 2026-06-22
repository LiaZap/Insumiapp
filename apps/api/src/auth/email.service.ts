import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

/**
 * Envio de e-mails transacionais via Resend.
 * Tolerante a falta de configuração: se RESEND_API_KEY não estiver setado,
 * faz log da mensagem em vez de quebrar (útil em dev e antes da verificação
 * de domínio chegar do BahTech).
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend | null;
  private readonly from: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    this.from = process.env.EMAIL_FROM ?? 'Insumia <onboarding@resend.dev>';
    this.resend = apiKey ? new Resend(apiKey) : null;
    if (!apiKey) {
      this.logger.warn(
        'RESEND_API_KEY ausente — e-mails serão logados em vez de enviados. ' +
          'Configure no .env quando o domínio for verificado.',
      );
    }
  }

  async enviarReset(opts: { para: string; nome: string; link: string }): Promise<void> {
    const subject = 'Redefinir senha — Insumia';
    const html = this.htmlReset(opts.nome, opts.link);
    const text = this.textReset(opts.nome, opts.link);

    if (!this.resend) {
      this.logger.log(
        `[FAKE EMAIL] Para: ${opts.para}\nAssunto: ${subject}\nLink: ${opts.link}`,
      );
      return;
    }

    try {
      await this.resend.emails.send({
        from: this.from,
        to: opts.para,
        subject,
        html,
        text,
      });
    } catch (err) {
      this.logger.error('Falha ao enviar e-mail via Resend', err);
      throw err;
    }
  }

  private htmlReset(nome: string, link: string): string {
    return `<!doctype html>
<html lang="pt-BR">
<head><meta charset="utf-8"><title>Redefinir senha</title></head>
<body style="margin:0;background:#F2F2F2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1F2937;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
    <div style="background:#FFFFFF;border-radius:16px;padding:32px;">
      <div style="display:inline-flex;align-items:center;gap:10px;margin-bottom:24px;">
        <div style="width:36px;height:36px;background:#1B498C;border-radius:9px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;font-size:18px;">I</div>
        <span style="font-weight:bold;font-size:15px;color:#1B498C;">Insumia</span>
      </div>
      <h1 style="font-size:22px;margin:0 0 12px;color:#1B498C;">Redefinir sua senha</h1>
      <p style="font-size:15px;line-height:1.55;margin:0 0 16px;color:#374151;">
        Olá ${nome || 'cliente Insumia'},
      </p>
      <p style="font-size:15px;line-height:1.55;margin:0 0 24px;color:#374151;">
        Recebemos um pedido para redefinir a senha da sua conta. Para criar uma nova senha,
        clique no botão abaixo. O link é válido por 1 hora.
      </p>
      <p style="text-align:center;margin:0 0 24px;">
        <a href="${link}" style="display:inline-block;background:#1B498C;color:#fff;text-decoration:none;padding:14px 28px;border-radius:12px;font-weight:600;font-size:15px;">
          Redefinir senha
        </a>
      </p>
      <p style="font-size:13px;line-height:1.55;margin:0 0 8px;color:#6B7280;">
        Se você não fez essa solicitação, pode ignorar este e-mail. Sua senha continua a mesma.
      </p>
      <p style="font-size:13px;line-height:1.55;margin:0;color:#6B7280;">
        Caso o botão não funcione, copie e cole este link no navegador:<br>
        <span style="color:#1B498C;word-break:break-all;">${link}</span>
      </p>
    </div>
    <p style="text-align:center;font-size:12px;color:#9CA3AF;margin:24px 0 0;">
      © Insumia · Plataforma B2B de insumos estéticos
    </p>
  </div>
</body>
</html>`;
  }

  private textReset(nome: string, link: string): string {
    return [
      `Olá ${nome || 'cliente Insumia'},`,
      '',
      'Recebemos um pedido para redefinir a senha da sua conta no Insumia.',
      'Para criar uma nova senha, acesse o link abaixo (válido por 1 hora):',
      '',
      link,
      '',
      'Se você não fez essa solicitação, ignore este e-mail. Sua senha continua a mesma.',
      '',
      '— Equipe Insumia',
    ].join('\n');
  }
}
