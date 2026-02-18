import * as Sentry from '@sentry/react-native';

let isMonitoringInitialized = false;

function isTruthy(value: string | undefined): boolean {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes';
}

export function initializeMonitoring(): void {
  if (isMonitoringInitialized) return;

  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  if (!dsn) {
    if (__DEV__) {
      console.log(
        '[monitoring] Sentry monitoring not initialized: EXPO_PUBLIC_SENTRY_DSN is not set.'
      );
    }
    return;
  }

  Sentry.init({
    dsn,
    enabled: !__DEV__ || isTruthy(process.env.EXPO_PUBLIC_SENTRY_ENABLE_DEV),
    debug: __DEV__,
    environment: process.env.EXPO_PUBLIC_APP_ENV || (__DEV__ ? 'development' : 'production'),
    tracesSampleRate: 0.1,
  });

  isMonitoringInitialized = true;
}

export function captureAppError(error: Error, stackTrace?: string): void {
  if (!isMonitoringInitialized) return;

  Sentry.withScope((scope) => {
    if (stackTrace) {
      scope.setContext('react_error_boundary', { stackTrace });
    }
    Sentry.captureException(error);
  });
}
