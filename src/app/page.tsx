import Link from "next/link";
import {
  BarChart2,
  CreditCard,
  Map,
  Shield,
  ArrowRight,
  CheckCircle2,
  Zap,
  Upload,
  Play,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#000000] text-white antialiased">
      {/* ─── Noise overlay ───────────────────────────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10">
        {/* ═══════════════════════════════════ NAV ═══════════════════ */}
        <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-black/70 backdrop-blur-xl">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 sm:px-8">
            <span className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-black tracking-widest text-white">
              VRS<span className="text-[#d4ff00]">.</span>
            </span>
            <nav className="hidden items-center gap-7 text-sm font-medium text-[#888888] sm:flex">
              <a href="#features" className="transition hover:text-white">Funkciók</a>
              <a href="#how" className="transition hover:text-white">Hogyan működik</a>
              <a href="#partners" className="transition hover:text-white">Partnerek</a>
            </nav>
            <Link
              href="/foglalas"
              className="rounded-xl border border-[#d4ff00]/40 bg-[#d4ff00]/10 px-4 py-2 text-sm font-bold text-[#d4ff00] transition hover:bg-[#d4ff00] hover:text-black"
            >
              Belépés
            </Link>
          </div>
        </header>

        {/* ═══════════════════════════════════ HERO ══════════════════ */}
        <section className="relative overflow-hidden px-5 pb-24 pt-20 sm:px-8 sm:pb-32 sm:pt-28">
          {/* Glow háttér */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/3 rounded-full opacity-[0.12]"
            style={{ background: "radial-gradient(ellipse, #d4ff00 0%, transparent 70%)" }}
          />

          <div className="relative mx-auto max-w-4xl text-center">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#d4ff00]/25 bg-[#d4ff00]/8 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#d4ff00]">
              <Zap className="h-3 w-3 fill-[#d4ff00]" />
              Magyarország #1 DOOH platform
            </div>

            {/* Főcím */}
            <h1 className="font-[family-name:var(--font-barlow-condensed)] text-[clamp(2.8rem,9vw,6rem)] font-black uppercase leading-[0.9] tracking-tight text-white">
              A digitális{" "}
              <span
                className="text-[#d4ff00]"
                style={{ textShadow: "0 0 60px rgba(212,255,0,0.4)" }}
              >
                óriásplakát
              </span>
              <br />
              bérlés jövője.
            </h1>

            {/* Alcím */}
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#888888] sm:text-xl">
              Felejtsd el a hetekig tartó e-mailezést. Foglalj prémium DOOH felületeket
              <strong className="font-semibold text-white"> másodpercek alatt</strong>, és kövesd
              a megtérülést valós időben.
            </p>

            {/* CTA-k */}
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/foglalas"
                className="group relative inline-flex items-center gap-3 overflow-hidden rounded-2xl bg-[#d4ff00] px-8 py-4 font-[family-name:var(--font-barlow-condensed)] text-xl font-black uppercase tracking-wider text-black shadow-[0_0_40px_rgba(212,255,0,0.35)] transition hover:brightness-110 active:scale-[0.98]"
              >
                <span>Foglalás Indítása</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" strokeWidth={3} />
                {/* Shimmer */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(105deg,transparent_40%,rgba(255,255,255,0.3)_50%,transparent_60%)] transition-transform duration-700 group-hover:translate-x-full"
                />
              </Link>
              <a
                href="#how"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/[0.12] bg-white/[0.04] px-7 py-4 font-[family-name:var(--font-barlow-condensed)] text-lg font-bold uppercase tracking-wider text-white transition hover:bg-white/[0.08]"
              >
                <Play className="h-4 w-4 fill-white" />
                Hogyan működik
              </a>
            </div>

            {/* Micro trust signals */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12px] text-[#555555]">
              {["Nincs bevezetési díj", "Azonnali aktiválás", "Valós idejű adatok"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#d4ff00]" strokeWidth={2.5} />
                  {t}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════ PARTNERS ══════════════════ */}
        <section id="partners" className="border-y border-white/[0.06] bg-[#0a0a0a] py-12 px-5 sm:px-8">
          <div className="mx-auto max-w-5xl">
            <p className="mb-8 text-center text-[11px] font-bold uppercase tracking-[0.25em] text-[#444444]">
              Partnereink, akik már velünk hirdetnek
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
              {/* 6ékony logo */}
              <div className="flex items-center gap-2 opacity-50 grayscale transition hover:opacity-100 hover:grayscale-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#d4ff00]">
                  <span className="font-[family-name:var(--font-barlow-condensed)] text-xs font-black text-black">6</span>
                </div>
                <span className="font-[family-name:var(--font-barlow-condensed)] text-lg font-black text-white">
                  6ékony
                </span>
              </div>
              {/* Placeholder partnerek */}
              {["MediaGroup", "UrbanAds", "CityVision", "AdPoint HU"].map((name) => (
                <span
                  key={name}
                  className="font-[family-name:var(--font-barlow-condensed)] text-lg font-black uppercase tracking-wide text-[#333333] transition hover:text-[#555555]"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════ FEATURES (BENTO) ══════════════ */}
        <section id="features" className="px-5 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="mb-14 text-center">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.25em] text-[#d4ff00]">Platform</p>
              <h2 className="font-[family-name:var(--font-barlow-condensed)] text-[clamp(2rem,5vw,3.5rem)] font-black uppercase leading-tight text-white">
                Minden eszköz egy helyen
              </h2>
            </div>

            {/* Bento grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

              {/* Nagy kártya — ROI */}
              <div className="group relative col-span-1 overflow-hidden rounded-3xl border border-[#1a1a1a] bg-[#0c0f0b] p-7 transition hover:border-[#d4ff00]/30 lg:col-span-2">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{ background: "radial-gradient(circle, rgba(212,255,0,0.12) 0%, transparent 70%)" }}
                />
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d4ff00]/10 text-[#d4ff00]">
                  <BarChart2 className="h-6 w-6" strokeWidth={2} />
                </div>
                <h3 className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-black text-white">
                  Valós idejű ROI
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#666666]">
                  Kövesd a kampányod megtérülését élőben. OTS adatok, konverziók,
                  becsült bevétel — egy nézetben.
                </p>
                <div className="mt-6 flex items-end gap-1.5">
                  {[40, 65, 52, 78, 91, 70, 85, 95, 88, 100].map((h, i) => (
                    <div
                      key={i}
                      className="w-full flex-1 rounded-sm bg-[#d4ff00]/25 transition-all duration-300 group-hover:bg-[#d4ff00]/60"
                      style={{ height: `${h * 0.55}px` }}
                    />
                  ))}
                </div>
              </div>

              {/* Térképes tervező */}
              <div className="group relative overflow-hidden rounded-3xl border border-[#1a1a1a] bg-[#0c0f0b] p-7 transition hover:border-[#d4ff00]/30">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{ background: "radial-gradient(circle, rgba(212,255,0,0.1) 0%, transparent 70%)" }}
                />
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d4ff00]/10 text-[#d4ff00]">
                  <Map className="h-6 w-6" strokeWidth={2} />
                </div>
                <h3 className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-black text-white">
                  Térképes tervező
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#666666]">
                  Interaktív térképen válaszd ki a legjobb helyszíneket. Szűrés városra, típusra, OTS-re.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {["Győr", "Budapest", "Székesfehérvár", "+14"].map((c) => (
                    <span key={c} className="rounded-lg border border-[#1a1a1a] bg-black/40 px-2.5 py-1 text-[11px] font-semibold text-[#888888]">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Azonnali fizetés */}
              <div className="group relative overflow-hidden rounded-3xl border border-[#1a1a1a] bg-[#0c0f0b] p-7 transition hover:border-[#d4ff00]/30">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{ background: "radial-gradient(circle, rgba(212,255,0,0.1) 0%, transparent 70%)" }}
                />
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d4ff00]/10 text-[#d4ff00]">
                  <CreditCard className="h-6 w-6" strokeWidth={2} />
                </div>
                <h3 className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-black text-white">
                  Azonnali fizetés
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#666666]">
                  Stripe-alapú biztonságos bankkártyás fizetés. Számla automatikusan kiállítva.
                </p>
                <div className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[#d4ff00]/20 bg-[#d4ff00]/5 px-3 py-1.5 text-xs font-bold text-[#d4ff00]">
                  <Shield className="h-3.5 w-3.5" strokeWidth={2.5} />
                  256-bit SSL titkosítás
                </div>
              </div>

              {/* Nincs rejtett költség — széles kártya */}
              <div className="group relative col-span-1 overflow-hidden rounded-3xl border border-[#1a1a1a] bg-gradient-to-br from-[#d4ff00]/10 to-transparent p-7 transition hover:border-[#d4ff00]/40 sm:col-span-2 lg:col-span-4">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-5">
                    <div className="shrink-0 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#d4ff00]/15 text-[#d4ff00]">
                      <Shield className="h-7 w-7" strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className="font-[family-name:var(--font-barlow-condensed)] text-3xl font-black text-white">
                        Nincs rejtett költség
                      </h3>
                      <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-[#666666]">
                        Amit látsz, azt fizeted. Fix hetibér, azonnali megerősítés,
                        teljes átláthatóság. Bevezetési díj, setup fee vagy meglepetés nélkül.
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/foglalas"
                    className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-[#d4ff00] px-6 py-3 font-[family-name:var(--font-barlow-condensed)] text-base font-black uppercase tracking-wider text-black transition hover:brightness-110"
                  >
                    Árak megtekintése
                    <ArrowRight className="h-4 w-4" strokeWidth={3} />
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ══════════════════════════ HOW IT WORKS ═══════════════════ */}
        <section id="how" className="border-t border-white/[0.06] bg-[#050505] px-5 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto max-w-5xl">
            <div className="mb-16 text-center">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.25em] text-[#d4ff00]">Folyamat</p>
              <h2 className="font-[family-name:var(--font-barlow-condensed)] text-[clamp(2rem,5vw,3.5rem)] font-black uppercase leading-tight text-white">
                3 lépés, és kint a hirdetés
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {[
                {
                  step: "01",
                  icon: <Map className="h-7 w-7" strokeWidth={1.75} />,
                  title: "Válaszd ki a helyet",
                  desc: "Böngészd az interaktív térképen a szabad felületeket. Szűrj város, típus és napi elérés szerint.",
                },
                {
                  step: "02",
                  icon: <Upload className="h-7 w-7" strokeWidth={1.75} />,
                  title: "Töltsd fel a kreatívot",
                  desc: "Húzd be a bannert vagy videót. A rendszer azonnal validálja a formátumot és méretet.",
                },
                {
                  step: "03",
                  icon: <Zap className="h-7 w-7 fill-[#d4ff00] text-black" strokeWidth={1.75} />,
                  title: "Indul a kampány",
                  desc: "Fizetés után a kreatív azonnal kerül a felületre. Valós idejű statisztika az irányítópultról.",
                },
              ].map((item, idx) => (
                <div key={item.step} className="relative">
                  {/* Összekötő vonal */}
                  {idx < 2 && (
                    <div
                      aria-hidden
                      className="absolute right-0 top-[2.75rem] hidden w-1/2 translate-x-full border-t border-dashed border-[#1a1a1a] sm:block"
                    />
                  )}
                  <div className="group rounded-3xl border border-[#1a1a1a] bg-[#0c0f0b] p-7 transition hover:border-[#d4ff00]/25">
                    <div className="mb-5 flex items-center justify-between">
                      <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl transition ${idx === 2 ? "bg-[#d4ff00] text-black" : "bg-[#d4ff00]/10 text-[#d4ff00]"}`}>
                        {item.icon}
                      </div>
                      <span className="font-[family-name:var(--font-barlow-condensed)] text-5xl font-black leading-none text-[#1a1a1a]">
                        {item.step}
                      </span>
                    </div>
                    <h3 className="font-[family-name:var(--font-barlow-condensed)] text-xl font-black text-white">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#666666]">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════ CTA BANNER ═════════════════ */}
        <section className="px-5 py-20 sm:px-8 sm:py-28">
          <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-[#d4ff00]/20 bg-[#0c0f0b] p-10 text-center sm:p-16">
            {/* Glow */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-3xl opacity-30"
              style={{ background: "radial-gradient(ellipse at center top, rgba(212,255,0,0.18) 0%, transparent 60%)" }}
            />
            <div className="relative">
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.25em] text-[#d4ff00]">
                Kezdd el ma
              </p>
              <h2 className="font-[family-name:var(--font-barlow-condensed)] text-[clamp(2.2rem,6vw,4rem)] font-black uppercase leading-tight text-white">
                Készen állsz az első<br />
                <span className="text-[#d4ff00]">kampányodra?</span>
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-base text-[#666666]">
                Regisztrálj ingyen, és az első foglalást percek alatt elindíthatod.
                Nincs elköteleződés, nincs rejtett díj.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/foglalas"
                  className="group relative inline-flex items-center gap-3 overflow-hidden rounded-2xl bg-[#d4ff00] px-8 py-4 font-[family-name:var(--font-barlow-condensed)] text-xl font-black uppercase tracking-wider text-black shadow-[0_0_50px_rgba(212,255,0,0.3)] transition hover:brightness-110 active:scale-[0.98]"
                >
                  Foglalás Indítása — Ingyen
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" strokeWidth={3} />
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(105deg,transparent_40%,rgba(255,255,255,0.3)_50%,transparent_60%)] transition-transform duration-700 group-hover:translate-x-full"
                  />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════ FOOTER ════════════════════ */}
        <footer className="border-t border-white/[0.06] px-5 py-8 sm:px-8">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
            <span className="font-[family-name:var(--font-barlow-condensed)] text-xl font-black tracking-widest text-white">
              VRS<span className="text-[#d4ff00]">.</span>
            </span>
            <p className="text-[12px] text-[#444444]">
              © 2026 VRS Billboards. Minden jog fenntartva.
            </p>
            <div className="flex gap-5 text-[12px] text-[#444444]">
              <a href="#" className="transition hover:text-white">Adatvédelem</a>
              <a href="#" className="transition hover:text-white">ÁSZF</a>
              <Link href="/foglalas" className="transition hover:text-[#d4ff00]">Belépés</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
