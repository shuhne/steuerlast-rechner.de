# Wissensspeicher

Alles, was ein Agent oder eine Person braucht, um diesen Rechner fachlich
aktuell zu halten — ohne den ursprünglichen Kontext zu kennen.

| Datei | Wofür |
|---|---|
| [quellenregister.md](quellenregister.md) | Welche Primärquelle regelt was, wo liegt sie, wann ändert sie sich |
| [runbook-jahreswechsel.md](runbook-jahreswechsel.md) | Schritt für Schritt auf ein neues Jahr umstellen |
| [reformmonitor.md](reformmonitor.md) | Stand der Reformvorhaben, getrennt nach Rechtsstatus |
| [offene-punkte.md](offene-punkte.md) | Was bewusst nicht abgebildet ist und was noch fehlt |
| [recherche-2026-07.md](recherche-2026-07.md) | Rechercheprotokoll der Überarbeitung im Juli 2026 |

Übergeordnet: [`AGENTS.md`](../../AGENTS.md) im Wurzelverzeichnis,
[`architektur.md`](../architektur.md) für den Codeaufbau.

## Leitgedanke

Der Rechner soll nicht nur richtig rechnen, sondern **belegen können, warum**.
Jede Zahl trägt ihre Quelle, ihren Rechtsstatus und ihre Belastbarkeit mit sich.
Die Oberfläche liest diese Metadaten direkt aus. Eine angezeigte Quellenangabe
kann dadurch nicht veralten, ohne dass auch der Wert veraltet.

Wo etwas nicht belegbar ist, wird das gesagt statt geschätzt.
