import { Parameter, Quelle, belegt } from './typen';

/**
 * Sozialversicherungsparameter
 * ============================
 *
 * Alle Werte mit Herkunft. Beim Jahreswechsel wird ausschliesslich diese
 * Datei angefasst - siehe docs/wissensspeicher/runbook-jahreswechsel.md.
 */

const SVBEZGRV_2026: Quelle = {
    herausgeber: 'Bundesregierung',
    titel: 'Verordnung über maßgebende Rechengrößen der Sozialversicherung für 2026 (SVBezGrV 2026)',
    fundstelle: 'BGBl. 2025 I, verkündet am 26.11.2025, in Kraft seit 01.01.2026',
    url: 'https://www.gesetze-im-internet.de/svbezgrv_2026/BJNR1160A0025.html',
    stand: '2026-01-01',
};

const BMG_ZUSATZBEITRAG_2026: Quelle = {
    herausgeber: 'Bundesministerium für Gesundheit',
    titel: 'Bekanntmachung des durchschnittlichen Zusatzbeitragssatzes für 2026',
    fundstelle: '§ 242a SGB V',
    url: 'https://www.bundesgesundheitsministerium.de/beitraege',
    stand: '2025-11-01',
};

const SGB_SAETZE: Quelle = {
    herausgeber: 'Gesetzgeber',
    titel: 'Beitragssätze der Sozialversicherung',
    fundstelle: '§ 157 SGB VI (RV), § 341 SGB III (AV), § 241 SGB V (KV), § 55 SGB XI (PV)',
    stand: '2026-01-01',
};

const BMAS_UEBERGANGSBEREICH_2026: Quelle = {
    herausgeber: 'Bundesministerium für Arbeit und Soziales',
    titel: 'Faktor F für den Übergangsbereich 2026',
    fundstelle: '§ 20 Abs. 2a SGB IV; Faktor F = 28 % / Gesamtsozialversicherungsbeitragssatz',
    stand: '2026-01-01',
};

export interface SvParameter {
    jahr: number;
    /** Beitragsbemessungsgrenze Renten-/Arbeitslosenversicherung, Euro/Jahr. */
    bbgRvAv: Parameter<number>;
    /** Beitragsbemessungsgrenze Krankenversicherung, Euro/Jahr. */
    bbgKv: Parameter<number>;
    /** Beitragsbemessungsgrenze Pflegeversicherung, Euro/Jahr. */
    bbgPv: Parameter<number>;
    /** Jahresarbeitsentgeltgrenze (Versicherungspflichtgrenze GKV), Euro/Jahr. */
    jaeg: Parameter<number>;
    /** Vorläufiges Durchschnittsentgelt der Rentenversicherung, Euro/Jahr. */
    durchschnittsentgelt: Parameter<number>;
    /** Beitragssatz Rentenversicherung, gesamt. */
    rvSatz: Parameter<number>;
    /** Beitragssatz Arbeitslosenversicherung, gesamt. */
    avSatz: Parameter<number>;
    /** Allgemeiner Beitragssatz Krankenversicherung, gesamt. */
    kvAllgemein: Parameter<number>;
    /** Durchschnittlicher Zusatzbeitrag Krankenversicherung, gesamt. */
    kvZusatzDurchschnitt: Parameter<number>;
    /** Allgemeiner Beitragssatz Pflegeversicherung, gesamt. */
    pvSatz: Parameter<number>;
    /** Zuschlag für Kinderlose, allein vom Arbeitnehmer zu tragen. */
    pvZuschlagKinderlose: Parameter<number>;
    /** Abschlag je Kind ab dem 2. bis 5. Kind, allein beim Arbeitnehmer. */
    pvAbschlagJeKind: Parameter<number>;
    /** Arbeitgeberanteil Pflegeversicherung in Sachsen (Buß- und Bettag). */
    pvArbeitgeberSachsen: Parameter<number>;
    /** Geringfügigkeitsgrenze (Minijob), Euro/Monat. */
    geringfuegigkeitsgrenze: Parameter<number>;
    /** Obere Grenze des Übergangsbereichs, Euro/Monat. */
    uebergangsbereichObergrenze: Parameter<number>;
    /** Faktor F des Übergangsbereichs. */
    faktorF: Parameter<number>;
    /** Gesetzlicher Mindestlohn, Euro/Stunde. */
    mindestlohn: Parameter<number>;
}

