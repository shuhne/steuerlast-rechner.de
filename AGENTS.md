# AGENTS.md — Arbeitsanweisung für dieses Repository

Diese Datei gilt für alle Agenten, die an steuerlast-rechner.de arbeiten.
Sie ist bewusst kurz. Die ausführlichen Anleitungen stehen in
[`docs/wissensspeicher/`](docs/wissensspeicher/README.md).

---

## Worum es geht

Ein Brutto-Netto-Rechner für Deutschland. Menschen treffen auf Basis dieser
Zahlen Entscheidungen über Gehaltsverhandlungen, Teilzeit und Vorsorge. Eine
falsche Zahl ist kein Schönheitsfehler.

## Die fünf Regeln

### 1. Der Rechenkern wird nie von Hand geändert

`lib/tax/generated/` wird aus der amtlichen BMF-XML erzeugt. Änderungen
ausschließlich über eine neue XML-Fassung und `npm run gen:lohnsteuer`.

**Warum das hier ausdrücklich steht:** Bis Juli 2026 lief ein per Regex „auf
2026 gepatchter" Programmablaufplan von 2023. Drei von vier
Tarifzonen-Ersetzungen sind stillschweigend fehlgeschlagen — das Skript meldete
trotzdem Erfolg. Ergebnis: bis zu 1.329 € zu viel Lohnsteuer und 420 € zu viel
Solidaritätszuschlag pro Jahr, über Monate in Produktion, von keinem der über
100 Tests bemerkt.

### 2. Jede Zahl braucht eine Quelle

Werte aus Gesetz, Verordnung oder amtlicher Bekanntmachung gehören nach
`lib/tax/parameter/` und tragen dort `quelle`, `rechtsstatus`,
`belastbarkeit`, `gueltigAb`. Die Oberfläche liest diese Metadaten direkt —
dadurch kann eine angezeigte Quellenangabe nicht veralten, ohne dass auch der
Wert veraltet.

Keine nackten Zahlen in Komponenten oder Rechenfunktionen.

### 3. Unsicherheit wird benannt, nicht geschätzt

Wenn ein Wert nicht belegbar ist, gibt es drei zulässige Wege:

- `belastbarkeit: 'hergeleitet'` mit dokumentierter Herleitung
- `belastbarkeit: 'interpoliert'` mit genannten Stützstellen
- `nichtModelliert` — der Punkt wird ausdrücklich als nicht abgebildet benannt

**Nicht zulässig:** eine plausibel klingende Zahl erfinden und wie einen
belegten Wert behandeln.

Beispiel aus der Praxis: Die für 2027 angekündigte Steuerreform ist bekannt
(rund 10 Mrd. € Entlastung), aber ohne Referentenentwurf gibt es keine
Beträge. Deshalb steht sie unter `nichtModelliert` und nicht als geschätzter
Grundfreibetrag im Code.

### 4. Politische Ankündigung ist keine Rechtslage

`rechtsstatus` unterscheidet: `geltendes_recht`, `verkuendet`,
`regierungsentwurf`, `referentenentwurf`, `politische_ankuendigung`,
`amtliche_projektion`, `eigene_annahme`. Die Oberfläche zeigt alles unterhalb
von `geltendes_recht` sichtbar gekennzeichnet an.

### 5. Amtliche Referenz schlägt Selbstbezug

Tests, die nur prüfen, ob der Code das tut, was der Code tut, hätten den Fehler
aus Regel 1 nicht gefunden — sie haben es auch nicht. Der Kerntest ist
`lib/tax/__tests__/pruftabelle.test.ts`: 516 Werte aus den amtlichen
Prüftabellen, Toleranz 0 €.

Ist er rot, ist der Rechenkern falsch. **Niemals die Erwartungswerte anpassen.**

---

## Erste Schritte für einen Recherche-Agenten

| Aufgabe | Einstieg |
|---|---|
| Jahreswechsel, neue Werte einspielen | [`runbook-jahreswechsel.md`](docs/wissensspeicher/runbook-jahreswechsel.md) |
| Neue Quelle suchen, Wert prüfen | [`quellenregister.md`](docs/wissensspeicher/quellenregister.md) |
| Reformstand aktualisieren | [`reformmonitor.md`](docs/wissensspeicher/reformmonitor.md) |
| Verstehen, wie der Code aufgebaut ist | [`architektur.md`](docs/architektur.md) |
| Nachvollziehen, warum etwas so ist | [`recherche-2026-07.md`](docs/wissensspeicher/recherche-2026-07.md) |
| Offene Punkte finden | [`offene-punkte.md`](docs/wissensspeicher/offene-punkte.md) |

Verzeichnisspezifische Anweisungen: [`lib/tax/AGENTS.md`](lib/tax/AGENTS.md),
[`lib/statistik/AGENTS.md`](lib/statistik/AGENTS.md).

---

## Befehle

```bash
npm run dev              # Entwicklungsserver
npm test                 # alle Tests
npm test -- pruftabelle  # nur der amtliche Abgleich
npm run gen:lohnsteuer   # Rechenkern aus der XML neu erzeugen
npm run lint             # ESLint
npx tsc --noEmit         # Typprüfung
```

Vor jedem Commit müssen `npm test`, `npm run lint` und `npx tsc --noEmit`
sauber durchlaufen.

## Arbeitsweise

- Kleine, thematisch saubere Commits. Eine Änderung, ein Commit.
- Commit-Nachrichten erklären das **Warum**, nicht das Was. Wenn ein Fehler
  behoben wird: was war falsch, welche Auswirkung hatte es, woran wurde es
  gemessen.
- Deutsche Bezeichner in fachlichem Code. Steuerrecht hat eine präzise
  deutsche Terminologie; `beitragsbemessungsgrenze` ist eindeutig,
  `contributionCeiling` nicht.
- Kommentare erklären Rechtsstand und Herleitung, nicht die Syntax.
