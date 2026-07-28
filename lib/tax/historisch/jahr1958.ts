import { Parameter, Quelle, belegt } from '../parameter/typen';
import { euroRunden, runden } from '../runden';

/**
 * Historischer Vergleich: Einkommensteuer und Sozialabgaben 1958
 * ==============================================================
 *
 * 1958 ist das Geburtsjahr des heutigen Einkommensteuertarifs (Formeltarif
 * nach § 32a EStG) und des Ehegattensplittings. Der Vergleich beantwortet die
 * Frage: "Was waere von meinem heutigen Einkommen nach den Regeln von 1958
 * uebrig geblieben?"
 *
 * GRENZEN DIESES VERGLEICHS - bitte in der Oberflaeche sichtbar halten:
 * siehe NICHT_MODELLIERT weiter unten.
 */

const BMF_TARIFHISTORIE: Quelle = {
    herausgeber: 'Bundesministerium der Finanzen',
    titel: 'Übersicht über die Tarifgeschichte der Einkommensteuer',
    fundstelle: 'Einkommensteuertarif 1958 (gültig 1958–1964), § 32a EStG',
    url: 'https://www.bmf-steuerrechner.de/javax.faces.resource/2025_10_14_Tarifhistorie_Steuerrechner.pdf.xhtml',
    stand: '2025-10-14',
};

const ANLAGE_2_SGB_VI: Quelle = {
    herausgeber: 'Gesetzgeber',
    titel: 'Anlage 2 SGB VI - Beitragsbemessungsgrenzen',
    fundstelle: 'Beitragsbemessungsgrenze der allgemeinen Rentenversicherung 1958: 9.000 DM',
    url: 'https://www.gesetze-im-internet.de/sgb_6/anlage_2.html',
    stand: '2026-07-27',
};

const BSS_BEITRAGSSAETZE: Quelle = {
    herausgeber: 'Bundesamt für Soziale Sicherung',
    titel: 'Beitragssätze zur gesetzlichen Rentenversicherung ab 1957',
    fundstelle: 'gültig ab 1. Juni 1957: 14,00 % (allgemeine Rentenversicherung)',
    url: 'https://www.bundesamtsozialesicherung.de/fileadmin/redaktion/Rentenversicherung/Beitraege/Beitragssaetze_ab_1957.pdf',
    stand: '2026-07-27',
};

const BA_GESCHICHTE: Quelle = {
    herausgeber: 'Bundesagentur für Arbeit',
    titel: 'Die Geschichte der deutschen Arbeitsverwaltung',
    fundstelle:
        'Senkung des Beitragssatzes zur Arbeitslosenversicherung von 3 % auf 2 % zum 01.04.1957',
    url: 'https://www.arbeitsagentur.de/datei/broschuere-arbeitsverwaltung_ba026895.pdf',
    stand: '2026-07-27',
};

const GKV_ZEITREIHE: Quelle = {
    herausgeber: 'sozialpolitik-aktuell.de / Statistisches Bundesamt',
    titel: 'Durchschnittlicher Beitragssatz der gesetzlichen Krankenversicherung, Zeitreihe',
    fundstelle: 'Stützstellen: 1957 = 7,80 %, 1960 = 8,40 %',
    stand: '2026-07-27',
};

const BUNDESBANK_KAUFKRAFT: Quelle = {
    herausgeber: 'Deutsche Bundesbank',
    titel: 'Kaufkraftäquivalente historischer Beträge in deutschen Währungen',
    fundstelle:
        'D-Mark 1958: 2,86 - "Die Kaufkraft einer D-Mark aus dem Jahr 1958 entspräche 2,86 Euro ' +
        'im Durchschnitt des Jahres 2025."',
    url: 'https://www.bundesbank.de/de/statistiken/konjunktur-und-preise/-/kaufkraftaequivalente-historischer-betraege-in-deutschen-waehrungen-615162',
    stand: '2026-01-01',
};

const DRV_DURCHSCHNITTSENTGELT: Quelle = {
    herausgeber: 'Gesetzgeber / Deutsche Rentenversicherung',
    titel: 'Anlage 1 SGB VI - Durchschnittsentgelt',
    fundstelle: '1958: 5.330 DM; 2026 (vorläufig): 51.944 EUR',
    stand: '2026-01-01',
};

