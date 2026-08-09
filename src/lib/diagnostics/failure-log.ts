const STORAGE_KEY = "dt-failure-log";
const MAX_ENTRIES = 20;

export interface FailureLogEntry {
  readonly ts: string;
  readonly op: string;
  readonly errorName: string;
  readonly errorMessage: string;
  readonly kind: string;
}

function readLog(): FailureLogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as FailureLogEntry[]) : [];
  } catch {
    return [];
  }
}

export function logFailure(op: string, error: unknown, kind = "unknown"): void {
  if (typeof window === "undefined") return;
  try {
    const entry: FailureLogEntry = {
      ts: new Date().toISOString(),
      op,
      errorName: error instanceof Error ? error.name : "Unknown",
      errorMessage: error instanceof Error ? error.message : String(error),
      kind,
    };
    const log = readLog();
    log.push(entry);
    while (log.length > MAX_ENTRIES) log.shift();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
  } catch {
    // localStorage unavailable or full — best-effort logging only
  }
}

export function getFailureLog(): FailureLogEntry[] {
  if (typeof window === "undefined") return [];
  return readLog();
}
