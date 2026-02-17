export interface BabyProfile {
  id: string;
  name: string;
  birthDate: string;
  createdAt: number;
}

export type EventType = 'feed' | 'diaper' | 'sleep_start' | 'sleep_end' | 'mood';

export interface BabyEvent {
  id: string;
  babyId: string;
  type: EventType;
  timestamp: number;
  metadataJson: string;
}

export interface FeedMetadata {
  type: 'breast_milk' | 'formula' | 'solid';
  amountMl?: number;
  note?: string;
}

export interface DiaperMetadata {
  kind: 'wet' | 'dirty' | 'both';
  note?: string;
}

export interface SleepMetadata {
  note?: string;
}

export interface MoodMetadata {
  mood: 'happy' | 'fussy' | 'crying' | 'calm';
  note?: string;
}

export interface Milestone {
  id: string;
  babyId: string;
  title: string;
  timestamp: number;
  note?: string;
  photoUri?: string;
}

export interface GuidanceItem {
  id: string;
  dayIndex: number;
  title: string;
  body: string;
}

export interface DadGoal {
  id: string;
  label: string;
  selected: boolean;
}

export interface HelperTopic {
  id: string;
  title: string;
  icon: string;
  description: string;
  steps: string[];
}