export const SV_2026: SvParameter = {
    jahr: 2026,
    bbgRvAv: belegt(101_400, SVBEZGRV_2026, 2026, { einheit: 'EUR/Jahr' }),
    bbgKv: belegt(69_750, SVBEZGRV_2026, 2026, { einheit: 'EUR/Jahr' }),
    bbgPv: belegt(69_750, SVBEZGRV_2026, 2026, { einheit: 'EUR/Jahr' }),
    jaeg: belegt(77_400, SVBEZGRV_2026, 2026, { einheit: 'EUR/Jahr' }),
    durchschnittsentgelt: belegt(51_944, SVBEZGRV_2026, 2026, {
        einheit: 'EUR/Jahr',
        hinweis: 'Vorläufiges Durchschnittsentgelt der allgemeinen Rentenversicherung.',
    }),
    rvSatz: belegt(0.186, SGB_SAETZE, 2018),
    avSatz: belegt(0.026, SGB_SAETZE, 2023),
    kvAllgemein: belegt(0.146, SGB_SAETZE, 2015),
    kvZusatzDurchschnitt: belegt(0.029, BMG_ZUSATZBEITRAG_2026, 2026, {
        hinweis:
            'Rechnerischer Durchschnittswert nach § 242a SGB V. Der tatsächlich gewichtete ' +
            'Durchschnitt der Kassen lag im Januar 2026 höher (rund 3,1 %). Der eigene ' +
            'Kassenbeitrag kann deutlich abweichen und ist im Rechner eingebbar.',
    }),
    pvSatz: belegt(0.036, SGB_SAETZE, 2025),
    pvZuschlagKinderlose: belegt(0.006, SGB_SAETZE, 2023, {
        hinweis: 'Ab dem 24. Lebensjahr, allein vom Arbeitnehmer zu tragen.',
    }),
    pvAbschlagJeKind: belegt(0.0025, SGB_SAETZE, 2023, {
        hinweis: 'Ab dem 2. bis zum 5. Kind unter 25 Jahren, also maximal 4 Abschläge.',
    }),
    pvArbeitgeberSachsen: belegt(0.013, SGB_SAETZE, 2025, {
        hinweis:
            'In Sachsen wurde der Buß- und Bettag nicht abgeschafft; der Arbeitgeberanteil ist ' +
            'deshalb um 0,5 Punkte niedriger, der Arbeitnehmeranteil entsprechend höher.',
    }),
    geringfuegigkeitsgrenze: belegt(603, BMAS_UEBERGANGSBEREICH_2026, 2026, {
        einheit: 'EUR/Monat',
        hinweis: 'Dynamisch: Mindestlohn × 130 / 3, aufgerundet. 13,90 × 130 / 3 = 603.',
    }),
    uebergangsbereichObergrenze: belegt(2_000, BMAS_UEBERGANGSBEREICH_2026, 2023, {
        einheit: 'EUR/Monat',
    }),
    faktorF: belegt(0.6619, BMAS_UEBERGANGSBEREICH_2026, 2026, {
        hinweis: '28 % / 42,3 % Gesamtsozialversicherungsbeitragssatz = 0,6619.',
    }),
    mindestlohn: belegt(13.9, {
        herausgeber: 'Bundesministerium für Arbeit und Soziales',
        titel: 'Fünfte Mindestlohnanpassungsverordnung (MiLoAV 5)',
        fundstelle: 'Kabinettsbeschluss 29.10.2025, gültig ab 01.01.2026; ab 01.01.2027: 14,60 EUR',
        url: 'https://www.bmas.de/DE/Service/Gesetze-und-Gesetzesvorhaben/fuenfte-mindestlohnanpassungsverordnung-milov5.html',
        stand: '2026-01-01',
    }, 2026, { einheit: 'EUR/Stunde' }),
};

