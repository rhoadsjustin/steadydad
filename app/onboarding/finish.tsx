import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useBaby } from '@/lib/BabyContext';

export default function FinishScreen() {
  const insets = useSafeAreaInsets();
  const { profile, completeOnboarding } = useBaby();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;

  const handleFinish = async () => {
    await completeOnboarding();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace('/(tabs)/dashboard');
  };

  return (
    <LinearGradient
      colors={['#F7F9FC', '#E8EDF4', '#D6E0F0']}
      style={styles.container}
    >
      <View style={[styles.content, { paddingTop: insets.top + webTopInset + 60 }]}>
        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, styles.stepDotActive]} />
          <View style={[styles.stepDot, styles.stepDotActive]} />
          <View style={[styles.stepDot, styles.stepDotActive]} />
        </View>

        <View style={styles.successIcon}>
          <Ionicons name="checkmark-circle" size={72} color={Colors.success} />
        </View>

        <Text style={styles.title}>You're all set!</Text>
        <Text style={styles.subtitle}>
          Welcome to SteadyDad{profile?.name ? `, ${profile.name}'s dad` : ''}.{'\n'}
          You've got this.
        </Text>

        <View style={styles.tipsContainer}>
          <TipRow icon="flash" text="Tap quick actions to log events instantly" />
          <TipRow icon="help-circle" text="Use the helper when you're unsure what to do" />
          <TipRow icon="bulb" text="Check daily tips for age-appropriate guidance" />
        </View>
      </View>

      <View style={[styles.bottomArea, { paddingBottom: insets.bottom + webBottomInset + 20 }]}>
        <Pressable
          onPress={handleFinish}
          style={({ pressed }) => [styles.finishButton, pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }]}
        >
          <Text style={styles.finishButtonText}>Let's Go</Text>
          <Ionicons name="arrow-forward" size={20} color={Colors.white} />
        </Pressable>
      </View>
    </LinearGradient>
  );
}

function TipRow({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.tipRow}>
      <View style={styles.tipIcon}>
        <Ionicons name={icon as any} size={20} color={Colors.primary} />
      </View>
      <Text style={styles.tipText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  stepIndicator: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 48,
    width: '100%',
  },
  stepDot: {
    height: 4,
    flex: 1,
    borderRadius: 2,
    backgroundColor: Colors.border,
  },
  stepDotActive: {
    backgroundColor: Colors.primary,
  },
  successIcon: {
    marginBottom: 24,
  },
  title: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 32,
    color: Colors.text,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 17,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 40,
  },
  tipsContainer: {
    width: '100%',
    gap: 14,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 14,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 1,
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primary + '12',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipText: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 15,
    color: Colors.text,
    flex: 1,
  },
  bottomArea: {
    paddingHorizontal: 30,
  },
  finishButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  finishButtonText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
    color: Colors.white,
  },
});
