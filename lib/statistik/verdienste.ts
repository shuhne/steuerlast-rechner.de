import { Parameter, Quelle } from '../tax/parameter/typen';
import { runden } from '../tax/runden';

/**
 * Verdienstverteilung in Deutschland
 * ==================================
 *
 * Ersetzt die frueher genutzten StepStone-Ankerwerte (Median 45.800 EUR) durch
 * die amtliche Verdiensterhebung des Statistischen Bundesamtes. Der alte Anker
 * lag rund 15 % zu niedrig, weil er auf einer selbstselektierten
 * Jobboersen-Stichprobe beruhte - jede Nutzerin und jeder Nutzer erschien
 * dadurch systematisch als Besserverdienende.
 *
 * Ausserdem wurde die Verteilung frueher als Lognormalverteilung mit einem
 * frei gesetzten Sigma von 0,5 modelliert. Jetzt wird zwischen den amtlich
 * veroeffentlichten Quantilen interpoliert.
 */

const DESTATIS_2025: Quelle = {
    herausgeber: 'Statistisches Bundesamt',
    titel: 'Verdiensterhebung 2025 - Mittlerer Bruttojahresverdienst lag 2025 bei 54 066 Euro',
    fundstelle:
        'Pressemitteilung Nr. 113 vom April 2026. Vollzeitbeschäftigte mit mindestens sieben ' +
        'Arbeitsmonaten, einschließlich Sonderzahlungen.',
    url: 'https://www.destatis.de/DE/Presse/Pressemitteilungen/2026/04/PD26_113_621.html',
    stand: '2026-04-01',
};

/** Amtlich veroeffentlichte Quantile: [Perzentil, Bruttojahresverdienst in EUR]. */
export const QUANTILE_2025: Array<[number, number]> = [
    [10, 33_828],
    [30, 44_215],
    [50, 54_066],
    [90, 100_719],
    [99, 219_110],
];

export const VERDIENSTE_2025 = {
    quelle: DESTATIS_2025,
    jahr: 2025,
    median: 54_066,
    mittelwert: 64_441,
    medianWest: 55_435,
    medianOstOhneBerlin: 46_013,
    quantile: QUANTILE_2025,
} as const;

/**
 * Altersprofil der Verdienste.
 *
 * ACHTUNG: Dies ist eine Modellannahme, keine amtliche Statistik. Das
 * Statistische Bundesamt veroeffentlicht in der zitierten Pressemitteilung
 * keine Aufgliederung nach Alter. Die Kurve bildet den ueblichen Verlauf ab
 * (Anstieg bis Mitte 50, danach leichter Rueckgang) und ist auf 1,0 beim
 * Median-Alter normiert.
 *
 * Wer die Kurve durch amtliche Daten ersetzen will: Destatis Verdiensterhebung,
 * Gliederung nach Altersgruppen. Siehe docs/wissensspeicher/quellenregister.md.
 */
export const ALTERSFAKTOR: Parameter<Array<[number, number]>> = {
    wert: [
        [18, 0.58],
        [21, 0.68],
        [25, 0.82],
        [30, 0.95],
        [35, 1.06],
        [40, 1.14],
        [45, 1.19],
        [50, 1.21],
        [55, 1.2],
        [60, 1.16],
        [65, 1.08],
        [67, 1.04],
    ],
    rechtsstatus: 'eigene_annahme',
    belastbarkeit: 'geschaetzt',
    quelle: {
        herausgeber: 'steuerlast-rechner.de',
        titel: 'Modellannahme zum Altersprofil der Verdienste',
        fundstelle: 'Nicht amtlich belegt. Normiert auf 1,0 im Bereich Anfang 30.',
        stand: '2026-07-27',
    },
    gueltigAb: 2025,
    hinweis:
        'Das Altersprofil ist eine Modellannahme. Die Einordnung ohne Altersbezug beruht ' +
        'dagegen vollständig auf amtlichen Quantilen und ist deutlich belastbarer.',
};

function interpoliere(stuetzstellen: Array<[number, number]>, x: number): number {
    const s = [...stuetzstellen].sort((a, b) => a[0] - b[0]);
    if (x <= s[0][0]) return s[0][1];
    if (x >= s[s.length - 1][0]) return s[s.length - 1][1];
    for (let i = 0; i < s.length - 1; i++) {
        const [x0, y0] = s[i];
        const [x1, y1] = s[i + 1];
        if (x >= x0 && x <= x1) {
            const t = (x - x0) / (x1 - x0);
            return y0 + t * (y1 - y0);
        }
    }
    return s[s.length - 1][1];
}

