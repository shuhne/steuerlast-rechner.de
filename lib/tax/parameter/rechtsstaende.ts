import { Parameter, Quelle, Rechtsstatus } from './typen';
import { SV_2026, SV_2027_ENTWURF, SVBEZGRV_2027_ENTWURF, PNOG_ENTWURF, SvParameter } from './sozialversicherung';
import type { SvSaetze } from '../sozialabgaben';

/**
 * Rechtsstände und Zukunftsszenarien
 * ==================================
 *
 * Ein "Rechtsstand" ist ein vollstaendiger Parametersatz mit einem
 * ausgewiesenen rechtlichen Status. Die Oberflaeche zeigt diesen Status
 * sichtbar an; alles unterhalb von `geltendes_recht` wird als unsicher
 * gekennzeichnet.
 *
 * WICHTIG FUER AKTUALISIERUNGEN
 * -----------------------------
 * Politische Ankuendigungen werden hier NICHT als kuenftige Rechtslage
 * abgebildet. Wenn ein Vorhaben nicht quantifizierbar ist, wird es unter
 * `nichtModelliert` benannt statt geschaetzt.
 *
 * Siehe docs/wissensspeicher/reformmonitor.md
 */

const RVB_2025: Quelle = {
    herausgeber: 'Bundesregierung / BMAS',
    titel: 'Rentenversicherungsbericht 2025',
    fundstelle: 'BT-Drs. 21/3080, Übersicht B 2.1 (Beitragssätze 2025-2039, neun Modellvarianten)',
    url: 'https://dserver.bundestag.de/btd/21/030/2103080.pdf',
    stand: '2025-11-26',
};

const GKV_LUECKE_2027: Quelle = {
    herausgeber: 'IGES-Institut / BMG',
    titel: 'Finanzlücke der GKV 2027 und GKV-Beitragssatzstabilisierungsgesetz',
    fundstelle:
        'IGES: 11,8 Mrd. EUR ungedeckter Bedarf 2027 (rund +0,6 Punkte); BMG-Kabinettsentwurf: bis 15 Mrd. EUR (rund +0,75 Punkte)',
    stand: '2026-06-01',
};

const KOALITIONSAUSSCHUSS_2026: Quelle = {
    herausgeber: 'Koalitionsausschuss CDU/CSU und SPD',
    titel: 'Beschluss zur Einkommensteuerreform 2027',
    fundstelle:
        'Beschluss vom 01.07.2026: Entlastungsvolumen rund 10 Mrd. EUR/Jahr, Anhebung von ' +
        'Grundfreibetrag, Kinderfreibetrag, Kindergeld und Arbeitnehmer-Pauschbetrag, Abflachung ' +
        'der zweiten Progressionszone; Reichensteuersatz 45 % bereits ab 250.000 EUR, neue Stufe ' +
        '47 % ab 280.000 EUR; Minijob-Pauschsteuer 2 % auf 5 %',
    stand: '2026-07-01',
};

export interface Annahme {
    text: string;
    rechtsstatus: Rechtsstatus;
    quelle: Quelle;
}

export interface Rechtsstand {
    id: string;
    bezeichnung: string;
    /** Kurzlabel fuer Buttons und Chips. */
    kurz: string;
    jahr: number;
    rechtsstatus: Rechtsstatus;
    beschreibung: string;
    sv: SvParameter;
    svUeberschreibungen?: Partial<Omit<SvSaetze, 'kvZusatz'>> & { kvZusatz?: number };
    /** Multiplikator auf Lohnsteuer und Soli. Nur fuer eigene Annahmen. */
    steuerfaktor?: number;
    annahmen: Annahme[];
    /** Was dieses Szenario bewusst NICHT abbildet. */
    nichtModelliert: string[];
}

/**
 * Leitet einen Parametersatz kuenftiger Jahre ab: Beitragsbemessungsgrenzen
 * und Durchschnittsentgelt wachsen mit der unterstellten Lohnentwicklung.
 * Diese Fortschreibung ist eine eigene Annahme und wird so gekennzeichnet.
 */
