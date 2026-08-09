"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isSubstantiveEntry } from "@/lib/db/entry-helpers";
import {
  daysSince,
  getLastBackupAt,
  shouldShowBackupNudge,
  snoozeBackupNudge,
} from "@/lib/backup/backup-reminder";
import { isStorageBannerShowing } from "@/components/storage-guardian";
import type { DailyEntry } from "@/lib/db/types";

interface BackupNudgeBannerProps {
  readonly entries: readonly DailyEntry[];
  readonly entriesLoading: boolean;
}

export function BackupNudgeBanner({
  entries,
  entriesLoading,
}: BackupNudgeBannerProps) {
  const [show, setShow] = useState(false);
  const [lastBackupLabel, setLastBackupLabel] = useState("never");

  useEffect(() => {
    if (entriesLoading) return;
    // Storage-denied warning takes priority — never show both at once.
    if (isStorageBannerShowing()) {
      setShow(false);
      return;
    }
    const substantiveCount = entries.filter(isSubstantiveEntry).length;
    setShow(shouldShowBackupNudge(substantiveCount));

    const last = getLastBackupAt();
    if (last) {
      const days = daysSince(last);
      setLastBackupLabel(days === 0 ? "today" : `${days} ${days === 1 ? "day" : "days"} ago`);
    } else {
      setLastBackupLabel("never");
    }
  }, [entries, entriesLoading]);

  const dismiss = () => {
    snoozeBackupNudge();
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="mx-4 mt-3 flex items-start gap-2 rounded-xl bg-teal-50 p-3 text-teal-800">
      <ShieldCheck className="mt-0.5 size-4 shrink-0" />
      <div className="flex-1 text-xs leading-relaxed">
        <p className="font-semibold">Time for a backup</p>
        <p className="mt-1">
          Your last backup was {lastBackupLabel}. Keep a recent copy safe in
          case anything happens to this phone.
        </p>
        <Button
          size="sm"
          className="mt-2 h-8 rounded-lg bg-teal-600 px-3 text-xs font-semibold text-white hover:bg-teal-700"
          nativeButton={false}
          render={<Link href="/export" />}
        >
          Save Backup Now
        </Button>
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="shrink-0 rounded-full p-1 text-teal-600 hover:bg-teal-100"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
