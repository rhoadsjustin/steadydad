import { Appearance, type ColorSchemeName } from 'react-native';
import { getThemeColors, type AppThemeColors } from '@/constants/colors';
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

type DashboardWidgetUpdateOptions = Omit<UpdateWidgetOptions, 'deepLinkUrl'> & {
  colorScheme?: ColorSchemeName;
};
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

type WidgetTheme = {
  colors: AppThemeColors;
  isDark: boolean;
  feedTone: Tone;
  diaperTone: Tone;
  idleNowTone: Tone;
  primaryHeading: string;
  badgeBackground: string;
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

function resolveWidgetTheme(colorScheme: ColorSchemeName = Appearance.getColorScheme()): WidgetTheme {
  const colors = getThemeColors(colorScheme);
  const isDark = colorScheme === 'dark';

  return {
    colors,
    isDark,
    feedTone: {
      backgroundColor: isDark ? '#233A58' : '#EAF2FD',
      iconColor: colors.feed,
      valueColor: colors.textSecondary,
    },
    diaperTone: {
      backgroundColor: isDark ? '#30254A' : '#F1EAF9',
      iconColor: colors.diaper,
      valueColor: colors.textSecondary,
    },
    idleNowTone: {
      backgroundColor: isDark ? '#273E5D' : '#EAF0FB',
      iconColor: colors.primaryLight,
      valueColor: isDark ? colors.primaryLight : colors.primaryDark,
    },
    primaryHeading: isDark ? colors.text : colors.primaryDark,
    badgeBackground: isDark ? '#233A58' : '#E9EFFA',
  };
}

function getSleepPresentation(snapshot: DashboardSnapshot, theme: WidgetTheme): SleepPresentation {
  if (snapshot.sleepStartedAt) {
    const duration = getSleepDuration(snapshot.sleepStartedAt);

    return {
      title: 'Sleeping',
      detail: `Sleeping for ${duration}`,
      compactValue: 'Asleep',
      durationValue: duration,
      icon: 'moon.stars.fill',
      iconColor: theme.isDark ? '#4CD1A8' : '#21A789',
      backgroundColor: theme.isDark ? '#1F4139' : '#E7F4EE',
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
      iconColor: theme.colors.accent,
      backgroundColor: theme.isDark ? '#47351F' : '#FEF1E4',
    };
  }

  return {
    title: 'No sleep data',
    detail: 'Log sleep from dashboard',
    compactValue: '--',
    durationValue: '--',
    icon: 'moon.zzz.fill',
    iconColor: theme.colors.textSecondary,
    backgroundColor: theme.isDark ? '#273448' : '#EBEFF5',
  };
}

function renderRoundMetric(
  label: string,
  value: string,
  icon: string,
  tone: Tone,
  theme: WidgetTheme,
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
      <Voltra.Text style={{ color: theme.colors.textSecondary, fontSize: 10, marginTop: 5 }}>
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
  theme: WidgetTheme,
  compact = false,
) {
  if (compact) {
    return (
      <Voltra.VStack
        style={{
          height: 64,
          backgroundColor: tone.backgroundColor,
          borderRadius: 14,
          paddingHorizontal: 6,
          paddingVertical: 6,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Voltra.Symbol
          name={icon}
          size={18}
          tintColor={tone.iconColor}
        />
        <Voltra.Text
          style={{
            color: theme.colors.text,
            fontSize: 10,
            fontWeight: '700',
            marginTop: 3,
          }}
        >
          {label}
        </Voltra.Text>
        <Voltra.Text
          style={{
            color: tone.valueColor,
            fontSize: 9,
            fontWeight: '600',
            marginTop: 0,
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
            color: theme.colors.text,
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
  theme: WidgetTheme,
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
          color: theme.colors.text,
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
  colorScheme: ColorSchemeName = Appearance.getColorScheme(),
): WidgetVariants {
  'use no memo';
  const theme = resolveWidgetTheme(colorScheme);
  const { colors, feedTone, diaperTone, idleNowTone, primaryHeading, badgeBackground } = theme;
  const sleep = getSleepPresentation(snapshot, theme);
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
        backgroundColor: theme.isDark ? '#47351F' : '#FEF1E4',
        iconColor: colors.accent,
        valueColor: colors.accent,
      }
    : snapshot.sleepStatus === 'sleeping'
      ? {
          backgroundColor: theme.isDark ? '#1F4139' : '#E7F4EE',
          iconColor: theme.isDark ? '#4CD1A8' : '#21A789',
          valueColor: theme.isDark ? '#4CD1A8' : '#21A789',
        }
      : idleNowTone;

  return {
    systemSmall: (
      <Voltra.VStack style={{ backgroundColor: colors.background, padding: 13, flex: 1 }}>
        <Voltra.Text style={{ color: colors.textTertiary, fontSize: 10, fontWeight: '700' }}>
          STEADYDAD
        </Voltra.Text>
        <Voltra.Text style={{ color: primaryHeading, fontSize: 24, fontWeight: '700', marginTop: 2 }}>
          {snapshot.babyName}
        </Voltra.Text>
        <Voltra.Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 1 }}>
          {headerSubline}
        </Voltra.Text>
        <Voltra.HStack style={{ marginTop: 13 }}>
          <Voltra.VStack style={{ flex: 1 }}>
            {renderRoundMetric('Feed', feedCompactLabel, 'cup.and.saucer.fill', feedTone, theme)}
          </Voltra.VStack>
          <Voltra.VStack style={{ flex: 1 }}>
            {renderRoundMetric('Diaper', diaperCompactLabel, 'drop.fill', diaperTone, theme)}
          </Voltra.VStack>
          <Voltra.VStack style={{ flex: 1 }}>
            {renderRoundMetric('Sleep', sleep.compactValue, sleep.icon, sleepTone, theme)}
          </Voltra.VStack>
        </Voltra.HStack>
      </Voltra.VStack>
    ),
    systemMedium: (
      <Voltra.VStack style={{ backgroundColor: colors.background, padding: 12, flex: 1 }}>
        <Voltra.HStack style={{ flex: 1, alignItems: 'stretch' }}>
          <Voltra.VStack style={{ flex: 4, justifyContent: 'center', paddingRight: 8 }}>
            <Voltra.Text style={{ color: primaryHeading, fontSize: 22, fontWeight: '700' }}>
              {snapshot.babyName}
            </Voltra.Text>
            <Voltra.Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 3 }}>
              {headerSubline}
            </Voltra.Text>
          </Voltra.VStack>

          <Voltra.VStack style={{ flex: 8, justifyContent: 'center' }}>
            <Voltra.HStack style={{ alignItems: 'stretch' }}>
              <Voltra.VStack style={{ flex: 1, marginRight: 4 }}>
                {renderGridTile('Feed', feedCompactLabel, 'cup.and.saucer.fill', feedTone, theme, true)}
              </Voltra.VStack>
              <Voltra.VStack style={{ flex: 1, marginLeft: 4 }}>
                {renderGridTile('Diaper', diaperCompactLabel, 'drop.fill', diaperTone, theme, true)}
              </Voltra.VStack>
            </Voltra.HStack>
            <Voltra.HStack style={{ marginTop: 6, alignItems: 'stretch' }}>
              <Voltra.VStack style={{ flex: 1, marginRight: 4 }}>
                {renderGridTile('Sleep', sleep.durationValue, sleep.icon, sleepTone, theme, true)}
              </Voltra.VStack>
              <Voltra.VStack style={{ flex: 1, marginLeft: 4 }}>
                {renderGridTile('Now', sleep.compactValue, 'clock.fill', nowTone, theme, true)}
              </Voltra.VStack>
            </Voltra.HStack>
          </Voltra.VStack>
        </Voltra.HStack>
      </Voltra.VStack>
    ),
    systemLarge: (
      <Voltra.VStack style={{ backgroundColor: colors.background, padding: 16, flex: 1 }}>
        <Voltra.HStack style={{ alignItems: 'center' }}>
          <Voltra.VStack
            style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: badgeBackground,
            }}
          >
            <Voltra.Symbol
              name="shield.fill"
              size={30}
              tintColor={colors.primary}
            />
          </Voltra.VStack>
          <Voltra.VStack style={{ marginLeft: 12 }}>
            <Voltra.Text style={{ color: primaryHeading, fontSize: 36, fontWeight: '700' }}>
              {snapshot.babyName}
            </Voltra.Text>
            <Voltra.Text style={{ color: colors.textSecondary, fontSize: 18, marginTop: 2 }}>
              {headerSubline}
            </Voltra.Text>
          </Voltra.VStack>
        </Voltra.HStack>

        <Voltra.VStack style={{ marginTop: 12 }}>
          {renderStatusRow('Last feed', feedLabel, 'cup.and.saucer.fill', feedTone, theme)}
          <Voltra.VStack style={{ marginTop: 8 }}>
            {renderStatusRow('Last diaper', diaperLabel, 'drop.fill', diaperTone, theme)}
          </Voltra.VStack>
          <Voltra.VStack style={{ marginTop: 8 }}>
            {renderStatusRow('Sleep', sleep.detail, sleep.icon, sleepTone, theme)}
          </Voltra.VStack>
          <Voltra.VStack style={{ marginTop: 8 }}>
            {renderStatusRow('Now', sleep.title, 'clock.fill', nowTone, theme)}
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
  const { colorScheme, ...widgetOptions } = options;

  await updateWidget(
    VOLTRA_WIDGET_IDS.dashboardSnapshot,
    buildDashboardSnapshotWidgetVariants(snapshot, colorScheme),
    {
      ...widgetOptions,
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
