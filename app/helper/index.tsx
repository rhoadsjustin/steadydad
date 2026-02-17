import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { useBaby } from '@/lib/BabyContext';
import { getRelativeTime } from '@/lib/helpers';
import { helperTopics } from '@/lib/helper-topics';

export default function HelperIndexScreen() {
  const insets = useSafeAreaInsets();
  const { getLastEventByType, getLastSleepEvent } = useBaby();

  const lastFeed = getLastEventByType('feed');
  const lastDiaper = getLastEventByType('diaper');
  const lastSleep = getLastSleepEvent();
  const isSleeping = lastSleep?.type === 'sleep_start';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.contextBanner}>
        <Text style={styles.contextTitle}>Current Status</Text>
        <View style={styles.contextRow}>
          <ContextItem
            icon="restaurant-outline"
            label="Fed"
            value={lastFeed ? getRelativeTime(lastFeed.timestamp) : 'No data'}
          />
          <ContextItem
            icon="water-outline"
            label="Diaper"
            value={lastDiaper ? getRelativeTime(lastDiaper.timestamp) : 'No data'}
          />
          <ContextItem
            icon="moon-outline"
            label="Sleep"
            value={isSleeping ? 'Sleeping' : lastSleep ? getRelativeTime(lastSleep.timestamp) : 'No data'}
          />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Choose a topic</Text>

      {helperTopics.map((topic) => (
        <Pressable
          key={topic.id}
          onPress={() => router.push({ pathname: '/helper/[topic]', params: { topic: topic.id } })}
          style={({ pressed }) => [styles.topicCard, pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }]}
        >
          <View style={styles.topicIcon}>
            <Ionicons name={topic.icon as any} size={26} color={Colors.primary} />
          </View>
          <View style={styles.topicContent}>
            <Text style={styles.topicTitle}>{topic.title}</Text>
            <Text style={styles.topicDescription}>{topic.description}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
        </Pressable>
      ))}
    </ScrollView>
  );
}

function ContextItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.contextItem}>
      <Ionicons name={icon as any} size={18} color={Colors.primary} />
      <Text style={styles.contextLabel}>{label}</Text>
      <Text style={styles.contextValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  contextBanner: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 1,
  },
  contextTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  contextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contextItem: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  contextLabel: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: Colors.textSecondary,
  },
  contextValue: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: Colors.text,
  },
  sectionTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: Colors.text,
    marginBottom: 14,
  },
  topicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 10,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 1,
  },
  topicIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.primary + '12',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  topicContent: {
    flex: 1,
  },
  topicTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 16,
    color: Colors.text,
  },
  topicDescription: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
