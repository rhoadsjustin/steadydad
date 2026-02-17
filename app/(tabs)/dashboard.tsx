import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Modal, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, Redirect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import type { AppThemeColors } from '@/constants/colors';
import { useBaby } from '@/lib/BabyContext';
import { buildDashboardSnapshot } from '@/lib/dashboardSnapshot';
import { getBabyAge, getRelativeTime, getSleepDuration } from '@/lib/helpers';
import { useAppTheme } from '@/lib/use-app-theme';

type ModalType = 'feed' | 'diaper' | 'mood' | null;

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const { profile, events, isLoading, onboardingDone, logEvent } = useBaby();
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top + webTopInset }]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!onboardingDone || !profile) {
    return <Redirect href="/onboarding/welcome" />;
  }

  const snapshot = buildDashboardSnapshot(profile, events);
  const { isSleeping, lastFeedAt, lastDiaperAt, lastSleepAt, sleepStartedAt, sleepStatus } = snapshot;

  const handleQuickAction = (type: ModalType | 'sleep') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (type === 'sleep') {
      handleSleepToggle();
    } else {
      setActiveModal(type);
    }
  };

  const handleSleepToggle = async () => {
    if (isSleeping) {
      await logEvent('sleep_end', JSON.stringify({ note: '' }));
    } else {
      await logEvent('sleep_start', JSON.stringify({ note: '' }));
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleFeed = async (type: 'breast_milk' | 'formula' | 'solid') => {
    await logEvent('feed', JSON.stringify({ type }));
    setActiveModal(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleDiaper = async (kind: 'wet' | 'dirty' | 'both') => {
    await logEvent('diaper', JSON.stringify({ kind }));
    setActiveModal(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleMood = async (mood: 'happy' | 'fussy' | 'crying' | 'calm') => {
    await logEvent('mood', JSON.stringify({ mood }));
    setActiveModal(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, Dad</Text>
            <Text style={styles.babyName}>{snapshot.babyName}</Text>
            <Text style={styles.babyAge}>{getBabyAge(profile.birthDate)}</Text>
          </View>
          <Pressable
            onPress={() => router.push('/helper')}
            style={({ pressed }) => [styles.helperButton, pressed && styles.pressed]}
          >
            <Ionicons name="help-circle" size={22} color={colors.white} />
          </Pressable>
        </View>

        <View style={styles.statusCards}>
          <StatusCard
            icon="baby-bottle"
            iconFamily="material-community"
            label="Last Feed"
            value={lastFeedAt ? getRelativeTime(lastFeedAt) : 'No feeds yet'}
            color={colors.feed}
            styles={styles}
          />
          <StatusCard
            icon="water-outline"
            iconFamily="ionicons"
            label="Last Diaper"
            value={lastDiaperAt ? getRelativeTime(lastDiaperAt) : 'No diapers yet'}
            color={colors.diaper}
            styles={styles}
          />
        </View>

        <View style={styles.sleepCard}>
          <View style={styles.sleepCardInner}>
            <View style={styles.sleepIconContainer}>
              <Ionicons
                name={isSleeping ? 'moon' : 'sunny-outline'}
                size={24}
                color={colors.sleep}
              />
            </View>
            <View style={styles.sleepInfo}>
              <Text style={styles.sleepLabel}>Sleep Status</Text>
              <Text style={styles.sleepValue}>
                {sleepStatus === 'sleeping' && sleepStartedAt
                  ? `Sleeping for ${getSleepDuration(sleepStartedAt)}`
                  : sleepStatus === 'awake' && lastSleepAt
                    ? `Awake \u00B7 Last sleep ${getRelativeTime(lastSleepAt)}`
                    : 'No sleep logged yet'}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <QuickActionButton
            icon="baby-bottle"
            iconFamily="material-community"
            label="Feed"
            color={colors.feed}
            onPress={() => handleQuickAction('feed')}
            styles={styles}
          />
          <QuickActionButton
            icon="water-outline"
            iconFamily="ionicons"
            label="Diaper"
            color={colors.diaper}
            onPress={() => handleQuickAction('diaper')}
            styles={styles}
          />
          <QuickActionButton
            icon={isSleeping ? 'sunny-outline' : 'moon-outline'}
            iconFamily="ionicons"
            label={isSleeping ? 'Wake' : 'Sleep'}
            color={colors.sleep}
            onPress={() => handleQuickAction('sleep')}
            styles={styles}
          />
          <QuickActionButton
            icon="happy-outline"
            iconFamily="ionicons"
            label="Mood"
            color={colors.mood}
            onPress={() => handleQuickAction('mood')}
            styles={styles}
          />
        </View>

        <Pressable
          onPress={() => router.push('/helper')}
          style={({ pressed }) => [styles.helperBanner, pressed && styles.pressed]}
        >
          <View style={styles.helperBannerContent}>
            <Ionicons name="help-buoy-outline" size={28} color={colors.primary} />
            <View style={styles.helperBannerText}>
              <Text style={styles.helperBannerTitle}>What should I do?</Text>
              <Text style={styles.helperBannerSub}>Step-by-step guides for common situations</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        </Pressable>
      </ScrollView>

      <FeedModal visible={activeModal === 'feed'} onClose={() => setActiveModal(null)} onSelect={handleFeed} colors={colors} styles={styles} />
      <DiaperModal visible={activeModal === 'diaper'} onClose={() => setActiveModal(null)} onSelect={handleDiaper} colors={colors} styles={styles} />
      <MoodModal visible={activeModal === 'mood'} onClose={() => setActiveModal(null)} onSelect={handleMood} colors={colors} styles={styles} />
    </View>
  );
}

function StatusCard({ icon, iconFamily, label, value, color, styles }: {
  icon: string;
  iconFamily: string;
  label: string;
  value: string;
  color: string;
  styles: ReturnType<typeof createStyles>;
}) {
  const IconComponent = iconFamily === 'material-community' ? MaterialCommunityIcons : Ionicons;
  return (
    <View style={styles.statusCard}>
      <View style={[styles.statusIconContainer, { backgroundColor: color + '15' }]}>
        <IconComponent name={icon as any} size={22} color={color} />
      </View>
      <Text style={styles.statusLabel}>{label}</Text>
      <Text style={styles.statusValue}>{value}</Text>
    </View>
  );
}

function QuickActionButton({ icon, iconFamily, label, color, onPress, styles }: {
  icon: string;
  iconFamily: string;
  label: string;
  color: string;
  onPress: () => void;
  styles: ReturnType<typeof createStyles>;
}) {
  const IconComponent = iconFamily === 'material-community' ? MaterialCommunityIcons : Ionicons;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.quickActionButton, pressed && styles.quickActionPressed]}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: color + '15' }]}>
        <IconComponent name={icon as any} size={28} color={color} />
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </Pressable>
  );
}

