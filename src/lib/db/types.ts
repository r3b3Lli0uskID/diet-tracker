import { v4 as uuidv4 } from "uuid";

export interface PatientProfile {
  readonly id: "default";
  readonly name: string;
  readonly ic: string;
  readonly dob: string;
  readonly cno: string;
  readonly address: string;
  readonly sex: "M" | "F";
  readonly height: number | null;
  readonly targetWeight: number | null;
  readonly activityLevel: string;
  readonly allergy: string;
  readonly co: string;
  readonly tel: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface MealEntry {
  readonly description: string;
  readonly photoBlob: Blob | null;
  readonly photoThumbnail: Blob | null;
  readonly isNil: boolean;
}

export interface DailyEntry {
  readonly id: string;
  readonly date: string;
  readonly breakfast: MealEntry;
  readonly lunch: MealEntry;
  readonly dinner: MealEntry;
  readonly distanceKm: number | null;
  readonly kCalories: number | null;
  readonly totalSteps: number | null;
  readonly aerobicSteps: number | null;
  readonly weightKg: number | null;
  readonly bpPulse: string;
  readonly bowel: string;
  readonly alcoholNuts: string;
  readonly remarks: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface MealEntryBackup {
  readonly description: string;
  readonly photoBase64: string | null;
  readonly photoThumbnailBase64: string | null;
  readonly isNil: boolean;
}

export interface DailyEntryBackup {
  readonly id: string;
  readonly date: string;
  readonly breakfast: MealEntryBackup;
  readonly lunch: MealEntryBackup;
  readonly dinner: MealEntryBackup;
  readonly distanceKm: number | null;
  readonly kCalories: number | null;
  readonly totalSteps: number | null;
  readonly aerobicSteps: number | null;
  readonly weightKg: number | null;
  readonly bpPulse: string;
  readonly bowel: string;
  readonly alcoholNuts: string;
  readonly remarks: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface BackupData {
  readonly version: 1;
  readonly exportedAt: string;
  readonly profile: PatientProfile | null;
  readonly entries: readonly DailyEntryBackup[];
}

export function createEmptyMeal(): MealEntry {
  return {
    description: "",
    photoBlob: null,
    photoThumbnail: null,
    isNil: false,
  };
}

export function createEmptyEntry(date: string): DailyEntry {
  const now = new Date().toISOString();
  return {
    id: uuidv4(),
    date,
    breakfast: createEmptyMeal(),
    lunch: createEmptyMeal(),
    dinner: createEmptyMeal(),
    distanceKm: null,
    kCalories: null,
    totalSteps: null,
    aerobicSteps: null,
    weightKg: null,
    bpPulse: "",
    bowel: "",
    alcoholNuts: "",
    remarks: "",
    createdAt: now,
    updatedAt: now,
  };
}
