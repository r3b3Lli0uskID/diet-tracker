import { db } from "./database";
import type { PatientProfile } from "./types";

export async function getProfile(): Promise<PatientProfile | undefined> {
  return db.profile.get("default");
}

export async function saveProfile(
  data: Omit<PatientProfile, "id" | "createdAt" | "updatedAt">
): Promise<void> {
  const now = new Date().toISOString();
  const existing = await db.profile.get("default");

  const profile: PatientProfile = {
    ...data,
    id: "default",
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  await db.profile.put(profile);
}
