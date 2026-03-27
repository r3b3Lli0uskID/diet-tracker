import { db } from "@/lib/db/database";
import type {
  BackupData,
  DailyEntry,
  MealEntry,
  MealEntryBackup,
} from "@/lib/db/types";

function base64ToBlob(base64: string | null): Blob | null {
  if (!base64) return null;

  try {
    const parts = base64.split(",");
    if (parts.length < 2) return null;

    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : "application/octet-stream";
    const byteString = atob(parts[1]);
    const bytes = new Uint8Array(byteString.length);

    for (let i = 0; i < byteString.length; i++) {
      bytes[i] = byteString.charCodeAt(i);
    }

    return new Blob([bytes], { type: mime });
  } catch {
    return null;
  }
}

function mealFromBackup(meal: MealEntryBackup): MealEntry {
  return {
    description: meal.description,
    photoBlob: base64ToBlob(meal.photoBase64),
    photoThumbnail: base64ToBlob(meal.photoThumbnailBase64),
    isNil: meal.isNil,
  };
}

function isValidBackup(data: unknown): data is BackupData {
  if (typeof data !== "object" || data === null) return false;

  const obj = data as Record<string, unknown>;
  if (obj.version !== 1) return false;
  if (typeof obj.exportedAt !== "string") return false;
  if (!Array.isArray(obj.entries)) return false;

  return true;
}

export async function importFromJson(jsonString: string): Promise<number> {
  const parsed: unknown = JSON.parse(jsonString);

  if (!isValidBackup(parsed)) {
    throw new Error("Invalid backup file format");
  }

  let importedCount = 0;

  await db.transaction("rw", [db.profile, db.entries], async () => {
    if (parsed.profile) {
      await db.profile.put(parsed.profile);
    }

    for (const backupEntry of parsed.entries) {
      const entry: DailyEntry = {
        id: backupEntry.id,
        date: backupEntry.date,
        breakfast: mealFromBackup(backupEntry.breakfast),
        lunch: mealFromBackup(backupEntry.lunch),
        dinner: mealFromBackup(backupEntry.dinner),
        distanceKm: backupEntry.distanceKm,
        kCalories: backupEntry.kCalories,
        totalSteps: backupEntry.totalSteps,
        aerobicSteps: backupEntry.aerobicSteps,
        weightKg: backupEntry.weightKg,
        bpPulse: backupEntry.bpPulse,
        bowel: backupEntry.bowel,
        alcoholNuts: backupEntry.alcoholNuts,
        remarks: backupEntry.remarks,
        createdAt: backupEntry.createdAt,
        updatedAt: backupEntry.updatedAt,
      };

      await db.entries.put(entry);
      importedCount++;
    }
  });

  return importedCount;
}
