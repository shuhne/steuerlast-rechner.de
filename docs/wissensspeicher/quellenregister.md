# Quellenregister

Alle Primärquellen des Projekts: was sie regeln, wo sie liegen, wann sie sich
ändern und welche Datei im Code davon abhängt.

**Für Recherche-Agenten:** Dies ist die erste Anlaufstelle. Bevor du eine Zahl
suchst, sieh hier nach, ob die Quelle schon bekannt ist. Wenn du eine neue
Quelle findest, trage sie hier ein.

**Grundregel:** Sekundärquellen (Steuerberater-Blogs, Lohnabrechnungs-Anbieter,
Vergleichsportale) taugen zum Auffinden, nie zum Belegen. Sie sind häufig
ungenau und geben regelmäßig Modellvarianten als Punktprognosen wieder. Ein
Beispiel aus der Praxis: Für den Rentenbeitragssatz 2027 kursierte in mehreren
Fachmedien „18,8 %". Das ist die untere Lohnvariante 2 des
Rentenversicherungsberichts; in der mittleren und oberen Variante bleibt es bei
18,6 %.

---

## 1. Lohnsteuer

### Programmablaufplan (PAP) — der Rechenkern selbst

| | |
|---|---|
| **Herausgeber** | Bundesministerium der Finanzen |
| **Was** | Der vollständige Berechnungsalgorithmus für Lohnsteuer, Solidaritätszuschlag und die Bemessungsgrundlage der Kirchensteuer |
| **Wo** | <https://www.bmf-steuerrechner.de/interface/pseudocodes.xhtml> → `Lohnsteuer<JAHR>.xml` |
| **Auch** | <https://www.bundesfinanzministerium.de/Web/DE/Themen/Steuern/Steuerarten/Lohnsteuer/Programmablaufplan/programmablaufplan.html> (BMF-Schreiben mit Anlagen als PDF) |
| **Turnus** | jährlich, veröffentlicht Anfang bis Mitte November für das Folgejahr. Unterjährige Neufassungen kommen vor, wenn ein Gesetz rückwirkend ändert |
| **Wirkt auf** | `tools/lohnsteuer/Lohnsteuer<JAHR>.xml` → `lib/tax/generated/` |
| **Prüfung** | Die Anlage 1 des BMF-Schreibens enthält auf den letzten beiden Seiten zwei Prüftabellen. Diese sind die Testreferenz |

Die XML-Datei ist die maschinenlesbare Fassung desselben Ablaufplans, den das
PDF grafisch darstellt. Immer die XML verwenden — das PDF nur zum Nachlesen und
für die Prüftabellen.

Der Direktlink zur XML folgt dem Muster
`https://www.bmf-steuerrechner.de/javax.faces.resource/daten/xmls/Lohnsteuer<JAHR>.xml.xhtml`,
kann sich aber ändern. Maßgeblich ist die oben verlinkte Übersichtsseite.

### Einkommensteuertarif

| | |
|---|---|
| **Was** | § 32a EStG — Tarifformel und Eckwerte |
| **Wo** | <https://www.gesetze-im-internet.de/estg/__32a.html> |
| **Auch** | Amtliches Lohnsteuer-Handbuch: <https://esth.bundesfinanzministerium.de/lsth/2026/> |
| **Turnus** | bei Gesetzesänderung, meist im Jahressteuergesetz oder einem eigenen Tarifgesetz |
| **Wirkt auf** | ist bereits im PAP enthalten; dient dem Gegenlesen |

Fassung ab VZ 2026: Grundfreibetrag 12.348 €, Zonengrenzen 17.799 / 69.878 /
277.825 €, Koeffizienten 914,51 / 173,10 / 1.034,87 / 11.135,63 / 19.470,38.

### Solidaritätszuschlag

