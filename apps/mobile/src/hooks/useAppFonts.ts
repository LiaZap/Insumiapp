import {
  useFonts as useFigtree,
  Figtree_400Regular,
  Figtree_500Medium,
  Figtree_600SemiBold,
  Figtree_700Bold,
} from '@expo-google-fonts/figtree';
import { Sora_700Bold } from '@expo-google-fonts/sora';

export function useAppFonts() {
  const [loaded] = useFigtree({
    Figtree_400Regular,
    Figtree_500Medium,
    Figtree_600SemiBold,
    Figtree_700Bold,
    Sora_700Bold,
  });
  return loaded;
}
