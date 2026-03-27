"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useCallback, useState, useEffect } from "react";
import { db } from "@/lib/db/database";
import { saveProfile as saveProfileRepo } from "@/lib/db/profile-repo";
import type { PatientProfile } from "@/lib/db/types";

interface UseProfileReturn {
  readonly profile: PatientProfile | null;
  readonly saveProfile: (
    data: Omit<PatientProfile, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  readonly isLoading: boolean;
}

export function useProfile(): UseProfileReturn {
  const [isLoading, setIsLoading] = useState(true);

  const result = useLiveQuery(async () => {
    const p = await db.profile.get("default");
    return p ?? null;
  });

  useEffect(() => {
    if (result !== undefined) {
      setIsLoading(false);
    }
  }, [result]);

  const saveProfile = useCallback(
    async (
      data: Omit<PatientProfile, "id" | "createdAt" | "updatedAt">
    ): Promise<void> => {
      await saveProfileRepo(data);
    },
    []
  );

  return { profile: result ?? null, saveProfile, isLoading };
}
