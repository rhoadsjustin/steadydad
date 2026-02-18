import { BabyEvent, FeedMetadata, DiaperMetadata, MoodMetadata } from './types';

const MS_PER_DAY = 86400000;
const ISO_BIRTH_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const SLASH_BIRTH_DATE_PATTERN = /^(\d{1,2})[/-](\d{1,2})[/-](\d{2}|\d{4})$/;

function toLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function buildLocalDate(year: number, month: number, day: number): Date | null {
  const candidate = new Date(year, month - 1, day);
  if (
    candidate.getFullYear() !== year ||
    candidate.getMonth() !== month - 1 ||
    candidate.getDate() !== day
  ) {
    return null;
  }
  return candidate;
}

function parseBirthDateLocal(value: string): Date | null {
  const input = value.trim();
  if (!input) return null;

  const isoMatch = input.match(ISO_BIRTH_DATE_PATTERN);
  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]);
    const day = Number(isoMatch[3]);
    return buildLocalDate(year, month, day);
  }

  const slashMatch = input.match(SLASH_BIRTH_DATE_PATTERN);
  if (slashMatch) {
    const month = Number(slashMatch[1]);
    const day = Number(slashMatch[2]);
    const rawYear = Number(slashMatch[3]);
    const year = slashMatch[3].length === 2 ? 2000 + rawYear : rawYear;
    return buildLocalDate(year, month, day);
  }

  return null;
}

function getAgeInDays(birthDate: string): number | null {
  const parsedBirthDate = parseBirthDateLocal(birthDate);
  if (!parsedBirthDate) return null;

  const birthDay = toLocalDay(parsedBirthDate);
  const today = toLocalDay(new Date());
  return Math.floor((today.getTime() - birthDay.getTime()) / MS_PER_DAY);
}

export function normalizeBirthDateInput(value: string): string | null {
  const parsed = parseBirthDateLocal(value);
  if (!parsed) return null;

  const year = parsed.getFullYear().toString();
  const month = (parsed.getMonth() + 1).toString().padStart(2, '0');
  const day = parsed.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isValidBirthDateInput(value: string): boolean {
  return normalizeBirthDateInput(value) !== null;
}

export function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

export function getBabyAge(birthDate: string): string {
  const days = getAgeInDays(birthDate);
  if (days === null) return 'Age unavailable';

  if (days < 0) return 'Not born yet';
  if (days === 0) return 'Newborn';
  if (days === 1) return '1 day old';
  if (days < 7) return `${days} days old`;
  const weeks = Math.floor(days / 7);
  const remainDays = days % 7;
  if (weeks < 8) {
    if (remainDays === 0) return `${weeks} week${weeks > 1 ? 's' : ''} old`;
    return `${weeks}w ${remainDays}d old`;
  }
  const months = Math.floor(days / 30.44);
  if (months < 24) return `${months} month${months > 1 ? 's' : ''} old`;
  const years = Math.floor(months / 12);
  return `${years} year${years > 1 ? 's' : ''} old`;
}

export function getDayIndex(birthDate: string): number {
  const days = getAgeInDays(birthDate);
  return Math.max(0, days ?? 0);
}

export function getEventSummary(event: BabyEvent): string {
  try {
    const meta = JSON.parse(event.metadataJson);
    switch (event.type) {
      case 'feed': {
        const f = meta as FeedMetadata;
        const typeLabel = f.type === 'breast_milk' ? 'Breast milk' : f.type === 'formula' ? 'Formula' : 'Solid food';
        return f.amountMl ? `${typeLabel} (${f.amountMl}ml)` : typeLabel;
      }
      case 'diaper': {
        const d = meta as DiaperMetadata;
        return d.kind === 'both' ? 'Wet & dirty' : d.kind.charAt(0).toUpperCase() + d.kind.slice(1);
      }
      case 'sleep_start':
        return 'Fell asleep';
      case 'sleep_end':
        return 'Woke up';
      case 'mood': {
        const m = meta as MoodMetadata;
        return m.mood.charAt(0).toUpperCase() + m.mood.slice(1);
      }
      default:
        return '';
    }
  } catch {
    return '';
  }
}

export function getEventIcon(type: string): { name: string; family: string } {
  switch (type) {
    case 'feed':
      return { name: 'baby-bottle', family: 'MaterialCommunityIcons' };
    case 'diaper':
      return { name: 'water-outline', family: 'Ionicons' };
    case 'sleep_start':
    case 'sleep_end':
      return { name: 'moon-outline', family: 'Ionicons' };
    case 'mood':
      return { name: 'happy-outline', family: 'Ionicons' };
    default:
      return { name: 'ellipse-outline', family: 'Ionicons' };
  }
}

export function getEventTypeLabel(type: string): string {
  switch (type) {
    case 'feed': return 'Feed';
    case 'diaper': return 'Diaper';
    case 'sleep_start': return 'Sleep';
    case 'sleep_end': return 'Wake';
    case 'mood': return 'Mood';
    default: return type;
  }
}

export function getEventColor(type: string): string {
  switch (type) {
    case 'feed': return '#4A90D9';
    case 'diaper': return '#8B6FC0';
    case 'sleep_start':
    case 'sleep_end': return '#5B8DB8';
    case 'mood': return '#E8913A';
    default: return '#6B7A99';
  }
}

export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const mins = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h = hours % 12 || 12;
  return `${h}:${mins.toString().padStart(2, '0')} ${ampm}`;
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function getSleepDuration(startTimestamp: number): string {
  const diff = Date.now() - startTimestamp;
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
