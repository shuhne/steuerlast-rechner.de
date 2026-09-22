import { berechne, RechnerEingabe, RechnerErgebnis } from './rechner';
import { runden } from './runden';
import { rechtsstandFuer, RECHTSSTAND_GELTEND } from './parameter/rechtsstaende';

/**
 * Abgeleitete Analysen auf Basis der Kernberechnung.
 *
 * Jede Analyse ruft `berechne` mehrfach mit variierten Eingaben auf. Es gibt
 * hier bewusst keine eigene Steuerlogik - sonst entstuenden wieder zwei
 * Rechenwege, die auseinanderlaufen koennen.
 */

export interface TeilzeitPunkt {
    /** Arbeitszeitanteil in Prozent, z. B. 80. */
    anteilProzent: number;
    bruttoJahr: number;
    nettoJahr: number;
    nettoMonat: number;
    /** Netto je Wochenstunde und Jahr - der eigentliche Vergleichsmassstab. */
    nettoJeWochenstunde: number;
    /** Nettoverlust gegenueber Vollzeit in Prozent. */
    nettoverlustProzent: number;
    /** Veraenderung des Stundennettos gegenueber Vollzeit in Prozent. */
    stundennettoVeraenderungProzent: number;
    /** Jaehrlich erworbene Entgeltpunkte in der Rentenversicherung. */
    entgeltpunkte: number;
}

/**
 * Teilzeitanalyse.
 *
 * Der Erkenntniswert liegt nicht im absoluten Netto, sondern im Verhaeltnis:
 * Wegen des progressiven Tarifs sinkt das Netto langsamer als das Brutto, das
 * Stundennetto steigt also. Genau das wird hier ausgewiesen.
 */
export function teilzeitanalyse(
    basis: RechnerEingabe,
    wochenstundenVollzeit: number,
    stufen: number[] = [100, 90, 80, 70, 60, 50],
    durchschnittsentgelt?: number
): TeilzeitPunkt[] {
    const stand = basis.szenarioId ? rechtsstandFuer(basis.szenarioId) : RECHTSSTAND_GELTEND;
    const entgelt = durchschnittsentgelt ?? stand.sv.durchschnittsentgelt.wert;
    const bbgRente = stand.svUeberschreibungen?.bbgRvAv ?? stand.sv.bbgRvAv.wert;
    const vollzeit = berechne({ ...basis, bruttoJahr: basis.bruttoJahr });
    const nettoJeStundeVollzeit = vollzeit.netto.jahr / Math.max(1, wochenstundenVollzeit);

    return stufen.map((anteil) => {
        const faktor = anteil / 100;
        const brutto = runden(basis.bruttoJahr * faktor, 2);
        const r = berechne({ ...basis, bruttoJahr: brutto });
        const stunden = wochenstundenVollzeit * faktor;
        const nettoJeStunde = r.netto.jahr / Math.max(1, stunden);

        return {
            anteilProzent: anteil,
            bruttoJahr: brutto,
            nettoJahr: r.netto.jahr,
            nettoMonat: r.netto.monat,
            nettoJeWochenstunde: runden(nettoJeStunde, 2),
            nettoverlustProzent:
                vollzeit.netto.jahr > 0
                    ? runden((1 - r.netto.jahr / vollzeit.netto.jahr) * 100, 2)
                    : 0,
            stundennettoVeraenderungProzent:
                nettoJeStundeVollzeit > 0
                    ? runden((nettoJeStunde / nettoJeStundeVollzeit - 1) * 100, 2)
                    : 0,
            entgeltpunkte: entgelt
                ? runden(Math.min(brutto, bbgRente) / entgelt, 4)
                : 0,
        };
    });
}

export interface KurvenPunkt {
    bruttoJahr: number;
    nettoJahr: number;
    nettoMonat: number;
    grenzabgabenquote: number;
    grenzsteuerquote: number;
    abgabenquote: number;
}

/** Netto- und Grenzbelastungskurve ueber einen Bruttobereich. */
export function gehaltskurve(
    basis: RechnerEingabe,
    vonProzent = 50,
    bisProzent = 150,
    schritte = 24
): KurvenPunkt[] {
    const punkte: KurvenPunkt[] = [];
    for (let i = 0; i <= schritte; i++) {
        const faktor = (vonProzent + ((bisProzent - vonProzent) * i) / schritte) / 100;
        const brutto = runden(basis.bruttoJahr * faktor, 2);
        const r = berechne({ ...basis, bruttoJahr: brutto });
        punkte.push({
            bruttoJahr: brutto,
            nettoJahr: r.netto.jahr,
            nettoMonat: r.netto.monat,
            grenzabgabenquote: r.quoten.grenzabgabenquote,
            grenzsteuerquote: r.quoten.grenzsteuerquote,
            abgabenquote: r.quoten.abgabenquote,
        });
    }
    return punkte;
}