export function altersfaktor(alter: number): number {
    return interpoliere(ALTERSFAKTOR.wert, alter);
}

/**
 * Perzentil eines Bruttojahresverdienstes innerhalb der amtlichen Verteilung.
 *
 * Zwischen den veroeffentlichten Quantilen wird logarithmisch interpoliert -
 * Einkommensverteilungen sind rechtsschief, lineare Interpolation waere im
 * oberen Bereich deutlich zu grob. Ausserhalb des belegten Bereichs wird
 * geklemmt statt extrapoliert.
 */
export function perzentil(bruttoJahr: number): number {
    const q = [...QUANTILE_2025].sort((a, b) => a[1] - b[1]);
    if (bruttoJahr <= q[0][1]) return q[0][0];
    if (bruttoJahr >= q[q.length - 1][1]) return q[q.length - 1][0];

    for (let i = 0; i < q.length - 1; i++) {
        const [p0, v0] = q[i];
        const [p1, v1] = q[i + 1];
        if (bruttoJahr >= v0 && bruttoJahr <= v1) {
            const t = (Math.log(bruttoJahr) - Math.log(v0)) / (Math.log(v1) - Math.log(v0));
            return runden(p0 + t * (p1 - p0), 1);
        }
    }
    return 50;
}

export interface Einordnung {
    /** Perzentil ohne Altersbezug - amtlich belegt. */
    perzentilGesamt: number;
    /** Perzentil bezogen auf die Altersgruppe - beruht auf einer Modellannahme. */
    perzentilAltersgruppe: number;
    /** Geschaetzter Median der Altersgruppe. */
    medianAltersgruppe: number;
    medianGesamt: number;
    differenzZuMedian: number;
    hinweise: string[];
}

export function einordnen(bruttoJahr: number, alter: number): Einordnung {
    const f = altersfaktor(alter);
    const medianAlter = Math.round(VERDIENSTE_2025.median * f);

    // Fuer die Altersgruppe wird die Gesamtverteilung um den Altersfaktor
    // skaliert. Das unterstellt eine in allen Altersgruppen gleich geformte
    // Verteilung - eine Vereinfachung, die hier ausdruecklich benannt wird.
    const perzentilAlter = perzentil(bruttoJahr / f);

    return {
        perzentilGesamt: perzentil(bruttoJahr),
        perzentilAltersgruppe: perzentilAlter,
        medianAltersgruppe: medianAlter,
        medianGesamt: VERDIENSTE_2025.median,
        differenzZuMedian: runden(bruttoJahr - VERDIENSTE_2025.median, 2),
        hinweise: [
            `Datenbasis: ${VERDIENSTE_2025.quelle.herausgeber}, ${VERDIENSTE_2025.quelle.titel}. ` +
                `Vollzeitbeschäftigte einschließlich Sonderzahlungen.`,
            'Die Einordnung nach Altersgruppe beruht auf einer Modellannahme zum Altersprofil und ' +
                'ist weniger belastbar als die Einordnung in die Gesamtverteilung.',
        ],
    };
}

/** Stuetzpunkte fuer die Verteilungskurve in der Oberflaeche. */
export function verteilungskurve(): Array<{ perzentil: number; brutto: number }> {
    const punkte: Array<{ perzentil: number; brutto: number }> = [];
    for (let p = 5; p <= 99; p += p < 90 ? 5 : 1) {
        punkte.push({ perzentil: p, brutto: Math.round(bruttoFuerPerzentil(p)) });
    }
    return punkte;
}

/** Umkehrfunktion: Verdienst zu einem gegebenen Perzentil. */
export function bruttoFuerPerzentil(p: number): number {
    const q = [...QUANTILE_2025].sort((a, b) => a[0] - b[0]);
    if (p <= q[0][0]) return q[0][1];
    if (p >= q[q.length - 1][0]) return q[q.length - 1][1];
    for (let i = 0; i < q.length - 1; i++) {
        const [p0, v0] = q[i];
        const [p1, v1] = q[i + 1];
        if (p >= p0 && p <= p1) {
            const t = (p - p0) / (p1 - p0);
            return Math.exp(Math.log(v0) + t * (Math.log(v1) - Math.log(v0)));
        }
    }
    return VERDIENSTE_2025.median;
}
