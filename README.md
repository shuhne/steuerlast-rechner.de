# Steuer- & Arbeitszeit-Optimierer 2026

Eine hochentwickelte Simulationsplattform zur Analyse von Netto-Einkommen, Steuerlast und Sozialabgaben in Deutschland. Die Anwendung ermöglicht nicht nur exakte Berechnungen für das Jahr 2026, sondern auch die Simulation zukünftiger Belastungsszenarien (z.B. 2035).

## Hauptfunktionen

### 1. **Detaillierte Steuerberechnung 2026**
- **Exakte Algorithmen**: Berücksichtigt den neuen Grundfreibetrag (12.348 €), aktualisierte Beitragsbemessungsgrenzen (BBG) und Soli-Freigrenzen.
- **Umfassende Abgaben**: Berechnet Lohnsteuer, Kirchensteuer, Soli sowie alle Zweige der Sozialversicherung (RV, AV, KV, PV) zentgegenau.

### 2. **Zukunftssimulator & Expertenmodus**
- **Zukunftsszenarien**: Simulieren Sie "Was wäre wenn"-Szenarien, wie z.B. einen drastischen Anstieg der Renten- und Krankenversicherungsbeiträge im Jahr 2035 ("Pessimistisch 2035").
- **Expertenmodus**: Passen Sie jeden einzelnen Berechnungsfaktor manuell an. Ändern Sie Beitragssätze, Steuerfaktoren und Zusatzbeiträge, um individuelle Szenarien zu testen.
- **Instant Calculation**: Wechseln Sie nahtlos zwischen Szenarien – die Ergebnisse aktualisieren sich sofort.

### 3. **Intelligente Teilzeit-Analyse**
- **Lohnentwicklung Teilzeit**: Visualisiert den Netto-Effekt einer Arbeitszeitreduzierung auf **90%, 80%, 70% und 50%**.
- **Effizienz-Check**: Sehen Sie auf einen Blick, wie stark das Netto im Vergleich zum Brutto sinkt (oft überproportional günstig aufgrund der Steuerprogression).

### 4. **Grenzsteuer-Optimierung**
- **Grenzsteuer-Chart**: Eine interaktive Kurve zeigt, wie viel Cent von jedem zusätzlich verdienten Euro an den Staat fließen.
- **Interaktive Erklärungen**: Info-Tooltips erklären komplexe Begriffe wie "Grenzsteuersatz" oder "Progressionswirkung" direkt im Dashboard.

---

## Technische Installation

### Projektstruktur
- **`app/`**: High-Performance Backend (FastAPI, Python). Implementiert die offizielle EStG-Logik.
- **`frontend/`**: Modernes React-Frontend (Next.js, TypeScript, TailwindCSS). Bietet ein responsives Dark-Mode UI.

### Setup & Start

#### 1. Backend (Python)
Benötigt Python 3.10+.

```bash
# Virtual Environment erstellen & aktivieren
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Abhängigkeiten installieren
pip install -r requirements.txt

# Server starten
uvicorn app.main:app --reload
```
Der API-Server läuft unter: [http://127.0.0.1:8000](http://127.0.0.1:8000)

#### 2. Frontend (Next.js)
Benötigt Node.js 18+.

```bash
cd frontend
npm install
npm run dev
```
Die Anwendung ist erreichbar unter: [http://localhost:3000](http://localhost:3000)
