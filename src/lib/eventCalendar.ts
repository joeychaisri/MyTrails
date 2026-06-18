// Pure date helpers for the runner-side Calendar View.
// Kept free of React so the grouping logic can be unit-tested in isolation.

const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTH_FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export const MONTH_LABELS_SHORT = MONTH_ABBR;

/** Parse a "MMM DD, YYYY" string (e.g. "Apr 27, 2026") into a local Date.
 *  Returns an Invalid Date if the string doesn't match — callers should skip those. */
export function parseEventDate(dateStr: string): Date {
  const m = dateStr.trim().match(/^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})$/);
  if (!m) return new Date(NaN);
  const monthIdx = MONTH_ABBR.findIndex((mo) => mo.toLowerCase() === m[1].slice(0, 3).toLowerCase());
  if (monthIdx < 0) return new Date(NaN);
  return new Date(Number(m[3]), monthIdx, Number(m[2]));
}

export interface MonthGroup<T> {
  /** "YYYY-MM" — stable id for anchors/keys */
  key: string;
  year: number;
  /** 0-based month index */
  month: number;
  /** "April 2026" */
  label: string;
  events: T[];
}

/** Group events by calendar month, sorted chronologically.
 *  Events within each month are sorted by day. Unparseable dates are dropped. */
export function groupEventsByMonth<T extends { date: string }>(events: T[]): MonthGroup<T>[] {
  const map = new Map<string, MonthGroup<T>>();
  for (const e of events) {
    const d = parseEventDate(e.date);
    if (isNaN(d.getTime())) continue;
    const year = d.getFullYear();
    const month = d.getMonth();
    const key = `${year}-${String(month + 1).padStart(2, "0")}`;
    if (!map.has(key)) {
      map.set(key, { key, year, month, label: `${MONTH_FULL[month]} ${year}`, events: [] });
    }
    map.get(key)!.events.push(e);
  }
  const groups = [...map.values()];
  for (const g of groups) {
    g.events.sort((a, b) => parseEventDate(a.date).getTime() - parseEventDate(b.date).getTime());
  }
  groups.sort((a, b) => a.year - b.year || a.month - b.month);
  return groups;
}

/** Count of events per month (length-12 array, index 0 = Jan) for a given year. */
export function monthHistogram<T extends { date: string }>(events: T[], year: number): number[] {
  const counts = new Array(12).fill(0);
  for (const e of events) {
    const d = parseEventDate(e.date);
    if (!isNaN(d.getTime()) && d.getFullYear() === year) counts[d.getMonth()]++;
  }
  return counts;
}

/** Sorted, unique list of years that have at least one (parseable) event. */
export function yearsWithEvents<T extends { date: string }>(events: T[]): number[] {
  const years = new Set<number>();
  for (const e of events) {
    const d = parseEventDate(e.date);
    if (!isNaN(d.getTime())) years.add(d.getFullYear());
  }
  return [...years].sort((a, b) => a - b);
}
