'use client';

import { createContext, createElement, useContext, useMemo, useState } from 'react';
import {
    berechne,
    berechne1958,
    gehaltskurve,
    steuerklassenvergleich,
    stundenlohn,
    teilzeitanalyse,
    jaeg,
    svWerte,
    SV_2026,
    rechtsstandFuer,
    RECHTSSTAND_GELTEND,
} from '../../lib/tax';
import { bonusModellUnterstuetzt } from '../../lib/tax/rechner';
import type { RechnerEingabe } from '../../lib/tax';
import { einordnen } from '../../lib/statistik/verdienste';
import { kaufkraftreihe } from '../../lib/statistik/kaufkraft';

/**
 * Zustand und Berechnung des Rechners.
 *
 * ALLES LAEUFT IM BROWSER. Es gibt keinen Netzwerkaufruf. Damit stimmt die
 * Datenschutzaussage der Seite wieder - vorher wurden Gehalt, Steuerklasse,
 * Bundesland, Alter und Kinderzahl bei jeder Eingabeaenderung an drei
 * Server-Endpunkte geschickt, waehrend die Oberflaeche "Berechnung im
 * Browser" versprach.
 */

export type Ansicht = 'rechner' | 'historisch';

export interface RechnerZustand {
    bruttoEingabe: string;
    periode: 'jahr' | 'monat';
    steuerklasse: number;
    bundesland: string;
    kirchensteuer: boolean;
    alter: number;
    kinderfreibetraege: number;
    hatKinder: boolean;
    kinderUnter25: number;
    eigenerZusatzbeitrag: boolean;
    krankenversicherung: 'gesetzlich' | 'privat';
    kvZusatzProzent: number;
    pkvMonatsbeitrag: number;
    wochenstunden: number;
    sonstigeBezuege: number;
    jahresfreibetrag: number;
    kirchensteuerKappungProzent: number | null;
    szenarioId: string;
    bereinigung1958: 'lohn' | 'preis';
    /** Was-waere-wenn: Gehaltserhoehung in Prozent auf das eingegebene Brutto. */
    lohnerhoehungProzent: number;
    /** Was-waere-wenn: Arbeitszeitanteil in Prozent. Wirkt auf Brutto und Stunden. */
    arbeitszeitProzent: number;
}

export const STANDARD: RechnerZustand = {
    bruttoEingabe: '',
    periode: 'jahr',
    steuerklasse: 1,
    bundesland: 'BE',
    kirchensteuer: false,
    alter: 30,
    kinderfreibetraege: 0,
    hatKinder: false,
    kinderUnter25: 0,
    eigenerZusatzbeitrag: false,
    krankenversicherung: 'gesetzlich',
    kvZusatzProzent: 2.9,
    pkvMonatsbeitrag: 0,
    wochenstunden: 40,
    sonstigeBezuege: 0,
    jahresfreibetrag: 0,
    kirchensteuerKappungProzent: null,
    szenarioId: RECHTSSTAND_GELTEND.id,
    bereinigung1958: 'lohn',
    lohnerhoehungProzent: 0,
    arbeitszeitProzent: 100,
};

export function parseZahl(text: string): number {
    const wert = text.trim();
    if (!wert) return 0;
    // Deutsche Gruppierung oder Dezimalpunkt mit höchstens zwei Centstellen.
    // Ungültige Eingaben bleiben sichtbar; niemals Zeichen still entfernen.
    if (/^\d+(?:,\d{1,2})?$/.test(wert)) return Number(wert.replace(',', '.'));
    if (/^\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?$/.test(wert)) return Number(wert.replace(/\./g, '').replace(',', '.'));
    if (/^\d+\.\d{1,2}$/.test(wert)) return Number(wert);
    return Number.NaN;
}

