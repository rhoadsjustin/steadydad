import { Voltra } from 'voltra';
import {
  endAllLiveActivities,
  isLiveActivityActive,
  startLiveActivity,
  stopLiveActivity,
  updateLiveActivity,
  useLiveActivity,
  type EndLiveActivityOptions,
  type LiveActivityVariants,
  type StartLiveActivityOptions,
  type UpdateLiveActivityOptions,
  type UseLiveActivityOptions,
  type UseLiveActivityResult,
} from 'voltra/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DashboardSnapshot } from '@/lib/dashboardSnapshot';
import { VOLTRA_DEEP_LINKS, VOLTRA_LIVE_ACTIVITY_NAMES } from './ids';

type SleepLiveActivityHookOptions = Omit<UseLiveActivityOptions, 'activityName' | 'deepLinkUrl'>;
type SleepLiveActivityStartOptions = Omit<StartLiveActivityOptions, 'activityName' | 'deepLinkUrl'>;
type SleepLiveActivityUpdateOptions = UpdateLiveActivityOptions;
type SleepLiveActivityEndOptions = EndLiveActivityOptions;
const SLEEP_ACTIVITY_ID_KEY = '@steadydad_sleep_live_activity_id';

let cachedSleepActivityId: string | null | undefined;

async function persistSleepActivityId(activityId: string): Promise<void> {
  cachedSleepActivityId = activityId;
  await AsyncStorage.setItem(SLEEP_ACTIVITY_ID_KEY, activityId);
}

async function clearPersistedSleepActivityId(): Promise<void> {
  cachedSleepActivityId = null;
  await AsyncStorage.removeItem(SLEEP_ACTIVITY_ID_KEY);
}

async function getPersistedSleepActivityId(): Promise<string | null> {
  if (cachedSleepActivityId !== undefined) return cachedSleepActivityId;
  const stored = await AsyncStorage.getItem(SLEEP_ACTIVITY_ID_KEY);
  cachedSleepActivityId = stored;
  return stored;
}

function formatTimeLabel(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function getSleepHeadline(snapshot: DashboardSnapshot): string {
  if (snapshot.sleepStatus === 'sleeping') return 'Sleep in progress';
  if (snapshot.sleepStatus === 'awake') return 'Awake';
  return 'No sleep logged yet';
}

function getSleepSubline(snapshot: DashboardSnapshot): string {
  if (snapshot.sleepStartedAt) return `Started ${formatTimeLabel(snapshot.sleepStartedAt)}`;
  if (snapshot.lastSleepAt) return `Last sleep ${formatTimeLabel(snapshot.lastSleepAt)}`;
  return 'Track sleep from dashboard';
}

export function buildSleepLiveActivityVariants(snapshot: DashboardSnapshot): LiveActivityVariants {
  'use no memo';
  const headline = getSleepHeadline(snapshot);
  const subline = getSleepSubline(snapshot);

  return {
    lockScreen: {
      activityBackgroundTint: '#1E3A5F',
      content: (
        <Voltra.VStack style={{ padding: 16 }}>
          <Voltra.Text style={{ color: '#9EAFC4', fontSize: 12, fontWeight: '600' }}>
            {snapshot.babyName}
          </Voltra.Text>
          <Voltra.Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '700', marginTop: 6 }}>
            {headline}
          </Voltra.Text>
          {snapshot.sleepStartedAt ? (
            <Voltra.Timer
              startAtMs={snapshot.sleepStartedAt}
              direction="up"
              textStyle="timer"
              showHours
              style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '700', marginTop: 8 }}
            />
          ) : (
            <Voltra.Text style={{ color: '#C8D7EA', fontSize: 14, marginTop: 8 }}>
              {subline}
            </Voltra.Text>
          )}
        </Voltra.VStack>
      ),
    },
    island: {
      keylineTint: '#5B8DB8',
      expanded: {
        center: (
          <Voltra.Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>
            {snapshot.babyName}
          </Voltra.Text>
        ),
        leading: (
          <Voltra.Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '600' }}>
            {headline}
          </Voltra.Text>
        ),
        trailing: snapshot.sleepStartedAt ? (
          <Voltra.Timer
            startAtMs={snapshot.sleepStartedAt}
            direction="up"
            textStyle="timer"
            showHours
            style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '700' }}
          />
        ) : (
          <Voltra.Text style={{ color: '#C8D7EA', fontSize: 12 }}>
            {subline}
          </Voltra.Text>
        ),
        bottom: (
          <Voltra.Text style={{ color: '#C8D7EA', fontSize: 12 }}>
            {subline}
          </Voltra.Text>
        ),
      },
      compact: {
        leading: (
          <Voltra.Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>
            Zz
          </Voltra.Text>
        ),
        trailing: snapshot.sleepStartedAt ? (
          <Voltra.Timer
            startAtMs={snapshot.sleepStartedAt}
            direction="up"
            textStyle="timer"
            style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}
          />
        ) : (
          <Voltra.Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>
            {snapshot.sleepStatus === 'awake' ? 'Awake' : '--'}
          </Voltra.Text>
        ),
      },
      minimal: (
        <Voltra.Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>
          Zz
        </Voltra.Text>
      ),
    },
  };
}

