import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import heroImg from "@/assets/hero-trail.jpg";
import { Button, I, Logo, IconDisc, ProgressBar } from "./RunnerComponents";
import CalendarView from "./CalendarView";
import { MOCK_EVENTS, REGIONS, type RunnerEvent } from "./runnerEvents";
import { LanguageProvider, useLang } from "./i18n";

type ViewMode = "grid" | "list" | "calendar";

const RACE_TIERS = [
  { key: "tier1", km: "10 km",  elev: "300–700 m",     time: "1–2 hrs",   icon: "trendUp" },
  { key: "tier2", km: "21 km",  elev: "800–1,400 m",   time: "2.5–4 hrs", icon: "mountain" },
  { key: "tier3", km: "42 km",  elev: "1,800–2,600 m", time: "6–10 hrs",  icon: "award" },
  { key: "tier4", km: "70 km+", elev: "3,000+ m",      time: "12–20 hrs", icon: "clock" },
];

const WHY_POINTS = [
  { key: "point1", icon: "clipboardCheck" },
  { key: "point2", icon: "card" },
  { key: "point3", icon: "users" },
];

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// ————— LANGUAGE TOGGLE —————

function LangToggle() {
  const { lang, setLang } = useLang();
  const item = (l: "en" | "th", label: string) => (
    <button
      onClick={() => setLang(l)}
      aria-pressed={lang === l}
      style={{
        background: "none", border: 0, cursor: "pointer", padding: "4px 2px",
        font: `${lang === l ? 600 : 500} 14px/1 var(--mt-font-sans)`,
        color: lang === l ? "hsl(var(--mt-fg))" : "hsl(var(--mt-fg-muted))",
        transition: "color .15s",
      }}
    >
      {label}
    </button>
  );
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      {item("en", "EN")}
      <span style={{ color: "hsl(var(--mt-border))", font: "400 13px/1 var(--mt-font-sans)" }}>|</span>
      {item("th", "ไทย")}
    </div>
  );
}

// ————— NAV —————

function TopNav({ onCTA }: { onCTA: () => void }) {
  const navigate = useNavigate();
  const { t } = useLang();
  const link: React.CSSProperties = {
    color: "hsl(var(--mt-fg))", font: "500 14px/1 var(--mt-font-sans)",
    textDecoration: "none", padding: "8px 4px", transition: "color .15s",
  };
  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 50, height: 64,
      background: "hsl(var(--mt-card) / .85)", backdropFilter: "blur(10px)",
      borderBottom: "1px solid hsl(var(--mt-border))",
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", height: "100%", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Logo size="sm" />
        <div className="runner-nav-links" style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <a href="#events"     style={link}>{t("nav.findEvents")}</a>
          <a href="#categories" style={link}>{t("nav.categories")}</a>
          <a href="#why"        style={link}>{t("nav.why")}</a>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <LangToggle />
          <Button variant="ghost" size="sm" onClick={() => navigate("/organizer/login")}>{t("nav.login")}</Button>
          <Button variant="primary" size="sm" onClick={onCTA}>{t("nav.signup")}</Button>
        </div>
      </div>
    </nav>
  );
}

// ————— HERO —————

