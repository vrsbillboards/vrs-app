"use client";

import type { Billboard } from "@/lib/billboards";

type BrowseViewProps = {
  billboards: Billboard[];
  onBook: (id: string) => void;
};

export function BrowseView({ billboards, onBook }: BrowseViewProps) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
      <div className="grid grid-cols-3 gap-3 max-[1100px]:grid-cols-2 max-md:grid-cols-1">
        {billboards.map((bb) => {
          const free = bb.status === "free";
          return (
            <article
              key={bb.id}
              className="group relative cursor-pointer overflow-hidden rounded-[11px] border border-[var(--b1)] bg-[var(--card)] transition-all hover:-translate-y-0.5 hover:border-[var(--b2)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.4)]"
            >
              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 [background:radial-gradient(ellipse_at_50%_50%,rgba(212,255,0,.06),transparent_65%)] group-hover:opacity-100" />
              <div className="relative h-[130px] overflow-hidden bg-[var(--bg3)]">
                <div className="flex h-full w-full items-center justify-center font-[family-name:var(--font-barlow-condensed)] text-xs font-black tracking-[2px] text-[var(--neon)] [text-shadow:0_0_14px_rgba(212,255,0,0.5)]">
                  KÉP HELYE
                </div>
                <span
                  className={`absolute right-2 top-2 rounded-[10px] px-2 py-0.5 text-[9px] font-bold tracking-wide ${
                    free
                      ? "border border-[rgba(212,255,0,0.35)] bg-[rgba(212,255,0,0.12)] text-[var(--neon)]"
                      : "border border-[rgba(255,90,58,0.3)] bg-[rgba(255,90,58,0.1)] text-[#ff7a60]"
                  }`}
                >
                  {free ? "Elérhető" : "Foglalt"}
                </span>
              </div>
              <div className="relative px-3 py-2.5">
                <div className="mb-0.5 text-[10px] font-bold tracking-wide text-[var(--nd)]">{bb.id}</div>
                <div className="mb-0.5 font-[family-name:var(--font-barlow-condensed)] text-base font-extrabold leading-tight text-[var(--text)]">
                  {bb.name}
                </div>
                <div className="mb-2 flex items-center gap-0.5 text-[10px] text-[var(--t2)]">
                  {bb.city} · {bb.type}
                </div>
                <div className="mb-2 flex flex-wrap gap-1">
                  <span className="rounded border border-[var(--b1)] bg-[var(--bg3)] px-1.5 py-0.5 text-[10px] text-[var(--t2)]">
                    Napi {bb.ots} OTS
                  </span>
                  <span className="rounded border border-[var(--b1)] bg-[var(--bg3)] px-1.5 py-0.5 text-[10px] text-[var(--t2)]">
                    Digitális
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-[var(--b1)] pt-2">
                  <div className="font-[family-name:var(--font-barlow-condensed)] text-[17px] font-black text-[var(--neon)]">
                    {bb.price.toLocaleString("hu-HU")}{" "}
                    <span className="text-[10px] font-normal text-[var(--t2)]">Ft / hét</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onBook(bb.id)}
                    disabled={!free}
                    className="rounded-md border-none bg-[var(--neon)] px-2.5 py-1 text-[10px] font-bold text-[#070908] transition-shadow hover:shadow-[0_4px_12px_rgba(212,255,0,0.25)] disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    Foglalás
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
