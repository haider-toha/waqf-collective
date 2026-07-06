import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Amiri } from "next/font/google";
import "./globals.css";

/* Body and UI — Geist. One sans for body, nav, and labels. */
const geist = localFont({
  variable: "--font-sans",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
  src: [
    {
      path: "../public/fonts/Geist-VariableFont_wght.ttf",
      weight: "100 900",
      style: "normal",
    },
    {
      path: "../public/fonts/Geist-Italic-VariableFont_wght.ttf",
      weight: "100 900",
      style: "italic",
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
      path: "../public/fonts/NeueMontreal-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/NeueMontreal-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/NeueMontreal-Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/NeueMontreal-LightItalic.otf",
      weight: "300",
      style: "italic",
    },
  ],
});

/* Arabic — Amiri, a printed-Quran Naskh, a peer to GT Sectra. */
const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://waqfcollective.org"),
  title: "Waqf Collective — Plant a tree under whose shade you may never sit in",
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
  themeColor: "#F6F3EC",
  colorScheme: "light",
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
