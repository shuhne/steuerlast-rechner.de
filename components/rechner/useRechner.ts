'use client';

import { useMemo, useState } from 'react';
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
    kinder: number;
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
    kinder: 0,
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
    if (!text) return 0;
    return parseFloat(text.replace(/\./g, '').replace(',', '.')) || 0;
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

export function useRechner() {
    const [z, setZ] = useState<RechnerZustand>(STANDARD);
    const [ansicht, setAnsicht] = useState<Ansicht>('rechner');

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

    const hatEingabe = bruttoJahr > 0;

    /** Anzeigeeinheit - geteilt zwischen Eingabe und Ergebnis. */
    const monatlich = z.periode === 'monat';
    const setMonatlich = (m: boolean) => setzen('periode', m ? 'monat' : 'jahr');

    const eingabe: RechnerEingabe = useMemo(
        () => ({
            bruttoJahr,
            steuerklasse: z.steuerklasse,
            bundesland: z.bundesland,
            kirchensteuer: z.kirchensteuer,
            kirchensteuerKappungProzent: z.kirchensteuerKappungProzent,
            alter: z.alter,
            kinderfreibetraege: z.kinder,
            kinderFuerPflege: z.kinder,
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
            hatAnpassung && bruttoBasisJahr > 0
                ? berechne({ ...eingabe, bruttoJahr: bruttoBasisJahr })
                : null,
        [hatAnpassung, bruttoBasisJahr, eingabe]
    );

    const teilzeit = useMemo(
        () =>
            hatEingabe
                ? teilzeitanalyse(
                      eingabe,
                      wochenstundenEffektiv,
                      [100, 90, 80, 70, 60, 50],
                      svWerte(SV_2026).durchschnittsentgelt
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
        () => (hatEingabe ? steuerklassenvergleich(eingabe, { ...eingabe, bruttoJahr: bruttoJahr * 0.6 }) : null),
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
    const pkvMoeglich = bruttoJahr >= jaeg(null);

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
        setMonatlich,
        hatEingabe,
        ergebnis,
        referenz,
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
