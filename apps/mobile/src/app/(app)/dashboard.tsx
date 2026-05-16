import { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import type { PedidoStatus } from '@insumia/shared';
import { SolarIcon } from '@/components/icons/SolarIcon';
import { useAuthStore } from '@/features/auth/auth.store';
import { useEstoque, useMovimentacoes } from '@/features/estoque/estoque.hooks';
import { usePedidos } from '@/features/pedidos/pedidos.hooks';
import { colors } from '@/theme/tokens';

const QUICK_ACTIONS = [
  { label: 'Endereço Comercial', icon: 'map-point-bold' as const },
  { label: 'Dados de Faturamento', icon: 'chat-round-money-bold' as const },
  { label: 'Usuários e Permissões', icon: 'user-bold' as const },
  { label: 'Nossa Proposta', icon: 'file-check-bold-duotone' as const },
];

const STATUS_FRASE: Record<PedidoStatus, string> = {
  rascunho: 'Rascunho — finalize para enviar.',
  aguardando_cotacao: 'Aguardando cotação da equipe Insumia®.',
  cotado: 'Cotação recebida — revise e aprove.',
  confirmado: 'Pedido aprovado, em preparação.',
  em_separacao: 'Pedido em separação.',
  enviado: 'Pedido enviado, a caminho da clínica.',
  entregue: 'Pedido entregue.',
  cancelado: 'Pedido cancelado.',
};

function formatMoney(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 });
}

