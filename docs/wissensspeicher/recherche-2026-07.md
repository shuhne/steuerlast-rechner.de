# Rechercheprotokoll Juli 2026

Belege und Herleitungen aus der fachlichen Überarbeitung. Zweck: Wer später
einen Wert anzweifelt, findet hier, woher er kommt und wie sicher er ist.

**Stand: 27.07.2026**

---

## 1. Der Befund, der die Überarbeitung ausgelöst hat

`lib/tax/Lohnsteuer2026.ts` war nicht der amtliche Programmablaufplan 2026,
sondern der **PAP 2023** (Kopfzeile `Stand: 2023-11-16`), der per Regex-Skript
`scripts/patch_lohnsteuer2026.ts` „auf 2026 gepatcht" wurde.

Drei von vier Tarifzonen-Ersetzungen griffen nicht, weil sie auf Variablennamen
zielten, die im Zieltext anders lauteten (`this.Z` statt `this.Y`). Das Skript
hatte keine Fehlerbehandlung und meldete „Finished updating".

| Tarifzone | amtlich 2026 | im Code (= VZ 2023) |
|---|---|---|
| Zone 2 | `(914,51·y + 1400)·y` | identisch |
| Zone 3 | `(173,10·z + 2397)·z + 1034,87` | `(192,59·z + 2397)·z + 966,53` |
| Zone 4 | `0,42·x − 11.135,63` | `0,42·x − 9.972,98` |
| Zone 5 | `0,45·x − 19.470,38` | `0,45·x − 18.307,73` |

Weitere abweichende PAP-Parameter:

