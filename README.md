# Steuerlast-Rechner.de

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38bdf8)

**Steuerlast-Rechner.de** ist eine Open-Source-Plattform zur Analyse von Netto-Einkommen, Steuerlast und Sozialabgaben in Deutschland. 

## ✨ Hauptfunktionen

### 1. Detaillierte Steuerberechnung 2026
- **Exakte Algorithmen**: Implementiert die offiziellen Formeln für 2026, inkl. neuem Grundfreibetrag (12.348 €) und aktuellen Beitragsbemessungsgrenzen.
- **Vollständige Abgabenanalyse**: Aufschlüsselung von Lohnsteuer, Kirchensteuer, Soli, sowie RV, AV, KV und PV.

### 2. Zukunftssimulator & Expertenmodus
- **Szenario-Analyse**: Simuliere demografische Entwicklungen, wie z.B. einen Anstieg der Sozialabgaben im Jahr 2035 ("Pessimistisch 2035").
- **Custom-Engine**: Passe im Expertenmodus jeden Parameter (KV-Zusatzbeitrag, Rentenwert, Steuerprogression) manuell an.

### 3. Intelligente Teilzeit-Analyse
- **Effizienz-Rechner**: Visualisiert, wie sich Stundenreduzierungen (90%, 80%, 50%) auf das Netto auswirken.
- **Mobile Optimized**: Smooth-Scroll und optimierte UI für Smartphones und Tablets.

### 4. Grenzbelastungs-Chart
- **Interaktive Kurve**: Zeigt grafisch, wie hoch die Abzüge für den *nächsten* verdienten Euro sind.

---

## 🛠 Tech Stack

Das Projekt ist eine moderne Next.js Applikation (Single Repo):

*   **Framework**: [Next.js 15](https://nextjs.org/) (App Router).
*   **Sprache**: TypeScript (Rechenlogik & UI).
*   **Styling**: TailwindCSS.
*   **Charts**: Recharts.
*   **API**: Next.js Route Handlers (`app/api/*`).
*   **Hosting**: Firebase Hosting, Vercel oder Netlify (Static/Serverless-Ready).

## 🚀 Installation & Entwicklung

### Voraussetzungen
*   Node.js 18+
*   Git

### 1. Repository klonen

```bash
git clone https://github.com/shuhne/steuerlast-rechner.de.git
cd steuerlast-rechner.de
```

### 2. Dependencies installieren & Starten

```bash
npm install
npm run dev
```

Die Anwendung ist nun unter `http://localhost:3000` erreichbar.

## 🔒 Datenschutz

Das Projekt folgt einem strikten "Privacy by Design"-Ansatz:
- **Keine Cookies**: Es werden keine technsichen oder Tracking-Cookies gesetzt.
- **Lokale Verarbeitung**: Die Berechnungslogik läuft stateless; Eingaben werden nicht gespeichert.
- **Kein Logging**: Personenbezogene Daten (Gehalt, Steuerklasse) werden nicht persistiert.

## 🤝 Contributing

Beiträge sind willkommen!

1.  Öffne ein [Issue](https://github.com/shuhne/steuerlast-rechner.de/issues).
2.  Forke das Repository.
3.  Erstelle einen Feature-Branch.
4.  Öffne einen Pull Request.

## 📄 Lizenz

Dieses Projekt ist unter der MIT-Lizenz veröffentlicht.