function fortgeschrieben(
    basis: SvParameter,
    jahr: number,
    lohnwachstumProzentProJahr: number
): SvParameter {
    const jahre = jahr - basis.jahr;
    const faktor = Math.pow(1 + lohnwachstumProzentProJahr / 100, jahre);
    const skaliere = (p: Parameter<number>, rundeAuf: number): Parameter<number> => ({
        ...p,
        wert: Math.round((p.wert * faktor) / rundeAuf) * rundeAuf,
        rechtsstatus: 'eigene_annahme',
        belastbarkeit: 'hergeleitet',
        gueltigAb: jahr,
        hinweis:
            `Fortgeschrieben aus ${basis.jahr} mit ${lohnwachstumProzentProJahr} % Lohnwachstum p. a. ` +
            `Die tatsächlichen Werte legt die Sozialversicherungsrechengrößen-Verordnung jeweils ` +
            `im Herbst des Vorjahres fest.`,
    });

    return {
        ...basis,
        jahr,
        bbgRvAv: skaliere(basis.bbgRvAv, 600),
        bbgKv: skaliere(basis.bbgKv, 450),
        bbgPv: skaliere(basis.bbgPv, 450),
        jaeg: skaliere(basis.jaeg, 450),
        durchschnittsentgelt: skaliere(basis.durchschnittsentgelt, 1),
    };
}

/** Durchschnittliche Lohnentwicklung der letzten Jahre, als Fortschreibungsbasis. */
const LOHNWACHSTUM_ANNAHME = 4.0;

// ---------------------------------------------------------------------------
// S0 - Geltendes Recht
// ---------------------------------------------------------------------------

export const RECHTSSTAND_GELTEND: Rechtsstand = {
    id: '2026',
    bezeichnung: 'Geltendes Recht 2026',
    kurz: '2026',
    jahr: 2026,
    rechtsstatus: 'geltendes_recht',
    beschreibung:
        'Rechtslage zum 1. Januar 2026: amtlicher Programmablaufplan des BMF, ' +
        'Sozialversicherungsrechengrößen-Verordnung 2026 und die gesetzlichen Beitragssätze.',
    sv: SV_2026,
    annahmen: [],
    nichtModelliert: [],
};

// ---------------------------------------------------------------------------
// S1 - 2027 nach heutiger Beschluss- und Entwurfslage
// ---------------------------------------------------------------------------

export const RECHTSSTAND_2027: Rechtsstand = {
    id: '2027-entwurf',
    bezeichnung: '2027 nach heutiger Beschluss- und Entwurfslage',
    kurz: '2027',
    jahr: 2027,
    rechtsstatus: 'referentenentwurf',
    beschreibung:
        'Was sich 2027 nach dem heutigen Stand der Gesetzgebung abzeichnet. Die Beitragssätze ' +
        'stammen aus amtlichen Vorausberechnungen und einem Referentenentwurf, die ' +
        'Rechengrößen aus dem BMAS-Referentenentwurf vom 21.09.2026. Die Pflegegrenze folgt dem PNOG-Entwurf.',
    sv: SV_2027_ENTWURF,
    svUeberschreibungen: {
        // RV bleibt 2027 in der mittleren und oberen Variante bei 18,6 %.
        rvSatz: 0.186,
        avSatz: 0.026,
        // Mitte der prognostizierten Spanne 3,3-3,7 %.
        kvZusatz: 0.035,
        pvSatz: 0.036,
        pvZuschlagKinderlose: 0.007,
    },
    annahmen: [
        {
            text: 'Rentenbeitrag bleibt 2027 bei 18,6 %. Erst 2028 steigt er auf 19,8 % (mittlere Variante).',
            rechtsstatus: 'amtliche_projektion',
            quelle: RVB_2025,
        },
        {
            text: 'Zuschlag für Kinderlose in der Pflegeversicherung steigt von 0,6 auf 0,7 Punkte.',
            rechtsstatus: 'referentenentwurf',
            quelle: PNOG_ENTWURF,
        },
        {
            text: 'Durchschnittlicher Zusatzbeitrag zur Krankenversicherung bei 3,5 % (Mitte der Prognosespanne 3,3–3,7 %).',
            rechtsstatus: 'eigene_annahme',
            quelle: GKV_LUECKE_2027,
        },
        {
            text: `BMAS-Entwurf vom 21.09.2026: Beitragsbemessungsgrenze Rente/Arbeitslosigkeit ${SV_2027_ENTWURF.bbgRvAv.wert.toLocaleString('de-DE')} €/Jahr, Krankenversicherung ${SV_2027_ENTWURF.bbgKv.wert.toLocaleString('de-DE')} €/Jahr; allgemeine Versicherungspflichtgrenze ${SV_2027_ENTWURF.jaeg.wert.toLocaleString('de-DE')} €/Jahr. Die zusätzliche Krankenversicherungs-Anhebung ist bereits enthalten.`,
            rechtsstatus: 'referentenentwurf',
            quelle: SVBEZGRV_2027_ENTWURF,
        },
        {
            text: `Pflegeversicherung: eigene Beitragsbemessungsgrenze auf Höhe der allgemeinen Versicherungspflichtgrenze (${SV_2027_ENTWURF.bbgPv.wert.toLocaleString('de-DE')} €/Jahr), gemäß PNOG-Entwurf.`,
            rechtsstatus: 'referentenentwurf',
            quelle: PNOG_ENTWURF,
        },
        {
            text: 'Mindestlohn steigt zum 01.01.2027 auf 14,60 €.',
            rechtsstatus: 'verkuendet',
            quelle: {
                herausgeber: 'BMAS',
                titel: 'Fünfte Mindestlohnanpassungsverordnung',
                stand: '2025-10-29',
            },
        },
    ],
    nichtModelliert: [
        'Die Lohnsteuer wird weiterhin mit dem amtlichen Programmablaufplan 2026 berechnet. ' +
            'Die neuen Beitragsbemessungsgrenzen und Pflegebeiträge sind deshalb in der steuerlichen ' +
            'Vorsorgepauschale noch nicht berücksichtigt; das Netto ist eine Modellrechnung.',
        'Die besonderen Versicherungspflichtgrenzen für privat versicherte Bestandsfälle ' +
            'nach § 6 Abs. 7 und 8 SGB V; angezeigt wird die allgemeine Grenze nach Abs. 6.',
        'Die am 01.07.2026 im Koalitionsausschuss vereinbarte Einkommensteuerreform zum 01.01.2027. ' +
            'Beschlossen sind bislang nur Richtung und Volumen (rund 10 Mrd. € Entlastung), nicht die ' +
            'konkreten Beträge für Grundfreibetrag, Kinderfreibetrag, Kindergeld und ' +
            'Arbeitnehmer-Pauschbetrag. Ohne Referentenentwurf wäre jede Zahl frei erfunden. ' +
            'Die tatsächliche Belastung dürfte also niedriger ausfallen als hier gezeigt.',
        'Die ebenfalls angekündigte Anhebung des Reichensteuersatzes (45 % bereits ab 250.000 €) und ' +
            'die neue Stufe von 47 % ab 280.000 € zu versteuerndem Einkommen.',
    ],
};