/**
 * Wechselt die Einheit, in der ueber das Gehalt gesprochen wird.
 *
 * Das Gehalt selbst bleibt dabei gleich - nur die Zahl im Eingabefeld wird
 * umgerechnet. 60.000 EUR jaehrlich und 5.000 EUR monatlich sind dasselbe
 * Gehalt.
 *
 * Als reine Funktion herausgezogen, damit beide Umschalter (Eingabefeld und
 * Ergebniskarte) zwingend denselben Code benutzen. Genau das war vorher nicht
 * der Fall: Der Umschalter in der Ergebniskarte setzte nur die Einheit, ohne
 * den Betrag umzurechnen. Aus 60.000 EUR im Jahr wurden dadurch 60.000 EUR im
 * Monat - der Rechner rechnete anschliessend mit 720.000 EUR Jahresgehalt.
 */
export function periodeWechseln(
    zustand: RechnerZustand,
    neuePeriode: 'jahr' | 'monat'
): RechnerZustand {
    if (zustand.periode === neuePeriode) return zustand;

    const wert = parseZahl(zustand.bruttoEingabe);
    if (!Number.isFinite(wert) || wert <= 0) return { ...zustand, periode: neuePeriode };

    const umgerechnet = neuePeriode === 'monat' ? wert / 12 : wert * 12;

    return {
        ...zustand,
        periode: neuePeriode,
        bruttoEingabe: umgerechnet.toLocaleString('de-DE', { maximumFractionDigits: 2 }),
    };
}

export function formatEuro(v: number, nachkomma = 2): string {
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: nachkomma,
        maximumFractionDigits: nachkomma,
    }).format(v);
}

export function formatProzent(v: number, nachkomma = 1): string {
    return `${v.toLocaleString('de-DE', {
        minimumFractionDigits: nachkomma,
        maximumFractionDigits: nachkomma,
    })} %`;
}

function useRechnerZustand() {
    const [z, setZ] = useState<RechnerZustand>(STANDARD);
    const [ansicht, setAnsicht] = useState<Ansicht>('rechner');
    return { z, setZ, ansicht, setAnsicht };
}
const RechnerKontext = createContext<ReturnType<typeof useRechnerZustand> | null>(null);
/** Nur im Arbeitsspeicher des Tabs; kein Storage und keine Übertragung. */
export function RechnerProvider({ children }: { children: React.ReactNode }) {
    return createElement(RechnerKontext.Provider, { value: useRechnerZustand() }, children);
}

