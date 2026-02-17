import { BabyEvent, BabyProfile, EventType } from './types';
import { getBabyAge } from './helpers';

export type DashboardSleepStatus = 'sleeping' | 'awake' | 'no_data';

export interface DashboardSnapshot {
  babyName: string;
  babyAgeLabel: string | null;
  lastFeedAt: number | null;
  lastDiaperAt: number | null;
  lastSleepAt: number | null;
  sleepStartedAt: number | null;
  isSleeping: boolean;
  sleepStatus: DashboardSleepStatus;
}

function getLatestEventByType(events: BabyEvent[], type: EventType): BabyEvent | null {
  let latest: BabyEvent | null = null;

  for (const event of events) {
    if (event.type !== type) continue;
    if (!latest || event.timestamp > latest.timestamp) {
      latest = event;
    }
  }

  return latest;
}

function getLatestSleepEvent(events: BabyEvent[]): BabyEvent | null {
  let latest: BabyEvent | null = null;

  for (const event of events) {
    if (event.type !== 'sleep_start' && event.type !== 'sleep_end') continue;
    if (!latest || event.timestamp > latest.timestamp) {
      latest = event;
    }
  }

  return latest;
}

export function buildDashboardSnapshot(
  profile: Pick<BabyProfile, 'name' | 'birthDate'> | null,
  events: BabyEvent[],
): DashboardSnapshot {
  const lastFeed = getLatestEventByType(events, 'feed');
  const lastDiaper = getLatestEventByType(events, 'diaper');
  const lastSleep = getLatestSleepEvent(events);
  const isSleeping = lastSleep?.type === 'sleep_start';

  return {
    babyName: profile?.name ?? 'Baby',
    babyAgeLabel: profile?.birthDate ? getBabyAge(profile.birthDate) : null,
    lastFeedAt: lastFeed?.timestamp ?? null,
    lastDiaperAt: lastDiaper?.timestamp ?? null,
    lastSleepAt: lastSleep?.timestamp ?? null,
    sleepStartedAt: isSleeping ? (lastSleep?.timestamp ?? null) : null,
    isSleeping,
    sleepStatus: lastSleep ? (isSleeping ? 'sleeping' : 'awake') : 'no_data',
  };
}

export function getDashboardSnapshotSyncKey(snapshot: DashboardSnapshot): string {
  return JSON.stringify({
    babyName: snapshot.babyName,
    babyAgeLabel: snapshot.babyAgeLabel,
    lastFeedAt: snapshot.lastFeedAt,
    lastDiaperAt: snapshot.lastDiaperAt,
    lastSleepAt: snapshot.lastSleepAt,
    sleepStartedAt: snapshot.sleepStartedAt,
    isSleeping: snapshot.isSleeping,
    sleepStatus: snapshot.sleepStatus,
  });
}