| | |
|---|---|
| **Was** | SolzG 1995, insbesondere § 3 (Freigrenze, Milderungszone) |
| **Wo** | <https://www.gesetze-im-internet.de/solzg_1995/> |
| **Stand** | Freigrenze 2026: 20.350 € Jahreslohnsteuer, Milderungszone 11,9 %, Satz 5,5 % |
| **Rechtsprechung** | BVerfG, Urteil vom 26.03.2025, 2 BvR 1505/20: Erhebung verfassungsgemäß. Das Gericht verpflichtet den Gesetzgeber jedoch, den Fortbestand des Mehrbedarfs regelmäßig zu überprüfen |

### Historische Tarife

| | |
|---|---|
| **Was** | Alle Einkommensteuertarife seit 1958 mit Formeln |
| **Wo** | <https://www.bmf-steuerrechner.de/javax.faces.resource/2025_10_14_Tarifhistorie_Steuerrechner.pdf.xhtml> |
| **Turnus** | wird jährlich um den neuen Tarif ergänzt |
| **Wirkt auf** | `lib/tax/historisch/jahr1958.ts` |

---

## 2. Sozialversicherung

### Rechengrößen

| | |
|---|---|
| **Was** | Beitragsbemessungsgrenzen, Jahresarbeitsentgeltgrenze, Durchschnittsentgelt, Bezugsgröße |
| **Wo** | Sozialversicherungsrechengrößen-Verordnung, z. B. <https://www.gesetze-im-internet.de/svbezgrv_2026/> |
| **Turnus** | jährlich. Kabinettsbeschluss Anfang Oktober, Bundesrat November, Verkündung Ende November, Inkrafttreten 1. Januar |
| **Wirkt auf** | `lib/tax/parameter/sozialversicherung.ts` |

Die Werte stehen ab dem Kabinettsbeschluss faktisch fest, sind aber erst mit der
Verkündung geltendes Recht. Bis dahin `rechtsstatus: 'regierungsentwurf'`.

