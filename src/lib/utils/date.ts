const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

/**
 * Returns today's date as YYYY-MM-DD string.
 */
export function today(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Formats a YYYY-MM-DD date string to human-readable form.
 * Example: "2026-03-28" -> "28 Mar 2026"
 */
export function formatDate(date: string): string {
  const [yearStr, monthStr, dayStr] = date.split("-");
  const year = yearStr;
  const monthIndex = parseInt(monthStr, 10) - 1;
  const day = parseInt(dayStr, 10);

  if (monthIndex < 0 || monthIndex > 11 || isNaN(day)) {
    return date;
  }

  return `${day} ${MONTH_NAMES[monthIndex]} ${year}`;
}

/**
 * Formats a YYYY-MM-DD date string to short form.
 * Example: "2026-03-28" -> "28/03"
 */
export function formatDateShort(date: string): string {
  const [, monthStr, dayStr] = date.split("-");
  return `${dayStr}/${monthStr}`;
}
