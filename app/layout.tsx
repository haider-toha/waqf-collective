import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Amiri } from "next/font/google";
import "./globals.css";

/* Body and UI — Geist. One sans for body, nav, and labels. Variable weight,
   self-hosted as WOFF2 (≈60% smaller than the TTF). No italic cut is used. */
const geist = localFont({
  variable: "--font-sans",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
  src: [
    {
      path: "../public/fonts/Geist-VariableFont_wght.woff2",
      weight: "100 900",
      style: "normal",
    },
  ],
});

/* Display — Neue Montreal by Pangram Pangram. A characterful grotesk with
   subtle ink traps and humanist warmth; reads as more considered than Geist
   without going serif. Trial cut — license before shipping to production. */
const display = localFont({
  variable: "--font-display",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
  src: [
    {
      path: "../public/fonts/NeueMontreal-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/NeueMontreal-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/NeueMontreal-LightItalic.woff2",
      weight: "300",
      style: "italic",
    },
  ],
});

/* Arabic — Amiri, a printed-Quran Naskh, a peer to GT Sectra. Only the regular
   cut is used (the verse is never bold), and it sits deep in the page, so it is
   not preloaded — it loads with the rest of the document, not ahead of the LCP. */
const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400"],
  variable: "--font-arabic",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://waqfcollective.org"),
  title:
    "Waqf Collective — Plant a tree under whose shade you may never sit in",
  description:
    "An Islamic endowment for modern founders. Pledge a share of your equity now; at a liquidity event the proceeds fund a permanent endowment for the Muslim-led technology ecosystem.",
  openGraph: {
    title: "Waqf Collective",
    description:
      "Plant a tree under whose shade you may never sit in. An Islamic endowment for modern founders.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#FCEACC",
  colorScheme: "light",
  viewportFit: "cover", // let content use the full notched-device viewport; pairs with the safe-area insets in globals.css
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geist.variable} ${display.variable} ${amiri.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
