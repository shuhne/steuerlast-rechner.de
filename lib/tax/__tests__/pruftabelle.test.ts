import { describe, it, expect } from 'vitest';
import Big from 'big.js';
import { Lohnsteuer2026, PAP_META } from '../generated/Lohnsteuer2026';
import fixture from './fixtures/pruftabelle-2026.json';

/**
 * REGRESSIONSTEST GEGEN DIE AMTLICHEN PRUEFTABELLEN
 * =================================================
 *
 * Dies ist der wichtigste Test des Projekts. Er vergleicht den generierten
 * Rechenkern Zeile fuer Zeile mit den vom BMF veroeffentlichten Pruef­tabellen.
 *
 * TOLERANZ: 0 EURO.
 *
 * Wenn dieser Test rot ist, ist der Rechenkern falsch - niemals die Erwartungs-
 * werte anpassen. Der Fixture-Inhalt ist eine amtliche Veroeffentlichung.
 *
 * Historie: Bis Juli 2026 lief im Projekt ein per Regex "auf 2026 gepatchter"
 * PAP 2023. Drei Tarifzonen trugen weiterhin die Werte von 2023, die
 * Soli-Freigrenze war frei erfunden. Ergebnis: bis zu 1.329 EUR/Jahr zu viel
 * Lohnsteuer und bis zu 420 EUR/Jahr zu viel Solidaritaetszuschlag. Kein
 * einziger der damals 100+ Tests hat das bemerkt, weil keiner gegen eine
 * amtliche Referenz geprueft hat. Deshalb gibt es diesen Test.
 */

type Row = { brutto: number; lst: Record<string, number> };

/** Baut eine PAP-Instanz mit den Merkern der jeweiligen Pruef­tabelle. */
function runPap(opts: {
    bruttoJahr: number;
    stkl: number;
    variante: 'allgemein' | 'besonders';
}): { lst: number; soli: number } {
    const lst = new Lohnsteuer2026();

    lst.RE4 = new Big(opts.bruttoJahr).times(100); // Cent
    lst.LZZ = 1; // Jahr
    lst.STKL = opts.stkl;
    lst.af = 1;
    lst.f = 1.0;
    lst.R = 0;

    if (opts.variante === 'allgemein') {
        // Fussnote 1 der Pruef­tabelle: ALV, KRV und PKV = 0 sowie KVZ = 2,90
        // Fussnote 2: In der Steuerklasse II gilt PVZ = 0, sonst PVZ = 1
        lst.ALV = 0;
        lst.KRV = 0;
        lst.PKV = 0;
        lst.KVZ = new Big(2.9);
        lst.PVZ = opts.stkl === 2 ? 0 : 1;
    } else {
        // Fussnote 3: ALV, KRV und PKV = 1
        // Fussnote 4: PKPV je Steuerklasse
        lst.ALV = 1;
        lst.KRV = 1;
        lst.PKV = 1;
        lst.PKPV = new Big(opts.stkl === 3 ? 50000 : opts.stkl === 6 ? 0 : 30000);
    }

    lst.calculate();

    return {
        lst: lst.LSTLZZ.div(100).toNumber(),
        soli: lst.SOLZLZZ.div(100).toNumber(),
    };
}

describe(`Amtliche Pruef­tabelle ${PAP_META.jahr} (PAP-Version ${PAP_META.version}, Stand ${PAP_META.stand})`, () => {
    it('Fixture stammt aus der amtlichen Quelle', () => {
        expect(fixture.quelle).toContain('BMF');
        expect(fixture.allgemein.zeilen).toHaveLength(43);
        expect(fixture.besonders.zeilen).toHaveLength(43);
    });

    for (const variante of ['allgemein', 'besonders'] as const) {
        describe(`${variante === 'allgemein' ? 'Allgemeine' : 'Besondere'} Jahreslohnsteuer`, () => {
            const zeilen = fixture[variante].zeilen as Row[];

            for (const stkl of [1, 2, 3, 4, 5, 6]) {
                it(`Steuerklasse ${stkl}: alle ${zeilen.length} Bruttostufen exakt`, () => {
                    const abweichungen: string[] = [];

                    for (const zeile of zeilen) {
                        const soll = zeile.lst[String(stkl)];
                        const ist = runPap({
                            bruttoJahr: zeile.brutto,
                            stkl,
                            variante,
                        }).lst;

                        if (ist !== soll) {
                            abweichungen.push(
                                `  ${zeile.brutto.toLocaleString('de-DE')} EUR: amtlich ${soll}, berechnet ${ist} (Delta ${ist - soll})`
                            );
                        }
                    }

                    expect(
                        abweichungen,
                        `Rechenkern weicht von der amtlichen Pruef­tabelle ab:\n${abweichungen.join('\n')}`
                    ).toEqual([]);
                });
            }
        });
    }

    it('Solidaritaetszuschlag: Freigrenze liegt bei 20.350 EUR Jahreslohnsteuer', () => {
        // § 3 SolzG i. V. m. PAP 2026 (SOLZFREI = 20350).
        // Direkt unterhalb der Freigrenze faellt kein Soli an, direkt darueber
        // greift die Milderungszone mit 11,9 % des uebersteigenden Betrags.
        const unter = runPap({ bruttoJahr: 85000, stkl: 1, variante: 'allgemein' });
        expect(unter.lst).toBeLessThan(20350);
        expect(unter.soli).toBe(0);

        const drueber = runPap({ bruttoJahr: 95000, stkl: 1, variante: 'allgemein' });
        expect(drueber.lst).toBeGreaterThan(20350);
        // Der PAP schneidet beide Zwischenwerte auf 2 Nachkommastellen ab
        // (MSOLZ: setScale(2, ROUND_DOWN)), bevor er das Minimum bildet.
        const trunc2 = (v: number) => Math.floor(v * 100) / 100;
        const voll = trunc2((drueber.lst * 5.5) / 100);
        const milderung = trunc2(((drueber.lst - 20350) * 11.9) / 100);
        expect(drueber.soli).toBe(Math.min(voll, milderung));
    });

    it('Tarifzonen entsprechen § 32a EStG in der Fassung ab VZ 2026', () => {
        // Direkter Test der Tariffunktion ueber UPTAB26.
        const referenz = (zve: number) => {
            const x = Math.floor(zve);
            if (x <= 12348) return 0;
            if (x <= 17799) {
                const y = (x - 12348) / 10000;
                return Math.floor((914.51 * y + 1400) * y);
            }
            if (x <= 69878) {
                const z = (x - 17799) / 10000;
                return Math.floor((173.1 * z + 2397) * z + 1034.87);
            }
            if (x <= 277825) return Math.floor(0.42 * x - 11135.63);
            return Math.floor(0.45 * x - 19470.38);
        };

        for (const zve of [12348, 12349, 15000, 17799, 17800, 40000, 69878, 69879, 100000, 277825, 277826, 500000]) {
            const pap = new Lohnsteuer2026();
            pap.MPARA();
            pap.KZTAB = 1;
            pap.X = new Big(zve);
            pap.UPTAB26();
            expect(pap.ST.toNumber(), `zvE ${zve}`).toBe(referenz(zve));
        }
    });
});
