# Runbook: Jahreswechsel

Schritt-für-Schritt-Anleitung, um den Rechner auf ein neues Jahr umzustellen.
Gedacht für einen Agenten oder eine Person, die den Kontext nicht kennt.

Der Zeitplan folgt dem Veröffentlichungsrhythmus der Quellen. Alle Fundstellen
stehen im [Quellenregister](quellenregister.md).

---

## Zeitplan

| Wann | Was |
|---|---|
| Anfang Oktober | Kabinettsbeschluss zu den Sozialversicherungsrechengrößen — Werte vorbereiten, Status `regierungsentwurf` |
| Anfang November | BMG gibt den durchschnittlichen Zusatzbeitrag bekannt |
| Mitte November | **PAP des Folgejahres einspielen** — der wichtigste Schritt |
| Ende November | Rechengrößen verkündet — Status auf `geltendes_recht` |
| November | Rentenversicherungsbericht — Szenarien aktualisieren |
| Dezember | Jahressteuergesetz prüfen: Tarifänderungen, Freibeträge |
| 1. Januar | Umstellung scharf schalten |
| April | Destatis-Verdiensterhebung |
| Januar | Verbraucherpreisindex, Bundesbank-Kaufkrafttabelle |

---

## Schritt 1 — Programmablaufplan einspielen

Der einzige Weg, den Rechenkern zu ändern.

1. Aktuelle XML holen von
   <https://www.bmf-steuerrechner.de/interface/pseudocodes.xhtml>
   und als `tools/lohnsteuer/Lohnsteuer<JAHR>.xml` ablegen.

   Die Seite verlangt teilweise einen Referer-Header:

   ```bash
   curl -sSL -H "Referer: https://www.bmf-steuerrechner.de/interface/pseudocodes.xhtml" \
     -o tools/lohnsteuer/Lohnsteuer2027.xml \
     "https://www.bmf-steuerrechner.de/javax.faces.resource/daten/xmls/Lohnsteuer2027.xml.xhtml"
   ```

2. Generator laufen lassen:

   ```bash
   PAP_YEAR=2027 npm run gen:lohnsteuer
   ```

   Der Generator gibt Version und Stand der XML aus. Beides gehört in die
   Commit-Nachricht.

3. **Wenn der Generator abbricht**, hat der PAP eine neue Sprachkonstruktion
   eingeführt. Der Generator behandelt bewusst nur die Konstruktionen, die
   tatsächlich vorkommen, und wirft bei allem anderen eine Ausnahme statt still
   etwas Falsches zu erzeugen. Erweitere `tools/lohnsteuer/generate.mjs` um den
   neuen Fall.

   Anlaufstellen dort: `rewriteScaledCalls` (Java `divide`/`setScale`),
   `makeTranslator` (Methodennamen und Konstanten), `emitStatements`
   (Kontrollfluss).

4. Prüftabellen aus Anlage 1 des BMF-Schreibens (letzte beiden Seiten) in
   `lib/tax/__tests__/fixtures/pruftabelle-<JAHR>.json` übertragen. Format
   siehe bestehende Datei. Aus dem PDF mit `pdftotext -layout` extrahieren.

5. Test laufen lassen:

   ```bash
   npm test -- pruftabelle
   ```

   **Toleranz ist null Euro.** Jede Abweichung bedeutet, dass die Portierung
   falsch ist. Niemals die Erwartungswerte anpassen — sie sind eine amtliche
   Veröffentlichung.

### Was sich beim PAP zwischen Jahren ändern kann

Nicht nur Zahlen. Beobachtet wurden bereits:

- neue Eingabeparameter (2025: `PVA` für Beitragsabschläge, 2026: `PKPVAGZ`
  für den Arbeitgeberzuschuss zur PKV)
- geänderte Bedeutung bestehender Merker (`KRV` bedeutete früher West/Ost,
  heute rentenversicherungspflichtig ja/nein)
- weggefallene Ausgabeparameter
- umbenannte interne Variablen bei gleichbleibender Logik

Deshalb nach dem Generieren **immer** `lib/tax/lohnsteuer.ts` durchsehen: Werden
alle neuen Eingaben gesetzt? Existieren alle gelesenen Ausgaben noch? Der
Typecheck fängt das nicht, weil die generierte Datei `@ts-nocheck` trägt.

