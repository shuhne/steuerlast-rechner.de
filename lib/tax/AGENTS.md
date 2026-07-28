# AGENTS.md — lib/tax

Regeln für den steuerlichen Rechenkern. Ergänzt die Regeln in
[`../../AGENTS.md`](../../AGENTS.md).

## Schichten

```
generated/     amtlicher PAP, maschinell erzeugt   -> NIE von Hand ändern
parameter/     Zahlen mit Quelle und Rechtsstatus  -> hier gehören Gesetzeswerte hin
lohnsteuer.ts  Adapter auf den PAP                 -> keine Tariflogik
sozialabgaben.ts  Beiträge                         -> Sätze aus parameter/
rechner.ts     setzt beides zusammen               -> keine nackten Zahlen
analysen.ts    abgeleitete Auswertungen            -> ruft nur rechner.ts
historisch/    Vergleichsjahre                     -> eigene Parametersätze
index.ts       öffentliche Schnittstelle           -> hier importieren Komponenten
runden.ts      binärstabiles Cent-Runden
```

Komponenten importieren ausschließlich aus `index.ts`, nie direkt aus
`generated/` oder `parameter/`.

## Wo gehört was hin

| Art der Änderung | Datei |
|---|---|
| Neuer Jahrgang des Programmablaufplans | `tools/lohnsteuer/` + `npm run gen:lohnsteuer` |
| Beitragssatz, Bemessungsgrenze, Freibetrag | `parameter/sozialversicherung.ts` |
| Neues Szenario oder geänderter Rechtsstatus | `parameter/rechtsstaende.ts` |
| Ableitung eines PAP-Merkers aus fachlichen Eingaben | `lohnsteuer.ts` |
| Neue Auswertung auf Basis vorhandener Berechnung | `analysen.ts` |
| Tarifformel | gar nicht — die steckt im PAP |

## Warum `generated/` unantastbar ist

Bis Juli 2026 lief ein per Regex „auf 2026 gepatchter" PAP von 2023. Drei von
vier Tarifzonen-Ersetzungen sind stillschweigend fehlgeschlagen; das Skript
meldete Erfolg. Die Zonen 3, 4 und 5 trugen weiter die Koeffizienten von 2023,
die Soli-Freigrenze war frei erfunden.

Messbare Folge gegen die amtliche Prüftabelle:

| Jahresbrutto | amtlich | vorher | Abweichung |
|---:|---:|---:|---:|
| 50.000 € | 6.788 € | 6.898 € | +110 € |
| 60.000 € | 9.389 € | 9.604 € | +215 € |
| 100.000 € | 23.248 € | 24.577 € | **+1.329 €** |

Dazu bis 420 € zu viel Solidaritätszuschlag. Bei 100.000 € Brutto fehlten
rund 146 € netto im Monat.

Keiner der damals über 100 Tests hat das bemerkt, weil keiner gegen eine
amtliche Referenz prüfte — mehrere testeten sogar eine zweite, parallel
existierende und zufällig korrekte Tarifimplementierung, die im Produktivpfad
gar nicht verwendet wurde.

## Der Kerntest

`__tests__/pruftabelle.test.ts` prüft 516 Werte aus den beiden amtlichen
Prüftabellen: 43 Bruttostufen, 6 Steuerklassen, 2 Tabellen. **Toleranz 0 €.**

Ist er rot, ist der Rechenkern falsch. Die Erwartungswerte sind eine amtliche
Veröffentlichung und werden nicht angepasst.

## Fallstricke

**Rundung.** Nie `Math.round(v * 100) / 100` für Geldbeträge. `5812.50 * 0.018`
ergibt in Gleitkomma `104.62499999999999` und damit 104,62 statt korrekt
104,63. Immer `euroRunden` aus `runden.ts` verwenden.

**big.js.** Die generierte Datei nutzt eine eigene Instanz mit `DP = 40`, damit
Divisionen nicht vorzeitig runden. Der PAP rundet ausschließlich explizit. Die
globale Big-Konfiguration nicht verändern.

**PAP-Merker vollständig setzen.** Fehlt ein Merker, rechnet der PAP mit dem
Standardwert weiter, ohne zu warnen. Zwei Beispiele aus der Praxis:

- `PVA` (Beitragsabschläge ab dem zweiten Kind) wurde nie gesetzt — Familien
  bekamen eine zu kleine Vorsorgepauschale
- `JRE4` (Jahresarbeitslohn ohne sonstige Bezüge) wurde nie gesetzt — die
  Steuer auf Einmalzahlungen war dadurch deutlich zu niedrig

Nach jedem Generatorlauf prüfen, ob neue Eingaben hinzugekommen sind.

**PKV.** `PKV = 2` mit `PKPVAGZ` ist richtig, nicht `PKV = 1`. Arbeitnehmer
oberhalb der Jahresarbeitsentgeltgrenze haben nach § 257 SGB V immer Anspruch
auf den Arbeitgeberzuschuss.

**Sachsen.** Der Arbeitgeber trägt 0,5 Punkte weniger zur Pflegeversicherung,
der Arbeitnehmer entsprechend mehr. Betrifft sowohl `PVS` im PAP als auch die
Beitragsberechnung.

## Historische Jahre

`historisch/` hat eigene Parametersätze mit eigener Provenienz. Belege sind
hier schwerer zu beschaffen als für die Gegenwart; entsprechend gewissenhaft
ist `belastbarkeit` zu setzen. Was nicht abgebildet ist, gehört in
`NICHT_MODELLIERT` und wird in der Oberfläche angezeigt.

Das Ehegattensplitting gilt nur bei Zusammenveranlagung — nicht pauschal für
alle Steuerklassen, die Verheiratete kennzeichnen. Frühere Fassungen wandten es
auf die Klassen 3, 4 und 5 an, wodurch alle drei identische Ergebnisse
lieferten.
