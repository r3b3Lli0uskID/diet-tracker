"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db/database";
import type { DailyEntry } from "@/lib/db/types";

interface UseEntriesReturn {
  readonly entries: DailyEntry[];
  readonly isLoading: boolean;
}

export function useEntries(
  startDate?: string,
  endDate?: string
): UseEntriesReturn {
  const entries = useLiveQuery(() => {
    if (startDate && endDate) {
      return db.entries
        .where("date")
        .between(startDate, endDate, true, true)
        .reverse()
        .toArray();
    }
    return db.entries.orderBy("date").reverse().toArray();
  }, [startDate, endDate]);

  const isLoading = entries === undefined;

  return { entries: entries ?? [], isLoading };
}
