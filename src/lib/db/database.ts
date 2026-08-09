import Dexie, { type Table } from "dexie";
import type { PatientProfile, DailyEntry } from "./types";

class DietTrackerDB extends Dexie {
  profile!: Table<PatientProfile, string>;
  entries!: Table<DailyEntry, string>;

  constructor() {
    super("DietTrackerDB");

    // Deploying new app code never touches this IndexedDB — it's a separate
    // per-origin store the browser keeps across releases. The only way a
    // future code change wipes patient data is *this* schema definition:
    // never lower this version number, never rename the DB, and if you add
    // a field/index, bump to version(4) with .stores() + .upgrade() rather
    // than editing this block in place — Dexie treats an in-place edit to
    // an existing version as a mismatch and can trigger a destructive reopen.
    this.version(3).stores({
      profile: "id",
      entries: "id, &date",
    });
  }
}

export const db = new DietTrackerDB();