function FeedModal({ visible, onClose, onSelect, colors, styles }: {
  visible: boolean;
  onClose: () => void;
  onSelect: (type: 'breast_milk' | 'formula' | 'solid') => void;
  colors: AppThemeColors;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalSheet} onPress={() => {}}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Log Feed</Text>
          <ModalOption icon="water-outline" label="Breast Milk" onPress={() => onSelect('breast_milk')} color={colors.feed} colors={colors} styles={styles} />
          <ModalOption icon="flask-outline" label="Formula" onPress={() => onSelect('formula')} color={colors.feed} colors={colors} styles={styles} />
          <ModalOption icon="restaurant-outline" label="Solid Food" onPress={() => onSelect('solid')} color={colors.feed} colors={colors} styles={styles} />
          <Pressable onPress={onClose} style={styles.modalCancel}>
            <Text style={styles.modalCancelText}>Cancel</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function DiaperModal({ visible, onClose, onSelect, colors, styles }: {
  visible: boolean;
  onClose: () => void;
  onSelect: (kind: 'wet' | 'dirty' | 'both') => void;
  colors: AppThemeColors;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalSheet} onPress={() => {}}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Log Diaper</Text>
          <ModalOption icon="water-outline" label="Wet" onPress={() => onSelect('wet')} color={colors.diaper} colors={colors} styles={styles} />
          <ModalOption icon="ellipse" label="Dirty" onPress={() => onSelect('dirty')} color={colors.diaper} colors={colors} styles={styles} />
          <ModalOption icon="swap-horizontal-outline" label="Both" onPress={() => onSelect('both')} color={colors.diaper} colors={colors} styles={styles} />
          <Pressable onPress={onClose} style={styles.modalCancel}>
            <Text style={styles.modalCancelText}>Cancel</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function MoodModal({ visible, onClose, onSelect, colors, styles }: {
  visible: boolean;
  onClose: () => void;
  onSelect: (mood: 'happy' | 'fussy' | 'crying' | 'calm') => void;
  colors: AppThemeColors;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalSheet} onPress={() => {}}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Log Mood</Text>
          <ModalOption icon="happy-outline" label="Happy" onPress={() => onSelect('happy')} color={colors.success} colors={colors} styles={styles} />
          <ModalOption icon="sad-outline" label="Fussy" onPress={() => onSelect('fussy')} color={colors.warning} colors={colors} styles={styles} />
          <ModalOption icon="alert-circle-outline" label="Crying" onPress={() => onSelect('crying')} color={colors.danger} colors={colors} styles={styles} />
          <ModalOption icon="leaf-outline" label="Calm" onPress={() => onSelect('calm')} color={colors.sleep} colors={colors} styles={styles} />
          <Pressable onPress={onClose} style={styles.modalCancel}>
            <Text style={styles.modalCancelText}>Cancel</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function ModalOption({ icon, label, onPress, color, colors, styles }: {
  icon: string;
  label: string;
  onPress: () => void;
  color: string;
  colors: AppThemeColors;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.modalOption, pressed && { backgroundColor: colors.surfaceSecondary }]}
    >
      <View style={[styles.modalOptionIcon, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon as any} size={22} color={color} />
      </View>
      <Text style={styles.modalOptionLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
    </Pressable>
  );
}

const createStyles = (colors: AppThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 16,
    color: colors.textSecondary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  greeting: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  babyName: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 28,
    color: colors.text,
    letterSpacing: -0.5,
  },
  babyAge: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  helperButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  statusCards: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statusCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  statusIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusLabel: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statusValue: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: colors.text,
  },
  sleepCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 28,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  sleepCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sleepIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.sleep + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  sleepInfo: {
    flex: 1,
  },
  sleepLabel: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  sleepValue: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
    color: colors.text,
  },
  sectionTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
    color: colors.text,
    marginBottom: 14,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  quickActionButton: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  quickActionIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionLabel: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: colors.text,
  },
  helperBanner: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  helperBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  helperBannerText: {
    marginLeft: 14,
    flex: 1,
  },
  helperBannerTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: colors.text,
  },
  helperBannerSub: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 12,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderLight,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 20,
    color: colors.text,
    marginBottom: 16,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderRadius: 12,
  },
  modalOptionIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  modalOptionLabel: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  modalCancel: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  modalCancelText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 16,
    color: colors.textSecondary,
  },
});
