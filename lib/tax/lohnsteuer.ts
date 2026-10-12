import Big from 'big.js';
import { euroRunden } from './runden';
import { Lohnsteuer2026, PAP_META } from './generated/Lohnsteuer2026';
import { KIRCHENSTEUER } from './parameter/kirchensteuer';

/**
 * Adapter auf den amtlichen Programmablaufplan.
 * =============================================
 *
 * Die eigentliche Rechenlogik steckt vollstaendig in
 * `generated/Lohnsteuer2026.ts` und wird aus der amtlichen BMF-XML erzeugt.
 * Dieses Modul uebersetzt lediglich fachliche Eingaben in die PAP-Merker
 * und die PAP-Ausgaben zurueck in Euro.
 *
 * Hier darf fachliche Logik stehen, die der PAP NICHT abdeckt:
 * - Zuordnung Bundesland -> Sachsen-Sonderregel der Pflegeversicherung
 * - Herleitung der PV-Merker (Kinderlosenzuschlag, Beitragsabschlaege)
 * - Kirchensteuer (der PAP liefert nur die Bemessungsgrundlage BK)
 *
 * Hier darf KEINE Steuertariflogik stehen. Wenn eine Zahl aus dem EStG,
 * dem SolzG oder dem PAP stammt, gehoert sie in die generierte Datei bzw.
 * nach `parameter/`.
 */

export { PAP_META };

/** Lohnzahlungszeitraum (PAP-Merker LZZ). */
export const LZZ_JAHR = 1;

export interface LohnsteuerEingabe {
    /** Steuerpflichtiger Bruttoarbeitslohn des Jahres in Euro. */
    bruttoJahr: number;
    /** Steuerklasse I-VI. */
    steuerklasse: number;
    /** Zahl der Kinderfreibetraege lt. ELStAM (PAP-Merker ZKF). */
    kinderfreibetraege: number;
    /** Alter in vollendeten Jahren zu Beginn des Kalenderjahres. */
    alter: number;
    /** Bundesland-Kuerzel, z. B. "BE". Steuert die Sachsen-Sonderregel und die Kirchensteuer. */
    bundesland: string;
    /** Kirchensteuerpflicht. */
    kirchensteuer: boolean;
    /** Kassenindividueller Zusatzbeitragssatz in Prozentpunkten, z. B. 2.9. */
    kvZusatzbeitragProzent: number;
    /**
     * Zahl der beruecksichtigungsfaehigen Kinder unter 25 Jahren fuer die
     * Pflegeversicherung. Bestimmt Kinderlosenzuschlag und Beitragsabschlaege.
     */
    kinderFuerPflegeversicherung: number;
    hatKinder?: boolean;
    /** Gesetzlich oder privat krankenversichert. */
    krankenversicherung:
        | { art: 'gesetzlich' }
        | {
              art: 'privat';
              /** Monatsbeitrag zur PKV inkl. Pflege-Pflichtversicherung, in Euro. */
              monatsbeitrag: number;
              /** Monatlicher steuerfreier Arbeitgeberzuschuss in Euro. */
              arbeitgeberzuschussMonat: number;
          };
    /** Pflichtversicherung in der Arbeitslosenversicherung (PAP-Merker ALV). */
    arbeitslosenversicherungspflichtig: boolean;
    /** Pflichtversicherung in der gesetzlichen Rentenversicherung (PAP-Merker KRV). */
    rentenversicherungspflichtig: boolean;
    /** Jahresfreibetrag lt. ELStAM in Euro (PAP-Merker LZZFREIB). */
    jahresfreibetrag: number;
    /** Sonstige Bezuege des Jahres in Euro, z. B. Bonus (PAP-Merker SONSTB). */
    sonstigeBezuege: number;
}

export interface LohnsteuerErgebnis {
    /** Lohnsteuer auf den laufenden Arbeitslohn, Euro/Jahr. */
    lohnsteuer: number;
    /** Solidaritaetszuschlag auf den laufenden Arbeitslohn, Euro/Jahr. */
    soli: number;
    /** Kirchensteuer auf den laufenden Arbeitslohn, Euro/Jahr. */
    kirchensteuer: number;
    /** Lohnsteuer auf sonstige Bezuege, Euro. */
    lohnsteuerSonstigeBezuege: number;
    /** Solidaritaetszuschlag auf sonstige Bezuege, Euro. */
    soliSonstigeBezuege: number;
    /** Kirchensteuer auf sonstige Bezuege, Euro. */
    kirchensteuerSonstigeBezuege: number;
    /** Summe aller Steuern, Euro/Jahr. */
    summe: number;
    /** Bemessungsgrundlage der Kirchensteuer lt. PAP (Ausgabe BK), Euro. */
    kirchensteuerBemessungsgrundlage: number;
}

const cent = (euro: number) => new Big(euro.toFixed(2)).times(100);
const euro = (papCent: { toNumber(): number }) => papCent.toNumber() / 100;

/**
 * Leitet den PAP-Merker PVA ab: Zahl der Beitragsabschlaege in der
 * Pflegeversicherung. Ab dem zweiten bis zum fuenften Kind gibt es je Kind
 * einen Abschlag von 0,25 Beitragssatzpunkten (§ 55 Abs. 3 SGB XI),
 * also maximal 4 Abschlaege.
 */
