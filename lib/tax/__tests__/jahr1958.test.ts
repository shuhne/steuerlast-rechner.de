import { describe, it, expect } from 'vitest';
import {
    berechne1958,
    einkommensteuer1958Dm,
    einkommensteuer1958,
    umrechnungsfaktoren,
    P1958,
    NICHT_MODELLIERT,
} from '../historisch/jahr1958';

describe('Einkommensteuertarif 1958', () => {
    // Referenz: BMF, Uebersicht ueber die Tarifgeschichte der Einkommensteuer,
    // Einkommensteuertarif 1958 (1958-1964).
    it('Grundfreibetrag 1.680 DM', () => {
        expect(einkommensteuer1958Dm(1680)).toBe(0);
        expect(einkommensteuer1958Dm(1681)).toBe(0); // 0,2 * 1 = 0,2 -> abgerundet 0
        expect(einkommensteuer1958Dm(2000)).toBe(64); // 0,2 * 320
    });

    it('Proportionalzone 20 % bis 8.009 DM', () => {
        expect(einkommensteuer1958Dm(8009)).toBe(Math.floor(0.2 * (8009 - 1680)));
    });

    it('Progressionszone I: 1.264 + 272 Y + 2,9 Y²', () => {
        const y = (20000 - 8000) / 1000;
        expect(einkommensteuer1958Dm(20000)).toBe(Math.floor(1264 + 272 * y + 2.9 * y * y));
    });

    it('Progressionszone II: 6.358 + 382 Y + 1,572 Y² - 0,006 Y³', () => {
        const y = (50000 - 24000) / 1000;
        expect(einkommensteuer1958Dm(50000)).toBe(
            Math.floor(6358 + 382 * y + 1.572 * y * y - 0.006 * y ** 3)
        );
    });

    it('Spitzensteuersatz 53 % ab 110.040 DM', () => {
        const a = einkommensteuer1958Dm(200000);
        const b = einkommensteuer1958Dm(201000);
        expect((b - a) / 1000).toBeCloseTo(0.53, 2);
    });
});

describe('Ehegattensplitting 1958', () => {
    it('wird nur bei Zusammenveranlagung angewandt', () => {
        const zvE = 20000;
        expect(einkommensteuer1958(zvE, 'einzel')).toBe(einkommensteuer1958Dm(zvE));
        expect(einkommensteuer1958(zvE, 'zusammen')).toBe(2 * einkommensteuer1958Dm(zvE / 2));
    });

    it('Splitting senkt die Steuer im progressiven Bereich', () => {
        expect(einkommensteuer1958(30000, 'zusammen')).toBeLessThan(
            einkommensteuer1958(30000, 'einzel')
        );
    });

    it('Regression: Steuerklasse 4 und 5 duerfen nicht automatisch splitten', () => {
        // Frueher wurden die Steuerklassen 3, 4 UND 5 gesplittet, wodurch alle
        // drei identische Ergebnisse lieferten. Die Veranlagungsart ist jetzt
        // ein eigenstaendiger Parameter, es gibt keine Steuerklassen mehr.
        const einzel = berechne1958({
            bruttoJahrEur: 50000,
            bereinigung: 'lohn',
            veranlagung: 'einzel',
            kirchensteuer: false,
            bundesland: 'BE',
        });
        const zusammen = berechne1958({
            bruttoJahrEur: 50000,
            bereinigung: 'lohn',
            veranlagung: 'zusammen',
            kirchensteuer: false,
            bundesland: 'BE',
        });
        expect(einzel.einkommensteuerDm).toBeGreaterThan(zusammen.einkommensteuerDm);
    });
});

describe('Sozialabgaben 1958', () => {
    it('Arbeitnehmeranteile: RV 7,0 %, AV 1,0 %, KV rund 4,0 %', () => {
        const r = berechne1958({
            bruttoJahrEur: 51944, // entspricht lohnbereinigt genau dem Durchschnitt 1958
            bereinigung: 'lohn',
            veranlagung: 'einzel',
            kirchensteuer: false,
            bundesland: 'BE',
        });
        expect(r.bruttoDm).toBeCloseTo(5330, 0);
        expect(r.rvDm).toBeCloseTo(5330 * 0.07, 1);
        expect(r.avDm).toBeCloseTo(5330 * 0.01, 1);
        expect(r.kvDm).toBeCloseTo(5330 * 0.04, 1);
    });

    it('Beitragsbemessungsgrenzen 9.000 DM bzw. 6.750 DM greifen', () => {
        const r = berechne1958({
            bruttoJahrEur: 300000,
            bereinigung: 'lohn',
            veranlagung: 'einzel',
            kirchensteuer: false,
            bundesland: 'BE',
        });
        expect(r.rvDm).toBeCloseTo(9000 * 0.07, 2);
        expect(r.avDm).toBeCloseTo(9000 * 0.01, 2);
        expect(r.kvDm).toBeCloseTo(6750 * 0.04, 2);
    });

    it('Der AV-Satz ist der belegte Gesamtbeitrag von 2 %', () => {
        // Regression: frueher standen hier 1 % Gesamtbeitrag bzw. 0,5 % AN-Anteil.
        expect(P1958.avSatz.wert).toBe(0.02);
        expect(P1958.avSatz.quelle.herausgeber).toContain('Bundesagentur');
    });

    it('Unsichere Parameter sind als solche gekennzeichnet', () => {
        expect(P1958.kvSatz.belastbarkeit).toBe('interpoliert');
        expect(P1958.bbgKvDm.belastbarkeit).toBe('hergeleitet');
        expect(P1958.kvSatz.hinweis).toBeTruthy();
    });
});

describe('Umrechnung', () => {
    it('lohnbereinigt: Durchschnittsentgelt auf Durchschnittsentgelt', () => {
        const f = umrechnungsfaktoren('lohn');
        expect(f.dmNachEur).toBeCloseTo(51944 / 5330, 4);
    });

    it('preisbereinigt: Bundesbank-Faktor 2,86', () => {
        const f = umrechnungsfaktoren('preis');
        expect(f.dmNachEur).toBe(2.86);
    });

    it('Netto in Euro entspricht Netto in DM mal Faktor', () => {
        const r = berechne1958({
            bruttoJahrEur: 60000,
            bereinigung: 'lohn',
            veranlagung: 'einzel',
            kirchensteuer: false,
            bundesland: 'BE',
        });
        expect(r.inEuro.netto).toBeCloseTo(r.nettoDm * r.faktorDmNachEur, 1);
    });
});

describe('Transparenz', () => {
    it('Grenzen des Vergleichs sind dokumentiert', () => {
        expect(NICHT_MODELLIERT.length).toBeGreaterThanOrEqual(5);
        expect(NICHT_MODELLIERT.join(' ')).toContain('Sonderausgaben');
        expect(NICHT_MODELLIERT.join(' ')).toContain('Vermögensteuer');
    });

    it('Der Kaufkraftfaktor weist sein Bezugsjahr aus', () => {
        expect(P1958.kaufkraftfaktor.hinweis).toContain('2025');
    });
});
