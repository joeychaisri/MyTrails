import { useState, useEffect, useRef } from "react";
import "./hero-styles.css";
import "./landing-styles.css";

// ——— ICONS ———
const Ic = ({ d, className = "h-4 w-4" }: { d: React.ReactNode; className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor"
    strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">{d}</svg>
);
const IcMountain  = (p: { className?: string }) => <Ic {...p} d={<path d="m8 3 4 8 5-5 5 15H2L8 3z" />} />;
const IcCalendar  = (p: { className?: string }) => <Ic {...p} d={<><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>} />;
const IcMapPin    = (p: { className?: string }) => <Ic {...p} d={<><path d="M20 10c0 7-8 12-8 12s-8-5-8-12a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" /></>} />;
const IcArrow     = (p: { className?: string }) => <Ic {...p} d={<><path d="M5 12h14M13 5l7 7-7 7" /></>} />;
const IcDownload  = (p: { className?: string }) => <Ic {...p} d={<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></>} />;
const IcPlay      = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className}><path d="M6 4l14 8-14 8V4z" fill="currentColor" /></svg>
);

// ——— LOGO ———
function Logo({ light = false }: { light?: boolean }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <span className="logo-mark">
        <svg viewBox="0 0 24 24"><path d="m8 3 4 8 5-5 5 15H2L8 3z" /></svg>
      </span>
      <span className="word" style={{ color: light ? "#fff" : undefined }}>SUMMIT TRAIL</span>
    </div>
  );
}

// ——— COUNTDOWN ———
const RACE_DATE = new Date("2026-10-16T06:00:00+07:00").getTime();

function useCountdown(target: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, target - now);
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff / 3600000) % 24),
    m: Math.floor((diff / 60000) % 60),
    s: Math.floor((diff / 1000) % 60),
  };
}

function Countdown({ accentLast = false }: { accentLast?: boolean }) {
  const { d, h, m, s } = useCountdown(RACE_DATE);
  const cells = [{ n: d, l: "Days" }, { n: h, l: "Hours" }, { n: m, l: "Min" }, { n: s, l: "Sec" }];
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <div className="countdown">
      {cells.map((c, i) => (
        <div key={i} className={"cd-cell" + (accentLast && i === cells.length - 1 ? " accent" : "")}>
          <div className="cd-num">{pad(c.n)}</div>
          <div className="cd-lbl">{c.l}</div>
        </div>
      ))}
    </div>
  );
}

// ——— HERO NAV ———
function HeroNav({ variant = "light" }: { variant?: "light" | "dark" | "bone" }) {
  const color = variant === "bone" ? "#1a1a1a" : "#fff";
  return (
    <nav className="h-nav" style={{ color }}>
      <Logo light={variant !== "bone"} />
      <div className="links" style={{ color }}>
        <a href="#">Event</a>
        <a href="#">Categories</a>
        <a href="#">Course</a>
        <a href="#">Schedule</a>
        <a href="#">FAQ</a>
      </div>
      <div className="right">
        <div style={{ display: "flex", gap: 0, fontSize: 11, fontWeight: 700, letterSpacing: ".15em", opacity: .8 }}>
          <span style={{ padding: "4px 8px" }}>TH</span>
          <span style={{ padding: "4px 8px", opacity: .4 }}>/</span>
          <span style={{ padding: "4px 8px", opacity: .5 }}>EN</span>
        </div>
        <a className="cta" href="#register">สมัครเลย</a>
      </div>
    </nav>
  );
}

// ——— HERO VIDEO ———
type HeroVariant = "shadow" | "scrim" | "outline" | "stencil";

