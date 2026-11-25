import { useColorScheme } from 'react-native';
import { useAppStore } from '@/store/useAppStore';
import { DARK_COLORS, LIGHT_COLORS, ThemeColors } from './colors';

export function useTheme(): { colors: ThemeColors; isDark: boolean } {
  const systemScheme = useColorScheme();
  const pref = useAppStore((s) => s.themePreference);

  const isDark =
    pref === 'dark' || (pref === 'system' && systemScheme === 'dark');

  return {
    isDark,
    colors: isDark ? DARK_COLORS : LIGHT_COLORS,
  };
}
