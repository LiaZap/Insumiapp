import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import type { ContaTipo } from '@insumia/shared';
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useCriarConta } from '@/features/financeiro/financeiro.hooks';
import { colors } from '@/theme/tokens';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function NovaContaSheet({ visible, onClose }: Props) {
  const [tipo, setTipo] = useState<ContaTipo>('pagar');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [diasVenc, setDiasVenc] = useState('7');
  const [err, setErr] = useState<string | null>(null);
  const criar = useCriarConta();
  const toast = useToast();

  const reset = () => {
    setTipo('pagar');
    setDescricao('');
    setValor('');
    setDiasVenc('7');
    setErr(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = () => {
    const v = parseFloat(valor.replace(',', '.'));
    const dias = parseInt(diasVenc, 10) || 0;
    if (!descricao || descricao.length < 2) {
      setErr('Descrição muito curta');
      return;
    }
    if (!Number.isFinite(v) || v <= 0) {
      setErr('Valor inválido');
      return;
    }
    const vencimento = new Date();
    vencimento.setDate(vencimento.getDate() + dias);

    criar.mutate(
      {
        tipo,
        descricao,
        valor: Math.round(v * 100) / 100,
        vencimento: vencimento.toISOString(),
      },
      {
        onSuccess: () => {
          toast.show('Conta criada com sucesso', 'success');
          handleClose();
        },
        onError: (e) =>
          setErr((e as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Erro'),
      },
    );
  };

  return (
    <Sheet visible={visible} onClose={handleClose} title="Nova Conta">
      <View className="flex-row gap-2">
        {(['pagar', 'receber'] as ContaTipo[]).map((t) => (
          <Pressable
            key={t}
            onPress={() => setTipo(t)}
            className="flex-1 items-center justify-center"
            style={{
              paddingVertical: 12,
              borderRadius: 100,
              borderWidth: 1,
              borderColor: tipo === t ? colors.brand[500] : '#DDE2EA',
              backgroundColor: tipo === t ? colors.brand[500] : '#FFFFFF',
            }}
          >
            <Text
              style={{
                color: tipo === t ? '#FFFFFF' : colors.ink[700],
                fontSize: 13,
                fontFamily: 'Figtree_500Medium',
              }}
            >
              {t === 'pagar' ? 'A Pagar' : 'A Receber'}
            </Text>
          </Pressable>
        ))}
      </View>

      <View className="mt-4">
        <Text className="mb-1.5 font-medium text-sm text-ink-900">Descrição</Text>
        <TextInput
          value={descricao}
          onChangeText={setDescricao}
          placeholder="Ex: Fornecedor X • NF 123"
          placeholderTextColor="#B3B3B3"
          className="h-14 rounded-pill border border-brand-100 bg-surface-card px-5 text-base text-ink-900"
        />
      </View>

      <View className="mt-4 flex-row gap-3">
        <View className="flex-1">
          <Text className="mb-1.5 font-medium text-sm text-ink-900">Valor (R$)</Text>
          <TextInput
            value={valor}
            onChangeText={setValor}
            placeholder="0,00"
            keyboardType="decimal-pad"
            placeholderTextColor="#B3B3B3"
            className="h-14 rounded-pill border border-brand-100 bg-surface-card px-5 text-base text-ink-900"
          />
        </View>
        <View style={{ width: 120 }}>
          <Text className="mb-1.5 font-medium text-sm text-ink-900">Venc. (dias)</Text>
          <TextInput
            value={diasVenc}
            onChangeText={setDiasVenc}
            keyboardType="number-pad"
            placeholderTextColor="#B3B3B3"
            className="h-14 rounded-pill border border-brand-100 bg-surface-card px-5 text-base text-ink-900"
          />
        </View>
      </View>

      {err ? <Text className="mt-2 text-xs text-danger">{err}</Text> : null}

      <View className="mt-6">
        <Button
          label="Criar Conta"
          fullWidth
          size="lg"
          loading={criar.isPending}
          onPress={handleSubmit}
        />
      </View>
    </Sheet>
  );
}
