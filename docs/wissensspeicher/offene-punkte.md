# Offene Punkte

Was bewusst nicht abgebildet ist, was noch fehlt und was ungeklärt blieb.

**Stand: 27.07.2026**

Diese Liste ist Teil der fachlichen Transparenz. Wer einen Punkt löst: hier
streichen, im Code umsetzen, Quelle im [Quellenregister](quellenregister.md)
ergänzen.

---

## 1. Ungeklärte Rechercheposten

### Sonderausgaben-Höchstbeträge 1958

Der Rechner zieht die Sozialversicherungsbeiträge von 1958 in voller Höhe als
Sonderausgaben ab. Tatsächlich galten nach § 10 EStG 1958 Höchstbeträge. Deren
genaue Höhe ließ sich nicht aus einer Primärquelle belegen.

**Wirkung:** Das ausgewiesene Netto von 1958 ist tendenziell zu hoch, die
Steuer zu niedrig. Die Richtung des Fehlers steht fest, die Größe nicht.

**Wo zu suchen:** EStG in der Fassung von 1958, Bundesgesetzblatt 1958 Teil I.
Historische Gesetzessammlungen, nicht gesetze-im-internet.de — dort beginnen
die Fassungen später.

**Wo zu ändern:** `lib/tax/historisch/jahr1958.ts`, Konstante
`sonderausgabenDm` und die Berechnung von `zvEDm`. Der Punkt steht in
`NICHT_MODELLIERT` und wird in der Oberfläche angezeigt.

### Krankenversicherungsbeitrag 1958

Angesetzt sind 8,0 % Gesamtbeitrag, interpoliert zwischen den belegten
Stützstellen 1957 (7,80 %) und 1960 (8,40 %). Ein exakter Jahreswert für 1958
wurde nicht gefunden.

Markiert als `belastbarkeit: 'interpoliert'`.

**Wo zu suchen:** Statistisches Jahrbuch für die Bundesrepublik Deutschland
1959 oder 1960, Kapitel Sozialversicherung. Bundesarchiv.

### Beitragsbemessungsgrenze der Krankenversicherung 1958

Angesetzt sind 6.750 DM, hergeleitet als 75 % der Rentenversicherungs-Grenze
von 9.000 DM. Die Regel lässt sich am belegten Wert für 1960 prüfen: 7.650 DM
entsprechen genau 75 % von 10.200 DM. Ein direkter Beleg für 1958 fehlt.

Markiert als `belastbarkeit: 'hergeleitet'`.

### Altersprofil der Verdienste

`lib/statistik/verdienste.ts` enthält eine Alterskurve, die auf keiner amtlichen
Statistik beruht. Die Destatis-Pressemitteilung zur Verdiensterhebung gliedert
nicht nach Alter.

Markiert als `rechtsstatus: 'eigene_annahme'`, `belastbarkeit: 'geschaetzt'`.
Die Einordnung ohne Altersbezug beruht dagegen vollständig auf amtlichen
Quantilen und wird zusätzlich ausgewiesen.

**Wo zu suchen:** Destatis-Fachserie zur Verdiensterhebung, Genesis-Datenbank
Tabellen der Verdienststatistik.

### Kappungssätze der Kirchensteuer

Je nach Land und Konfession zwischen etwa 2,75 % und 4 %, in Bayern keine
Kappung. Eine belastbare konfessionsscharfe Gesamtübersicht wurde nicht
gefunden. Deshalb ist die Kappung ein optionales Eingabefeld statt fester
Landeswerte — auch weil sie in den meisten Ländern nur auf Antrag im Rahmen der
Veranlagung wirkt, nicht beim laufenden Lohnsteuerabzug.

---

## 2. Bewusst nicht abgebildet

| Was | Warum | Aufwand |
|---|---|---|
| Faktorverfahren (IV/IV mit Faktor) | Der PAP unterstützt es über `af` und `f`; die Ermittlung des Faktors selbst braucht beide Einkommen und eine Veranlagungssimulation | mittel |
| Betriebliche Altersvorsorge, Entgeltumwandlung | Eigene Beitragspflicht- und Steuerregeln, § 3 Nr. 63 EStG | mittel |
| Geldwerte Vorteile, Dienstwagen | 1-%-Regelung und Fahrtenbuch, eigener Themenblock | mittel |
| Versorgungsbezüge, Rentner | Der PAP kann es über `VBEZ`, `VBEZM`, `ZMVB`, `VJAHR`; nur die Oberfläche fehlt | gering |
| Kurzarbeitergeld, Progressionsvorbehalt | Betrifft die Veranlagung, nicht den laufenden Abzug | mittel |
| Mehrfachbeschäftigung | Erfordert die Verknüpfung mehrerer Arbeitsverhältnisse | hoch |
| Beamte, Selbständige, Künstlersozialkasse | Anderes Abgabensystem | hoch |
| Umlagen U1/U2/U3, Unfallversicherung | Betriebsindividuell; würden die Arbeitgeberkosten genauer machen | gering |
| Aktivrente | Seit 01.01.2026 geltendes Recht, aber ohne PAP-Merker; wäre über einen Freibetrag abzubilden | gering |

