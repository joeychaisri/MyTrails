// Shared event data for the runner side.
// Single import point — useRunnerEvents() adapts the shared store (EventsContext)
// into the RunnerEvent shape, and every runner view (landing grid/list, calendar)
// updates at once.

import { useMemo } from "react";
import { format } from "date-fns";
import { useEventsStore } from "@/contexts/EventsContext";
import { eventPhase, nextSalesOpenDate } from "@/lib/eventPhase";
import type { Event } from "@/data/mockData";
import heroImg from "@/assets/hero-trail.webp";

export interface RunnerEvent {
  id: string;
  title: string;
  province: string;
  region: string;
  /** Human date, "MMM DD, YYYY" — parsed by src/lib/eventCalendar.ts */
  date: string;
  dateShort: string;
  distances: string[];
  elevation: string;
  price: number;
  sold: number;
  capacity: number;
  image: string;
  tag: string;
}

const REGION_BY_PROVINCE: Record<string, string> = {
  "Chiang Mai": "north",
  "Chiang Rai": "north",
  "Mae Hong Son": "north",
  Loei: "north",
  Nan: "north",
  Phetchabun: "north",
  Tak: "north",
  Krabi: "south",
  Phuket: "south",
  "Surat Thani": "south",
  "Prachuap Khiri Khan": "south",
};

/** Province → landing filter region. Anything unmapped is treated as central. */
export function provinceRegion(province: string): string {
  return REGION_BY_PROVINCE[province] ?? "central";
}

function runnerTag(event: Event): string {
  if (event.capacity > 0 && event.sold >= event.capacity) return "Sold Out";
  const phase = eventPhase(event);
  if (phase === "registration_open") return "Open";
  if (phase === "upcoming") {
    const opensAt = nextSalesOpenDate(event);
    return opensAt ? `Opens ${format(opensAt, "MMM d")}` : "Coming Soon";
  }
  return "Closed";
}

function toRunnerEvent(event: Event): RunnerEvent {
  // Store dates are ISO "yyyy-MM-dd"; parse as local midnight (same convention
  // as eventPhase). date-fns format is Gregorian regardless of UI locale — the
  // runner views localise month names themselves via Intl (see CLAUDE.md i18n).
  const parsed = event.date ? new Date(`${event.date}T00:00:00`) : new Date(NaN);
  const valid = !isNaN(parsed.getTime());

  const distances = event.categories
    .map((c) => c.distance)
    .sort((a, b) => a - b)
    .map((d) => `${d}K`);
  const maxElevation = event.categories.reduce((max, c) => Math.max(max, c.elevation), 0);
  const prices = event.categories.flatMap((c) => c.tickets).map((t) => t.price);

  return {
    id: event.id,
    title: event.title,
    province: event.province,
    region: provinceRegion(event.province),
    date: valid ? format(parsed, "MMM d, yyyy") : "",
    dateShort: valid ? format(parsed, "dd MMM").toUpperCase() : "",
    distances,
    elevation: `${maxElevation.toLocaleString()}m`,
    price: prices.length ? Math.min(...prices) : 0,
    sold: event.sold,
    capacity: event.capacity,
    image: event.coverImage || heroImg,
    tag: runnerTag(event),
  };
}

/** Live events from the shared store, mapped for the runner-side views. */
export function useRunnerEvents(): RunnerEvent[] {
  const { events } = useEventsStore();
  return useMemo(
    () => events.filter((e) => e.status === "live").map(toRunnerEvent),
    [events],
  );
}

export const REGIONS = [
  { value: "all",     label: "All Regions" },
  { value: "north",   label: "North" },
  { value: "central", label: "Central" },
  { value: "south",   label: "South" },
];