export function useSleepLiveActivity(
  snapshot: DashboardSnapshot,
  options: SleepLiveActivityHookOptions = {},
): UseLiveActivityResult {
  return useLiveActivity(buildSleepLiveActivityVariants(snapshot), {
    activityName: VOLTRA_LIVE_ACTIVITY_NAMES.sleep,
    deepLinkUrl: VOLTRA_DEEP_LINKS.dashboard,
    ...options,
  });
}

export function isSleepLiveActivityRunning(): boolean {
  return isLiveActivityActive(VOLTRA_LIVE_ACTIVITY_NAMES.sleep);
}

export async function startSleepLiveActivity(
  snapshot: DashboardSnapshot,
  options: SleepLiveActivityStartOptions = {},
): Promise<void> {
  const activityId = await startLiveActivity(buildSleepLiveActivityVariants(snapshot), {
    activityName: VOLTRA_LIVE_ACTIVITY_NAMES.sleep,
    deepLinkUrl: VOLTRA_DEEP_LINKS.dashboard,
    ...options,
  });
  if (activityId) {
    await persistSleepActivityId(activityId);
  }
}

export async function updateSleepLiveActivity(
  snapshot: DashboardSnapshot,
  options: SleepLiveActivityUpdateOptions = {},
): Promise<void> {
  const persistedActivityId = await getPersistedSleepActivityId();
  const activityId = persistedActivityId || VOLTRA_LIVE_ACTIVITY_NAMES.sleep;

  if (!persistedActivityId && !isSleepLiveActivityRunning()) {
    const startedActivityId = await startLiveActivity(buildSleepLiveActivityVariants(snapshot), {
      activityName: VOLTRA_LIVE_ACTIVITY_NAMES.sleep,
      deepLinkUrl: VOLTRA_DEEP_LINKS.dashboard,
      ...options,
    });
    if (startedActivityId) {
      await persistSleepActivityId(startedActivityId);
    }
    return;
  }

  try {
    await updateLiveActivity(activityId, buildSleepLiveActivityVariants(snapshot), options);
  } catch {
    await clearPersistedSleepActivityId();
    const startedActivityId = await startLiveActivity(buildSleepLiveActivityVariants(snapshot), {
      activityName: VOLTRA_LIVE_ACTIVITY_NAMES.sleep,
      deepLinkUrl: VOLTRA_DEEP_LINKS.dashboard,
      ...options,
    });
    if (startedActivityId) {
      await persistSleepActivityId(startedActivityId);
    }
  }
}

export async function endSleepLiveActivity(
  options: SleepLiveActivityEndOptions = {},
): Promise<void> {
  const persistedActivityId = await getPersistedSleepActivityId();
  const candidates = [
    persistedActivityId,
    VOLTRA_LIVE_ACTIVITY_NAMES.sleep,
  ].filter((value): value is string => Boolean(value));

  let stopped = false;

  for (const candidate of candidates) {
    try {
      await stopLiveActivity(candidate, options);
      stopped = true;
    } catch {
      // Keep trying fallback identifiers.
    }
  }

  if (!stopped) {
    await endAllLiveActivities();
  }

  await clearPersistedSleepActivityId();
}
