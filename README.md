# Steuerlast-Rechner.de

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8)
![Vitest](https://img.shields.io/badge/Test-Vitest-yellow)

**Steuerlast-Rechner.de** ist eine Open-Source-Plattform zur Analyse von Netto-Einkommen, Steuerlast und Sozialabgaben in Deutschland. 

## ✨ Hauptfunktionen

### 1. Detaillierte Steuerberechnung 2026
- **Exakte Algorithmen**: Implementiert die offiziellen Formeln für 2026, inkl. neuem Grundfreibetrag (12.348 €) und aktuellen Beitragsbemessungsgrenzen.
- **Erweiterte Parameter**: Berücksichtigung von **Alter** (Altersentlastungsbetrag) und **Kinderzahl** (PV-Abschläge).
- **Vollständige Abgabenanalyse**: Aufschlüsselung von Lohnsteuer, Kirchensteuer, Soli, sowie RV, AV, KV und PV.

### 2. Visuelle Analysen & Charts
- **Inflations-Diagramm**: Visualisiere die reale Kaufkraftentwicklung über die Jahre.
- **Gehaltsvergleich**: Vergleiche verschiedene Einkommensszenarien direkt miteinander.
- **Grenzbelastung**: Interaktive Kurve zeigt die Abzüge für den *nächsten* verdienten Euro.

### 3. Zukunftssimulator & Expertenmodus
- **Szenario-Analyse**: Simuliere demografische Entwicklungen (z.B. "Pessimistisch 2035") und deren Auswirkung auf das Netto.
- **Custom-Engine**: Passe im Expertenmodus Parameter wie KV-Zusatzbeitrag, Rentenwert oder Steuerprogression manuell an.

### 4. Intelligente Teilzeit-Analyse
- **Effizienz-Check**: Visualisiert die Auswirkungen von Stundenreduzierungen (z.B. 80%) auf das Netto.
- **Fairer Vergleich**: Basiert auf einer echten 100%-Hochrechnung für präzise Stunden-Netto-Werte.

### 5. Historischer Steuer- & Gehaltsvergleich (1958 vs. 2026)
- **1958er Steuertarif**: Exakte historische Einkommensteuerformeln (§ 32a EStG in DM) inkl. Ehegattensplitting und historischer Sozialabgaben (RV, AV, KV; keine PV).
- **Zwei Bereinigungsmodi**:
  - *Lohnbereinigt (Lebensstandard)*: Anpassung an das durchschnittliche Gehaltsniveau (Rentenversicherungs-Durchschnittsentgelt). Visualisiert die Verschiebung der Steuerprogression ("Mittelstandsbauch").
  - *Preisbereinigt (Kaufkraft)*: Anpassung basierend auf der historischen Inflation (1 DM 1958 ≈ 2,86 € heute).
- **Historischer Gehaltsvergleich**: Visualisiert die historische Einkommensverteilung von 1958 (Männer/Frauen) hochgerechnet auf heutiges Niveau.
- **Interaktiver Infobereich**: Ausklappbarer, geschichtlicher Exkurs zur Entwicklung von Steuern und Sozialabgaben in der Bundesrepublik.

### 6. Optimierte UX
- **Performance**: Debounced Inputs verhindern unnötige Neuberechnungen (besonders auf Mobile).
- **Smart Inputs**: Slider und Eingabefelder arbeiten synchron für intuitive Bedienung.

---

## 🛠 Tech Stack

Das Projekt ist eine moderne Next.js Applikation (Single Repo):

*   **Framework**: [Next.js 16](https://nextjs.org/) (App Router).
*   **Core**: React 19.
*   **Sprache**: TypeScript (Rechenlogik & UI).
*   **Styling**: TailwindCSS 4.
*   **Testing**: Vitest.
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
