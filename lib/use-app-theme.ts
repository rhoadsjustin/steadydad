import { useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { getThemeColors } from '@/constants/colors';

export function useAppTheme() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const colors = useMemo(() => getThemeColors(colorScheme), [colorScheme]);

  return {
    colors,
    colorScheme,
    isDark,
  };
}
