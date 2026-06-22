import { useState } from 'react';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';

import { SolarIcon } from '@/components/icons/SolarIcon';
import { colors } from '@/theme/tokens';

const FAQ = [
  {
    pergunta: 'Quanto tempo a Insumia leva para cotar meu pedido?',
    resposta:
      'Em geral, a equipe responde com a cotação completa em até 2 horas úteis. ' +
      'Pedidos enviados fora do horário comercial entram na fila do próximo dia útil.',
  },
  {
    pergunta: 'Como funciona a compra coletiva?',
    resposta:
      'Pedidos de várias clínicas para o mesmo produto são agrupados. ' +
      'A Insumia leva esse volume aos fornecedores e consegue preços melhores, ' +
      'que são repassados a cada clínica do grupo.',
  },
  {
    pergunta: 'Preciso enviar algum documento junto com o pedido?',
    resposta:
      'Na maioria dos itens, não. Quando algum produto exigir documentação ' +
      'específica, o app sinaliza antes do envio e você anexa pelo detalhe do pedido.',
  },
  {
    pergunta: 'Posso recusar uma cotação?',
    resposta:
      'Sim. Quando o pedido estiver no status "Cotado", você pode aceitar ou recusar ' +
      'a cotação dentro do prazo de validade, sem custo.',
  },
  {
    pergunta: 'Como acompanho a entrega?',
    resposta:
      'Após aceitar a cotação, o pedido passa pelos status Aprovado → Em separação → ' +
      'Enviado → Entregue. Você recebe notificação a cada mudança e pode acompanhar ' +
      'na aba Pedidos.',
  },
  {
    pergunta: 'Onde fica o histórico de notas fiscais?',
    resposta:
      'Cada pedido entregue tem a nota fiscal anexada. Abra o detalhe do pedido ' +
      'na aba Pedidos para visualizá-la ou baixá-la.',
  },
];

const WHATSAPP_NUMERO = '5551920044576';
const EMAIL_SUPORTE = 'contato@bahtech.com.br';

export default function AjudaScreen() {
  const router = useRouter();
  const versao = Constants.expoConfig?.version ?? '0.1.0';

  const abrirWhatsApp = () => {
    const url = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent('Olá, preciso de ajuda no app Insumia.')}`;
    Linking.openURL(url);
  };

  const abrirEmail = () => {
    Linking.openURL(`mailto:${EMAIL_SUPORTE}?subject=${encodeURIComponent('Suporte Insumia')}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-base" edges={['top']}>
      <View className="flex-row items-center justify-between px-5 pb-3 pt-2">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-[15px] bg-black/5 active:opacity-70"
        >
          <SolarIcon name="alt-arrow-down-linear" size={18} color="#515151" style={{ transform: [{ rotate: '90deg' }] }} />
        </Pressable>
        <Text className="font-semibold text-base text-[#515151]">Ajuda</Text>
        <View className="h-10 w-10" />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 140 }}>
        {/* Contato */}
        <Text className="font-semibold text-base text-brand-700">Fale com a Insumia</Text>
        <Text className="mt-1 text-sm text-ink-500">Atendimento em horário comercial (seg–sex, 8h–18h).</Text>

        <View className="mt-4 gap-3">
          <ContactRow
            icon="chat-round-money-bold"
            title="WhatsApp"
            subtitle="Resposta rápida no horário comercial"
            onPress={abrirWhatsApp}
            tone="success"
          />
          <ContactRow
            icon="bell-linear"
            title="E-mail do suporte"
            subtitle={EMAIL_SUPORTE}
            onPress={abrirEmail}
            tone="brand"
          />
        </View>

        {/* FAQ */}
        <Text className="mt-8 font-semibold text-base text-brand-700">Perguntas frequentes</Text>

        <View className="mt-4 gap-2">
          {FAQ.map((item, i) => (
            <FaqItem key={i} pergunta={item.pergunta} resposta={item.resposta} />
          ))}
        </View>

        {/* Rodape */}
        <View className="mt-10 items-center">
          <Text className="text-xs text-ink-400">Versão do app {versao}</Text>
          <Text className="mt-1 text-xs text-ink-400">© Insumia • Plataforma B2B de insumos estéticos</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ContactRow({
  icon,
  title,
  subtitle,
  onPress,
  tone,
}: {
  icon: Parameters<typeof SolarIcon>[0]['name'];
  title: string;
  subtitle: string;
  onPress: () => void;
  tone: 'brand' | 'success';
}) {
  const bg = tone === 'success' ? '#DCFCE7' : colors.brand[50];
  const fg = tone === 'success' ? '#16A34A' : colors.brand[500];
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 rounded-card bg-white px-4 py-4 active:opacity-80"
    >
      <View
        className="h-12 w-12 items-center justify-center rounded-icon"
        style={{ backgroundColor: bg }}
      >
        <SolarIcon name={icon} size={22} color={fg} />
      </View>
      <View className="flex-1">
        <Text className="font-semibold text-sm text-ink-900">{title}</Text>
        <Text className="mt-0.5 text-xs text-ink-500">{subtitle}</Text>
      </View>
      <SolarIcon name="arrow-right-up-linear" size={16} color="#9AA3B2" />
    </Pressable>
  );
}

function FaqItem({ pergunta, resposta }: { pergunta: string; resposta: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Pressable
      onPress={() => setOpen((v) => !v)}
      className="rounded-card bg-white px-4 py-4 active:opacity-90"
    >
      <View className="flex-row items-start gap-3">
        <Text className="flex-1 font-medium text-sm text-ink-900">{pergunta}</Text>
        <SolarIcon
          name="alt-arrow-down-linear"
          size={16}
          color="#9AA3B2"
          style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}
        />
      </View>
      {open ? (
        <Text className="mt-3 text-sm leading-5 text-ink-500">{resposta}</Text>
      ) : null}
    </Pressable>
  );
}