// ---------------------------------------------------------------------------
// S2/S3 - Amtliche Vorausberechnungen
// ---------------------------------------------------------------------------

function projektion(
    id: string,
    jahr: number,
    rvVariante: { mittel: number; min: number; max: number },
    kvZusatz: number,
    pvSatz: number,
    kvBegruendung: string
): Rechtsstand {
    return {
        id,
        bezeichnung: `Amtliche Vorausberechnung ${jahr}`,
        kurz: String(jahr),
        jahr,
        rechtsstatus: 'amtliche_projektion',
        beschreibung:
            `Beitragssätze aus der mittleren Variante des Rentenversicherungsberichts 2025. ` +
            `Über alle neun Modellvarianten reicht die Spanne ${jahr} von ` +
            `${rvVariante.min.toLocaleString('de-DE', { minimumFractionDigits: 1 })} % bis ` +
            `${rvVariante.max.toLocaleString('de-DE', { minimumFractionDigits: 1 })} %.`,
        sv: fortgeschrieben(SV_2026, jahr, LOHNWACHSTUM_ANNAHME),
        svUeberschreibungen: {
            rvSatz: rvVariante.mittel / 100,
            avSatz: 0.026,
            kvZusatz: kvZusatz / 100,
            pvSatz: pvSatz / 100,
            pvZuschlagKinderlose: 0.007,
        },
        annahmen: [
            {
                text: `Rentenbeitrag ${rvVariante.mittel.toLocaleString('de-DE', { minimumFractionDigits: 1 })} % (mittlere Variante; Spanne ${rvVariante.min.toLocaleString('de-DE', { minimumFractionDigits: 1 })}–${rvVariante.max.toLocaleString('de-DE', { minimumFractionDigits: 1 })} %).`,
                rechtsstatus: 'amtliche_projektion',
                quelle: RVB_2025,
            },
            {
                text: kvBegruendung,
                rechtsstatus: 'eigene_annahme',
                quelle: GKV_LUECKE_2027,
            },
            {
                text: `Pflegebeitrag ${pvSatz.toLocaleString('de-DE', { minimumFractionDigits: 1 })} %. Für die Pflegeversicherung gibt es keine amtliche Langfristvorausberechnung; der Wert ist eine Fortschreibung des bisherigen Anstiegs.`,
                rechtsstatus: 'eigene_annahme',
                quelle: PNOG_ENTWURF,
            },
        ],
        nichtModelliert: [
            'Änderungen am Einkommensteuertarif. Der Tarif wird regelmäßig an die Inflation ' +
                'angepasst; ohne diese Anpassung würde die Belastung deutlich höher ausfallen als hier gezeigt.',
            'Strukturreformen auf der Leistungsseite von Renten-, Kranken- und Pflegeversicherung.',
        ],
    };
}

