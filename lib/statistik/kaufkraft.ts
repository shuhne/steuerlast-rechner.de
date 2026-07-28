import { Quelle } from '../tax/parameter/typen';

/**
 * Kaufkraft im Zeitverlauf
 * ========================
 *
 * WAS HIER FRUEHER FALSCH WAR
 * ---------------------------
 * Die frueher genutzte Berechnung hat fuer die Vergangenheit mit der
 * kumulierten Inflation MULTIPLIZIERT und fuer die Zukunft DIVIDIERT. Beide
 * Haelften beantworteten damit unterschiedliche Fragen, lagen aber auf einer
 * gemeinsamen Achse mit einer gemeinsamen Beschriftung. Die Kurve sah dadurch
 * plausibel aus, war aber nicht interpretierbar.
 *
 * JETZT: EINE Frage, EINE Formel, fuer alle Jahre gleich.
 *
 *   kaufkraftaequivalent(J) = Gehalt * Preisindex(J) / Preisindex(Basisjahr)
 *
 * Lesart in beide Richtungen:
 *   Vergangenheit: "Mit diesem Betrag haettest du im Jahr J so viel kaufen
 *                   koennen wie heute mit deinem Gehalt."
 *   Zukunft:       "So viel brauchst du im Jahr J, um dir so viel leisten zu
 *                   koennen wie heute."
 *
 * Zusaetzlich wird der Realwert bei nominal unveraendertem Gehalt
 * ausgewiesen - das ist die Zahl, die den Kaufkraftverlust sichtbar macht.
 */

const DESTATIS_VPI: Quelle = {
    herausgeber: 'Statistisches Bundesamt',
    titel: 'Verbraucherpreisindex für Deutschland, Jahresteuerungsraten',
    fundstelle: 'Genesis-Tabelle 61111; bis 1990 früheres Bundesgebiet',
    url: 'https://www.destatis.de/DE/Themen/Wirtschaft/Preise/Verbraucherpreisindex/_inhalt.html',
    stand: '2026-01-01',
};

/** Jahresteuerungsrate in Prozent. */
export const TEUERUNGSRATEN: Record<number, number> = {
    1992: 5.0, 1993: 4.5, 1994: 2.7, 1995: 1.7, 1996: 1.4, 1997: 1.9, 1998: 0.9,
    1999: 0.6, 2000: 1.4, 2001: 2.0, 2002: 1.4, 2003: 1.1, 2004: 1.6, 2005: 1.5,
    2006: 1.6, 2007: 2.3, 2008: 2.6, 2009: 0.3, 2010: 1.1, 2011: 2.1, 2012: 2.0,
    2013: 1.5, 2014: 0.9, 2015: 0.5, 2016: 0.5, 2017: 1.5, 2018: 1.8, 2019: 1.4,
    2020: 0.5, 2021: 3.1, 2022: 6.9, 2023: 5.9, 2024: 2.2, 2025: 2.2,
};

export const BASISJAHR = 2026;

/**
 * Angenommene kuenftige Teuerung. Zielwert der EZB fuer den Euroraum.
 * Ausdrueckliche Annahme, keine Prognose.
 */
export const ANNAHME_TEUERUNG_KUENFTIG = 2.0;

export const KAUFKRAFT_QUELLEN = {
    vergangenheit: DESTATIS_VPI,
    zukunft: {
        herausgeber: 'Europäische Zentralbank',
        titel: 'Preisstabilitätsziel von 2 % für den Euroraum',
        fundstelle: 'Als Fortschreibungsannahme verwendet, nicht als Prognose.',
        stand: '2026-07-27',
    } as Quelle,
};

const indexCache = new Map<number, number>();

/**
 * Preisindex, normiert auf 100 im Basisjahr.
 * Fuer Jahre ohne veroeffentlichte Rate wird die Annahme fortgeschrieben.
 */
export function preisindex(jahr: number): number {
    if (indexCache.has(jahr)) return indexCache.get(jahr)!;

    let index = 100;
    if (jahr > BASISJAHR) {
        for (let j = BASISJAHR + 1; j <= jahr; j++) {
            const rate = TEUERUNGSRATEN[j] ?? ANNAHME_TEUERUNG_KUENFTIG;
            index *= 1 + rate / 100;
        }
    } else if (jahr < BASISJAHR) {
        for (let j = BASISJAHR; j > jahr; j--) {
            const rate = TEUERUNGSRATEN[j] ?? ANNAHME_TEUERUNG_KUENFTIG;
            index /= 1 + rate / 100;
        }
    }

    indexCache.set(jahr, index);
    return index;
}

export interface KaufkraftPunkt {
    jahr: number;
    /**
     * Betrag, der im Jahr J dieselbe Kaufkraft hat wie das heutige Gehalt.
     * Steigt monoton - fuer die Vergangenheit niedriger, fuer die Zukunft hoeher.
     */
    kaufkraftaequivalent: number;
    /**
     * Realwert des heutigen Gehalts im Jahr J, gemessen in heutigen Preisen,
     * wenn es nominal unveraendert bleibt. Nur fuer kuenftige Jahre sinnvoll.
     */
    realwertOhneErhoehung: number | null;
    teuerungsrate: number;
    istPrognose: boolean;
}

export function kaufkraftreihe(
    bruttoJahr: number,
    vonJahr = 2000,
    bisJahr = 2050
): KaufkraftPunkt[] {
    const punkte: KaufkraftPunkt[] = [];
    for (let jahr = vonJahr; jahr <= bisJahr; jahr++) {
        const index = preisindex(jahr);
        const istPrognose = jahr > BASISJAHR || TEUERUNGSRATEN[jahr] === undefined;
        punkte.push({
            jahr,
            kaufkraftaequivalent: Math.round((bruttoJahr * index) / 100),
            realwertOhneErhoehung:
                jahr >= BASISJAHR ? Math.round((bruttoJahr * 100) / index) : null,
            teuerungsrate: TEUERUNGSRATEN[jahr] ?? ANNAHME_TEUERUNG_KUENFTIG,
            istPrognose,
        });
    }
    return punkte;
}

/** Kaufkraftverlust in Prozent bis zum Zieljahr, ohne Gehaltserhoehung. */
export function kaufkraftverlust(zieljahr: number): number {
    if (zieljahr <= BASISJAHR) return 0;
    return Math.round((1 - 100 / preisindex(zieljahr)) * 100);
}

/**
 * Noetige jaehrliche Gehaltssteigerung, um die Kaufkraft zu halten.
 * Entspricht der angenommenen Teuerung, wird aber explizit ausgewiesen,
 * weil das die eigentlich handlungsleitende Zahl ist.
 */
export function noetigeJaehrlicheErhoehung(vonJahr: number, bisJahr: number): number {
    if (bisJahr <= vonJahr) return 0;
    const faktor = preisindex(bisJahr) / preisindex(vonJahr);
    return Math.round((Math.pow(faktor, 1 / (bisJahr - vonJahr)) - 1) * 1000) / 10;
}
