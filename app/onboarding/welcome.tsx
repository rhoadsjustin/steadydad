import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { AppThemeColors } from '@/constants/colors';
import { useAppTheme } from '@/lib/use-app-theme';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;
  const gradientColors: [string, string, string] = isDark
    ? ['#0F1526', '#13203A', '#1A2A4A']
    : ['#F7F9FC', '#E8EDF4', '#D6E0F0'];

  return (
    <LinearGradient
      colors={gradientColors}
      style={styles.container}
    >
      <View style={[styles.content, { paddingTop: insets.top + webTopInset + 60 }]}>
        <View style={styles.iconContainer}>
          <View style={styles.iconBg}>
            <Ionicons name="shield-checkmark" size={56} color={colors.primary} />
          </View>
        </View>

        <Text style={styles.title}>SteadyDad</Text>
        <Text style={styles.subtitle}>Your baby companion for the early days</Text>

        <View style={styles.features}>
          <FeatureItem icon="flash-outline" text="One-tap activity tracking" colors={colors} styles={styles} />
          <FeatureItem icon="bulb-outline" text="Daily tips just for dads" colors={colors} styles={styles} />
          <FeatureItem icon="help-buoy-outline" text="Guided help when you need it" colors={colors} styles={styles} />
          <FeatureItem icon="cloud-offline-outline" text="Works completely offline" colors={colors} styles={styles} />
        </View>
      </View>

      <View style={[styles.bottomArea, { paddingBottom: insets.bottom + webBottomInset + 20 }]}>
        <Pressable
          onPress={() => router.push('/onboarding/baby-info')}
          style={({ pressed }) => [styles.startButton, pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }]}
        >
          <Text style={styles.startButtonText}>Get Started</Text>
          <Ionicons name="arrow-forward" size={20} color={colors.white} />
        </Pressable>
      </View>
    </LinearGradient>
  );
}

function FeatureItem({
  icon,
  text,
  colors,
  styles,
}: {
  icon: string;
  text: string;
  colors: AppThemeColors;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.featureRow}>
      <View style={styles.featureIcon}>
        <Ionicons name={icon as any} size={22} color={colors.primary} />
      </View>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const createStyles = (colors: AppThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  iconBg: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: colors.primary + '12',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 36,
    color: colors.primary,
    textAlign: 'center',
    letterSpacing: -1,
  },
  subtitle: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 17,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 44,
  },
  features: {
    gap: 18,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  featureText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  bottomArea: {
    paddingHorizontal: 30,
  },
  startButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
    color: colors.white,
  },
});
