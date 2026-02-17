import React from 'react';
import { View, Text, StyleSheet, FlatList, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { useBaby } from '@/lib/BabyContext';
import { getEventSummary, getEventColor, getEventTypeLabel, formatTime, formatDate } from '@/lib/helpers';
import { BabyEvent } from '@/lib/types';

export default function TimelineScreen() {
  const insets = useSafeAreaInsets();
  const { events, isLoading } = useBaby();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const groupedEvents = React.useMemo(() => {
    const groups: { title: string; data: BabyEvent[] }[] = [];
    let currentDate = '';
    events.forEach((event) => {
      const date = formatDate(event.timestamp);
      if (date !== currentDate) {
        currentDate = date;
        groups.push({ title: date, data: [event] });
      } else {
        groups[groups.length - 1].data.push(event);
      }
    });
    return groups;
  }, [events]);

  const flatData = React.useMemo(() => {
    const items: ({ type: 'header'; title: string } | { type: 'event'; event: BabyEvent })[] = [];
    groupedEvents.forEach((group) => {
      items.push({ type: 'header', title: group.title });
      group.data.forEach((event) => {
        items.push({ type: 'event', event });
      });
    });
    return items;
  }, [groupedEvents]);

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <Text style={styles.screenTitle}>Timeline</Text>
      {events.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="time-outline" size={48} color={Colors.textTertiary} />
          <Text style={styles.emptyTitle}>No events yet</Text>
          <Text style={styles.emptySubtitle}>Log your first activity from the dashboard</Text>
        </View>
      ) : (
        <FlatList
          data={flatData}
          keyExtractor={(item, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
          renderItem={({ item }) => {
            if (item.type === 'header') {
              return (
                <View style={styles.dateHeader}>
                  <Text style={styles.dateHeaderText}>{item.title}</Text>
                </View>
              );
            }
            return <EventRow event={item.event} />;
          }}
        />
      )}
    </View>
  );
}

function EventRow({ event }: { event: BabyEvent }) {
  const color = getEventColor(event.type);
  const typeLabel = getEventTypeLabel(event.type);
  const summary = getEventSummary(event);

  const getIcon = () => {
    switch (event.type) {
      case 'feed':
        return <MaterialCommunityIcons name="baby-bottle" size={20} color={color} />;
      case 'diaper':
        return <Ionicons name="water-outline" size={20} color={color} />;
      case 'sleep_start':
        return <Ionicons name="moon" size={20} color={color} />;
      case 'sleep_end':
        return <Ionicons name="sunny-outline" size={20} color={color} />;
      case 'mood':
        return <Ionicons name="happy-outline" size={20} color={color} />;
      default:
        return <Ionicons name="ellipse" size={20} color={color} />;
    }
  };

  return (
    <View style={styles.eventRow}>
      <View style={styles.timelineConnector}>
        <View style={[styles.timelineDot, { backgroundColor: color + '20', borderColor: color }]}>
          {getIcon()}
        </View>
        <View style={styles.timelineLine} />
      </View>
      <View style={styles.eventContent}>
        <View style={styles.eventHeader}>
          <Text style={[styles.eventType, { color }]}>{typeLabel}</Text>
          <Text style={styles.eventTime}>{formatTime(event.timestamp)}</Text>
        </View>
        {!!summary && <Text style={styles.eventSummary}>{summary}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
  },
  screenTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 28,
    color: Colors.text,
    marginBottom: 16,
    marginTop: 16,
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
  dateHeader: {
    paddingVertical: 8,
    marginTop: 8,
  },
  dateHeaderText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 14,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  eventRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  timelineConnector: {
    alignItems: 'center',
    width: 44,
  },
  timelineDot: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.borderLight,
    minHeight: 16,
  },
  eventContent: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginLeft: 10,
    marginBottom: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 1,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventType: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 15,
  },
  eventTime: {
    fontFamily: 'Nunito_500Medium',
    fontSize: 13,
    color: Colors.textSecondary,
  },
  eventSummary: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
});
