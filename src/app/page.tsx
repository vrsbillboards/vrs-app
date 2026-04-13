"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight, BarChart2, CheckCircle2, ChevronDown,
  CreditCard, Map, Menu, Shield, Upload, X, Zap,
} from "lucide-react";

/* ─── Scroll reveal ──────────────────────────────────────────────────────── */
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".sr,.sr-left,.sr-right");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("sr-v"); }),
      { threshold: 0.05, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* ─── Animated counter ───────────────────────────────────────────────────── */
function useCounter(target: number, duration = 1800) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - start) / duration, 1);
        setVal(Math.round((1 - Math.pow(1 - p, 4)) * target));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [target, duration]);
  return { val, ref };
}

/* ─── StatCard ───────────────────────────────────────────────────────────── */
function StatCard({ value, suffix, label, delay }: { value: number; suffix: string; label: string; delay: string }) {
  const { val, ref } = useCounter(value);
  return (
    <div className={`sr ${delay} rounded-2xl border border-[#1a1a1a] bg-[#0c0f0b] p-8 text-center`}>
      <p
        className="font-[family-name:var(--font-barlow-condensed)] text-[clamp(3rem,7vw,4.5rem)] font-black leading-none tabular-nums text-[#d4ff00]"
        style={{ textShadow: "0 0 40px rgba(212,255,0,0.4)" }}
      >
        <span ref={ref}>{val.toLocaleString("hu-HU")}</span>{suffix}
      </p>
      <p className="mt-3 text-base text-[#666666]">{label}</p>
    </div>
  );
}

/* ─── FAQItem ────────────────────────────────────────────────────────────── */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#1a1a1a]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 py-6 text-left text-lg font-semibold text-white transition hover:text-[#d4ff00]"
      >
        {q}
        <ChevronDown className={`h-5 w-5 shrink-0 text-[#555555] transition-transform duration-300 ${open ? "rotate-180 text-[#d4ff00]" : ""}`} strokeWidth={2} />
      </button>
      <div className={`overflow-hidden transition-all duration-400 ${open ? "max-h-96 pb-6" : "max-h-0"}`}>
        <p className="text-base leading-relaxed text-[#777777]">{a}</p>
      </div>
    </div>
  );
}

