import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { AppThemeColors } from '@/constants/colors';
import { helperTopics } from '@/lib/helper-topics';
import { useAppTheme } from '@/lib/use-app-theme';

export default function HelperTopicScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const { topic: topicId } = useLocalSearchParams<{ topic: string }>();
  const topic = helperTopics.find((t) => t.id === topicId);
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());

  if (!topic) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Topic not found</Text>
      </View>
    );
  }

  const toggleStep = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCheckedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const allChecked = checkedSteps.size === topic.steps.length;
  const progress = topic.steps.length > 0 ? checkedSteps.size / topic.steps.length : 0;

  return (
    <>
      <Stack.Screen options={{ title: topic.title }} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {checkedSteps.size} of {topic.steps.length} steps
          </Text>
        </View>

        <View style={styles.steps}>
          {topic.steps.map((step, index) => {
            const isChecked = checkedSteps.has(index);
            return (
              <Pressable
                key={index}
                onPress={() => toggleStep(index)}
                style={[styles.stepCard, isChecked && styles.stepCardChecked]}
              >
                <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                  {isChecked && <Ionicons name="checkmark" size={16} color={colors.white} />}
                </View>
                <Text style={[styles.stepText, isChecked && styles.stepTextChecked]}>
                  {step}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {allChecked && (
          <View style={styles.doneContainer}>
            <Ionicons name="checkmark-circle" size={40} color={colors.success} />
            <Text style={styles.doneTitle}>All steps completed!</Text>
            <Text style={styles.doneSubtitle}>
              You&apos;ve worked through everything. If things still aren&apos;t settling, don&apos;t hesitate to call your pediatrician.
            </Text>
          </View>
        )}
      </ScrollView>
    </>
  );
}

const createStyles = (colors: AppThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  errorText: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 3,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 3,
  },
  progressText: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 13,
    color: colors.textSecondary,
  },
  steps: {
    gap: 8,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 1,
  },
  stepCardChecked: {
    backgroundColor: colors.success + '08',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  stepText: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 15,
    color: colors.text,
    flex: 1,
    lineHeight: 22,
  },
  stepTextChecked: {
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  doneContainer: {
    alignItems: 'center',
    padding: 28,
    marginTop: 20,
    backgroundColor: colors.success + '10',
    borderRadius: 16,
  },
  doneTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
    color: colors.text,
    marginTop: 12,
  },
  doneSubtitle: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});
