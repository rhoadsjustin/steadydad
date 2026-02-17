import { ColorSchemeName } from 'react-native';

const shared = {
  white: '#FFFFFF',
};

export type AppThemeColors = {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accent: string;
  accentLight: string;
  success: string;
  warning: string;
  danger: string;
  background: string;
  surface: string;
  surfaceSecondary: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  borderLight: string;
  shadow: string;
  overlay: string;
  white: string;
  feed: string;
  diaper: string;
  sleep: string;
  mood: string;
};

export const lightColors: AppThemeColors = {
  primary: '#2B4C7E',
  primaryLight: '#3D6098',
  primaryDark: '#1E3A5F',
  accent: '#E8913A',
  accentLight: '#F5A623',
  success: '#4CAF50',
  warning: '#FF9800',
  danger: '#E53935',
  background: '#F7F9FC',
  surface: '#FFFFFF',
  surfaceSecondary: '#EEF2F7',
  text: '#1A2138',
  textSecondary: '#6B7A99',
  textTertiary: '#9EAFC4',
  border: '#E2E8F0',
  borderLight: '#F0F4F8',
  shadow: 'rgba(43, 76, 126, 0.08)',
  overlay: 'rgba(0, 0, 0, 0.5)',
  feed: '#4A90D9',
  diaper: '#8B6FC0',
  sleep: '#5B8DB8',
  mood: '#E8913A',
  ...shared,
};

export const darkColors: AppThemeColors = {
  primary: '#7DA8E2',
  primaryLight: '#99BCEB',
  primaryDark: '#5A84C0',
  accent: '#F2A65A',
  accentLight: '#FFC178',
  success: '#5CCB67',
  warning: '#FFB74D',
  danger: '#FF6F6F',
  background: '#0F1526',
  surface: '#161F33',
  surfaceSecondary: '#1E2A42',
  text: '#EFF4FF',
  textSecondary: '#B5C3DE',
  textTertiary: '#8C9AB5',
  border: '#2A3A58',
  borderLight: '#334768',
  shadow: 'rgba(0, 0, 0, 0.32)',
  overlay: 'rgba(0, 0, 0, 0.7)',
  feed: '#72B9FF',
  diaper: '#B59AF4',
  sleep: '#89B6DC',
  mood: '#F4B56A',
  ...shared,
};

export function getThemeColors(colorScheme?: ColorSchemeName): AppThemeColors {
  return colorScheme === 'dark' ? darkColors : lightColors;
}

const Colors = lightColors;

export default Colors;
