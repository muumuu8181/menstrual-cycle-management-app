// Core data models for FemCare Pro
export interface UserProfile {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  settings: UserSettings;
  privacy: PrivacySettings;
  version: string;
}

export interface UserSettings {
  cycleLength: number; // 平均周期長
  periodLength: number; // 平均生理期間
  lutealPhaseLength: number; // 黄体期長
  notifications: NotificationSettings;
  display: DisplaySettings;
  timezone: string;
  language: 'ja' | 'en' | 'zh' | 'ko';
}

export interface NotificationSettings {
  periodReminder: boolean;
  periodReminderDays: number;
  ovulationReminder: boolean;
  pmsReminder: boolean;
  recordReminder: boolean;
  recordReminderTime: string; // HH:mm format
}

export interface DisplaySettings {
  theme: 'light' | 'dark' | 'auto';
  colorScheme: 'default' | 'accessible';
  fontSize: 'small' | 'medium' | 'large';
  showPredictions: boolean;
  showSymptoms: boolean;
  calendarView: 'month' | 'week';
}

export interface PrivacySettings {
  shareData: boolean;
  analytics: boolean;
  crashReporting: boolean;
  backupEnabled: boolean;
}

// Menstrual Cycle
export interface MenstrualCycle {
  id: string;
  userId: string;
  startDate: Date;
  endDate?: Date; // nullable for ongoing cycles
  actualLength?: number;
  predictedLength?: number;
  flowRecords: FlowRecord[];
  symptoms: SymptomRecord[];
  ovulation: OvulationRecord | null;
  notes: string;
  isConfirmed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FlowRecord {
  id: string;
  date: Date;
  flowLevel: 'spotting' | 'light' | 'medium' | 'heavy';
  flowColor: 'bright_red' | 'dark_red' | 'brown' | 'pink' | 'orange' | 'black';
  clots: boolean;
  clotSize?: 'small' | 'medium' | 'large';
  products: ProductUsage[];
  leakage: boolean;
  pain: PainLevel;
  notes: string;
}

export interface ProductUsage {
  type: 'pad' | 'tampon' | 'cup' | 'disc' | 'liner';
  brand?: string;
  absorbency: 'light' | 'regular' | 'super' | 'ultra';
  changesPerDay: number;
  comfort: 1 | 2 | 3 | 4 | 5;
  leakage: boolean;
}

export interface PainLevel {
  severity: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  location: Array<'lower_abdomen' | 'lower_back' | 'upper_legs' | 'head' | 'chest' | 'other'>;
  type: Array<'cramping' | 'sharp' | 'dull' | 'throbbing' | 'burning'>;
  duration: 'minutes' | 'hours' | 'all_day';
  medication: MedicationRecord[];
}

export interface MedicationRecord {
  name: string;
  dosage: string;
  timesTaken: number;
  effectiveness: 1 | 2 | 3 | 4 | 5;
}

export interface OvulationRecord {
  date: Date;
  cervicalMucus?: 'dry' | 'sticky' | 'creamy' | 'egg_white';
  cervicalPosition?: 'low' | 'medium' | 'high';
  cervicalFirmness?: 'firm' | 'medium' | 'soft';
  ovulationTest?: 'negative' | 'positive';
  ovulationPain?: boolean;
  notes: string;
}

// Symptoms & Health Data
export interface SymptomRecord {
  id: string;
  cycleId: string;
  date: Date;
  mood: MoodRecord;
  physical: PhysicalSymptoms;
  energy: EnergyLevel;
  sleep: SleepRecord;
  temperature?: TemperatureRecord;
  weight?: WeightRecord;
  notes: string;
}

export interface MoodRecord {
  overall: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  emotions: Array<'happy' | 'sad' | 'angry' | 'anxious' | 'irritable' | 'calm' | 'energetic' | 'tired'>;
  stress: 1 | 2 | 3 | 4 | 5;
  libido: 1 | 2 | 3 | 4 | 5;
}

export interface PhysicalSymptoms {
  breastTenderness: 0 | 1 | 2 | 3 | 4 | 5;
  bloating: 0 | 1 | 2 | 3 | 4 | 5;
  headache: 0 | 1 | 2 | 3 | 4 | 5;
  acne: 0 | 1 | 2 | 3 | 4 | 5;
  skinChanges: Array<'oily' | 'dry' | 'sensitive' | 'clear'>;
  digestive: Array<'nausea' | 'constipation' | 'diarrhea' | 'appetite_increase' | 'appetite_decrease'>;
  other: Array<'hot_flashes' | 'cold_flashes' | 'dizziness' | 'fatigue' | 'joint_pain'>;
}

export interface EnergyLevel {
  overall: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  motivation: 1 | 2 | 3 | 4 | 5;
  focus: 1 | 2 | 3 | 4 | 5;
  productivity: 1 | 2 | 3 | 4 | 5;
}

export interface SleepRecord {
  quality: 1 | 2 | 3 | 4 | 5;
  duration: number; // hours
  bedtime?: string; // HH:mm
  wakeTime?: string; // HH:mm
  interrupted: boolean;
  dreams: 'none' | 'normal' | 'vivid' | 'nightmares';
}

export interface TemperatureRecord {
  value: number; // Celsius
  method: 'oral' | 'vaginal' | 'axillary';
  time: string; // HH:mm
  conditions: Array<'fever' | 'illness' | 'stress' | 'alcohol' | 'poor_sleep' | 'normal'>;
}

export interface WeightRecord {
  value: number; // kg
  unit: 'kg' | 'lbs';
  time: string; // HH:mm
}

// Predictions & Analytics
export interface PredictionData {
  userId: string;
  nextPeriodDate: Date;
  nextPeriodConfidence: number; // 0-1
  nextOvulationDate: Date;
  nextOvulationConfidence: number; // 0-1
  fertileWindowStart: Date;
  fertileWindowEnd: Date;
  pmsStartDate: Date;
  averageCycleLength: number;
  cycleVariability: number;
  lastUpdated: Date;
}

export interface AnalyticsData {
  userId: string;
  periodicity: {
    averageLength: number;
    variability: number;
    trend: 'stable' | 'increasing' | 'decreasing';
  };
  symptoms: {
    mostCommon: Array<{ symptom: string; frequency: number }>;
    severity: { average: number; trend: string };
    patterns: Array<{ phase: string; symptoms: string[] }>;
  };
  healthScore: {
    overall: number; // 0-100
    cycle: number; // 0-100
    symptoms: number; // 0-100
    lastUpdated: Date;
  };
}

// Calendar & UI Types
export interface CalendarDay {
  date: Date;
  isPeriod: boolean;
  isOvulation: boolean;
  isFertile: boolean;
  isPredicted: boolean;
  hasSymptoms: boolean;
  flowLevel?: 'spotting' | 'light' | 'medium' | 'heavy';
  mood?: number;
  energy?: number;
  isToday: boolean;
  isCurrentMonth: boolean;
}

export interface CalendarWeek {
  days: CalendarDay[];
  weekNumber: number;
}

export interface CalendarMonth {
  year: number;
  month: number;
  weeks: CalendarWeek[];
}

// Backup & Export Types
export interface BackupRecord {
  id: string;
  userId: string;
  createdAt: Date;
  type: 'manual' | 'automatic' | 'export';
  data: {
    cycles: MenstrualCycle[];
    symptoms: SymptomRecord[];
    settings: UserSettings;
  };
  size: number;
}

export interface ExportData {
  version: string;
  exportedAt: Date;
  userProfile: UserProfile;
  cycles: MenstrualCycle[];
  symptoms: SymptomRecord[];
  predictions: PredictionData;
  analytics: AnalyticsData;
}