function HeroVideo({ variant = "shadow", showNav = true }: { variant?: HeroVariant; showNav?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasVideo, setHasVideo] = useState(true);

  const TitleShadow = () => (
    <h1 className="title display" style={{ textShadow: "0 4px 32px rgba(0,0,0,.5)" }}>
      Pong Yaeng<br />Trail<span style={{ color: "hsl(var(--primary))" }}>.</span>
    </h1>
  );

  const TitleScrim = () => (
    <div className="title-scrim-wrap">
      <div className="scrim-panel">
        <div className="eyebrow scrim-eyebrow">
          <span className="line" /><span>Edition 12 · 16–18 Oct 2026</span>
        </div>
        <h1 className="title display scrim-title">
          Pong Yaeng<br />Trail<span style={{ color: "hsl(var(--primary))" }}>.</span>
        </h1>
        <div className="th scrim-th">เส้นทางเทรลในตำนาน · โป่งแยง เชียงใหม่</div>
      </div>
    </div>
  );

  const TitleOutline = () => (
    <h1 className="title display title-outline">
      <span className="ol-stroke">Pong Yaeng</span><br />
      <span className="ol-fill">Trail<span style={{ color: "hsl(var(--primary))" }}>.</span></span>
    </h1>
  );

  const TitleStencil = () => (
    <h1 className="title display title-stencil">
      <span className="st-row"><span className="st-tape">Pong Yaeng</span></span>
      <span className="st-row"><span className="st-line">Trail<span style={{ color: "hsl(var(--primary))" }}>.</span></span></span>
    </h1>
  );

  const renderTitle = () => {
    if (variant === "scrim")   return <TitleScrim />;
    if (variant === "outline") return <TitleOutline />;
    if (variant === "stencil") return <TitleStencil />;
    return <TitleShadow />;
  };

  const showEyebrow = variant !== "scrim";
  const showTh      = variant !== "scrim";

  return (
    <div className={"h1 hv-" + variant}>
      <div className="video-layer">
        {hasVideo ? (
          <video ref={videoRef} autoPlay muted loop playsInline preload="auto"
            poster="https://images.unsplash.com/photo-1551632811-561732d1e306?w=1920&q=80"
            onError={() => setHasVideo(false)}>
            <source src="https://videos.pexels.com/video-files/4763824/4763824-hd_1920_1080_24fps.mp4" type="video/mp4" />
          </video>
        ) : (
          <img src="https://images.unsplash.com/photo-1551632811-561732d1e306?w=1920&q=80" alt="Pong Yaeng Trail" />
        )}
      </div>
      <div className="grad" />
      <div className="vignette" />
      {showNav && <HeroNav variant="dark" />}

      <div className="stage">
        {showEyebrow && (
          <div className="eyebrow">
            <span className="line" />
            <span>Edition 12 · Pong Yaeng, Chiang Mai · 16–18 Oct 2026</span>
          </div>
        )}
        {renderTitle()}
        {showTh && <div className="th">เส้นทางเทรลในตำนาน · กลางขุนเขาและสายหมอกของโป่งแยง</div>}

        <div className="meta-row">
          {[
            { k: "Race Weekend", v: "16–18 Oct 2026", thai: false },
            { k: "Location",     v: "โป่งแยง · เชียงใหม่", thai: true },
            { k: "Distances",    v: "20K · 45K · 70K · 100K · 160K", thai: false },
            { k: "UTMB Index",   v: "100M · 6,660m D+", thai: false },
          ].map((m) => (
            <div key={m.k} className="meta">
              <span className="k">{m.k}</span>
              <span className={"v" + (m.thai ? " thai" : "")}>{m.v}</span>
            </div>
          ))}
        </div>

        <div className="actions">
          <a className="btn-cta btn-orange" href="#register">สมัครเลย <IcArrow /></a>
          <a className="btn-cta btn-ghost-light" href="#"><IcPlay /> Watch the trailer</a>
        </div>
      </div>

      <div className="countdown-wrap">
        <span className="lbl">Race weekend begins in</span>
        <Countdown />
      </div>
      <div className="scroll-hint">Scroll · เลื่อนลง</div>
    </div>
  );
}

// ——— LANDING NAV ———
function LpNav({ visible = true }: { visible?: boolean }) {
  return (
    <header className="lp-nav" style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? "auto" : "none", transition: "opacity .3s ease" }}>
      <div className="lp-nav-inner">
        <Logo />
        <nav className="links">
          <a href="#categories">Categories</a>
          <a href="#course">Course</a>
          <a href="#kit">Race Kit</a>
          <a href="#schedule">Schedule</a>
          <a href="#highlights">Highlights</a>
          <a href="#faq">FAQ</a>
        </nav>
        <div className="right">
          <span className="lang"><span className="on">TH</span><span>·</span><span>EN</span></span>
          <a className="cta" href="#register">สมัครเลย</a>
        </div>
      </div>
    </header>
  );
}

// ——— RACE CATEGORIES ———
const fmtTHB = (n: number) => "฿" + new Intl.NumberFormat("th-TH").format(n);

