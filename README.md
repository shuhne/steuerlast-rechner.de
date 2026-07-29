# steuerlast-rechner.de

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8)
![Vitest](https://img.shields.io/badge/Test-Vitest-yellow)

Brutto-Netto-Rechner für Deutschland. Die Lohnsteuer wird nach dem amtlichen
Programmablaufplan des Bundesfinanzministeriums berechnet — demselben Verfahren,
das Lohnabrechnungsprogramme verwenden.

## Was ihn unterscheidet

**Der Rechenkern wird nicht geschrieben, sondern erzeugt.** Aus der vom BMF
veröffentlichten XML-Fassung des Programmablaufplans generiert
`npm run gen:lohnsteuer` eine 1:1-Portierung nach TypeScript. Von Hand wird
daran nichts geändert.

**Geprüft gegen die amtliche Referenz.** Der zentrale Test vergleicht 516 Werte
aus den beiden Prüftabellen des BMF-Schreibens — 43 Bruttostufen, sechs
Steuerklassen, beide Tabellen — mit einer Toleranz von null Euro.

**Jede Zahl trägt ihre Quelle.** Werte aus Gesetzen und Verordnungen liegen in
`lib/tax/parameter/` und führen Quelle, Rechtsstatus, Belastbarkeit und
Gültigkeitszeitraum mit. Die Oberfläche liest diese Metadaten direkt aus.

**Szenarien statt Prognosen.** Zukunftsszenarien zeigen ihren rechtlichen Status
— geltendes Recht, Referentenentwurf, amtliche Vorausberechnung oder eigene
Annahme — und benennen, was sie bewusst nicht abbilden. Eine politische
Ankündigung wird nicht als künftige Rechtslage dargestellt.

**Die Berechnung läuft im Browser.** Gehalt, Steuerklasse und die übrigen
Angaben verlassen das Gerät nicht.

## Funktionen

- Netto nach geltendem Recht 2026, wahlweise nach einem anderen Rechtsstand
- Vollständige Abzugsliste: Lohnsteuer, Solidaritätszuschlag, Kirchensteuer,
  Renten-, Arbeitslosen-, Kranken- und Pflegeversicherung
- Arbeitgeberanteile und Gesamtkosten der Stelle
- Grenzabgabenquote inklusive Sozialabgaben, mit den Sprüngen an den
  Beitragsbemessungsgrenzen
- Teilzeitanalyse mit Netto je Arbeitsstunde und erworbenen Entgeltpunkten
- Übergangsbereich bei Midijobs, Einmalzahlungen, ELStAM-Freibetrag,
  private Krankenversicherung mit Arbeitgeberzuschuss
- Einordnung in die amtliche Verdienstverteilung
- Kaufkraftentwicklung
- Steuerklassenvergleich für Paare
- Zeitreise: Vergleich mit dem Steuerrecht von 1958

## Entwicklung

```bash
npm install
npm run dev
```

```bash
npm test                 # alle Tests
npm test -- pruftabelle  # nur der amtliche Abgleich
npm run gen:lohnsteuer   # Rechenkern aus der XML neu erzeugen
npm run lint
npx tsc --noEmit
```

## Dokumentation

| Wofür | Wo |
|---|---|
| Arbeitsanweisung für Agenten und Beitragende | [`AGENTS.md`](AGENTS.md) |
| Codeaufbau | [`docs/architektur.md`](docs/architektur.md) |
| Primärquellen und ihr Turnus | [`docs/wissensspeicher/quellenregister.md`](docs/wissensspeicher/quellenregister.md) |
| Jahreswechsel durchführen | [`docs/wissensspeicher/runbook-jahreswechsel.md`](docs/wissensspeicher/runbook-jahreswechsel.md) |
| Stand der Reformvorhaben | [`docs/wissensspeicher/reformmonitor.md`](docs/wissensspeicher/reformmonitor.md) |
| Was nicht abgebildet ist | [`docs/wissensspeicher/offene-punkte.md`](docs/wissensspeicher/offene-punkte.md) |

## Deployment

Firebase Hosting mit Next.js-Backend in `europe-west1`. Das Projekt ist über
[`.firebaserc`](.firebaserc) fest hinterlegt, `--project` ist deshalb nicht
nötig.

```bash
rm -rf .next        # wichtig, siehe unten
npm run build
npx firebase deploy --only hosting
```

**`.next` vor dem Build loeschen.** Das Firebase-Frameworks-Backend packt den
Projektordner mitsamt `.next`. Wurde vorher `npm run dev` ausgefuehrt, liegt
dort ein `dev`-Unterordner mit Entwicklungsartefakten — in einem gemessenen Fall
288 MB, die unnoetig hochgeladen werden. Ein sauberer Build erzeugt rund 19 MB.

Läuft die Anmeldung ab, meldet die CLI einen `Authentication Error`. Dann:

```bash
npx firebase login --reauth
```

Vor jedem Deployment müssen `npm test`, `npx tsc --noEmit`, `npm run lint` und
`npm run build` sauber durchlaufen — insbesondere der Abgleich gegen die
amtlichen Prüftabellen.

## Grenzen

Der Rechner bildet den laufenden Lohnsteuerabzug ab. Die endgültige Steuer
ergibt sich erst aus der Einkommensteuerveranlagung. Nicht abgebildet sind unter
anderem betriebliche Altersvorsorge, geldwerte Vorteile, das Faktorverfahren und
Mehrfachbeschäftigung. Die vollständige Liste steht in
[`offene-punkte.md`](docs/wissensspeicher/offene-punkte.md).

Keine Steuerberatung.

## Lizenz

MIT.