export interface Parameter1958 {
    grundfreibetragDm: Parameter<number>;
    rvSatz: Parameter<number>;
    avSatz: Parameter<number>;
    kvSatz: Parameter<number>;
    bbgRvAvDm: Parameter<number>;
    bbgKvDm: Parameter<number>;
    werbungskostenDm: Parameter<number>;
    sonderausgabenDm: Parameter<number>;
    durchschnittsentgeltDm: Parameter<number>;
    durchschnittsentgelt2026Eur: Parameter<number>;
    kaufkraftfaktor: Parameter<number>;
}

export const P1958: Parameter1958 = {
    grundfreibetragDm: belegt(1680, BMF_TARIFHISTORIE, 1958, { einheit: 'DM/Jahr' }),
    rvSatz: belegt(0.14, BSS_BEITRAGSSAETZE, 1957, {
        hinweis: 'Gesamtbeitrag; Arbeitnehmer und Arbeitgeber je zur Hälfte, also 7,0 %.',
    }),
    avSatz: {
        wert: 0.02,
        rechtsstatus: 'geltendes_recht',
        belastbarkeit: 'belegt',
        quelle: BA_GESCHICHTE,
        gueltigAb: 1957,
        hinweis:
            'Gesamtbeitrag; Arbeitnehmeranteil 1,0 %. Bis zur Rentenreform 1957 waren es 3,0 %. ' +
            'Frühere Fassungen dieses Rechners setzten irrtümlich 1,0 % Gesamtbeitrag an.',
    },
    kvSatz: {
        wert: 0.08,
        rechtsstatus: 'geltendes_recht',
        belastbarkeit: 'interpoliert',
        quelle: GKV_ZEITREIHE,
        gueltigAb: 1958,
        hinweis:
            'Zwischen den belegten Stützstellen 1957 (7,80 %) und 1960 (8,40 %) interpoliert. ' +
            'Ein exakter Jahreswert für 1958 aus einer Primärquelle lag nicht vor. Der ' +
            'Arbeitnehmeranteil beträgt die Hälfte, also rund 4,0 %.',
    },
    bbgRvAvDm: belegt(9000, ANLAGE_2_SGB_VI, 1958, { einheit: 'DM/Jahr' }),
    bbgKvDm: {
        wert: 6750,
        rechtsstatus: 'geltendes_recht',
        belastbarkeit: 'hergeleitet',
        quelle: ANLAGE_2_SGB_VI,
        gueltigAb: 1958,
        einheit: 'DM/Jahr',
        hinweis:
            'Hergeleitet als 75 % der Beitragsbemessungsgrenze der Rentenversicherung. Die Regel ' +
            'lässt sich am belegten Wert für 1960 prüfen: 7.650 DM entsprechen genau 75 % von ' +
            '10.200 DM. Ein direkter Beleg für 1958 lag nicht vor.',
    },
    werbungskostenDm: belegt(564, BMF_TARIFHISTORIE, 1958, { einheit: 'DM/Jahr' }),
    sonderausgabenDm: belegt(36, BMF_TARIFHISTORIE, 1958, { einheit: 'DM/Jahr' }),
    durchschnittsentgeltDm: belegt(5330, DRV_DURCHSCHNITTSENTGELT, 1958, { einheit: 'DM/Jahr' }),
    durchschnittsentgelt2026Eur: belegt(51944, DRV_DURCHSCHNITTSENTGELT, 2026, {
        einheit: 'EUR/Jahr',
    }),
    kaufkraftfaktor: {
        wert: 2.86,
        rechtsstatus: 'geltendes_recht',
        belastbarkeit: 'belegt',
        quelle: BUNDESBANK_KAUFKRAFT,
        gueltigAb: 1958,
        hinweis:
            'Bezugsjahr ist der Durchschnitt 2025, nicht 2026. Für einen Vergleich in Preisen von ' +
            '2026 wäre der Faktor entsprechend der Inflation 2026 etwas höher.',
    },
};

