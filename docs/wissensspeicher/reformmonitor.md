# Reformmonitor

Stand der steuer-, abgaben- und sozialpolitischen Vorhaben, die den Rechner
betreffen.

**Stand dieser Datei: 27.07.2026**

**Für Recherche-Agenten:** Prüfe zuerst, ob ein Vorhaben seinen Status
gewechselt hat. Ein Referentenentwurf, der Gesetz geworden ist, muss von
`referentenentwurf` auf `verkuendet` bzw. `geltendes_recht` hochgestuft und
mit den tatsächlich verkündeten Zahlen ersetzt werden.

Statusdefinitionen: siehe `lib/tax/parameter/typen.ts`.

---

## A — Geltendes Recht 2026

Im Rechner vollständig abgebildet.

| Vorhaben | Inhalt | Fundstelle |
|---|---|---|
| Einkommensteuertarif 2026 | Grundfreibetrag 12.348 €, Eckwerte 17.799 / 69.878 / 277.825 € | § 32a EStG ab VZ 2026 |
| Solidaritätszuschlag | Freigrenze 20.350 € Jahreslohnsteuer | SolzG; BVerfG 26.03.2025, 2 BvR 1505/20: verfassungsgemäß |
| Rechengrößen 2026 | BBG 101.400 € / 69.750 €, JAEG 77.400 € | SVBezGrV 2026, in Kraft seit 01.01.2026 |
| Beitragssätze | RV 18,6 %, AV 2,6 %, KV 14,6 % + 2,9 %, PV 3,6 % | SGB VI/III/V/XI, BMG-Bekanntmachung |
| Aktivrente | bis 2.000 €/Monat steuerfrei bei Weiterarbeit nach der Regelaltersgrenze | Aktivrentengesetz, Bundesrat 19.12.2025, in Kraft seit 01.01.2026 |
| Pendlerpauschale | einheitlich 38 ct ab dem ersten Kilometer | Steueränderungsgesetz 2025, Bundesrat 19.12.2025 |
| Mindestlohn | 13,90 € | Fünfte Mindestlohnanpassungsverordnung |
| Rentenniveau | Haltelinie 48 % bis einschließlich der Anpassung zum 01.07.2031 | Rentenpaket 2025 |

**Nicht abgebildet, obwohl geltendes Recht:** Die Aktivrente ist ein
Steuerfreibetrag für eine besondere Personengruppe und im Rechner nicht
vorgesehen. Wer sie ergänzen will: Der PAP kennt dafür keinen Merker; sie wäre
über einen Freibetrag abzubilden. Vorher fachlich prüfen.

---

## B — Veröffentlichte Entwürfe

Im Rechner als Szenario `2027-entwurf` abgebildet, gekennzeichnet als
`referentenentwurf`.

### Pflegeneuordnungsgesetz (PNOG)

| | |
|---|---|
| **Stand** | Referentenentwurf BMG vom 04.06.2026 |
| **Vorgeschichte** | Bund-Länder-Arbeitsgruppe „Zukunftspakt Pflege", Ergebnisse am 11.12.2025 |
| **Für den Rechner relevant** | Zuschlag für Kinderlose steigt von 0,6 auf 0,7 Beitragssatzpunkte; Anhebung der Beitragsbemessungsgrenze; Pauschalbeitrag für Minijobs geplant |
| **Zu beobachten** | Kabinettsbeschluss, Bundestag, Bundesrat. Bei Verkündung Status hochstufen und `pvZuschlagKinderlose` in `SV_2027` festschreiben |

### GKV-Beitragssatzstabilisierungsgesetz

| | |
|---|---|
| **Stand** | Kabinettsentwurf |
| **Hintergrund** | BMG beziffert die strukturelle Finanzierungslücke 2027 auf bis zu 15 Mrd. €, entsprechend rund 0,75 Beitragssatzpunkten. Das IGES-Institut rechnet mit 11,8 Mrd. € ungedecktem Bedarf, entsprechend rund 0,6 Punkten |
| **Für den Rechner relevant** | Höhe des durchschnittlichen Zusatzbeitrags ab 2027 |
| **Zu beobachten** | Die maßgebliche Zahl kommt nicht aus diesem Gesetz, sondern aus der BMG-Bekanntmachung nach § 242a SGB V im November 2026 |

---

## C — Politische Ankündigungen

**Nicht im Rechner abgebildet.** Unter `nichtModelliert` benannt.

### Einkommensteuerreform 2027

| | |
|---|---|
| **Stand** | Politische Einigung im Koalitionsausschuss am 01.07.2026. **Kein Referentenentwurf** |
| **Volumen** | rund 10 Mrd. € Entlastung pro Jahr |
| **Geplant** | Anhebung von Grundfreibetrag, Kinderfreibetrag, Kindergeld und Arbeitnehmer-Pauschbetrag; Abflachung der zweiten Progressionszone mit Rechtsverschiebung des Spitzensteuersatz-Eckwerts |
| **Gegenrichtung** | Reichensteuersatz 45 % bereits ab 250.000 € statt 277.826 €; neue Stufe 47 % ab 280.000 €; Minijob-Pauschsteuer von 2 % auf 5 % |
| **Geplantes Inkrafttreten** | 01.01.2027 |

