"use client";

import { useCallback, useEffect, useState } from "react";
import { db } from "@/lib/db/database";
import { saveEntry as saveEntryRepo } from "@/lib/db/entry-repo";
import { createEmptyEntry } from "@/lib/db/types";
import type { DailyEntry } from "@/lib/db/types";

interface UseEntryReturn {
  readonly entry: DailyEntry | null;
  readonly saveEntry: (entry: DailyEntry) => Promise<void>;
  readonly isLoading: boolean;
}

export function useEntry(date: string): UseEntryReturn {
  const [entry, setEntry] = useState<DailyEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setEntry(null);

    async function load() {
      try {
        // Find existing entry for this date
        const existing = await db.entries.where("date").equals(date).first();

        if (existing) {
          if (!cancelled) {
            setEntry(existing);
            setIsLoading(false);
          }
          return;
        }

        // No entry exists — create one
        const empty = createEmptyEntry(date);
        try {
          await db.entries.add(empty);
        } catch {
          // If add fails (duplicate key race), try fetching again
          const retry = await db.entries.where("date").equals(date).first();
          if (retry && !cancelled) {
            setEntry(retry);
            setIsLoading(false);
            return;
          }
        }

        if (!cancelled) {
          setEntry(empty);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("useEntry load failed:", err);
        // Create in-memory entry so the form still works
        if (!cancelled) {
          setEntry(createEmptyEntry(date));
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [date]);

  const saveEntry = useCallback(
    async (updated: DailyEntry): Promise<void> => {
      try {
        await saveEntryRepo(updated);
      } catch (err) {
        console.error("saveEntry failed:", err);
      }
      setEntry(updated);
    },
    []
  );

  return { entry, saveEntry, isLoading };
}
