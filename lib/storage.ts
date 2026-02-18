import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { normalizeBirthDateInput } from './helpers';
import { BabyProfile, BabyEvent, Milestone, GuidanceItem } from './types';

const KEYS = {
  BABY_PROFILE: '@steadydad_baby_profile',
  EVENTS: '@steadydad_events',
  MILESTONES: '@steadydad_milestones',
  GUIDANCE: '@steadydad_guidance',
  GUIDANCE_VIEWED: '@steadydad_guidance_viewed',
  ONBOARDING_DONE: '@steadydad_onboarding_done',
  DAD_GOALS: '@steadydad_dad_goals',
};

function generateId(): string {
  return Crypto.randomUUID();
}

export async function saveBabyProfile(profile: Omit<BabyProfile, 'id' | 'createdAt'>): Promise<BabyProfile> {
  const normalizedBirthDate = normalizeBirthDateInput(profile.birthDate);
  if (!normalizedBirthDate) {
    throw new Error('Invalid birth date');
  }

  const full: BabyProfile = {
    ...profile,
    birthDate: normalizedBirthDate,
    id: generateId(),
    createdAt: Date.now(),
  };
  await AsyncStorage.setItem(KEYS.BABY_PROFILE, JSON.stringify(full));
  return full;
}

export async function getBabyProfile(): Promise<BabyProfile | null> {
  const raw = await AsyncStorage.getItem(KEYS.BABY_PROFILE);
  return raw ? JSON.parse(raw) : null;
}

export async function updateBabyProfile(updates: Partial<BabyProfile>): Promise<BabyProfile | null> {
  const existing = await getBabyProfile();
  if (!existing) return null;

  const normalizedUpdates: Partial<BabyProfile> = { ...updates };
  if (typeof updates.birthDate === 'string') {
    const normalizedBirthDate = normalizeBirthDateInput(updates.birthDate);
    if (!normalizedBirthDate) {
      throw new Error('Invalid birth date');
    }
    normalizedUpdates.birthDate = normalizedBirthDate;
  }

  const updated = { ...existing, ...normalizedUpdates };
  await AsyncStorage.setItem(KEYS.BABY_PROFILE, JSON.stringify(updated));
  return updated;
}

export async function addEvent(event: Omit<BabyEvent, 'id'>): Promise<BabyEvent> {
  const full: BabyEvent = { ...event, id: generateId() };
  const raw = await AsyncStorage.getItem(KEYS.EVENTS);
  const events: BabyEvent[] = raw ? JSON.parse(raw) : [];
  events.unshift(full);
  await AsyncStorage.setItem(KEYS.EVENTS, JSON.stringify(events));
  return full;
}

export async function getEvents(babyId: string, limit = 200): Promise<BabyEvent[]> {
  const raw = await AsyncStorage.getItem(KEYS.EVENTS);
  if (!raw) return [];
  const events: BabyEvent[] = JSON.parse(raw);
  return events
    .filter((e) => e.babyId === babyId)
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
}

export async function getLastEventByType(babyId: string, type: string): Promise<BabyEvent | null> {
  const raw = await AsyncStorage.getItem(KEYS.EVENTS);
  if (!raw) return null;
  const events: BabyEvent[] = JSON.parse(raw);
  const filtered = events
    .filter((e) => e.babyId === babyId && e.type === type)
    .sort((a, b) => b.timestamp - a.timestamp);
  return filtered[0] || null;
}

export async function getLastSleepEvent(babyId: string): Promise<BabyEvent | null> {
  const raw = await AsyncStorage.getItem(KEYS.EVENTS);
  if (!raw) return null;
  const events: BabyEvent[] = JSON.parse(raw);
  const sleepEvents = events
    .filter((e) => e.babyId === babyId && (e.type === 'sleep_start' || e.type === 'sleep_end'))
    .sort((a, b) => b.timestamp - a.timestamp);
  return sleepEvents[0] || null;
}

export async function addMilestone(milestone: Omit<Milestone, 'id'>): Promise<Milestone> {
  const full: Milestone = { ...milestone, id: generateId() };
  const raw = await AsyncStorage.getItem(KEYS.MILESTONES);
  const milestones: Milestone[] = raw ? JSON.parse(raw) : [];
  milestones.unshift(full);
  await AsyncStorage.setItem(KEYS.MILESTONES, JSON.stringify(milestones));
  return full;
}

export async function getMilestones(babyId: string): Promise<Milestone[]> {
  const raw = await AsyncStorage.getItem(KEYS.MILESTONES);
  if (!raw) return [];
  const milestones: Milestone[] = JSON.parse(raw);
  return milestones
    .filter((m) => m.babyId === babyId)
    .sort((a, b) => b.timestamp - a.timestamp);
}

export async function seedGuidance(items: GuidanceItem[]): Promise<void> {
  const raw = await AsyncStorage.getItem(KEYS.GUIDANCE);
  if (raw) return;
  await AsyncStorage.setItem(KEYS.GUIDANCE, JSON.stringify(items));
}

export async function getGuidanceItems(): Promise<GuidanceItem[]> {
  const raw = await AsyncStorage.getItem(KEYS.GUIDANCE);
  return raw ? JSON.parse(raw) : [];
}

export async function markGuidanceViewed(guidanceId: string): Promise<void> {
  const raw = await AsyncStorage.getItem(KEYS.GUIDANCE_VIEWED);
  const viewed: string[] = raw ? JSON.parse(raw) : [];
  if (!viewed.includes(guidanceId)) {
    viewed.push(guidanceId);
    await AsyncStorage.setItem(KEYS.GUIDANCE_VIEWED, JSON.stringify(viewed));
  }
}

export async function getViewedGuidanceIds(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(KEYS.GUIDANCE_VIEWED);
  return raw ? JSON.parse(raw) : [];
}

export async function setOnboardingDone(): Promise<void> {
  await AsyncStorage.setItem(KEYS.ONBOARDING_DONE, 'true');
}

export async function isOnboardingDone(): Promise<boolean> {
  const val = await AsyncStorage.getItem(KEYS.ONBOARDING_DONE);
  return val === 'true';
}

export async function saveDadGoals(goals: string[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.DAD_GOALS, JSON.stringify(goals));
}

export async function getDadGoals(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(KEYS.DAD_GOALS);
  return raw ? JSON.parse(raw) : [];
}

export async function exportAllData(): Promise<object> {
  const profile = await getBabyProfile();
  const eventsRaw = await AsyncStorage.getItem(KEYS.EVENTS);
  const milestonesRaw = await AsyncStorage.getItem(KEYS.MILESTONES);
  const guidanceViewedRaw = await AsyncStorage.getItem(KEYS.GUIDANCE_VIEWED);
  const goalsRaw = await AsyncStorage.getItem(KEYS.DAD_GOALS);

  return {
    exportedAt: new Date().toISOString(),
    profile,
    events: eventsRaw ? JSON.parse(eventsRaw) : [],
    milestones: milestonesRaw ? JSON.parse(milestonesRaw) : [],
    guidanceViewed: guidanceViewedRaw ? JSON.parse(guidanceViewedRaw) : [],
    dadGoals: goalsRaw ? JSON.parse(goalsRaw) : [],
  };
}

export async function resetAllData(): Promise<void> {
  await AsyncStorage.multiRemove(Object.values(KEYS));
}
