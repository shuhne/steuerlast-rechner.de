import { euroRunden } from './runden';
import { berechneLohnsteuer, LohnsteuerEingabe } from './lohnsteuer';
import { berechneSozialabgaben, maximalerPkvZuschuss, SvErgebnis } from './sozialabgaben';
import { KIRCHENSTEUER } from './parameter/kirchensteuer';
import { SV_2026 } from './parameter/sozialversicherung';
import { Rechtsstand, RECHTSSTAND_GELTEND, rechtsstandFuer } from './parameter/rechtsstaende';

/**
 * Zentrale Berechnung
 * ===================
 *
 * Kombiniert Lohnsteuer (amtlicher PAP) und Sozialabgaben zu einem
 * vollstaendigen Brutto-Netto-Ergebnis - inklusive Arbeitgeberanteilen,
 * Grenzabgabenquote und Rechtsstands-Metadaten fuer die Oberflaeche.
 *
 * Diese Datei enthaelt bewusst keine Zahlen aus Gesetzen. Alle Parameter
 * kommen aus `parameter/`, die Steuerlogik aus `generated/`.
 */

export interface RechnerEingabe {
    bruttoJahr: number;
    steuerklasse: number;
    bundesland: string;
    kirchensteuer: boolean;
    /**
     * Optionaler Kappungssatz der Kirchensteuer in Prozent des zu
     * versteuernden Einkommens. Standard: keine Kappung (entspricht dem
     * laufenden Lohnsteuerabzug).
     */
    kirchensteuerKappungProzent?: number | null;
    alter: number;
    /** Zahl der Kinderfreibetraege lt. ELStAM (steuerlich). */
    kinderfreibetraege: number;
    /** Zahl der Kinder unter 25 fuer die Pflegeversicherung. */
    kinderFuerPflege: number;
    krankenversicherung: 'gesetzlich' | 'privat';
    /** Kassenindividueller Zusatzbeitrag in Prozentpunkten. */
    kvZusatzProzent: number;
    pkvMonatsbeitrag?: number;
    /** Arbeitgeberzuschuss zur PKV in Euro/Monat, oder 'maximal'. */
    pkvArbeitgeberzuschussMonat?: number | 'maximal';
    /** Jahresfreibetrag lt. ELStAM in Euro. */
    jahresfreibetrag?: number;
    /** Sonstige Bezuege (Bonus, Weihnachtsgeld) in Euro pro Jahr. */
    sonstigeBezuege?: number;
    rentenversicherungspflichtig?: boolean;
    arbeitslosenversicherungspflichtig?: boolean;
    /** Kennung eines Zukunftsszenarios aus parameter/rechtsstaende.ts. */
    szenarioId?: string | null;
}

export interface RechnerErgebnis {
    brutto: number;
    steuern: {
        lohnsteuer: number;
        soli: number;
        kirchensteuer: number;
        lohnsteuerSonstigeBezuege: number;
        soliSonstigeBezuege: number;
        kirchensteuerSonstigeBezuege: number;
        summe: number;
    };
    sozialabgaben: {
        rv: number;
        av: number;
        kv: number;
        pv: number;
        summe: number;
        art: SvErgebnis['art'];
        saetze: SvErgebnis['saetzeArbeitnehmer'];
    };
    arbeitgeber: {
        rv: number;
        av: number;
        kv: number;
        pv: number;
        summe: number;
        /** Bruttolohn plus Arbeitgeberanteile. */
        gesamtkosten: number;
    };
    netto: { jahr: number; monat: number };
    quoten: {
        /** Steuern + Arbeitnehmerbeitraege in Prozent des Bruttos. */
        abgabenquote: number;
        steuerquote: number;
        sozialabgabenquote: number;
        /** Anteil des naechsten Euro, der als Steuern und Beitraege abgeht. */
        grenzabgabenquote: number;
        /** Davon nur Steuern. */
        grenzsteuerquote: number;
    };
    rechtsstand: {
        id: string;
        bezeichnung: string;
        rechtsstatus: string;
        jahr: number;
    };
    hinweise: string[];
}

const r2 = euroRunden;

/**
 * Schrittweite fuer die numerische Grenzabgabenquote.
 * 1.200 EUR/Jahr entspricht 100 EUR mehr im Monat - gross genug, um die
 * Cent-Rundungen des Programmablaufplans nicht zu verstaerken, und klein
 * genug, um lokal aussagekraeftig zu bleiben.
 */
