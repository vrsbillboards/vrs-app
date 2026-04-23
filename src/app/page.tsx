"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowRight, BarChart2, CheckCircle2, ChevronDown,
  CreditCard, Map, Menu, Shield, Upload, X, Zap,
} from "lucide-react";
import { AiChatWidget } from "@/components/AiChatWidget";
import { AuthModal } from "@/components/AuthModal";
import { supabase } from "@/lib/supabaseClient";

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

/* ─── Spotlight card mouse tracking ─────────────────────────────────────── */
function useSpotlight(ref: React.RefObject<HTMLDivElement | null>) {
  const handleMove = useCallback((e: MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  }, [ref]);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.addEventListener("mousemove", handleMove as EventListener);
    return () => el.removeEventListener("mousemove", handleMove as EventListener);
  }, [ref, handleMove]);
}

/* ─── StatCard ───────────────────────────────────────────────────────────── */
function StatCard({ value, suffix, label, delay, accent = "#d4ff00" }: {
  value: number; suffix: string; label: string; delay: string; accent?: string;
}) {
  const { val, ref } = useCounter(value);
  return (
    <div className={`sr ${delay} spotlight-card grad-border group relative overflow-hidden rounded-3xl border border-[#1c1c1c] bg-[#080a07] p-8 text-center transition-all duration-500 hover:-translate-y-1 hover:border-transparent`}>
      <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${accent}15 0%, transparent 60%)` }} />
      <p
        className="font-[family-name:var(--font-barlow-condensed)] font-black leading-none tabular-nums"
        style={{
          fontSize: "clamp(3rem,7vw,5rem)",
          color: accent,
          textShadow: `0 0 50px ${accent}60, 0 0 100px ${accent}25`,
        }}
      >
        <span ref={ref}>{val.toLocaleString("hu-HU")}</span>{suffix}
      </p>
      <p className="mt-4 text-base font-medium text-[#555]">{label}</p>
    </div>
  );
}

/* ─── FAQ ────────────────────────────────────────────────────────────────── */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#151515]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 py-6 text-left text-xl font-semibold text-white transition hover:text-[#d4ff00]"
      >
        {q}
        <ChevronDown className={`h-5 w-5 shrink-0 text-[#444] transition-transform duration-300 ${open ? "rotate-180 text-[#d4ff00]" : ""}`} strokeWidth={2} />
      </button>
      <div className={`overflow-hidden transition-all duration-400 ${open ? "max-h-96 pb-6" : "max-h-0"}`}>
        <p className="text-base leading-relaxed text-[#666]">{a}</p>
      </div>
    </div>
  );
}

