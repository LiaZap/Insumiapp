import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import type { CriarEnderecoInput } from '@insumia/shared';

import { SolarIcon } from '@/components/icons/SolarIcon';
import { Button } from '@/components/ui/Button';
import {
  useEnderecos,
  useCriarEndereco,
  useRemoverEndereco,
  useDefinirPrincipal,
  type Endereco,
} from '@/features/enderecos/enderecos.hooks';
import { migrarEnderecosLocais } from '@/features/enderecos/enderecos.migrate';
import { colors } from '@/theme/tokens';

export default function EnderecosScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const { data: enderecos = [], isLoading } = useEnderecos();
  const criar = useCriarEndereco();
  const remover = useRemoverEndereco();
  const definirPrincipal = useDefinirPrincipal();

  const [modalOpen, setModalOpen] = useState(false);

  // Migração única dos endereços que ficaram no AsyncStorage da versão antiga.
  const migrou = useRef(false);
  useEffect(() => {
    if (isLoading || migrou.current) return;
    migrou.current = true;
    migrarEnderecosLocais(enderecos.length === 0).then((n) => {
      if (n > 0) qc.invalidateQueries({ queryKey: ['enderecos'] });
    });
  }, [isLoading, enderecos.length, qc]);

  const handleRemove = (id: string) =>
    Alert.alert('Remover endereço?', 'Esta ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: () =>
          remover.mutate(id, {
            onError: () => Alert.alert('Erro', 'Não foi possível remover o endereço.'),
          }),
      },
    ]);

  return (
    <SafeAreaView className="flex-1 bg-surface-base" edges={['top']}>
      <View className="flex-row items-center justify-between px-5 pb-3 pt-2">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-[15px] bg-black/5 active:opacity-70"
        >
          <SolarIcon name="alt-arrow-down-linear" size={18} color="#515151" style={{ transform: [{ rotate: '90deg' }] }} />
        </Pressable>
        <Text className="font-semibold text-base text-[#515151]">Endereços</Text>
        <Pressable
          onPress={() => setModalOpen(true)}
          className="h-10 w-10 items-center justify-center rounded-[15px] bg-brand-500 active:opacity-80"
        >
          <SolarIcon name="add-square-bold-duotone" size={18} color="#fff" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 140 }}>
        <Text className="text-sm text-ink-500">
          Endereços de entrega e cobrança dos seus pedidos.
        </Text>

        <View className="mt-5 gap-3">
          {isLoading ? (
            <View className="items-center py-12">
              <ActivityIndicator color={colors.brand[500]} />
            </View>
          ) : enderecos.length === 0 ? (
            <View className="items-center rounded-card bg-white px-6 py-12">
              <SolarIcon name="map-point-bold" size={40} color="#B3B3B3" />
              <Text className="mt-3 font-medium text-base text-ink-700">Nenhum endereço cadastrado</Text>
              <Text className="mt-1 text-center text-xs text-ink-500">
                Toque no + para adicionar o primeiro endereço.
              </Text>
            </View>
          ) : (
            enderecos.map((e) => (
              <EnderecoCard
                key={e.id}
                endereco={e}
                onSetPrincipal={() => definirPrincipal.mutate(e.id)}
                onRemove={() => handleRemove(e.id)}
              />
            ))
          )}
        </View>
      </ScrollView>

      <NovoEnderecoModal
        visible={modalOpen}
        saving={criar.isPending}
        onClose={() => setModalOpen(false)}
        onSave={(dto) =>
          criar.mutate(dto, {
            onSuccess: () => setModalOpen(false),
            onError: () => Alert.alert('Erro', 'Não foi possível salvar o endereço.'),
          })
        }
      />
    </SafeAreaView>
  );
}