/** Amtlich veröffentlichte Entwurfswerte; noch kein geltendes Recht für 2027. */
export const SVBEZGRV_2027_ENTWURF: Quelle = {
    herausgeber: 'Bundesministerium für Arbeit und Soziales',
    titel: 'Referentenentwurf zur Sozialversicherungsrechengrößen-Verordnung 2027',
    fundstelle: 'BMAS-Tabelle vom 21.09.2026; Kabinettsbeschluss und Bundesratszustimmung stehen aus',
    url: 'https://www.bmas.de/DE/Service/Presse/Meldungen/2026/referentenentwurf-zur-sozialversicherungsrechengroessen-verordnung-2027.html',
    stand: '2026-09-21',
};

export const PNOG_ENTWURF: Quelle = {
    herausgeber: 'Bundesministerium für Gesundheit',
    titel: 'Referentenentwurf Pflegeneuordnungsgesetz (PNOG)',
    fundstelle: 'Fassung vom 05.06.2026, Artikel 1 Nr. 48, § 55 Abs. 2 und 3 SGB XI (S. 46)',
    url: 'https://www.bundesgesundheitsministerium.de/fileadmin/Dateien/3_Downloads/Gesetze_und_Verordnungen/GuV/P/RefE-Pflegeneuordnungsgesetz_PNOG.pdf',
    stand: '2026-06-05',
};

function entwurfswert(wert: number, hinweis?: string): Parameter<number> {
    return belegt(wert, SVBEZGRV_2027_ENTWURF, 2027, {
        einheit: 'EUR/Jahr',
        rechtsstatus: 'referentenentwurf',
        hinweis,
    });
}

const JAEG_2027_ENTWURF = entwurfswert(84_150, 'Allgemeine Jahresarbeitsentgeltgrenze nach § 6 Abs. 6 SGB V.');

/** Rechengrößen 2027 im Szenario einschließlich des PNOG-Referentenentwurfs. */
export const SV_2027_ENTWURF: SvParameter = {
    ...SV_2026,
    jahr: 2027,
    bbgRvAv: entwurfswert(106_200),
    bbgKv: entwurfswert(76_500, 'Enthält bereits die zusätzliche Anhebung um 300 EUR monatlich; nicht erneut addieren.'),
    bbgPv: {
        ...JAEG_2027_ENTWURF,
        quelle: PNOG_ENTWURF,
        belastbarkeit: 'hergeleitet',
        hinweis: 'PNOG-Entwurf: Pflegegrenze entspricht § 6 Abs. 6 SGB V. Dessen Wert von ' +
            '84.150 EUR stammt aus der BMAS-Tabelle vom 21.09.2026 (SVBezGrV-Entwurf 2027). ' +
            'Ohne diese PNOG-Änderung gilt die Grenze nach § 6 Abs. 7 SGB V.',
    },
    jaeg: JAEG_2027_ENTWURF,
    durchschnittsentgelt: entwurfswert(53_452, 'Vorläufiges Durchschnittsentgelt 2027 der allgemeinen Rentenversicherung.'),
};

/** Bequemer Zugriff auf die reinen Werte. */
export function werte(p: SvParameter) {
    return {
        bbgRvAv: p.bbgRvAv.wert,
        bbgKv: p.bbgKv.wert,
        bbgPv: p.bbgPv.wert,
        jaeg: p.jaeg.wert,
        durchschnittsentgelt: p.durchschnittsentgelt.wert,
        rvSatz: p.rvSatz.wert,
        avSatz: p.avSatz.wert,
        kvAllgemein: p.kvAllgemein.wert,
        kvZusatzDurchschnitt: p.kvZusatzDurchschnitt.wert,
        pvSatz: p.pvSatz.wert,
        pvZuschlagKinderlose: p.pvZuschlagKinderlose.wert,
        pvAbschlagJeKind: p.pvAbschlagJeKind.wert,
        pvArbeitgeberSachsen: p.pvArbeitgeberSachsen.wert,
        geringfuegigkeitsgrenze: p.geringfuegigkeitsgrenze.wert,
        uebergangsbereichObergrenze: p.uebergangsbereichObergrenze.wert,
        faktorF: p.faktorF.wert,
        mindestlohn: p.mindestlohn.wert,
    };
}