const GRENZ_DELTA = 1200;

function berechneRoh(e: RechnerEingabe, stand: Rechtsstand) {
    const kvArt = e.krankenversicherung;
    const zuschuss =
        kvArt === 'privat'
            ? e.pkvArbeitgeberzuschussMonat === 'maximal' ||
              e.pkvArbeitgeberzuschussMonat === undefined
                ? maximalerPkvZuschuss(e.bundesland, e.kvZusatzProzent, stand.sv).summe
                : e.pkvArbeitgeberzuschussMonat
            : 0;

    const sv = berechneSozialabgaben({
        bruttoJahr: e.bruttoJahr,
        bundesland: e.bundesland,
        kvZusatzProzent: e.kvZusatzProzent,
        kinderFuerPflege: e.kinderFuerPflege,
        alter: e.alter,
        krankenversicherung:
            kvArt === 'privat'
                ? {
                      art: 'privat',
                      monatsbeitrag: e.pkvMonatsbeitrag ?? 0,
                      arbeitgeberzuschussMonat: zuschuss,
                  }
                : { art: 'gesetzlich' },
        ueberschreibungen: stand.svUeberschreibungen,
        parameter: stand.sv,
    });

    const steuerEingabe: LohnsteuerEingabe = {
        bruttoJahr: e.bruttoJahr,
        steuerklasse: e.steuerklasse,
        kinderfreibetraege: e.kinderfreibetraege,
        alter: e.alter,
        bundesland: e.bundesland,
        kirchensteuer: e.kirchensteuer,
        kvZusatzbeitragProzent: (stand.svUeberschreibungen?.kvZusatz ?? e.kvZusatzProzent / 100) * 100,
        kinderFuerPflegeversicherung: e.kinderFuerPflege,
        krankenversicherung:
            kvArt === 'privat'
                ? {
                      art: 'privat',
                      monatsbeitrag: e.pkvMonatsbeitrag ?? 0,
                      arbeitgeberzuschussMonat: zuschuss,
                  }
                : { art: 'gesetzlich' },
        arbeitslosenversicherungspflichtig: e.arbeitslosenversicherungspflichtig ?? true,
        rentenversicherungspflichtig: e.rentenversicherungspflichtig ?? true,
        jahresfreibetrag: e.jahresfreibetrag ?? 0,
        sonstigeBezuege: e.sonstigeBezuege ?? 0,
    };

    const steuer = berechneLohnsteuer(steuerEingabe);

    // Steuerfaktor eines Szenarios wirkt auf Lohnsteuer und Soli gemeinsam.
    const faktor = stand.steuerfaktor ?? 1;
    const lohnsteuer = r2(steuer.lohnsteuer * faktor);
    const soli = r2(steuer.soli * faktor);
    const lstSonst = r2(steuer.lohnsteuerSonstigeBezuege * faktor);
    const soliSonst = r2(steuer.soliSonstigeBezuege * faktor);

    // Kirchensteuer ggf. kappen. Bemessungsgrundlage der Kappung ist das zu
    // versteuernde Einkommen; naeherungsweise Brutto minus Vorsorgeaufwand.
    let kirchensteuer = r2(steuer.kirchensteuer * faktor);
    let kirchensteuerSonst = r2(steuer.kirchensteuerSonstigeBezuege * faktor);
    if (e.kirchensteuer && e.kirchensteuerKappungProzent) {
        const zvE = Math.max(0, e.bruttoJahr - sv.arbeitnehmer.summe - 1230 - 36);
        const gekappt = KIRCHENSTEUER.kappung.anwenden(
            kirchensteuer + kirchensteuerSonst,
            zvE,
            e.kirchensteuerKappungProzent
        );
        const anteil = kirchensteuer + kirchensteuerSonst > 0
            ? gekappt / (kirchensteuer + kirchensteuerSonst)
            : 1;
        kirchensteuer = r2(kirchensteuer * anteil);
        kirchensteuerSonst = r2(kirchensteuerSonst * anteil);
    }

    const steuerSumme = r2(lohnsteuer + soli + kirchensteuer + lstSonst + soliSonst + kirchensteuerSonst);

    return { sv, steuerSumme, lohnsteuer, soli, kirchensteuer, lstSonst, soliSonst, kirchensteuerSonst };
}

