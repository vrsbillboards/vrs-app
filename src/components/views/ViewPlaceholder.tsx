import type { LucideIcon } from "lucide-react";

type ViewPlaceholderProps = {
  title: string;
  description: string;
  icon: LucideIcon;
};

/** Közös keret a nézet helyőrzőkhöz (fekete / neon DS). */
export function ViewPlaceholder({ title, description, icon: Icon }: ViewPlaceholderProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pb-5">
      <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-[var(--b1)] bg-[#000000] px-6 py-12 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--b2)] bg-[#0c0f0b] text-[var(--neon)] [box-shadow:0_0_24px_rgba(212,255,0,0.12)]">
          <Icon className="h-8 w-8" strokeWidth={1.75} />
        </div>
        <h2 className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-black tracking-wide text-[var(--text)]">
          {title}
        </h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--t2)]">{description}</p>
        <p className="mt-6 text-[10px] font-bold uppercase tracking-[2px] text-[var(--t3)]">
          Helyőrző nézet · A funkció fejlesztés alatt
        </p>
      </div>
    </div>
  );
}