export function beitragsabschlaegePflege(kinderUnter25: number): number {
    const k = Math.floor(Math.max(0, kinderUnter25));
    if (k < 2) return 0;
    return Math.min(k, 5) - 1;
}

/**
 * Kinderlosenzuschlag zur Pflegeversicherung (PAP-Merker PVZ):
 * 0,6 Beitragssatzpunkte fuer Kinderlose ab dem 24. Lebensjahr
 * (§ 55 Abs. 3 Satz 1 SGB XI).
 */
export function kinderlosenzuschlagPflege(kinder: number, alter: number, hatKinder = kinder > 0): boolean {
    return !hatKinder && alter >= 23;
}

export function berechneLohnsteuer(e: LohnsteuerEingabe): LohnsteuerErgebnis {
    const pap = new Lohnsteuer2026();

    pap.LZZ = LZZ_JAHR;
    pap.RE4 = cent(e.bruttoJahr);
    pap.STKL = e.steuerklasse;
    pap.ZKF = new Big(e.kinderfreibetraege);
    pap.LZZFREIB = cent(e.jahresfreibetrag);
    pap.SONSTB = cent(e.sonstigeBezuege);
    // JRE4 ist der voraussichtliche Jahresarbeitslohn OHNE sonstige Bezuege.
    // Bei der Jahresberechnung (LZZ = 1) ist das genau RE4. Ohne diese Zuweisung
    // rechnet MSONST die sonstigen Bezuege gegen einen Jahreslohn von 0 und
    // liefert eine viel zu niedrige Steuer.
    pap.JRE4 = cent(e.bruttoJahr);
    pap.JFREIB = cent(e.jahresfreibetrag);
    pap.af = 1;
    pap.f = 1.0;

    // R steuert die Ausgabe der Kirchensteuer-Bemessungsgrundlage BK.
    // Wir setzen es immer, damit BK verfuegbar ist; ob Kirchensteuer
    // tatsaechlich anfaellt, entscheidet dieses Modul weiter unten.
    pap.R = 1;

    // Altersentlastungsbetrag (§ 24a EStG): greift ab dem Kalenderjahr, das
    // auf die Vollendung des 64. Lebensjahres folgt. AJAHR ist genau dieses
    // Jahr; der PAP waehlt daraus den Kohortensatz aus TAB4/TAB5.
    if (e.alter > 64) {
        pap.ALTER1 = 1;
        pap.AJAHR = PAP_META.jahr - e.alter + 64;
    } else {
        pap.ALTER1 = 0;
    }

    // Sozialversicherungsmerker
    pap.ALV = e.arbeitslosenversicherungspflichtig ? 0 : 1;
    pap.KRV = e.rentenversicherungspflichtig ? 0 : 1;
    pap.PVS = e.bundesland.toUpperCase() === 'SN' ? 1 : 0;
    pap.PVZ = kinderlosenzuschlagPflege(e.kinderFuerPflegeversicherung, e.alter, e.hatKinder) ? 1 : 0;
    pap.PVA = new Big(beitragsabschlaegePflege(e.kinderFuerPflegeversicherung));

    if (e.krankenversicherung.art === 'gesetzlich') {
        pap.PKV = 0;
        pap.KVZ = new Big(e.kvZusatzbeitragProzent);
    } else {
        // PKV = 2: privat versichert MIT Arbeitgeberzuschuss. Der PAP zieht
        // den Zuschuss ueber PKPVAGZ von der Vorsorgepauschale ab.
        // PKV = 1 (ohne Zuschuss) waere fuer Arbeitnehmer oberhalb der JAEG
        // falsch, denn diese haben nach § 257 SGB V immer Anspruch darauf.
        pap.PKV = 2;
        pap.PKPV = cent(e.krankenversicherung.monatsbeitrag);
        pap.PKPVAGZ = cent(e.krankenversicherung.arbeitgeberzuschussMonat);
    }

    pap.calculate();

    const lohnsteuer = euro(pap.LSTLZZ);
    const soli = euro(pap.SOLZLZZ);
    const bk = euro(pap.BK);
    const stsLfd = euro(pap.STS);
    const soliSonstige = euro(pap.SOLZS);
    const bks = euro(pap.BKS);

    const satz = KIRCHENSTEUER.satzFuer(e.bundesland);
    const kirchensteuer = e.kirchensteuer ? round2(bk * satz) : 0;
    const kirchensteuerSonstige = e.kirchensteuer ? round2(bks * satz) : 0;

    return {
        lohnsteuer,
        soli,
        kirchensteuer,
        lohnsteuerSonstigeBezuege: stsLfd,
        soliSonstigeBezuege: soliSonstige,
        kirchensteuerSonstigeBezuege: kirchensteuerSonstige,
        summe: round2(
            lohnsteuer + soli + kirchensteuer + stsLfd + soliSonstige + kirchensteuerSonstige
        ),
        kirchensteuerBemessungsgrundlage: bk + bks,
    };
}

const round2 = euroRunden;
