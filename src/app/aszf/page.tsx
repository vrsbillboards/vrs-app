import Link from "next/link";
import type { Metadata } from "next";
import { ScrollUnlock } from "@/components/ScrollUnlock";

export const metadata: Metadata = {
  title: "Általános Szerződési Feltételek",
  description:
    "VRS Billboards (6ékony Reklám Kft.) általános szerződési feltételei a digitális óriásplakát-bérlési szolgáltatás használatához.",
};

export default function ASZFPage() {
  return (
    <div className="min-h-screen w-full bg-[#020202] text-white">
      <ScrollUnlock />

      {/* Top nav */}
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
          Jogi tájékoztató
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-barlow-condensed)] text-3xl font-black tracking-wide text-white sm:text-5xl">
          Általános Szerződési Feltételek
        </h1>
        <p className="mt-4 text-sm text-[#666]">
          Hatályos: 2026. január 1-jétől. Utolsó módosítás: 2026. január 1.
        </p>

        <div className="mt-8 rounded-2xl border border-[#fbbf24]/25 bg-[#fbbf24]/5 px-5 py-4 text-sm text-[#fbbf24]">
          <strong className="font-bold">Előzetes változat.</strong> Az alábbi
          szöveg minta jelleggel készült. A végleges, ügyvéd által ellenőrzött
          változat publikálása folyamatban van. Foglalási kérdés esetén keress
          minket a {" "}
          <a
            href="mailto:info@vrsbillboards.hu"
            className="underline hover:brightness-125"
          >
            info@vrsbillboards.hu
          </a>{" "}
          címen.
        </div>

        <div className="prose-vrs mt-10 space-y-8 text-[15px] leading-relaxed text-[#bbb]">
          <Section title="1. A Szolgáltató adatai">
            <p>
              <strong className="text-white">Cégnév:</strong> 6ékony Reklám Kft.
              <br />
              <strong className="text-white">Szolgáltatás:</strong> VRS Billboards
              digitális óriásplakát-bérlési platform
              <br />
              <strong className="text-white">E-mail:</strong>{" "}
              <a
                className="text-[#d4ff00] hover:underline"
                href="mailto:info@vrsbillboards.hu"
              >
                info@vrsbillboards.hu
              </a>
              <br />
              <strong className="text-white">Honlap:</strong>{" "}
              <a
                className="text-[#d4ff00] hover:underline"
                href="https://www.vrsbillboards.hu"
              >
                www.vrsbillboards.hu
              </a>
            </p>
          </Section>

          <Section title="2. A szolgáltatás tárgya">
            <p>
              A VRS Billboards platformon a Megrendelő (a továbbiakban: „Ügyfél”)
              digitális óriásplakát-felületeket (DOOH) bérelhet előre meghatározott
              időtartamra, a saját maga által feltöltött kreatív megjelenítésére.
            </p>
            <p>
              A foglalás akkor minősül létrejöttnek, ha az Ügyfél a megrendelést
              véglegesítette és a fizetés a Stripe fizetési szolgáltatón keresztül
              sikeresen megtörtént.
            </p>
          </Section>

          <Section title="3. Foglalás és fizetés">
            <ul className="list-disc space-y-2 pl-5">
              <li>Az árak forintban (HUF), ÁFA nélkül értendők.</li>
              <li>
                A fizetés bankkártyával történik a Stripe titkosított
                fizetőoldalán. A Szolgáltató bankkártya-adatot nem tárol.
              </li>
              <li>
                A foglalás visszaigazolása e-mailben érkezik. A kreatív
                jóváhagyása után indul el a tényleges kampány.
              </li>
              <li>
                A foglalás státusza az Ügyfél a {" "}
                <Link href="/profil" className="text-[#d4ff00] hover:underline">
                  Profil
                </Link>{" "}
                oldalon és a Foglalásaim nézetben követhető.
              </li>
            </ul>
          </Section>

          <Section title="4. Kreatív követelmények">
            <ul className="list-disc space-y-2 pl-5">
              <li>Elfogadott formátumok: JPG, PNG.</li>
              <li>Maximális fájlméret: 5 MB.</li>
              <li>
                A kreatív tartalmáért a felelősség az Ügyfelet terheli. A
                Szolgáltató fenntartja a jogot a kreatív elutasítására, ha az:
                jogszabályba, jó erkölcsbe ütközik, vagy harmadik fél jogait
                sérti.
              </li>
              <li>
                Elutasítás esetén az Ügyfél új kreatívot tölthet fel; a fizetett
                összeg a kampány teljesítéséig nem visszatérítendő, kivéve a
                7. pontban foglalt eseteket.
              </li>
            </ul>
          </Section>

          <Section title="5. A kampány indítása és teljesítése">
            <p>
              Az adminisztrációs jóváhagyás munkanapokon, általában 24–48 órán
              belül megtörténik. A kampány a foglalt időszak első napján indul,
              és az utolsó napon ér véget.
            </p>
          </Section>

          <Section title="6. Felelősség, garancia">
            <p>
              A Szolgáltató mindent megtesz a platform és a reklámfelületek
              folyamatos elérhetőségéért. Vis maior (pl. áramkimaradás, természeti
              csapás) vagy harmadik fél hibája miatti üzemszünet esetén a kiesett
              időre arányos jóváírás jár a következő foglaláshoz.
            </p>
          </Section>

          <Section title="7. Elállás, lemondás">
            <p>
              Üzleti felhasználók (jogi személyek) esetében a fogyasztói elállási
              jog nem alkalmazandó. A kampány indulása előtt legalább 7 nappal
              jelzett lemondás esetén a fizetett díj 80%-a visszatéríthető. Ennél
              későbbi lemondás esetén visszatérítés nincs.
            </p>
          </Section>

          <Section title="8. Számlázás">
            <p>
              A Szolgáltató a fizetést követően elektronikus számlát állít ki,
              amelyet a megadott e-mail-címre küld. A számla a Profil nézetben
              is elérhető.
            </p>
          </Section>

          <Section title="9. Záró rendelkezések">
            <p>
              A jelen ÁSZF-re és az ennek alapján létrejövő szerződésekre a magyar
              jog szabályait kell alkalmazni. Vitás kérdésekben elsősorban a felek
              megegyezésre törekednek; ennek hiányában a hatáskörrel és
              illetékességgel rendelkező magyar bíróság jár el.
            </p>
          </Section>
        </div>

        <div className="mt-14 flex items-center justify-between border-t border-[#111] pt-6 text-xs text-[#444]">
          <p>© 2026 6ékony Reklám Kft.</p>
          <Link href="/adatvedelem" className="hover:text-[#d4ff00]">
            Adatvédelmi Tájékoztató →
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