/* ─── App mockup (hero) ───────────────────────────────────────────────────── */
function AppMockup() {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-[#1a1a1a] shadow-[0_0_80px_rgba(212,255,0,0.08),0_40px_120px_rgba(0,0,0,0.8)]" style={{ aspectRatio: "16/9" }}>
      {/* Browser chrome */}
      <div className="flex h-9 items-center gap-2 border-b border-[#1a1a1a] bg-[#0a0a0a] px-4">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        <div className="mx-3 flex-1 rounded-md border border-[#1a1a1a] bg-[#111111] px-3 py-1 text-[11px] text-[#444444]">
          vrsbillboards.hu/foglalas
        </div>
      </div>
      {/* Dashboard layout */}
      <div className="flex h-[calc(100%-36px)] bg-[#000000]">
        {/* Sidebar */}
        <div className="flex w-14 flex-col items-center gap-3 border-r border-[#1a1a1a] bg-[#0a0a0a] py-4">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-[#d4ff00]">
            <span className="font-[family-name:var(--font-barlow-condensed)] text-[10px] font-black text-black">VRS</span>
          </div>
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`h-7 w-7 rounded-lg ${i === 0 ? "bg-[#d4ff00]/20 ring-1 ring-[#d4ff00]/40" : "bg-[#1a1a1a]"}`} />
          ))}
        </div>
        {/* Main content */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Topbar */}
          <div className="flex h-9 items-center justify-between border-b border-[#1a1a1a] bg-[#0a0a0a] px-4">
            <div className="h-4 w-32 rounded-md bg-[#1a1a1a]" />
            <div className="h-6 w-20 rounded-lg bg-[#d4ff00]/80" />
          </div>
          {/* Map area */}
          <div className="relative flex-1 overflow-hidden bg-[#060907]">
            {/* Grid */}
            <svg className="absolute inset-0 h-full w-full opacity-[0.05]" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="g2" width="32" height="32" patternUnits="userSpaceOnUse">
                  <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#d4ff00" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#g2)" />
            </svg>
            {/* Roads */}
            <svg className="absolute inset-0 h-full w-full opacity-20" xmlns="http://www.w3.org/2000/svg">
              <line x1="0" y1="40%" x2="100%" y2="55%" stroke="#1a2a1a" strokeWidth="4"/>
              <line x1="30%" y1="0" x2="40%" y2="100%" stroke="#1a2a1a" strokeWidth="3"/>
              <line x1="0" y1="70%" x2="100%" y2="65%" stroke="#1a2a1a" strokeWidth="2"/>
              <line x1="65%" y1="0" x2="55%" y2="100%" stroke="#1a2a1a" strokeWidth="2"/>
            </svg>
            {/* Markers */}
            {[
              { x: "28%", y: "38%", active: true  },
              { x: "52%", y: "55%", active: false },
              { x: "70%", y: "30%", active: false },
              { x: "38%", y: "68%", active: false },
              { x: "80%", y: "62%", active: false },
            ].map((m, i) => (
              <div key={i} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: m.x, top: m.y }}>
                <div className={`h-3 w-3 rounded-full border-2 border-black ${m.active ? "bg-[#d4ff00] shadow-[0_0_10px_#d4ff00]" : "bg-[#38bdf8] shadow-[0_0_6px_rgba(56,189,248,0.6)]"}`} />
              </div>
            ))}
            {/* Side panel */}
            <div className="absolute bottom-3 right-3 top-3 w-36 overflow-hidden rounded-xl border border-[#1a1a1a] bg-[#0c0f0b]/95 p-3">
              <div className="mb-2 h-12 w-full rounded-lg bg-[#d4ff00]/10" />
              <div className="mb-1 h-2 w-16 rounded bg-[#d4ff00]/60" />
              <div className="mb-1 h-2.5 w-24 rounded bg-[#333]" />
              <div className="mb-0.5 h-2 w-20 rounded bg-[#222]" />
              <div className="mb-0.5 h-2 w-16 rounded bg-[#222]" />
              <div className="mt-3 h-5 w-full rounded-lg bg-[#d4ff00]" />
            </div>
          </div>
        </div>
      </div>
      {/* Fade bottom */}
      <div className="pointer-events-none absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled]     = useState(false);

  useScrollReveal();

  useEffect(() => {
    document.documentElement.classList.add("lp-scroll");
    return () => document.documentElement.classList.remove("lp-scroll");
  }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const navLinks = [
    { label: "Funkciók",        href: "#features" },
    { label: "Hogyan működik",  href: "#how"      },
    { label: "FAQ",             href: "#faq"      },
  ];

  return (
    <div className="min-h-screen bg-[#000000] font-[family-name:var(--font-barlow)] text-white antialiased">

      {/* ══════ NAV ══════════════════════════════════════════════════════ */}
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scrolled ? "border-b border-white/[0.07] bg-black/85 backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,0,0,0.5)]" : "bg-transparent"}`}>
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-6 sm:px-10" style={{ height: "68px" }}>
          <Link href="/" className="font-[family-name:var(--font-barlow-condensed)] text-3xl font-black tracking-widest text-white">
            VRS<span className="text-[#d4ff00]">.</span>
          </Link>
          <nav className="hidden items-center gap-10 md:flex">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="text-base font-medium text-[#666666] transition hover:text-white">{l.label}</a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/foglalas" className="hidden rounded-xl border border-[#222] bg-transparent px-5 py-2.5 text-base font-semibold text-[#777777] transition hover:border-[#d4ff00]/30 hover:text-white sm:inline-flex">
              Belépés
            </Link>
            <Link href="/foglalas" className="inline-flex items-center gap-2 rounded-xl bg-[#d4ff00] px-5 py-2.5 text-base font-black text-black transition hover:brightness-110">
              Foglalás <ArrowRight className="h-4 w-4" strokeWidth={3} />
            </Link>
            <button type="button" onClick={() => setMobileOpen(true)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#1a1a1a] text-[#666666] md:hidden">
              <Menu className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[200] flex flex-col bg-black/97 backdrop-blur-xl">
          <div className="flex h-[68px] items-center justify-between px-6">
            <span className="font-[family-name:var(--font-barlow-condensed)] text-3xl font-black tracking-widest">VRS<span className="text-[#d4ff00]">.</span></span>
            <button type="button" onClick={() => setMobileOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#1a1a1a] text-[#666666]">
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>
          <nav className="flex flex-col gap-2 px-6 pt-6">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
                className="rounded-xl px-4 py-4 text-xl font-semibold text-[#888888] transition hover:bg-[#0c0f0b] hover:text-white">{l.label}</a>
            ))}
            <Link href="/foglalas" onClick={() => setMobileOpen(false)}
              className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-[#d4ff00] py-4 text-xl font-black text-black">
              Foglalás Indítása <ArrowRight className="h-5 w-5" strokeWidth={3} />
            </Link>
          </nav>
        </div>
      )}

      {/* ══════ HERO ═════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden px-6 pb-20 pt-36 sm:px-10 sm:pt-44 lg:pt-52">
        {/* Ambient glow */}
        <div aria-hidden className="animate-glow-orb pointer-events-none absolute left-1/2 top-[-8%] h-[800px] w-[1100px] -translate-x-1/2 rounded-full"
          style={{ background: "radial-gradient(ellipse, rgba(212,255,0,0.14) 0%, transparent 65%)" }} />

        <div className="relative mx-auto max-w-6xl">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-[#d4ff00]/25 bg-[#d4ff00]/8 px-6 py-2.5 text-[13px] font-black uppercase tracking-[0.2em] text-[#d4ff00] animate-word animate-word-d1">
            <Zap className="h-3.5 w-3.5 fill-[#d4ff00]" />
            Magyarország #1 DOOH platform
          </div>

          {/* Headline — gigantic */}
          <h1 className="font-[family-name:var(--font-barlow-condensed)] font-black uppercase leading-[0.85] tracking-tight"
            style={{ fontSize: "clamp(3.8rem, 12vw, 9.5rem)" }}>
            <span className="block overflow-hidden">
              <span className="animate-word animate-word-d2 inline-block text-white">A digitális</span>
            </span>
            <span className="block overflow-hidden">
              <span className="animate-word animate-word-d3 inline-block text-[#d4ff00]"
                style={{ textShadow: "0 0 100px rgba(212,255,0,0.55)" }}>
                óriásplakát
              </span>
            </span>
            <span className="block overflow-hidden">
              <span className="animate-word animate-word-d4 inline-block text-white">bérlés jövője.</span>
            </span>
          </h1>

          {/* Subtitle + CTA row */}
          <div className="mt-10 flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <p className="animate-word animate-word-d5 text-xl leading-relaxed text-[#777777] sm:text-2xl">
                Felejtsd el a hetekig tartó e-mailezést. Foglalj prémium felületeket
                <span className="font-semibold text-[#bbbbbb]"> másodpercek alatt</span>,
                és kövesd a megtérülést valós időben.
              </p>
              {/* Trust pills */}
              <div className="animate-word animate-word-d6 mt-6 flex flex-wrap gap-3">
                {["Nincs bevezetési díj", "Azonnali aktiválás", "Valós idejű adatok", "Ingyenes regisztráció"].map((t) => (
                  <span key={t} className="flex items-center gap-2 rounded-full border border-[#1e1e1e] bg-[#0c0c0c] px-4 py-2 text-sm font-semibold text-[#999999]">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[#d4ff00]" strokeWidth={2.5} />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA group */}
            <div className="animate-word animate-word-d6 flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <Link href="/foglalas"
                className="cta-shine group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-2xl bg-[#d4ff00] px-9 py-5 font-[family-name:var(--font-barlow-condensed)] text-2xl font-black uppercase tracking-wider text-black shadow-[0_0_60px_rgba(212,255,0,0.45),0_0_120px_rgba(212,255,0,0.15)] transition hover:brightness-110 active:scale-[0.98]">
                Foglalás Indítása
                <ArrowRight className="h-6 w-6 transition-transform duration-300 group-hover:translate-x-1.5" strokeWidth={3} />
              </Link>
              <a href="#how"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#222] bg-[#0c0c0c] px-7 py-5 font-[family-name:var(--font-barlow-condensed)] text-xl font-bold uppercase tracking-wider text-[#888888] transition hover:border-[#333] hover:text-white">
                Hogyan működik?
              </a>
            </div>
          </div>

          {/* App mockup */}
          <div className="animate-word animate-word-d6 mt-14 sm:mt-18">
            <AppMockup />
          </div>
        </div>
      </section>

      {/* ══════ MARQUEE ══════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden border-y border-[#111] bg-[#060906] py-5">
        <div className="animate-marquee-lp flex w-max whitespace-nowrap">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center">
              {["GYŐR", "BUDAPEST", "SZÉKESFEHÉRVÁR", "KECSKEMÉT", "MOSONMAGYARÓVÁR", "SZOLNOK", "DEBRECEN", "PÉCS", "DOOH PLATFORM", "VALÓS IDEJŰ ROI", "AZONNALI FOGLALÁS"].map((w) => (
                <span key={w} className="flex items-center gap-5 px-6 font-[family-name:var(--font-barlow-condensed)] text-base font-black uppercase tracking-[0.18em]">
                  <span className="text-[#2a2a2a]">{w}</span>
                  <span className="text-[#d4ff00] opacity-50">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ══════ STATS ════════════════════════════════════════════════════ */}
      <section className="px-6 py-24 sm:px-10 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard value={80}  suffix="+"      label="Reklámfelület országszerte"    delay="sr-d1" />
            <StatCard value={12}  suffix="+"      label="Aktív város a hálózatban"      delay="sr-d2" />
            <StatCard value={96}  suffix="%"      label="Ügyfél-elégedettségi ráta"     delay="sr-d3" />
            <StatCard value={3}   suffix=" perc"  label="Átlagos foglalási idő"         delay="sr-d4" />
          </div>
        </div>
      </section>

      {/* ══════ FEATURES ═════════════════════════════════════════════════ */}
      <section id="features" className="px-6 py-10 sm:px-10">
        <div className="mx-auto max-w-6xl space-y-6">

          {/* Feature 1 — Térkép */}
          <div className="group relative overflow-hidden rounded-3xl border border-[#111] bg-[#060906] p-8 transition hover:border-[#d4ff00]/20 sm:p-14">
            <div aria-hidden className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full opacity-0 transition-opacity duration-700 group-hover:opacity-100"
              style={{ background: "radial-gradient(circle at top right, rgba(212,255,0,0.06) 0%, transparent 70%)" }} />
            <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
              <div className="sr-left">
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#d4ff00]/10 text-[#d4ff00]">
                  <Map className="h-7 w-7" strokeWidth={2} />
                </div>
                <p className="mb-3 text-sm font-black uppercase tracking-[0.22em] text-[#d4ff00]">01 — Böngészés</p>
                <h2 className="font-[family-name:var(--font-barlow-condensed)] font-black uppercase leading-tight text-white"
                  style={{ fontSize: "clamp(2.2rem,4.5vw,3.5rem)" }}>
                  Interaktív térképes<br />tervező
                </h2>
                <p className="mt-5 text-lg leading-relaxed text-[#666666]">
                  Az összes elérhető felület egy élő térképen. Szűrj város, típus
                  és napi OTS szerint. Kattints egy jelölőre, és azonnal látod a részleteket, képeket és árat.
                </p>
                <ul className="mt-7 space-y-3.5">
                  {["80+ felület valós idejű elérhetőséggel", "Szűrés városra, típusra, OTS-re", "Egyedi neon zöld jelölők a térképen"].map((t) => (
                    <li key={t} className="flex items-center gap-3 text-base text-[#888888]">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-[#d4ff00]" strokeWidth={2.5} /> {t}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Map mockup */}
              <div className="sr-right relative overflow-hidden rounded-2xl border border-[#1a1a1a] bg-[#060907]" style={{ aspectRatio: "4/3" }}>
                <div className="absolute inset-0 opacity-25" style={{ backgroundImage: "radial-gradient(circle at 30% 40%, rgba(212,255,0,0.2) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(56,189,248,0.1) 0%, transparent 40%)" }} />
                <svg className="absolute inset-0 h-full w-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
                  <defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="#d4ff00" strokeWidth="0.5"/></pattern></defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
                {[{ x:"28%",y:"38%",active:true },{ x:"55%",y:"58%",active:false },{ x:"72%",y:"32%",active:false },{ x:"42%",y:"70%",active:false }].map((m,i) => (
                  <div key={i} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left:m.x, top:m.y }}>
                    <div className={`h-4 w-4 rounded-full border-2 border-black ${m.active ? "bg-[#d4ff00] shadow-[0_0_16px_#d4ff00]" : "bg-[#38bdf8] shadow-[0_0_8px_rgba(56,189,248,0.7)]"}`} />
                    {m.active && <div className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-[#d4ff00]/30 bg-[#0c0f0b]/95 px-2.5 py-1.5 text-[11px] font-black text-[#d4ff00]">GY-OP-04</div>}
                  </div>
                ))}
                <div className="absolute right-3 top-3 bottom-3 w-40 overflow-hidden rounded-xl border border-[#1a1a1a] bg-[#0c0f0b]/95 p-4 text-[10px]">
                  <div className="mb-3 h-16 w-full rounded-lg bg-[#d4ff00]/10" />
                  <span className="font-mono font-black text-[#d4ff00]">GY-OP-04</span>
                  <p className="mt-1 text-sm font-semibold text-white">ETO Park kampány</p>
                  <p className="text-[#555555]">Győr · P6 LED</p>
                  <p className="mt-1.5 text-[#888888]">48 000 OTS/nap</p>
                  <div className="mt-3 w-full rounded-lg bg-[#d4ff00] py-2 text-center text-xs font-black text-black">FOGLALÁS</div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2 — Analytics */}
          <div className="group relative overflow-hidden rounded-3xl border border-[#111] bg-[#060906] p-8 transition hover:border-[#d4ff00]/20 sm:p-14">
            <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
              {/* Chart mockup */}
              <div className="sr-left order-2 lg:order-1 overflow-hidden rounded-2xl border border-[#1a1a1a] bg-[#060907] p-6">
                <div className="mb-5 grid grid-cols-3 gap-3">
                  {[["505 120","Megjelenés"],["440K Ft","Elköltve"],["12","Kampány"]].map(([v,l]) => (
                    <div key={l} className="rounded-xl border border-[#1a1a1a] bg-[#0c0f0b] p-3.5 text-center">
                      <p className="font-[family-name:var(--font-barlow-condensed)] text-lg font-black text-[#d4ff00]">{v}</p>
                      <p className="text-[10px] text-[#555555]">{l}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl border border-[#1a1a1a] bg-[#0c0f0b] p-5">
                  <p className="mb-4 text-xs font-bold uppercase tracking-wider text-[#444444]">Heti megjelenések</p>
                  <div className="flex h-32 items-end gap-2">
                    {[52,78,65,91,88,72,59].map((h,i) => (
                      <div key={i} className="flex-1 rounded-t transition-all hover:brightness-125"
                        style={{ height:`${(h/91)*100}%`, background:"linear-gradient(to top, #d4ff00, #8aaa00)" }} />
                    ))}
                  </div>
                  <div className="mt-3 flex justify-between text-[11px] text-[#444444]">
                    {["H","K","Sze","Cs","P","Szo","V"].map((d) => <span key={d}>{d}</span>)}
                  </div>
                </div>
              </div>
              <div className="sr-right order-1 lg:order-2">
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#d4ff00]/10 text-[#d4ff00]">
                  <BarChart2 className="h-7 w-7" strokeWidth={2} />
                </div>
                <p className="mb-3 text-sm font-black uppercase tracking-[0.22em] text-[#d4ff00]">02 — Analytics</p>
                <h2 className="font-[family-name:var(--font-barlow-condensed)] font-black uppercase leading-tight text-white"
                  style={{ fontSize: "clamp(2.2rem,4.5vw,3.5rem)" }}>
                  Valós idejű<br />ROI követés
                </h2>
                <p className="mt-5 text-lg leading-relaxed text-[#666666]">
                  Kövesd a kampányod megtérülését élő adatokkal. Impressziók, OTS, becsült bevétel
                  és ROI kalkulátor — minden egy helyen, valós időben frissülve.
                </p>
                <ul className="mt-7 space-y-3.5">
                  {["Valós idejű OTS és impression adatok","ROI kalkulátor beépítve","Kampányonkénti lebontás"].map((t) => (
                    <li key={t} className="flex items-center gap-3 text-base text-[#888888]">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-[#d4ff00]" strokeWidth={2.5} /> {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Feature 3 — Fizetés */}
          <div className="group relative overflow-hidden rounded-3xl border border-[#d4ff00]/12 bg-gradient-to-br from-[#d4ff00]/5 via-[#060906] to-[#060906] p-8 transition hover:border-[#d4ff00]/25 sm:p-14">
            <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
              <div className="sr-left">
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#d4ff00]/15 text-[#d4ff00]">
                  <CreditCard className="h-7 w-7" strokeWidth={2} />
                </div>
                <p className="mb-3 text-sm font-black uppercase tracking-[0.22em] text-[#d4ff00]">03 — Fizetés</p>
                <h2 className="font-[family-name:var(--font-barlow-condensed)] font-black uppercase leading-tight text-white"
                  style={{ fontSize: "clamp(2.2rem,4.5vw,3.5rem)" }}>
                  Azonnali<br />bankkártyás fizetés
                </h2>
                <p className="mt-5 text-lg leading-relaxed text-[#666666]">
                  Stripe-alapú, 256-bites SSL titkosítású fizetési kapu. Foglalás után perceken belül
                  megérkezik a visszaigazolás és a számla.
                </p>
                <div className="mt-7 grid grid-cols-2 gap-3">
                  {[
                    [<Shield key="s" className="h-5 w-5" strokeWidth={2}/>, "SSL titkosítás"],
                    [<Zap key="z" className="h-5 w-5" strokeWidth={2}/>, "Azonnali visszaigazolás"],
                    [<CreditCard key="c" className="h-5 w-5" strokeWidth={2}/>, "Minden kártya elfogadva"],
                    [<CheckCircle2 key="ch" className="h-5 w-5" strokeWidth={2}/>, "Nincs rejtett díj"],
                  ].map(([icon, label]) => (
                    <div key={String(label)} className="flex items-center gap-2.5 rounded-xl border border-[#1a1a1a] bg-black/40 px-4 py-3 text-base font-semibold text-[#888888]">
                      <span className="text-[#d4ff00]">{icon}</span>{label}
                    </div>
                  ))}
                </div>
              </div>
              {/* Payment mockup */}
              <div className="sr-right overflow-hidden rounded-2xl border border-[#d4ff00]/15 bg-[#0c0f0b] p-7 shadow-[0_0_60px_rgba(212,255,0,0.07)]">
                <p className="mb-5 text-xs font-black uppercase tracking-wider text-[#444444]">Összesítő</p>
                <div className="mb-5 space-y-3 text-base">
                  {[["Felület","GY-OP-04 · ETO Park"],["Időszak","2026. máj. 1–28."],["Napszak","Egész nap"]].map(([k,v]) => (
                    <div key={String(k)} className="flex justify-between">
                      <span className="text-[#555555]">{k}</span>
                      <span className="font-semibold text-white">{v}</span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t border-[#1a1a1a] pt-3">
                    <span className="font-bold text-white">Fizetendő</span>
                    <span className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-black text-[#d4ff00]">248 000 Ft</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="rounded-xl border border-[#1a1a1a] bg-black px-4 py-3 text-sm text-[#333333]">4242 4242 4242 4242</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-[#1a1a1a] bg-black px-4 py-3 text-sm text-[#333333]">04 / 28</div>
                    <div className="rounded-xl border border-[#1a1a1a] bg-black px-4 py-3 text-sm text-[#333333]">···</div>
                  </div>
                </div>
                <button type="button" className="mt-5 w-full rounded-xl bg-[#d4ff00] py-3.5 font-[family-name:var(--font-barlow-condensed)] text-lg font-black text-black shadow-[0_0_30px_rgba(212,255,0,0.3)]">
                  Fizetés és foglalás →
                </button>
                <p className="mt-3 text-center text-xs text-[#333333]">256-bit SSL · Stripe · PCI-DSS</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ══════ HOW IT WORKS ═════════════════════════════════════════════ */}
      <section id="how" className="border-t border-[#0a0a0a] bg-[#040504] px-6 py-24 sm:px-10 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="sr mb-16 text-center">
            <p className="mb-4 text-sm font-black uppercase tracking-[0.28em] text-[#d4ff00]">Folyamat</p>
            <h2 className="font-[family-name:var(--font-barlow-condensed)] font-black uppercase leading-tight text-white"
              style={{ fontSize: "clamp(2.5rem,6vw,4.5rem)" }}>
              5 lépés, kint a kampány
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { n:"01", icon:<Map className="h-7 w-7" strokeWidth={2}/>,      title:"Felület kiválasztása",  desc:"Böngészd a térképet, válaszd ki a helyszínt és idősávot." },
              { n:"02", icon:<BarChart2 className="h-7 w-7" strokeWidth={2}/>, title:"OTS ellenőrzés",        desc:"Valós idejű napi elérési adatok és statisztikák." },
              { n:"03", icon:<Upload className="h-7 w-7" strokeWidth={2}/>,    title:"Kreatív feltöltés",     desc:"Húzd be a bannert vagy videót — automatikus validáció." },
              { n:"04", icon:<CreditCard className="h-7 w-7" strokeWidth={2}/>,title:"Fizetés",               desc:"Biztonságos Stripe checkout, azonnali visszaigazolással." },
              { n:"05", icon:<Zap className="h-7 w-7 fill-[#d4ff00] text-black" strokeWidth={2}/>, title:"Kampány él!", desc:"A kreatív perceken belül megjelenik a felületen." },
            ].map((step, i) => (
              <div key={step.n} className={`sr sr-d${i+1} rounded-2xl border p-7 text-center transition ${i===4 ? "border-[#d4ff00]/25 bg-[#d4ff00]/5 hover:shadow-[0_0_40px_rgba(212,255,0,0.08)]" : "border-[#1a1a1a] bg-[#0c0f0b]"}`}>
                <div className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl ${i===4 ? "bg-[#d4ff00] text-black shadow-[0_0_30px_rgba(212,255,0,0.4)]" : "bg-[#d4ff00]/10 text-[#d4ff00]"}`}>
                  {step.icon}
                </div>
                <span className="mb-2 block font-mono text-xs font-black text-[#333333]">{step.n}</span>
                <h3 className="font-[family-name:var(--font-barlow-condensed)] text-xl font-black text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#555555]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ PARTNERS ═════════════════════════════════════════════════ */}
      <section className="border-t border-[#0a0a0a] px-6 py-16 sm:px-10">
        <div className="mx-auto max-w-5xl">
          <p className="sr mb-10 text-center text-xs font-black uppercase tracking-[0.3em] text-[#2a2a2a]">Partnereink, akik már velünk hirdetnek</p>
          <div className="flex flex-wrap items-center justify-center gap-x-14 gap-y-8">
            <div className="sr sr-d1 flex items-center gap-3 opacity-40 grayscale transition hover:opacity-100 hover:grayscale-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d4ff00]">
                <span className="font-[family-name:var(--font-barlow-condensed)] text-base font-black text-black">6</span>
              </div>
              <span className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-black text-white">6ékony</span>
            </div>
            {["MediaGroup","UrbanAds HU","CityVision","AdPoint"].map((name,i) => (
              <span key={name} className={`sr sr-d${i+2} font-[family-name:var(--font-barlow-condensed)] text-xl font-black uppercase tracking-wide text-[#1e1e1e] transition hover:text-[#444]`}>{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ FAQ ══════════════════════════════════════════════════════ */}
      <section id="faq" className="border-t border-[#0a0a0a] bg-[#040504] px-6 py-24 sm:px-10 sm:py-32">
        <div className="mx-auto max-w-3xl">
          <div className="sr mb-14 text-center">
            <p className="mb-4 text-sm font-black uppercase tracking-[0.28em] text-[#d4ff00]">Kérdések</p>
            <h2 className="font-[family-name:var(--font-barlow-condensed)] font-black uppercase leading-tight text-white"
              style={{ fontSize: "clamp(2.5rem,6vw,4.5rem)" }}>
              Gyakori kérdések
            </h2>
          </div>
          <div className="sr">
            {[
              { q:"Mennyibe kerül a foglalás?", a:"Az árak felülettől és időtartamtól függenek. Hetibérek 60 000 Ft-tól indulnak. Amit látsz, azt fizeted — nincsenek rejtett díjak, bevezetési vagy setup fee-k." },
              { q:"Mennyi idő alatt jelenik meg a kreatívom?", a:"Fizetés visszaigazolása után a kreatívet perceken belül feltöltjük a felületre. Digitális (LED) felületek esetén ez szinte azonnali." },
              { q:"Milyen formátumokat fogadtok el?", a:"JPG, PNG és MP4 formátumokat fogadunk el. A rendszer automatikusan validálja a fájlt, és jelzi, ha valami nem stimmel a méretekkel vagy arányokkal." },
              { q:"Lehet-e módosítani a kampányt indítás után?", a:"Igen, az irányítópultból bármikor módosíthatod a kreatívot a futó kampány alatt. Időpont-módosítást kérjük ügyfélszolgálatunkon keresztül jelezd." },
              { q:"Milyen statisztikákat kapok?", a:"Valós idejű OTS (napi elérés), kampányonkénti impresszióbecslés, ROI kalkulátor és heti trendgrafikonok állnak rendelkezésre az irányítópulton." },
              { q:"Szükségem van-e ügynökségre?", a:"Nem. A platform úgy lett tervezve, hogy bárki önállóan tudja kezelni. Ha segítségre van szükséged, csapatunk 24/7 elérhető." },
            ].map((item) => <FAQItem key={item.q} {...item} />)}
          </div>
        </div>
      </section>

      {/* ══════ CTA BANNER ═══════════════════════════════════════════════ */}
      <section className="px-6 py-24 sm:px-10 sm:py-32">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-[#d4ff00]/15 bg-[#0c0f0b]">
          <div aria-hidden className="pointer-events-none absolute inset-0 rounded-3xl"
            style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(212,255,0,0.18) 0%, transparent 55%)" }} />
          <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.035]"
            style={{ backgroundImage: "linear-gradient(rgba(212,255,0,1) 1px,transparent 1px),linear-gradient(90deg,rgba(212,255,0,1) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
          <div className="relative px-8 py-20 text-center sm:px-16 sm:py-24">
            <p className="sr mb-5 text-sm font-black uppercase tracking-[0.28em] text-[#d4ff00]">Kezdd el ma</p>
            <h2 className="sr sr-d1 font-[family-name:var(--font-barlow-condensed)] font-black uppercase leading-[0.9] text-white"
              style={{ fontSize: "clamp(3rem,8vw,6rem)" }}>
              Készen állsz az első<br />
              <span className="text-[#d4ff00]" style={{ textShadow: "0 0 80px rgba(212,255,0,0.5)" }}>kampányodra?</span>
            </h2>
            <p className="sr sr-d2 mx-auto mt-6 max-w-lg text-lg text-[#666666]">
              Regisztrálj ingyen, és percek alatt elindíthatod az első kampányodat. Nincs elköteleződés, nincs rejtett díj.
            </p>
            <div className="sr sr-d3 mt-10">
              <Link href="/foglalas"
                className="cta-shine group relative inline-flex items-center gap-3 overflow-hidden rounded-2xl bg-[#d4ff00] px-12 py-6 font-[family-name:var(--font-barlow-condensed)] text-2xl font-black uppercase tracking-wider text-black shadow-[0_0_70px_rgba(212,255,0,0.45),0_0_140px_rgba(212,255,0,0.15)] transition hover:brightness-110 active:scale-[0.98]">
                Foglalás Indítása — Ingyen
                <ArrowRight className="h-7 w-7 transition-transform duration-300 group-hover:translate-x-1.5" strokeWidth={3} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ FOOTER ═══════════════════════════════════════════════════ */}
      <footer className="border-t border-[#0a0a0a] px-6 py-12 sm:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <span className="font-[family-name:var(--font-barlow-condensed)] text-3xl font-black tracking-widest text-white">
                VRS<span className="text-[#d4ff00]">.</span>
              </span>
              <p className="mt-3 max-w-xs text-base text-[#444444]">Magyarország prémium DOOH foglalási platformja.</p>
            </div>
            <div className="grid grid-cols-2 gap-x-16 gap-y-4 text-base sm:grid-cols-3">
              <a href="#features" className="text-[#444444] transition hover:text-white">Funkciók</a>
              <a href="#how"      className="text-[#444444] transition hover:text-white">Folyamat</a>
              <a href="#faq"      className="text-[#444444] transition hover:text-white">FAQ</a>
              <Link href="/foglalas"                className="text-[#444444] transition hover:text-[#d4ff00]">Belépés</Link>
              <a href="mailto:hello@vrsbillboards.hu" className="text-[#444444] transition hover:text-white">Kapcsolat</a>
              <a href="#"                           className="text-[#444444] transition hover:text-white">Adatvédelem</a>
            </div>
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-[#0a0a0a] pt-8 sm:flex-row">
            <p className="text-sm text-[#333333]">© 2026 VRS Billboards Kft. Minden jog fenntartva.</p>
            <p className="text-xs text-[#222222]">Fejlesztve Next.js · Supabase · Stripe</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
