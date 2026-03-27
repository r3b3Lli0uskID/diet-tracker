import Dexie, { type Table } from "dexie";
import type { PatientProfile, DailyEntry } from "./types";

class DietTrackerDB extends Dexie {
  profile!: Table<PatientProfile, string>;
  entries!: Table<DailyEntry, string>;

  constructor() {
    super("DietTrackerDB");

    // Single schema version — keeps it simple
    this.version(3).stores({
      profile: "id",
      entries: "id, &date",
    });
  }
}

export const db = new DietTrackerDB();
