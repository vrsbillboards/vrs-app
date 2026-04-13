"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart2,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  Map,
  MapPin,
  Menu,
  Shield,
  Upload,
  X,
  Zap,
} from "lucide-react";

// ─── Scroll reveal ────────────────────────────────────────────────────────────
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".sr,.sr-left,.sr-right");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("sr-v"); }),
      { threshold: 0.07, rootMargin: "0px 0px -48px 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

// ─── Animated counter ─────────────────────────────────────────────────────────
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
        const ease = 1 - Math.pow(1 - p, 4);
        setVal(Math.round(ease * target));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, [target, duration]);
  return { val, ref };
}

// ─── Components ───────────────────────────────────────────────────────────────
function StatCard({ value, suffix, label, delay }: { value: number; suffix: string; label: string; delay: string }) {
  const { val, ref } = useCounter(value);
  return (
    <div className={`sr ${delay} rounded-2xl border border-[#1a1a1a] bg-[#0c0f0b] p-6 text-center`}>
      <p className="font-[family-name:var(--font-barlow-condensed)] text-[clamp(2.5rem,6vw,3.5rem)] font-black leading-none tabular-nums text-[#d4ff00]" style={{ textShadow: "0 0 40px rgba(212,255,0,0.35)" }}>
        <span ref={ref}>{val.toLocaleString("hu-HU")}</span>{suffix}
      </p>
      <p className="mt-2 text-sm text-[#666666]">{label}</p>
    </div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#1a1a1a]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left text-base font-semibold text-white transition hover:text-[#d4ff00]"
      >
        {q}
        <ChevronDown className={`h-5 w-5 shrink-0 text-[#555555] transition-transform duration-300 ${open ? "rotate-180 text-[#d4ff00]" : ""}`} strokeWidth={2} />
      </button>
      <div className={`overflow-hidden transition-all duration-400 ease-in-out ${open ? "max-h-96 pb-5" : "max-h-0"}`}>
        <p className="text-sm leading-relaxed text-[#666666]">{a}</p>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useScrollReveal();

  // Enable scroll for landing page, disable dashboard overflow
  useEffect(() => {
    document.documentElement.classList.add("lp-scroll");
    return () => document.documentElement.classList.remove("lp-scroll");
  }, []);

  // Nav transparency on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Funkciók", href: "#features" },
    { label: "Hogyan működik", href: "#how" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <div className="min-h-screen bg-[#000000] font-[family-name:var(--font-barlow)] text-white antialiased">

      {/* ══════════════════ NAV ══════════════════════════════════════════ */}
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scrolled ? "border-b border-white/[0.07] bg-black/80 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]" : "bg-transparent"}`}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-black tracking-widest text-white">
            VRS<span className="text-[#d4ff00]">.</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="text-sm font-medium text-[#888888] transition hover:text-white">
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/foglalas" className="hidden rounded-xl border border-[#1a1a1a] bg-transparent px-4 py-2 text-sm font-semibold text-[#888888] transition hover:border-[#d4ff00]/30 hover:text-white sm:inline-flex">
              Belépés
            </Link>
            <Link href="/foglalas" className="inline-flex items-center gap-1.5 rounded-xl bg-[#d4ff00] px-4 py-2 text-sm font-black text-black transition hover:brightness-110">
              Foglalás
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={3} />
            </Link>
            <button type="button" onClick={() => setMobileOpen(true)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#1a1a1a] text-[#888888] md:hidden">
              <Menu className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile nav overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[200] flex flex-col bg-black/95 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between px-5">
            <span className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-black tracking-widest">VRS<span className="text-[#d4ff00]">.</span></span>
            <button type="button" onClick={() => setMobileOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#1a1a1a] text-[#888888]">
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
          <nav className="flex flex-col gap-1 px-5 pt-6">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
                className="rounded-xl px-4 py-3.5 text-lg font-semibold text-[#888888] transition hover:bg-[#0c0f0b] hover:text-white">
                {l.label}
              </a>
            ))}
            <Link href="/foglalas" onClick={() => setMobileOpen(false)}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#d4ff00] py-4 text-lg font-black text-black">
              Foglalás Indítása <ArrowRight className="h-5 w-5" strokeWidth={3} />
            </Link>
          </nav>
        </div>
      )}

      {/* ══════════════════ HERO ═════════════════════════════════════════ */}
      <section className="relative min-h-screen overflow-hidden px-5 pb-24 pt-32 sm:px-8 sm:pt-40 lg:pt-44">
        {/* Ambient glow orbs */}
        <div aria-hidden className="animate-glow-orb pointer-events-none absolute left-1/2 top-[-10%] h-[700px] w-[1000px] -translate-x-1/2 rounded-full"
          style={{ background: "radial-gradient(ellipse, #d4ff00 0%, transparent 65%)" }} />
        <div aria-hidden className="animate-glow-orb-slow pointer-events-none absolute right-[-15%] top-[20%] h-[400px] w-[400px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(212,255,0,0.08) 0%, transparent 70%)" }} />
        <div aria-hidden className="animate-glow-orb pointer-events-none absolute left-[-10%] top-[40%] h-[300px] w-[300px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(212,255,0,0.06) 0%, transparent 70%)" }} />

        {/* Floating billboard cards */}
        <div aria-hidden className="animate-lp-float pointer-events-none absolute right-[5%] top-[18%] hidden w-44 overflow-hidden rounded-2xl border border-[#d4ff00]/20 bg-[#0c0f0b]/90 shadow-[0_0_40px_rgba(212,255,0,0.12)] backdrop-blur-sm xl:block">
          <div className="h-24 w-full bg-gradient-to-br from-[#d4ff00]/20 to-[#0c0f0b]" />
          <div className="p-3">
            <span className="font-mono text-[9px] font-black text-[#d4ff00]">GY-OP-04</span>
            <p className="mt-0.5 text-[11px] font-bold text-white">ETO Park kampány</p>
            <p className="text-[10px] text-[#666666]">Győr · P6 LED</p>
            <div className="mt-2 inline-flex rounded-md bg-[#d4ff00]/10 px-2 py-0.5 text-[9px] font-black text-[#d4ff00]">Elérhető</div>
          </div>
        </div>
        <div aria-hidden className="animate-lp-float-2 pointer-events-none absolute left-[3%] top-[30%] hidden w-40 overflow-hidden rounded-2xl border border-[#1a1a1a] bg-[#0c0f0b]/90 shadow-[0_0_24px_rgba(0,0,0,0.5)] backdrop-blur-sm xl:block">
          <div className="h-20 w-full bg-gradient-to-br from-[#38bdf8]/10 to-[#0c0f0b]" />
          <div className="p-3">
            <span className="font-mono text-[9px] font-black text-[#38bdf8]">SF-OP-06</span>
            <p className="mt-0.5 text-[11px] font-bold text-white">Palotai út</p>
            <p className="text-[10px] text-[#666666]">Székesfehérvár</p>
          </div>
        </div>

        {/* Content */}
        <div className="relative mx-auto max-w-5xl text-center">
          <div className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-[#d4ff00]/20 bg-[#d4ff00]/6 px-5 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-[#d4ff00] animate-word animate-word-d1">
            <Zap className="h-3 w-3 fill-[#d4ff00]" />
            Magyarország #1 DOOH platform
          </div>

          {/* Headline — animated per word */}
          <h1 className="overflow-hidden font-[family-name:var(--font-barlow-condensed)] text-[clamp(3.2rem,10vw,7rem)] font-black uppercase leading-[0.88] tracking-tight text-white">
            <span className="block overflow-hidden">
              <span className="animate-word animate-word-d2 inline-block">A digitális</span>
            </span>
            <span className="block overflow-hidden">
              <span className="animate-word animate-word-d3 inline-block text-[#d4ff00]" style={{ textShadow: "0 0 80px rgba(212,255,0,0.5)" }}>
                óriásplakát
              </span>
            </span>
            <span className="block overflow-hidden">
              <span className="animate-word animate-word-d4 inline-block">bérlés jövője.</span>
            </span>
          </h1>

          <p className="animate-word animate-word-d5 mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-[#666666] sm:text-xl">
            Felejtsd el a hetekig tartó e-mailezést. Foglalj prémium DOOH felületeket
            <strong className="font-semibold text-[#aaaaaa]"> másodpercek alatt</strong>, és kövesd a megtérülést valós időben.
          </p>

          {/* CTA buttons */}
          <div className="animate-word animate-word-d6 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/foglalas"
              className="cta-shine group relative inline-flex items-center gap-3 overflow-hidden rounded-2xl bg-[#d4ff00] px-9 py-4 font-[family-name:var(--font-barlow-condensed)] text-xl font-black uppercase tracking-wider text-black shadow-[0_0_50px_rgba(212,255,0,0.4),0_0_100px_rgba(212,255,0,0.15)] transition hover:brightness-110 active:scale-[0.98]">
              Foglalás Indítása
              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5" strokeWidth={3} />
            </Link>
            <a href="#how"
              className="inline-flex items-center gap-2.5 rounded-2xl border border-[#1a1a1a] bg-white/[0.04] px-7 py-4 font-[family-name:var(--font-barlow-condensed)] text-lg font-bold uppercase tracking-wider text-[#888888] transition hover:border-[#333333] hover:bg-white/[0.07] hover:text-white">
              Hogyan működik?
            </a>
          </div>

          {/* Trust strip */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-[12px] text-[#444444]">
            {["Nincs bevezetési díj", "Azonnali aktiválás", "Valós idejű adatok", "Ingyenes regisztráció"].map((t) => (
              <span key={t} className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#d4ff00]" strokeWidth={2.5} />
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#555555]">Görgets</span>
          <div className="h-10 w-px bg-gradient-to-b from-[#d4ff00]/50 to-transparent" />
        </div>
      </section>

      {/* ══════════════════ MARQUEE ══════════════════════════════════════ */}
      <div className="relative overflow-hidden border-y border-[#1a1a1a] bg-[#060906] py-4">
        <div className="animate-marquee-lp flex w-max gap-0 whitespace-nowrap">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center">
              {["GYŐR", "BUDAPEST", "SZÉKESFEHÉRVÁR", "KECSKEMÉT", "MOSONMAGYARÓVÁR", "SZOLNOK", "DEBRECEN", "PÉCS", "DOOH", "PRÉMIUM FELÜLETEK", "VALÓS IDEJŰ ROI", "AZONNALI FOGLALÁS", "6ÉKONY HÁLÓZAT"].map((w) => (
                <span key={w} className="flex items-center gap-4 px-6 font-[family-name:var(--font-barlow-condensed)] text-sm font-black uppercase tracking-[0.2em]">
                  <span className="text-[#333333]">{w}</span>
                  <span className="text-[#d4ff00] opacity-40">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════ STATS ════════════════════════════════════════ */}
      <section className="px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard value={80} suffix="+" label="Reklámfelület az országban" delay="sr-d1" />
            <StatCard value={12} suffix="+" label="Aktív város a hálózatban" delay="sr-d2" />
            <StatCard value={96} suffix="%" label="Ügyfél-elégedettségi ráta" delay="sr-d3" />
            <StatCard value={3} suffix=" perc" label="Átlagos foglalási idő" delay="sr-d4" />
          </div>
        </div>
      </section>

      {/* ══════════════════ FEATURES ═════════════════════════════════════ */}
      <section id="features" className="px-5 py-10 sm:px-8">
        <div className="mx-auto max-w-6xl space-y-6">

          {/* Feature 1 — Térképes böngészés */}
          <div className="group relative overflow-hidden rounded-3xl border border-[#1a1a1a] bg-[#060906] p-8 transition hover:border-[#d4ff00]/20 sm:p-12">
            <div aria-hidden className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full opacity-0 transition-opacity duration-700 group-hover:opacity-100"
              style={{ background: "radial-gradient(circle at top right, rgba(212,255,0,0.07) 0%, transparent 70%)" }} />
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div className="sr-left">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d4ff00]/10 text-[#d4ff00]">
                  <Map className="h-6 w-6" strokeWidth={2} />
                </div>
                <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#d4ff00]">01 — Böngészés</p>
                <h2 className="font-[family-name:var(--font-barlow-condensed)] text-[clamp(2rem,4vw,3rem)] font-black uppercase leading-tight text-white">
                  Interaktív térképes<br />tervező
                </h2>
                <p className="mt-4 text-base leading-relaxed text-[#666666]">
                  Az összes elérhető felület egy élő térképen. Szűrj város, típus és napi OTS szerint.
                  Kattints egy jelölőre, és azonnal látod a részleteket, képeket és árat.
                </p>
                <ul className="mt-6 space-y-2.5">
                  {["80+ felület valós idejű elérhetőséggel", "Szűrés városra, típusra, OTS-re", "Egyedi neon zöld jelölők a térképen"].map((t) => (
                    <li key={t} className="flex items-center gap-2.5 text-sm text-[#888888]">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[#d4ff00]" strokeWidth={2.5} />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Map mockup */}
              <div className="sr-right relative overflow-hidden rounded-2xl border border-[#1a1a1a] bg-[#060907]" style={{ aspectRatio: "4/3" }}>
                <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 30% 40%, rgba(212,255,0,0.15) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(56,189,248,0.08) 0%, transparent 40%)" }} />
                {/* Grid lines */}
                <svg className="absolute inset-0 h-full w-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#d4ff00" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
                {/* Fake map markers */}
                {[
                  { x: "28%", y: "38%", label: "GY-OP-04", active: true },
                  { x: "55%", y: "58%", label: "SF-OP-06", active: false },
                  { x: "72%", y: "32%", label: "BP-OP-01", active: false },
                  { x: "42%", y: "70%", label: "KC-OP-01", active: false },
                ].map((m) => (
                  <div key={m.label} className="absolute flex flex-col items-center" style={{ left: m.x, top: m.y }}>
                    <div className={`h-3 w-3 rounded-full border-2 border-black ${m.active ? "bg-[#d4ff00] shadow-[0_0_12px_#d4ff00]" : "bg-[#38bdf8]"}`} />
                    {m.active && (
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-[#d4ff00]/30 bg-[#0c0f0b]/95 px-2 py-1 text-[9px] font-black text-[#d4ff00]">
                        {m.label}
                      </div>
                    )}
                  </div>
                ))}
                {/* Slide panel mockup */}
                <div className="absolute right-3 top-3 bottom-3 w-36 overflow-hidden rounded-xl border border-[#1a1a1a] bg-[#0c0f0b]/95 p-3 text-[9px]">
                  <div className="mb-2 h-14 w-full rounded-lg bg-[#d4ff00]/10" />
                  <span className="font-mono font-black text-[#d4ff00]">GY-OP-04</span>
                  <p className="mt-0.5 font-semibold text-white">ETO Park kampány</p>
                  <p className="text-[#555555]">Győr · P6 LED</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[#888888]">48 000 OTS/nap</span>
                  </div>
                  <div className="mt-3 w-full rounded-lg bg-[#d4ff00] py-1.5 text-center font-black text-black">
                    Foglalás
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2 — ROI analytics */}
          <div className="group relative overflow-hidden rounded-3xl border border-[#1a1a1a] bg-[#060906] p-8 transition hover:border-[#d4ff00]/20 sm:p-12">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              {/* Analytics mockup */}
              <div className="sr-left order-2 lg:order-1 overflow-hidden rounded-2xl border border-[#1a1a1a] bg-[#060907] p-5">
                {/* KPI row */}
                <div className="mb-4 grid grid-cols-3 gap-2">
                  {[["505 120", "Megjelenés"], ["440K Ft", "Elköltve"], ["12", "Kampány"]].map(([v, l]) => (
                    <div key={l} className="rounded-xl border border-[#1a1a1a] bg-[#0c0f0b] p-3 text-center">
                      <p className="font-[family-name:var(--font-barlow-condensed)] text-base font-black text-[#d4ff00]">{v}</p>
                      <p className="text-[9px] text-[#555555]">{l}</p>
                    </div>
                  ))}
                </div>
                {/* Bar chart */}
                <div className="rounded-xl border border-[#1a1a1a] bg-[#0c0f0b] p-4">
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-[#555555]">Heti megjelenések</p>
                  <div className="flex h-28 items-end gap-1.5">
                    {[52, 78, 65, 91, 88, 72, 59].map((h, i) => (
                      <div key={i} className="group/bar relative flex-1 cursor-pointer rounded-t-sm transition-all hover:brightness-125"
                        style={{ height: `${(h / 91) * 100}%`, background: "linear-gradient(to top, #d4ff00, #8aaa00)" }} />
                    ))}
                  </div>
                  <div className="mt-2 flex justify-between text-[9px] text-[#444444]">
                    {["H", "K", "Sze", "Cs", "P", "Szo", "V"].map((d) => <span key={d}>{d}</span>)}
                  </div>
                </div>
              </div>
              <div className="sr-right order-1 lg:order-2">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d4ff00]/10 text-[#d4ff00]">
                  <BarChart2 className="h-6 w-6" strokeWidth={2} />
                </div>
                <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#d4ff00]">02 — Analytics</p>
                <h2 className="font-[family-name:var(--font-barlow-condensed)] text-[clamp(2rem,4vw,3rem)] font-black uppercase leading-tight text-white">
                  Valós idejű<br />ROI követés
                </h2>
                <p className="mt-4 text-base leading-relaxed text-[#666666]">
                  Kövesd a kampányod megtérülését élő adatokkal. Impressziók, OTS, becsült bevétel
                  és ROI kalkulátor — minden egy helyen, valós időben frissülve.
                </p>
                <ul className="mt-6 space-y-2.5">
                  {["Valós idejű OTS és impression adatok", "ROI kalkulátor beépítve", "Kampányonkénti lebontás és összehasonlítás"].map((t) => (
                    <li key={t} className="flex items-center gap-2.5 text-sm text-[#888888]">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[#d4ff00]" strokeWidth={2.5} />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Feature 3 — Fizetés */}
          <div className="group relative overflow-hidden rounded-3xl border border-[#1a1a1a] bg-gradient-to-br from-[#d4ff00]/6 to-transparent p-8 transition hover:border-[#d4ff00]/30 sm:p-12">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div className="sr-left">
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d4ff00]/15 text-[#d4ff00]">
                  <CreditCard className="h-6 w-6" strokeWidth={2} />
                </div>
                <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#d4ff00]">03 — Fizetés</p>
                <h2 className="font-[family-name:var(--font-barlow-condensed)] text-[clamp(2rem,4vw,3rem)] font-black uppercase leading-tight text-white">
                  Azonnali<br />bankkártyás fizetés
                </h2>
                <p className="mt-4 text-base leading-relaxed text-[#666666]">
                  Stripe-alapú, 256-bites SSL titkosítású fizetési kapu. Foglalás után perceken belül
                  megérkezik a visszaigazolás és a számla.
                </p>
                <div className="mt-7 grid grid-cols-2 gap-3">
                  {[
                    { icon: <Shield className="h-5 w-5" strokeWidth={2} />, label: "SSL titkosítás" },
                    { icon: <Zap className="h-5 w-5" strokeWidth={2} />, label: "Azonnali visszaigazolás" },
                    { icon: <CreditCard className="h-5 w-5" strokeWidth={2} />, label: "Minden kártya elfogadva" },
                    { icon: <CheckCircle2 className="h-5 w-5" strokeWidth={2} />, label: "Nincs rejtett díj" },
                  ].map(({ icon, label }) => (
                    <div key={label} className="flex items-center gap-2.5 rounded-xl border border-[#1a1a1a] bg-black/40 px-3.5 py-3 text-sm font-semibold text-[#888888]">
                      <span className="text-[#d4ff00]">{icon}</span>
                      {label}
                    </div>
                  ))}
                </div>
              </div>
              {/* Payment mockup */}
              <div className="sr-right">
                <div className="overflow-hidden rounded-2xl border border-[#d4ff00]/15 bg-[#0c0f0b] p-6 shadow-[0_0_60px_rgba(212,255,0,0.08)]">
                  <p className="mb-4 text-[10px] font-black uppercase tracking-wider text-[#555555]">Összesítő</p>
                  <div className="mb-4 space-y-2 text-sm">
                    {[["Felület", "GY-OP-04 · ETO Park"], ["Időszak", "2026. máj. 1–28."], ["Napszak", "Egész nap"]].map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-[#555555]">{k}</span>
                        <span className="font-medium text-white">{v}</span>
                      </div>
                    ))}
                    <div className="flex justify-between border-t border-[#1a1a1a] pt-2">
                      <span className="font-bold text-white">Fizetendő</span>
                      <span className="font-[family-name:var(--font-barlow-condensed)] text-xl font-black text-[#d4ff00]">248 000 Ft</span>
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    <div className="rounded-xl border border-[#1a1a1a] bg-black px-3.5 py-2.5 text-sm text-[#333333]">4242 4242 4242 4242</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-xl border border-[#1a1a1a] bg-black px-3.5 py-2.5 text-sm text-[#333333]">04 / 28</div>
                      <div className="rounded-xl border border-[#1a1a1a] bg-black px-3.5 py-2.5 text-sm text-[#333333]">···</div>
                    </div>
                  </div>
                  <button type="button" className="mt-4 w-full rounded-xl bg-[#d4ff00] py-3 font-[family-name:var(--font-barlow-condensed)] text-base font-black text-black shadow-[0_0_30px_rgba(212,255,0,0.3)]">
                    Fizetés és foglalás →
                  </button>
                  <p className="mt-3 text-center text-[10px] text-[#333333]">256-bit SSL · Stripe · PCI-DSS</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════ HOW IT WORKS ═════════════════════════════════ */}
      <section id="how" className="border-t border-[#0a0a0a] bg-[#040504] px-5 py-24 sm:px-8 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="sr mb-16 text-center">
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.28em] text-[#d4ff00]">Folyamat</p>
            <h2 className="font-[family-name:var(--font-barlow-condensed)] text-[clamp(2.2rem,5vw,3.8rem)] font-black uppercase leading-tight text-white">
              5 lépés,<br />kint a kampány
            </h2>
          </div>

          <div className="relative">
            {/* Connecting line (desktop) */}
            <div aria-hidden className="absolute left-[calc(10%-2px)] right-[calc(10%-2px)] top-7 hidden h-px bg-gradient-to-r from-transparent via-[#1a1a1a] to-transparent lg:block" />

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
              {[
                { n: "01", icon: <MapPin className="h-6 w-6" strokeWidth={2} />, title: "Felület kiválasztása", desc: "Böngészd a térképet, válaszd ki a helyszínt és idősávot." },
                { n: "02", icon: <BarChart2 className="h-6 w-6" strokeWidth={2} />, title: "OTS ellenőrzés", desc: "Valós idejű napi elérési adatok és statisztikák." },
                { n: "03", icon: <Upload className="h-6 w-6" strokeWidth={2} />, title: "Kreatív feltöltés", desc: "Húzd be a bannert vagy videót — automatikus validáció." },
                { n: "04", icon: <CreditCard className="h-6 w-6" strokeWidth={2} />, title: "Fizetés", desc: "Biztonságos Stripe checkout, azonnali visszaigazolással." },
                { n: "05", icon: <Zap className="h-6 w-6 fill-[#d4ff00] text-black" strokeWidth={2} />, title: "Kampány él!", desc: "A kreatív perceken belül megjelenik a felületen." },
              ].map((step, i) => (
                <div key={step.n} className={`sr sr-d${i + 1} relative`}>
                  <div className={`group rounded-2xl border p-6 text-center transition hover:shadow-[0_0_30px_rgba(212,255,0,0.06)] ${i === 4 ? "border-[#d4ff00]/25 bg-[#d4ff00]/5" : "border-[#1a1a1a] bg-[#0c0f0b]"}`}>
                    <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl transition ${i === 4 ? "bg-[#d4ff00] text-black shadow-[0_0_24px_rgba(212,255,0,0.4)]" : "bg-[#d4ff00]/10 text-[#d4ff00]"}`}>
                      {step.icon}
                    </div>
                    <span className="mb-1.5 block font-mono text-[10px] font-black text-[#333333]">{step.n}</span>
                    <h3 className="font-[family-name:var(--font-barlow-condensed)] text-base font-black text-white">{step.title}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-[#555555]">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ PARTNERS ═════════════════════════════════════ */}
      <section className="border-t border-[#0a0a0a] px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <p className="sr mb-10 text-center text-[10px] font-black uppercase tracking-[0.28em] text-[#333333]">
            Partnereink, akik már velünk hirdetnek
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-14 gap-y-8">
            <div className="sr sr-d1 flex items-center gap-2.5 opacity-50 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#d4ff00]">
                <span className="font-[family-name:var(--font-barlow-condensed)] text-sm font-black text-black">6</span>
              </div>
              <span className="font-[family-name:var(--font-barlow-condensed)] text-xl font-black text-white">6ékony</span>
            </div>
            {["MediaGroup", "UrbanAds HU", "CityVision", "AdPoint"].map((name, i) => (
              <span key={name} className={`sr sr-d${i + 2} font-[family-name:var(--font-barlow-condensed)] text-lg font-black uppercase tracking-wide text-[#222222] transition hover:text-[#444444]`}>
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ FAQ ══════════════════════════════════════════ */}
      <section id="faq" className="border-t border-[#0a0a0a] bg-[#040504] px-5 py-24 sm:px-8 sm:py-32">
        <div className="mx-auto max-w-3xl">
          <div className="sr mb-14 text-center">
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.28em] text-[#d4ff00]">Kérdések</p>
            <h2 className="font-[family-name:var(--font-barlow-condensed)] text-[clamp(2.2rem,5vw,3.5rem)] font-black uppercase leading-tight text-white">
              Gyakori kérdések
            </h2>
          </div>
          <div className="sr space-y-0 divide-y-0">
            {[
              { q: "Mennyibe kerül a foglalás?", a: "Az árak felülettől és időtartamtól függenek. Hetibérek 60 000 Ft-tól indulnak. Amit látsz, azt fizeted — nincsenek rejtett díjak, bevezetési vagy setup fee-k." },
              { q: "Mennyi idő alatt jelenik meg a kreatívom?", a: "Fizetés visszaigazolása után a kreatívet perceken belül feltöltjük a felületre. Digitális (LED) felületek esetén ez szinte azonnali." },
              { q: "Milyen formátumokat fogadtok el?", a: "JPG, PNG és MP4 formátumokat fogadunk el. A rendszer automatikusan validálja a fájlt, és jelzi, ha valami nem stimmel a méretekkel vagy arányokkal." },
              { q: "Lehet-e módosítani a kampányt indítás után?", a: "Igen, az irányítópultból bármikor módosíthatod a kreatívot a futó kampány alatt. Időpont-módosítást kérjük ügyfélszolgálatunkon keresztül jelezd." },
              { q: "Milyen statisztikákat kapok?", a: "Valós idejű OTS (napi elérés), kampányonkénti impresszióbecslés, ROI kalkulátor és heti trendgrafikonok állnak rendelkezésre az irányítópulton." },
              { q: "Szükségem van-e ügynökségre?", a: "Nem. A platform úgy lett tervezve, hogy bárki önállóan tudja kezelni — legyen szó első kampányról vagy tapasztalt hirdetőről. Ha segítségre van szükséged, csapatunk 24/7 elérhető." },
            ].map((item) => <FAQItem key={item.q} {...item} />)}
          </div>
        </div>
      </section>

      {/* ══════════════════ CTA BANNER ═══════════════════════════════════ */}
      <section className="px-5 py-24 sm:px-8 sm:py-32">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-[#d4ff00]/15 bg-[#0c0f0b]">
          {/* Glow */}
          <div aria-hidden className="pointer-events-none absolute inset-0 rounded-3xl"
            style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(212,255,0,0.18) 0%, transparent 55%)" }} />
          {/* Grid */}
          <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "linear-gradient(rgba(212,255,0,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(212,255,0,0.5) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

          <div className="relative px-8 py-16 text-center sm:px-16 sm:py-20">
            <p className="sr mb-4 text-[10px] font-black uppercase tracking-[0.28em] text-[#d4ff00]">Kezdd el ma</p>
            <h2 className="sr sr-d1 font-[family-name:var(--font-barlow-condensed)] text-[clamp(2.5rem,7vw,5rem)] font-black uppercase leading-[0.9] text-white">
              Készen állsz az első<br />
              <span className="text-[#d4ff00]" style={{ textShadow: "0 0 60px rgba(212,255,0,0.4)" }}>kampányodra?</span>
            </h2>
            <p className="sr sr-d2 mx-auto mt-5 max-w-lg text-base text-[#666666]">
              Regisztrálj ingyen, és percek alatt elindíthatod az első kampányodat. Nincs elköteleződés, nincs rejtett díj.
            </p>
            <div className="sr sr-d3 mt-8">
              <Link href="/foglalas"
                className="cta-shine group relative inline-flex items-center gap-3 overflow-hidden rounded-2xl bg-[#d4ff00] px-10 py-5 font-[family-name:var(--font-barlow-condensed)] text-2xl font-black uppercase tracking-wider text-black shadow-[0_0_60px_rgba(212,255,0,0.4),0_0_120px_rgba(212,255,0,0.15)] transition hover:brightness-110 active:scale-[0.98]">
                Foglalás Indítása — Ingyen
                <ArrowRight className="h-6 w-6 transition-transform duration-300 group-hover:translate-x-1.5" strokeWidth={3} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ FOOTER ═══════════════════════════════════════ */}
      <footer className="border-t border-[#0a0a0a] px-5 py-10 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <span className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-black tracking-widest text-white">
                VRS<span className="text-[#d4ff00]">.</span>
              </span>
              <p className="mt-2 max-w-xs text-sm text-[#444444]">
                Magyarország prémium DOOH foglalási platformja.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-x-16 gap-y-3 text-sm sm:grid-cols-3">
              <a href="#features" className="text-[#444444] transition hover:text-white">Funkciók</a>
              <a href="#how" className="text-[#444444] transition hover:text-white">Folyamat</a>
              <a href="#faq" className="text-[#444444] transition hover:text-white">FAQ</a>
              <Link href="/foglalas" className="text-[#444444] transition hover:text-[#d4ff00]">Belépés</Link>
              <a href="mailto:hello@vrsbillboards.hu" className="text-[#444444] transition hover:text-white">Kapcsolat</a>
              <a href="#" className="text-[#444444] transition hover:text-white">Adatvédelem</a>
            </div>
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-[#0a0a0a] pt-6 sm:flex-row">
            <p className="text-[12px] text-[#333333]">© 2026 VRS Billboards Kft. Minden jog fenntartva.</p>
            <p className="text-[11px] text-[#222222]">Fejlesztve Next.js · Supabase · Stripe</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
