# Umsetzung und Nachprüfung am 22.09.2026

Alle nachfolgend dokumentierten UI-Befunde wurden bearbeitet. Der ursprüngliche
Prüfbericht bleibt als Reproduktionsgrundlage erhalten.

| Befund | Umsetzung / Nachprüfung |
|---|---|
| Dezimalpunkt und negative Gehälter | `5000.00`, `5000,00`, `5.000,00` → gleiches Ergebnis; negative/ungültige Eingaben bleiben sichtbar, Auswertung gesperrt |
| Kinder | Elternstatus lebenslang, ganze Kinder unter 25, ELStAM-Zähler separat; 60.000 € mit Elternstatus und 0,5 Freibeträgen: 1.080 € PV statt 1.440 € |
| Zusatzbeitrag | Szenarioannahme oder eigener Kassenbeitrag; 4,5 % im 2027-Szenario → 9,55 % AN-KV |
| PKV | Fehlender Beitrag sperrt Ergebnis, Rückwechsel immer möglich; PAP erhält tatsächlich begrenzten Zuschuss |
| Bonus | Dezembermodell einschließlich Sozialbeiträgen; 60.000 + 12.000 € → 15.409,13 € AN-SV; unsupported Mini-/Midijobs gesperrt |
| Mobile Ergebnisdistanz | Feste Nettoleiste mit Sprung zum Ergebnis, Platz inklusive Safe Area reserviert |
| Touch/Labels/Kontrast | 44 px Plus/Minus und Infoflächen, benannte Formularfelder und kontextbezogene Hilfen; Escape schließt Datenschutzhinweis |
| Teilzeit | 80 % von 40 h → 32 h in Ergebnis und Analyse; einheitliches Netto je bezahlter Stunde; Achsen mit Dezimalstellen |
| Navigation | Gehalt, Szenario und PKV-Beitrag überstehen FAQ und Rückkehr; nur React-Arbeitsspeicher |
| Analyseumfang | Zugängliche Tabs mit Pfeiltasten/Home/End; Teilzeit und Paarvergleich mobil als Karten |
| 320 px Überlauf | Beschriftungen umbrechend, Versicherungsfeld volle Breite; kein horizontaler Dokumentüberlauf |

## Quellen und bewusst begrenzter Modellumfang