| Parameter | amtlich | im Code |
|---|---|---|
| `SOLZFREI` | 20.350 | 18.149 (im Patch-Skript ohne Quelle als „2026 limit" kommentiert) |
| `W1STKL5` | 14.071 | 13.926 |
| `W2STKL5` | 34.939 | 31.404 |
| `PVSATZAN` | 0,018 (SN 0,023) | 0,01525 (SN 0,02025) |
| Zuschlag Kinderlose | +0,006 | +0,0035 |
| `PVA` | vorhanden | Merker existierte nicht |

Gemessen gegen die amtliche Prüftabelle, Steuerklasse I:

| Jahresbrutto | amtlich | vorher | Abweichung |
|---:|---:|---:|---:|
| 50.000 € | 6.788 € | 6.898 € | +110 € |
| 60.000 € | 9.389 € | 9.604 € | +215 € |
| 80.000 € | 15.694 € | 16.202 € | +508 € |
| 100.000 € | 23.248 € | 24.577 € | +1.329 € |

Beim Solidaritätszuschlag zusätzlich bis 420 € pro Jahr. Bei 100.000 € Brutto
fehlten rund 146 € netto im Monat. Der Fehler war auch auf der produktiven Seite
reproduzierbar.

**Warum es niemandem auffiel:** In `tax_calculator.ts` existierte eine zweite,
korrekte Implementierung von § 32a EStG, die im Produktivpfad nicht verwendet
wurde. Mehrere Tests prüften genau diese. Kein einziger Test verglich gegen eine
amtliche Referenz.

**Quelle:** BMF, Programmablaufpläne zur Lohnsteuer für/ab 2026, Schreiben vom
12.11.2025, Az. IV C 5 – S 2361/00025/016/028, Anlage 1.

---

## 2. Geklärte Rechercheposten

### Rentenbeitragssatz 2027

In mehreren Fachmedien kursierte „Anstieg auf 18,8 % zum 01.01.2027".

**Ergebnis: 18,6 %.** Der Rentenversicherungsbericht 2025 (BT-Drs. 21/3080,
Übersicht B 2.1) weist neun Modellvarianten aus. 18,8 % ist die untere
Lohnvariante 2. In der mittleren und in der oberen Lohnvariante bleibt es 2027
bei 18,6 %. Der Fließtext des Berichts ist eindeutig: „Im Jahr 2026 und 2027
beträgt der Beitragssatz weiterhin 18,6 %. Im Jahr 2028 muss der Beitragssatz
[…] erstmals wieder angehoben werden und steigt auf 19,8 %."

Vollständige Reihe der mittleren Variante: 2028 19,8 %, 2029 20,0 %,
2030 20,1 %, 2035 21,0 %, 2039 21,2 %.

**Konsequenz:** Die frühere Annahme von 22,5 % für 2035 lag oberhalb der
gesamten amtlichen Bandbreite von 20,6 bis 21,4 %.

### Arbeitslosenversicherung 1958

Der Repository-Wert lautete 1,0 % Gesamtbeitrag.

**Ergebnis: 2,0 %.** Im Zuge der Rentenreform wurde der Beitragssatz zum
01.04.1957 von 3 % auf 2 % gesenkt. Quelle: Bundesagentur für Arbeit, „Die
Geschichte der deutschen Arbeitsverwaltung". Der Arbeitnehmeranteil beträgt
damit 1,0 %, nicht 0,5 %.

### Krankenversicherung 1958

Der Repository-Wert lautete 6,5 % Gesamtbeitrag.

**Ergebnis: rund 8,0 %,** interpoliert zwischen den belegten Stützstellen
1957 (7,80 %) und 1960 (8,40 %). Ein exakter Jahreswert für 1958 wurde nicht
gefunden; der Wert ist als `interpoliert` gekennzeichnet.

### Beitragsbemessungsgrenzen 1958

**Rentenversicherung 9.000 DM — belegt.** Anlage 2 SGB VI führt für den
Zeitraum 01.01.1958 bis 31.12.1958 genau diesen Wert (1959: 9.600 DM,
1960: 10.200 DM).

**Krankenversicherung 6.750 DM — hergeleitet.** Ein direkter Beleg fehlt. Die
Herleitung als 75 % der Rentenversicherungs-Grenze lässt sich am belegten Wert
für 1960 prüfen: 7.650 DM entsprechen genau 75 % von 10.200 DM. Der
Repository-Wert war damit plausibel und bleibt, jetzt als `hergeleitet`
gekennzeichnet.

### Kaufkraftfaktor 1958

**2,86 — bestätigt.** Deutsche Bundesbank, „Kaufkraftäquivalente historischer
Beträge in deutschen Währungen", Stand Januar 2026.

**Wichtige Ergänzung:** Das Bezugsjahr ist der **Durchschnitt 2025**, nicht
2026. Die Oberfläche behauptete „1 DM 1958 entspricht ca. 2,86 € heute". Der
Hinweis steht jetzt im Parameter.

### Einkommensteuertarif 1958

**Bestätigt.** Die im Repository hinterlegten Formeln stimmen exakt mit der
BMF-Tarifhistorie überein: Grundfreibetrag 1.680 DM, Proportionalzone 20 % bis
8.009 DM, `1.264 + 272·Y + 2,9·Y²` bis 23.999 DM,
`6.358 + 382·Y + 1,572·Y² − 0,006·Y³` bis 110.039 DM, darüber `0,53·zvE − 11.281`.

### Quellenangabe des historischen Vergleichs

Die Dokumentation berief sich auf „Günter Striewe (Süddeutsche Zeitung, Mai
2026)", die Oberfläche schrieb „Entspricht den Striewe-Zahlen".

**Nicht verifizierbar.** Die zugehörige Seite ist ein privater politischer Blog
zu Tarifreformvorschlägen ohne einen Vergleich von 1958 mit heute; der einzige
Verweis auf die Süddeutsche Zeitung dort stammt von 2016. Die Angabe wurde
entfernt und durch nachprüfbare Primärquellen je Parameter ersetzt.

### Steuerreform 2027

**Politische Einigung, kein Referentenentwurf.** Koalitionsausschuss vom
01.07.2026: rund 10 Mrd. € Entlastung durch höheren Grundfreibetrag, höheren
Kinderfreibetrag, höheres Kindergeld, höheren Arbeitnehmer-Pauschbetrag und
Abflachung der zweiten Progressionszone. Gegenfinanzierung unter anderem durch
den Reichensteuersatz von 45 % bereits ab 250.000 €, eine neue Stufe von 47 %
ab 280.000 € und die Anhebung der Minijob-Pauschsteuer von 2 % auf 5 %.

In Sekundärquellen kursieren Beträge (Grundfreibetrag 12.900 € bis 2028 in zwei
Stufen, Kinderfreibetrag 5.123 €). Beide ließen sich nicht gegen eine
Primärquelle absichern; die zweite passt nicht zur heutigen Systematik.

**Konsequenz:** nicht abgebildet, unter `nichtModelliert` benannt.

---

## 3. Weitere geprüfte Werte

| Wert | Ergebnis |
|---|---|
| Beitragsbemessungsgrenzen 2026 (101.400 / 69.750 €), JAEG 77.400 € | bestätigt, SVBezGrV 2026 |
| Durchschnittsentgelt 2026 vorläufig 51.944 € | bestätigt |
| Beitragssätze 2026 RV 18,6 / AV 2,6 / KV 14,6 / PV 3,6 % | bestätigt |
| Durchschnittlicher Zusatzbeitrag 2,9 % | bestätigt, BMG. Tatsächlich gewichtet Januar 2026 rund 3,1 % |
| Grundfreibetrag 12.348 €, Eckwerte 17.799 / 69.878 / 277.825 € | bestätigt, § 32a EStG ab VZ 2026 |
| Mindestlohn 13,90 € (2026), 14,60 € (2027) | bestätigt, Fünfte MiLoAV |
| Geringfügigkeitsgrenze 603 €, Übergangsbereich bis 2.000 €, Faktor F 0,6619 | bestätigt. F gegengerechnet: 0,28 / 0,423 = 0,6619 |
| Maximaler PKV-Arbeitgeberzuschuss 508,59 € (KV) + 104,63 € (PV), Sachsen 75,56 € | bestätigt |
| Destatis-Verdienste 2025: Median 54.066 €, P10 33.828 €, P90 100.719 €, Top 1 % 219.110 € | bestätigt, Pressemitteilung Nr. 113 vom April 2026 |
| Solidaritätszuschlag verfassungsgemäß | BVerfG, Urteil vom 26.03.2025, 2 BvR 1505/20 |
| Abschaffung der Steuerklassen III/V | nach dem Ampel-Bruch gestrichen, nicht in Umsetzung |

---

## 4. Weitere behobene Fehler

**PKV-Arbeitgeberzuschuss.** Die Oberfläche versprach „Der Arbeitgeberzuschuss
wird automatisch berücksichtigt". Der Code setzte den Beitrag in voller Höhe an,
ohne jeden Abzug — bis zu 7.358 € pro Jahr. Zusätzlich stand der PAP-Merker auf
`PKV = 1` (ohne Zuschuss) statt `PKV = 2`.

**Ehegattensplitting 1958.** Wurde auf die Steuerklassen 3, 4 **und** 5
angewandt, wodurch alle drei identische Ergebnisse lieferten. Die Veranlagungsart
ist jetzt ein eigenständiger Parameter.

**Grenzsteuersatz.** Berechnet als Grenz-Einkommensteuersatz auf ein
vereinfachtes zu versteuerndes Einkommen nach Grundtabelle — ohne Sozialabgaben,
ohne Splitting. Bei 60.000 € Brutto wurden 34 % ausgewiesen, die tatsächliche
Grenzbelastung lag bei rund 50 %.

**Solidaritätszuschlag in der Anzeige.** Fehlte in der Abzugsliste, war aber in
der Summe und im Diagramm enthalten. Die Einzelposten summierten sich nicht auf
das Diagramm.

**Expertenmodus ohne Wirkung.** `kv_add_rate` wurde vom Frontend nie
übertragen. Eine Änderung des Rentensatzes von 18,6 auf 25 % ließ das
ausgewiesene Netto unverändert.

**Kaufkraftdiagramm.** Für die Vergangenheit wurde mit der kumulierten Inflation
multipliziert, für die Zukunft dividiert. Beide Hälften beantworteten
verschiedene Fragen auf einer gemeinsamen Achse.

**Verdienstverteilung.** Anker war ein Jobbörsen-Report mit einem Median von
45.800 € gegenüber amtlich 54.066 €, dazu eine Lognormalverteilung mit einem
frei gesetzten Sigma von 0,5.

**Datenschutzaussage.** Vier Stellen versprachen „Berechnung im Browser" und
„keine Eingaben an unsere Server". Tatsächlich gingen pro Berechnung drei
POST-Requests mit Gehalt, Steuerklasse, Bundesland, Alter und Kinderzahl an den
Server.

**Übergangsbereich.** Nicht abgebildet, dadurch waren die Sozialabgaben für
Bruttoentgelte bis 24.000 € im Jahr zu hoch angesetzt.

---

## 5. Methodische Lehren

**Ein Regex-Skript, das Konstanten ersetzt, ist kein Migrationswerkzeug.** Es
meldet Erfolg auch dann, wenn die Hälfte der Muster nicht greift. Generieren
statt patchen, und der Generator bricht bei Unbekanntem ab.

**Selbstbezügliche Tests finden diese Fehlerklasse nicht.** Über 100 Tests
liefen grün, während der Rechenkern um bis zu 1.329 € pro Jahr danebenlag. Ein
einziger Test gegen die amtliche Prüftabelle hätte gereicht.

**Zwei Implementierungen derselben Formel sind eine Falle.** Die korrekte wurde
getestet, die falsche ausgeliefert.

**Sekundärquellen geben Modellvarianten als Punktprognosen wieder.** Beim
Rentenbeitragssatz 2027 führte das zu einer Zahl, die in der maßgeblichen
Variante gar nicht vorkommt.

**Eine Zusicherung in der Oberfläche ist ein Vertrag.** „Der Arbeitgeberzuschuss
wird automatisch berücksichtigt" und „keine Eingaben an unsere Server" waren
beide unzutreffend. Wer etwas verspricht, muss es testen.