export default function Dashboard() {
  const router = useRouter();

  const user = useAuthStore((s) => s.user);
  const nomeExibido = user?.empresa ?? user?.nome ?? 'Minha Clínica';
  const primeiroNome = user?.nome?.split(' ').filter(Boolean).slice(0, 2).join(' ') ?? '';
  const iniciais =
    nomeExibido
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('') || 'IN';

  const { data: estoque } = useEstoque();
  const { data: pedidos } = usePedidos();
  const { data: movimentacoes } = useMovimentacoes();

  // Estoque da clínica — valor total, nº de produtos e alertas de validade
  const { totalValor, totalProdutos, alertas } = useMemo(() => {
    const itens = estoque ?? [];
    return {
      totalValor: itens.reduce(
        (s, i) => s + i.quantidade * Number(i.medicamento.precoUnitario ?? 0),
        0,
      ),
      totalProdutos: itens.length,
      alertas: itens.filter((i) => i.validadeStatus !== 'ok').length,
    };
  }, [estoque]);

  const ultimoPedido = (pedidos ?? [])[0];
  const aprovarCount = (pedidos ?? []).filter((p) => p.status === 'cotado').length;

  // Frequência de movimentações nos últimos 30 dias
  const { barras, highlightIndex } = useMemo(() => {
    const dias = 30;
    const counts = new Array<number>(dias).fill(0);
    const agora = Date.now();
    for (const m of movimentacoes ?? []) {
      const diff = Math.floor((agora - new Date(m.criadoEm).getTime()) / 86_400_000);
      if (diff >= 0 && diff < dias) {
        const idx = dias - 1 - diff;
        counts[idx] = (counts[idx] ?? 0) + 1;
      }
    }
    const max = Math.max(1, ...counts);
    let hi = 0;
    let hiVal = -1;
    counts.forEach((c, i) => {
      if (c > hiVal) {
        hiVal = c;
        hi = i;
      }
    });
    return {
      barras: counts.map((c) => 8 + (c / max) * 99),
      highlightIndex: hi,
    };
  }, [movimentacoes]);

  return (
    <SafeAreaView className="flex-1 bg-surface-base" edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-2">
          <View className="flex-row items-center gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-brand-800">
              <Text className="font-bold text-white">{iniciais}</Text>
            </View>
            <View>
              <Text className="font-sans text-xs text-ink-500">
                {primeiroNome ? `Olá, ${primeiroNome}` : 'Bem-vindo(a)'}
              </Text>
              <Text className="font-semibold text-sm text-brand-700">{nomeExibido}</Text>
            </View>
          </View>
          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={() => router.push('/notificacoes')}
              className="h-12 w-12 items-center justify-center rounded-pill bg-white/60 active:opacity-80"
            >
              <SolarIcon name="bell-linear" size={20} color={colors.brand[500]} />
            </Pressable>
            <View className="h-12 w-12 rounded-full bg-brand-100" />
          </View>
        </View>

        {/* Stock info card */}
        <View className="mt-6 mx-5 rounded-card bg-white/70 px-5 pt-6 pb-5">
          <View className="flex-row items-start justify-between">
            <Text className="font-medium text-sm text-brand-500">
              Meu <Text className="font-semibold">Estoque</Text>
            </Text>
            <Pressable
              onPress={() => router.navigate('/estoque')}
              className="h-9 flex-row items-center gap-2 rounded-pill bg-white px-3 active:opacity-80"
            >
              <Text className="font-semibold text-xs text-brand-800/75">Alertas</Text>
              <View
                className="h-4 min-w-4 items-center justify-center rounded-full px-1"
                style={{ backgroundColor: alertas > 0 ? colors.danger : '#9AA3B2' }}
              >
                <Text className="font-sora text-[9px] text-white">{alertas}</Text>
              </View>
            </Pressable>
          </View>

          <Text
            className="mt-4 font-medium text-[32px] text-brand-500"
            style={{ letterSpacing: -0.5 }}
          >
            {formatMoney(totalValor)}
          </Text>
          <Text className="mt-2 text-sm text-ink-700">
            {totalProdutos} {totalProdutos === 1 ? 'produto' : 'produtos'} em estoque
          </Text>

          {/* Quick actions row */}
          <View className="mt-5 flex-row gap-6">
            <QuickIconAction
              icon="add-square-bold-duotone"
              label="Solicitar"
              filled
              onPress={() => router.navigate('/novo-pedido')}
            />
            <QuickIconAction
              icon="file-check-bold-duotone"
              label="Aprovar"
              badge={aprovarCount || undefined}
              onPress={() => router.navigate('/pedidos')}
            />
            <QuickIconAction
              icon="box-bold-duotone"
              label="Acompanhar"
              onPress={() => router.navigate('/pedidos')}
            />
          </View>
        </View>

        {/* Order status card */}
        <Pressable
          onPress={() =>
            ultimoPedido
              ? router.push(`/pedido/${ultimoPedido.id}`)
              : router.navigate('/novo-pedido')
          }
          className="mt-3 mx-5 rounded-card bg-brand-800 px-5 py-5 active:opacity-90"
        >
          <View className="flex-row items-start justify-between">
            <View className="flex-1">
              <Text className="font-semibold text-sm text-white">
                {ultimoPedido ? `Último Pedido ${ultimoPedido.numero}` : 'Nenhum pedido ainda'}
              </Text>
              <Text className="mt-1 text-xs text-white/50">
                {ultimoPedido ? 'Confira o status do seu pedido' : 'Faça seu primeiro pedido'}
              </Text>
            </View>
            <View className="h-9 w-9 items-center justify-center rounded-full bg-white/10">
              <SolarIcon name="clock-circle-linear" size={16} color="#fff" />
            </View>
          </View>
          <Text className="mt-4 text-xs leading-5 text-white/75">
            {ultimoPedido
              ? STATUS_FRASE[ultimoPedido.status]
              : 'Toque aqui para solicitar insumos à Insumia®.'}
          </Text>
          <View className="absolute right-4 bottom-4 h-9 w-9 items-center justify-center rounded-2xl bg-black/30">
            <SolarIcon name="arrow-right-up-linear" size={16} color="#fff" />
          </View>
        </Pressable>

        {/* Cards grid (horizontal scroll) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, gap: 8 }}
        >
          {QUICK_ACTIONS.map((a) => (
            <View
              key={a.label}
              className="h-[150px] w-[150px] justify-end rounded-card bg-white p-5"
            >
              <View className="absolute left-4 top-4 h-10 w-10 items-center justify-center rounded-iconLg bg-brand-50">
                <SolarIcon name={a.icon} size={20} color={colors.brand[500]} />
              </View>
              <Text className="font-semibold text-sm text-brand-500" style={{ lineHeight: 18 }}>
                {a.label}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Frequency card */}
        <View className="mt-3 mx-5 rounded-card bg-brand-800 px-5 py-5">
          <View className="flex-row items-start justify-between">
            <View>
              <Text className="font-medium text-base text-white">Frequência de Uso</Text>
              <Text className="mt-1 text-xs text-white/25">
                Movimentações nos <Text className="text-white">últimos 30 dias</Text>
              </Text>
            </View>
            <Pressable
              onPress={() => router.push('/movimentacoes')}
              className="h-10 w-10 items-center justify-center rounded-icon bg-brand-700 active:opacity-80"
            >
              <SolarIcon name="transfer-vertical-linear" size={18} color="#fff" />
            </Pressable>
          </View>

          <View className="mt-6 h-[110px] flex-row items-end justify-between">
            {barras.map((h, i) => (
              <View
                key={i}
                style={{
                  width: 4,
                  height: h,
                  borderRadius: 31,
                  backgroundColor:
                    i === highlightIndex ? colors.accent[400] : 'rgba(255,255,255,0.26)',
                }}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function QuickIconAction({
  icon,
  label,
  filled = false,
  badge,
  onPress,
}: {
  icon: Parameters<typeof SolarIcon>[0]['name'];
  label: string;
  filled?: boolean;
  badge?: number;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} className="items-center gap-2 active:opacity-70">
      <View
        className={[
          'h-12 w-12 items-center justify-center rounded-icon',
          filled ? 'bg-brand-500' : 'bg-brand-50',
        ].join(' ')}
      >
        <SolarIcon name={icon} size={22} color={filled ? '#fff' : colors.brand[500]} />
        {badge != null ? (
          <View className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full bg-danger">
            <Text className="font-sora text-[10px] text-white">{badge}</Text>
          </View>
        ) : null}
      </View>
      <Text className="text-[11px] text-ink-500">{label}</Text>
    </Pressable>
  );
}
