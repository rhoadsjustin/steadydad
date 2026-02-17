import { Platform } from 'react-native';
import { DashboardSnapshot } from '@/lib/dashboardSnapshot';
import { endSleepLiveActivity, updateSleepLiveActivity } from './liveActivity';
import { clearDashboardSnapshotWidget, updateDashboardSnapshotWidget } from './widget';

function isTruthyFlag(value: string | undefined): boolean {
  if (value === undefined) return true;
  const normalized = value.trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes';
}

function shouldSyncIOSGlanceables(): boolean {
  if (Platform.OS !== 'ios') return false;
  return isTruthyFlag(process.env.EXPO_PUBLIC_ENABLE_IOS_GLANCEABLES);
}

export function isIOSGlanceablesEnabled(): boolean {
  return shouldSyncIOSGlanceables();
}

export async function syncIOSGlanceables(snapshot: DashboardSnapshot): Promise<void> {
  if (!shouldSyncIOSGlanceables()) return;

  const sleepTask = snapshot.isSleeping
    ? updateSleepLiveActivity(snapshot)
    : endSleepLiveActivity({ dismissalPolicy: 'immediate' });

  const results = await Promise.allSettled([
    updateDashboardSnapshotWidget(snapshot),
    sleepTask,
  ]);

  for (const result of results) {
    if (result.status === 'rejected') {
      console.warn('Failed to sync iOS glanceable state:', result.reason);
    }
  }
}

export async function clearIOSGlanceables(): Promise<void> {
  if (!shouldSyncIOSGlanceables()) return;

  const results = await Promise.allSettled([
    clearDashboardSnapshotWidget(),
    endSleepLiveActivity({ dismissalPolicy: 'immediate' }),
  ]);

  for (const result of results) {
    if (result.status === 'rejected') {
      console.warn('Failed to clear iOS glanceable state:', result.reason);
    }
  }
}
