import { NextResponse } from "next/server";

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

const SYSTEM_PROMPT = `Te a „VRS Billboards” digitális óriásplakát (DOOH) foglalási platform magyar nyelvű asszisztensed vagy.
Stílus: segítőkész, tömör, professzionális B2B hangnem.
Tudj ezekről: a felhasználók a térképen választanak felületet, feltöltenek kreatívot, bankkártyával fizetnek (Stripe), a foglalások jóváhagyásra kerülhetnek.
Ha konkrét árat vagy jogi tanácsot kérnek, javasold a hello@vrsbillboards.hu kapcsolatot vagy a foglalási felületen látható díjakat.
Ne találj ki olyan funkciót, ami biztosan nincs az appban (pl. ne ígérj API-t, hacsak nem kérdezik elméletben).`;

function fallbackReply(lastUser: string): string {
  const t = lastUser.toLowerCase();
  if (/ár|díj|költség|mennyi|ft|eur|fizet/.test(t)) {
    return "Az aktuális heti/havi díjakat a foglalási felületen, a kiválasztott plakát kártyáján látod — a végösszeg a kampány időtartamától függ. Egyedi ajánlatért írj a hello@vrsbillboards.hu címre.";
  }
  if (/foglal|kampány|kreatív|upload|feltölt/.test(t)) {
    return "A foglalás lépései: 1) válassz felületet a térképen, 2) add meg a kampány időszakát, 3) töltsd fel a kreatívot (JPG/PNG, max. 5 MB), 4) fizess bankkártyával. A jóváhagyás után indul a megjelenés — erről e-mailt küldünk.";
  }
  if (/belép|regisztr|login|fiók|google|apple/.test(t)) {
    return "A Belépés gombbal megnyílik a bejelentkezés: e-mail/jelszó, illetve ha be van kapcsolva a projektben, Google vagy Apple fiókkal is be lehet lépni.";
  }
  if (/partner|ügynökség|tulaj/.test(t)) {
    return "A B2B partnereknek külön partner portál készülhet; általános együttműködésről a hello@vrsbillboards.hu címen tudunk tájékoztatni.";
  }
  if (/kapcsolat|email|írj|support|help/.test(t)) {
    return "Ügyfélszolgálat: hello@vrsbillboards.hu — itt válaszolunk kampány-, számlázás- és technikai kérdésekre is.";
  }
  return "Köszönöm a kérdést! A VRS Billboards platformmal digitális óriásplakát kampányt tudsz foglalni percek alatt. Konkrét lépéshez menj a „Foglalás indítása” / foglalási felület menüpontra, vagy írj részleteket (pl. város, időtartam), és segítek célzottan.";
}

async function openaiComplete(messages: ChatMessage[]): Promise<string | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key?.trim()) return null;

  const model = process.env.OPENAI_CHAT_MODEL?.trim() || "gpt-4o-mini";

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      max_tokens: 900,
      temperature: 0.65,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    console.error("[api/chat] OpenAI error:", res.status, errText.slice(0, 500));
    return null;
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = data.choices?.[0]?.message?.content?.trim();
  return text || null;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { messages?: ChatMessage[] };
    const raw = Array.isArray(body.messages) ? body.messages : [];
    const messages = raw
      .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content.slice(0, 8000) }))
      .slice(-20);

    if (messages.length === 0 || messages[messages.length - 1]?.role !== "user") {
      return NextResponse.json({ error: "Hiányzó üzenet." }, { status: 400 });
    }

    const ai = await openaiComplete(messages);
    const reply =
      ai ??
      fallbackReply(messages.filter((m) => m.role === "user").pop()?.content ?? "");

    return NextResponse.json({
      reply,
      source: ai ? "openai" : "fallback",
    });
  } catch (e) {
    console.error("[api/chat]", e);
    return NextResponse.json(
      { error: "Szerverhiba. Próbáld újra néhány perc múlva.", reply: fallbackReply("") },
      { status: 500 }
    );
  }
}
