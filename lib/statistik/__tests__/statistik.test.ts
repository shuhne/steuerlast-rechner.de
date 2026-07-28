import { describe, it, expect } from 'vitest';
import {
    perzentil, bruttoFuerPerzentil, einordnen, VERDIENSTE_2025, ALTERSFAKTOR,
} from '../verdienste';
import {
    preisindex, kaufkraftreihe, kaufkraftverlust, noetigeJaehrlicheErhoehung, BASISJAHR,
} from '../kaufkraft';

describe('Verdienstverteilung', () => {
    it('trifft die amtlichen Quantile exakt', () => {
        expect(perzentil(33_828)).toBe(10);
        expect(perzentil(54_066)).toBe(50);
        expect(perzentil(100_719)).toBe(90);
        expect(perzentil(219_110)).toBe(99);
    });

    it('ist monoton', () => {
        let vorher = 0;
        for (const b of [20_000, 40_000, 54_066, 80_000, 150_000, 300_000]) {
            const p = perzentil(b);
            expect(p).toBeGreaterThanOrEqual(vorher);
            vorher = p;
        }
    });

    it('klemmt ausserhalb des belegten Bereichs statt zu extrapolieren', () => {
        expect(perzentil(1_000)).toBe(10);
        expect(perzentil(5_000_000)).toBe(99);
    });

    it('Umkehrfunktion ist konsistent', () => {
        for (const p of [10, 30, 50, 90, 99]) {
            expect(perzentil(bruttoFuerPerzentil(p))).toBeCloseTo(p, 0);
        }
    });

    it('nutzt den Destatis-Median, nicht den alten StepStone-Anker', () => {
        expect(VERDIENSTE_2025.median).toBe(54_066);
        expect(VERDIENSTE_2025.quelle.herausgeber).toBe('Statistisches Bundesamt');
    });

    it('Altersprofil ist als Modellannahme gekennzeichnet', () => {
        expect(ALTERSFAKTOR.rechtsstatus).toBe('eigene_annahme');
        expect(ALTERSFAKTOR.belastbarkeit).toBe('geschaetzt');
    });

    it('Einordnung weist beide Perzentile und die Unsicherheit aus', () => {
        const e = einordnen(54_066, 32);
        expect(e.perzentilGesamt).toBe(50);
        expect(e.hinweise.join(' ')).toContain('Modellannahme');
    });
});

describe('Kaufkraft', () => {
    it('Basisjahr hat Index 100', () => {
        expect(preisindex(BASISJAHR)).toBe(100);
    });

    it('Index steigt streng monoton mit dem Jahr', () => {
        let vorher = 0;
        for (let j = 2000; j <= 2050; j++) {
            const i = preisindex(j);
            expect(i).toBeGreaterThan(vorher);
            vorher = i;
        }
    });

    it('Kaufkraftaequivalent ist in der Vergangenheit NIEDRIGER als heute', () => {
        // Regression: frueher wurde fuer die Vergangenheit multipliziert statt
        // dividiert, wodurch 50.000 EUR im Jahr 2000 als rund 80.000 EUR
        // erschienen. Richtig ist: mit rund 31.000 EUR konnte man 2000 so viel
        // kaufen wie heute mit 50.000 EUR.
        const reihe = kaufkraftreihe(50_000, 2000, 2050);
        const p2000 = reihe.find((p) => p.jahr === 2000)!;
        const heute = reihe.find((p) => p.jahr === BASISJAHR)!;
        expect(p2000.kaufkraftaequivalent).toBeLessThan(50_000);
        expect(p2000.kaufkraftaequivalent).toBeGreaterThan(25_000);
        expect(heute.kaufkraftaequivalent).toBe(50_000);
    });

    it('Kaufkraftaequivalent ist in der Zukunft HOEHER als heute', () => {
        const reihe = kaufkraftreihe(50_000, 2026, 2050);
        expect(reihe[reihe.length - 1].kaufkraftaequivalent).toBeGreaterThan(50_000);
    });

    it('Vergangenheit und Zukunft folgen derselben Formel', () => {
        // Genau das war frueher nicht der Fall.
        const reihe = kaufkraftreihe(50_000, 2000, 2050);
        for (const p of reihe) {
            expect(p.kaufkraftaequivalent).toBe(
                Math.round((50_000 * preisindex(p.jahr)) / 100)
            );
        }
    });

    it('Realwert ohne Erhoehung sinkt in der Zukunft', () => {
        const reihe = kaufkraftreihe(50_000, 2026, 2050);
        expect(reihe[0].realwertOhneErhoehung).toBe(50_000);
        expect(reihe[reihe.length - 1].realwertOhneErhoehung!).toBeLessThan(35_000);
    });

    it('Realwert ist fuer die Vergangenheit nicht definiert', () => {
        const reihe = kaufkraftreihe(50_000, 2000, 2026);
        expect(reihe.find((p) => p.jahr === 2010)!.realwertOhneErhoehung).toBeNull();
    });

    it('Kaufkraftverlust bis 2050 liegt bei rund 38 %', () => {
        const v = kaufkraftverlust(2050);
        expect(v).toBeGreaterThan(30);
        expect(v).toBeLessThan(45);
    });

    it('Noetige jaehrliche Erhoehung entspricht der Teuerungsannahme', () => {
        expect(noetigeJaehrlicheErhoehung(2026, 2050)).toBeCloseTo(2.0, 1);
    });
});