- Elternstatus und Abschläge: [BMG, Finanzierung der Pflegeversicherung](https://www.bundesgesundheitsministerium.de/themen/pflege/online-ratgeber-pflege/die-pflegeversicherung/finanzierung), [DRV-FAQ](https://www.deutsche-rentenversicherung.de/SharedDocs/FAQ/Pflegeversicherung/beitragsstaffelung/faq-liste-beitragsstaffelung-pflegeversicherung).
- Einmalzahlung: [§ 23a Abs. 3 und 4 SGB IV](https://www.gesetze-im-internet.de/sgb_4/__23a.html).
  Bei Dezemberzahlung und ganzjährigem konstantem Lohn wird die freie Jahres-BBG
  jedes Zweigs ausgeschöpft. Andere Monate, Unterbrechungen und die Märzklausel
  bleiben ausdrücklich nicht modelliert. Die UI benennt diesen Umfang am Feld,
  im Ergebnis und in den FAQ. Das Monatsnetto ist ein Jahresdurchschnitt.
- PKV bleibt ein kombiniertes Beitragsmodell; getrennte Basis-/Mehrleistungen
  und PKV-/PPV-Anteile bleiben offen. Die Versicherungsberechtigung wird nicht geprüft.

## Validierung

- ESLint, TypeScript und sauberer Produktionsbuild erfolgreich.
- 116 Tests, darunter 516 amtliche BMF-Vergleichswerte mit Toleranz 0 €.
- Neue Regressionen für Eingabeformate, Elternstatus/Sachsen, eigenen KV-Satz,
  Dezemberbonus unter/über BBG, nicht unterstützte Bonusfälle und PKV-Zuschuss.
- Lokaler Browser mit Playwright-Locators: Gehaltsformate, Elternstatus,
  Szenario/eigener KV-Satz, fehlende PKV/Rückwechsel, FAQ/Rückkehr, Dezemberbonus,
  Arbeitszeitregler, Tastatur-Tabs, Escape sowie mobile Breiten 390 und 320 px.
- Die Entwicklungsansicht meldete eine React-Debug-CSP-Warnung (`eval`); deshalb
  wurde der abschließende Smoke-Test zusätzlich gegen den Produktionsbuild durchgeführt: keine Konsolenfehler, mobile Karten und Nettoleiste funktionieren.

---

# Lokale Browserprüfung am 22.09.2026

Geprüfter Stand: `0710264` (Anwendungsänderung `f08e174`).
Produktionsbuild lokal über `npm run start -- --port 3100`.
Bedienung mit dem Browser-Werkzeug und dessen Playwright-Locators;
Prüfung anhand von gerendertem DOM, Screenshots und Browsermeldungen.
Viewportgrößen: 1440 × 1000, 1366 × 768, 390 × 844 und ergänzend 320 × 740.
Keine Prüfung auf echten Mobilgeräten oder in mehreren Browser-Engines.
Es wurden keine Anwendungsänderungen oder Deployments vorgenommen.

## Funktionierende Abläufe

- 60.000 € Jahresbrutto, Steuerklasse I, Berlin, kinderlos: 37.561 € Jahresnetto / 3.130,08 € Monatsnetto.
- Umschaltung am Ergebnis auf monatlich: Eingabe wird zu 5.000 €, Ergebnis und Abzugsüberschrift wechseln konsistent. Rückwechsel erhält den Jahresbetrag.
- Alle sechs Steuerklassen liefern Ergebnisse ohne sichtbare Fehlermeldung, NaN oder Infinity. Das ist ein Bedienungstest, kein zusätzlicher amtlicher Steuervergleich.
- Alle fünf Zukunfts-/Belastungsszenarien lassen sich auswählen und liefern gekennzeichnete Ergebnisse.
- Arbeitszeitregler per Pfeiltasten von 100 auf 80 %: Brutto neu 48.000 €, 32 Stunden; ursprüngliche Eingabe 60.000 € bleibt erhalten.
- Rücksetzen setzt fachliche Eingaben zurück. Ein geöffneter Bereich „Weitere Angaben“ bleibt offen.
- Zeitreise und Rückkehr zum Rechner funktionieren.
- Datenschutz-Information öffnet und schließt per erneutem Klick.
- FAQ-Navigation und Suche nach „2027“ funktionieren.
- Bei 390 px Breite kein horizontaler Überlauf der gesamten Seite. Tabellen scrollen innerhalb ihrer Container horizontal.
- Keine Browsermeldungen der Stufe `error` während des Tests. Recharts meldet zeitweise Warnungen zu noch nicht gemessenen Containergrößen; die untersuchten Diagramme werden anschließend angezeigt.

## Zuerst beheben: Eingaben müssen das Ergebnis zuverlässig erklären

### P1 — Dezimalpunkt kann das Gehalt verhundertfachen

Reproduktion: Monatsansicht, Bruttogehalt `5000.00` eingeben.
Beobachtung: 263.515,62 € Monatsnetto statt des Ergebnisses für 5.000 €.
`5.000,00` liefert dagegen 3.130,08 €. Der Parser entfernt sämtliche Punkte.
Ein führendes Minus wird beim Tippen ebenfalls entfernt; `-5000` wird zu 5000.

Empfehlung: Zahlenformat robust erkennen oder mehrdeutige Eingaben sichtbar
zurückweisen. Negative und unzulässige Werte nicht still in gültige positive
Beträge umwandeln. Eindeutige Formatierung bei Verlassen des Feldes.

Code: `components/rechner/useRechner.ts`, `parseZahl`, sowie Bruttofeld in
`components/rechner/EingabePanel.tsx`.

### P1 — Kinderfreibetrag und Pflege-Kinderzahl sind dasselbe Feld

Reproduktion: 60.000 € Jahresbrutto, 2026, Alter 30; „Keine“ anklicken,
anschließend einmal „Ein halbes Kind weniger“. Das Feld zeigt 0,5.
Beobachtung: Pflegeversicherung zeigt den Arbeitnehmeranteil von 2,40 %,
1.440 € jährlich, wie beim kinderlosen Ausgangsfall.

Die Oberfläche erklärt halbe Werte als Kinderfreibetrag, übergibt den Wert aber
auch unverändert als Kinderzahl an die Pflegeberechnung; dort wird abgerundet.
Die beiden steuerlichen und sozialversicherungsrechtlichen Angaben sind nicht
austauschbar.

Empfehlung: Elternstatus, Zahl der berücksichtigungsfähigen Kinder unter 25 und
Kinderfreibetragszähler getrennt modellieren. Den Freibetragszähler als
fortgeschrittene Eingabe mit eigener Erklärung anbieten.

Code: `components/rechner/useRechner.ts` (beide Kinder-Eingaben),
`lib/tax/sozialabgaben.ts` (`pflegesatzArbeitnehmer`).

### P1 — Änderbarer Zusatzbeitrag wird im Szenario ignoriert

Reproduktion: 60.000 € Jahresbrutto, 2027 wählen, Zusatzbeitrag auf 4,5 % setzen.
Beobachtung: Feld zeigt 4,5 %, die KV-Abzüge rechnen weiterhin mit 9,05 %
Arbeitnehmeranteil, also mit dem festen Szenario-Zusatzbeitrag von 3,5 %.
Jahresnetto bleibt bei 37.382 €.

Empfehlung: Entweder persönliche Eingabe tatsächlich anwenden oder im Szenario
klar als feste Annahme anzeigen. Eine explizite Wahl „Szenarioannahme / eigener
Kassenbeitrag“ wäre verständlich. Aktive Eingaben dürfen nicht still wirkungslos sein.

Code: `components/rechner/EingabePanel.tsx`,
`lib/tax/rechner.ts`, `lib/tax/sozialabgaben.ts` (`svUeberschreibungen`).

### P1 — PKV zeigt fertiges Netto ohne Beitrag und kann festhängen

Reproduktion: 100.000 € Jahresbrutto, Krankenversicherung „Privat“, Beitrag leer.
Beobachtung: Ein fertiges Netto erscheint mit 0 € Kranken-/Pflegebeitrag.
Dann Gehalt auf 60.000 € senken: „Privat“ bleibt ausgewählt, aber das gesamte
Auswahlfeld ist deaktiviert. Ein direkter Rückwechsel zu „Gesetzlich“ ist unmöglich.

Empfehlung: Fehlenden PKV-Beitrag direkt am Feld kennzeichnen und das Ergebnis
als unvollständig behandeln. Den Wechsel zurück zur GKV nicht blockieren.
Bestehende PKV und Prüfung eines möglichen Wechsels müssen unterscheidbar bleiben.

Code: `components/rechner/EingabePanel.tsx` (PKV-Auswahl und Beitrag),
`components/rechner/useRechner.ts` (`pkvMoeglich`).

## Fachlicher Befund außerhalb reiner UI-Gestaltung

### P1 — Einmalzahlung erhöht die Sozialabgaben nicht

Reproduktion: 60.000 € Jahresbrutto, 2026, Steuerklasse I, Berlin, kinderlos;
zusätzlich 12.000 € unter „Einmalzahlung im Jahr“ eintragen.
Beobachtung: Gesamtbrutto steigt auf 72.000 €, Lohnsteuer auf Einmalzahlung
erscheint mit 3.503 €. Arbeitnehmer-SV bleibt bei 13.050 € und Arbeitgeber-SV
bei 12.690 €, unverändert gegenüber dem Fall ohne Bonus. Jahresnetto: 46.058 €.

Der Code übergibt an `berechneSozialabgaben` nur den laufenden Bruttolohn.
Die gesetzliche Grundlage für beitragspflichtige Einmalzahlungen ist
[§ 23a SGB IV](https://www.gesetze-im-internet.de/sgb_4/__23a.html), insbesondere
Absatz 3. Zeitpunkt und anteilige Beitragsbemessungsgrenze sind dabei relevant.
Diese Regelung wird durch das einfache Jahresfeld nicht vollständig erfasst.

Empfehlung: Beitragspflicht korrekt modellieren und unabhängig belegen/testen;
bis dahin die fehlende Modellierung bei der Einmalzahlung ausdrücklich nennen.
Ein Tooltip darf diesen Effekt nicht als vollständige Nettoberechnung darstellen.

## UI-Verbesserungen nach den Eingabefehlern

### P2 — Ergebnis auf dem Smartphone früher zugänglich machen

Bei 390 × 844 px beginnt der Ergebnisblock im Standardfall erst etwa
1.168 CSS-Pixel unter dem Seitenanfang. Der vorhandene Link mit dem Monatsnetto
sitzt am Ende des Formulars und ist im ersten Bildschirm ebenfalls nicht sichtbar.

Empfehlung: Nach der ersten gültigen Eingabe eine kompakte, gut sichtbare
Nettoleiste am unteren Bildschirmrand mit „Zum Ergebnis“ anbieten. Das mobile
Kopfstück kürzen. Keine zweite vertikale Scrollfläche einführen.

### P2 — Touchflächen, Beschriftungen und Kontraste verbessern

Gemessene Plus-/Minus-Schaltflächen bei Alter: 34 × 16 px; Info-Schalter: 18 × 18 px.
Mehrere Eingaben haben nur einen sichtbaren Text, aber kein zugeordnetes Label:
Bundesland, Krankenversicherung, PKV-Beitrag, Einmalzahlung, ELStAM-Freibetrag.
Die wiederholten Info-Schalter heißen alle nur „Erklärung anzeigen“.
Quellen und Hilfstexte sind auf den Screenshots sehr dunkel und klein.

Empfehlung: Größere, möglichst etwa 44 × 44 px große Touchflächen, eindeutige
Labels mit `htmlFor`/`id` und thematische Namen für Info-Schalter. Hilfstexte
heller und etwas größer darstellen. Datenschutz-Popover auch mit Escape schließen
(im Test blieb es nach Escape offen).

### P2 — Teilzeitbezug und Stundenangabe klar halten

Nach 80 % Arbeitszeit zeigt die Eingabe korrekt 32 h, die Kennzahl
„Netto je Stunde“ trägt weiter den Text „bei 40 h/Woche“. Die Zahl selbst
wird mit den reduzierten Stunden berechnet. Die anschließende Teilzeitanalyse
setzt die bereits reduzierte Eingabe erneut als 100 % an, ohne diesen Bezug
in der Überschrift deutlich zu machen.

Empfehlung: Aktuelle Stunden an der Kennzahl anzeigen; Ausgangslage und simulierte
Arbeitszeit in der Analyse explizit benennen.

Code: `components/rechner/ErgebnisPanel.tsx` (Kennzahl),
`components/rechner/Analysen.tsx` (Teilzeit).

### P2 — Eingaben beim Besuch der FAQ erhalten

Reproduktion: Gehalt/Szenario eingeben → FAQ → Browser-Zurück.
Beobachtung: Gehaltsfeld leer, Rechtsstand wieder 2026.

Empfehlung: Zustand innerhalb der laufenden Anwendung über Seitenwechsel erhalten,
ohne Gehaltsdaten an einen Server zu senden. Kein Login erforderlich.

### P3 — Analysen kompakter und zielgerichteter anbieten

Der mobile Standardfall umfasst ungefähr 8.040 CSS-Pixel Seitenhöhe. Teilzeittabelle
440 px breit in einem 317-px-Container; Paartabelle 400 px breit. Rechte Spalten sind
nur nach horizontalem Scrollen sichtbar. Die Teilzeitgrafik kombiniert zwei Skalen;
die rechte Größe „Netto je Wochenstunde / Monat“ ist schwerer verständlich als der
bereits vorhandene Netto-Stundenlohn. Gerundete Achsenlabels wiederholen sich teils
(z. B. zweimal „2k“).

Empfehlung: Navigation „Ergebnis / Teilzeit / Mehr Gehalt / Vergleich“ als Sprunglinks
oder Ansichten; Detailtabellen auf Mobilgeräten als Vergleichskarten oder mit klar
sichtbarem Scrollhinweis. Einen verständlichen Stundenlohnbegriff konsistent verwenden.

Bei 320 px Breite wurde ein kleiner horizontaler Seitenüberlauf gemessen
(323 px Dokumentbreite). Engste Breite beim Umbau gezielt nachprüfen.

## Empfohlene Reihenfolge

1. Zahlenparser, getrennte Kinderangaben, Szenario-Zusatzbeitrag und PKV-Zustände.
2. Einmalzahlungsberechnung fachlich korrigieren und mit Referenzfällen absichern.
3. Mobile Nettoleiste, größere Touchflächen und vollständige Labels.
4. Teilzeitbeschriftung, Erhalt der Eingaben und kompaktere Analysen.
