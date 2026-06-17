import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { SolarIcon } from '@/components/icons/SolarIcon';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/features/auth/auth.store';
import { colors } from '@/theme/tokens';

const ROLE_LABEL: Record<string, string> = {
  admin: 'Administrador',
  comprador: 'Comprador',
  financeiro: 'Financeiro',
  vendedor: 'Vendedor',
};

export default function PerfilScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  const [editing, setEditing] = useState(false);
  const [nome, setNome] = useState(user?.nome ?? '');
  const [empresa, setEmpresa] = useState(user?.empresa ?? '');

  const iniciais =
    (user?.empresa ?? user?.nome ?? 'IN')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('') || 'IN';

  const handleSave = () => {
    if (!user) return;
    if (!nome.trim()) {
      Alert.alert('Atenção', 'O nome não pode ficar em branco.');
      return;
    }
    updateUser({ nome: nome.trim(), empresa: empresa.trim() || null });
    setEditing(false);
    Alert.alert('Pronto', 'Perfil atualizado.');
  };

  const handleCancel = () => {
    setNome(user?.nome ?? '');
    setEmpresa(user?.empresa ?? '');
    setEditing(false);
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
        <Text className="font-semibold text-base text-[#515151]">Perfil</Text>
        <View className="h-10 w-10" />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 140 }}>
        {/* Avatar + identidade */}
        <View className="items-center pt-4">
          <View className="h-20 w-20 items-center justify-center rounded-3xl bg-brand-800">
            <Text className="font-bold text-3xl text-white">{iniciais}</Text>
          </View>
          <Text className="mt-3 font-bold text-xl text-brand-700">{user?.empresa ?? user?.nome}</Text>
          {user?.role ? (
            <View className="mt-2 rounded-pill bg-brand-50 px-3 py-1">
              <Text className="font-semibold text-xs text-brand-700">
                {ROLE_LABEL[user.role] ?? user.role}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Campos */}
        <View className="mt-8 gap-4">
          <Field
            label="Nome do responsável"
            value={editing ? nome : (user?.nome ?? '-')}
            editable={editing}
            onChangeText={setNome}
          />
          <Field
            label="Clínica / Empresa"
            value={editing ? empresa : (user?.empresa ?? '-')}
            editable={editing}
            onChangeText={setEmpresa}
            placeholder="Nome da clínica"
          />
          <Field label="E-mail" value={user?.email ?? '-'} />
        </View>

        {/* Acoes */}
        <View className="mt-8">
          {editing ? (
            <View className="gap-3">
              <Button label="Salvar alterações" fullWidth onPress={handleSave} />
              <Button label="Cancelar" variant="secondary" fullWidth onPress={handleCancel} />
            </View>
          ) : (
            <Button label="Editar perfil" variant="secondary" fullWidth onPress={() => setEditing(true)} />
          )}
        </View>

        {/* Seções secundarias */}
        <View className="mt-8 gap-3">
          <SectionRow icon="bell-linear" label="Notificações" onPress={() => router.push('/notificacoes')} />
          <SectionRow icon="map-point-bold" label="Endereços" onPress={() => router.push('/enderecos')} />
          <SectionRow icon="file-check-bold-duotone" label="Ajuda e suporte" onPress={() => router.push('/ajuda')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({
  label,
  value,
  editable = false,
  placeholder,
  onChangeText,
}: {
  label: string;
  value: string;
  editable?: boolean;
  placeholder?: string;
  onChangeText?: (s: string) => void;
}) {
  return (
    <View className="rounded-card bg-white px-4 py-3">
      <Text className="text-[11px] font-medium uppercase tracking-wide text-ink-400">{label}</Text>
      {editable ? (
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#B3B3B3"
          className="mt-1 text-base text-ink-900"
        />
      ) : (
        <Text className="mt-1 text-base text-ink-900">{value}</Text>
      )}
    </View>
  );
}

function SectionRow({
  icon,
  label,
  onPress,
}: {
  icon: Parameters<typeof SolarIcon>[0]['name'];
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 rounded-card bg-white px-4 py-4 active:opacity-80"
    >
      <View className="h-10 w-10 items-center justify-center rounded-icon bg-brand-50">
        <SolarIcon name={icon} size={20} color={colors.brand[500]} />
      </View>
      <Text className="flex-1 font-medium text-base text-ink-900">{label}</Text>
      <SolarIcon
        name="alt-arrow-down-linear"
        size={18}
        color="#9AA3B2"
        style={{ transform: [{ rotate: '-90deg' }] }}
      />
    </Pressable>
  );
}
