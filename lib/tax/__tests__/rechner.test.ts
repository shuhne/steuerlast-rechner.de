import { describe, it, expect } from 'vitest';
import { berechne, RechnerEingabe } from '../rechner';
import { berechneSozialabgaben, maximalerPkvZuschuss } from '../sozialabgaben';
import { beitragsabschlaegePflege, kinderlosenzuschlagPflege } from '../lohnsteuer';

const basis = (o: Partial<RechnerEingabe> = {}): RechnerEingabe => ({
    bruttoJahr: 60000,
    steuerklasse: 1,
    bundesland: 'BE',
    kirchensteuer: false,
    alter: 30,
    kinderfreibetraege: 0,
    kinderFuerPflege: 0,
    krankenversicherung: 'gesetzlich',
    kvZusatzProzent: 2.9,
    ...o,
});

describe('Sozialabgaben', () => {
    it('Regelfall: Arbeitnehmeranteile bei 50.000 EUR, kinderlos, Berlin', () => {
        const r = berechneSozialabgaben({
            bruttoJahr: 50000,
            bundesland: 'BE',
            kvZusatzProzent: 2.9,
            kinderFuerPflege: 0,
            alter: 30,
            krankenversicherung: { art: 'gesetzlich' },
        });
        expect(r.art).toBe('regulaer');
        expect(r.arbeitnehmer.rv).toBeCloseTo(50000 * 0.093, 2); // 4.650,00
        expect(r.arbeitnehmer.av).toBeCloseTo(50000 * 0.013, 2); // 650,00
        expect(r.arbeitnehmer.kv).toBeCloseTo(50000 * (0.073 + 0.0145), 2); // 4.375,00
        expect(r.arbeitnehmer.pv).toBeCloseTo(50000 * (0.018 + 0.006), 2); // 1.200,00
        expect(r.arbeitnehmer.summe).toBeCloseTo(10875, 2);
    });

    it('Beitragsbemessungsgrenzen greifen', () => {
        const r = berechneSozialabgaben({
            bruttoJahr: 150000,
            bundesland: 'BE',
            kvZusatzProzent: 2.9,
            kinderFuerPflege: 0,
            alter: 30,
            krankenversicherung: { art: 'gesetzlich' },
        });
        expect(r.arbeitnehmer.rv).toBeCloseTo(101400 * 0.093, 2);
        expect(r.arbeitnehmer.av).toBeCloseTo(101400 * 0.013, 2);
        expect(r.arbeitnehmer.kv).toBe(6103.13); // 69.750 x 8,75 %, kaufmaennisch gerundet
        expect(r.arbeitnehmer.pv).toBeCloseTo(69750 * 0.024, 2);
    });

    it('Sachsen: Arbeitnehmer traegt 2,3 % statt 1,8 % Pflegeversicherung', () => {
        const mitKind = (land: string) =>
            berechneSozialabgaben({
                bruttoJahr: 50000,
                bundesland: land,
                kvZusatzProzent: 2.9,
                kinderFuerPflege: 1,
                alter: 30,
                krankenversicherung: { art: 'gesetzlich' },
            }).arbeitnehmer.pv;
        expect(mitKind('SN') - mitKind('BE')).toBeCloseTo(50000 * 0.005, 2);
    });

    it('Abschlaege ab dem 2. bis 5. Kind, danach nicht mehr', () => {
        expect(beitragsabschlaegePflege(0)).toBe(0);
        expect(beitragsabschlaegePflege(1)).toBe(0);
        expect(beitragsabschlaegePflege(2)).toBe(1);
        expect(beitragsabschlaegePflege(5)).toBe(4);
        expect(beitragsabschlaegePflege(9)).toBe(4);
    });

    it('Kinderlosenzuschlag erst ab dem 24. Lebensjahr', () => {
        expect(kinderlosenzuschlagPflege(0, 22)).toBe(false);
        expect(kinderlosenzuschlagPflege(0, 23)).toBe(true);
        expect(kinderlosenzuschlagPflege(1, 40)).toBe(false);
    });

    describe('Übergangsbereich (§ 20 Abs. 2a SGB IV)', () => {
        const bei = (monat: number) =>
            berechneSozialabgaben({
                bruttoJahr: monat * 12,
                bundesland: 'BE',
                kvZusatzProzent: 2.9,
                kinderFuerPflege: 0,
                alter: 30,
                krankenversicherung: { art: 'gesetzlich' },
            });

        it('greift zwischen 603,01 und 2.000 EUR im Monat', () => {
            expect(bei(600).art).toBe('minijob');
            expect(bei(700).art).toBe('uebergangsbereich');
            expect(bei(2000).art).toBe('uebergangsbereich');
            expect(bei(2000.01).art).toBe('regulaer');
        });

        it('an der Untergrenze zahlt der Arbeitnehmer nichts', () => {
            const r = bei(603.01);
            expect(r.arbeitnehmer.summe).toBeLessThan(1);
        });

        it('an der Obergrenze entspricht der Beitrag exakt dem Regelfall', () => {
            const uebergang = bei(2000);
            const regulaer = bei(2000.01);
            // 2.000,00 EUR ist der letzte Punkt des Uebergangsbereichs; dort ist
            // die Bemessungsgrundlage des Arbeitnehmers gleich dem Arbeitsentgelt.
            expect(uebergang.arbeitnehmer.summe).toBeCloseTo(
                (regulaer.arbeitnehmer.summe / (2000.01 * 12)) * (2000 * 12),
                0
            );
        });

        it('entlastet den Arbeitnehmer gegenueber dem Regelfall', () => {
            const r = bei(1200);
            const ohne = 1200 * 12 * (0.093 + 0.013 + 0.0875 + 0.024);
            expect(r.arbeitnehmer.summe).toBeLessThan(ohne);
            // Der Gesamtbeitrag bleibt trotzdem hoch: der Arbeitgeber traegt mehr.
            expect(r.arbeitgeber.summe).toBeGreaterThan(r.arbeitnehmer.summe);
        });
    });

    it('Maximaler Arbeitgeberzuschuss zur PKV 2026', () => {
        const z = maximalerPkvZuschuss('BE', 2.9);
        expect(z.kv).toBeCloseTo(508.59, 2);
        expect(z.pv).toBe(104.63); // 5.812,50 x 1,8 %
        expect(z.summe).toBe(613.22);
        expect(maximalerPkvZuschuss('SN', 2.9).pv).toBe(75.56);
    });
});