const CATEGORIES = [
  { dist: 20,  name: "Trail Sprint",   th: "วิ่งเทรลเริ่มต้น",       elev: "850m",   cutoff: "5h",  price: 1500, oldPrice: 1800, sold: 1240, capacity: 1500, badge: { kind: "popular", label: "Most Popular" } },
  { dist: 45,  name: "Half Mountain",  th: "ระยะกลางสายภูเขา",       elev: "2,100m", cutoff: "12h", price: 2200, oldPrice: 2600, sold: 820,  capacity: 1000, badge: { kind: "almost",  label: "Almost Full" } },
  { dist: 70,  name: "Skyline Loop",   th: "เส้นทางคลาสสิก",          elev: "3,400m", cutoff: "18h", price: 2900, oldPrice: 3400, sold: 540,  capacity: 800,  badge: null, featured: true },
  { dist: 100, name: "Hundred Miler",  th: "ระดับ Ultra",              elev: "4,800m", cutoff: "30h", price: 3800, oldPrice: 4200, sold: 380,  capacity: 500,  badge: { kind: "qual",    label: "UTMB Qualifier" } },
  { dist: 160, name: "The Beast",      th: "สายตัวจริงต้องลอง",       elev: "6,660m", cutoff: "44h", price: 4800, oldPrice: 5400, sold: 145,  capacity: 200,  badge: { kind: "qual",    label: "UTMB · 100M" } },
] as const;

function CategoryCard({ c }: { c: (typeof CATEGORIES)[number] }) {
  return (
    <div className={"cat" + ("featured" in c && c.featured ? " featured" : "")}>
      <div className="cat-top">
        <div>
          <div className="cat-distance display">{c.dist}<span className="unit">KM</span></div>
          <div className="cat-name">{c.name}</div>
          <div className="cat-th">{c.th}</div>
        </div>
        {c.badge && <span className={"cat-badge " + c.badge.kind}>{c.badge.label}</span>}
      </div>
      <div className="cat-meta-grid">
        {[["Elevation", "+" + c.elev], ["Cut-off", c.cutoff], ["Start", "06:00"]].map(([k, v]) => (
          <div key={k} className="cat-meta-row">
            <span className="cat-meta-k">{k}</span>
            <span className="cat-meta-v">{v}</span>
          </div>
        ))}
      </div>
      <div className="cat-spots">
        <div className="row"><span className="k">Spots filled</span><span className="v">{c.sold.toLocaleString()} / {c.capacity.toLocaleString()}</span></div>
        <div className="track"><div className="fill" style={{ width: (c.sold / c.capacity * 100) + "%" }} /></div>
      </div>
      <div className="cat-bottom">
        <div className="cat-price">
          <span className="label">Early Bird</span>
          <span className="v"><span className="currency">฿</span>{c.price.toLocaleString()}</span>
          <span className="price-old">{fmtTHB(c.oldPrice)}</span>
        </div>
        <button className="cat-pick">เลือกระยะนี้ <IcArrow /></button>
      </div>
    </div>
  );
}

function RaceCategories() {
  return (
    <section className="sec" id="categories">
      <div className="sec-head">
        <div>
          <div className="sec-eyebrow"><span className="dot" />Race Categories</div>
          <h2 className="sec-title">เลือกระยะ<span className="ital">ของคุณ</span></h2>
          <p className="sec-lede" style={{ fontWeight: 400 }}>5 ระยะ ตั้งแต่ 20 กิโลเมตรสำหรับมือใหม่ ไปจนถึง 160 กิโลเมตร UTMB qualifier</p>
        </div>
        <a className="right-link" href="#">ดูทั้งหมด <IcArrow /></a>
      </div>
      <div className="cat-grid">
        {CATEGORIES.map((c) => <CategoryCard key={c.dist} c={c} />)}
      </div>
    </section>
  );
}

// ——— COURSE MAP ———
const COURSE_DATA: Record<number, { dPlus: string; highest: string; lowest: string; aid: number; cutoff: string; profile: string }> = {
  20:  { dPlus: "850m",   highest: "1,180m", lowest: "620m", aid: 3,  cutoff: "5h",  profile: "M0,80 L100,70 L200,55 L300,40 L400,30 L500,45 L600,55 L700,70 L800,85" },
  45:  { dPlus: "2,100m", highest: "1,420m", lowest: "580m", aid: 5,  cutoff: "12h", profile: "M0,85 L80,60 L160,40 L240,25 L320,38 L400,55 L480,30 L560,15 L640,40 L720,65 L800,85" },
  70:  { dPlus: "3,400m", highest: "1,685m", lowest: "580m", aid: 8,  cutoff: "18h", profile: "M0,90 L40,75 L80,55 L120,30 L150,15 L180,28 L220,45 L260,40 L300,20 L340,35 L380,55 L420,40 L460,25 L500,8 L540,25 L580,42 L620,55 L660,50 L700,68 L740,80 L780,72 L800,90" },
  100: { dPlus: "4,800m", highest: "1,820m", lowest: "560m", aid: 11, cutoff: "30h", profile: "M0,90 L40,70 L80,40 L120,15 L160,30 L200,55 L240,35 L280,10 L320,30 L360,55 L400,30 L440,5 L480,25 L520,50 L560,30 L600,15 L640,40 L680,60 L720,75 L760,82 L800,90" },
  160: { dPlus: "6,660m", highest: "1,820m", lowest: "560m", aid: 14, cutoff: "44h", profile: "M0,90 L30,72 L60,50 L90,25 L120,5 L150,28 L180,52 L210,35 L240,12 L270,32 L300,55 L330,30 L360,8 L390,28 L420,50 L450,25 L480,5 L510,28 L540,50 L570,72 L600,55 L630,30 L660,55 L690,75 L720,60 L750,80 L800,90" },
};

