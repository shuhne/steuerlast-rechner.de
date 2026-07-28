# AGENTS.md — components

Regeln für die Oberfläche. Ergänzt [`../AGENTS.md`](../AGENTS.md).

## Grundsatz

Der Rechner zeigt Geld, das Menschen für ihr eigenes ausgeben. Die Oberfläche
muss deshalb zwei Dinge gleichzeitig leisten: eine Zahl schnell sichtbar machen
und ihre Herkunft nachvollziehbar halten. Wo beides kollidiert, gewinnt die
Nachvollziehbarkeit — aber sie gehört in einen Tooltip, nicht in den Fließtext.

## Wo der Zustand liegt

Alles in `rechner/useRechner.ts`. Die Panels sind reine Darstellung und
bekommen den kompletten Hook als Props (`type Props = ReturnType<typeof
useRechner>`).

**Kein Panel hält eigenen fachlichen Zustand.** Aufklappzustände (Expertenmodus,
Methodenkasten) sind lokal, alles andere nicht.

Der Grund steht in der Historie: Die Anzeigeeinheit lag einmal doppelt vor — im
Eingabefeld und im Ergebnis. Man konnte „Jährlich" eingeben und „Monatlich"
angezeigt bekommen.

## Die Berechnung läuft im Browser

`useRechner` ruft `berechne` direkt auf. **Nie einen `fetch` auf `/api/`
einbauen.** Die Seite sagt an mehreren Stellen zu, dass Gehalt und Steuerklasse
das Gerät nicht verlassen. Diese Zusage war schon einmal falsch.

## Erklärungen gehören in Tooltips

Mehrzeilige Hinweise unter jedem Feld haben das Eingabepanel auf über 1.100
Pixel gebracht — länger als ein übliches Browserfenster. Dadurch fiel das
Ergebnis unter die Falzlinie und die Seitenleiste konnte nicht mehr kleben.

Nutze `<Feld label="..." hinweis="...">`; daraus wird automatisch ein
`InfoTooltip`. Dauertext nur, wenn die Information für die Eingabe zwingend ist.

## Keine zweiten Scrollleisten

`overflow-y-auto` auf Layoutbereichen ist verboten. Die Seite hat genau eine
Scrollleiste: die des Fensters.

Wenn ein Element kleben soll, aber möglicherweise zu hoch ist, nutze
`useStickyWennPasst`. Es misst und klebt nur, wenn das Element vollständig ins
Fenster passt — sonst scrollt es normal mit.

## Zahlen immer mit Einordnung

Jede Kennzahl braucht drei Dinge: den Wert, die Einheit und eine
Bezugsangabe. „49,0 %" allein sagt nichts; „49,0 % — vom nächsten Euro" schon.

Prozent- und Eurowerte nach Möglichkeit nebeneinander. In der
Zusammensetzungs-Karte steht bewusst beides.

## Rechtsstand sichtbar halten

Sobald ein Szenario aktiv ist, muss das auf einen Blick erkennbar sein:

- Die Ergebniskarte färbt sich rose statt indigo und trägt das Jahr im Titel.
- Darüber steht ein Warnkasten mit `RechtsstatusChip` und der Liste
  `nichtModelliert`.

**Nicht** an jedem Feld einen Status-Chip anbringen. Ein farbiger Chip auch am
Normalfall „geltendes Recht" ist Rauschen und entwertet die Kennzeichnung dort,
wo sie zählt.

## Diagramme

`recharts` für Balken, Linien und Flächen. Für einfache Formen lohnt sich die
Abhängigkeit nicht — das Ringdiagramm ist in `Donut.tsx` von Hand gezeichnet,
nachdem `<Pie>` in recharts 3 leere Sektoren erzeugte.

Jedes Diagramm braucht:

- eine Quellenangabe darunter (`quelle`-Prop der `Karte`)
- einen Satz in Klartext, der die Kernaussage benennt — nicht jeder liest Achsen
- bei selbstgebauten Grafiken ein `aria-label`, das die Werte vorliest

## Barrierefreiheit

- Zahlenfelder: eigene Plus/Minus-Schaltflächen statt der nativen Spinner. Die
  sind auf Touch kaum treffbar und in Firefox nicht vorhanden. Nutze `ZahlFeld`.
- Jedes Bedienelement braucht ein `aria-label`, wenn die sichtbare Beschriftung
  nicht eindeutig ist.
- `InfoTooltip` muss per Maus, Tastatur und Touch erreichbar bleiben.

## Was ESLint hier durchsetzt

- kein `any` — bei recharts-Callbacks die Typen `WertTyp`/`NameTyp` aus
  `Analysen.tsx` verwenden
- kein `setState` direkt im Effektkörper. Einzige begründete Ausnahme:
  `useStickyWennPasst`, dort mit ausführlicher Begründung im Code
- `<Link>` statt `<a>` für interne Navigation
