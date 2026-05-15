import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import type { EstoqueResumo, MovimentacaoTipo } from '@insumia/shared';
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useCriarMovimentacao } from '@/features/estoque/estoque.hooks';
import { MOVIMENTACAO_TIPO_LABEL } from '@insumia/shared';
import { colors } from '@/theme/tokens';

type InformarUsoSheetProps = {
  visible: boolean;
  onClose: () => void;
  item: EstoqueResumo | null;
};

const TIPOS: Array<{ value: MovimentacaoTipo; label: string }> = [
  { value: 'entrada', label: 'Entrada' },
  { value: 'saida', label: 'Saída' },
  { value: 'ajuste', label: 'Ajuste' },
  { value: 'perda', label: 'Perda' },
];

export function InformarUsoSheet({ visible, onClose, item }: InformarUsoSheetProps) {
  const [tipo, setTipo] = useState<MovimentacaoTipo>('saida');
  const [qtd, setQtd] = useState('1');
  const [motivo, setMotivo] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const criar = useCriarMovimentacao();
  const toast = useToast();

  const reset = () => {
    setTipo('saida');
    setQtd('1');
    setMotivo('');
    setErr(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = () => {
    if (!item) return;
    const quantidade = parseInt(qtd, 10);
    if (!Number.isFinite(quantidade) || quantidade <= 0) {
      setErr('Informe uma quantidade válida');
      return;
    }
    criar.mutate(
      {
        medicamentoId: item.medicamento.id,
        tipo,
        quantidade,
        motivo: motivo || undefined,
      },
      {
        onSuccess: () => {
          toast.show(`${MOVIMENTACAO_TIPO_LABEL[tipo]} registrada`, 'success');
          handleClose();
        },
        onError: (e) =>
          setErr((e as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Erro ao registrar'),
      },
    );
  };

  if (!item) return null;

  return (
    <Sheet visible={visible} onClose={handleClose} title={`Movimentar • ${item.medicamento.nome}`}>
      <Text className="text-sm text-ink-500">
        Estoque atual: <Text className="font-semibold text-ink-900">{item.quantidade}</Text>
      </Text>

      {/* Tipo */}
      <View className="mt-5 flex-row flex-wrap gap-2">
        {TIPOS.map((t) => (
          <Pressable
            key={t.value}
            onPress={() => setTipo(t.value)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 100,
              borderWidth: 1,
              borderColor: tipo === t.value ? colors.brand[500] : '#DDE2EA',
              backgroundColor: tipo === t.value ? colors.brand[500] : '#FFFFFF',
            }}
          >
            <Text
              style={{
                color: tipo === t.value ? '#FFFFFF' : colors.ink[700],
                fontSize: 13,
                fontFamily: 'Figtree_500Medium',
              }}
            >
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Quantidade */}
      <View className="mt-5">
        <Text className="mb-1.5 font-medium text-sm text-ink-900">Quantidade</Text>
        <TextInput
          value={qtd}
          onChangeText={setQtd}
          keyboardType="number-pad"
          className="h-14 rounded-pill border border-brand-100 bg-surface-card px-5 text-base text-ink-900"
        />
      </View>

      {/* Motivo */}
      <View className="mt-4">
        <Text className="mb-1.5 font-medium text-sm text-ink-900">Motivo (opcional)</Text>
        <TextInput
          value={motivo}
          onChangeText={setMotivo}
          placeholder="Ex: aplicação na sala 3"
          placeholderTextColor="#B3B3B3"
          className="h-14 rounded-pill border border-brand-100 bg-surface-card px-5 text-base text-ink-900"
        />
      </View>

      {err ? <Text className="mt-2 text-xs text-danger">{err}</Text> : null}

      <View className="mt-6">
        <Button
          label="Registrar Movimentação"
          fullWidth
          size="lg"
          loading={criar.isPending}
          onPress={handleSubmit}
        />
      </View>
    </Sheet>
  );
}
