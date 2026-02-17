import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable, Modal, TextInput, Platform, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useBaby } from '@/lib/BabyContext';
import { formatDate, formatTime } from '@/lib/helpers';
import { Milestone } from '@/lib/types';

export default function MilestonesScreen() {
  const insets = useSafeAreaInsets();
  const { milestones, addMilestone } = useBaby();
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    await addMilestone(title.trim(), Date.now(), note.trim() || undefined, photoUri);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTitle('');
    setNote('');
    setPhotoUri(undefined);
    setShowAdd(false);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <View style={styles.headerRow}>
        <Text style={styles.screenTitle}>Milestones</Text>
        <Pressable
          onPress={() => setShowAdd(true)}
          style={({ pressed }) => [styles.addButton, pressed && { opacity: 0.8 }]}
        >
          <Ionicons name="add" size={24} color={Colors.white} />
        </Pressable>
      </View>

      {milestones.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="star-outline" size={48} color={Colors.textTertiary} />
          <Text style={styles.emptyTitle}>No milestones yet</Text>
          <Text style={styles.emptySubtitle}>Tap + to log your baby's first milestone</Text>
        </View>
      ) : (
        <FlatList
          data={milestones}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100, paddingHorizontal: 20 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setSelectedMilestone(item)}
              style={({ pressed }) => [styles.milestoneCard, pressed && { opacity: 0.9 }]}
            >
              {item.photoUri && (
                <Image source={{ uri: item.photoUri }} style={styles.milestonePhoto} contentFit="cover" />
              )}
              <View style={styles.milestoneContent}>
                <Text style={styles.milestoneTitle}>{item.title}</Text>
                <Text style={styles.milestoneDate}>
                  {formatDate(item.timestamp)} at {formatTime(item.timestamp)}
                </Text>
                {!!item.note && <Text style={styles.milestoneNote} numberOfLines={2}>{item.note}</Text>}
              </View>
            </Pressable>
          )}
        />
      )}

      <Modal visible={showAdd} transparent animationType="slide" onRequestClose={() => setShowAdd(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowAdd(false)}>
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>New Milestone</Text>

            <TextInput
              style={styles.input}
              placeholder="What milestone is this?"
              placeholderTextColor={Colors.textTertiary}
              value={title}
              onChangeText={setTitle}
              autoFocus
            />

            <TextInput
              style={[styles.input, styles.noteInput]}
              placeholder="Add a note (optional)"
              placeholderTextColor={Colors.textTertiary}
              value={note}
              onChangeText={setNote}
              multiline
            />

            <Pressable
              onPress={handlePickImage}
              style={({ pressed }) => [styles.photoButton, pressed && { opacity: 0.8 }]}
            >
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.photoPreview} contentFit="cover" />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Ionicons name="camera-outline" size={28} color={Colors.textTertiary} />
                  <Text style={styles.photoPlaceholderText}>Add Photo</Text>
                </View>
              )}
            </Pressable>

            <Pressable
              onPress={handleSave}
              style={({ pressed }) => [
                styles.saveButton,
                !title.trim() && styles.saveButtonDisabled,
                pressed && { opacity: 0.9 },
              ]}
              disabled={!title.trim()}
            >
              <Text style={styles.saveButtonText}>Save Milestone</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={!!selectedMilestone}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedMilestone(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setSelectedMilestone(null)}>
          <Pressable style={styles.detailSheet} onPress={() => {}}>
            <View style={styles.modalHandle} />
            {selectedMilestone?.photoUri && (
              <Image
                source={{ uri: selectedMilestone.photoUri }}
                style={styles.detailPhoto}
                contentFit="cover"
              />
            )}
            <Text style={styles.detailTitle}>{selectedMilestone?.title}</Text>
            <Text style={styles.detailDate}>
              {selectedMilestone ? `${formatDate(selectedMilestone.timestamp)} at ${formatTime(selectedMilestone.timestamp)}` : ''}
            </Text>
            {!!selectedMilestone?.note && (
              <Text style={styles.detailNote}>{selectedMilestone.note}</Text>
            )}
            <Pressable
              onPress={() => setSelectedMilestone(null)}
              style={styles.closeDetailButton}
            >
              <Text style={styles.closeDetailText}>Close</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 16,
  },
  screenTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 28,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
    color: Colors.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 6,
    textAlign: 'center',
  },
  milestoneCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  milestonePhoto: {
    width: '100%',
    height: 180,
  },
  milestoneContent: {
    padding: 16,
  },
  milestoneTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 17,
    color: Colors.text,
  },
  milestoneDate: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  milestoneNote: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.surface,
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
    backgroundColor: Colors.borderLight,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 20,
    color: Colors.text,
    marginBottom: 20,
  },
  input: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 14,
    padding: 16,
    fontFamily: 'Nunito_500Medium',
    fontSize: 16,
    color: Colors.text,
    marginBottom: 12,
  },
  noteInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  photoButton: {
    marginBottom: 16,
    borderRadius: 14,
    overflow: 'hidden',
  },
  photoPreview: {
    width: '100%',
    height: 160,
    borderRadius: 14,
  },
  photoPlaceholder: {
    height: 100,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  photoPlaceholderText: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 14,
    color: Colors.textTertiary,
    marginTop: 6,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.4,
  },
  saveButtonText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: Colors.white,
  },
  detailSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 12,
    maxHeight: '80%',
  },
  detailPhoto: {
    width: '100%',
    height: 240,
    borderRadius: 14,
    marginBottom: 16,
  },
  detailTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 24,
    color: Colors.text,
    marginBottom: 4,
  },
  detailDate: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  detailNote: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: 16,
  },
  closeDetailButton: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 8,
  },
  closeDetailText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 16,
    color: Colors.textSecondary,
  },
});