function EnderecoCard({
  endereco,
  onSetPrincipal,
  onRemove,
}: {
  endereco: Endereco;
  onSetPrincipal: () => void;
  onRemove: () => void;
}) {
  const linhaLocal = [endereco.bairro, `${endereco.cidade} / ${endereco.uf}`].filter(Boolean).join(' • ');
  return (
    <View className="rounded-card bg-white p-5">
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="font-semibold text-base text-ink-900">{endereco.apelido}</Text>
            {endereco.principal ? (
              <View className="rounded-pill bg-brand-50 px-2 py-0.5">
                <Text className="text-[10px] font-semibold text-brand-700">PRINCIPAL</Text>
              </View>
            ) : null}
          </View>
          <Text className="mt-2 text-sm text-ink-700">
            {[endereco.logradouro, endereco.numero].filter(Boolean).join(', ')}
          </Text>
          <Text className="mt-0.5 text-xs text-ink-500">
            {linhaLocal} • CEP {endereco.cep}
          </Text>
        </View>
        <SolarIcon name="map-point-bold" size={22} color={colors.brand[500]} />
      </View>

      <View className="mt-4 flex-row gap-3">
        {!endereco.principal ? (
          <Pressable
            onPress={onSetPrincipal}
            className="rounded-pill bg-brand-50 px-4 py-2 active:opacity-70"
          >
            <Text className="font-semibold text-xs text-brand-700">Definir como principal</Text>
          </Pressable>
        ) : null}
        <Pressable onPress={onRemove} className="rounded-pill px-4 py-2 active:opacity-70">
          <Text className="font-semibold text-xs text-danger">Remover</Text>
        </Pressable>
      </View>
    </View>
  );
}

function NovoEnderecoModal({
  visible,
  saving,
  onClose,
  onSave,
}: {
  visible: boolean;
  saving: boolean;
  onClose: () => void;
  onSave: (e: CriarEnderecoInput) => void;
}) {
  const [apelido, setApelido] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('');
  const [cep, setCep] = useState('');

  const reset = () => {
    setApelido('');
    setLogradouro('');
    setNumero('');
    setBairro('');
    setCidade('');
    setUf('');
    setCep('');
  };

  const handleSave = () => {
    if (!apelido.trim() || !logradouro.trim() || !cidade.trim()) {
      Alert.alert('Atenção', 'Preencha pelo menos apelido, logradouro e cidade.');
      return;
    }
    if (uf.trim().length !== 2) {
      Alert.alert('Atenção', 'Informe a UF com 2 letras (ex.: SP).');
      return;
    }
    if (cep.replace(/\D/g, '').length < 8) {
      Alert.alert('Atenção', 'Informe um CEP válido.');
      return;
    }
    onSave({
      apelido: apelido.trim(),
      logradouro: logradouro.trim(),
      numero: numero.trim() || undefined,
      bairro: bairro.trim() || undefined,
      cidade: cidade.trim(),
      uf: uf.trim().toUpperCase(),
      cep: cep.trim(),
    });
    reset();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/40">
        <View className="rounded-t-3xl bg-white px-5 pb-10 pt-5" style={{ maxHeight: '85%' }}>
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="font-bold text-lg text-brand-700">Novo endereço</Text>
            <Pressable onPress={onClose} className="h-9 w-9 items-center justify-center rounded-full bg-black/5">
              <Text className="text-base text-ink-700">×</Text>
            </Pressable>
          </View>

          <ScrollView>
            <ModalField label="Apelido" placeholder="Matriz, Filial, Casa..." value={apelido} onChangeText={setApelido} />
            <View className="flex-row gap-3">
              <View className="flex-1">
                <ModalField label="Logradouro" placeholder="Rua, avenida" value={logradouro} onChangeText={setLogradouro} />
              </View>
              <View className="w-24">
                <ModalField label="Número" placeholder="123" value={numero} onChangeText={setNumero} />
              </View>
            </View>
            <ModalField label="Bairro" placeholder="" value={bairro} onChangeText={setBairro} />
            <View className="flex-row gap-3">
              <View className="flex-1">
                <ModalField label="Cidade" placeholder="" value={cidade} onChangeText={setCidade} />
              </View>
              <View className="w-20">
                <ModalField label="UF" placeholder="SP" value={uf} onChangeText={setUf} />
              </View>
            </View>
            <ModalField label="CEP" placeholder="00000-000" value={cep} onChangeText={setCep} />
          </ScrollView>

          <Button label={saving ? 'Salvando...' : 'Salvar endereço'} fullWidth disabled={saving} onPress={handleSave} />
        </View>
      </View>
    </Modal>
  );
}

function ModalField({
  label,
  placeholder,
  value,
  onChangeText,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (s: string) => void;
}) {
  return (
    <View className="mb-3">
      <Text className="mb-1.5 text-[12px] font-semibold text-ink-700">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#B3B3B3"
        className="rounded-card border border-black/10 bg-white px-4 py-3 text-sm text-ink-900"
      />
    </View>
  );
}
