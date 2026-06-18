import { useMemo, useState } from "react";
import { Button, I, ProgressBar } from "./RunnerComponents";
import type { RunnerEvent } from "./runnerEvents";
import { useLang } from "./i18n";
import {
  parseEventDate,
  groupEventsByMonth,
  monthHistogram,
  yearsWithEvents,
} from "@/lib/eventCalendar";

const fmtPrice = (n: number) =>
  new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", minimumFractionDigits: 0 }).format(n);

const scrollToMonth = (key: string) =>
  document.getElementById(`cal-${key}`)?.scrollIntoView({ behavior: "smooth", block: "start" });

// ————— MONTH OVERVIEW STRIP ———

function MonthStrip({
  histogram,
  populatedKeys,
}: {
  histogram: number[];
  populatedKeys: Record<number, string>; // monthIndex -> group key
}) {
  const { t, locale } = useLang();
  const monthShort = (m: number) => new Intl.DateTimeFormat(locale, { month: "short" }).format(new Date(2000, m, 1));
  return (
    <div
      style={{
        display: "flex",
        gap: 6,
        overflowX: "auto",
        paddingBottom: 4,
        scrollbarWidth: "thin",
      }}
    >
      {Array.from({ length: 12 }, (_, i) => {
        const count = histogram[i];
        const active = count > 0;
        return (
          <button
            key={i}
            disabled={!active}
            onClick={() => active && scrollToMonth(populatedKeys[i])}
            title={active ? t("calendar.monthRaces", { count }) : undefined}
            style={{
              flex: "1 0 auto",
              minWidth: 60,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              padding: "10px 8px",
              borderRadius: 10,
              border: `1px solid ${active ? "hsl(var(--mt-brand) / .3)" : "hsl(var(--mt-border))"}`,
              background: active ? "hsl(var(--mt-brand) / .06)" : "hsl(var(--mt-card))",
              color: active ? "hsl(var(--mt-fg))" : "hsl(var(--mt-fg-muted))",
              cursor: active ? "pointer" : "default",
              opacity: active ? 1 : 0.55,
              transition: "background .15s, border-color .15s",
            }}
          >
            <span style={{ font: "600 13px/1 var(--mt-font-sans)", letterSpacing: ".02em" }}>{monthShort(i)}</span>
            <span
              style={{
                font: "600 11px/1 var(--mt-font-sans)",
                color: active ? "hsl(var(--mt-brand))" : "hsl(var(--mt-fg-muted))",
              }}
            >
              {active ? t("calendar.monthRaces", { count }) : "—"}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ————— AGENDA ROW ———

function CalendarRow({ event, onOpen }: { event: RunnerEvent; onOpen?: (e: RunnerEvent) => void }) {
  const { t, locale } = useLang();
  const d = parseEventDate(event.date);
  const day = isNaN(d.getTime()) ? event.dateShort.split(" ")[0] : String(d.getDate());
  const mon = isNaN(d.getTime())
    ? event.dateShort.split(" ")[1] ?? ""
    : new Intl.DateTimeFormat(locale, { month: "short" }).format(d).toUpperCase();
  const pct = Math.round((event.sold / event.capacity) * 100);
  const almostFull = pct >= 90;

  return (
    <div
      className="mt-card"
      onClick={() => onOpen?.(event)}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "var(--mt-shadow-elevated)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "var(--mt-shadow-card)"; }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 18,
        flexWrap: "wrap",
        padding: 16,
        background: "hsl(var(--mt-card))",
        border: "1px solid hsl(var(--mt-border))",
        borderRadius: 12,
        boxShadow: "var(--mt-shadow-card)",
        cursor: onOpen ? "pointer" : "default",
        transition: "box-shadow .2s",
      }}
    >
      {/* Date tile */}
      <div
        style={{
          flex: "0 0 auto",
          width: 60,
          textAlign: "center",
          padding: "10px 0",
          borderRadius: 10,
          background: "hsl(var(--mt-brand) / .1)",
          color: "hsl(var(--mt-brand))",
        }}
      >
        <div style={{ font: "700 24px/1 var(--mt-font-sans)", letterSpacing: "-0.02em" }}>{day}</div>
        <div style={{ font: "600 11px/1 var(--mt-font-sans)", marginTop: 4, letterSpacing: ".06em" }}>{mon}</div>
      </div>

      {/* Title + meta */}
      <div style={{ flex: "1 1 220px", minWidth: 200 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
          <h3 style={{ font: "600 17px/1.25 var(--mt-font-sans)", color: "hsl(var(--mt-fg))", margin: 0, letterSpacing: "-0.01em" }}>
            {event.title}
          </h3>
          {event.tag && (
            <span style={{ font: "600 10px/1 var(--mt-font-sans)", color: "hsl(var(--mt-brand))", background: "hsl(var(--mt-brand) / .1)", padding: "4px 8px", borderRadius: 9999, textTransform: "uppercase", letterSpacing: ".04em" }}>
              {event.tag}
            </span>
          )}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, font: "400 13px/1 var(--mt-font-sans)", color: "hsl(var(--mt-fg-muted))", marginBottom: 10 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><I name="pin" size={13} /> {event.province}</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><I name="trendUp" size={13} /> {event.elevation}</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            {event.distances.map((dist) => (
              <span key={dist} style={{ font: "500 11px/1 var(--mt-font-sans)", color: "hsl(var(--mt-fg))", background: "hsl(var(--mt-muted))", padding: "4px 8px", borderRadius: 9999 }}>{dist}</span>
            ))}
          </span>
        </div>
        <div style={{ maxWidth: 320 }}>
          <div style={{ display: "flex", justifyContent: "space-between", font: "500 11px/1 var(--mt-font-sans)", marginBottom: 5 }}>
            <span style={{ color: almostFull ? "hsl(var(--mt-brand))" : "hsl(var(--mt-fg-muted))" }}>
              {almostFull ? t("calendar.almostFull") : t("calendar.spotsLeft", { count: event.capacity - event.sold })}
            </span>
            <span style={{ color: "hsl(var(--mt-fg-muted))" }}>{pct}%</span>
          </div>
          <ProgressBar value={event.sold} max={event.capacity} height={5} />
        </div>
      </div>

      {/* Price + CTA */}
      <div style={{ flex: "0 0 auto", marginLeft: "auto", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
        <div>
          <div style={{ font: "400 10px/1 var(--mt-font-sans)", color: "hsl(var(--mt-fg-muted))", textTransform: "uppercase", letterSpacing: ".06em", textAlign: "right" }}>{t("card.from")}</div>
          <div style={{ font: "700 20px/1 var(--mt-font-sans)", color: "hsl(var(--mt-fg))", marginTop: 4 }}>{fmtPrice(event.price)}</div>
        </div>
        <Button variant="primary" size="sm" rightIcon="chevRight">{t("card.register")}</Button>
      </div>
    </div>
  );
}

// ————— CALENDAR VIEW ———

export default function CalendarView({
  events,
  onOpen,
}: {
  events: RunnerEvent[];
  onOpen?: (e: RunnerEvent) => void;
}) {
  const { t, locale } = useLang();
  const years = useMemo(() => yearsWithEvents(events), [events]);
  const [year, setYear] = useState(() => years[0] ?? new Date().getFullYear());

  // Keep the selected year valid as the filtered event set changes.
  const activeYear = years.includes(year) ? year : years[0] ?? year;

  const histogram = useMemo(() => monthHistogram(events, activeYear), [events, activeYear]);
  const groups = useMemo(
    () => groupEventsByMonth(events).filter((g) => g.year === activeYear),
    [events, activeYear],
  );

  const populatedKeys = useMemo(() => {
    const map: Record<number, string> = {};
    for (const g of groups) map[g.month] = g.key;
    return map;
  }, [groups]);

  // Month name localised via Intl, year appended as a plain number so it stays
  // Gregorian (matches the year navigator and event data) — th-TH's Intl year
  // would otherwise switch to the Buddhist era and disagree with the nav.
  const monthLong = (y: number, m: number) =>
    `${new Intl.DateTimeFormat(locale, { month: "long" }).format(new Date(y, m, 1))} ${y}`;

  const yearIdx = years.indexOf(activeYear);
  const prevYear = yearIdx > 0 ? years[yearIdx - 1] : null;
  const nextYear = yearIdx >= 0 && yearIdx < years.length - 1 ? years[yearIdx + 1] : null;
  const totalRaces = groups.reduce((n, g) => n + g.events.length, 0);

  if (events.length === 0) {
    return (
      <div style={{ padding: 64, textAlign: "center", border: "1px dashed hsl(var(--mt-border))", borderRadius: 12, background: "hsl(var(--mt-card))" }}>
        <div style={{ font: "600 18px/1 var(--mt-font-sans)", color: "hsl(var(--mt-fg))", marginBottom: 8 }}>{t("calendar.emptyTitle")}</div>
        <div style={{ font: "400 14px/1.5 var(--mt-font-sans)", color: "hsl(var(--mt-fg-muted))" }}>{t("calendar.emptyBody")}</div>
      </div>
    );
  }

  return (
    <div>
      {/* Year nav + month overview */}
      <div style={{ background: "hsl(var(--mt-card))", border: "1px solid hsl(var(--mt-border))", borderRadius: 14, padding: 16, marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 14, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Button
              variant="outline"
              size="icon"
              disabled={prevYear === null}
              onClick={() => prevYear !== null && setYear(prevYear)}
              style={{ opacity: prevYear === null ? 0.4 : 1 }}
              aria-label={t("calendar.prevYear")}
            >
              <I name="chevRight" size={16} style={{ transform: "scaleX(-1)" }} />
            </Button>
            <div style={{ font: "700 22px/1 var(--mt-font-sans)", color: "hsl(var(--mt-fg))", letterSpacing: "-0.02em", minWidth: 64, textAlign: "center" }}>
              {activeYear}
            </div>
            <Button
              variant="outline"
              size="icon"
              disabled={nextYear === null}
              onClick={() => nextYear !== null && setYear(nextYear)}
              style={{ opacity: nextYear === null ? 0.4 : 1 }}
              aria-label={t("calendar.nextYear")}
            >
              <I name="chevRight" size={16} />
            </Button>
          </div>
          <div style={{ font: "500 13px/1 var(--mt-font-sans)", color: "hsl(var(--mt-fg-muted))" }}>
            {t("calendar.racesThisYear", { count: totalRaces })}
          </div>
        </div>
        <MonthStrip histogram={histogram} populatedKeys={populatedKeys} />
      </div>

      {/* Month-grouped agenda */}
      <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
        {groups.map((g) => (
          <section key={g.key} id={`cal-${g.key}`} style={{ scrollMarginTop: 80 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid hsl(var(--mt-border))" }}>
              <h3 style={{ font: "700 20px/1 var(--mt-font-sans)", color: "hsl(var(--mt-fg))", margin: 0, letterSpacing: "-0.01em" }}>{monthLong(g.year, g.month)}</h3>
              <span style={{ font: "500 13px/1 var(--mt-font-sans)", color: "hsl(var(--mt-fg-muted))" }}>
                {t("calendar.monthRaces", { count: g.events.length })}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {g.events.map((e) => (
                <CalendarRow key={e.id} event={e} onOpen={onOpen} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