**Warum nicht abgebildet:** Beschlossen sind Richtung und Volumen, nicht die
Beträge. In Sekundärquellen kursieren Zahlen — etwa ein Grundfreibetrag von
12.900 € bis 2028 in zwei Stufen und ein Kinderfreibetrag von 5.123 €. Beide
ließen sich nicht gegen eine Primärquelle absichern, und die zweite passt nicht
zur heutigen Systematik von Kinderfreibetrag plus BEA-Freibetrag.

**Auswirkung auf die Szenarien:** Die 2027er und späteren Szenarien zeigen die
Belastung deshalb **zu hoch**. Das steht so in `nichtModelliert` und wird in der
Oberfläche angezeigt.

**Was zu tun ist, sobald der Referentenentwurf vorliegt:** Neuen Rechtsstand
`2027` mit `rechtsstatus: 'referentenentwurf'` anlegen. Da die Tarifänderung im
PAP steckt, ist ein eigener generierter Rechenkern nötig — der PAP 2027
erscheint aber erst im November 2026. Bis dahin ist die Tarifseite nicht
seriös abbildbar. Der `steuerfaktor` ist dafür **kein** Ersatz: Er kann keine
Entlastung im unteren und Belastung im oberen Bereich gleichzeitig darstellen.

### Erhöhung des Beitrags zur Arbeitslosenversicherung

| | |
|---|---|
| **Stand** | Öffentliche Äußerung der BA-Vorstandsvorsitzenden, Juli 2026 |
| **Hintergrund** | Defizit der Bundesagentur für Arbeit von rund 10 Mrd. € im Jahr 2026 |
| **Optionen** | zinsloses Darlehen des Bundes, Bundeszuschuss oder Beitragserhöhung. 0,1 Punkte entsprächen rund 1,6 Mrd. € Mehreinnahmen |
| **Bewertung** | Die BA strebt eine Erhöhung ausdrücklich nicht an. Nicht als wahrscheinlich behandeln |

### Abschaffung der Steuerklassen III und V

| | |
|---|---|
| **Stand** | **Nicht in Umsetzung** |
| **Historie** | Das Steuerfortentwicklungsgesetz sah eine Überführung zum 01.01.2030 vor. Nach dem Bruch der Ampelkoalition wurde die Regelung gestrichen |
| **Aktuell** | Die Koalition aus CDU/CSU und SPD setzt die Reform nicht um |

Frühere Fassungen der FAQ behaupteten, das Faktorverfahren werde „seit 2026
stärker gefördert". Das war unbelegt und sachlich überholt.

---

## D — Amtliche Vorausberechnungen

Im Rechner als Szenarien 2030, 2035 und 2039 abgebildet, gekennzeichnet als
`amtliche_projektion`.

### Rentenversicherungsbericht 2025, Übersicht B 2.1

Beitragssatz der allgemeinen Rentenversicherung, mittlere Variante mit Spanne
über alle neun Modellvarianten:

| Jahr | mittlere Variante | Spanne |
|---:|---:|---|
| 2026 | 18,6 % | 18,6 % |
| 2027 | **18,6 %** | 18,6–19,0 % |
| 2028 | 19,8 % | 19,0–20,2 % |
| 2029 | 20,0 % | 19,8–20,2 % |
| 2030 | 20,1 % | 19,8–20,4 % |
| 2035 | 21,0 % | 20,6–21,4 % |
| 2039 | 21,2 % | 20,7–21,6 % |

Sicherungsniveau vor Steuern: bis 2031 durch die Haltelinie bei 48 %, danach
sinkend auf voraussichtlich 46,3 % im Jahr 2039.

**Häufiger Fehler in Sekundärquellen:** „Der Rentenbeitrag steigt 2027 auf
18,8 %." Das ist die untere Lohnvariante 2. In der mittleren und in der oberen
Lohnvariante bleibt es 2027 bei 18,6 %.

Für Kranken- und Pflegeversicherung gibt es keine vergleichbare amtliche
Langfristvorausberechnung. Die Werte in den Szenarien sind Fortschreibungen und
als `eigene_annahme` gekennzeichnet.

---

## Wie dieser Monitor gepflegt wird

1. Status jedes Vorhabens prüfen — Ministeriumsseite, DIP, Bundesrat,
   Bundesgesetzblatt.
2. Bei Statuswechsel: `lib/tax/parameter/rechtsstaende.ts` anpassen,
   `rechtsstatus` hochstufen, angenommene durch verkündete Zahlen ersetzen.
3. Ist ein Punkt aus `nichtModelliert` abbildbar geworden, umsetzen und dort
   streichen.
4. Diese Datei mit neuem Stand versehen.

**Nicht tun:** Ein Vorhaben in den Rechner aufnehmen, weil es politisch
wahrscheinlich erscheint. Der Rechner bildet Rechtslagen ab, keine
Erwartungen an den Gesetzgeber.
