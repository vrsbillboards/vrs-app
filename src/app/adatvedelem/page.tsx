import Link from "next/link";
import type { Metadata } from "next";
import { ScrollUnlock } from "@/components/ScrollUnlock";

export const metadata: Metadata = {
  title: "Adatvédelmi Tájékoztató",
  description:
    "VRS Billboards (6ékony Reklám Kft.) adatkezelési tájékoztatója — GDPR-megfelelő adatvédelmi nyilatkozat.",
};

export default function AdatvedelemPage() {
  return (
    <div className="min-h-screen w-full bg-[#020202] text-white">
      <ScrollUnlock />

      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-[#0f0f0f] bg-[#020202]/90 px-5 backdrop-blur-md sm:px-8">
        <Link
          href="/"
          className="font-[family-name:var(--font-barlow-condensed)] text-lg font-black tracking-widest text-white"
        >
          VRS <span className="text-[#d4ff00]">BILLBOARDS</span>
        </Link>
        <Link
          href="/"
          className="text-[11px] font-bold uppercase tracking-wide text-[#666] transition hover:text-white"
        >
          ← Vissza a főoldalra
        </Link>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#444]">
          Adatvédelem
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-barlow-condensed)] text-3xl font-black tracking-wide text-white sm:text-5xl">
          Adatvédelmi Tájékoztató
        </h1>
        <p className="mt-4 text-sm text-[#666]">
          Hatályos: 2026. január 1-jétől. GDPR (EU 2016/679) szerint.
        </p>

        <div className="mt-8 rounded-2xl border border-[#fbbf24]/25 bg-[#fbbf24]/5 px-5 py-4 text-sm text-[#fbbf24]">
          <strong className="font-bold">Előzetes változat.</strong> Az alábbi
          szöveg minta jelleggel készült, a végleges, adatvédelmi szakértő által
          ellenőrzött változat publikálása folyamatban van.
        </div>

        <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-[#bbb]">
          <Section title="1. Adatkezelő">
            <p>
              <strong className="text-white">Cégnév:</strong> 6ékony Reklám Kft.
              <br />
              <strong className="text-white">Kapcsolattartás:</strong>{" "}
              <a
                className="text-[#d4ff00] hover:underline"
                href="mailto:info@vrsbillboards.hu"
              >
                info@vrsbillboards.hu
              </a>
            </p>
          </Section>

          <Section title="2. Kezelt adatok köre">
            <p>A platform használata során az alábbi személyes adatokat kezeljük:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>E-mail cím (regisztráció és kapcsolattartás)</li>
              <li>Bejelentkezési hitelesítő adatok (titkosított jelszó vagy OAuth azonosító)</li>
              <li>Kampányhoz kapcsolódó adatok: cégnév, kampány neve, foglalási adatok</li>
              <li>Feltöltött kreatív (kép)</li>
              <li>Fizetési tranzakció azonosítója (Stripe — kártyaadatot nem tárolunk)</li>
            </ul>
          </Section>

          <Section title="3. Az adatkezelés célja és jogalapja">
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong className="text-white">Szerződés teljesítése</strong>:
                foglalás, számlázás, ügyfélszolgálat — GDPR 6. cikk (1) b).
              </li>
              <li>
                <strong className="text-white">Jogi kötelezettség</strong>:
                számlázás, könyvelés — GDPR 6. cikk (1) c).
              </li>
              <li>
                <strong className="text-white">Jogos érdek</strong>: csalás
                megelőzése, kreatív moderáció — GDPR 6. cikk (1) f).
              </li>
            </ul>
          </Section>

          <Section title="4. Adatfeldolgozók">
            <p>A szolgáltatás működtetéséhez az alábbi külső szolgáltatókat vesszük igénybe:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong className="text-white">Supabase, Inc.</strong> — adatbázis,
                hitelesítés, fájltárolás (EU régió)
              </li>
              <li>
                <strong className="text-white">Stripe, Inc.</strong> — bankkártyás
                fizetés
              </li>
              <li>
                <strong className="text-white">Vercel, Inc.</strong> —
                alkalmazás-üzemeltetés
              </li>
              <li>
                <strong className="text-white">Resend / SMTP partner</strong> —
                tranzakciós e-mail kiküldés
              </li>
            </ul>
          </Section>

          <Section title="5. Adatmegőrzés">
            <p>
              A foglaláshoz kapcsolódó adatokat a szerződés teljesítését és a
              számviteli kötelezettségben előírt határidőt (8 év) követően
              töröljük. A felhasználói fiókot a regisztráció törlésével
              megszüntetjük; a számviteli adatokat a jogszabályi határidőig
              megőrizzük.
            </p>
          </Section>

          <Section title="6. Az érintett jogai">
            <p>Bármikor kérheted:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Az adataidhoz való hozzáférést</li>
              <li>Az adataid helyesbítését</li>
              <li>Az adataid törlését („elfeledtetéshez való jog”)</li>
              <li>Az adatkezelés korlátozását</li>
              <li>Az adathordozhatóságot</li>
              <li>A hozzájárulásod visszavonását (ahol releváns)</li>
            </ul>
            <p>
              Kérelmedet az{" "}
              <a
                className="text-[#d4ff00] hover:underline"
                href="mailto:info@vrsbillboards.hu"
              >
                info@vrsbillboards.hu
              </a>{" "}
              címre küldd. Panasszal a Nemzeti Adatvédelmi és Információszabadság
              Hatósághoz (NAIH) is fordulhatsz.
            </p>
          </Section>

          <Section title="7. Sütik (cookie-k)">
            <p>
              A platform a működéshez szükséges (kötelező) sütiket használja,
              például a bejelentkezett állapot fenntartására. Marketing-célú
              sütiket csak az Ügyfél kifejezett hozzájárulása esetén
              alkalmazunk.
            </p>
          </Section>
        </div>

        <div className="mt-14 flex items-center justify-between border-t border-[#111] pt-6 text-xs text-[#444]">
          <p>© 2026 6ékony Reklám Kft.</p>
          <Link href="/aszf" className="hover:text-[#d4ff00]">
            Általános Szerződési Feltételek →
          </Link>
        </div>
      </main>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-[family-name:var(--font-barlow-condensed)] text-xl font-black uppercase tracking-wide text-white sm:text-2xl">
        {title}
      </h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}