---

## Schritt 2 — Sozialversicherungsparameter

Datei: `lib/tax/parameter/sozialversicherung.ts`

Neues `SV_<JAHR>`-Objekt anlegen, nicht das alte überschreiben — Vorjahre
bleiben als wählbarer Rechtsstand verfügbar.

Zu prüfen:

- [ ] Beitragsbemessungsgrenze Renten-/Arbeitslosenversicherung
- [ ] Beitragsbemessungsgrenze Kranken-/Pflegeversicherung
- [ ] Jahresarbeitsentgeltgrenze
- [ ] vorläufiges Durchschnittsentgelt
- [ ] Beitragssätze RV, AV, KV allgemein, PV
- [ ] durchschnittlicher Zusatzbeitrag (§ 242a SGB V)
- [ ] Zuschlag für Kinderlose, Abschlag je Kind
- [ ] Geringfügigkeitsgrenze und Faktor F
- [ ] Mindestlohn

Bei jedem Wert `quelle.stand` und `gueltigAb` mitpflegen.

Faktor F gegenrechnen: 28 % geteilt durch die Summe aller Beitragssätze
einschließlich durchschnittlichem Zusatzbeitrag. Weicht das Ergebnis von der
BMAS-Bekanntmachung ab, stimmt eine der eingetragenen Zahlen nicht.

---

## Schritt 3 — Rechtsstände und Szenarien

Datei: `lib/tax/parameter/rechtsstaende.ts`

- [ ] Neues Jahr wird `RECHTSSTAND_GELTEND`
- [ ] Bisheriges Jahr bleibt als Vergleich wählbar
- [ ] Entwurfsszenarien prüfen: Ist aus dem Entwurf Gesetz geworden? Dann
      Status hochstufen und die Zahlen durch die verkündeten ersetzen
- [ ] Projektionen aus dem neuen Rentenversicherungsbericht aktualisieren
      (Übersicht B 2.1, mittlere Variante plus Spanne)
- [ ] `nichtModelliert` durchsehen: Ist ein Punkt inzwischen abbildbar?

---

## Schritt 4 — Statistik

- [ ] `lib/statistik/verdienste.ts` — Quantile aus der April-Pressemitteilung
- [ ] `lib/statistik/kaufkraft.ts` — Teuerungsrate des Vorjahres ergänzen,
      `BASISJAHR` hochsetzen
- [ ] `lib/tax/historisch/jahr1958.ts` — Kaufkraftfaktor und dessen Bezugsjahr

---

## Schritt 5 — Texte

- [ ] `data/faq.ts` — Jahreszahlen und Beträge
- [ ] `app/page.tsx` — Fließtext
- [ ] `README.md`

Achte auf Tempus: Sobald ein Jahr läuft, stehen seine Werte fest. Formulierungen
wie „für 2027 werden steigende Beiträge erwartet" sind ab dem 1. Januar 2027
falsch.

---

## Schritt 6 — Abnahme

```bash
npm test           # alle Tests, insbesondere pruftabelle
npx tsc --noEmit
npm run lint
npm run dev        # Stichprobe von Hand
```

Stichprobe: Ein Bruttowert aus der amtlichen Prüftabelle eingeben und die
angezeigte Lohnsteuer mit der Tabelle vergleichen. Das prüft die gesamte Kette
von der Eingabe bis zur Anzeige, nicht nur den Rechenkern.

---

## Häufige Fehler

**Den Rechenkern von Hand patchen.** Genau daraus ist der Fehler entstanden, den
dieses Runbook verhindern soll. Ein Regex-Skript, das Konstanten ersetzt, meldet
Erfolg auch dann, wenn die Hälfte der Muster nicht gegriffen hat.

**Prüftabellenwerte anpassen, damit der Test grün wird.** Der Test ist die
einzige unabhängige Kontrolle, die dieses Projekt hat.

**Sekundärquellen als Beleg nehmen.** Siehe Quellenregister.

**Eine Modellvariante als Prognose darstellen.** Der
Rentenversicherungsbericht enthält neun Varianten. Wer nur eine zitiert,
erzeugt Scheingenauigkeit.

**Politische Ankündigungen einrechnen.** Ohne Referentenentwurf gibt es keine
Beträge. Der Punkt gehört unter `nichtModelliert`.