/* ─── App mockup ─────────────────────────────────────────────────────────── */
function AppMockup() {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-[#1e1e1e] shadow-[0_0_100px_rgba(212,255,0,0.10),0_0_200px_rgba(212,255,0,0.04),0_60px_160px_rgba(0,0,0,0.9)]"
      style={{ aspectRatio: "16/9" }}>
      {/* Glow ring */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl border border-[#d4ff00]/10" />
      {/* Browser chrome */}
      <div className="flex h-9 items-center gap-2 border-b border-[#1a1a1a] bg-[#080808] px-4">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <div className="mx-3 flex-1 rounded-md border border-[#1c1c1c] bg-[#0f0f0f] px-3 py-1 text-[11px] text-[#333]">
          vrsbillboards.hu/foglalas
        </div>
        <div className="h-5 w-20 rounded-md bg-[#d4ff00]/80" />
      </div>
      {/* Dashboard */}
      <div className="flex h-[calc(100%-36px)] bg-[#000]">
        {/* Sidebar */}
        <div className="flex w-14 flex-col items-center gap-3 border-r border-[#111] bg-[#060606] py-4">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-[#d4ff00] shadow-[0_0_12px_rgba(212,255,0,0.6)]">
            <span className="font-[family-name:var(--font-barlow-condensed)] text-[10px] font-black text-black">VRS</span>
          </div>
          {[true, false, false, false, false, false].map((active, i) => (
            <div key={i} className={`h-7 w-7 rounded-lg ${active ? "bg-[#d4ff00]/20 ring-1 ring-[#d4ff00]/50 shadow-[0_0_8px_rgba(212,255,0,0.3)]" : "bg-[#111]"}`} />
          ))}
        </div>
        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Topbar */}
          <div className="flex h-9 items-center justify-between border-b border-[#111] bg-[#080808] px-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-24 rounded-md bg-[#1a1a1a]" />
              <div className="h-4 w-16 rounded-md bg-[#111]" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-full bg-[#1a1a1a]" />
              <div className="h-6 w-20 rounded-lg bg-[#d4ff00]/90 shadow-[0_0_8px_rgba(212,255,0,0.5)]" />
            </div>
          </div>
          {/* Map */}
          <div className="relative flex-1 overflow-hidden bg-[#050806]">
            {/* Grid */}
            <svg className="absolute inset-0 h-full w-full opacity-[0.04]">
              <defs>
                <pattern id="g3" width="32" height="32" patternUnits="userSpaceOnUse">
                  <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#d4ff00" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#g3)" />
            </svg>
            {/* Roads */}
            <svg className="absolute inset-0 h-full w-full opacity-15">
              <line x1="0" y1="40%" x2="100%" y2="55%" stroke="#1c2c1c" strokeWidth="5"/>
              <line x1="30%" y1="0" x2="40%" y2="100%" stroke="#1c2c1c" strokeWidth="3"/>
              <line x1="0" y1="70%" x2="100%" y2="65%" stroke="#1c2c1c" strokeWidth="2.5"/>
              <line x1="65%" y1="0" x2="55%" y2="100%" stroke="#1c2c1c" strokeWidth="2"/>
            </svg>
            {/* Glow area */}
            <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse at 30% 40%, rgba(212,255,0,0.06) 0%, transparent 50%)" }} />
            {/* Markers */}
            {[
              { x: "28%", y: "38%", color: "#d4ff00", shadow: "#d4ff00", label: "GY-OP-04", active: true },
              { x: "52%", y: "55%", color: "#00ff87", shadow: "#00ff87", active: false },
              { x: "70%", y: "30%", color: "#38bdf8", shadow: "#38bdf8", active: false },
              { x: "38%", y: "68%", color: "#b8ff57", shadow: "#b8ff57", active: false },
              { x: "80%", y: "62%", color: "#38bdf8", shadow: "#38bdf8", active: false },
            ].map((m, i) => (
              <div key={i} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: m.x, top: m.y }}>
                {m.active && (
                  <div className="absolute -inset-3 animate-ping rounded-full opacity-25" style={{ background: m.color }} />
                )}
                <div className="h-3 w-3 rounded-full border-2 border-black"
                  style={{ background: m.color, boxShadow: `0 0 12px ${m.shadow}` }} />
              </div>
            ))}
            {/* Side panel */}
            <div className="absolute bottom-3 right-3 top-3 w-36 overflow-hidden rounded-xl border border-[#1a1a1a] bg-[#080b07]/95 p-3">
              <div className="mb-2 h-12 w-full overflow-hidden rounded-lg bg-[#d4ff00]/8 ring-1 ring-[#d4ff00]/15" />
              <div className="mb-1 h-2 w-14 rounded bg-[#d4ff00]/50" />
              <div className="mb-1 h-2.5 w-20 rounded bg-[#222]" />
              <div className="mb-0.5 h-2 w-16 rounded bg-[#1a1a1a]" />
              <div className="mb-0.5 h-2 w-12 rounded bg-[#1a1a1a]" />
              <div className="mt-3 h-5 w-full rounded-lg bg-[#d4ff00] shadow-[0_0_10px_rgba(212,255,0,0.5)]" />
            </div>
          </div>
        </div>
      </div>
      {/* Bottom gradient */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/70 to-transparent" />
      {/* Scan line */}
      <div className="pointer-events-none absolute inset-x-0 h-px animate-scan bg-gradient-to-r from-transparent via-[#d4ff00]/30 to-transparent" />
    </div>
  );
}

/* ─── Decorative particle field ──────────────────────────────────────────── */
function ParticleField() {
  const dots = [
    { x: "8%",  y: "20%",  r: 2,   color: "#d4ff00", delay: "0s",   dur: "6s"  },
    { x: "92%", y: "15%",  r: 1.5, color: "#00ff87", delay: "1.2s", dur: "8s"  },
    { x: "15%", y: "75%",  r: 2.5, color: "#7fff57", delay: "0.5s", dur: "7s"  },
    { x: "85%", y: "65%",  r: 1.5, color: "#d4ff00", delay: "2s",   dur: "9s"  },
    { x: "50%", y: "88%",  r: 2,   color: "#00ffaa", delay: "0.8s", dur: "6.5s"},
    { x: "25%", y: "40%",  r: 1,   color: "#b8ff00", delay: "3s",   dur: "10s" },
    { x: "75%", y: "35%",  r: 1.5, color: "#7fff00", delay: "1.8s", dur: "7.5s"},
    { x: "5%",  y: "55%",  r: 1,   color: "#00ff87", delay: "2.5s", dur: "8.5s"},
  ];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((d, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: d.x, top: d.y,
            width: d.r * 2, height: d.r * 2,
            background: d.color,
            boxShadow: `0 0 ${d.r * 8}px ${d.color}`,
            animation: `lp-float ${d.dur} ease-in-out infinite ${d.delay}`,
            opacity: 0.5,
          }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
const ADMIN_EMAIL = "info@vrsbillboards.hu";

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const spotRef1 = useRef<HTMLDivElement>(null);
  const spotRef2 = useRef<HTMLDivElement>(null);
  const spotRef3 = useRef<HTMLDivElement>(null);

  useScrollReveal();
  useSpotlight(spotRef1);
  useSpotlight(spotRef2);
  useSpotlight(spotRef3);

  useEffect(() => {
    document.documentElement.classList.add("lp-scroll");
    return () => document.documentElement.classList.remove("lp-scroll");
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email === ADMIN_EMAIL) window.location.replace("/admin");
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      if (s?.user?.email === ADMIN_EMAIL) window.location.replace("/admin");
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const navLinks = [
    { label: "Funkciók", href: "#features" },
    { label: "Hogyan működik", href: "#how" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <div className="min-h-screen bg-[#020202] font-[family-name:var(--font-barlow)] text-white antialiased">

      {/* ══ NAV ══════════════════════════════════════════════════════════════ */}
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scrolled ? "border-b border-white/[0.06] bg-black/90 backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,0,0,0.6)]" : "bg-transparent"}`}>
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-6 sm:px-10">
          <Link href="/" className="font-[family-name:var(--font-barlow-condensed)] text-3xl font-black tracking-widest text-white">
            VRS<span className="text-[#d4ff00]" style={{ textShadow: "0 0 20px rgba(212,255,0,0.8)" }}>.</span>
          </Link>
          <nav className="hidden items-center gap-10 md:flex">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="text-sm font-semibold uppercase tracking-wider text-[#555] transition hover:text-white">{l.label}</a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setAuthOpen(true)}
              className="hidden rounded-xl border border-[#1e1e1e] px-5 py-2.5 text-sm font-semibold text-[#666] transition hover:border-[#d4ff00]/25 hover:text-white sm:inline-flex">
              Belépés
            </button>
            <Link href="/foglalas"
              className="inline-flex items-center gap-2 rounded-xl bg-[#d4ff00] px-5 py-2.5 text-sm font-black text-black shadow-[0_0_24px_rgba(212,255,0,0.35)] transition hover:brightness-110 hover:shadow-[0_0_40px_rgba(212,255,0,0.5)]">
              Foglalás <ArrowRight className="h-4 w-4" strokeWidth={3} />
            </Link>
            <button type="button" onClick={() => setMobileOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#1a1a1a] text-[#555] md:hidden">
              <Menu className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[200] flex flex-col bg-black/98 backdrop-blur-xl">
          <div className="flex h-[68px] items-center justify-between px-6">
            <span className="font-[family-name:var(--font-barlow-condensed)] text-3xl font-black tracking-widest">VRS<span className="text-[#d4ff00]">.</span></span>
            <button type="button" onClick={() => setMobileOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#1a1a1a] text-[#555]">
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>
          <nav className="flex flex-col gap-1 px-6 pt-6">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
                className="rounded-xl px-4 py-4 text-xl font-semibold text-[#666] transition hover:bg-[#0c0f0b] hover:text-white">{l.label}</a>
            ))}
            <button
              type="button"
              onClick={() => { setMobileOpen(false); setAuthOpen(true); }}
              className="mt-2 rounded-xl border border-[#1e1e1e] px-4 py-4 text-xl font-semibold text-[#555] transition hover:border-[#d4ff00]/25 hover:text-white text-left"
            >
              Belépés
            </button>
            <Link href="/foglalas" onClick={() => setMobileOpen(false)}
              className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-[#d4ff00] py-4 text-xl font-black text-black shadow-[0_0_40px_rgba(212,255,0,0.4)]">
              Foglalás Indítása <ArrowRight className="h-5 w-5" strokeWidth={3} />
            </Link>
          </nav>
        </div>
      )}

      {/* ══ HERO ════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden px-6 pb-24 pt-36 sm:px-10 sm:pt-48 lg:pt-56">
        <ParticleField />

        {/* Multi-color aurora orbs */}
        <div aria-hidden className="animate-aurora pointer-events-none absolute left-1/2 top-[-15%] h-[900px] w-[1200px] -translate-x-[60%] rounded-full"
          style={{ background: "radial-gradient(ellipse, rgba(212,255,0,0.16) 0%, rgba(0,255,135,0.06) 40%, transparent 70%)" }} />
        <div aria-hidden className="animate-aurora-2 pointer-events-none absolute right-[-10%] top-[10%] h-[600px] w-[700px] rounded-full"
          style={{ background: "radial-gradient(ellipse, rgba(0,255,135,0.10) 0%, transparent 65%)" }} />
        <div aria-hidden className="pointer-events-none absolute left-[-8%] top-[30%] h-[400px] w-[500px] rounded-full opacity-30"
          style={{ background: "radial-gradient(ellipse, rgba(127,255,0,0.12) 0%, transparent 65%)", animation: "aurora-shift 14s ease-in-out infinite 4s" }} />

        {/* Diagonal light lines */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.025]">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <line x1="0" y1="0" x2="100%" y2="30%" stroke="#d4ff00" strokeWidth="1"/>
            <line x1="0" y1="100%" x2="80%" y2="0" stroke="#00ff87" strokeWidth="0.5"/>
            <line x1="20%" y1="0" x2="100%" y2="60%" stroke="#7fff57" strokeWidth="0.5"/>
          </svg>
        </div>

        <div className="relative mx-auto max-w-6xl">
          {/* Badge */}
          <div className="animate-word animate-word-d1 mb-10 inline-flex items-center gap-3">
            <div className="relative flex items-center gap-3 rounded-full border border-[#d4ff00]/20 bg-[#d4ff00]/5 px-6 py-2.5 backdrop-blur-sm">
              <div className="relative flex h-2 w-2">
                <span className="animate-badge-ping absolute inline-flex h-full w-full rounded-full bg-[#d4ff00] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#d4ff00]" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-[0.22em] text-[#d4ff00]">
                Magyarország #1 DOOH platform
              </span>
              <Zap className="h-3.5 w-3.5 fill-[#d4ff00] text-[#d4ff00]" />
            </div>
          </div>

          {/* Headline */}
          <h1 className="font-[family-name:var(--font-barlow-condensed)] font-black uppercase leading-[0.85] tracking-tight"
            style={{ fontSize: "clamp(3.8rem, 12vw, 9.5rem)" }}>
            <span className="block overflow-hidden">
              <span className="animate-word animate-word-d2 inline-block text-white"
                style={{ textShadow: "0 4px 40px rgba(0,0,0,0.8)" }}>
                A digitális
              </span>
            </span>
            <span className="block overflow-hidden">
              <span className="animate-word animate-word-d3 gradient-text-animate inline-block"
                style={{ textShadow: "none" }}>
                óriásplakát
              </span>
            </span>
            <span className="block overflow-hidden">
              <span className="animate-word animate-word-d4 inline-block text-white"
                style={{ textShadow: "0 4px 40px rgba(0,0,0,0.8)" }}>
                bérlés jövője.
              </span>
            </span>
          </h1>

          {/* Sub + CTA */}
          <div className="mt-12 flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <p className="animate-word animate-word-d5 text-xl leading-relaxed text-[#666] sm:text-2xl">
                Felejtsd el a hetekig tartó e-mailezést. Foglalj prémium DOOH felületeket
                <span className="font-semibold text-[#aaa]"> másodpercek alatt</span>,
                és kövesd a megtérülést valós időben.
              </p>
              {/* Trust chips */}
              <div className="animate-word animate-word-d6 mt-8 flex flex-wrap gap-2.5">
                {[
                  { text: "Nincs bevezetési díj", color: "#d4ff00" },
                  { text: "Azonnali aktiválás", color: "#00ff87" },
                  { text: "Valós idejű adatok", color: "#7fff57" },
                  { text: "Ingyenes regisztráció", color: "#b8ff00" },
                ].map(({ text, color }) => (
                  <span key={text} className="flex items-center gap-2 rounded-full border border-[#1e1e1e] bg-[#0a0a0a] px-4 py-2 text-sm font-semibold text-[#888] transition hover:border-[#2a2a2a] hover:text-[#ccc]">
                    <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color }} strokeWidth={2.5} />
                    {text}
                  </span>
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div className="animate-word animate-word-d6 flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <Link href="/foglalas"
                className="cta-shine group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-2xl bg-[#d4ff00] px-10 py-5 font-[family-name:var(--font-barlow-condensed)] text-2xl font-black uppercase tracking-wider text-black shadow-[0_0_60px_rgba(212,255,0,0.5),0_0_120px_rgba(212,255,0,0.18)] transition hover:brightness-110 hover:shadow-[0_0_80px_rgba(212,255,0,0.7)] active:scale-[0.98]">
                Foglalás Indítása
                <ArrowRight className="h-6 w-6 transition-transform duration-300 group-hover:translate-x-1.5" strokeWidth={3} />
              </Link>
              <a href="#how"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#1e1e1e] bg-[#080808] px-8 py-5 font-[family-name:var(--font-barlow-condensed)] text-xl font-bold uppercase tracking-wider text-[#777] transition hover:border-[#d4ff00]/20 hover:text-white">
                Hogyan működik?
              </a>
            </div>
          </div>

          {/* App mockup */}
          <div className="animate-word animate-word-d6 mt-16 sm:mt-20">
            <AppMockup />
          </div>
        </div>
      </section>

      {/* ══ MARQUEE ══════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden border-y border-[#0f0f0f] bg-[#040604] py-5">
        {/* Side fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#040604] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#040604] to-transparent" />
        <div className="animate-marquee-lp flex w-max whitespace-nowrap">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center">
              {["GYŐR", "BUDAPEST", "SZÉKESFEHÉRVÁR", "KECSKEMÉT", "MOSONMAGYARÓVÁR", "SZOLNOK", "DEBRECEN", "PÉCS", "DOOH PLATFORM", "VALÓS IDEJŰ ROI", "AZONNALI FOGLALÁS"].map((w, j) => (
                <span key={w} className="flex items-center gap-5 px-6 font-[family-name:var(--font-barlow-condensed)] text-sm font-black uppercase tracking-[0.2em]">
                  <span className="text-[#222]">{w}</span>
                  <span style={{ color: ["#d4ff00", "#00ff87", "#7fff57", "#b8ff00"][j % 4], opacity: 0.4 }}>✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ══ STATS ════════════════════════════════════════════════════════════ */}
      <section className="px-6 py-24 sm:px-10 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="sr mb-12 text-center">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#333]">Számokban</p>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard value={80}  suffix="+"      label="Reklámfelület"         delay="sr-d1" accent="#d4ff00" />
            <StatCard value={12}  suffix="+"      label="Aktív város"            delay="sr-d2" accent="#00ff87" />
            <StatCard value={96}  suffix="%"      label="Elégedett ügyfél"       delay="sr-d3" accent="#7fff57" />
            <StatCard value={3}   suffix=" perc"  label="Átlagos foglalási idő"  delay="sr-d4" accent="#b8ff00" />
          </div>
        </div>
      </section>

      {/* ══ FEATURES ═════════════════════════════════════════════════════════ */}
      <section id="features" className="px-6 pb-10 sm:px-10">
        <div className="mx-auto max-w-6xl space-y-5">

          {/* F1 — Térkép */}
          <div ref={spotRef1} className="spotlight-card grad-border group relative overflow-hidden rounded-3xl border border-[#0f0f0f] bg-[#040604] p-8 transition-all duration-500 hover:border-transparent sm:p-14">
            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
              style={{ background: "radial-gradient(ellipse at top right, rgba(212,255,0,0.05) 0%, transparent 60%)" }} />
            {/* Decorative corner */}
            <div className="pointer-events-none absolute right-8 top-8 opacity-10">
              <div className="animate-spin-slow h-32 w-32 rounded-full border border-[#d4ff00]" />
              <div className="animate-spin-slow-rev absolute inset-4 rounded-full border border-[#00ff87]" />
            </div>
            <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
              <div className="sr-left">
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{ background: "linear-gradient(135deg, rgba(212,255,0,0.15), rgba(0,255,135,0.08))", border: "1px solid rgba(212,255,0,0.2)" }}>
                  <Map className="h-7 w-7 text-[#d4ff00]" strokeWidth={2} />
                </div>
                <p className="mb-3 text-[11px] font-black uppercase tracking-[0.24em]"
                  style={{ color: "#d4ff00", textShadow: "0 0 20px rgba(212,255,0,0.4)" }}>01 — Böngészés</p>
                <h2 className="font-[family-name:var(--font-barlow-condensed)] font-black uppercase leading-tight text-white"
                  style={{ fontSize: "clamp(2.2rem,4.5vw,3.5rem)", textShadow: "0 2px 30px rgba(0,0,0,0.8)" }}>
                  Interaktív térképes<br />tervező
                </h2>
                <p className="mt-5 text-lg leading-relaxed text-[#555]">
                  Az összes elérhető felület egy élő térképen. Szűrj város, típus
                  és napi OTS szerint — percek alatt megtalálod a tökéletes felületet.
                </p>
                <ul className="mt-7 space-y-3.5">
                  {[
                    { t: "80+ felület valós idejű elérhetőséggel", c: "#d4ff00" },
                    { t: "Szűrés városra, típusra, OTS-re", c: "#00ff87" },
                    { t: "Neon jelölők és azonnali részletek", c: "#7fff57" },
                  ].map(({ t, c }) => (
                    <li key={t} className="flex items-center gap-3 text-base text-[#777]">
                      <CheckCircle2 className="h-5 w-5 shrink-0" style={{ color: c }} strokeWidth={2.5} /> {t}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Map visual */}
              <div className="sr-right relative overflow-hidden rounded-2xl border border-[#1a1a1a] bg-[#050806]" style={{ aspectRatio: "4/3" }}>
                <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(circle at 30% 40%, rgba(212,255,0,0.14) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(0,255,135,0.08) 0%, transparent 40%)" }} />
                <svg className="absolute inset-0 h-full w-full opacity-[0.05]">
                  <defs><pattern id="grid2" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="#d4ff00" strokeWidth="0.5"/></pattern></defs>
                  <rect width="100%" height="100%" fill="url(#grid2)" />
                </svg>
                {[
                  { x:"28%", y:"38%", c:"#d4ff00", label:"GY-OP-04", active:true },
                  { x:"55%", y:"58%", c:"#00ff87", active:false },
                  { x:"72%", y:"32%", c:"#38bdf8", active:false },
                  { x:"42%", y:"70%", c:"#7fff57", active:false },
                ].map((m,i) => (
                  <div key={i} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left:m.x, top:m.y }}>
                    {m.active && <div className="absolute -inset-4 animate-ping rounded-full opacity-20" style={{ background: m.c }} />}
                    <div className="h-4 w-4 rounded-full border-2 border-black" style={{ background: m.c, boxShadow: `0 0 16px ${m.c}` }} />
                    {m.active && (
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-[#d4ff00]/30 bg-[#080b07]/95 px-2.5 py-1.5 text-[11px] font-black text-[#d4ff00]">
                        {m.label}
                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rotate-45 border-b border-r border-[#d4ff00]/30 bg-[#080b07]" />
                      </div>
                    )}
                  </div>
                ))}
                <div className="absolute right-3 top-3 bottom-3 w-40 overflow-hidden rounded-xl border border-[#1a1a1a] bg-[#080b07]/95 p-4 text-[10px]">
                  <div className="mb-3 h-14 w-full rounded-lg bg-[#d4ff00]/8 ring-1 ring-[#d4ff00]/15" />
                  <span className="font-mono font-black text-[#d4ff00]">GY-OP-04</span>
                  <p className="mt-1 text-[12px] font-semibold text-white">ETO Park kampány</p>
                  <p className="text-[#444]">Győr · P6 LED</p>
                  <p className="mt-1.5 text-[#666]">48 000 OTS/nap</p>
                  <div className="mt-3 w-full rounded-lg bg-[#d4ff00] py-1.5 text-center text-xs font-black text-black shadow-[0_0_12px_rgba(212,255,0,0.5)]">FOGLALÁS</div>
                </div>
              </div>
            </div>
          </div>

          {/* F2 — Analytics */}
          <div ref={spotRef2} className="spotlight-card grad-border group relative overflow-hidden rounded-3xl border border-[#0f0f0f] bg-[#040604] p-8 transition-all duration-500 hover:border-transparent sm:p-14">
            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
              style={{ background: "radial-gradient(ellipse at top left, rgba(0,255,135,0.05) 0%, transparent 60%)" }} />
            <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
              {/* Chart */}
              <div className="sr-left order-2 lg:order-1 overflow-hidden rounded-2xl border border-[#1a1a1a] bg-[#050806] p-6">
                <div className="mb-5 grid grid-cols-3 gap-3">
                  {[
                    { v:"505 120", l:"Megjelenés",  c:"#d4ff00" },
                    { v:"440K Ft",  l:"Elköltve",    c:"#00ff87" },
                    { v:"12",       l:"Kampány",     c:"#7fff57" },
                  ].map(({ v, l, c }) => (
                    <div key={l} className="rounded-xl border border-[#1a1a1a] bg-[#080b07] p-3.5 text-center">
                      <p className="font-[family-name:var(--font-barlow-condensed)] text-lg font-black" style={{ color: c, textShadow: `0 0 20px ${c}50` }}>{v}</p>
                      <p className="text-[10px] text-[#444]">{l}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl border border-[#1a1a1a] bg-[#080b07] p-5">
                  <p className="mb-4 text-[10px] font-black uppercase tracking-wider text-[#333]">Heti megjelenések</p>
                  <div className="flex h-32 items-end gap-1.5">
                    {[52,78,65,91,88,72,59].map((h,i) => {
                      const colors = ["#d4ff00","#00ff87","#7fff57","#d4ff00","#b8ff00","#7fff57","#00ffaa"];
                      return (
                        <div key={i} className="flex-1 rounded-t transition-all hover:brightness-125"
                          style={{ height:`${(h/91)*100}%`, background:`linear-gradient(to top, ${colors[i]}, ${colors[i]}88)`, boxShadow:`0 0 8px ${colors[i]}40` }} />
                      );
                    })}
                  </div>
                  <div className="mt-3 flex justify-between text-[11px] text-[#333]">
                    {["H","K","Sze","Cs","P","Szo","V"].map((d) => <span key={d}>{d}</span>)}
                  </div>
                </div>
              </div>
              <div className="sr-right order-1 lg:order-2">
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{ background: "linear-gradient(135deg, rgba(0,255,135,0.15), rgba(127,255,87,0.08))", border: "1px solid rgba(0,255,135,0.2)" }}>
                  <BarChart2 className="h-7 w-7 text-[#00ff87]" strokeWidth={2} />
                </div>
                <p className="mb-3 text-[11px] font-black uppercase tracking-[0.24em]"
                  style={{ color: "#00ff87", textShadow: "0 0 20px rgba(0,255,135,0.4)" }}>02 — Analytics</p>
                <h2 className="font-[family-name:var(--font-barlow-condensed)] font-black uppercase leading-tight text-white"
                  style={{ fontSize: "clamp(2.2rem,4.5vw,3.5rem)", textShadow: "0 2px 30px rgba(0,0,0,0.8)" }}>
                  Valós idejű<br />ROI követés
                </h2>
                <p className="mt-5 text-lg leading-relaxed text-[#555]">
                  Impressziók, OTS, becsült bevétel és ROI kalkulátor — minden egy helyen,
                  percenként frissülő adatokkal.
                </p>
                <ul className="mt-7 space-y-3.5">
                  {[
                    { t: "Valós idejű OTS és impression adatok", c: "#d4ff00" },
                    { t: "ROI kalkulátor beépítve", c: "#00ff87" },
                    { t: "Kampányonkénti lebontás", c: "#7fff57" },
                  ].map(({ t, c }) => (
                    <li key={t} className="flex items-center gap-3 text-base text-[#777]">
                      <CheckCircle2 className="h-5 w-5 shrink-0" style={{ color: c }} strokeWidth={2.5} /> {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* F3 — Fizetés */}
          <div ref={spotRef3} className="spotlight-card group relative overflow-hidden rounded-3xl border border-[#d4ff00]/10 bg-[#040604] p-8 transition-all duration-500 hover:border-[#d4ff00]/25 sm:p-14"
            style={{ background: "linear-gradient(135deg, rgba(212,255,0,0.03) 0%, #040604 40%, rgba(0,255,135,0.02) 100%)" }}>
            {/* Top glow */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px"
              style={{ background: "linear-gradient(90deg, transparent, #d4ff00, #00ff87, transparent)", opacity: 0.4 }} />
            <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
              <div className="sr-left">
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{ background: "linear-gradient(135deg, rgba(127,255,0,0.15), rgba(212,255,0,0.08))", border: "1px solid rgba(184,255,0,0.2)" }}>
                  <CreditCard className="h-7 w-7 text-[#b8ff00]" strokeWidth={2} />
                </div>
                <p className="mb-3 text-[11px] font-black uppercase tracking-[0.24em]"
                  style={{ color: "#b8ff00", textShadow: "0 0 20px rgba(184,255,0,0.4)" }}>03 — Fizetés</p>
                <h2 className="font-[family-name:var(--font-barlow-condensed)] font-black uppercase leading-tight text-white"
                  style={{ fontSize: "clamp(2.2rem,4.5vw,3.5rem)", textShadow: "0 2px 30px rgba(0,0,0,0.8)" }}>
                  Azonnali<br />bankkártyás fizetés
                </h2>
                <p className="mt-5 text-lg leading-relaxed text-[#555]">
                  Stripe-alapú, 256-bites SSL titkosítású kapu. Foglalás után perceken belül
                  megérkezik a visszaigazolás és a számla.
                </p>
                <div className="mt-7 grid grid-cols-2 gap-3">
                  {[
                    { icon: <Shield className="h-4.5 w-4.5" strokeWidth={2}/>, text: "SSL titkosítás", c: "#d4ff00" },
                    { icon: <Zap className="h-4.5 w-4.5" strokeWidth={2}/>, text: "Azonnali visszaigazolás", c: "#00ff87" },
                    { icon: <CreditCard className="h-4.5 w-4.5" strokeWidth={2}/>, text: "Minden kártya", c: "#7fff57" },
                    { icon: <CheckCircle2 className="h-4.5 w-4.5" strokeWidth={2}/>, text: "Nincs rejtett díj", c: "#b8ff00" },
                  ].map(({ icon, text, c }) => (
                    <div key={text} className="flex items-center gap-2.5 rounded-xl border border-[#161616] bg-[#080808] px-4 py-3 text-sm font-semibold text-[#777] transition hover:border-[#d4ff00]/15">
                      <span style={{ color: c }}>{icon}</span>{text}
                    </div>
                  ))}
                </div>
              </div>
              {/* Payment card */}
              <div className="sr-right overflow-hidden rounded-2xl border border-[#d4ff00]/12 bg-[#080b07] p-7 shadow-[0_0_80px_rgba(212,255,0,0.06)]">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(212,255,0,0.3), transparent)" }} />
                <p className="mb-5 text-[10px] font-black uppercase tracking-wider text-[#333]">Összesítő</p>
                <div className="mb-5 space-y-3 text-sm">
                  {[
                    ["Felület","GY-OP-04 · ETO Park"],
                    ["Időszak","2026. máj. 1–28."],
                    ["Napszak","Egész nap"],
                  ].map(([k,v]) => (
                    <div key={String(k)} className="flex justify-between">
                      <span className="text-[#444]">{k}</span>
                      <span className="font-semibold text-[#ccc]">{v}</span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t border-[#141414] pt-3">
                    <span className="font-bold text-white">Fizetendő</span>
                    <span className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-black text-[#d4ff00]"
                      style={{ textShadow: "0 0 20px rgba(212,255,0,0.5)" }}>248 000 Ft</span>
                  </div>
                </div>
                <div className="space-y-2.5">
                  <div className="rounded-xl border border-[#1a1a1a] bg-black px-4 py-3 text-sm text-[#2a2a2a]">4242 4242 4242 4242</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-[#1a1a1a] bg-black px-4 py-3 text-sm text-[#2a2a2a]">04 / 28</div>
                    <div className="rounded-xl border border-[#1a1a1a] bg-black px-4 py-3 text-sm text-[#2a2a2a]">···</div>
                  </div>
                </div>
                <button type="button"
                  className="mt-5 w-full rounded-xl bg-[#d4ff00] py-3.5 font-[family-name:var(--font-barlow-condensed)] text-lg font-black text-black shadow-[0_0_40px_rgba(212,255,0,0.35)] transition hover:brightness-110 hover:shadow-[0_0_60px_rgba(212,255,0,0.5)]">
                  Fizetés és foglalás →
                </button>
                <p className="mt-3 text-center text-[11px] text-[#2a2a2a]">256-bit SSL · Stripe · PCI-DSS</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ══ HOW IT WORKS ═════════════════════════════════════════════════════ */}
      <section id="how" className="border-t border-[#080808] bg-[#030403] px-6 py-24 sm:px-10 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="sr mb-16 text-center">
            <p className="mb-4 text-[11px] font-black uppercase tracking-[0.28em]" style={{ color: "#d4ff00", textShadow: "0 0 20px rgba(212,255,0,0.5)" }}>Folyamat</p>
            <h2 className="font-[family-name:var(--font-barlow-condensed)] font-black uppercase leading-tight text-white"
              style={{ fontSize: "clamp(2.5rem,6vw,4.5rem)", textShadow: "0 2px 40px rgba(0,0,0,0.9)" }}>
              5 lépés, kint a kampány
            </h2>
          </div>
          <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {/* Connecting line */}
            <div className="pointer-events-none absolute left-0 right-0 top-[42px] hidden h-px lg:block"
              style={{ background: "linear-gradient(90deg, transparent, #d4ff00, #00ff87, #7fff57, #b8ff00, transparent)", opacity: 0.15 }} />
            {[
              { n:"01", icon:<Map className="h-6 w-6" strokeWidth={2}/>,        title:"Felület kiválasztása",  desc:"Térképen böngészd a szabad felületeket.", c:"#d4ff00", bg:"rgba(212,255,0,0.12)" },
              { n:"02", icon:<BarChart2 className="h-6 w-6" strokeWidth={2}/>,  title:"OTS ellenőrzés",        desc:"Valós idejű napi elérési és demográfiai adatok.", c:"#00ff87", bg:"rgba(0,255,135,0.10)" },
              { n:"03", icon:<Upload className="h-6 w-6" strokeWidth={2}/>,     title:"Kreatív feltöltés",     desc:"Húzd be a bannert — automatikus validáció.", c:"#7fff57", bg:"rgba(127,255,87,0.10)" },
              { n:"04", icon:<CreditCard className="h-6 w-6" strokeWidth={2}/>, title:"Fizetés",               desc:"Biztonságos Stripe checkout, azonnali email.", c:"#b8ff00", bg:"rgba(184,255,0,0.10)" },
              { n:"05", icon:<Zap className="h-6 w-6 fill-current" strokeWidth={2}/>, title:"Kampány él!",    desc:"Perceken belül megjelenik a felületen.", c:"#d4ff00", bg:"rgba(212,255,0,0.15)", featured:true },
            ].map((step, i) => (
              <div key={step.n}
                className={`sr sr-d${i+1} grad-border group relative rounded-2xl border p-6 text-center transition-all duration-500 hover:-translate-y-2 ${step.featured ? "border-[#d4ff00]/20" : "border-[#111]"}`}
                style={{ background: `radial-gradient(ellipse at 50% 0%, ${step.bg} 0%, #060806 100%)` }}>
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                  style={{ background: step.bg, border: `1px solid ${step.c}30`, color: step.c, boxShadow: step.featured ? `0 0 24px ${step.c}40` : "none" }}>
                  {step.icon}
                </div>
                <span className="mb-2 block font-mono text-[11px] font-black" style={{ color: `${step.c}60` }}>{step.n}</span>
                <h3 className="font-[family-name:var(--font-barlow-condensed)] text-xl font-black text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#444]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PARTNERS ═════════════════════════════════════════════════════════ */}
      <section className="border-t border-[#080808] px-6 py-16 sm:px-10">
        <div className="mx-auto max-w-5xl">
          <p className="sr mb-10 text-center text-[11px] font-black uppercase tracking-[0.3em] text-[#222]">Partnereink, akik már velünk hirdetnek</p>
          <div className="flex flex-wrap items-center justify-center gap-x-14 gap-y-8">
            <div className="sr sr-d1 flex items-center gap-3 opacity-35 grayscale transition hover:opacity-100 hover:grayscale-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d4ff00]">
                <span className="font-[family-name:var(--font-barlow-condensed)] text-base font-black text-black">6</span>
              </div>
              <span className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-black text-white">6ékony</span>
            </div>
            {["MediaGroup","UrbanAds HU","CityVision","AdPoint"].map((name,i) => (
              <span key={name} className={`sr sr-d${i+2} font-[family-name:var(--font-barlow-condensed)] text-xl font-black uppercase tracking-wide text-[#1a1a1a] transition hover:text-[#333]`}>{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FAQ ══════════════════════════════════════════════════════════════ */}
      <section id="faq" className="border-t border-[#080808] bg-[#030403] px-6 py-24 sm:px-10 sm:py-32">
        <div className="mx-auto max-w-3xl">
          <div className="sr mb-14 text-center">
            <p className="mb-4 text-[11px] font-black uppercase tracking-[0.28em]" style={{ color: "#d4ff00", textShadow: "0 0 20px rgba(212,255,0,0.5)" }}>Kérdések</p>
            <h2 className="font-[family-name:var(--font-barlow-condensed)] font-black uppercase leading-tight text-white"
              style={{ fontSize: "clamp(2.5rem,6vw,4.5rem)", textShadow: "0 2px 40px rgba(0,0,0,0.9)" }}>
              Gyakori kérdések
            </h2>
          </div>
          <div className="sr">
            {[
              { q:"Mennyibe kerül a foglalás?", a:"Az árak felülettől és időtartamtól függenek. Heti bérek 60 000 Ft-tól indulnak. Amit látsz, azt fizeted — nincsenek rejtett díjak." },
              { q:"Mennyi idő alatt jelenik meg a kreatívom?", a:"Fizetés visszaigazolása után perceken belül feltöltjük a kreatívet. Digitális (LED) felületek esetén ez szinte azonnali." },
              { q:"Milyen formátumokat fogadtok el?", a:"JPG és PNG formátumokat fogadunk el, maximum 5MB méretben. A rendszer automatikusan validálja a fájlt." },
              { q:"Lehet-e módosítani a kampányt indítás után?", a:"Igen, az irányítópultból bármikor módosíthatod a kreatívot. Időpont-módosítást ügyfélszolgálatunkon keresztül jelezz." },
              { q:"Milyen statisztikákat kapok?", a:"Valós idejű OTS, kampányonkénti impresszióbecslés, ROI kalkulátor és heti trendgrafikonok — az irányítópulton élőben." },
              { q:"Szükségem van-e ügynökségre?", a:"Nem. A platform önállóan kezelhető. Ha segítségre van szükséged, csapatunk 24/7 elérhető." },
            ].map((item) => <FAQItem key={item.q} {...item} />)}
          </div>
        </div>
      </section>

      {/* ══ CTA BANNER ═══════════════════════════════════════════════════════ */}
      <section className="px-6 py-24 sm:px-10 sm:py-32">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-[#d4ff00]/12 bg-[#060806]">
          {/* Aurora */}
          <div className="pointer-events-none absolute inset-0">
            <div className="animate-aurora absolute left-1/4 top-[-50%] h-[600px] w-[600px] rounded-full"
              style={{ background: "radial-gradient(ellipse, rgba(212,255,0,0.20) 0%, transparent 65%)" }} />
            <div className="animate-aurora-2 absolute right-1/4 bottom-[-30%] h-[400px] w-[500px] rounded-full"
              style={{ background: "radial-gradient(ellipse, rgba(0,255,135,0.14) 0%, transparent 65%)" }} />
          </div>
          {/* Grid */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "linear-gradient(rgba(212,255,0,1) 1px,transparent 1px),linear-gradient(90deg,rgba(212,255,0,1) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
          {/* Top line */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{ background: "linear-gradient(90deg, transparent, #d4ff00, #00ff87, #d4ff00, transparent)" }} />

          <div className="relative px-8 py-20 text-center sm:px-16 sm:py-28">
            <p className="sr mb-6 text-[11px] font-black uppercase tracking-[0.3em]" style={{ color: "#d4ff00", textShadow: "0 0 20px rgba(212,255,0,0.6)" }}>
              Kezdd el ma
            </p>
            <h2 className="sr sr-d1 font-[family-name:var(--font-barlow-condensed)] font-black uppercase leading-[0.9] text-white"
              style={{ fontSize: "clamp(3rem,8vw,6.5rem)", textShadow: "0 4px 60px rgba(0,0,0,0.9)" }}>
              Készen állsz az első<br />
              <span className="gradient-text-animate">kampányodra?</span>
            </h2>
            <p className="sr sr-d2 mx-auto mt-8 max-w-lg text-lg text-[#555]">
              Regisztrálj ingyen, és percek alatt elindíthatod az első kampányodat. Nincs elköteleződés, nincs rejtett díj.
            </p>
            <div className="sr sr-d3 mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/foglalas"
                className="cta-shine group relative inline-flex items-center gap-3 overflow-hidden rounded-2xl bg-[#d4ff00] px-12 py-6 font-[family-name:var(--font-barlow-condensed)] text-2xl font-black uppercase tracking-wider text-black shadow-[0_0_80px_rgba(212,255,0,0.5),0_0_160px_rgba(212,255,0,0.2)] transition hover:brightness-110 hover:shadow-[0_0_100px_rgba(212,255,0,0.7)] active:scale-[0.98]">
                Foglalás Indítása — Ingyen
                <ArrowRight className="h-7 w-7 transition-transform duration-300 group-hover:translate-x-1.5" strokeWidth={3} />
              </Link>
              <button type="button" onClick={() => setAuthOpen(true)}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#1e1e1e] px-8 py-6 font-[family-name:var(--font-barlow-condensed)] text-xl font-bold uppercase tracking-wider text-[#666] transition hover:border-[#d4ff00]/25 hover:text-white">
                Belépés
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ═══════════════════════════════════════════════════════════ */}
      <footer className="border-t border-[#080808] px-6 py-14 sm:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <span className="font-[family-name:var(--font-barlow-condensed)] text-4xl font-black tracking-widest text-white">
                VRS<span className="text-[#d4ff00]" style={{ textShadow: "0 0 20px rgba(212,255,0,0.6)" }}>.</span>
              </span>
              <p className="mt-3 max-w-xs text-sm text-[#333]">Magyarország prémium DOOH foglalási platformja.</p>
              <div className="mt-4 flex gap-2">
                {["#d4ff00","#00ff87","#7fff57","#b8ff00"].map((c) => (
                  <div key={c} className="h-1.5 w-6 rounded-full" style={{ background: c, opacity: 0.4 }} />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-16 gap-y-4 text-sm sm:grid-cols-3">
              <a href="#features" className="text-[#333] transition hover:text-white">Funkciók</a>
              <a href="#how"      className="text-[#333] transition hover:text-white">Folyamat</a>
              <a href="#faq"      className="text-[#333] transition hover:text-white">FAQ</a>
              <button type="button" onClick={() => setAuthOpen(true)} className="text-left text-[#333] transition hover:text-[#d4ff00]">Belépés</button>
              <a href="mailto:info@vrsbillboards.hu" className="text-[#333] transition hover:text-white">Kapcsolat</a>
              <a href="#" className="text-[#333] transition hover:text-white">Adatvédelem</a>
            </div>
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-[#080808] pt-8 sm:flex-row">
            <p className="text-xs text-[#252525]">© 2026 VRS Billboards Kft. Minden jog fenntartva.</p>
            <p className="text-[11px] text-[#1a1a1a]">Next.js · Supabase · Stripe</p>
          </div>
        </div>
      </footer>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      <AiChatWidget variant="landing" />
    </div>
  );
}
