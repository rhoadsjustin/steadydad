import Colors from '@/constants/colors';
import { DashboardSnapshot } from '@/lib/dashboardSnapshot';
import { getRelativeTime, getSleepDuration } from '@/lib/helpers';
import { Voltra } from 'voltra';
import {
  clearWidget,
  getActiveWidgets,
  updateWidget,
  type UpdateWidgetOptions,
  type WidgetVariants,
} from 'voltra/client';
import { VOLTRA_DEEP_LINKS, VOLTRA_WIDGET_IDS } from './ids';

type DashboardWidgetUpdateOptions = Omit<UpdateWidgetOptions, 'deepLinkUrl'>;
type SleepPresentation = {
  title: string;
  detail: string;
  compactValue: string;
  durationValue: string;
  icon: string;
  iconColor: string;
  backgroundColor: string;
};

type Tone = {
  backgroundColor: string;
  iconColor: string;
  valueColor: string;
};

const FEED_TONE: Tone = {
  backgroundColor: '#EAF2FD',
  iconColor: Colors.feed,
  valueColor: Colors.textSecondary,
};

const DIAPER_TONE: Tone = {
  backgroundColor: '#F1EAF9',
  iconColor: Colors.diaper,
  valueColor: Colors.textSecondary,
};

function getRelativeLabel(timestamp: number | null, fallback: string): string {
  return timestamp ? getRelativeTime(timestamp) : fallback;
}

function getCompactRelativeLabel(timestamp: number | null, fallback: string): string {
  if (!timestamp) return fallback;

  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Now';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days <= 1) return '1d';
  return `${days}d`;
}

function getSleepPresentation(snapshot: DashboardSnapshot): SleepPresentation {
  if (snapshot.sleepStartedAt) {
    const duration = getSleepDuration(snapshot.sleepStartedAt);

    return {
      title: 'Sleeping',
      detail: `Sleeping for ${duration}`,
      compactValue: 'Asleep',
      durationValue: duration,
      icon: 'moon.stars.fill',
      iconColor: '#21A789',
      backgroundColor: '#E7F4EE',
    };
  }

  if (snapshot.lastSleepAt) {
    const relative = getRelativeTime(snapshot.lastSleepAt);

    return {
      title: 'Awake',
      detail: `Last sleep ${relative}`,
      compactValue: 'Awake',
      durationValue: getCompactRelativeLabel(snapshot.lastSleepAt, '--'),
      icon: 'sun.max.fill',
      iconColor: Colors.accent,
      backgroundColor: '#FEF1E4',
    };
  }

  return {
    title: 'No sleep data',
    detail: 'Log sleep from dashboard',
    compactValue: '--',
    durationValue: '--',
    icon: 'moon.zzz.fill',
    iconColor: Colors.textSecondary,
    backgroundColor: '#EBEFF5',
  };
}

function renderRoundMetric(
  label: string,
  value: string,
  icon: string,
  tone: Tone,
) {
  return (
    <Voltra.VStack style={{ flex: 1, alignItems: 'center' }}>
      <Voltra.VStack
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: tone.backgroundColor,
        }}
      >
        <Voltra.Symbol
          name={icon}
          size={20}
          tintColor={tone.iconColor}
        />
      </Voltra.VStack>
      <Voltra.Text style={{ color: Colors.textSecondary, fontSize: 10, marginTop: 5 }}>
        {label}
      </Voltra.Text>
      <Voltra.Text
        style={{
          color: tone.valueColor,
          fontSize: 12,
          fontWeight: '700',
          marginTop: 1,
        }}
      >
        {value}
      </Voltra.Text>
    </Voltra.VStack>
  );
}

