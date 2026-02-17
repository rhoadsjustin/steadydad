import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode, useRef } from 'react';
import { BabyProfile, BabyEvent, Milestone } from './types';
import * as Storage from './storage';
import { guidanceSeed } from './guidance-seed';
import { buildDashboardSnapshot, getDashboardSnapshotSyncKey } from './dashboardSnapshot';
import { clearIOSGlanceables, syncIOSGlanceables } from './voltra/sync';

interface BabyContextValue {
  profile: BabyProfile | null;
  events: BabyEvent[];
  milestones: Milestone[];
  isLoading: boolean;
  onboardingDone: boolean;
  saveProfile: (name: string, birthDate: string) => Promise<BabyProfile>;
  updateProfile: (updates: Partial<BabyProfile>) => Promise<void>;
  logEvent: (type: BabyEvent['type'], metadataJson: string) => Promise<void>;
  addMilestone: (title: string, timestamp: number, note?: string, photoUri?: string) => Promise<void>;
  refreshEvents: () => Promise<void>;
  refreshMilestones: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  resetAll: () => Promise<void>;
  getLastEventByType: (type: string) => BabyEvent | null;
  getLastSleepEvent: () => BabyEvent | null;
}

const BabyContext = createContext<BabyContextValue | null>(null);

export function BabyProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<BabyProfile | null>(null);
  const [events, setEvents] = useState<BabyEvent[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [onboardingDone, setOnboardingDone] = useState(false);
  const lastSyncedSnapshotKeyRef = useRef<string | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (isLoading) return;
    let cancelled = false;

    const syncGlanceables = async () => {
      if (!onboardingDone || !profile) {
        if (lastSyncedSnapshotKeyRef.current === null) return;
        await clearIOSGlanceables();
        if (!cancelled) {
          lastSyncedSnapshotKeyRef.current = null;
        }
        return;
      }

      const snapshot = buildDashboardSnapshot(profile, events);
      const snapshotSyncKey = getDashboardSnapshotSyncKey(snapshot);

      if (snapshotSyncKey === lastSyncedSnapshotKeyRef.current) {
        return;
      }

      await syncIOSGlanceables(snapshot);
      if (!cancelled) {
        lastSyncedSnapshotKeyRef.current = snapshotSyncKey;
      }
    };

    syncGlanceables().catch((err) => {
      console.error('Failed to sync iOS glanceables:', err);
    });

    return () => {
      cancelled = true;
    };
  }, [profile, events, isLoading, onboardingDone]);

  const loadInitialData = async () => {
    try {
      const [p, done] = await Promise.all([
        Storage.getBabyProfile(),
        Storage.isOnboardingDone(),
      ]);
      await Storage.seedGuidance(guidanceSeed);
      setProfile(p);
      setOnboardingDone(done);
      if (p) {
        const [e, m] = await Promise.all([
          Storage.getEvents(p.id),
          Storage.getMilestones(p.id),
        ]);
        setEvents(e);
        setMilestones(m);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfile = useCallback(async (name: string, birthDate: string) => {
    const p = await Storage.saveBabyProfile({ name, birthDate });
    setProfile(p);
    return p;
  }, []);

  const updateProfile = useCallback(async (updates: Partial<BabyProfile>) => {
    const p = await Storage.updateBabyProfile(updates);
    if (p) setProfile(p);
  }, []);

  const logEvent = useCallback(async (type: BabyEvent['type'], metadataJson: string) => {
    if (!profile) return;
    const event = await Storage.addEvent({
      babyId: profile.id,
      type,
      timestamp: Date.now(),
      metadataJson,
    });
    setEvents((prev) => [event, ...prev]);
  }, [profile]);

  const addMilestoneHandler = useCallback(async (title: string, timestamp: number, note?: string, photoUri?: string) => {
    if (!profile) return;
    const m = await Storage.addMilestone({
      babyId: profile.id,
      title,
      timestamp,
      note,
      photoUri,
    });
    setMilestones((prev) => [m, ...prev]);
  }, [profile]);

  const refreshEvents = useCallback(async () => {
    if (!profile) return;
    const e = await Storage.getEvents(profile.id);
    setEvents(e);
  }, [profile]);

  const refreshMilestones = useCallback(async () => {
    if (!profile) return;
    const m = await Storage.getMilestones(profile.id);
    setMilestones(m);
  }, [profile]);

  const completeOnboarding = useCallback(async () => {
    await Storage.setOnboardingDone();
    setOnboardingDone(true);
  }, []);

  const resetAll = useCallback(async () => {
    await Storage.resetAllData();
    lastSyncedSnapshotKeyRef.current = null;
    await clearIOSGlanceables();
    setProfile(null);
    setEvents([]);
    setMilestones([]);
    setOnboardingDone(false);
  }, []);

  const getLastEventByType = useCallback((type: string): BabyEvent | null => {
    return events.find((e) => e.type === type) || null;
  }, [events]);

  const getLastSleepEvent = useCallback((): BabyEvent | null => {
    return events.find((e) => e.type === 'sleep_start' || e.type === 'sleep_end') || null;
  }, [events]);

  const value = useMemo(() => ({
    profile,
    events,
    milestones,
    isLoading,
    onboardingDone,
    saveProfile,
    updateProfile,
    logEvent,
    addMilestone: addMilestoneHandler,
    refreshEvents,
    refreshMilestones,
    completeOnboarding,
    resetAll,
    getLastEventByType,
    getLastSleepEvent,
  }), [profile, events, milestones, isLoading, onboardingDone, saveProfile, updateProfile, logEvent, addMilestoneHandler, refreshEvents, refreshMilestones, completeOnboarding, resetAll, getLastEventByType, getLastSleepEvent]);

  return (
    <BabyContext.Provider value={value}>
      {children}
    </BabyContext.Provider>
  );
}

export function useBaby() {
  const ctx = useContext(BabyContext);
  if (!ctx) throw new Error('useBaby must be used within BabyProvider');
  return ctx;
}