**Entwurf 2027 (abgerufen 22.09.2026):**
[BMAS-Tabelle vom 21.09.2026](https://www.bmas.de/DE/Service/Presse/Meldungen/2026/referentenentwurf-zur-sozialversicherungsrechengroessen-verordnung-2027.html).
RV/AV-BBG 106.200 €, KV-BBG 76.500 €, allgemeine JAEG 84.150 €,
vorläufiges Durchschnittsentgelt 53.452 €. Status `referentenentwurf`.
Die KV-Sonderanhebung ist in diesem Wert bereits enthalten.

Die getrennte Pflegegrenze im 2027-Szenario folgt dem
[PNOG-Referentenentwurf, Fassung 05.06.2026, Art. 1 Nr. 48 b, S. 46](https://www.bundesgesundheitsministerium.de/fileadmin/Dateien/3_Downloads/Gesetze_und_Verordnungen/GuV/P/RefE-Pflegeneuordnungsgesetz_PNOG.pdf):
Verweis auf § 6 Abs. 6 SGB V statt Abs. 7; mit dem BMAS-Entwurfswert
hergeleitet als 84.150 €. Beide Entwürfe sind noch nicht geltendes Recht.

### Beitragssätze

| Zweig | Fundstelle | Wer legt fest |
|---|---|---|
| Rentenversicherung | § 158 SGB VI, Beitragssatzverordnung | Bundesregierung, jährlich im Herbst |
| Arbeitslosenversicherung | § 341 SGB III | Gesetzgeber bzw. Verordnung |
| Krankenversicherung, allgemeiner Satz | § 241 SGB V | Gesetzgeber, seit 2015 unverändert 14,6 % |
| Krankenversicherung, Zusatzbeitrag | § 242a SGB V | BMG, Bekanntmachung Anfang November für das Folgejahr |
| Pflegeversicherung | § 55 SGB XI | Gesetzgeber |

Überblickstabelle 1970 bis heute:
<https://www.sozialpolitik-aktuell.de/files/sozialpolitik-aktuell/_Politikfelder/Finanzierung/Datensammlung/PDF-Dateien/tabII6.pdf>

**Wichtige Unterscheidung beim Zusatzbeitrag:** Der nach § 242a SGB V
bekanntgegebene *durchschnittliche* Zusatzbeitragssatz ist ein rechnerischer
Wert (2026: 2,9 %). Der tatsächlich von den Kassen gewichtet erhobene Satz liegt
regelmäßig darüber (Januar 2026: rund 3,1 %). Der PAP verwendet den
rechnerischen Wert, der Rechner lässt den eigenen Kassensatz eingeben.

### Übergangsbereich und Geringfügigkeit

| | |
|---|---|
| **Was** | Geringfügigkeitsgrenze, obere Grenze des Übergangsbereichs, Faktor F |
| **Fundstelle** | § 8 und § 20 Abs. 2a SGB IV |
| **Wo** | BMAS-Bekanntmachung des Faktors F, jährlich |
| **Stand 2026** | Geringfügigkeitsgrenze 603 € (dynamisch: Mindestlohn × 130 / 3, aufgerundet), Obergrenze 2.000 €, Faktor F = 0,6619 |

Faktor F lässt sich gegenrechnen: 28 % geteilt durch den
Gesamtsozialversicherungsbeitragssatz. 2026: 0,28 / 0,423 = 0,6619.

### Historische Werte

| Was | Quelle |
|---|---|
| RV-Beitragssätze ab 1957 | <https://www.bundesamtsozialesicherung.de/fileadmin/redaktion/Rentenversicherung/Beitraege/Beitragssaetze_ab_1957.pdf> |
| RV-Beitragsbemessungsgrenzen ab 1891 | Anlage 2 SGB VI: <https://www.gesetze-im-internet.de/sgb_6/anlage_2.html> |
| Durchschnittsentgelte ab 1891 | Anlage 1 SGB VI |
| Zeitreihen der Rentenversicherung | Deutsche Rentenversicherung, „Rentenversicherung in Zeitreihen" |

---

## 3. Vorausberechnungen und Reformvorhaben

### Rentenversicherungsbericht

| | |
|---|---|
| **Was** | Beitragssatz und Sicherungsniveau bis zum Ende des Vorausberechnungszeitraums, in neun Modellvarianten |
| **Wo** | Bundestagsdrucksache, zuletzt BT-Drs. 21/3080: <https://dserver.bundestag.de/btd/21/030/2103080.pdf> |
| **Auch** | <https://sozialbeirat.de/media/rvb_2025.pdf> |
| **Turnus** | jährlich, Kabinettsbeschluss im November |
| **Wirkt auf** | `lib/tax/parameter/rechtsstaende.ts` |

Die maßgebliche Tabelle ist **Übersicht B 2.1** (Beitragssätze). Immer die
mittlere Variante als Zentralwert und die Spanne über alle neun Varianten
angeben — nie eine einzelne Variante als „die Prognose" darstellen.

### Gesetzgebungsverfahren verfolgen

| Stadium | Wo nachsehen |
|---|---|
| Referentenentwurf | Website des zuständigen Ministeriums (BMF, BMAS, BMG), Rubrik „Gesetze und Verordnungen" |
| Regierungsentwurf | Dokumentations- und Informationssystem des Bundestags: <https://dip.bundestag.de/> |
| Bundesrat | <https://www.bundesrat.de/> |
| Verkündung | Bundesgesetzblatt: <https://www.recht.bund.de/> |

Für den `rechtsstatus` gilt: erst ab Verkündung `verkuendet`, ab
Inkrafttreten `geltendes_recht`.

---

## 4. Statistik

### Verdienste

| | |
|---|---|
| **Was** | Median, Mittelwert, Dezile, Ost/West |
| **Wo** | Statistisches Bundesamt, Verdiensterhebung. Jährliche Pressemitteilung im April |
| **Zuletzt** | <https://www.destatis.de/DE/Presse/Pressemitteilungen/2026/04/PD26_113_621.html> |
| **Wirkt auf** | `lib/statistik/verdienste.ts` |

Werte 2025 (Vollzeit, mindestens sieben Arbeitsmonate, einschließlich
Sonderzahlungen): P10 33.828 €, P30 44.215 €, Median 54.066 €, P90 100.719 €,
Top 1 % 219.110 €, Mittelwert 64.441 €, West 55.435 €, Ost ohne Berlin 46.013 €.

**Nicht verwenden:** Gehaltsreports von Jobbörsen. Sie beruhen auf
selbstselektierten Stichproben. Der frühere Anker dieses Projekts lag dadurch
rund 15 % unter dem amtlichen Median.

**Offen:** Eine amtliche Gliederung nach Altersgruppen wurde bisher nicht
gefunden. Das Altersprofil in `verdienste.ts` ist deshalb als Modellannahme
gekennzeichnet. Wer eine belastbare Quelle findet: eintragen und
`belastbarkeit` hochstufen.

### Preise

| | |
|---|---|
| **Was** | Verbraucherpreisindex, Jahresteuerungsraten |
| **Wo** | Statistisches Bundesamt, Genesis-Tabelle 61111 |
| **Turnus** | Jahreswert im Januar des Folgejahres |
| **Wirkt auf** | `lib/statistik/kaufkraft.ts` |

### Historische Kaufkraft

| | |
|---|---|
| **Was** | Kaufkraftäquivalente von Gulden, Taler, Mark, Reichsmark und D-Mark |
| **Wo** | <https://www.bundesbank.de/de/statistiken/konjunktur-und-preise/-/kaufkraftaequivalente-historischer-betraege-in-deutschen-waehrungen-615162> |
| **Turnus** | jährlich, Stand jeweils Januar |
| **Wirkt auf** | `lib/tax/historisch/jahr1958.ts` |

**Achtung Bezugsjahr:** Die Tabelle drückt alles in Euro *im Durchschnitt eines
bestimmten Jahres* aus. Die Fassung mit Stand Januar 2026 bezieht sich auf den
Durchschnitt **2025**, nicht 2026. Beim Aktualisieren prüfen, ob sich das
Bezugsjahr verschoben hat, und den Hinweis im Parameter anpassen.

### Mindestlohn

| | |
|---|---|
| **Wo** | Mindestlohnanpassungsverordnung, BMAS |
| **Turnus** | Empfehlung der Mindestlohnkommission alle zwei Jahre, Umsetzung per Verordnung |
| **Stand** | 13,90 € ab 01.01.2026, 14,60 € ab 01.01.2027 (Fünfte MiLoAV) |

Der Mindestlohn wirkt mittelbar auf die Geringfügigkeitsgrenze.

---

## 5. Kirchensteuer

| | |
|---|---|
| **Was** | Hebesatz und Kappung |
| **Wo** | Kirchensteuergesetze der Länder, Beschlüsse der Landeskirchen und Bistümer |
| **Stand** | 8 % in Bayern und Baden-Württemberg, 9 % übrige Länder |

**Bewusst nicht fest verdrahtet:** Die Kappungssätze liegen je nach Land und
Konfession zwischen etwa 2,75 % und 4 %; in Bayern gibt es keine Kappung. Eine
belastbare, konfessionsscharfe Gesamtübersicht aus einer Primärquelle wurde
nicht gefunden. Hinzu kommt, dass die Kappung in den meisten Ländern nur auf
Antrag im Rahmen der Veranlagung wirkt, nicht beim laufenden Lohnsteuerabzug —
und genau den bildet der Rechner ab.

Wer eine belastbare Übersicht findet: in `lib/tax/parameter/kirchensteuer.ts`
eintragen und die Begründung dort anpassen.
