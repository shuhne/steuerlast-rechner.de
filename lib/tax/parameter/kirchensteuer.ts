import { Quelle } from './typen';

/**
 * Kirchensteuer
 * =============
 *
 * Der Programmablaufplan liefert nur die Bemessungsgrundlage (Ausgabe BK).
 * Der Hebesatz ist Landesrecht bzw. Kirchenrecht und steht deshalb hier.
 */

const QUELLE_SATZ: Quelle = {
    herausgeber: 'Landeskirchensteuergesetze der Laender',
    titel: 'Kirchensteuerhebesatz',
    fundstelle: '8 % in Bayern und Baden-Wuerttemberg, 9 % in den uebrigen Laendern',
    stand: '2026-01-01',
};

/** Laender mit 8 % Hebesatz. Alle uebrigen: 9 %. */
const ACHT_PROZENT = new Set(['BY', 'BW']);

export const KIRCHENSTEUER = {
    quelle: QUELLE_SATZ,

    /** Hebesatz als Dezimalzahl, z. B. 0.09. */
    satzFuer(bundesland: string): number {
        return ACHT_PROZENT.has(bundesland.toUpperCase()) ? 0.08 : 0.09;
    },

    satzProzentFuer(bundesland: string): number {
        return this.satzFuer(bundesland) * 100;
    },

    /**
     * Kappung der Kirchensteuer
     * -------------------------
     * Die Kappung begrenzt die Kirchensteuer auf einen Prozentsatz des zu
     * versteuernden Einkommens. Sie ist bewusst NICHT fest verdrahtet:
     *
     * 1. Der Kappungssatz ist Kirchen- und Landesrecht und liegt je nach
     *    Land und Konfession zwischen etwa 2,75 % und 4 %. In Bayern gibt es
     *    keine Kappung. Eine belastbare, konfessionsscharfe Gesamtuebersicht
     *    aus einer Primaerquelle lag zum Zeitpunkt der Umsetzung nicht vor.
     * 2. Die Kappung wirkt in den meisten Laendern nur auf Antrag im Rahmen
     *    der Veranlagung, nicht bereits beim Lohnsteuerabzug. Ein
     *    Brutto-Netto-Rechner bildet den Lohnsteuerabzug ab - dort gibt es
     *    keine Kappung.
     *
     * Deshalb: Standard ist "keine Kappung" (entspricht dem Lohnsteuerabzug).
     * Wer die Veranlagung abbilden will, gibt den eigenen Kappungssatz an.
     */
    kappung: {
        hinweis:
            'Die Kappung wirkt in den meisten Bundesländern nur auf Antrag im Rahmen der ' +
            'Einkommensteuerveranlagung, nicht beim laufenden Lohnsteuerabzug. Der Kappungssatz ' +
            'liegt je nach Land und Konfession zwischen etwa 2,75 % und 4 %; in Bayern gibt es ' +
            'keine Kappung. Bitte den für die eigene Kirche geltenden Satz beim Kirchensteueramt ' +
            'erfragen.',
        /** Plausibilitaetsgrenzen fuer die Eingabe. */
        minProzent: 2.0,
        maxProzent: 4.5,
        /** Laender ohne Kappung. */
        ohneKappung: new Set(['BY']),

        /**
         * Wendet die Kappung an: Kirchensteuer wird auf `satzProzent` des zu
         * versteuernden Einkommens begrenzt.
         *
         * @param kirchensteuer  ungekappte Kirchensteuer in Euro
         * @param zvE            zu versteuerndes Einkommen in Euro
         * @param satzProzent    Kappungssatz in Prozent, z. B. 3.5
         */
        anwenden(kirchensteuer: number, zvE: number, satzProzent: number | null): number {
            if (satzProzent === null || satzProzent <= 0) return kirchensteuer;
            const grenze = (zvE * satzProzent) / 100;
            return Math.min(kirchensteuer, Math.max(0, grenze));
        },
    },
} as const;