function renderGridTile(
  label: string,
  value: string,
  icon: string,
  tone: Tone,
  compact = false,
) {
  if (compact) {
    return (
      <Voltra.VStack
        style={{
          flex: 1,
          minHeight: 82,
          backgroundColor: tone.backgroundColor,
          borderRadius: 16,
          paddingHorizontal: 6,
          paddingVertical: 8,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Voltra.Symbol
          name={icon}
          size={20}
          tintColor={tone.iconColor}
        />
        <Voltra.Text
          style={{
            color: Colors.text,
            fontSize: 11,
            fontWeight: '700',
            marginTop: 4,
          }}
        >
          {label}
        </Voltra.Text>
        <Voltra.Text
          style={{
            color: tone.valueColor,
            fontSize: 9,
            fontWeight: '600',
            marginTop: 1,
          }}
        >
          {value}
        </Voltra.Text>
      </Voltra.VStack>
    );
  }

  return (
    <Voltra.HStack
      style={{
        flex: 1,
        backgroundColor: tone.backgroundColor,
        borderRadius: 16,
        paddingHorizontal: 10,
        paddingVertical: 10,
        alignItems: 'center',
      }}
    >
      <Voltra.Symbol
        name={icon}
        size={18}
        tintColor={tone.iconColor}
      />
      <Voltra.VStack style={{ marginLeft: 8 }}>
        <Voltra.Text
          style={{
            color: Colors.text,
            fontSize: 13,
            fontWeight: '700',
          }}
        >
          {label}
        </Voltra.Text>
        <Voltra.Text
          style={{
            color: tone.valueColor,
            fontSize: 13,
            marginTop: 1,
          }}
        >
          {value}
        </Voltra.Text>
      </Voltra.VStack>
    </Voltra.HStack>
  );
}

function renderStatusRow(
  label: string,
  value: string,
  icon: string,
  tone: Tone,
) {
  return (
    <Voltra.HStack
      style={{
        alignSelf: 'stretch',
        backgroundColor: tone.backgroundColor,
        borderRadius: 17,
        paddingHorizontal: 12,
        paddingVertical: 11,
        alignItems: 'center',
      }}
    >
      <Voltra.Symbol
        name={icon}
        size={20}
        tintColor={tone.iconColor}
      />
      <Voltra.Text
        style={{
          color: Colors.text,
          fontSize: 15,
          marginLeft: 10,
          fontWeight: '600',
        }}
      >
        {label}: {value}
      </Voltra.Text>
    </Voltra.HStack>
  );
}

export function buildDashboardSnapshotWidgetVariants(
  snapshot: DashboardSnapshot,
): WidgetVariants {
  'use no memo';
  const sleep = getSleepPresentation(snapshot);
  const feedLabel = getRelativeLabel(snapshot.lastFeedAt, 'No feeds yet');
  const diaperLabel = getRelativeLabel(snapshot.lastDiaperAt, 'No diapers yet');
  const feedCompactLabel = getCompactRelativeLabel(snapshot.lastFeedAt, '--');
  const diaperCompactLabel = getCompactRelativeLabel(snapshot.lastDiaperAt, '--');
  const headerSubline = snapshot.babyAgeLabel ?? 'Dashboard snapshot';

  const sleepTone: Tone = {
    backgroundColor: sleep.backgroundColor,
    iconColor: sleep.iconColor,
    valueColor: sleep.iconColor,
  };

  const nowTone: Tone = snapshot.sleepStatus === 'awake'
    ? {
        backgroundColor: '#FEF1E4',
        iconColor: Colors.accent,
        valueColor: Colors.accent,
      }
    : snapshot.sleepStatus === 'sleeping'
      ? {
          backgroundColor: '#E7F4EE',
          iconColor: '#21A789',
          valueColor: '#21A789',
        }
      : {
          backgroundColor: '#EAF0FB',
          iconColor: Colors.primaryLight,
          valueColor: Colors.primaryDark,
        };

  return {
    systemSmall: (
      <Voltra.VStack style={{ backgroundColor: Colors.background, padding: 13, flex: 1 }}>
        <Voltra.Text style={{ color: Colors.textTertiary, fontSize: 10, fontWeight: '700' }}>
          STEADYDAD
        </Voltra.Text>
        <Voltra.Text style={{ color: Colors.primaryDark, fontSize: 24, fontWeight: '700', marginTop: 2 }}>
          {snapshot.babyName}
        </Voltra.Text>
        <Voltra.Text style={{ color: Colors.textSecondary, fontSize: 12, marginTop: 1 }}>
          {headerSubline}
        </Voltra.Text>
        <Voltra.HStack style={{ marginTop: 13 }}>
          <Voltra.VStack style={{ flex: 1 }}>
            {renderRoundMetric('Feed', feedCompactLabel, 'cup.and.saucer.fill', FEED_TONE)}
          </Voltra.VStack>
          <Voltra.VStack style={{ flex: 1 }}>
            {renderRoundMetric('Diaper', diaperCompactLabel, 'drop.fill', DIAPER_TONE)}
          </Voltra.VStack>
          <Voltra.VStack style={{ flex: 1 }}>
            {renderRoundMetric('Sleep', sleep.compactValue, sleep.icon, sleepTone)}
          </Voltra.VStack>
        </Voltra.HStack>
      </Voltra.VStack>
    ),
    systemMedium: (
      <Voltra.VStack style={{ backgroundColor: Colors.background, padding: 14, flex: 1 }}>
        <Voltra.HStack style={{ flex: 1, alignItems: 'stretch' }}>
          <Voltra.VStack style={{ flex: 4, justifyContent: 'center', paddingRight: 8 }}>
            <Voltra.Text style={{ color: Colors.primaryDark, fontSize: 22, fontWeight: '700' }}>
              {snapshot.babyName}
            </Voltra.Text>
            <Voltra.Text style={{ color: Colors.textSecondary, fontSize: 13, marginTop: 3 }}>
              {headerSubline}
            </Voltra.Text>
          </Voltra.VStack>

          <Voltra.VStack style={{ flex: 8, justifyContent: 'center' }}>
            <Voltra.HStack>
              <Voltra.VStack style={{ flex: 1, paddingRight: 4 }}>
                {renderGridTile('Feed', feedCompactLabel, 'cup.and.saucer.fill', FEED_TONE, true)}
              </Voltra.VStack>
              <Voltra.VStack style={{ flex: 1, paddingLeft: 4 }}>
                {renderGridTile('Diaper', diaperCompactLabel, 'drop.fill', DIAPER_TONE, true)}
              </Voltra.VStack>
            </Voltra.HStack>
            <Voltra.HStack style={{ marginTop: 8 }}>
              <Voltra.VStack style={{ flex: 1, paddingRight: 4 }}>
                {renderGridTile('Sleep', sleep.durationValue, sleep.icon, sleepTone, true)}
              </Voltra.VStack>
              <Voltra.VStack style={{ flex: 1, paddingLeft: 4 }}>
                {renderGridTile('Now', sleep.compactValue, 'clock.fill', nowTone, true)}
              </Voltra.VStack>
            </Voltra.HStack>
          </Voltra.VStack>
        </Voltra.HStack>
      </Voltra.VStack>
    ),
    systemLarge: (
      <Voltra.VStack style={{ backgroundColor: Colors.background, padding: 16, flex: 1 }}>
        <Voltra.HStack style={{ alignItems: 'center' }}>
          <Voltra.VStack
            style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#E9EFFA',
            }}
          >
            <Voltra.Symbol
              name="shield.fill"
              size={30}
              tintColor={Colors.primary}
            />
          </Voltra.VStack>
          <Voltra.VStack style={{ marginLeft: 12 }}>
            <Voltra.Text style={{ color: Colors.primaryDark, fontSize: 36, fontWeight: '700' }}>
              {snapshot.babyName}
            </Voltra.Text>
            <Voltra.Text style={{ color: Colors.textSecondary, fontSize: 18, marginTop: 2 }}>
              {headerSubline}
            </Voltra.Text>
          </Voltra.VStack>
        </Voltra.HStack>

        <Voltra.VStack style={{ marginTop: 12 }}>
          {renderStatusRow('Last feed', feedLabel, 'cup.and.saucer.fill', FEED_TONE)}
          <Voltra.VStack style={{ marginTop: 8 }}>
            {renderStatusRow('Last diaper', diaperLabel, 'drop.fill', DIAPER_TONE)}
          </Voltra.VStack>
          <Voltra.VStack style={{ marginTop: 8 }}>
            {renderStatusRow('Sleep', sleep.detail, sleep.icon, sleepTone)}
          </Voltra.VStack>
          <Voltra.VStack style={{ marginTop: 8 }}>
            {renderStatusRow('Now', sleep.title, 'clock.fill', nowTone)}
          </Voltra.VStack>
        </Voltra.VStack>

      </Voltra.VStack>
    ),
  };
}

export async function updateDashboardSnapshotWidget(
  snapshot: DashboardSnapshot,
  options: DashboardWidgetUpdateOptions = {},
): Promise<void> {
  await updateWidget(
    VOLTRA_WIDGET_IDS.dashboardSnapshot,
    buildDashboardSnapshotWidgetVariants(snapshot),
    {
      ...options,
      deepLinkUrl: VOLTRA_DEEP_LINKS.dashboard,
    },
  );
}

export async function clearDashboardSnapshotWidget(): Promise<void> {
  await clearWidget(VOLTRA_WIDGET_IDS.dashboardSnapshot);
}

export async function isDashboardSnapshotWidgetActive(): Promise<boolean> {
  const activeWidgets = await getActiveWidgets();
  return activeWidgets.some((widget) => widget.name === VOLTRA_WIDGET_IDS.dashboardSnapshot);
}
