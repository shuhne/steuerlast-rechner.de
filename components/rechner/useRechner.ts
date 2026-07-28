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

    const bruttoJahr = useMemo(() => {
        const v = parseZahl(z.bruttoEingabe);
        return z.periode === 'monat' ? v * 12 : v;
    }, [z.bruttoEingabe, z.periode]);

    const hatEingabe = bruttoJahr > 0;

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

    const teilzeit = useMemo(
        () =>
            hatEingabe
                ? teilzeitanalyse(
                      eingabe,
                      z.wochenstunden,
                      [100, 90, 80, 70, 60, 50],
                      svWerte(SV_2026).durchschnittsentgelt
                  )
                : null,
        [hatEingabe, eingabe, z.wochenstunden]
    );

    const kurve = useMemo(
        () => (hatEingabe ? gehaltskurve(eingabe, 50, 160, 22) : null),
        [hatEingabe, eingabe]
    );

    const stunden = useMemo(
        () =>
            ergebnis
                ? stundenlohn(ergebnis, z.wochenstunden, svWerte(SV_2026).mindestlohn)
                : null,
        [ergebnis, z.wochenstunden]
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