---

## 2a. Beobachtungen zu Bibliotheken

**recharts 3: `<Pie>` erzeugte leere Sektoren.** In der Zusammensetzungs-Karte
lieferte `<PieChart><Pie data={...} dataKey="wert"><Cell/></Pie></PieChart>` im
DOM zwei leere `<g class="recharts-pie-sector">` statt drei gefüllter Segmente —
ohne Konsolenfehler. Balken- und Liniendiagramme derselben Version arbeiten
einwandfrei. Statt die API zu erraten, wird der Ring jetzt in
`components/rechner/Donut.tsx` von Hand gezeichnet. Bei einem Versionswechsel
von recharts lohnt ein erneuter Blick, ob `<Pie>` wieder brauchbar ist — nötig
ist es nicht.

**ResizeObserver und requestAnimationFrame in nicht sichtbaren Tabs.** Beide
sind an den Rendering-Lebenszyklus gekoppelt und liefern dort keine
Rückmeldung; der ResizeObserver feuerte nicht einmal die laut Spezifikation
garantierte erste Beobachtung nach `observe`. `useStickyWennPasst` misst
deshalb direkt nach jedem Render und nutzt beide nur als zusätzliche Auslöser.

## 3. Bekannte Vereinfachungen

**Alter.** Gerechnet wird mit vollendeten Lebensjahren zu Jahresbeginn. Der
Zuschlag für Kinderlose in der Pflegeversicherung endet aber taggenau mit dem
Ablauf des Monats, in dem das 23. Lebensjahr vollendet wird. Im Geburtsjahr
weicht das Ergebnis daher ab.

**Übergangsbereich.** Angewandt auf ein Zwölftel des Jahresbruttos. Tatsächlich
wird monatsweise geprüft; bei schwankendem Entgelt weicht das ab.

**Kirchensteuer-Kappung.** Bemessungsgrundlage ist eine Näherung des zu
versteuernden Einkommens (Brutto abzüglich Arbeitnehmerbeiträge,
Arbeitnehmer-Pauschbetrag und Sonderausgaben-Pauschbetrag), nicht das exakte
zvE der Veranlagung.

**Szenarien.** Beitragsbemessungsgrenzen künftiger Jahre werden mit einer
angenommenen Lohnentwicklung fortgeschrieben. Die tatsächlichen Werte legt die
Sozialversicherungsrechengrößen-Verordnung jeweils im Herbst des Vorjahres fest.

**Steuerfaktor in Szenarien.** Ein Multiplikator auf Lohnsteuer und
Solidaritätszuschlag. Er kann keine Tarifänderung abbilden — insbesondere keine
Reform, die untere Einkommen entlastet und obere belastet. Nur im ausdrücklich
als `eigene_annahme` gekennzeichneten Belastungsszenario verwendet.

---

## 4. Produktideen aus der Prüfung

Nach erwartetem Nutzen sortiert, jeweils mit dem Grund.

1. **Gehaltserhöhungs-Rechner.** „200 € mehr brutto sind X € netto." Die
   Grenzabgabenquote liegt bereits vor; es fehlt nur die Darstellung. Direkte
   Verhandlungshilfe.
2. **Versorgungsbezüge.** Der Rechenkern kann es bereits, es fehlt die
   Oberfläche. Erschließt eine große Nutzergruppe.
3. **Umlagen und Unfallversicherung.** Macht die Arbeitgeberkosten vollständig.
4. **Rechtsstände nebeneinander vergleichen.** 2025 gegen 2026 gegen 2027 in
   einer Ansicht — die Datenstruktur trägt das schon.
5. **Ergebnis als teilbarer Link.** Zustand in der URL, ohne Serverspeicherung.
   Verträgt sich mit der Datenschutzzusage.
