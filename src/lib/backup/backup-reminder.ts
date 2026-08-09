const LAST_BACKUP_KEY = "dt-last-backup-at";
const SNOOZE_UNTIL_KEY = "dt-backup-nudge-snoozed-until";
const NUDGE_INTERVAL_DAYS = 7;
const SNOOZE_DAYS = 3;
const MIN_SUBSTANTIVE_ENTRIES = 3;

export function recordBackupNow(): void {
  localStorage.setItem(LAST_BACKUP_KEY, new Date().toISOString());
}

export function getLastBackupAt(): string | null {
  return localStorage.getItem(LAST_BACKUP_KEY);
}

export function snoozeBackupNudge(): void {
  const until = new Date();
  until.setDate(until.getDate() + SNOOZE_DAYS);
  localStorage.setItem(SNOOZE_UNTIL_KEY, until.toISOString());
}

function isSnoozed(): boolean {
  const until = localStorage.getItem(SNOOZE_UNTIL_KEY);
  return until !== null && new Date(until).getTime() > Date.now();
}

export function daysSince(iso: string): number {
  const ms = Date.now() - new Date(iso).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

// Never-backed-up counts as "overdue" once there's real data worth losing,
// rather than waiting a literal 7 days from account creation.
export function shouldShowBackupNudge(substantiveEntryCount: number): boolean {
  if (substantiveEntryCount < MIN_SUBSTANTIVE_ENTRIES) return false;
  if (isSnoozed()) return false;
  const last = getLastBackupAt();
  if (!last) return true;
  return daysSince(last) >= NUDGE_INTERVAL_DAYS;
}