/** Was dieser Vergleich bewusst nicht abbildet. */
export const NICHT_MODELLIERT: string[] = [
    'Kinderfreibeträge und Kinderermäßigungen des Einkommensteuerrechts 1958.',
    'Die Höchstbeträge für Sonderausgaben: 1958 waren Vorsorgeaufwendungen nur begrenzt ' +
        'abziehbar. Dieser Rechner zieht sie in voller Höhe ab und weist die Steuer 1958 damit ' +
        'tendenziell zu niedrig und das Netto zu hoch aus.',
    'Weitere Freibeträge des Lohnsteuerrechts 1958 (u. a. Arbeitnehmer- und Weihnachtsfreibetrag).',
    'Die Vermögensteuer, die bis 1996 erhoben wurde und den Staatshaushalt mitfinanzierte.',
    'Die völlig andere Leistungsseite: keine Pflegeversicherung, deutlich geringere Renten- und ' +
        'Gesundheitsleistungen, kein Kindergeld in heutiger Form, keine Elterngeldregelungen.',
    'Die andere Struktur der indirekten Steuern (Umsatzsteuer 1958: 4 % im Allphasensystem).',
];

export type Bereinigung = 'lohn' | 'preis';
export type Veranlagung1958 = 'einzel' | 'zusammen';

export interface Eingabe1958 {
    /** Heutiges Bruttojahresgehalt in Euro. */
    bruttoJahrEur: number;
    bereinigung: Bereinigung;
    /**
     * Zusammenveranlagung mit Ehegattensplitting. Splitting auf ein
     * Einzeleinkommen entspricht dem Alleinverdiener-Haushalt. Verdienen beide
     * Partner, ist `einzel` die richtige Wahl fuer den Einzelvergleich.
     */
    veranlagung: Veranlagung1958;
    kirchensteuer: boolean;
    bundesland: string;
}

export interface Ergebnis1958 {
    /** Umrechnungsfaktor Euro (2026) -> DM (1958). */
    faktorEurNachDm: number;
    faktorDmNachEur: number;
    bruttoDm: number;
    zvEDm: number;
    einkommensteuerDm: number;
    kirchensteuerDm: number;
    rvDm: number;
    avDm: number;
    kvDm: number;
    sozialabgabenDm: number;
    nettoDm: number;
    /** Alle Werte zurueckskaliert in heutige Euro. */
    inEuro: {
        brutto: number;
        einkommensteuer: number;
        kirchensteuer: number;
        steuernGesamt: number;
        rv: number;
        av: number;
        kv: number;
        pv: number;
        sozialabgaben: number;
        netto: number;
        nettoMonat: number;
    };
    abgabenquote: number;
    grenzabgabenquote: number;
    hinweise: string[];
}

/** Einkommensteuertarif 1958 in DM (§ 32a EStG i. d. F. 1958-1964). */
export function einkommensteuer1958Dm(zvEDm: number): number {
    const x = Math.floor(Math.max(0, zvEDm));
    if (x <= 1680) return 0;
    if (x <= 8009) return Math.floor(0.2 * (x - 1680));
    if (x <= 23999) {
        const y = (x - 8000) / 1000;
        return Math.floor(1264 + 272 * y + 2.9 * y * y);
    }
    if (x <= 110039) {
        const y = (x - 24000) / 1000;
        return Math.floor(6358 + 382 * y + 1.572 * y * y - 0.006 * y * y * y);
    }
    return Math.floor(0.53 * x - 11281);
}

/**
 * Einkommensteuer mit oder ohne Ehegattensplitting.
 *
 * Das Splittingverfahren gilt seit 1958 fuer zusammen veranlagte Ehegatten
 * (§ 26b, § 32a Abs. 5 EStG). Es wird deshalb nur bei ausdruecklicher
 * Zusammenveranlagung angewandt - nicht pauschal fuer alle Lohnsteuerklassen,
 * die heute Verheiratete kennzeichnen.
 */
export function einkommensteuer1958(zvEDm: number, veranlagung: Veranlagung1958): number {
    if (veranlagung === 'zusammen') return 2 * einkommensteuer1958Dm(zvEDm / 2);
    return einkommensteuer1958Dm(zvEDm);
}

export function umrechnungsfaktoren(bereinigung: Bereinigung) {
    if (bereinigung === 'lohn') {
        const dmNachEur =
            P1958.durchschnittsentgelt2026Eur.wert / P1958.durchschnittsentgeltDm.wert;
        return { eurNachDm: 1 / dmNachEur, dmNachEur };
    }
    return { eurNachDm: 1 / P1958.kaufkraftfaktor.wert, dmNachEur: P1958.kaufkraftfaktor.wert };
}