export function useRechner() {
    const kontext = useContext(RechnerKontext);
    if (!kontext) throw new Error('RechnerProvider fehlt');
    const { z, setZ, ansicht, setAnsicht } = kontext;

    const setzen = <K extends keyof RechnerZustand>(schluessel: K, wert: RechnerZustand[K]) =>
        setZ((alt) => ({ ...alt, [schluessel]: wert }));

    const zuruecksetzen = () => {
        setZ(STANDARD);
        setAnsicht('rechner');
    };

    /** Das eingegebene Gehalt, ohne die Was-waere-wenn-Regler. */
    const bruttoBasisJahr = useMemo(() => {
        const v = parseZahl(z.bruttoEingabe);
        return z.periode === 'monat' ? v * 12 : v;
    }, [z.bruttoEingabe, z.periode]);

    /**
     * Die Regler veraendern nicht das Eingabefeld, sondern nur das Ergebnis.
     * Frueher wurde der berechnete Wert in das Feld zurueckgeschrieben - damit
     * ging die urspruengliche Eingabe verloren und ein Zuruecksetzen der Regler
     * fuehrte nicht mehr zum Ausgangswert.
     */
    const hatAnpassung = z.lohnerhoehungProzent !== 0 || z.arbeitszeitProzent !== 100;

    const bruttoJahr = useMemo(
        () =>
            bruttoBasisJahr *
            (1 + z.lohnerhoehungProzent / 100) *
            (z.arbeitszeitProzent / 100),
        [bruttoBasisJahr, z.lohnerhoehungProzent, z.arbeitszeitProzent]
    );

    /** Wochenstunden, auf die sich der Stundenlohn bezieht. */
    const wochenstundenEffektiv = z.wochenstunden * (z.arbeitszeitProzent / 100);

    const bruttoFehler = z.bruttoEingabe.trim() && (!Number.isFinite(bruttoJahr) || bruttoJahr <= 0 || bruttoJahr > 10_000_000)
        ? 'Bitte ein positives Gehalt eingeben, z. B. 5.000,00 oder 5000.00 (höchstens 10 Mio. € pro Jahr).' : null;
    const eingabeFehler = bruttoFehler
        || (z.krankenversicherung === 'privat' && !(z.pkvMonatsbeitrag > 0) ? 'Bitte deinen PKV-Monatsbeitrag inklusive Pflegepflichtversicherung ergänzen.' : null)
        || (![z.alter, z.wochenstunden, z.kvZusatzProzent, z.kinderUnter25, z.kinderfreibetraege].every(Number.isFinite) ? 'Bitte die leeren Zahlenfelder ergänzen.' : null)
        || (!Number.isInteger(z.alter) || z.alter < 14 || z.alter > 100 || z.wochenstunden < 1 || z.wochenstunden > 80 || z.kvZusatzProzent < 0 || z.kvZusatzProzent > 10 || !Number.isInteger(z.kinderUnter25) || z.kinderUnter25 < 0 || z.kinderUnter25 > 20 || z.kinderfreibetraege < 0 || z.kinderfreibetraege > 20 || !Number.isInteger(z.kinderfreibetraege * 2) ? 'Bitte die gültigen Wertebereiche beachten: Alter und Kinder unter 25 in ganzen Zahlen, Kinderfreibeträge in halben Schritten.' : null)
        || (z.sonstigeBezuege > 0 && bruttoJahr / 12 <= svWerte(SV_2026).uebergangsbereichObergrenze ? 'Bonus bei Mini- und Midijobs ist nicht modelliert. Bitte den Bonus entfernen.' : null);
    const hatEingabe = bruttoJahr > 0 && !eingabeFehler;

    /**
     * Einheit, in der ueber Betraege gesprochen wird - geteilt zwischen
     * Eingabefeld und Ergebnis. Beide Umschalter rufen dieselbe Funktion.
     */
    const monatlich = z.periode === 'monat';
    const setPeriode = (neue: 'jahr' | 'monat') => setZ((alt) => periodeWechseln(alt, neue));
    const setMonatlich = (m: boolean) => setPeriode(m ? 'monat' : 'jahr');

    const eingabe: RechnerEingabe = useMemo(
        () => ({
            bruttoJahr,
            steuerklasse: z.steuerklasse,
            bundesland: z.bundesland,
            kirchensteuer: z.kirchensteuer,
            kirchensteuerKappungProzent: z.kirchensteuerKappungProzent,
            alter: z.alter,
            kinderfreibetraege: z.kinderfreibetraege,
            kinderFuerPflege: z.hatKinder ? z.kinderUnter25 : 0,
            hatKinder: z.hatKinder,
            eigenerZusatzbeitrag: z.eigenerZusatzbeitrag,
            krankenversicherung: z.krankenversicherung,
            kvZusatzProzent: z.kvZusatzProzent,
            pkvMonatsbeitrag: z.pkvMonatsbeitrag,
            pkvArbeitgeberzuschussMonat: 'maximal',
            jahresfreibetrag: z.jahresfreibetrag,
            sonstigeBezuege: z.sonstigeBezuege,
            szenarioId: z.szenarioId === RECHTSSTAND_GELTEND.id ? null : z.szenarioId,
        }),
        [bruttoJahr, z]
    );

    const ergebnis = useMemo(
        () => (hatEingabe ? berechne(eingabe) : null),
        [hatEingabe, eingabe]
    );

    /** Vergleichsergebnis nach geltendem Recht, wenn ein Szenario aktiv ist. */
    const referenz = useMemo(
        () =>
            hatEingabe && z.szenarioId !== RECHTSSTAND_GELTEND.id
                ? berechne({ ...eingabe, szenarioId: null })
                : null,
        [hatEingabe, eingabe, z.szenarioId]
    );

    /** Ergebnis ohne die Regler, als Vergleichsmassstab. */
    const basisErgebnis = useMemo(
        () =>
            hatEingabe && hatAnpassung && bruttoBasisJahr > 0 && bonusModellUnterstuetzt({ ...eingabe, bruttoJahr: bruttoBasisJahr })
                ? berechne({ ...eingabe, bruttoJahr: bruttoBasisJahr })
                : null,
        [hatEingabe, hatAnpassung, bruttoBasisJahr, eingabe]
    );

    /**
     * Ergebnis nach geltendem Recht - unabhaengig vom gewaehlten Rechtsstand.
     * Die Zeitreise nach 1958 muss dagegen vergleichen: Ein Vergleich "1958
     * gegen eine Modellrechnung fuer 2035" waere unter der Ueberschrift
     * "heutiges Recht" schlicht falsch beschriftet.
     */
    const ergebnisGeltendesRecht = referenz ?? ergebnis;

    const teilzeit = useMemo(
        () =>
            hatEingabe
                ? teilzeitanalyse(
                      eingabe,
                      wochenstundenEffektiv,
                      [100, 90, 80, 70, 60, 50]
                  )
                : null,
        [hatEingabe, eingabe, wochenstundenEffektiv]
    );

    const kurve = useMemo(
        () => (hatEingabe ? gehaltskurve(eingabe, 50, 160, 22) : null),
        [hatEingabe, eingabe]
    );

    const stunden = useMemo(
        () =>
            ergebnis
                ? stundenlohn(ergebnis, wochenstundenEffektiv, svWerte(SV_2026).mindestlohn)
                : null,
        [ergebnis, wochenstundenEffektiv]
    );

    const einordnung = useMemo(
        () => (hatEingabe ? einordnen(bruttoJahr, z.alter) : null),
        [hatEingabe, bruttoJahr, z.alter]
    );

    const kaufkraft = useMemo(
        () => (hatEingabe && ergebnis ? kaufkraftreihe(ergebnis.netto.jahr, 2000, 2050) : null),
        [hatEingabe, ergebnis]
    );

    const paarvergleich = useMemo(
        () => (hatEingabe && bonusModellUnterstuetzt({ ...eingabe, bruttoJahr: bruttoJahr * 0.6 }) ? steuerklassenvergleich(eingabe, { ...eingabe, bruttoJahr: bruttoJahr * 0.6 }) : null),
        [hatEingabe, eingabe, bruttoJahr]
    );

    const historisch = useMemo(
        () =>
            hatEingabe
                ? berechne1958({
                      bruttoJahrEur: bruttoJahr,
                      bereinigung: z.bereinigung1958,
                      veranlagung: z.steuerklasse === 3 ? 'zusammen' : 'einzel',
                      kirchensteuer: z.kirchensteuer,
                      bundesland: z.bundesland,
                  })
                : null,
        [hatEingabe, bruttoJahr, z.bereinigung1958, z.steuerklasse, z.kirchensteuer, z.bundesland]
    );

    const rechtsstand = rechtsstandFuer(z.szenarioId);
    const pkvMoeglich = bruttoJahr > jaeg(z.szenarioId);

    return {
        z,
        setzen,
        zuruecksetzen,
        ansicht,
        setAnsicht,
        bruttoJahr,
        bruttoBasisJahr,
        wochenstundenEffektiv,
        hatAnpassung,
        basisErgebnis,
        monatlich,
        setPeriode,
        setMonatlich,
        hatEingabe,
        bruttoFehler,
        eingabeFehler,
        ergebnis,
        referenz,
        ergebnisGeltendesRecht,
        teilzeit,
        kurve,
        stunden,
        einordnung,
        kaufkraft,
        paarvergleich,
        historisch,
        rechtsstand,
        pkvMoeglich,
    };
}
