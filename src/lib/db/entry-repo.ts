import { db } from "./database";
import type { DailyEntry } from "./types";

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

export async function saveEntry(entry: DailyEntry): Promise<void> {
  const updatedEntry: DailyEntry = {
    ...entry,
    updatedAt: new Date().toISOString(),
  };
  await db.entries.put(updatedEntry);
}

export async function deleteEntry(id: string): Promise<void> {
  await db.entries.delete(id);
}
