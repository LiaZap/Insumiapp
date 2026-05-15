import { Modal, Pressable, View, Text } from 'react-native';

type SheetProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
};

export function Sheet({ visible, onClose, title, children }: SheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable onPress={onClose} className="flex-1 justify-end bg-black/40">
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View className="rounded-t-card bg-surface-card px-5 pb-8 pt-3">
            <View className="mb-4 self-center h-1 w-12 rounded-full bg-ink-400/40" />
            {title ? (
              <Text className="mb-4 font-semibold text-lg text-ink-900">{title}</Text>
            ) : null}
            {children}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