describe('Rechner', () => {
    it('Netto = Brutto minus Steuern minus Arbeitnehmerbeitraege', () => {
        const r = berechne(basis());
        expect(r.netto.jahr).toBeCloseTo(
            r.brutto - r.steuern.summe - r.sozialabgaben.summe,
            2
        );
    });

    it('60.000 EUR StKl I entspricht der amtlichen Prueftabelle', () => {
        const r = berechne(basis({ bruttoJahr: 60000 }));
        expect(r.steuern.lohnsteuer).toBe(9389); // Prueftabelle 2026, StKl I
        expect(r.steuern.soli).toBe(0);
        expect(r.sozialabgaben.summe).toBeCloseTo(13050, 2);
        expect(r.netto.jahr).toBeCloseTo(37561, 2);
    });

    it('100.000 EUR StKl I: Lohnsteuer und Soli amtlich korrekt', () => {
        const r = berechne(basis({ bruttoJahr: 100000 }));
        expect(r.steuern.lohnsteuer).toBe(23248); // Prueftabelle 2026
        // Milderungszone: min(5,5 % von 23.248; 11,9 % von (23.248 - 20.350))
        expect(r.steuern.soli).toBeCloseTo(344.86, 2);
    });

    it('Grenzabgabenquote liegt deutlich ueber der reinen Grenzsteuerquote', () => {
        const r = berechne(basis({ bruttoJahr: 60000 }));
        expect(r.quoten.grenzabgabenquote).toBeGreaterThan(r.quoten.grenzsteuerquote + 15);
        expect(r.quoten.grenzabgabenquote).toBeGreaterThan(45);
        expect(r.quoten.grenzabgabenquote).toBeLessThan(60);
    });

    it('Grenzabgabenquote faellt oberhalb der Beitragsbemessungsgrenzen', () => {
        const unterhalb = berechne(basis({ bruttoJahr: 60000 })).quoten.grenzabgabenquote;
        const oberhalb = berechne(basis({ bruttoJahr: 130000 })).quoten.grenzabgabenquote;
        expect(oberhalb).toBeLessThan(unterhalb);
    });

    it('Arbeitgeberkosten liegen ueber dem Bruttolohn', () => {
        const r = berechne(basis({ bruttoJahr: 60000 }));
        expect(r.arbeitgeber.gesamtkosten).toBeGreaterThan(60000);
        expect(r.arbeitgeber.gesamtkosten).toBeCloseTo(60000 + r.arbeitgeber.summe, 2);
    });

    it('PKV: Arbeitgeberzuschuss mindert den Arbeitnehmerbeitrag', () => {
        const r = berechne(
            basis({
                bruttoJahr: 100000,
                krankenversicherung: 'privat',
                pkvMonatsbeitrag: 700,
                pkvArbeitgeberzuschussMonat: 'maximal',
            })
        );
        // Zuschuss ist auf die Haelfte des Beitrags begrenzt: 350 EUR/Monat
        expect(r.sozialabgaben.kv).toBeCloseTo(350 * 12, 2);
        expect(r.arbeitgeber.kv).toBeCloseTo(350 * 12, 2);
    });

    it('PKV: hoher Beitrag wird auf den Hoechstzuschuss begrenzt', () => {
        const r = berechne(
            basis({
                bruttoJahr: 150000,
                krankenversicherung: 'privat',
                pkvMonatsbeitrag: 1500,
                pkvArbeitgeberzuschussMonat: 'maximal',
            })
        );
        expect(r.arbeitgeber.kv).toBeCloseTo(613.22 * 12, 1);
    });

    it('Sonstige Bezuege werden gesondert versteuert', () => {
        const ohne = berechne(basis({ bruttoJahr: 60000 }));
        const mit = berechne(basis({ bruttoJahr: 60000, sonstigeBezuege: 5000 }));
        expect(mit.steuern.lohnsteuerSonstigeBezuege).toBeGreaterThan(0);
        expect(mit.steuern.summe).toBeGreaterThan(ohne.steuern.summe);
        // Auf sonstige Bezuege wirkt der Grenzsteuersatz, nicht der Durchschnittssatz
        const quote = mit.steuern.lohnsteuerSonstigeBezuege / 5000;
        expect(quote).toBeGreaterThan(ohne.steuern.lohnsteuer / 60000);
    });

    it('ELStAM-Freibetrag senkt die Lohnsteuer', () => {
        const ohne = berechne(basis({ bruttoJahr: 60000 }));
        const mit = berechne(basis({ bruttoJahr: 60000, jahresfreibetrag: 3000 }));
        expect(mit.steuern.lohnsteuer).toBeLessThan(ohne.steuern.lohnsteuer);
    });

    it('Kirchensteuer 9 % bzw. 8 % der Bemessungsgrundlage', () => {
        const be = berechne(basis({ kirchensteuer: true, bundesland: 'BE' }));
        const by = berechne(basis({ kirchensteuer: true, bundesland: 'BY' }));
        expect(be.steuern.kirchensteuer / by.steuern.kirchensteuer).toBeCloseTo(9 / 8, 3);
    });

    it('Kirchensteuer-Kappung begrenzt auf Prozentsatz des zvE', () => {
        const ohne = berechne(basis({ bruttoJahr: 400000, kirchensteuer: true }));
        const mit = berechne(
            basis({ bruttoJahr: 400000, kirchensteuer: true, kirchensteuerKappungProzent: 3.0 })
        );
        expect(mit.steuern.kirchensteuer).toBeLessThan(ohne.steuern.kirchensteuer);
        // Ohne Kappung liegt die Kirchensteuer ueber 3 % des zvE, mit Kappung darunter.
        const zvE = 400000 - mit.sozialabgaben.summe - 1230 - 36;
        expect(mit.steuern.kirchensteuer).toBeLessThanOrEqual(zvE * 0.03 + 0.01);
    });

    it('Szenario 2027 erhoeht die Belastung und ist als Entwurf gekennzeichnet', () => {
        const heute = berechne(basis({ bruttoJahr: 60000 }));
        const morgen = berechne(basis({ bruttoJahr: 60000, szenarioId: '2027-entwurf' }));
        expect(morgen.sozialabgaben.summe).toBeGreaterThan(heute.sozialabgaben.summe);
        expect(morgen.rechtsstand.rechtsstatus).toBe('referentenentwurf');
        expect(heute.rechtsstand.rechtsstatus).toBe('geltendes_recht');
    });

    it('Minijob wird erkannt und mit Hinweis versehen', () => {
        const r = berechne(basis({ bruttoJahr: 550 * 12 }));
        expect(r.sozialabgaben.art).toBe('minijob');
        expect(r.hinweise.join(' ')).toContain('Geringfügige Beschäftigung');
    });

    it('Nullbetrag liefert Nullen ohne Division durch Null', () => {
        const r = berechne(basis({ bruttoJahr: 0 }));
        expect(r.netto.jahr).toBe(0);
        expect(r.quoten.abgabenquote).toBe(0);
    });
});
