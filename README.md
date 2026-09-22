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

Die Produktionsdomain **steuerlast-rechner.de** ist mit **Firebase App Hosting**
verbunden: Backend `steuerlastrechner`, Region `europe-west4`, Projekt
`steuerlast-rechner`. Ein Deployment mit `firebase deploy --only hosting`
aktualisiert lediglich die separate Adresse `steuerlast-rechner.web.app` und
deren Next.js-Backend in `europe-west1`, **nicht die Produktionsdomain**.
Die Zuordnung wurde am 22.09.2026 über die App-Hosting-Domain-API geprüft.

Vor jedem Deployment müssen `npm test`, `npm run lint`, `npx tsc --noEmit`
und ein frischer `npm run build` sauber durchlaufen — insbesondere der Abgleich
gegen die amtlichen Prüftabellen. Vor dem Build `.next` entfernen oder aus dem
Projekt verschieben, damit keine Artefakte aus `.next/dev` verpackt werden.

Produktionsdeployment eines geprüften Commits:

```bash
npm test
npm run lint
npx tsc --noEmit
# Vorher .next entfernen oder außerhalb des Projekts sichern
npm run build
git push origin HEAD
npx firebase apphosting:rollouts:create steuerlastrechner --git-commit "$(git rev-parse HEAD)" --force
```

App Hosting baut den gepushten Commit aus dem verbundenen GitHub-Repository.
Die CLI startet den Rollout; anschließend dessen Status bis `SUCCEEDED`
verfolgen und die Änderungen auf **https://steuerlast-rechner.de** prüfen.
Eine Erfolgsmeldung für `steuerlast-rechner.web.app` genügt dafür nicht.
Das Firebase-Projekt ist in [`.firebaserc`](.firebaserc) hinterlegt.

Für die separate Firebase-Hosting-Seite gilt nach denselben Prüfungen:

```bash
npx firebase deploy --only hosting
```

Läuft die Anmeldung ab, meldet die CLI einen `Authentication Error`. Dann:

```bash
npx firebase login --reauth
```

## Grenzen

Der Rechner bildet den laufenden Lohnsteuerabzug ab. Die endgültige Steuer
ergibt sich erst aus der Einkommensteuerveranlagung. Nicht abgebildet sind unter
anderem betriebliche Altersvorsorge, geldwerte Vorteile, das Faktorverfahren und
Mehrfachbeschäftigung. Die vollständige Liste steht in
[`offene-punkte.md`](docs/wissensspeicher/offene-punkte.md).

Keine Steuerberatung.

## Lizenz

MIT.