export function berechne1958(e: Eingabe1958): Ergebnis1958 {
    const { eurNachDm, dmNachEur } = umrechnungsfaktoren(e.bereinigung);
    const bruttoDm = e.bruttoJahrEur * eurNachDm;

    const rvDm = (P1958.rvSatz.wert / 2) * Math.min(bruttoDm, P1958.bbgRvAvDm.wert);
    const avDm = (P1958.avSatz.wert / 2) * Math.min(bruttoDm, P1958.bbgRvAvDm.wert);
    const kvDm = (P1958.kvSatz.wert / 2) * Math.min(bruttoDm, P1958.bbgKvDm.wert);
    const svDm = rvDm + avDm + kvDm;

    const zvEDm = Math.max(
        0,
        bruttoDm - svDm - P1958.werbungskostenDm.wert - P1958.sonderausgabenDm.wert
    );

    const estDm = einkommensteuer1958(zvEDm, e.veranlagung);
    const kistSatz = ['BY', 'BW'].includes(e.bundesland.toUpperCase()) ? 0.08 : 0.09;
    const kistDm = e.kirchensteuer ? estDm * kistSatz : 0;
    const nettoDm = bruttoDm - svDm - estDm - kistDm;

    const eur = (dm: number) => euroRunden(dm * dmNachEur);

    // Grenzabgabenquote: 100 DM mehr zvE
    const estOben = einkommensteuer1958(zvEDm + 100, e.veranlagung);
    const grenz = ((estOben - estDm) * (1 + kistSatz * (e.kirchensteuer ? 1 : 0))) / 100;

    const hinweise: string[] = [];
    if (e.veranlagung === 'zusammen') {
        hinweise.push(
            'Ehegattensplitting angewendet. Das entspricht einem Haushalt mit einem Einkommen. ' +
                'Verdienen beide Partner, fällt der Splittingvorteil deutlich kleiner aus.'
        );
    }
    hinweise.push(
        e.bereinigung === 'lohn'
            ? `Lohnbereinigt: Dein Gehalt wird auf die gleiche relative Position auf der ` +
              `Einkommensskala von 1958 umgerechnet (Durchschnittsentgelt 5.330 DM gegenüber ` +
              `51.944 € heute).`
            : `Preisbereinigt: Dein Gehalt wird über die Preisentwicklung umgerechnet ` +
              `(1 DM von 1958 entspricht 2,86 € im Durchschnitt des Jahres 2025, Quelle: Bundesbank). ` +
              `Weil die Reallöhne seither stark gestiegen sind, entspricht ein heutiges ` +
              `Durchschnittsgehalt kaufkraftbereinigt einem sehr hohen Einkommen von 1958.`
    );

    const bruttoEur = euroRunden(e.bruttoJahrEur);
    const steuernEur = eur(estDm + kistDm);
    const svEur = eur(svDm);
    const nettoEur = eur(nettoDm);

    return {
        faktorEurNachDm: runden(eurNachDm, 6),
        faktorDmNachEur: runden(dmNachEur, 6),
        bruttoDm: runden(bruttoDm, 2),
        zvEDm: runden(zvEDm, 2),
        einkommensteuerDm: runden(estDm, 2),
        kirchensteuerDm: runden(kistDm, 2),
        rvDm: runden(rvDm, 2),
        avDm: runden(avDm, 2),
        kvDm: runden(kvDm, 2),
        sozialabgabenDm: runden(svDm, 2),
        nettoDm: runden(nettoDm, 2),
        inEuro: {
            brutto: bruttoEur,
            einkommensteuer: eur(estDm),
            kirchensteuer: eur(kistDm),
            steuernGesamt: steuernEur,
            rv: eur(rvDm),
            av: eur(avDm),
            kv: eur(kvDm),
            pv: 0,
            sozialabgaben: svEur,
            netto: nettoEur,
            nettoMonat: euroRunden(nettoEur / 12),
        },
        abgabenquote: bruttoEur > 0 ? runden(((steuernEur + svEur) / bruttoEur) * 100, 2) : 0,
        grenzabgabenquote: runden(Math.min(53 * 1.09, grenz * 100), 2),
        hinweise,
    };
}
