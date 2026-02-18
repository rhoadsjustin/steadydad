import Constants from 'expo-constants';

type LegalConfig = {
  privacyPolicyUrl?: string;
  supportUrl?: string;
  supportEmail?: string;
};

const legalConfig = (Constants.expoConfig?.extra?.legal ?? {}) as LegalConfig;

export const PRIVACY_POLICY_URL =
  process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL ??
  legalConfig.privacyPolicyUrl ??
  'https://steadydad.app/privacy';

export const SUPPORT_URL =
  process.env.EXPO_PUBLIC_SUPPORT_URL ??
  legalConfig.supportUrl ??
  'https://steadydad.app/support';

export const SUPPORT_EMAIL =
  process.env.EXPO_PUBLIC_SUPPORT_EMAIL ??
  legalConfig.supportEmail ??
  'support@steadydad.app';
