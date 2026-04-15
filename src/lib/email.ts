import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "VRS Billboards <hello@vrsbillboards.hu>";
const BRAND = "#d4ff00";
const BG_DARK = "#0a0a0a";
const BG_CARD = "#111111";
const TEXT_PRIMARY = "#ffffff";
const TEXT_MUTED = "#888888";

export type EmailStatus = "approved" | "rejected";

export interface StatusEmailDetails {
  bookingId?: string;
  billboardName?: string;
  startDate?: string;
  endDate?: string;
  amount?: number;
}

/* ─── HTML template ──────────────────────────────────────────────────────── */
function buildHtml(status: EmailStatus, details: StatusEmailDetails): string {
  const isApproved = status === "approved";

  const accentColor = isApproved ? BRAND : "#ff5a3a";
  const accentBg = isApproved ? "rgba(212,255,0,0.08)" : "rgba(255,90,58,0.08)";
  const accentBorder = isApproved ? "rgba(212,255,0,0.25)" : "rgba(255,90,58,0.25)";

  const headline = isApproved
    ? "Kampányod jóváhagyva!"
    : "Probléma a kreatívval";

  const heroEmoji = isApproved ? "🚀" : "⚠️";

  const bodyText = isApproved
    ? `Gratulálunk! A hirdetésed kreatívját jóváhagytuk. A kiválasztott időpontban <strong style="color:${BRAND}">kikerül az utcára</strong>, és valós időben követheted a kampányod teljesítményét az irányítópulton.`
    : `Sajnos a feltöltött kreatív nem felel meg a technikai vagy tartalmi követelményeknek. Kérjük, <strong style="color:${accentColor}">tölts fel egy újat</strong> az irányítópultban, és mi haladéktalanul átnézzük.`;

  const ctaText = isApproved ? "Kampány megtekintése" : "Kreatív módosítása";
  const ctaUrl = "https://www.vrsbillboards.hu/foglalas";

  const detailsRows = [
    details.bookingId    && ["Foglalás azonosítója", details.bookingId.toUpperCase().slice(0, 8)],
    details.billboardName && ["Felület",             details.billboardName],
    details.startDate    && ["Időszak kezdete",      fmtDate(details.startDate)],
    details.endDate      && ["Időszak vége",         fmtDate(details.endDate)],
    details.amount       && ["Összeg",               `${Number(details.amount).toLocaleString("hu-HU")} Ft`],
  ].filter(Boolean) as [string, string][];

  const detailsBlock = detailsRows.length > 0 ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;border-radius:12px;border:1px solid ${accentBorder};background:${accentBg};overflow:hidden;">
      <tbody>
        ${detailsRows.map(([k, v], i) => `
          <tr style="border-bottom:${i < detailsRows.length - 1 ? `1px solid rgba(255,255,255,0.05)` : "none"};">
            <td style="padding:12px 16px;font-size:13px;color:${TEXT_MUTED};font-family:Arial,sans-serif;">${k}</td>
            <td style="padding:12px 16px;font-size:13px;color:${TEXT_PRIMARY};font-family:Arial,sans-serif;font-weight:600;text-align:right;">${v}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  ` : "";

  return `<!DOCTYPE html>
<html lang="hu">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${headline}</title>
</head>
<body style="margin:0;padding:0;background:${BG_DARK};font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${BG_DARK};padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <!-- LOGO -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <span style="font-size:28px;font-weight:900;letter-spacing:4px;color:#ffffff;">VRS<span style="color:${BRAND};">.</span></span>
            </td>
          </tr>

          <!-- CARD -->
          <tr>
            <td style="background:${BG_CARD};border-radius:20px;border:1px solid #1e1e1e;overflow:hidden;">

              <!-- HERO BAND -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:linear-gradient(135deg,${accentBg},transparent);border-bottom:1px solid ${accentBorder};padding:36px 32px;text-align:center;">
                    <div style="font-size:48px;line-height:1;margin-bottom:16px;">${heroEmoji}</div>
                    <h1 style="margin:0;font-size:26px;font-weight:900;color:${TEXT_PRIMARY};letter-spacing:-0.5px;">
                      ${headline}
                    </h1>
                  </td>
                </tr>
              </table>

              <!-- BODY -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:32px;">

                    <p style="margin:0 0 20px;font-size:16px;line-height:1.7;color:#aaaaaa;">
                      ${bodyText}
                    </p>

                    ${detailsBlock}

                    <!-- CTA -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;">
                      <tr>
                        <td align="center">
                          <a href="${ctaUrl}"
                            style="display:inline-block;background:${accentColor};color:${isApproved ? "#000000" : "#ffffff"};font-size:15px;font-weight:900;text-decoration:none;padding:14px 36px;border-radius:12px;letter-spacing:0.5px;">
                            ${ctaText} →
                          </a>
                        </td>
                      </tr>
                    </table>

                    <!-- DIVIDER -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin:32px 0 0;">
                      <tr>
                        <td style="border-top:1px solid #1e1e1e;padding-top:24px;">
                          <p style="margin:0;font-size:13px;color:#444444;line-height:1.6;">
                            Ha kérdésed van, írj nekünk:
                            <a href="mailto:hello@vrsbillboards.hu" style="color:${BRAND};text-decoration:none;">hello@vrsbillboards.hu</a>
                          </p>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="margin:0;font-size:12px;color:#333333;">
                © 2026 VRS Billboards Kft. · Minden jog fenntartva
              </p>
              <p style="margin:6px 0 0;font-size:11px;color:#222222;">
                <a href="https://www.vrsbillboards.hu" style="color:#333333;text-decoration:none;">vrsbillboards.hu</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/* ─── Plain-text fallback ─────────────────────────────────────────────────── */
function buildText(status: EmailStatus): string {
  if (status === "approved") {
    return [
      "VRS Billboards — Kampány Jóváhagyva!",
      "",
      "Gratulálunk! A hirdetésed kreatívját jóváhagytuk.",
      "A kiválasztott időpontban kikerül az utcára.",
      "A számládat hamarosan küldjük.",
      "",
      "Irányítópult: https://www.vrsbillboards.hu/foglalas",
      "",
      "— VRS Billboards csapata",
    ].join("\n");
  }
  return [
    "VRS Billboards — Probléma a kreatívval",
    "",
    "Sajnos a feltöltött kreatív nem felel meg a követelményeknek.",
    "Kérjük, tölts fel egy újat az irányítópultban.",
    "",
    "Irányítópult: https://www.vrsbillboards.hu/foglalas",
    "",
    "— VRS Billboards csapata",
  ].join("\n");
}

/* ─── Date formatter ─────────────────────────────────────────────────────── */
function fmtDate(d: string): string {
  try {
    return new Date(d).toLocaleDateString("hu-HU", {
      year: "numeric", month: "long", day: "numeric",
    });
  } catch {
    return d;
  }
}

/* ─── Public API ──────────────────────────────────────────────────────────── */
export async function sendStatusEmail(
  to: string,
  status: EmailStatus,
  details: StatusEmailDetails = {}
): Promise<void> {
  const subject =
    status === "approved"
      ? "Kampány Jóváhagyva! 🚀"
      : "Probléma a kreatívval ⚠️";

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject,
    html: buildHtml(status, details),
    text: buildText(status),
  });

  if (error) {
    throw new Error(`Resend hiba: ${JSON.stringify(error)}`);
  }
}
