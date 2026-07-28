# AGENTS.md — lib/statistik

Statistische Vergleichsdaten. Kein Steuerrecht.

## Grundsatz

Nur amtliche Statistik. Gehaltsreports von Jobbörsen beruhen auf
selbstselektierten Stichproben und sind hier nicht zulässig.

Der frühere Anker dieses Projekts stammte aus einem Jobbörsen-Report und lag
mit 45.800 € rund 15 % unter dem amtlichen Median von 54.066 €. Dadurch erschien
jede Nutzerin und jeder Nutzer systematisch als Besserverdienende.

## Dateien

| Datei | Quelle | Turnus |
|---|---|---|
| `verdienste.ts` | Destatis Verdiensterhebung | jährlich, April |
| `kaufkraft.ts` | Destatis Verbraucherpreisindex | jährlich, Januar |

## Verteilungen

Zwischen amtlich veröffentlichten Quantilen wird logarithmisch interpoliert.
Einkommensverteilungen sind rechtsschief; lineare Interpolation ist im oberen
Bereich deutlich zu grob.

Außerhalb des belegten Bereichs wird **geklemmt, nicht extrapoliert**. Wer über
das oberste veröffentlichte Quantil hinaus extrapoliert, erfindet Zahlen.

Keine parametrischen Verteilungsannahmen mehr. Die frühere Fassung unterstellte
eine Lognormalverteilung mit einem frei gesetzten Sigma von 0,5, ohne das
auszuweisen.

## Kaufkraft

Eine Formel für alle Jahre:

```
kaufkraftaequivalent(J) = Betrag × Preisindex(J) / Preisindex(Basisjahr)
```

Die frühere Fassung multiplizierte für die Vergangenheit mit der kumulierten
Inflation und dividierte für die Zukunft. Beide Hälften beantworteten damit
verschiedene Fragen auf einer gemeinsamen Achse mit gemeinsamer Beschriftung:
50.000 € erschienen für das Jahr 2000 als rund 80.000 € statt als rund 31.000 €.

Der Realwert bei nominal unverändertem Gehalt wird als **eigene Reihe**
ausgewiesen, nicht mit dem Kaufkraftäquivalent vermischt.

Beim Jahreswechsel: Teuerungsrate des Vorjahres ergänzen und `BASISJAHR`
hochsetzen.
