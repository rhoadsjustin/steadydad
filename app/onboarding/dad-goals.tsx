import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { AppThemeColors } from '@/constants/colors';
import { saveDadGoals } from '@/lib/storage';
import { useAppTheme } from '@/lib/use-app-theme';

const GOALS = [
  { id: 'track', label: 'Track feeds, diapers & sleep', icon: 'analytics-outline' },
  { id: 'learn', label: 'Learn what to expect each day', icon: 'book-outline' },
  { id: 'help', label: 'Get help when baby is fussy', icon: 'help-buoy-outline' },
  { id: 'milestones', label: 'Capture milestones & memories', icon: 'camera-outline' },
  { id: 'partner', label: 'Support my partner better', icon: 'heart-outline' },
  { id: 'confidence', label: 'Build confidence as a dad', icon: 'shield-checkmark-outline' },
];

export default function DadGoalsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const [selected, setSelected] = useState<string[]>([]);
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;

  const toggleGoal = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const handleNext = async () => {
    await saveDadGoals(selected);
    router.push('/onboarding/finish');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset + 20 }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>

        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, styles.stepDotActive]} />
          <View style={[styles.stepDot, styles.stepDotActive]} />
          <View style={styles.stepDot} />
        </View>

        <Text style={styles.title}>What matters to you?</Text>
        <Text style={styles.subtitle}>Select what you&apos;d like help with (optional)</Text>

        <View style={styles.goals}>
          {GOALS.map((goal) => {
            const isSelected = selected.includes(goal.id);
            return (
              <Pressable
                key={goal.id}
                onPress={() => toggleGoal(goal.id)}
                style={[styles.goalCard, isSelected && styles.goalCardSelected]}
              >
                <View style={[styles.goalIcon, isSelected && styles.goalIconSelected]}>
                  <Ionicons
                    name={goal.icon as any}
                    size={24}
                    color={isSelected ? colors.primary : colors.textSecondary}
                  />
                </View>
                <Text style={[styles.goalLabel, isSelected && styles.goalLabelSelected]}>
                  {goal.label}
                </Text>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.bottomArea, { paddingBottom: insets.bottom + webBottomInset + 20 }]}>
        <Pressable
          onPress={handleNext}
          style={({ pressed }) => [styles.nextButton, pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }]}
        >
          <Text style={styles.nextButtonText}>
            {selected.length > 0 ? 'Continue' : 'Skip'}
          </Text>
          <Ionicons name="arrow-forward" size={20} color={colors.white} />
        </Pressable>
      </View>
    </View>
  );
}

const createStyles = (colors: AppThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 30,
    flexGrow: 1,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    marginLeft: -8,
    marginBottom: 16,
  },
  stepIndicator: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
  },
  stepDot: {
    height: 4,
    flex: 1,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  stepDotActive: {
    backgroundColor: colors.primary,
  },
  title: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 28,
    color: colors.text,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 28,
  },
  goals: {
    gap: 10,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 1,
  },
  goalCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '08',
  },
  goalIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  goalIconSelected: {
    backgroundColor: colors.primary + '15',
  },
  goalLabel: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 15,
    color: colors.text,
    flex: 1,
  },
  goalLabelSelected: {
    color: colors.primary,
  },
  bottomArea: {
    paddingHorizontal: 30,
  },
  nextButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  nextButtonText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
    color: colors.white,
  },
});
