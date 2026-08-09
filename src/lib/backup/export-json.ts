import { db } from "@/lib/db/database";
import type {
  BackupData,
  DailyEntry,
  DailyEntryBackup,
  MealEntry,
  MealEntryBackup,
} from "@/lib/db/types";

async function blobToBase64(blob: Blob | null): Promise<string | null> {
  if (!blob) return null;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result === "string") {
        resolve(result);
      } else {
        reject(new Error("FileReader did not return a string"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read blob"));
    reader.readAsDataURL(blob);
  });
}

async function mealToBackup(meal: MealEntry): Promise<MealEntryBackup> {
  return {
    description: meal.description,
    photoBase64: await blobToBase64(meal.photoBlob),
    photoThumbnailBase64: await blobToBase64(meal.photoThumbnail),
    isNil: meal.isNil,
  };
}

async function entryToBackup(entry: DailyEntry): Promise<DailyEntryBackup> {
  return {
    id: entry.id,
    date: entry.date,
    breakfast: await mealToBackup(entry.breakfast),
    lunch: await mealToBackup(entry.lunch),
    dinner: await mealToBackup(entry.dinner),
    distanceKm: entry.distanceKm,
    kCalories: entry.kCalories,
    totalSteps: entry.totalSteps,
    aerobicSteps: entry.aerobicSteps,
    weightKg: entry.weightKg,
    bpPulse: entry.bpPulse,
    bowel: entry.bowel,
    alcoholNuts: entry.alcoholNuts,
    remarks: entry.remarks,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  };
}

export async function exportAllData(): Promise<string> {
  const profile = await db.profile.get("default");
  const entries = await db.entries.orderBy("date").toArray();

  const backupEntries: DailyEntryBackup[] = [];
  for (const entry of entries) {
    backupEntries.push(await entryToBackup(entry));
  }

  const backup: BackupData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    profile: profile ?? null,
    entries: backupEntries,
  };

  return JSON.stringify(backup, null, 2);
}

export function downloadJson(jsonString: string, filename: string): void {
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Revoking immediately after click() is a known cause of aborted downloads
  // on some browsers (the click is queued, not synchronous) — give it a beat.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export type BackupDeliveryOutcome = "shared" | "cancelled" | "downloaded";

/**
 * iOS Safari's `download` attribute on blob: URLs is unreliable, so a plain
 * downloadJson() call can silently fail there. Where the Web Share API with a
 * files payload is available, route through the OS share sheet instead — the
 * patient picks Files/iCloud/Drive/etc. directly, which is both more reliable
 * and (per PDPA review) creates no new data-processing relationship, since the
 * app never transmits the file itself. Falls back to downloadJson() anywhere
 * Web Share isn't available (desktop browsers, older WebViews).
 */
export async function backupViaShareOrDownload(
  jsonString: string,
  filename: string
): Promise<BackupDeliveryOutcome> {
  const blob = new Blob([jsonString], { type: "application/json" });
  const file = new File([blob], filename, { type: "application/json" });

  const canShareFile =
    typeof navigator.share === "function" &&
    typeof navigator.canShare === "function" &&
    navigator.canShare({ files: [file] });

  if (canShareFile) {
    try {
      await navigator.share({ files: [file], title: "DietTracker Backup" });
      return "shared";
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return "cancelled";
      }
      // Any other share failure falls through to the download path below.
    }
  }

  downloadJson(jsonString, filename);
  return "downloaded";
}
