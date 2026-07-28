import { describe, it, expect } from 'vitest';
import { periodeWechseln, parseZahl, STANDARD, RechnerZustand } from '../useRechner';

/**
 * REGRESSIONSTEST
 *
 * Der Umschalter Jaehrlich/Monatlich gibt es zweimal: im Eingabefeld und in
 * der Ergebniskarte. Nach dem Umbau setzte der in der Ergebniskarte nur die
 * Einheit, ohne den eingegebenen Betrag umzurechnen. Da der Rechner den
 * Eingabewert durch die Einheit interpretiert, wurden aus 60.000 EUR im Jahr
 * stillschweigend 60.000 EUR im Monat - also 720.000 EUR Jahresgehalt. Das
 * angezeigte "Monatsnetto" lag um den Faktor 10 daneben.
 *
 * Beide Umschalter rufen jetzt `periodeWechseln`. Diese Tests sichern, dass
 * ein Einheitenwechsel das Gehalt nie veraendert.
 */

/** Jahresbrutto, wie es der Rechner aus Zustand ableitet. */
const bruttoJahr = (z: RechnerZustand) => {
    const v = parseZahl(z.bruttoEingabe);
    return z.periode === 'monat' ? v * 12 : v;
};

const mit = (o: Partial<RechnerZustand>): RechnerZustand => ({ ...STANDARD, ...o });

describe('Einheitenwechsel Jährlich/Monatlich', () => {
    it('ändert das Gehalt nicht', () => {
        const jaehrlich = mit({ bruttoEingabe: '60.000', periode: 'jahr' });
        const monatlich = periodeWechseln(jaehrlich, 'monat');

        expect(monatlich.bruttoEingabe).toBe('5.000');
        expect(bruttoJahr(monatlich)).toBe(bruttoJahr(jaehrlich));
        expect(bruttoJahr(monatlich)).toBe(60000);
    });

    it('ist umkehrbar', () => {
        const start = mit({ bruttoEingabe: '60.000', periode: 'jahr' });
        const hin = periodeWechseln(start, 'monat');
        const zurueck = periodeWechseln(hin, 'jahr');

        expect(zurueck.bruttoEingabe).toBe(start.bruttoEingabe);
        expect(bruttoJahr(zurueck)).toBe(bruttoJahr(start));
    });

    it('lässt den Zustand unverändert, wenn die Einheit schon stimmt', () => {
        const z = mit({ bruttoEingabe: '60.000', periode: 'jahr' });
        expect(periodeWechseln(z, 'jahr')).toBe(z);
    });

    it('kommt mit leerer Eingabe zurecht', () => {
        const leer = mit({ bruttoEingabe: '', periode: 'jahr' });
        const gewechselt = periodeWechseln(leer, 'monat');

        expect(gewechselt.periode).toBe('monat');
        expect(gewechselt.bruttoEingabe).toBe('');
        expect(bruttoJahr(gewechselt)).toBe(0);
    });

    it('rundet auf zwei Nachkommastellen und bleibt dabei nah am Ausgangswert', () => {
        // 50.000 / 12 = 4.166,666... -> 4.166,67 -> x 12 = 50.000,04
        const z = periodeWechseln(mit({ bruttoEingabe: '50.000', periode: 'jahr' }), 'monat');
        expect(z.bruttoEingabe).toBe('4.166,67');
        expect(Math.abs(bruttoJahr(z) - 50000)).toBeLessThan(0.05);
    });

    it('Regression: der Wechsel darf das Gehalt nicht verzwölffachen', () => {
        const z = mit({ bruttoEingabe: '60.000', periode: 'jahr' });
        const nachher = periodeWechseln(z, 'monat');
        expect(bruttoJahr(nachher)).not.toBe(720000);
    });
});
