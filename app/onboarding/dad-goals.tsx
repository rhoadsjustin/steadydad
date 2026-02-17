import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { saveDadGoals } from '@/lib/storage';

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
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>

        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, styles.stepDotActive]} />
          <View style={[styles.stepDot, styles.stepDotActive]} />
          <View style={styles.stepDot} />
        </View>

        <Text style={styles.title}>What matters to you?</Text>
        <Text style={styles.subtitle}>Select what you'd like help with (optional)</Text>

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
                    color={isSelected ? Colors.primary : Colors.textSecondary}
                  />
                </View>
                <Text style={[styles.goalLabel, isSelected && styles.goalLabelSelected]}>
                  {goal.label}
                </Text>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
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
          <Ionicons name="arrow-forward" size={20} color={Colors.white} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    backgroundColor: Colors.border,
  },
  stepDotActive: {
    backgroundColor: Colors.primary,
  },
  title: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 28,
    color: Colors.text,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 28,
  },
  goals: {
    gap: 10,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 1,
  },
  goalCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '08',
  },
  goalIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  goalIconSelected: {
    backgroundColor: Colors.primary + '15',
  },
  goalLabel: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 15,
    color: Colors.text,
    flex: 1,
  },
  goalLabelSelected: {
    color: Colors.primary,
  },
  bottomArea: {
    paddingHorizontal: 30,
  },
  nextButton: {
    backgroundColor: Colors.primary,
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
    color: Colors.white,
  },
});
