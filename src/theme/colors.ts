export interface ThemeColors {
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textMuted: string;
  primary: string;
  primaryText: string;
  success: string;
  warning: string;
  danger: string;
}

export const LIGHT_COLORS: ThemeColors = {
  background: '#F1F5F9',
  surface: '#FFFFFF',
  surfaceAlt: '#E2E8F0',
  border: '#CBD5E1',
  text: '#0F172A',
  textMuted: '#64748B',
  primary: '#1D4ED8',
  primaryText: '#FFFFFF',
  success: '#16A34A',
  warning: '#D97706',
  danger: '#DC2626',
};

export const DARK_COLORS: ThemeColors = {
  background: '#0B1120',
  surface: '#111827',
  surfaceAlt: '#1E293B',
  border: '#334155',
  text: '#F8FAFC',
  textMuted: '#94A3B8',
  primary: '#3B82F6',
  primaryText: '#FFFFFF',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
};
