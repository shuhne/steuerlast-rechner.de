import { describe, expect, it } from 'vitest';
import { berechne, jaeg, RechnerEingabe } from '../rechner';
import { teilzeitanalyse } from '../analysen';
import { maximalerPkvZuschuss } from '../sozialabgaben';
import { RECHTSSTAND_2027 } from '../parameter/rechtsstaende';
import { SV_2026, SV_2027_ENTWURF } from '../parameter/sozialversicherung';

const eingabe = (extra: Partial<RechnerEingabe> = {}): RechnerEingabe => ({
    bruttoJahr: 120_000,
    steuerklasse: 1,
    bundesland: 'BE',
    kirchensteuer: false,
    alter: 30,
    kinderfreibetraege: 0,
    kinderFuerPflege: 0,
    krankenversicherung: 'gesetzlich',
    kvZusatzProzent: 3.5,
    szenarioId: '2027-entwurf',
    ...extra,
});

// Unabhängige Referenz: BMAS-Tabelle vom 21.09.2026 (SVBezGrV-Entwurf 2027).
// Pflege: PNOG-RefE, Fassung 05.06.2026, Art. 1 Nr. 48 b, S. 46:
// BBG entspricht § 6 Abs. 6 SGB V, nicht der KV-BBG.
// Beitrags-Sollwerte kaufmännisch auf Jahrescent berechnet; Zusatzbeitrag
// 3,5 % ist die bestehende Szenarioannahme, keine amtliche Bekanntmachung.
describe('Rechengrößen 2027 nach amtlichem Entwurf', () => {
    it.each([
        ['bbgRvAv', 106_200],
        ['bbgKv', 76_500],
        ['bbgPv', 84_150],
        ['jaeg', 84_150],
        ['durchschnittsentgelt', 53_452],
    ] as const)('%s trägt Entwurfswert und Provenienz', (name, wert) => {
        const p = RECHTSSTAND_2027.sv[name];
        expect(p.wert).toBe(wert);
        expect(p.rechtsstatus).toBe('referentenentwurf');
        expect(p.gueltigAb).toBe(2027);
        expect(p.belastbarkeit).toBe(name === 'bbgPv' ? 'hergeleitet' : 'belegt');
        expect(p.quelle.url).toMatch(/^https:\/\/www\.(bmas|bundesgesundheitsministerium)\.de\//);
        expect(p.quelle.stand).toBe(name === 'bbgPv' ? '2026-06-05' : '2026-09-21');
    });

    it('verwendet die allgemeine JAEG und belässt 2026 bei geltendem Recht', () => {
        expect(jaeg('2027-entwurf')).toBe(84_150);
        expect(jaeg()).toBe(77_400);
        expect(SV_2026.bbgKv.wert).toBe(69_750);
        expect(SV_2026.bbgPv.wert).toBe(69_750);
        expect(SV_2026.bbgRvAv.wert).toBe(101_400);
    });

    it('begrenzt Arbeitnehmer- und Arbeitgeberbeiträge an den neuen Grenzen', () => {
        const r = berechne(eingabe());
        expect(r.sozialabgaben).toMatchObject({
            rv: 9876.60, av: 1380.60, kv: 6923.25, pv: 2103.75,
        });
        expect(r.arbeitgeber).toMatchObject({
            rv: 9876.60, av: 1380.60, kv: 6923.25, pv: 1514.70,
        });
    });

    it('lässt Beiträge bis zur jeweiligen Grenze steigen und kappt erst dort', () => {
        // Je 120 EUR Jahresbrutto unter/über der jeweiligen Grenze.
        for (const [grenze, zweig, darunter, maximum] of [
            [76_500, 'kv', 6912.39, 6923.25],
            [84_150, 'pv', 2100.75, 2103.75],
            [106_200, 'rv', 9865.44, 9876.60],
            [106_200, 'av', 1379.04, 1380.60],
        ] as const) {
            expect(berechne(eingabe({ bruttoJahr: grenze - 120 })).sozialabgaben[zweig]).toBe(darunter);
            expect(berechne(eingabe({ bruttoJahr: grenze })).sozialabgaben[zweig]).toBe(maximum);
            expect(berechne(eingabe({ bruttoJahr: grenze + 120 })).sozialabgaben[zweig]).toBe(maximum);
        }
    });

    it('berechnet Pflege oberhalb der KV-Grenze weiter, auch in Sachsen und mit Kindern', () => {
        const r = berechne(eingabe({ bruttoJahr: 80_000, bundesland: 'SN', kinderFuerPflege: 2 }));
        expect(r.sozialabgaben.kv).toBe(6923.25);
        expect(r.sozialabgaben.pv).toBe(1640);
        expect(r.arbeitgeber.pv).toBe(1040);
    });

    it('verwendet getrennte Grenzen auch für den PKV-Höchstzuschuss', () => {
        expect(maximalerPkvZuschuss('BE', 3.5, SV_2027_ENTWURF)).toEqual({
            kv: 576.94, pv: 126.23, summe: 703.16,
        });
        expect(maximalerPkvZuschuss('SN', 3.5, SV_2027_ENTWURF)).toEqual({
            kv: 576.94, pv: 91.16, summe: 668.10,
        });
        const r = berechne(eingabe({
            krankenversicherung: 'privat', pkvMonatsbeitrag: 2000,
            pkvArbeitgeberzuschussMonat: 1000,
        }));
        expect(r.arbeitgeber.kv).toBe(8437.95);
        expect(r.sozialabgaben.kv).toBe(15562.05);
    });

    it('verwendet neue Rentengrenze und Durchschnittsentgelt auch in der Teilzeitanalyse', () => {
        const punkte = teilzeitanalyse(eingabe(), 40, [100, 80]);
        expect(punkte[0].entgeltpunkte).toBe(1.9868); // 106.200 / 53.452
        expect(punkte[1].entgeltpunkte).toBe(1.796); // 96.000 / 53.452
        const heute = teilzeitanalyse(eingabe({ szenarioId: null }), 40, [100]);
        expect(heute[0].entgeltpunkte).toBe(1.9521); // 101.400 / 51.944
    });

    it('benennt die Grenze der Steuer-Modellrechnung', () => {
        expect(RECHTSSTAND_2027.nichtModelliert.join(' ')).toContain('Vorsorgepauschale');
    });
});
