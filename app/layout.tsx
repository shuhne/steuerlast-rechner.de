import type { Metadata } from "next";
import { StructuredData } from "../components/StructuredData";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { RechnerProvider } from "../components/rechner/useRechner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: '%s | Steuerlast-Rechner.de',
    default: 'Steuerlast Rechner 2026 - Brutto Netto Rechner & Prognose',
  },
  description: 'Berechne dein Netto-Gehalt für 2026 und simuliere zukünftige Abgabenlasten. Kostenloser Lohnsteuerrechner mit Szenario-Analyse für Renten- und Krankenkassenbeiträge.',
  metadataBase: new URL('https://steuerlast-rechner.de'),
  alternates: {
    canonical: './',
  },
  openGraph: {
    title: 'Steuerlast Rechner 2026 - Was bleibt vom Brutto?',
    description: 'Berechne dein Netto-Gehalt und simuliere die Steuerlast der Zukunft. Kostenlos & Anonym.',
    url: 'https://steuerlast-rechner.de',
    siteName: 'Steuerlast-Rechner.de',
    locale: 'de_DE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Steuerlast Rechner 2026',
    description: 'Was bleibt vom Brutto? Simuliere jetzt deine Steuerlast.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StructuredData />
        <RechnerProvider>{children}</RechnerProvider>
      </body>
    </html>
  );
}
