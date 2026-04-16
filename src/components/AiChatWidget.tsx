"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { MessageCircle, Send, Sparkles, X } from "lucide-react";

type Variant = "landing" | "app";

type Msg = { role: "user" | "assistant"; content: string };

const WELCOME: Record<Variant, string> = {
  landing:
    "Szia! VRS Billboards asszisztens vagyok. Kérdezz bátran a DOOH foglalásról, árakról vagy a folyamatról — magyarul válaszolok.",
  app:
    "Szia! Itt vagyok, ha elakadtál a foglalásban, a térképpel vagy a fiókkal. Írd le röviden, miben segítsek.",
};

export function AiChatWidget({ variant = "landing" }: { variant?: Variant }) {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([{ role: "assistant", content: WELCOME[variant] }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, open]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setError(null);
    const next: Msg[] = [...msgs, { role: "user", content: text }];
    setMsgs(next);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Hiba történt.");
        setMsgs((m) => [
          ...m,
          {
            role: "assistant",
            content:
              data.reply ??
              "Sajnálom, most nem tudtam válaszolni. Próbáld újra, vagy írj a hello@vrsbillboards.hu címre.",
          },
        ]);
        return;
      }
      setMsgs((m) => [
        ...m,
        {
          role: "assistant",
          content: data.reply ?? "Üres válasz érkezett — próbáld újra.",
        },
      ]);
    } catch {
      setError("Nincs kapcsolat. Ellenőrizd a hálózatot.");
      setMsgs((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "Nem sikerült elérni a szervert. Frissítsd az oldalt, vagy próbáld újra pár perc múlva.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, msgs]);

  const isApp = variant === "app";

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[5300] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label="VRS asszisztens"
          className={`pointer-events-auto flex max-h-[min(520px,70vh)] w-[min(100vw-2.5rem,380px)] flex-col overflow-hidden rounded-2xl border shadow-2xl ${
            isApp
              ? "border-[#1a2218] bg-[#0a0f0b] shadow-[0_0_40px_rgba(212,255,0,0.08)]"
              : "border-[#1c1c1c] bg-[#080808] shadow-[0_0_50px_rgba(212,255,0,0.12)]"
          }`}
        >
          <header
            className={`flex shrink-0 items-center justify-between border-b px-4 py-3 ${
              isApp ? "border-[#141a14] bg-[#0c120d]" : "border-[#141414] bg-[#0a0a0a]"
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#d4ff00]/30 bg-[#d4ff00]/10">
                <Sparkles className="h-4 w-4 text-[#d4ff00]" strokeWidth={2.2} />
              </div>
              <div>
                <p className="font-[family-name:var(--font-barlow-condensed)] text-sm font-black tracking-wide text-white">
                  VRS Asszisztens
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#3a3a3a]">AI · Magyar</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-[#555] transition hover:border-[#222] hover:text-white"
              aria-label="Bezárás"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          </header>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {msgs.map((m, i) => (
              <div
                key={`${i}-${m.role}`}
                className={`max-w-[92%] rounded-xl px-3 py-2 text-[13px] leading-relaxed ${
                  m.role === "user"
                    ? "ml-auto bg-[#d4ff00]/12 text-[#e8e8e8] ring-1 ring-[#d4ff00]/20"
                    : "mr-auto bg-[#111] text-[#bbb] ring-1 ring-[#1a1a1a]"
                }`}
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <p className="text-[11px] font-semibold text-[#d4ff00]/70">Gondolkozom…</p>
            )}
            {error && <p className="text-[11px] text-[#ff6b6b]">{error}</p>}
            <div ref={bottomRef} />
          </div>

          <div className={`shrink-0 border-t p-3 ${isApp ? "border-[#141a14] bg-[#080c09]" : "border-[#141414] bg-[#060606]"}`}>
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
                placeholder="Írd ide a kérdésed…"
                className="min-w-0 flex-1 rounded-xl border border-[#222] bg-[#0d0d0d] px-3 py-2.5 text-sm text-white outline-none ring-[#d4ff00]/0 transition placeholder:text-[#444] focus:border-[#d4ff00]/40 focus:ring-2 focus:ring-[#d4ff00]/15"
                disabled={loading}
                maxLength={2000}
              />
              <button
                type="button"
                onClick={() => void send()}
                disabled={loading || !input.trim()}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#d4ff00] text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Küldés"
              >
                <Send className="h-4 w-4" strokeWidth={2.2} />
              </button>
            </div>
            <p className="mt-2 px-0.5 text-[9px] leading-snug text-[#333]">
              Az AI válaszok tájékoztató jellegűek. OPENAI kulcs beállításakor részletesebb válasz érkezik.
            </p>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#d4ff00]/35 bg-[#0a0a0a] text-[#d4ff00] shadow-[0_0_28px_rgba(212,255,0,0.35)] transition hover:scale-105 hover:shadow-[0_0_40px_rgba(212,255,0,0.45)] active:scale-95"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={open ? "Asszisztens bezárása" : "Asszisztens megnyitása"}
      >
        {open ? <X className="h-6 w-6" strokeWidth={2} /> : <MessageCircle className="h-6 w-6" strokeWidth={2} />}
      </button>
    </div>
  );
}