export const RECHTSSTAND_2030 = projektion(
    '2030-projektion',
    2030,
    { mittel: 20.1, min: 19.8, max: 20.4 },
    4.5,
    4.2,
    'Zusatzbeitrag 4,5 %: Fortschreibung der für 2027 prognostizierten Lücke ohne strukturelle Gegenmaßnahmen.'
);

export const RECHTSSTAND_2035 = projektion(
    '2035-projektion',
    2035,
    { mittel: 21.0, min: 20.6, max: 21.4 },
    5.5,
    4.8,
    'Zusatzbeitrag 5,5 %: Fortschreibung des demografiebedingten Ausgabenanstiegs.'
);

export const RECHTSSTAND_2039 = projektion(
    '2039-projektion',
    2039,
    { mittel: 21.2, min: 20.7, max: 21.6 },
    6.0,
    5.2,
    'Zusatzbeitrag 6,0 %: Ende des Vorausberechnungszeitraums des Rentenversicherungsberichts.'
);

// ---------------------------------------------------------------------------
// S5 - Belastungsstress (ausdrueckliche eigene Annahme)
// ---------------------------------------------------------------------------

export const RECHTSSTAND_STRESS: Rechtsstand = {
    id: 'stress',
    bezeichnung: 'Belastungsszenario (eigene Annahme)',
    kurz: 'Stress',
    jahr: 2035,
    rechtsstatus: 'eigene_annahme',
    beschreibung:
        'Bewusst pessimistischer Rand: Alle Beitragssätze am oberen Ende oder darüber, ' +
        'zusätzlich ein Steueraufschlag von 10 %. Dieses Szenario ist KEINE Prognose. Der ' +
        'Rentenbeitrag liegt hier oberhalb der gesamten amtlichen Bandbreite.',
    sv: fortgeschrieben(SV_2026, 2035, 2.5),
    svUeberschreibungen: {
        rvSatz: 0.222,
        avSatz: 0.03,
        kvZusatz: 0.07,
        pvSatz: 0.06,
        pvZuschlagKinderlose: 0.008,
    },
    steuerfaktor: 1.1,
    annahmen: [
        {
            text: 'Rentenbeitrag 22,2 % - oberhalb der amtlichen Spanne von 20,6 bis 21,4 % für 2035.',
            rechtsstatus: 'eigene_annahme',
            quelle: RVB_2025,
        },
        {
            text: 'Zusatzbeitrag 7,0 % und Pflegebeitrag 6,0 % ohne strukturelle Reformen.',
            rechtsstatus: 'eigene_annahme',
            quelle: GKV_LUECKE_2027,
        },
        {
            text: 'Steuerbelastung pauschal 10 % höher. Grober Platzhalter, kein Tarifmodell.',
            rechtsstatus: 'eigene_annahme',
            quelle: KOALITIONSAUSSCHUSS_2026,
        },
        {
            text: 'Bemessungsgrenzen nur mit 2,5 % p. a. fortgeschrieben (schwache Lohnentwicklung).',
            rechtsstatus: 'eigene_annahme',
            quelle: RVB_2025,
        },
    ],
    nichtModelliert: [
        'Jede Form von Entlastung. Die tatsächliche Politik der letzten Jahrzehnte hat den Tarif ' +
            'regelmäßig an die Inflation angepasst; dieses Szenario unterstellt das Gegenteil.',
    ],
};

export const RECHTSSTAENDE: Rechtsstand[] = [
    RECHTSSTAND_GELTEND,
    RECHTSSTAND_2027,
    RECHTSSTAND_2030,
    RECHTSSTAND_2035,
    RECHTSSTAND_2039,
    RECHTSSTAND_STRESS,
];

export function rechtsstandFuer(id: string): Rechtsstand {
    return RECHTSSTAENDE.find((r) => r.id === id) ?? RECHTSSTAND_GELTEND;
}

export const KOALITIONSAUSSCHUSS_QUELLE = KOALITIONSAUSSCHUSS_2026;