export interface SteuerklassenVariante {
    bezeichnung: string;
    steuerklassen: [number, number];
    nettoA: number;
    nettoB: number;
    nettoGesamt: number;
    /** Differenz zur besten Variante, negativ = schlechter. */
    differenz: number;
}

export interface SteuerklassenVergleich {
    varianten: SteuerklassenVariante[];
    beste: string;
    hinweis: string;
}

/**
 * Steuerklassenvergleich fuer Ehepaare.
 *
 * WICHTIG: Die Wahl der Steuerklassenkombination aendert nur die Verteilung
 * ueber das Jahr, nicht die Jahressteuerschuld. Diese ergibt sich erst aus der
 * gemeinsamen Veranlagung. Der Vergleich beantwortet also die Frage
 * "Wie viel Netto habe ich unterjaehrig?", nicht "Wie viel spare ich?".
 */
export function steuerklassenvergleich(
    partnerA: RechnerEingabe,
    partnerB: RechnerEingabe
): SteuerklassenVergleich {
    const kombination = (
        bezeichnung: string,
        klasseA: number,
        klasseB: number
    ): SteuerklassenVariante => {
        const a = berechne({ ...partnerA, steuerklasse: klasseA });
        const b = berechne({ ...partnerB, steuerklasse: klasseB });
        return {
            bezeichnung,
            steuerklassen: [klasseA, klasseB],
            nettoA: a.netto.jahr,
            nettoB: b.netto.jahr,
            nettoGesamt: runden(a.netto.jahr + b.netto.jahr, 2),
            differenz: 0,
        };
    };

    const varianten = [
        kombination('IV / IV', 4, 4),
        kombination('III / V', 3, 5),
        kombination('V / III', 5, 3),
    ];

    const max = Math.max(...varianten.map((v) => v.nettoGesamt));
    for (const v of varianten) v.differenz = runden(v.nettoGesamt - max, 2);
    const beste = varianten.find((v) => v.nettoGesamt === max)!.bezeichnung;

    return {
        varianten,
        beste,
        hinweis:
            'Die Steuerklassenkombination verändert nur den unterjährigen Abzug, nicht die ' +
            'Jahressteuerschuld. Diese ergibt sich erst aus der gemeinsamen Veranlagung. Bei der ' +
            'Kombination III/V besteht Pflicht zur Einkommensteuererklärung, und es kommt häufig ' +
            'zu Nachzahlungen. Das Faktorverfahren (IV/IV mit Faktor) verteilt die Last ' +
            'verursachungsgerecht; es ist in diesem Rechner noch nicht abgebildet.',
    };
}

export interface StundenlohnErgebnis {
    bruttoJeStunde: number;
    nettoJeStunde: number;
    /** Bezahlte Jahresstunden, auf denen die Rechnung beruht. */
    jahresstunden: number;
    unterMindestlohn: boolean;
    mindestlohn: number;
    hinweis: string;
}

/**
 * Stundenlohn.
 *
 * Die Umrechnung erfolgt ueber BEZAHLTE Stunden (Wochenstunden x 52). Der
 * gesetzliche Mindestlohn bezieht sich dagegen auf GELEISTETE Arbeitsstunden.
 * Bei viel Urlaub liegt der Mindestlohn je geleisteter Stunde also hoeher als
 * der hier ausgewiesene Wert. Deshalb wird der Vergleich als Hinweis und
 * nicht als Rechtsaussage gefuehrt.
 */
export function stundenlohn(
    ergebnis: RechnerErgebnis,
    wochenstunden: number,
    mindestlohn: number,
    urlaubstage = 30,
    feiertage = 10
): StundenlohnErgebnis {
    const bezahlteStunden = wochenstunden * 52;
    const geleisteteStunden = Math.max(
        1,
        bezahlteStunden - ((urlaubstage + feiertage) * wochenstunden) / 5
    );

    const bruttoJeGeleisteterStunde = ergebnis.brutto / geleisteteStunden;

    return {
        bruttoJeStunde: runden(ergebnis.brutto / Math.max(1, bezahlteStunden), 2),
        nettoJeStunde: runden(ergebnis.netto.jahr / Math.max(1, bezahlteStunden), 2),
        jahresstunden: runden(bezahlteStunden, 1),
        unterMindestlohn: bruttoJeGeleisteterStunde < mindestlohn,
        mindestlohn,
        hinweis:
            `Berechnet über bezahlte Stunden (${wochenstunden} × 52). Der gesetzliche ` +
            `Mindestlohn bezieht sich auf tatsächlich geleistete Arbeitsstunden; bei ` +
            `${urlaubstage} Urlaubs- und ${feiertage} Feiertagen entspricht das hier ` +
            `${bruttoJeGeleisteterStunde.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} € je geleisteter Stunde.`,
    };
}
