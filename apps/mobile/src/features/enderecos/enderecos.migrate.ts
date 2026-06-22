import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CriarEnderecoInput } from '@insumia/shared';
import { enderecosApi } from './enderecos.api';

// Chave onde o antigo store (zustand persist) guardava os endereços locais.
const LEGACY_KEY = 'insumia.enderecos';

type LegacyEndereco = {
  apelido?: string;
  logradouro?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  principal?: boolean;
};

/**
 * Migração única dos endereços que viviam no AsyncStorage para a API.
 * Best-effort e idempotente: lê a chave legada, sobe os válidos e a remove
 * ao final para nunca repetir. Só envia quando o servidor ainda está vazio,
 * evitando duplicar para quem já cadastrou na API. Retorna quantos migrou.
 */
export async function migrarEnderecosLocais(servidorVazio: boolean): Promise<number> {
  let raw: string | null = null;
  try {
    raw = await AsyncStorage.getItem(LEGACY_KEY);
  } catch {
    return 0;
  }
  if (!raw) return 0;

  // Servidor já tem endereços → não duplica, apenas descarta o legado.
  if (!servidorVazio) {
    await AsyncStorage.removeItem(LEGACY_KEY).catch(() => undefined);
    return 0;
  }

  let legacy: LegacyEndereco[] = [];
  try {
    const parsed = JSON.parse(raw) as { state?: { enderecos?: LegacyEndereco[] } };
    legacy = parsed?.state?.enderecos ?? [];
  } catch {
    await AsyncStorage.removeItem(LEGACY_KEY).catch(() => undefined);
    return 0;
  }

  let migrados = 0;
  for (const e of legacy) {
    const dto = normalizar(e);
    if (!dto) continue;
    try {
      await enderecosApi.criar(dto);
      migrados += 1;
    } catch {
      // Ignora endereços inválidos ou falhas pontuais — não bloqueia os demais.
    }
  }
  await AsyncStorage.removeItem(LEGACY_KEY).catch(() => undefined);
  return migrados;
}

function normalizar(e: LegacyEndereco): CriarEnderecoInput | null {
  const apelido = (e.apelido ?? '').trim();
  const logradouro = (e.logradouro ?? '').trim();
  const cidade = (e.cidade ?? '').trim();
  const uf = (e.uf ?? '').trim().toUpperCase();
  const cep = (e.cep ?? '').trim();
  if (!apelido || !logradouro || !cidade) return null;
  if (uf.length !== 2) return null;
  if (cep.replace(/\D/g, '').length < 8) return null;
  return {
    apelido,
    logradouro,
    cidade,
    uf,
    cep,
    bairro: (e.bairro ?? '').trim() || undefined,
    principal: e.principal === true,
  };
}
