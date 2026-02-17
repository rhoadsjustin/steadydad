import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { AppThemeColors } from '@/constants/colors';
import { useBaby } from '@/lib/BabyContext';
import { getDayIndex } from '@/lib/helpers';
import { getGuidanceItems, markGuidanceViewed, getViewedGuidanceIds } from '@/lib/storage';
import { GuidanceItem } from '@/lib/types';
import { useAppTheme } from '@/lib/use-app-theme';

export default function GuidanceScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const { profile } = useBaby();
  const [items, setItems] = useState<GuidanceItem[]>([]);
  const [viewedIds, setViewedIds] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const loadGuidance = React.useCallback(async () => {
    const all = await getGuidanceItems();
    const viewed = await getViewedGuidanceIds();
    setViewedIds(viewed);

    if (!profile) {
      setItems(all.slice(0, 7));
      return;
    }

    const currentDay = getDayIndex(profile.birthDate);
    const available = all.filter((i) => i.dayIndex <= currentDay);
    available.sort((a, b) => b.dayIndex - a.dayIndex);
    setItems(available);
  }, [profile]);

  useEffect(() => {
    loadGuidance();
  }, [loadGuidance]);

  const handleExpand = async (item: GuidanceItem) => {
    if (expandedId === item.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(item.id);
    if (!viewedIds.includes(item.id)) {
      await markGuidanceViewed(item.id);
      setViewedIds((prev) => [...prev, item.id]);
    }
  };

  const todayIndex = profile ? getDayIndex(profile.birthDate) : 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <Text style={styles.screenTitle}>Dad Tips</Text>
      {items.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="bulb-outline" size={48} color={colors.textTertiary} />
          <Text style={styles.emptyTitle}>Tips will appear here</Text>
          <Text style={styles.emptySubtitle}>Daily guidance based on your baby&apos;s age</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100, paddingHorizontal: 20 }}
          renderItem={({ item }) => {
            const isToday = item.dayIndex === todayIndex;
            const isViewed = viewedIds.includes(item.id);
            const isExpanded = expandedId === item.id;
            return (
              <Pressable
                onPress={() => handleExpand(item)}
                style={({ pressed }) => [
                  styles.tipCard,
                  isToday && styles.tipCardToday,
                  pressed && { opacity: 0.9 },
                ]}
              >
                <View style={styles.tipHeader}>
                  <View style={styles.tipHeaderLeft}>
                    {isToday && (
                      <View style={styles.todayBadge}>
                        <Text style={styles.todayBadgeText}>Today</Text>
                      </View>
                    )}
                    <Text style={styles.tipDay}>Day {item.dayIndex}</Text>
                  </View>
                  <View style={styles.tipHeaderRight}>
                    {isViewed && (
                      <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                    )}
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color={colors.textTertiary}
                    />
                  </View>
                </View>
                <Text style={styles.tipTitle}>{item.title}</Text>
                {isExpanded && <Text style={styles.tipBody}>{item.body}</Text>}
              </Pressable>
            );
          }}
        />
      )}
    </View>
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 18,
    color: colors.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 6,
    textAlign: 'center',
  },
  tipCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 10,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 1,
  },
  tipCardToday: {
    borderWidth: 2,
    borderColor: colors.accent,
  },
  tipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  tipHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tipHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  todayBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  todayBadgeText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    color: colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tipDay: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: colors.textSecondary,
  },
  tipTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 17,
    color: colors.text,
    lineHeight: 24,
  },
  tipBody: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 10,
    lineHeight: 22,
  },
});
