import { Alert, Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { Pedido, PedidoItemResponse } from '@insumia/shared';

import { SolarIcon } from '@/components/icons/SolarIcon';
import { PedidoStatusBadge } from '@/components/pedidos/PedidoStatusBadge';
import { StatusTimeline } from '@/components/pedidos/StatusTimeline';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { usePedido, useResponderCotacao } from '@/features/pedidos/pedidos.hooks';
import { colors } from '@/theme/tokens';

function formatMoney(v: number) {
  return v.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function ItemRow({ item, isLast }: { item: PedidoItemResponse; isLast: boolean }) {
  const med = item.medicamento;
  const subtitle = [med.apresentacao, med.dosagem].filter(Boolean).join(' • ');
  const subtotal = Number(item.precoUnitario) * item.quantidade;
  const rastreio = item.rastreabilidade;
  return (
    <View
      style={{
        paddingVertical: 16,
        borderBottomWidth: isLast ? 0 : 1,
        borderStyle: 'dashed',
        borderBottomColor: '#E0E0E0',
      }}
    >
      <View className="flex-row items-center">
        <View className="h-11 w-11 items-center justify-center rounded-icon bg-[#EBEBEB]">
          <SolarIcon
            name={med.apresentacao?.toLowerCase().includes('seringa') ? 'syringe-linear' : 'jar-of-pills-linear'}
            size={18}
            color="#4A4A4A"
          />
        </View>
        <View className="ml-3 flex-1">
          <Text className="font-medium text-sm text-[#4A4A4A]">
            {med.nome}
            {subtitle ? ` • ${subtitle}` : ''}
          </Text>
          <Text className="mt-1 text-xs text-[#969696]">
            {med.fabricante ?? med.principioAtivo ?? ''}
          </Text>
        </View>
        <View className="items-end">
          <Text className="font-medium text-sm text-black">{formatMoney(subtotal)}</Text>
          <Text className="mt-1 text-xs text-[#969696]">{item.quantidade} Unidades</Text>
        </View>
      </View>

      {/* Rastreabilidade — lote/fabricante/fornecedor (Vigilância Sanitária) */}
      {rastreio ? (
        <View className="mt-3 ml-14 rounded-icon bg-brand-50 p-3">
          <View className="flex-row items-center gap-1.5">
            <SolarIcon name="file-check-bold-duotone" size={13} color={colors.brand[500]} />
            <Text className="font-semibold text-[11px] text-brand-700">Rastreabilidade</Text>
          </View>
          <View className="mt-1.5 flex-row flex-wrap gap-x-4 gap-y-1">
            {rastreio.lote ? <TraceTag label="Lote" value={rastreio.lote} /> : null}
            {rastreio.validade ? (
              <TraceTag label="Validade" value={formatDate(rastreio.validade)} />
            ) : null}
            {rastreio.fabricante ? <TraceTag label="Fabricante" value={rastreio.fabricante} /> : null}
            {rastreio.fornecedor ? <TraceTag label="Fornecedor" value={rastreio.fornecedor} /> : null}
            {rastreio.notaFiscal ? <TraceTag label="NF" value={rastreio.notaFiscal} /> : null}
          </View>
        </View>
      ) : null}
    </View>
  );
}

function TraceTag({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text className="text-[9px] text-ink-400">{label}</Text>
      <Text className="text-[11px] font-medium text-ink-700">{value}</Text>
    </View>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: Parameters<typeof SolarIcon>[0]['name'];
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <View className="mt-3 rounded-card bg-white p-5">
      <View className="flex-row items-center gap-2">
        <View className="h-9 w-9 items-center justify-center rounded-icon bg-brand-50">
          <SolarIcon name={icon} size={18} color={colors.brand[500]} />
        </View>
        <Text className="font-semibold text-base text-ink-900">{title}</Text>
      </View>
      {children ? <View className="mt-3">{children}</View> : null}
    </View>
  );
}

function CotacaoCard({ pedido }: { pedido: Pedido }) {
  const router = useRouter();
  const toast = useToast();
  const { aceitar, recusar } = useResponderCotacao(pedido.id);

  const indisponiveis = pedido.itens.filter((i) => i.disponivel === false);
  const expirada = pedido.cotacaoValidaAte
    ? new Date(pedido.cotacaoValidaAte) < new Date()
    : false;

  const handleAceitar = () => {
    aceitar.mutate(undefined, {
      onSuccess: () => {
        toast.show('Cotação aceita! Pedido confirmado.', 'success');
      },
      onError: () => toast.show('Não foi possível aceitar', 'error'),
    });
  };

  const handleRecusar = () => {
    Alert.alert('Recusar cotação', 'O pedido será cancelado. Confirmar?', [
      { text: 'Voltar', style: 'cancel' },
      {
        text: 'Recusar',
        style: 'destructive',
        onPress: () =>
          recusar.mutate(undefined, {
            onSuccess: () => {
              toast.show('Cotação recusada', 'info');
              router.back();
            },
            onError: () => toast.show('Não foi possível recusar', 'error'),
          }),
      },
    ]);
  };

  return (
    <View className="mt-3 rounded-card bg-brand-500 p-5">
      <View className="flex-row items-center gap-2">
        <SolarIcon name="file-check-bold-duotone" size={18} color="#fff" />
        <Text className="font-semibold text-base text-white">Cotação recebida</Text>
      </View>

      <View className="mt-3 flex-row gap-6">
        <View>
          <Text className="text-[10px] text-white/50">Prazo de entrega</Text>
          <Text className="font-semibold text-sm text-white">
            {pedido.prazoEntregaDias != null ? `${pedido.prazoEntregaDias} dias` : '—'}
          </Text>
        </View>
        <View>
          <Text className="text-[10px] text-white/50">Válida até</Text>
          <Text className="font-semibold text-sm text-white">
            {pedido.cotacaoValidaAte ? formatDate(pedido.cotacaoValidaAte) : '—'}
          </Text>
        </View>
      </View>

      {pedido.cotacaoObservacao ? (
        <Text className="mt-3 text-xs leading-4 text-white/75">{pedido.cotacaoObservacao}</Text>
      ) : null}

      {indisponiveis.length > 0 ? (
        <View className="mt-3 rounded-icon bg-white/10 p-3">
          <Text className="text-xs font-semibold text-white">
            {indisponiveis.length} item(ns) indisponível(is)
          </Text>
          {indisponiveis.map((i) => (
            <Text key={i.id} className="mt-0.5 text-[11px] text-white/60">
              • {i.medicamento.nome}
            </Text>
          ))}
        </View>
      ) : null}

      {expirada ? (
        <Text className="mt-4 text-center text-sm font-medium text-white/80">
          Esta cotação expirou.
        </Text>
      ) : (
        <View className="mt-4 gap-2">
          <Button
            label="Aceitar cotação"
            variant="secondary"
            fullWidth
            loading={aceitar.isPending}
            onPress={handleAceitar}
          />
          <Pressable
            onPress={handleRecusar}
            disabled={recusar.isPending}
            className="h-11 items-center justify-center active:opacity-60"
          >
            <Text className="font-medium text-sm text-white/70">Recusar cotação</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

export default function PedidoDetalheScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: pedido, isLoading } = usePedido(id);

  if (isLoading || !pedido) {
    return (
      <SafeAreaView className="flex-1 bg-surface-base" edges={['top']}>
        <View className="px-5 pt-3 gap-3">
          <Skeleton width="100%" height={48} radius={14} />
          <Skeleton width="100%" height={180} radius={30} />
          <Skeleton width="100%" height={240} radius={30} />
        </View>
      </SafeAreaView>
    );
  }

  const total = Number(pedido.total);
  const totalItens = pedido.itens.reduce((s, i) => s + i.quantidade, 0);

  return (
    <SafeAreaView className="flex-1 bg-surface-base" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pb-3 pt-2">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-[15px] bg-black/5 active:opacity-70"
        >
          <SolarIcon
            name="alt-arrow-down-linear"
            size={18}
            color="#515151"
            style={{ transform: [{ rotate: '90deg' }] }}
          />
        </Pressable>
        <Text className="font-semibold text-base text-[#515151]">Pedido</Text>
        <View className="h-10 w-10" />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}>
        {/* Hero card */}
        <View className="rounded-card bg-white p-5">
          <View className="flex-row items-start justify-between">
            <View>
              <Text className="font-semibold text-xl text-ink-900">Pedido {pedido.numero}</Text>
              <Text className="mt-1 text-sm text-ink-500">
                {totalItens} {totalItens === 1 ? 'item' : 'itens'} • {formatDate(pedido.criadoEm)}
              </Text>
            </View>
            <PedidoStatusBadge status={pedido.status} />
          </View>

          <View className="mt-5">
            <Text className="text-xs text-ink-500">
              {pedido.status === 'cotado' ? 'Valor da Cotação' : 'Valor Total'}
            </Text>
            <Text className="font-bold text-2xl text-brand-700">{formatMoney(total)}</Text>
          </View>
        </View>

        {/* Cotação — cliente aceita ou recusa */}
        {pedido.status === 'cotado' ? (
          <CotacaoCard pedido={pedido} />
        ) : pedido.status === 'aguardando_cotacao' ? (
          <View className="mt-3 rounded-card bg-brand-50 p-5">
            <View className="flex-row items-center gap-2">
              <SolarIcon name="clock-circle-linear" size={18} color={colors.brand[500]} />
              <Text className="font-semibold text-sm text-brand-700">Aguardando cotação</Text>
            </View>
            <Text className="mt-1 text-xs text-ink-500">
              Nossa equipe está preparando os preços e o prazo. Você será notificado em até 2h úteis.
            </Text>
          </View>
        ) : null}

        {/* Timeline */}
        <Section icon="clock-circle-linear" title="Status do Pedido">
          <StatusTimeline status={pedido.status} />
        </Section>

        {/* Itens */}
        <Section icon="box-bold-duotone" title={`${totalItens} Itens`}>
          {pedido.itens.map((item, idx) => (
            <ItemRow key={item.id} item={item} isLast={idx === pedido.itens.length - 1} />
          ))}
        </Section>

        {/* Receituário */}
        <Section icon="file-check-bold-duotone" title="Receituário">
          <Text className="text-sm text-ink-500">
            Precisamos das receitas para efetuar seu pedido
          </Text>
          <Pressable
            onPress={() =>
              Alert.alert(
                'Enviar receituário',
                'Envie a foto ou PDF do receituário pelo WhatsApp da Insumia para liberar o pedido.',
                [
                  { text: 'Fechar', style: 'cancel' },
                  {
                    text: 'Abrir WhatsApp',
                    onPress: () => {
                      const msg = encodeURIComponent(
                        `Receituário do pedido ${pedido.numero}`,
                      );
                      Linking.openURL(`https://wa.me/5511999999999?text=${msg}`);
                    },
                  },
                ],
              )
            }
            className="mt-3 h-11 items-center justify-center rounded-pill bg-brand-50 active:opacity-80"
          >
            <Text className="font-semibold text-sm text-brand-500">Enviar Receituário</Text>
          </Pressable>
        </Section>

        {/* Pagamento */}
        <Section icon="chat-round-money-bold" title="Pagamento">
          {pedido.status === 'aguardando_cotacao' ? (
            <Text className="text-sm text-ink-500">Aguardando cotação para liberar pagamento.</Text>
          ) : (
            <Text className="text-sm text-ink-500">
              Pagamento realizado via Pix • {formatDate(pedido.atualizadoEm)}
            </Text>
          )}
        </Section>

        {/* Nota Fiscal */}
        <Section icon="file-check-bold-duotone" title="Nota Fiscal">
          <Text className="text-sm text-ink-500">
            {pedido.status === 'entregue' ? 'Visualize ou baixe no dispositivo' : 'Disponível após entrega'}
          </Text>
        </Section>

        {/* Ajuda */}
        <Section icon="bell-linear" title="Ajuda do Pedido">
          <Pressable
            onPress={() => {
              const msg = encodeURIComponent(
                `Olá, preciso de ajuda com o pedido ${pedido.numero}.`,
              );
              Linking.openURL(`https://wa.me/5511999999999?text=${msg}`);
            }}
            className="flex-row items-center justify-between py-3 active:opacity-70"
          >
            <Text className="text-sm text-ink-700">Falar com Atendente</Text>
            <SolarIcon
              name="alt-arrow-down-linear"
              size={16}
              color="#9AA3B2"
              style={{ transform: [{ rotate: '-90deg' }] }}
            />
          </Pressable>
          <View style={{ height: 1, backgroundColor: '#E0E0E0' }} />
          <Pressable
            onPress={() => router.push('/ajuda')}
            className="flex-row items-center justify-between py-3 active:opacity-70"
          >
            <Text className="text-sm text-ink-700">Perguntas Frequentes</Text>
            <SolarIcon
              name="alt-arrow-down-linear"
              size={16}
              color="#9AA3B2"
              style={{ transform: [{ rotate: '-90deg' }] }}
            />
          </Pressable>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}
