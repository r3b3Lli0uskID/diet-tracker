import { db } from "./database";
import type { DailyEntry } from "./types";

export type DbErrorKind = "quota" | "aborted" | "blocked" | "unknown";

export function classifyDbError(err: unknown): DbErrorKind {
  if (err instanceof Error) {
    if (err.name === "QuotaExceededError") return "quota";
    if (err.name === "AbortError") return "aborted";
    if (err.name === "VersionError" || err.name === "InvalidStateError") return "blocked";
  }
  return "unknown";
}

export function dbErrorMessage(kind: DbErrorKind): string {
  switch (kind) {
    case "quota":
      return "Your device is out of storage. Free up space, then download a backup.";
    case "aborted":
      return "Save was interrupted. Please try again.";
    case "blocked":
      return "Storage is temporarily unavailable. Please reopen the app.";
    default:
      return "Failed to save. Please try again.";
  }
}

export async function getEntryByDate(
  date: string
): Promise<DailyEntry | undefined> {
  return db.entries.where("date").equals(date).first();
}

export async function getAllEntries(): Promise<DailyEntry[]> {
  return db.entries.orderBy("date").reverse().toArray();
}

export async function getEntriesInRange(
  start: string,
  end: string
): Promise<DailyEntry[]> {
  return db.entries
    .where("date")
    .between(start, end, true, true)
    .reverse()
    .toArray();
}

export async function saveEntry(entry: DailyEntry): Promise<DailyEntry> {
  const updatedEntry: DailyEntry = {
    ...entry,
    updatedAt: new Date().toISOString(),
  };
  await db.entries.put(updatedEntry);
  return updatedEntry;
}

export async function deleteEntry(id: string): Promise<void> {
  await db.entries.delete(id);
}
