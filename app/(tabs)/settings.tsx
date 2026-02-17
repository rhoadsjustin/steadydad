import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, TextInput, Modal, Alert, Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import * as Haptics from 'expo-haptics';
import type { AppThemeColors } from '@/constants/colors';
import { useBaby } from '@/lib/BabyContext';
import { buildDashboardSnapshot } from '@/lib/dashboardSnapshot';
import { exportAllData } from '@/lib/storage';
import { clearIOSGlanceables, isIOSGlanceablesEnabled, syncIOSGlanceables } from '@/lib/voltra';
import { useAppTheme } from '@/lib/use-app-theme';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const { profile, events, onboardingDone, updateProfile, resetAll } = useBaby();
  const [editName, setEditName] = useState(profile?.name || '');
  const [editBirthDate, setEditBirthDate] = useState(profile?.birthDate || '');
  const [showEdit, setShowEdit] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const handleSaveProfile = async () => {
    if (!editName.trim()) return;
    await updateProfile({ name: editName.trim(), birthDate: editBirthDate });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowEdit(false);
  };

  const handleExport = async () => {
    try {
      const data = await exportAllData();
      const json = JSON.stringify(data, null, 2);

      if (Platform.OS === 'web') {
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'steadydad-export.json';
        a.click();
        URL.revokeObjectURL(url);
        return;
      }

      const fileUri = FileSystem.cacheDirectory + 'steadydad-export.json';
      await FileSystem.writeAsStringAsync(fileUri, json);
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'Export SteadyDad Data',
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const handleReset = async () => {
    await resetAll();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setShowResetConfirm(false);
  };

  const handleSyncGlanceables = async () => {
    if (Platform.OS !== 'ios') return;

    if (!isIOSGlanceablesEnabled()) {
      Alert.alert('iOS Glanceables Disabled', 'Set EXPO_PUBLIC_ENABLE_IOS_GLANCEABLES=true to enable sync.');
      return;
    }

    try {
      if (!onboardingDone || !profile) {
        await clearIOSGlanceables();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Cleared', 'Live Activity and widget were cleared.');
        return;
      }

      const snapshot = buildDashboardSnapshot(profile, events);
      await syncIOSGlanceables(snapshot);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Synced', 'Live Activity and widget were updated from current dashboard data.');
    } catch (err) {
      console.error('Failed to sync glanceables:', err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Sync Failed', 'Could not update iOS glanceables. Check Metro/native logs for details.');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <Text style={styles.screenTitle}>Settings</Text>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100, paddingHorizontal: 20 }}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Baby Profile</Text>
          <View style={styles.profileCard}>
            <View style={styles.profileInfo}>
              <View style={styles.profileAvatar}>
                <Ionicons name="person" size={24} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.profileName}>{profile?.name || 'Baby'}</Text>
                <Text style={styles.profileDate}>Born {profile?.birthDate || 'N/A'}</Text>
              </View>
            </View>
            <Pressable
              onPress={() => {
                setEditName(profile?.name || '');
                setEditBirthDate(profile?.birthDate || '');
                setShowEdit(true);
              }}
              style={({ pressed }) => [styles.editButton, pressed && { opacity: 0.7 }]}
            >
              <Ionicons name="create-outline" size={20} color={colors.primary} />
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          <SettingsRow
            icon="download-outline"
            label="Export Data"
            subtitle="Save all data as a JSON file"
            onPress={handleExport}
            colors={colors}
            styles={styles}
          />
          {Platform.OS === 'ios' && (
            <SettingsRow
              icon="sync-outline"
              label="Sync iOS Glanceables"
              subtitle="Refresh Live Activity and widget now"
              onPress={handleSyncGlanceables}
              colors={colors}
              styles={styles}
            />
          )}
          <SettingsRow
            icon="trash-outline"
            label="Reset All Data"
            subtitle="Delete everything and start over"
            onPress={() => setShowResetConfirm(true)}
            danger
            colors={colors}
            styles={styles}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.aboutCard}>
            <Text style={styles.aboutAppName}>SteadyDad</Text>
            <Text style={styles.aboutVersion}>Version 1.0.0</Text>
            <Text style={styles.aboutDescription}>
              Built for first-time dads. Track, learn, and thrive.
            </Text>
          </View>
        </View>
      </ScrollView>

      <Modal visible={showEdit} transparent animationType="slide" onRequestClose={() => setShowEdit(false)}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setShowEdit(false)}>
            <Pressable style={styles.modalSheet} onPress={() => {}}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <Text style={styles.inputLabel}>Baby&apos;s Name</Text>
              <TextInput
                style={styles.input}
                value={editName}
                onChangeText={setEditName}
                placeholder="Enter name"
                placeholderTextColor={colors.textTertiary}
              />
              <Text style={styles.inputLabel}>Birth Date (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                value={editBirthDate}
                onChangeText={setEditBirthDate}
                placeholder="2025-01-15"
                placeholderTextColor={colors.textTertiary}
                keyboardType="numbers-and-punctuation"
              />
              <Pressable
                onPress={handleSaveProfile}
                style={({ pressed }) => [styles.saveButton, pressed && { opacity: 0.9 }]}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={showResetConfirm} transparent animationType="fade" onRequestClose={() => setShowResetConfirm(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowResetConfirm(false)}>
          <View style={styles.confirmDialog}>
            <Ionicons name="warning-outline" size={40} color={colors.danger} />
            <Text style={styles.confirmTitle}>Reset All Data?</Text>
            <Text style={styles.confirmMessage}>
              This will permanently delete all your data including events, milestones, and baby profile. This cannot be undone.
            </Text>
            <View style={styles.confirmButtons}>
              <Pressable
                onPress={() => setShowResetConfirm(false)}
                style={({ pressed }) => [styles.confirmButton, styles.confirmCancel, pressed && { opacity: 0.8 }]}
              >
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleReset}
                style={({ pressed }) => [styles.confirmButton, styles.confirmDelete, pressed && { opacity: 0.8 }]}
              >
                <Text style={styles.confirmDeleteText}>Delete Everything</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

function SettingsRow({
  icon,
  label,
  subtitle,
  onPress,
  danger,
  colors,
  styles,
}: {
  icon: string;
  label: string;
  subtitle: string;
  onPress: () => void;
  danger?: boolean;
  colors: AppThemeColors;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.settingsRow, pressed && { backgroundColor: colors.surfaceSecondary }]}
    >
      <View style={[styles.settingsRowIcon, danger && { backgroundColor: colors.danger + '15' }]}>
        <Ionicons name={icon as any} size={20} color={danger ? colors.danger : colors.primary} />
      </View>
      <View style={styles.settingsRowContent}>
        <Text style={[styles.settingsRowLabel, danger && { color: colors.danger }]}>{label}</Text>
        <Text style={styles.settingsRowSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
    </Pressable>
  );
}

const createStyles = (colors: AppThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 28,
    color: colors.text,
    marginBottom: 16,
    marginTop: 16,
    paddingHorizontal: 20,
    letterSpacing: -0.5,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 1,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
    color: colors.text,
  },
  profileDate: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 8,
  },
  settingsRowIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  settingsRowContent: {
    flex: 1,
  },
  settingsRowLabel: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 16,
    color: colors.text,
  },
  settingsRowSubtitle: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  aboutCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  aboutAppName: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 22,
    color: colors.primary,
  },
  aboutVersion: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  aboutDescription: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
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
    marginBottom: 20,
  },
  inputLabel: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 14,
    padding: 16,
    fontFamily: 'Nunito_500Medium',
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  saveButtonText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: colors.white,
  },
  confirmDialog: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 28,
    marginHorizontal: 30,
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 'auto',
    marginTop: 'auto',
  },
  confirmTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 20,
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  confirmMessage: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmCancel: {
    backgroundColor: colors.surfaceSecondary,
  },
  confirmCancelText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 15,
    color: colors.text,
  },
  confirmDelete: {
    backgroundColor: colors.danger,
  },
  confirmDeleteText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 15,
    color: colors.white,
  },
});
