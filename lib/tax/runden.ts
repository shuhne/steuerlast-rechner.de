/**
 * Kaufmaennisches Runden auf Cent - binaerstabil.
 *
 * `Math.round(v * 100) / 100` ist fuer Geldbetraege unbrauchbar, weil viele
 * Zwischenergebnisse binaer nicht exakt darstellbar sind. Beispiel:
 *
 *   5812.50 * 0.018            = 104.62499999999999
 *   Math.round(104.6249... * 100) / 100 = 104.62   // falsch
 *   euroRunden(104.62499999999999)      = 104.63   // richtig
 *
 * Deshalb wird vor dem Runden auf 10 Nachkommastellen normalisiert. Das
 * entfernt den Darstellungsfehler, ohne fachlich relevante Stellen zu
 * verlieren (Beitragssaetze haben hoechstens 6 Nachkommastellen).
 */
export function euroRunden(betrag: number): number {
    if (!Number.isFinite(betrag)) return 0;
    const normalisiert = Number(betrag.toFixed(10));
    return Math.round(normalisiert * 100) / 100;
}

/** Auf eine beliebige Zahl von Nachkommastellen, gleiche Stabilitaet. */
export function runden(wert: number, stellen: number): number {
    if (!Number.isFinite(wert)) return 0;
    const f = Math.pow(10, stellen);
    return Math.round(Number(wert.toFixed(10)) * f) / f;
}
