import { Pressable, ScrollView, Text } from 'react-native';
import { CATEGORIA_LABEL, type MedicamentoCategoria } from '@insumia/shared';

type CategoryChipsProps = {
  selected: MedicamentoCategoria | null;
  onChange: (cat: MedicamentoCategoria | null) => void;
};

const CATEGORIES: Array<MedicamentoCategoria> = [
  'preenchedores',
  'bioestimuladores',
  'neuromoduladores',
  'anestesicos',
  'corticoides',
  'enzimas',
  'antissepticos',
  'solucoes',
  'insumos',
];

export function CategoryChips({ selected, onChange }: CategoryChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, gap: 14, alignItems: 'center' }}
    >
      <Chip label="Todos" active={selected === null} onPress={() => onChange(null)} />
      {CATEGORIES.map((c) => (
        <Chip
          key={c}
          label={CATEGORIA_LABEL[c]}
          active={selected === c}
          onPress={() => onChange(c)}
        />
      ))}
    </ScrollView>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className="active:opacity-70">
      <Text
        className={[
          active ? 'font-semibold text-base text-brand-500' : 'font-medium text-sm text-ink-400',
        ].join(' ')}
      >
        {label}
      </Text>
    </Pressable>
  );
}
