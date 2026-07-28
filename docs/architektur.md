# Architektur

## Überblick

Next.js App Router, TypeScript, Tailwind, Recharts. Die gesamte Rechenlogik
liegt in `lib/` und ist frei von Framework-Abhängigkeiten.

```
app/
  page.tsx              Einstieg, verdrahtet Zustand und Panels
  api/calculate/        öffentliche Schnittstelle für Dritte
  faq/, impressum/

components/
  rechner/
    useRechner.ts       Zustand und Berechnung, vollständig im Browser
    EingabePanel.tsx    Eingaben, Rechtsstandswahl
    ErgebnisPanel.tsx   Netto, Abzüge, Arbeitgeberkosten, Methodenkasten
    Analysen.tsx        Teilzeit, Grenzbelastung, Einordnung, Kaufkraft, Paare
    Zeitreise1958.tsx   historischer Vergleich
    Donut.tsx           Ringdiagramm, von Hand gezeichnet
    InfoTooltip.tsx     Erklärungen auf Abruf
    useStickyWennPasst.ts  Sticky nur, wenn das Panel ins Fenster passt
  CalculatorLayout.tsx  Rahmen

lib/
  tax/                  siehe lib/tax/AGENTS.md
  statistik/            siehe lib/statistik/AGENTS.md

tools/lohnsteuer/       Generator und amtliche XML

docs/wissensspeicher/   fachliche Dokumentation
```

## Die Berechnung läuft im Browser

`useRechner` ruft `berechne` direkt auf. Es gibt keinen Netzwerkaufruf.

Das ist keine Optimierung, sondern eine Korrektur: Die Seite versprach an vier
Stellen „Berechnung im Browser" und „keine Eingaben an unsere Server", schickte
aber bei jeder Eingabeänderung drei POST-Requests mit Gehalt, Steuerklasse,
Bundesland, Alter und Kinderzahl an den Server.

Nebeneffekt: Das früher nötige Debounce von einer Sekunde entfällt.

`/api/calculate` bleibt als dokumentierte Schnittstelle für Dritte bestehen und
wird von der Oberfläche nicht mehr genutzt.

## Rechtsstand statt Modus

Früher gab es drei Modi: „Historisch", „Aktuell", „Zukunft". Das waren keine
gleichrangigen Alternativen — „Zukunft" war eine Parametervariation derselben
Berechnung, „Historisch" ein inhaltlich anderes Produkt.

Der gemeinsame Umschalter erzeugte Nebenwirkungen: geteilte Eingabefelder, die
je nach Modus wirkten oder nicht, konkurrierende Vergleichslogik und ein
Berechnen-Knopf mit drei Beschriftungen.

Jetzt:

- **Rechtsstand** ist eine Eigenschaft der Berechnung, wählbar über ein
  Auswahlfeld. Alle Eingaben wirken in jedem Rechtsstand.
- **Zeitreise 1958** ist eine eigene Ansicht mit vollständigem Methodenteil.
- **Analysen** sind eigenständige Karten unterhalb des Ergebnisses.

## Datenfluss

```
Eingaben (useRechner)
  └─> berechne()                        lib/tax/rechner.ts
        ├─> berechneSozialabgaben()     lib/tax/sozialabgaben.ts
        │     └─> SV_2026               lib/tax/parameter/
        └─> berechneLohnsteuer()        lib/tax/lohnsteuer.ts
              └─> Lohnsteuer2026        lib/tax/generated/  (amtlicher PAP)
```

Die Grenzabgabenquote wird numerisch bestimmt: dieselbe Rechnung mit
1.200 € mehr Jahresbrutto, Differenz der Abgaben geteilt durch die Differenz
des Bruttos. Dadurch enthält sie automatisch Sozialabgaben,
Solidaritätszuschlag und Kirchensteuer und bildet die Sprünge an den
Beitragsbemessungsgrenzen korrekt ab.

Die frühere Kennzahl war der Grenz-Einkommensteuersatz auf ein vereinfachtes zu
versteuerndes Einkommen nach Grundtabelle — ohne Sozialabgaben, ohne
Splittingberücksichtigung. Bei 60.000 € Brutto wies sie 34 % aus, während die
tatsächliche Grenzbelastung bei rund 50 % lag.

## Rechnen mit Geld

Zwei Verfahren, absichtlich getrennt.

**Im Rechenkern:** `big.js` mit einer eigenen Instanz (`PapBig`, `DP = 40`).
Der Programmablaufplan rundet ausschließlich explizit an definierten Stellen;
jede vorzeitige Rundung verfälscht das Ergebnis. Die globale
`Big`-Konfiguration anderer Module bleibt unberührt.

**Außerhalb:** `euroRunden` aus `lib/tax/runden.ts`. Das naheliegende
`Math.round(v * 100) / 100` ist für Geldbeträge unbrauchbar, weil viele
Zwischenergebnisse binär nicht exakt darstellbar sind:

```
5812.50 * 0.018                      = 104.62499999999999
Math.round(104.6249... * 100) / 100  = 104.62   // falsch
euroRunden(104.62499999999999)       = 104.63   // richtig
```

`euroRunden` normalisiert vor dem Runden auf zehn Nachkommastellen. Das
entfernt den Darstellungsfehler, ohne fachlich relevante Stellen zu verlieren —
Beitragssätze haben höchstens sechs.

## Tests

| Datei | Prüft |
|---|---|
| `lib/tax/__tests__/pruftabelle.test.ts` | 516 Werte gegen die amtlichen Prüftabellen, Toleranz 0 € |
| `lib/tax/__tests__/rechner.test.ts` | Sozialabgaben, Übergangsbereich, PKV, Szenarien |
| `lib/tax/__tests__/jahr1958.test.ts` | historischer Tarif, Splitting, Datenherkunft |
| `lib/statistik/__tests__/statistik.test.ts` | Verteilung und Kaufkraftreihe |

Mehrere Tests sind ausdrücklich als Regressionstests gegen konkrete frühere
Fehler formuliert und im Code als solche kommentiert.

`vitest.config.ts` schließt `.claude/worktrees` und `.firebase` aus — von dort
liefen sonst veraltete Testkopien mit.