function CourseMap() {
  const [tab, setTab] = useState(70);
  const c = COURSE_DATA[tab];
  return (
    <section className="sec" id="course">
      <div className="sec-eyebrow"><span className="dot" />Course & Route</div>
      <h2 className="sec-title">เส้นทาง<span className="ital">ที่จะพิชิต</span></h2>
      <div className="course-tabs">
        {[20, 45, 70, 100, 160].map((d) => (
          <button key={d} className={tab === d ? "active" : ""} onClick={() => setTab(d)}>{d}K</button>
        ))}
      </div>
      <div className="course-grid">
        <div className="map-card">
          <div className="map-bg" />
          <div className="map-overlay" />
          <div className="map-stamp"><span className="dot" />Course · {tab}K · Pong Yaeng</div>
          <svg className="map-route" viewBox="0 0 600 400" preserveAspectRatio="none">
            <defs>
              <filter id="glow"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            </defs>
            <path d="M80,320 C160,260 200,220 260,200 C320,180 360,140 380,100 C400,60 460,80 500,140 C540,200 480,260 420,280 C360,300 280,290 200,310 C140,325 100,330 80,320 Z"
              fill="none" stroke="hsl(24 95% 46%)" strokeWidth="3" strokeDasharray="4 4" filter="url(#glow)" />
          </svg>
          {[
            { style: { left: "13%", top: "80%" }, cls: "start", lbl: "Start" },
            { style: { left: "63%", top: "23%" }, cls: "",       lbl: "Doi · 1,685m" },
            { style: { left: "33%", top: "47%" }, cls: "aid",    lbl: "AID · 12K" },
            { style: { left: "78%", top: "55%" }, cls: "med",    lbl: "MED · 38K" },
            { style: { left: "33%", top: "78%" }, cls: "finish", lbl: "Finish" },
          ].map((m) => (
            <div key={m.lbl} className="map-marker" style={m.style}>
              <div className={"pin " + m.cls} /><div className="lbl">{m.lbl}</div>
            </div>
          ))}
          <div className="map-actions">
            <button><IcDownload /> GPX</button>
            <button>Open in Maps</button>
          </div>
        </div>
        <div className="elev-card">
          <div>
            <div className="sec-eyebrow" style={{ marginBottom: 8 }}><span className="dot" />Elevation Profile · {tab}K</div>
            <div style={{ fontFamily: "Anton", fontSize: 28, lineHeight: 1 }}>+{c.dPlus} D+ / -{c.dPlus} D-</div>
          </div>
          <div className="elev-stats">
            {[["Highest", c.highest], ["Lowest", c.lowest], ["Aid stations", String(c.aid)], ["Cut-off", c.cutoff]].map(([k, v]) => (
              <div key={k} className="cell"><div className="k">{k}</div><div className="v">{v}</div></div>
            ))}
          </div>
          <svg className="elev-chart" viewBox="0 0 800 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(24 95% 46%)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(24 95% 46%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <path d={c.profile + " L800,100 L0,100 Z"} fill="url(#g1)" />
            <path d={c.profile} fill="none" stroke="hsl(24 95% 46%)" strokeWidth="2" />
            {[0, 1, 2, 3].map((i) => (
              <line key={i} x1={i * 200 + 100} y1="0" x2={i * 200 + 100} y2="100" stroke="hsl(220 13% 91%)" strokeWidth="1" strokeDasharray="2 2" />
            ))}
          </svg>
          <div className="elev-legend">
            {[
              { label: "Route",       bg: "hsl(var(--primary))" },
              { label: "Aid station", bg: "hsl(var(--success))" },
              { label: "Medical",     bg: "hsl(var(--destructive))" },
              { label: "Start/Finish",bg: "#fff" },
            ].map((l) => (
              <span key={l.label} className="item"><span className="swatch" style={{ background: l.bg }} />{l.label}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ——— RACE KIT ———
function RaceKit({ onZoom }: { onZoom: (src: string) => void }) {
  const items = [
    { name: "Finisher Tee",    th: "เสื้อเทคนิคสำหรับนักวิ่งทุกคน · UV protect",   img: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=900&q=80", tag: "Race Kit",  features: ["Tech fabric", "UPF 50+", "Sizes XS–3XL"], lg: true },
    { name: "Finisher Medal",  th: "เหรียญสลักลายดอยภาคเหนือ",                       img: "https://images.unsplash.com/photo-1584794171574-fe3f84b066f7?w=600&q=80", tag: "Finisher",  features: ["Brass alloy", "70mm"] },
    { name: "BIB & Chip",      th: "เลข BIB พร้อมชิปจับเวลา",                        img: "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=600&q=80", tag: "Bib",       features: ["RFID timing"] },
    { name: "Race Pack Bag",   th: "ถุงผ้าใบใหญ่สำหรับเก็บของฝาก",                  img: "https://images.unsplash.com/photo-1622445275576-721325763afe?w=600&q=80", tag: "Souvenir",  features: ["Cotton canvas"] },
    { name: "Buff Headwear",   th: "ผ้าบัฟลายเฉพาะรุ่น",                             img: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80", tag: "Souvenir",  features: ["UV print"] },
  ];
  return (
    <section className="sec kit-sec" id="kit">
      <div className="sec-head">
        <div>
          <div className="sec-eyebrow"><span className="dot" />Race Kit & Souvenirs</div>
          <h2 className="sec-title">สิ่งที่<span className="ital">คุณจะได้</span></h2>
          <p className="sec-lede">รับ Race Pack ได้ที่จุดลงทะเบียนล่วงหน้า · 14–15 ต.ค. 2026 · The Memory Hill, Pong Yaeng</p>
        </div>
      </div>
      <div className="kit-grid">
        {items.map((it, i) => (
          <div key={i} className={"kit-card" + (it.lg ? " lg" : "")} onClick={() => onZoom(it.img)}>
            <div className="kit-img" style={{ backgroundImage: `url(${it.img})` }}>
              <span className="tag">{it.tag}</span>
              <button className="zoom" onClick={(e) => { e.stopPropagation(); onZoom(it.img); }}>
                <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3M11 8v6M8 11h6" /></svg>
              </button>
            </div>
            <div className="kit-body">
              <div className="name">{it.name}</div>
              <div className="desc">{it.th}</div>
              <div className="feature">{it.features.map((f) => <span key={f}>{f}</span>)}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ——— SCHEDULE ———
function ScheduleSection() {
  return (
    <section className="sec" id="schedule">
      <div className="sec-eyebrow"><span className="dot" />Event Schedule</div>
      <h2 className="sec-title">ตาราง<span className="ital">งาน</span></h2>
      <p className="sec-lede">สามวัน สองคืน · เริ่ม 14 ตุลาคม รับ Race Pack ปิดท้าย 18 ตุลาคม พิธีมอบรางวัล</p>
      <div className="tl-grid">
        <div className="tl-col">
          <h3>Pre-event</h3>
          <div className="tl-sub">14–15 ต.ค. · The Memory Hill, Pong Yaeng</div>
          <div className="tl-list">
            {[
              { time: "10:00", name: "Race Pack Pickup opens",      th: "เปิดรับ Race Pack วันแรก" },
              { time: "14:00", name: "Course briefing · 100K & 160K", th: "ประชุมเส้นทาง · บังคับเข้าร่วม" },
              { time: "17:00", name: "Mandatory Gear Check",         th: "ตรวจอุปกรณ์บังคับ" },
              { time: "19:00", name: "Pasta Party",                  th: "งานเลี้ยงต้อนรับ" },
            ].map((it) => (
              <div key={it.time} className="tl-item">
                <div className="tl-time">{it.time}</div>
                <div className="tl-name">{it.name}</div>
                <div className="tl-th">{it.th}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="tl-col">
          <h3>Race Day</h3>
          <div className="tl-sub">16 ตุลาคม 2026 · Pong Yaeng Start Line</div>
          <div className="tl-list">
            {[
              { time: "04:00", name: "Start · 160K The Beast",      th: "ปล่อยตัว 160K",  cutoff: "Cut-off 44h", cls: "start" },
              { time: "05:00", name: "Start · 100K Hundred Miler",  th: "ปล่อยตัว 100K",  cutoff: "Cut-off 30h", cls: "start" },
              { time: "06:00", name: "Start · 70K Skyline Loop",    th: "ปล่อยตัว 70K",   cutoff: "Cut-off 18h", cls: "start" },
              { time: "07:00", name: "Start · 45K Half Mountain",   th: "ปล่อยตัว 45K",   cutoff: "Cut-off 12h", cls: "start" },
              { time: "08:00", name: "Start · 20K Trail Sprint",    th: "ปล่อยตัว 20K",   cutoff: "Cut-off 5h",  cls: "start" },
              { time: "14:00", name: "Awards · 20K & 45K",          th: "พิธีมอบรางวัล",   cutoff: "",            cls: "award" },
            ].map((it) => (
              <div key={it.time} className={"tl-item " + it.cls}>
                <div className="tl-time">{it.time}</div>
                <div className="tl-name">{it.name}</div>
                <div className="tl-th">{it.th}</div>
                {it.cutoff && <span className="tl-cutoff">{it.cutoff}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ——— HIGHLIGHTS ———
const PHOTOS = [
  "https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200&q=80",
  "https://images.unsplash.com/photo-1551524559-8af4e6624178?w=900&q=80",
  "https://images.unsplash.com/photo-1486901796908-7e7e7d2dbf8d?w=900&q=80",
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900&q=80",
  "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=900&q=80",
  "https://images.unsplash.com/photo-1530143584546-02191bc84eb5?w=900&q=80",
  "https://images.unsplash.com/photo-1530841344095-c4ed3a4f3f50?w=900&q=80",
];

function Highlights({ onZoom }: { onZoom: (src: string) => void }) {
  return (
    <section className="sec" id="highlights">
      <div className="sec-eyebrow"><span className="dot" />Past Editions</div>
      <h2 className="sec-title">11 ปี<br /><span className="ital">บนเส้นทางเดียวกัน</span></h2>
      <div className="gal-stats">
        {[["5,820", "Runners · 2025"], ["28", "Nationalities"], ["98%", "Finish rate · 20K"], ["11", "Editions held"]].map(([v, k]) => (
          <div key={k} className="gal-stat"><div className="v">{v}</div><div className="k">{k}</div></div>
        ))}
      </div>
      <div className="gal-grid">
        <div className="gal-item wide tall" style={{ backgroundImage: `url(${PHOTOS[0]})` }} onClick={() => onZoom(PHOTOS[0])} />
        <div className="gal-item"           style={{ backgroundImage: `url(${PHOTOS[1]})` }} onClick={() => onZoom(PHOTOS[1])} />
        <div className="gal-item"           style={{ backgroundImage: `url(${PHOTOS[2]})` }} onClick={() => onZoom(PHOTOS[2])} />
        <div className="gal-item wide"      style={{ backgroundImage: `url(${PHOTOS[3]})` }} onClick={() => onZoom(PHOTOS[3])} />
        <div className="gal-item tall"      style={{ backgroundImage: `url(${PHOTOS[4]})` }} onClick={() => onZoom(PHOTOS[4])} />
        <div className="gal-item"           style={{ backgroundImage: `url(${PHOTOS[5]})` }} onClick={() => onZoom(PHOTOS[5])} />
        <div className="gal-item"           style={{ backgroundImage: `url(${PHOTOS[6]})` }} onClick={() => onZoom(PHOTOS[6])} />
      </div>
    </section>
  );
}

// ——— REGISTRATION ———
function Registration() {
  return (
    <section className="reg-section" id="register">
      <div className="sec">
        <div className="sec-eyebrow"><span className="dot" />Registration</div>
        <h2 className="sec-title">สมัคร<span className="ital">3 ขั้นตอน</span></h2>
        <p className="sec-lede">Early Bird ปิดรับ 31 พฤษภาคม 2026 · ส่วนลด 18% สำหรับนักวิ่งกลุ่มแรก</p>
        <div className="reg-grid">
          <div className="reg-steps">
            {[
              { n: 1, head: "เลือกระยะ",   body: "เลือกจาก 5 ระยะ — 20K ถึง 160K", active: true },
              { n: 2, head: "กรอกข้อมูล",  body: "ชื่อ เพศ อายุ ไซส์เสื้อ Emergency contact และ ITRA index" },
              { n: 3, head: "ชำระเงิน",    body: "โอนธนาคาร · บัตรเครดิต · QR PromptPay · TrueMoney Wallet" },
            ].map((s) => (
              <div key={s.n} className={"reg-step" + (s.active ? " active" : "")}>
                <span className="num">{s.n}</span>
                <div><div className="head">{s.head}</div><div className="body">{s.body}</div></div>
              </div>
            ))}
          </div>
          <div className="reg-card">
            <h3>เริ่มสมัครเลย</h3>
            <div className="lede">กรอกข้อมูลพื้นฐาน 30 วินาที ที่เหลือทำต่อในขั้นถัดไปได้</div>
            <div className="field-group">
              <div className="field">
                <label>ระยะที่เลือก</label>
                <select defaultValue="70">
                  <option value="20">20K · Trail Sprint</option>
                  <option value="45">45K · Half Mountain</option>
                  <option value="70">70K · Skyline Loop · ฿2,900</option>
                  <option value="100">100K · Hundred Miler</option>
                  <option value="160">160K · The Beast</option>
                </select>
              </div>
              <div className="field-row">
                <div className="field"><label>ชื่อ</label><input placeholder="สมชาย" /></div>
                <div className="field"><label>นามสกุล</label><input placeholder="ใจดี" /></div>
              </div>
              <div className="field-row">
                <div className="field"><label>อีเมล</label><input type="email" placeholder="you@example.com" /></div>
                <div className="field"><label>เบอร์โทร</label><input placeholder="08X-XXX-XXXX" /></div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label>ไซส์เสื้อ</label>
                  <select defaultValue="M">
                    {["XS","S","M","L","XL","2XL"].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>สัญชาติ</label>
                  <select><option>ไทย (TH)</option><option>Other</option></select>
                </div>
              </div>
            </div>
            <div className="pay-row">
              <span style={{ fontSize: 12, fontWeight: 600, marginRight: 8, alignSelf: "center" }}>ช่องทางชำระ</span>
              {["PromptPay QR", "บัตรเครดิต / เดบิต", "โอนธนาคาร", "TrueMoney Wallet"].map((p) => (
                <span key={p} className="pay-pill">{p}</span>
              ))}
            </div>
            <button className="reg-cta">ดำเนินการต่อ · ฿2,900 <IcArrow /></button>
            <div className="reg-fine">
              โดยการดำเนินการต่อ คุณยอมรับ <a href="#" style={{ color: "hsl(var(--primary))" }}>ข้อตกลง</a> และ <a href="#" style={{ color: "hsl(var(--primary))" }}>นโยบายคืนเงิน</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ——— FAQ ———
const FAQ_DATA = [
  { q: "Cut-off time ของแต่ละระยะคือเท่าไร?",                       a: "20K · 5 ชั่วโมง / 45K · 12 ชั่วโมง / 70K · 18 ชั่วโมง / 100K · 30 ชั่วโมง / 160K · 44 ชั่วโมง — มี cut-off ระหว่างทางที่ aid station แต่ละจุด ดูรายละเอียดในคู่มือนักวิ่ง" },
  { q: "ถ้าสมัครแล้วยกเลิกได้ไหม นโยบายคืนเงินเป็นอย่างไร?",       a: "คืนเงิน 80% หากแจ้งก่อน 90 วันก่อนวันงาน · คืน 50% ก่อน 60 วัน · ไม่คืนเงินภายใน 30 วันก่อนงาน · สามารถโอนสิทธิ์ให้ผู้อื่นได้จนถึง 21 วันก่อนงาน" },
  { q: "รับ Race Pack ได้วันไหน ฝากคนอื่นรับแทนได้ไหม?",            a: "รับได้ 14–15 ต.ค. 2026 ที่ The Memory Hill, Pong Yaeng เวลา 10:00–20:00 · ฝากคนอื่นรับแทนได้โดยใช้สำเนาบัตรประชาชน + หนังสือมอบอำนาจ" },
  { q: "มีที่จอดรถและที่พักไหม?",                                    a: "ที่จอดรถฟรีรองรับ 1,200 คันที่จุด Start · บริการ Shuttle จากตัวเมืองเชียงใหม่ · มีที่พักแบบเต็นท์ในงาน 800 บาท/คืน · โรงแรมพันธมิตรในเครือ Pong Yaeng ส่วนลด 15%" },
  { q: "เด็กอายุต่ำกว่า 18 สมัครได้ไหม?",                          a: "20K สมัครได้ตั้งแต่ 16 ปี (ต้องมีผู้ปกครองยินยอม) · 45K ขึ้นไปต้องอายุ 18 ปีขึ้นไป · 100K และ 160K ต้องอายุ 20 ปีขึ้นไป + มี ITRA index ขั้นต่ำ" },
  { q: "ถ้าฝนตกหรือมีพายุ จัดงานปกติไหม?",                         a: "งานจัดต่อเนื่องในสภาพอากาศปกติ · กรณี severe weather อาจมีการปรับเส้นทางหรือเลื่อน start time · หากต้องยกเลิกงาน เราจะคืนเงิน 70% ของค่าสมัคร" },
];

function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section className="sec" id="faq">
      <div className="sec-eyebrow"><span className="dot" />FAQ</div>
      <h2 className="sec-title">คำถาม<span className="ital">พบบ่อย</span></h2>
      <div className="faq-grid">
        {FAQ_DATA.map((it, i) => (
          <div key={i} className={"faq-item" + (open === i ? " open" : "")}>
            <button className="faq-q" onClick={() => setOpen(open === i ? -1 : i)}>
              <span>{it.q}</span>
              <span className="ico"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg></span>
            </button>
            {open === i && <div className="faq-a">{it.a}</div>}
          </div>
        ))}
      </div>
    </section>
  );
}

// ——— SPONSORS ———
function Sponsors() {
  return (
    <section className="sponsors-section">
      <div className="sec">
        <div className="sec-eyebrow"><span className="dot" />Partners</div>
        <h2 className="sec-title">ผู้สนับสนุน<span className="ital">หลัก</span></h2>
        <div style={{ marginTop: 32 }}>
          <div className="sp-tier">
            <div className="sp-tier-head">Title Sponsor</div>
            <div className="sp-grid title"><div className="sp-card"><span className="sp-name">SINGHA <span className="ml-accent">TRAIL</span> SERIES</span></div></div>
          </div>
          {[
            { tier: "Platinum", cls: "platinum", names: ["SALOMON", "HOKA", "TAILWIND"] },
            { tier: "Gold",     cls: "gold",     names: ["SUUNTO", "GARMIN", "BLACK DIAMOND", "UTMB INDEX"] },
            { tier: "Silver & Media", cls: "silver", names: ["VIBRAM", "ULTIMATE", "NATHAN", "PETZL", "RUDY", "PEAK"] },
          ].map((t) => (
            <div key={t.tier} className="sp-tier">
              <div className="sp-tier-head">{t.tier}</div>
              <div className={"sp-grid " + t.cls}>
                {t.names.map((s) => <div key={s} className="sp-card"><span className="sp-name">{s}</span></div>)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ——— FOOTER ———
function PytFooter() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <Logo />
            <p>เส้นทางเทรลในตำนาน กลางขุนเขาและสายหมอกของโป่งแยง · จัดต่อเนื่องเป็นปีที่ 12</p>
            <div className="footer-social">
              <a href="#"><svg viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg></a>
              <a href="#"><svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.4a4 4 0 1 1-7.9 1.2 4 4 0 0 1 7.9-1.2zM17.5 6.5h.01" /></svg></a>
            </div>
          </div>
          <div className="footer-col">
            <h4>Event</h4>
            <ul>
              <li><a href="#categories">Categories</a></li>
              <li><a href="#course">Course</a></li>
              <li><a href="#schedule">Schedule</a></li>
              <li><a href="#kit">Race Kit</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Support</h4>
            <ul>
              <li><a href="#faq">FAQ</a></li>
              <li><a href="#">Refund policy</a></li>
              <li><a href="#">Volunteer</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Newsletter</h4>
            <p style={{ fontSize: 13, opacity: .7, margin: "0 0 10px" }}>รับข่าว Early Bird ก่อนใคร</p>
            <div className="newsletter">
              <input placeholder="your@email.com" />
              <button>Subscribe</button>
            </div>
          </div>
        </div>
        <div className="footer-bot">
          <span>© 2026 Pong Yaeng Trail · Organized by Trail Events Co. · Powered by My Trails</span>
          <span><a href="#">Privacy</a> · <a href="#">Terms</a></span>
        </div>
      </div>
    </footer>
  );
}

// ——— LIGHTBOX ———
function Lightbox({ src, onClose }: { src: string | null; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className={"lb-overlay" + (src ? " open" : "")} onClick={onClose}>
      {src && <img src={src} alt="" onClick={(e) => e.stopPropagation()} />}
      <button className="close" onClick={onClose}>×</button>
    </div>
  );
}

// ——— PAGE ———
export default function PongYaengTrailPage() {
  const [zoom, setZoom] = useState<string | null>(null);
  const [pastHero, setPastHero] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      if (!heroRef.current) return;
      setPastHero(heroRef.current.getBoundingClientRect().bottom < 80);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="lp">
      <LpNav visible={pastHero} />
      <div ref={heroRef} style={{ height: 780, position: "relative" }}>
        <HeroVideo variant="stencil" showNav={!pastHero} />
      </div>
      <RaceCategories />
      <CourseMap />
      <RaceKit onZoom={setZoom} />
      <ScheduleSection />
      <Highlights onZoom={setZoom} />
      <Registration />
      <FAQ />
      <Sponsors />
      <PytFooter />
      <Lightbox src={zoom} onClose={() => setZoom(null)} />
      <div className="mobile-cta">
        <a href="#register">สมัครเลย · Register Now</a>
      </div>
    </div>
  );
}
