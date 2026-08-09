import type { DailyEntry, MealEntry } from "./types";

export function isMealLogged(meal: MealEntry): boolean {
  return meal.isNil || meal.description.trim().length > 0 || meal.photoBlob !== null;
}

export function isSubstantiveEntry(entry: DailyEntry): boolean {
  return (
    isMealLogged(entry.breakfast) ||
    isMealLogged(entry.lunch) ||
    isMealLogged(entry.dinner) ||
    entry.distanceKm !== null ||
    entry.kCalories !== null ||
    entry.totalSteps !== null ||
    entry.aerobicSteps !== null ||
    entry.weightKg !== null ||
    entry.bpPulse.trim().length > 0 ||
    entry.bowel.trim().length > 0 ||
    entry.alcoholNuts.trim().length > 0 ||
    entry.remarks.trim().length > 0
  );
}