function HeroEditorial({ onBrowse, onCalendar }: { onBrowse: () => void; onCalendar: () => void }) {
  const { t } = useLang();
  const stats = [
    { v: "47",   k: "statEvents" },
    { v: "12K+", k: "statRunners" },
    { v: "76",   k: "statOrganizers" },
    { v: "4.9★", k: "statRating" },
  ];
  return (
    <section style={{ position: "relative", minHeight: 640, overflow: "hidden", background: "hsl(var(--mt-fg))" }}>
      <img src={heroImg} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, hsl(220 20% 10% / .85) 0%, hsl(220 20% 10% / .55) 45%, hsl(220 20% 10% / .25) 100%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 20% 70%, hsl(24 95% 46% / .18) 0%, transparent 55%)" }} />

      <div style={{ position: "relative", maxWidth: 1280, margin: "0 auto", padding: "120px 32px 64px", color: "#fff" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px",
          borderRadius: 9999, background: "hsl(0 0% 100% / .12)", backdropFilter: "blur(8px)",
          border: "1px solid hsl(0 0% 100% / .2)", font: "500 12px/1 var(--mt-font-sans)",
          letterSpacing: ".05em", textTransform: "uppercase", marginBottom: 24,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: 9999, background: "hsl(var(--mt-brand))" }} />
          {t("hero.badge")}
        </div>

        <h1 style={{ font: "700 clamp(48px, 7vw, 88px)/1.02 var(--mt-font-sans)", letterSpacing: "-0.03em", margin: "0 0 24px", maxWidth: 880 }}>
          {t("hero.headline1")}<br />{t("hero.headline2pre")}<span style={{ color: "hsl(24 95% 60%)" }}>{t("hero.headline2accent")}</span>
        </h1>

        <p style={{ font: "400 19px/1.55 var(--mt-font-sans)", color: "hsl(0 0% 100% / .85)", maxWidth: 560, margin: "0 0 36px" }}>
          {t("hero.subcopy")}
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 56 }}>
          <Button variant="primary" size="lg" onClick={onBrowse} rightIcon="chevRight">{t("hero.browse")}</Button>
          <Button size="lg" onClick={onCalendar} style={{ background: "hsl(0 0% 100% / .14)", color: "#fff", border: "1px solid hsl(0 0% 100% / .25)", backdropFilter: "blur(8px)" }}>
            <I name="calendar" size={16} /> {t("hero.viewCalendar")}
          </Button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 32, paddingTop: 32, borderTop: "1px solid hsl(0 0% 100% / .15)", maxWidth: 760 }}>
          {stats.map((s) => (
            <div key={s.k}>
              <div style={{ font: "700 28px/1 var(--mt-font-sans)", letterSpacing: "-0.02em" }}>{s.v}</div>
              <div style={{ font: "500 12px/1 var(--mt-font-sans)", color: "hsl(0 0% 100% / .65)", marginTop: 8, textTransform: "uppercase", letterSpacing: ".06em" }}>{t(`hero.${s.k}`)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ————— EVENT CARD —————

function EventCard({ event, layout = "grid", onOpen }: { event: RunnerEvent; layout?: "grid" | "list"; onOpen?: (e: RunnerEvent) => void }) {
  const { t } = useLang();
  const pct = (event.sold / event.capacity) * 100;
  const fmt = (n: number) => new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", minimumFractionDigits: 0 }).format(n);

  if (layout === "list") {
    return (
      <div
        className="mt-card"
        style={{ display: "grid", gridTemplateColumns: "200px 1fr auto", gap: 24, padding: 0, overflow: "hidden", cursor: "pointer", transition: "box-shadow .2s" }}
        onClick={() => onOpen?.(event)}
        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "var(--mt-shadow-elevated)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "var(--mt-shadow-card)"; }}
      >
        <div style={{ position: "relative", height: 140, background: "hsl(var(--mt-muted))" }}>
          <img src={event.image} alt={event.title} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", left: 12, top: 12, background: "hsl(var(--mt-brand))", color: "#fff", padding: "4px 10px", borderRadius: 9999, font: "600 11px/1 var(--mt-font-sans)", letterSpacing: ".04em" }}>
            {event.dateShort}
          </div>
        </div>
        <div style={{ padding: "20px 0", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h3 style={{ font: "600 19px/1.25 var(--mt-font-sans)", color: "hsl(var(--mt-fg))", margin: "0 0 8px", letterSpacing: "-0.01em" }}>{event.title}</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, font: "400 14px/1 var(--mt-font-sans)", color: "hsl(var(--mt-fg-muted))" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><I name="pin" size={14} /> {event.province}</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><I name="calendar" size={14} /> {event.date}</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><I name="trendUp" size={14} /> {event.elevation}</span>
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
            {event.distances.map((d) => (
              <span key={d} style={{ font: "500 12px/1 var(--mt-font-sans)", color: "hsl(var(--mt-fg))", background: "hsl(var(--mt-muted))", padding: "5px 10px", borderRadius: 9999 }}>{d}</span>
            ))}
          </div>
        </div>
        <div style={{ padding: "24px 28px 24px 0", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-end", gap: 12 }}>
          <div style={{ font: "400 12px/1 var(--mt-font-sans)", color: "hsl(var(--mt-fg-muted))", textTransform: "uppercase", letterSpacing: ".06em" }}>{t("card.from")}</div>
          <div style={{ font: "700 22px/1 var(--mt-font-sans)", color: "hsl(var(--mt-fg))" }}>{fmt(event.price)}</div>
          <Button variant="primary" size="sm" rightIcon="chevRight">{t("card.register")}</Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="event-card"
      style={{ background: "hsl(var(--mt-card))", border: "1px solid hsl(var(--mt-border))", borderRadius: 14, boxShadow: "var(--mt-shadow-card)", overflow: "hidden", transition: "box-shadow .2s, transform .2s", cursor: "pointer" }}
      onClick={() => onOpen?.(event)}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "var(--mt-shadow-elevated)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "var(--mt-shadow-card)"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={{ position: "relative", height: 180, overflow: "hidden", background: "hsl(var(--mt-muted))" }}>
        <img src={event.image} alt={event.title} loading="lazy" className="event-card-img" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .4s" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, hsl(220 20% 10% / .35) 0%, transparent 40%)" }} />
        <div style={{ position: "absolute", left: 14, top: 14, display: "inline-flex", alignItems: "center", gap: 6, background: "hsl(var(--mt-brand))", color: "#fff", padding: "5px 12px", borderRadius: 9999, font: "600 12px/1 var(--mt-font-sans)", letterSpacing: ".04em" }}>
          {event.dateShort}
        </div>
        {event.tag && (
          <div style={{ position: "absolute", right: 14, top: 14, background: "hsl(0 0% 100% / .92)", color: "hsl(var(--mt-fg))", padding: "4px 10px", borderRadius: 9999, font: "600 11px/1 var(--mt-font-sans)" }}>
            {event.tag}
          </div>
        )}
      </div>
      <div style={{ padding: 20 }}>
        <h3 style={{ font: "600 18px/1.3 var(--mt-font-sans)", color: "hsl(var(--mt-fg))", margin: "0 0 10px", letterSpacing: "-0.01em" }}>{event.title}</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, font: "400 13px/1 var(--mt-font-sans)", color: "hsl(var(--mt-fg-muted))", marginBottom: 14 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><I name="pin" size={13} /> {event.province}</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><I name="trendUp" size={13} /> {event.elevation}</span>
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          {event.distances.map((d) => (
            <span key={d} style={{ font: "500 12px/1 var(--mt-font-sans)", color: "hsl(var(--mt-fg))", background: "hsl(var(--mt-muted))", padding: "5px 10px", borderRadius: 9999 }}>{d}</span>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, font: "500 12px/1 var(--mt-font-sans)" }}>
          <span style={{ color: "hsl(var(--mt-fg-muted))" }}>{t("card.runners", { sold: event.sold, capacity: event.capacity })}</span>
          <span style={{ color: "hsl(var(--mt-fg))" }}>{Math.round(pct)}%</span>
        </div>
        <ProgressBar value={event.sold} max={event.capacity} height={6} />
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid hsl(var(--mt-border))", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ font: "400 11px/1 var(--mt-font-sans)", color: "hsl(var(--mt-fg-muted))", textTransform: "uppercase", letterSpacing: ".06em" }}>{t("card.from")}</div>
            <div style={{ font: "700 18px/1 var(--mt-font-sans)", color: "hsl(var(--mt-fg))", marginTop: 4 }}>{fmt(event.price)}</div>
          </div>
          <Button variant="primary" size="sm" rightIcon="chevRight">{t("card.register")}</Button>
        </div>
      </div>
    </div>
  );
}

// ————— FEATURED EVENTS —————

function FeaturedEvents({ view, setView, onOpen }: { view: ViewMode; setView: (v: ViewMode) => void; onOpen?: (e: RunnerEvent) => void }) {
  const { t } = useLang();
  const [region, setRegion] = useState("all");
  const [query, setQuery] = useState("");

  const regionLabel = (value: string) => t(`events.region${cap(value)}`);

  const filtered = useMemo(() => MOCK_EVENTS.filter((e) =>
    (region === "all" || e.region === region) &&
    (query === "" || e.title.toLowerCase().includes(query.toLowerCase()) || e.province.toLowerCase().includes(query.toLowerCase()))
  ), [region, query]);

  const heading = t("events.heading", { count: filtered.length }) +
    (region !== "all" ? t("events.headingRegion", { region: regionLabel(region) }) : "");

  return (
    <section id="events" style={{ background: "hsl(var(--mt-bg))", padding: "96px 32px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 24, marginBottom: 40 }}>
          <div>
            <div className="mt-eyebrow" style={{ color: "hsl(var(--mt-brand))", marginBottom: 12 }}>{t("events.eyebrow")}</div>
            <h2 style={{ font: "700 clamp(32px, 4vw, 44px)/1.1 var(--mt-font-sans)", letterSpacing: "-0.02em", color: "hsl(var(--mt-fg))", margin: 0 }}>
              {heading}
            </h2>
            <p style={{ font: "400 16px/1.6 var(--mt-font-sans)", color: "hsl(var(--mt-fg-muted))", margin: "12px 0 0", maxWidth: 520 }}>
              {t("events.subcopy")}
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: "1 1 240px", minWidth: 200 }}>
              <I name="search" size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "hsl(var(--mt-fg-muted))" } as React.CSSProperties} />
              <input
                value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder={t("events.searchPlaceholder")}
                style={{ width: "100%", height: 44, paddingLeft: 40, paddingRight: 14, borderRadius: 10, border: "1px solid hsl(var(--mt-input))", background: "hsl(var(--mt-card))", font: "400 14px/1 var(--mt-font-sans)", color: "hsl(var(--mt-fg))", outline: "none" }}
              />
            </div>
            <div style={{ display: "flex", gap: 4, padding: 4, background: "hsl(var(--mt-muted))", borderRadius: 10 }}>
              {(["grid", "list", "calendar"] as ViewMode[]).map((v) => {
                const active = view === v;
                return (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      font: "500 13px/1 var(--mt-font-sans)", padding: "8px 14px",
                      borderRadius: 8, border: 0, cursor: "pointer", transition: "all .15s",
                      background: active ? "hsl(var(--mt-card))" : "transparent",
                      color: active ? "hsl(var(--mt-fg))" : "hsl(var(--mt-fg-muted))",
                      boxShadow: active ? "var(--mt-shadow-card)" : "none",
                    }}
                  >
                    {v === "calendar" && <I name="calendar" size={14} />}
                    {t(`events.view${cap(v)}`)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 32, flexWrap: "wrap" }}>
          {REGIONS.map((r) => {
            const active = r.value === region;
            return (
              <button key={r.value} onClick={() => setRegion(r.value)} style={{ font: "500 14px/1 var(--mt-font-sans)", padding: "10px 18px", borderRadius: 9999, background: active ? "hsl(var(--mt-fg))" : "hsl(var(--mt-card))", color: active ? "#fff" : "hsl(var(--mt-fg))", border: `1px solid ${active ? "hsl(var(--mt-fg))" : "hsl(var(--mt-border))"}`, cursor: "pointer", transition: "all .15s" }}>
                {regionLabel(r.value)}
              </button>
            );
          })}
        </div>

        {view === "calendar" ? (
          <CalendarView events={filtered} onOpen={onOpen} />
        ) : filtered.length === 0 ? (
          <div style={{ padding: 64, textAlign: "center", border: "1px dashed hsl(var(--mt-border))", borderRadius: 12, background: "hsl(var(--mt-card))" }}>
            <div style={{ font: "600 18px/1 var(--mt-font-sans)", color: "hsl(var(--mt-fg))", marginBottom: 8 }}>{t("events.emptyTitle")}</div>
            <div style={{ font: "400 14px/1.5 var(--mt-font-sans)", color: "hsl(var(--mt-fg-muted))" }}>{t("events.emptyBody")}</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: view === "list" ? "1fr" : "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
            {filtered.map((e) => <EventCard key={e.id} event={e} layout={view} onOpen={onOpen} />)}
          </div>
        )}

        {view !== "calendar" && (
          <div style={{ marginTop: 48, textAlign: "center" }}>
            <Button variant="outline" size="lg" rightIcon="chevRight">{t("events.viewAll")}</Button>
          </div>
        )}
      </div>
    </section>
  );
}

// ————— RACE CATEGORIES —————

function RaceCategoriesExplainer() {
  const { t } = useLang();
  return (
    <section id="categories" style={{ background: "hsl(var(--mt-card))", padding: "96px 32px", borderTop: "1px solid hsl(var(--mt-border))", borderBottom: "1px solid hsl(var(--mt-border))" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ maxWidth: 720, marginBottom: 56 }}>
          <div className="mt-eyebrow" style={{ color: "hsl(var(--mt-brand))", marginBottom: 12 }}>{t("categories.eyebrow")}</div>
          <h2 style={{ font: "700 clamp(32px, 4vw, 44px)/1.1 var(--mt-font-sans)", letterSpacing: "-0.02em", color: "hsl(var(--mt-fg))", margin: 0 }}>
            {t("categories.heading")}
          </h2>
          <p style={{ font: "400 17px/1.6 var(--mt-font-sans)", color: "hsl(var(--mt-fg-muted))", margin: "16px 0 0" }}>
            {t("categories.subcopy")}
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          {RACE_TIERS.map((tier) => (
            <div key={tier.key} style={{ padding: 28, borderRadius: 14, background: "hsl(var(--mt-bg))", border: "1px solid hsl(var(--mt-border))", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -24, right: -24, width: 96, height: 96, borderRadius: 9999, background: "hsl(var(--mt-brand) / .08)" }} />
              <div style={{ position: "relative" }}>
                <IconDisc name={tier.icon} size={44} />
                <div style={{ font: "400 12px/1 var(--mt-font-sans)", color: "hsl(var(--mt-fg-muted))", marginTop: 18, textTransform: "uppercase", letterSpacing: ".06em" }}>{tier.km}</div>
                <h3 style={{ font: "700 22px/1.2 var(--mt-font-sans)", color: "hsl(var(--mt-fg))", margin: "6px 0 12px", letterSpacing: "-0.01em" }}>{t(`categories.${tier.key}Name`)}</h3>
                <p style={{ font: "400 14px/1.55 var(--mt-font-sans)", color: "hsl(var(--mt-fg-muted))", margin: "0 0 20px" }}>{t(`categories.${tier.key}Use`)}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 16, borderTop: "1px solid hsl(var(--mt-border))" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", font: "500 13px/1 var(--mt-font-sans)" }}>
                    <span style={{ color: "hsl(var(--mt-fg-muted))" }}>{t("categories.labelElevation")}</span>
                    <span style={{ color: "hsl(var(--mt-fg))" }}>{tier.elev}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", font: "500 13px/1 var(--mt-font-sans)" }}>
                    <span style={{ color: "hsl(var(--mt-fg-muted))" }}>{t("categories.labelFinish")}</span>
                    <span style={{ color: "hsl(var(--mt-fg))" }}>{tier.time}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ————— WHY MYTRAILS —————

function WhyMyTrails() {
  const { t } = useLang();
  return (
    <section id="why" style={{ background: "hsl(var(--mt-bg))", padding: "96px 32px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 80, alignItems: "start" }}>
        <div>
          <div className="mt-eyebrow" style={{ color: "hsl(var(--mt-brand))", marginBottom: 12 }}>{t("why.eyebrow")}</div>
          <h2 style={{ font: "700 clamp(32px, 4vw, 44px)/1.1 var(--mt-font-sans)", letterSpacing: "-0.02em", color: "hsl(var(--mt-fg))", margin: 0 }}>
            {t("why.heading1")}<br />{t("why.heading2")}
          </h2>
          <p style={{ font: "400 16px/1.65 var(--mt-font-sans)", color: "hsl(var(--mt-fg-muted))", margin: "20px 0 0" }}>
            {t("why.subcopy")}
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {WHY_POINTS.map((p, i) => (
            <div key={p.key} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 24, padding: "32px 0", borderTop: i === 0 ? "1px solid hsl(var(--mt-border))" : "none", borderBottom: "1px solid hsl(var(--mt-border))" }}>
              <IconDisc name={p.icon} size={48} />
              <div>
                <h3 style={{ font: "600 20px/1.3 var(--mt-font-sans)", color: "hsl(var(--mt-fg))", margin: "0 0 8px", letterSpacing: "-0.01em" }}>{t(`why.${p.key}Title`)}</h3>
                <p style={{ font: "400 15px/1.6 var(--mt-font-sans)", color: "hsl(var(--mt-fg-muted))", margin: 0 }}>{t(`why.${p.key}Body`)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ————— CTA STRIP —————

function CTAStrip({ onBrowse }: { onBrowse: () => void }) {
  const { t } = useLang();
  return (
    <section style={{ padding: "32px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", borderRadius: 20, overflow: "hidden", background: "var(--mt-gradient-hero)", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 80% 30%, hsl(0 0% 100% / .15) 0%, transparent 50%)" }} />
        <div style={{ position: "relative", padding: "64px 56px", display: "grid", gridTemplateColumns: "1.5fr auto", gap: 32, alignItems: "center" }}>
          <div>
            <h2 style={{ font: "700 clamp(28px, 3.5vw, 40px)/1.1 var(--mt-font-sans)", color: "#fff", letterSpacing: "-0.02em", margin: "0 0 12px" }}>
              {t("cta.heading")}
            </h2>
            <p style={{ font: "400 17px/1.55 var(--mt-font-sans)", color: "hsl(0 0% 100% / .85)", margin: 0, maxWidth: 560 }}>
              {t("cta.body")}
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Button size="lg" onClick={onBrowse} rightIcon="chevRight" style={{ background: "#fff", color: "hsl(var(--mt-brand-deep, 16 90% 40%))", boxShadow: "0 4px 12px hsl(220 20% 10% / .15)" }}>
              {t("cta.browse")}
            </Button>
            <Button size="lg" style={{ background: "hsl(0 0% 100% / .14)", color: "#fff", border: "1px solid hsl(0 0% 100% / .3)" }}>
              <I name="send" size={16} /> {t("cta.alerts")}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ————— FOOTER —————

function Footer({ onCalendar }: { onCalendar: () => void }) {
  const navigate = useNavigate();
  const { t } = useLang();
  const colTitle: React.CSSProperties = { font: "600 13px/1 var(--mt-font-sans)", color: "hsl(var(--mt-fg))", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 18 };
  const link: React.CSSProperties = { display: "block", font: "400 14px/1.8 var(--mt-font-sans)", color: "hsl(var(--mt-fg-muted))", textDecoration: "none" };
  return (
    <footer style={{ background: "hsl(var(--mt-card))", borderTop: "1px solid hsl(var(--mt-border))", padding: "64px 32px 32px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr 1fr", gap: 48, marginBottom: 48 }}>
          <div>
            <Logo size="md" />
            <p style={{ font: "400 14px/1.65 var(--mt-font-sans)", color: "hsl(var(--mt-fg-muted))", margin: "20px 0 0", maxWidth: 320 }}>
              {t("footer.tagline")}
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              {["IG", "FB", "TT", "X"].map((s) => (
                <div key={s} style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid hsl(var(--mt-border))", display: "inline-flex", alignItems: "center", justifyContent: "center", font: "600 12px/1 var(--mt-font-sans)", color: "hsl(var(--mt-fg-muted))", cursor: "pointer" }}>{s}</div>
              ))}
            </div>
          </div>
          <div>
            <div style={colTitle}>{t("footer.colRunners")}</div>
            <a href="#events" style={link}>{t("footer.findEvents")}</a>
            <a href="#events" style={link} onClick={(e) => { e.preventDefault(); onCalendar(); }}>{t("footer.raceCalendar")}</a>
            <a href="#" style={link}>{t("footer.myReg")}</a>
            <a href="#" style={link}>{t("footer.training")}</a>
          </div>
          <div>
            <div style={colTitle}>{t("footer.colOrganizers")}</div>
            <a href="#" style={link} onClick={(e) => { e.preventDefault(); navigate("/organizer/login"); }}>{t("footer.orgLogin")}</a>
            <a href="#" style={link}>{t("footer.listEvent")}</a>
            <a href="#" style={link}>{t("footer.pricing")}</a>
            <a href="#" style={link}>{t("footer.resources")}</a>
          </div>
          <div>
            <div style={colTitle}>{t("footer.colCompany")}</div>
            <a href="#" style={link}>{t("footer.about")}</a>
            <a href="#" style={link}>{t("footer.blog")}</a>
            <a href="#" style={link}>{t("footer.contact")}</a>
            <a href="#" style={link}>{t("footer.careers")}</a>
          </div>
          <div>
            <div style={colTitle}>{t("footer.colSupport")}</div>
            <a href="#" style={link}>{t("footer.help")}</a>
            <a href="#" style={link}>{t("footer.refund")}</a>
            <a href="#" style={link}>{t("footer.terms")}</a>
            <a href="#" style={link}>{t("footer.privacy")}</a>
          </div>
        </div>
        <div style={{ paddingTop: 24, borderTop: "1px solid hsl(var(--mt-border))", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div style={{ font: "400 13px/1 var(--mt-font-sans)", color: "hsl(var(--mt-fg-muted))" }}>
            {t("footer.copyright")}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", font: "400 13px/1 var(--mt-font-sans)", color: "hsl(var(--mt-fg-muted))" }}>
            <span style={{ width: 6, height: 6, borderRadius: 9999, background: "hsl(var(--mt-success))" }} />
            {t("footer.status")} · TH/EN
          </div>
        </div>
      </div>
    </footer>
  );
}

// ————— PAGE —————

function RunnerLanding() {
  const [view, setView] = useState<ViewMode>("grid");
  const navigate = useNavigate();

  const browseRef = () => {
    document.getElementById("events")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const showCalendar = () => {
    setView("calendar");
    browseRef();
  };

  return (
    <div style={{ fontFamily: "var(--mt-font-sans)" }}>
      <TopNav onCTA={() => navigate("/runner/login")} />
      <HeroEditorial onBrowse={browseRef} onCalendar={showCalendar} />
      <FeaturedEvents view={view} setView={setView} />
      <RaceCategoriesExplainer />
      <WhyMyTrails />
      <CTAStrip onBrowse={browseRef} />
      <Footer onCalendar={showCalendar} />
    </div>
  );
}

export default function RunnerLandingPage() {
  return (
    <LanguageProvider>
      <RunnerLanding />
    </LanguageProvider>
  );
}
