import { TextInput, View } from 'react-native';
import { SolarIcon } from '@/components/icons/SolarIcon';

type SearchBarProps = {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
};

export function SearchBar({ value, onChangeText, placeholder = 'Busque produtos ou categorias' }: SearchBarProps) {
  return (
    <View className="mx-5 h-[59px] flex-row items-center gap-2 rounded-iconLg bg-white px-4">
      <SolarIcon name="search-linear" size={20} color="#9AA3B2" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#919191"
        className="flex-1 font-sans text-sm text-ink-900"
        returnKeyType="search"
      />
    </View>
  );
}
