import type { Metadata } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const barlow = Barlow({
  weight: ["300", "400", "500", "600", "700", "900"],
  subsets: ["latin"],
  variable: "--font-barlow",
});

const barlowCondensed = Barlow_Condensed({
  weight: ["700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-barlow-condensed",
});

const APP_URL = "https://www.vrsbillboards.hu";
const OG_IMAGE = `${APP_URL}/og-image.jpg`;

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),

  title: {
    default: "VRS Billboards | A digitális óriásplakát bérlés jövője",
    template: "%s | VRS Billboards",
  },
  description:
    "Felejtsd el a hetekig tartó e-mailezést. Foglalj prémium DOOH felületeket másodpercek alatt, és kövesd a megtérülést valós időben.",
  keywords: [
    "DOOH",
    "digitális óriásplakát",
    "óriásplakát bérlés",
    "kültéri hirdetés",
    "KKV marketing",
    "outdoor reklám",
    "reklámfelület foglalás",
    "DOOH platform",
    "hirdetési felület",
    "Budapest óriásplakát",
    "VRS Billboards",
  ],
  authors: [{ name: "6ékony Reklám Kft.", url: APP_URL }],
  creator: "6ékony Reklám Kft.",
  publisher: "VRS Billboards",

  openGraph: {
    type: "website",
    locale: "hu_HU",
    url: APP_URL,
    siteName: "VRS Billboards",
    title: "VRS Billboards | A digitális óriásplakát bérlés jövője",
    description:
      "Felejtsd el a hetekig tartó e-mailezést. Foglalj prémium DOOH felületeket másodpercek alatt, és kövesd a megtérülést valós időben.",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "VRS Billboards — prémium DOOH foglalási platform",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "VRS Billboards | A digitális óriásplakát bérlés jövője",
    description:
      "Foglalj prémium DOOH felületeket másodpercek alatt. Valós idejű ROI, azonnali bankkártyás fizetés.",
    images: [OG_IMAGE],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },

  alternates: {
    canonical: APP_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="hu"
      className={`${barlow.variable} ${barlowCondensed.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-screen" suppressHydrationWarning>
        {children}
        <Toaster
          theme="dark"
          richColors
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#0a0a0a",
              border: "1px solid #1a1a1a",
              color: "#fff",
            },
          }}
        />
      </body>
    </html>
  );
}