export function berechne(e: RechnerEingabe): RechnerErgebnis {
    const stand = e.szenarioId ? rechtsstandFuer(e.szenarioId) : RECHTSSTAND_GELTEND;
    const roh = berechneRoh(e, stand);
    const { sv } = roh;

    const bruttoGesamt = e.bruttoJahr + (e.sonstigeBezuege ?? 0);
    const netto = r2(bruttoGesamt - sv.arbeitnehmer.summe - roh.steuerSumme);

    // Grenzabgabenquote: numerisch, inklusive Sozialabgaben.
    const oben = berechneRoh({ ...e, bruttoJahr: e.bruttoJahr + GRENZ_DELTA }, stand);
    const nettoOben =
        e.bruttoJahr + GRENZ_DELTA + (e.sonstigeBezuege ?? 0) -
        oben.sv.arbeitnehmer.summe -
        oben.steuerSumme;
    const grenzabgabenquote = bruttoGesamt > 0 ? ((GRENZ_DELTA - (nettoOben - netto)) / GRENZ_DELTA) * 100 : 0;
    const grenzsteuerquote =
        bruttoGesamt > 0 ? ((oben.steuerSumme - roh.steuerSumme) / GRENZ_DELTA) * 100 : 0;

    const hinweise = [...sv.hinweise];
    if (e.steuerklasse === 5 || e.steuerklasse === 6) {
        hinweise.push(
            'In den Steuerklassen V und VI ist der Lohnsteuerabzug bewusst hoch. Die endgültige ' +
                'Steuer ergibt sich erst aus der Einkommensteuerveranlagung; häufig entsteht eine Erstattung.'
        );
    }
    if (e.steuerklasse === 3) {
        hinweise.push(
            'Steuerklasse III führt zu einem niedrigen laufenden Abzug. Bei der Kombination III/V ' +
                'besteht Pflicht zur Einkommensteuererklärung; Nachzahlungen sind möglich.'
        );
    }
    if (e.kirchensteuerKappungProzent) {
        hinweise.push(KIRCHENSTEUER.kappung.hinweis);
    }

    return {
        brutto: r2(bruttoGesamt),
        steuern: {
            lohnsteuer: roh.lohnsteuer,
            soli: roh.soli,
            kirchensteuer: roh.kirchensteuer,
            lohnsteuerSonstigeBezuege: roh.lstSonst,
            soliSonstigeBezuege: roh.soliSonst,
            kirchensteuerSonstigeBezuege: roh.kirchensteuerSonst,
            summe: roh.steuerSumme,
        },
        sozialabgaben: {
            rv: sv.arbeitnehmer.rv,
            av: sv.arbeitnehmer.av,
            kv: sv.arbeitnehmer.kv,
            pv: sv.arbeitnehmer.pv,
            summe: sv.arbeitnehmer.summe,
            art: sv.art,
            saetze: sv.saetzeArbeitnehmer,
        },
        arbeitgeber: {
            rv: sv.arbeitgeber.rv,
            av: sv.arbeitgeber.av,
            kv: sv.arbeitgeber.kv,
            pv: sv.arbeitgeber.pv,
            summe: sv.arbeitgeber.summe,
            gesamtkosten: r2(bruttoGesamt + sv.arbeitgeber.summe),
        },
        netto: { jahr: netto, monat: r2(netto / 12) },
        quoten: {
            abgabenquote: bruttoGesamt > 0 ? r2(((roh.steuerSumme + sv.arbeitnehmer.summe) / bruttoGesamt) * 100) : 0,
            steuerquote: bruttoGesamt > 0 ? r2((roh.steuerSumme / bruttoGesamt) * 100) : 0,
            sozialabgabenquote: bruttoGesamt > 0 ? r2((sv.arbeitnehmer.summe / bruttoGesamt) * 100) : 0,
            grenzabgabenquote: r2(grenzabgabenquote),
            grenzsteuerquote: r2(grenzsteuerquote),
        },
        rechtsstand: {
            id: stand.id,
            bezeichnung: stand.bezeichnung,
            rechtsstatus: stand.rechtsstatus,
            jahr: stand.jahr,
        },
        hinweise,
    };
}

/** Jahresarbeitsentgeltgrenze des aktiven Rechtsstands. */
export function jaeg(szenarioId?: string | null): number {
    const stand = szenarioId ? rechtsstandFuer(szenarioId) : RECHTSSTAND_GELTEND;
    return stand.sv.jaeg.wert;
}

export { SV_2026 };
