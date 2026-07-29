import { describe, it, expect } from 'vitest';
import { berechne } from '../rechner';
import fixture from './fixtures/pruftabelle-2026.json';

/**
 * DURCHGRIFFSTEST: amtliche Prueftabelle durch die gesamte Kette
 * ==============================================================
 *
 * `pruftabelle.test.ts` prueft den generierten Rechenkern direkt. Dieser Test
 * geht denselben Weg, den auch die Oberflaeche nimmt:
 *
 *   berechne()  ->  berechneLohnsteuer()  ->  Lohnsteuer2026 (PAP)
 *
 * Damit ist nicht nur der Kern abgesichert, sondern auch der Adapter: die
 * Ableitung der PAP-Merker aus fachlichen Eingaben, die Uebergabe des
 * Zusatzbeitrags, die Umrechnung Euro/Cent und die Rueckgabe.
 *
 * Genau in dieser Schicht sind beim Umbau zwei Fehler passiert, die der
 * direkte Kerntest nicht sehen konnte: ein nicht gesetztes JRE4 (sonstige
 * Bezuege wurden gegen einen Jahreslohn von 0 gerechnet) und ein falscher
 * PKV-Merker.
 *
 * Merker der amtlichen Tabelle: ALV = KRV = PKV = 0, KVZ = 2,90, PVZ = 1.
 * Uebersetzt in Eingaben: gesetzlich versichert, renten- und
 * arbeitslosenversicherungspflichtig, kinderlos, Alter ueber 23.
 *
 * Steuerklasse II bleibt aussen vor - die Tabellenfussnote weist den dort
 * unterstellten Kinderfreibetrag nicht aus.
 */

type Zeile = { brutto: number; lst: Record<string, number> };

const eingabe = (bruttoJahr: number, steuerklasse: number) => ({
    bruttoJahr,
    steuerklasse,
    bundesland: 'BE',
    kirchensteuer: false,
    alter: 30,
    kinderfreibetraege: 0,
    kinderFuerPflege: 0,
    krankenversicherung: 'gesetzlich' as const,
    kvZusatzProzent: 2.9,
    rentenversicherungspflichtig: true,
    arbeitslosenversicherungspflichtig: true,
});

describe('Amtliche Prueftabelle durch die gesamte Berechnungskette', () => {
    const zeilen = fixture.allgemein.zeilen as Zeile[];

    for (const stkl of [1, 3, 4, 5, 6]) {
        it(`Steuerklasse ${stkl}: alle ${zeilen.length} Bruttostufen exakt`, () => {
            const abweichungen: string[] = [];

            for (const zeile of zeilen) {
                const soll = zeile.lst[String(stkl)];
                const ist = berechne(eingabe(zeile.brutto, stkl)).steuern.lohnsteuer;

                if (ist !== soll) {
                    abweichungen.push(
                        `  ${zeile.brutto.toLocaleString('de-DE')} EUR: amtlich ${soll}, berechnet ${ist}`
                    );
                }
            }

            expect(
                abweichungen,
                `Abweichung zur amtlichen Prueftabelle:\n${abweichungen.join('\n')}`
            ).toEqual([]);
        });
    }

    it('Netto geht in jeder Zeile auf', () => {
        for (const zeile of zeilen) {
            const r = berechne(eingabe(zeile.brutto, 1));
            expect(
                Math.abs(r.netto.jahr - (r.brutto - r.steuern.summe - r.sozialabgaben.summe))
            ).toBeLessThan(0.005);
        }
    });

    it('Netto waechst streng monoton mit dem Brutto', () => {
        let vorher = -1;
        for (const zeile of zeilen) {
            const netto = berechne(eingabe(zeile.brutto, 1)).netto.jahr;
            expect(netto, `bei ${zeile.brutto} EUR`).toBeGreaterThan(vorher);
            vorher = netto;
        }
    });

    it('Grenzabgabenquote bleibt in jeder Zeile plausibel', () => {
        for (const zeile of zeilen) {
            const q = berechne(eingabe(zeile.brutto, 1)).quoten.grenzabgabenquote;
            expect(q, `bei ${zeile.brutto} EUR`).toBeGreaterThanOrEqual(0);
            expect(q, `bei ${zeile.brutto} EUR`).toBeLessThan(100);
        }
    });
});
