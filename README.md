# Steuerlast-Rechner.de

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38bdf8)

**Steuerlast-Rechner.de** ist eine hochentwickelte Open-Source-Plattform zur detaillierten Analyse von Netto-Einkommen, Steuerlast und Sozialabgaben in Deutschland. 

Anders als einfache Brutto-Netto-Rechner bietet dieses Projekt tiefergehende Einblicke: Es simuliert nicht nur das Jahr 2026 mit exakten gesetzlichen Parametern, sondern ermöglicht auch **Zukunftsprognosen** (z.B. Szenario 2035) und **Grenzsteueranalysen**, um die tatsächliche Belastung jedes zusätzlich verdienten Euros zu verstehen.

## ✨ Hauptfunktionen

### 1. Detaillierte Steuerberechnung 2026
- **Exakte Algorithmen**: Implementiert die offiziellen Formeln für 2026, inkl. neuem Grundfreibetrag (12.348 €) und aktuellen Beitragsbemessungsgrenzen.
- **Vollständige Abgabenanalyse**: Aufschlüsselung von Lohnsteuer, Kirchensteuer, Soli, sowie RV, AV, KV und PV.

### 2. Zukunftssimulator & Expertenmodus
- **Szenario-Analyse**: Simulieren Sie demografische Entwicklungen, wie z.B. einen Anstieg der Sozialabgaben im Jahr 2035 ("Pessimistisch 2035").
- **Custom-Engine**: Passen Sie im Expertenmodus jeden Parameter (KV-Zusatzbeitrag, Rentenwert, Steuerprogression) manuell an, um individuelle "Was-wäre-wenn"-Szenarien zu testen.

### 3. Intelligente Teilzeit-Analyse
- **Effizienz-Rechner**: Visualisiert, wie sich Stundenreduzierungen (90%, 80%, 50%) auf das Netto auswirken. Oft sinkt das Netto durch die Steuerprogression deutlich weniger stark als das Brutto.

### 4. Grenzbelastungs-Chart
- **Interaktive Kurve**: Zeigt grafisch, wie hoch die Abzüge für den *nächsten* verdienten Euro sind (Grenzsteuersatz + Sozialabgaben).

---

## 🛠 Tech Stack

Das Projekt ist als Monorepo strukturiert:

*   **Frontend**: [Next.js 15](https://nextjs.org/) (App Router), TypeScript, TailwindCSS, Recharts.
*   **Backend**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.10+). Implementiert die Rechenlogik isoliert vom UI.
*   **Hosting**: Firebase Hosting (Frontend) & Google Cloud Run (Backend Container).

## 🚀 Installation & Entwicklung

### Voraussetzungen
*   Node.js 18+
*   Python 3.10+
*   Git

### 1. Repository klonen

```bash
git clone https://github.com/shuhne/steuerlast-rechner.de.git
cd steuerlast-rechner.de
```

### 2. Backend (Python/FastAPI)

Das Backend stellt die Rechenlogik bereit.

```bash
# Virtual Environment erstellen & aktivieren
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Abhängigkeiten installieren
pip install -r requirements.txt

# Server starten
uvicorn app.main:app --reload
```

Der API-Server läuft nun unter `http://127.0.0.1:8000`. Die API-Dokumentation (Swagger UI) finden Sie unter `http://127.0.0.1:8000/docs`.

### 3. Frontend (Next.js)

Das Frontend kommuniziert mit dem lokalen Backend.

```bash
# In einem neuen Terminal:
cd frontend

# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev
```

Die Anwendung ist nun unter `http://localhost:3000` erreichbar.

## 🤝 Contributing

Beiträge sind willkommen! Wenn Sie einen Fehler finden oder eine neue Funktion vorschlagen möchten:

1.  Öffnen Sie ein [Issue](https://github.com/shuhne/steuerlast-rechner.de/issues).
2.  Forken Sie das Repository.
3.  Erstellen Sie einen Feature-Branch (`git checkout -b feature/AmazingFeature`).
4.  Committen Sie Ihre Änderungen (`git commit -m 'Add some AmazingFeature'`).
5.  Pushen Sie den Branch (`git push origin feature/AmazingFeature`).
6.  Öffnen Sie einen Pull Request.

## 📄 Lizenz

Dieses Projekt ist unter der MIT-Lizenz veröffentlicht.
