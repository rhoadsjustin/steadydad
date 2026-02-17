import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { useBaby } from '@/lib/BabyContext';

export default function BabyInfoScreen() {
  const insets = useSafeAreaInsets();
  const { saveProfile } = useBaby();
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [saving, setSaving] = useState(false);
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;

  const isValid = name.trim().length > 0 && /^\d{4}-\d{2}-\d{2}$/.test(birthDate);

  const handleNext = async () => {
    if (!isValid || saving) return;
    setSaving(true);
    try {
      await saveProfile(name.trim(), birthDate);
      router.push('/onboarding/dad-goals');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDateInput = (text: string) => {
    const cleaned = text.replace(/[^0-9-]/g, '');
    setBirthDate(cleaned);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + webTopInset + 20 }]}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>

        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, styles.stepDotActive]} />
          <View style={styles.stepDot} />
          <View style={styles.stepDot} />
        </View>

        <Text style={styles.title}>About your baby</Text>
        <Text style={styles.subtitle}>We'll use this to personalize your experience</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Baby's Name</Text>
          <TextInput
            style={styles.input}
            placeholder="What's your baby's name?"
            placeholderTextColor={Colors.textTertiary}
            value={name}
            onChangeText={setName}
            autoFocus
            returnKeyType="next"
          />

          <Text style={styles.label}>Birth Date</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={Colors.textTertiary}
            value={birthDate}
            onChangeText={handleDateInput}
            keyboardType="numbers-and-punctuation"
            maxLength={10}
          />
          <Text style={styles.hint}>Enter the date in YYYY-MM-DD format (e.g., 2025-06-15)</Text>
        </View>
      </ScrollView>

      <View style={[styles.bottomArea, { paddingBottom: insets.bottom + webBottomInset + 20 }]}>
        <Pressable
          onPress={handleNext}
          disabled={!isValid || saving}
          style={({ pressed }) => [
            styles.nextButton,
            (!isValid || saving) && styles.nextButtonDisabled,
            pressed && isValid && { opacity: 0.9, transform: [{ scale: 0.98 }] },
          ]}
        >
          <Text style={styles.nextButtonText}>{saving ? 'Saving...' : 'Continue'}</Text>
          <Ionicons name="arrow-forward" size={20} color={Colors.white} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
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
    marginBottom: 36,
  },
  form: {
    gap: 4,
  },
  label: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: Colors.text,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 18,
    fontFamily: 'Nunito_500Medium',
    fontSize: 17,
    color: Colors.text,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 1,
  },
  hint: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    color: Colors.textTertiary,
    marginTop: 6,
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
  nextButtonDisabled: {
    opacity: 0.4,
  },
  nextButtonText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
    color: Colors.white,
  },
});
