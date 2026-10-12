import { describe, expect, it } from 'vitest';
import { berechne, RechnerEingabe } from '../rechner';
import { kinderlosenzuschlagPflege, berechneLohnsteuer } from '../lohnsteuer';
import { RechnerEingabeSchema } from '../validation';
import { teilzeitanalyse, gehaltskurve } from '../analysen';

const basis: RechnerEingabe = { bruttoJahr: 60000, steuerklasse: 1, bundesland: 'BE', kirchensteuer: false, alter: 30, kinderfreibetraege: 0, kinderFuerPflege: 0, krankenversicherung: 'gesetzlich', kvZusatzProzent: 2.9 };

describe('Regressionen aus der Browserprüfung', () => {
    it('unterscheidet Elternstatus, Kinder unter 25 und ELStAM-Zähler (§ 55 SGB XI)', () => {
        // 60.000 × 1,8 % = 1.080; zwei Kinder: 60.000 × 1,55 % = 930.
        const eltern = { ...basis, hatKinder: true, kinderfreibetraege: 0.5 };
        expect(berechne(eltern).sozialabgaben.pv).toBe(1080);
        expect(berechne({ ...eltern, kinderFuerPflege: 1 }).sozialabgaben.pv).toBe(1080);
        expect(berechne({ ...eltern, kinderFuerPflege: 2 }).sozialabgaben.pv).toBe(930);
        expect(berechne(basis).sozialabgaben.pv).toBe(1440);
        expect(kinderlosenzuschlagPflege(0, 40, true)).toBe(false);
        expect(berechne({ ...eltern, bundesland: 'SN' }).sozialabgaben.pv).toBe(1380);
    });
    it('verwendet den eigenen Zusatzbeitrag auch im Szenario', () => {
        const eingabe = { ...basis, szenarioId: '2027-entwurf', kvZusatzProzent: 4.5 };
        // 60.000 × (14,6 + 4,5) / 2 % = 5.730.
        expect(berechne({ ...eingabe, eigenerZusatzbeitrag: true }).sozialabgaben.kv).toBe(5730);
        expect(berechne(eingabe).sozialabgaben.kv).toBe(5430);
        expect(berechne({ ...eingabe, eigenerZusatzbeitrag: true }).steuern.lohnsteuer).toBeLessThan(berechne(eingabe).steuern.lohnsteuer);
    });
    it('berechnet Dezemberbonus mit der freien Jahres-BBG (§ 23a Abs. 3 SGB IV)', () => {
        const r = berechne({ ...basis, sonstigeBezuege: 12000 });
        // 72.000 × 9,3 % / 1,3 %; KV/PV auf 69.750 begrenzt.
        expect(r.sozialabgaben.rv).toBe(6696);
        expect(r.sozialabgaben.av).toBe(936);
        expect(r.sozialabgaben.kv).toBe(6103.13);
        expect(r.sozialabgaben.pv).toBe(1674);
        expect(r.arbeitgeber.pv).toBe(1255.5);
        expect(r.arbeitgeber.kv).toBe(6103.13);
        expect(r.netto.jahr).toBeCloseTo(72000 - r.steuern.summe - 15409.13, 2);
    });
    it('erhebt oberhalb der BBG keine weiteren Beiträge auf den Bonus', () => {
        const ohne = berechne({ ...basis, bruttoJahr: 120000 });
        const mit = berechne({ ...basis, bruttoJahr: 120000, sonstigeBezuege: 12000 });
        expect(mit.sozialabgaben).toEqual(ohne.sozialabgaben);
    });
    it('weist nicht modellierte Bonusfälle zurück und lässt sie aus Kurven aus', () => {
        const e = { ...basis, bruttoJahr: 30000, sonstigeBezuege: 1000 };
        expect(RechnerEingabeSchema.safeParse({ ...e, bruttoJahr: 24000 }).success).toBe(false);
        expect(() => berechne({ ...e, bruttoJahr: 24000 })).toThrow('nicht modelliert');
        expect(teilzeitanalyse(e, 40).every((p) => p.bruttoJahr > 24000)).toBe(true);
        expect(gehaltskurve(e).every((p) => p.bruttoJahr > 24000)).toBe(true);
    });
    it('weist fehlenden PKV-Beitrag zurück und verwendet den tatsächlich gezahlten Zuschuss im PAP', () => {
        expect(RechnerEingabeSchema.safeParse({ ...basis, krankenversicherung: 'privat' }).success).toBe(false);
        const e = { ...basis, bruttoJahr: 100000, krankenversicherung: 'privat' as const, pkvMonatsbeitrag: 700 };
        const steuer = berechneLohnsteuer({ ...e, jahresfreibetrag: 0, sonstigeBezuege: 0, arbeitslosenversicherungspflichtig: true, rentenversicherungspflichtig: true, kvZusatzbeitragProzent: 2.9, kinderFuerPflegeversicherung: 0, krankenversicherung: { art: 'privat', monatsbeitrag: 700, arbeitgeberzuschussMonat: 350 } });
        expect(berechne(e).steuern.lohnsteuer).toBe(steuer.lohnsteuer);
    });
});
