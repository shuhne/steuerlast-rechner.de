'use client';

import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Gemeinsame Gestaltungsbausteine.
 *
 * WARUM ES DIESE DATEI GIBT
 * -------------------------
 * Bis Oktober 2026 setzte jede Karte ihren Innenabstand selbst: 16, 20, 24
 * oder 32 Pixel, je nach Stelle. Die Inhaltskanten untereinanderliegender
 * Karten fluchteten dadurch nicht. Der Monat/Jahr-Umschalter existierte
 * zweimal - im Formular gross, im Ergebnis mit 24 Pixeln Hoehe und in
 * umgekehrter Reihenfolge.
 *
 * Neue Karten und Umschalter bitte nur ueber diese Bausteine bauen.
 */

export const cn = (...i: ClassValue[]) => twMerge(clsx(i));

/**
 * Die drei Kartenvarianten. Mehr gibt es bewusst nicht.
 *
 * - `standard`: jede Inhaltskarte (Abzuege, Analysen, Eingabepanel, FAQ).
 * - `kennzahl`: kompakte Kachel im Kennzahlenraster.
 * - `hervorgehoben`: das Ergebnis selbst. Rahmen- und Verlaufsfarbe kommen
 *   vom Aufrufer, weil sie den Rechtsstand anzeigen (indigo/rose/amber).
 *
 * `standard` und `hervorgehoben` haben denselben Innenabstand, damit die
 * Inhaltskanten in der Ergebnisspalte auf einer Linie liegen.
 */
export const KARTE = {
    standard: 'rounded-xl border border-slate-800 bg-slate-900 p-5 sm:p-6',
    kennzahl: 'min-w-0 rounded-xl border border-slate-800 bg-slate-900 p-3 sm:p-4',
    hervorgehoben: 'relative overflow-hidden rounded-xl border bg-gradient-to-br to-slate-900 p-5 sm:p-6',
} as const;

/** Waagerechter Innenabstand von `standard`, fuer aufklappbare Kopfzeilen. */
export const KARTE_PX = 'px-5 sm:px-6';

/** 48 px Feldhoehe: zwei integrierte Stepper haben jeweils 24 px Platz. */
export const STEUER_HOEHE = 'h-12';

export interface UmschalterOption<T> {
    wert: T;
    label: string;
    /** Wenn die sichtbare Beschriftung allein nicht eindeutig ist. */
    ariaLabel?: string;
}

const TON = {
    indigo: 'bg-indigo-600 text-white shadow-sm',
    amber: 'bg-amber-600 text-white shadow-sm',
} as const;

/**
 * Segmentierter Umschalter fuer zwei bis drei sich ausschliessende Optionen.
 *
 * Aussen 48 px hoch. Die sichtbare Schaltflaeche ist wegen des Innenrands
 * kleiner, die Klickflaeche reicht per Pseudo-Element aber bis an den Rahmen -
 * es gibt keinen toten Streifen zwischen den Segmenten.
 */
export function Umschalter<T extends string | boolean | number>({
    optionen,
    wert,
    setzen,
    label,
    ton = 'indigo',
    className,
}: {
    optionen: ReadonlyArray<UmschalterOption<T>>;
    wert: T;
    setzen: (v: T) => void;
    /** Gruppenbeschriftung fuer Screenreader. */
    label: string;
    ton?: keyof typeof TON;
    className?: string;
}) {
    return (
        <div
            role="group"
            aria-label={label}
            className={cn(
                'inline-grid shrink-0 auto-cols-fr grid-flow-col gap-1 rounded-lg border border-slate-800 bg-slate-950 p-1',
                STEUER_HOEHE,
                className
            )}
        >
            {optionen.map((o) => {
                const aktiv = o.wert === wert;
                return (
                    <button
                        key={String(o.wert)}
                        type="button"
                        aria-pressed={aktiv}
                        aria-label={o.ariaLabel}
                        onClick={() => setzen(o.wert)}
                        className={cn(
                            'relative min-w-0 whitespace-nowrap rounded-md px-2.5 text-sm font-semibold transition-colors',
                            'after:absolute after:-inset-x-0.5 after:-inset-y-1',
                            'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400',
                            aktiv ? TON[ton] : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                        )}
                    >
                        {o.label}
                    </button>
                );
            })}
        </div>
    );
}

/** Monat/Jahr in fester Reihenfolge - im Formular wie im Ergebnis. */
export const PERIODEN: ReadonlyArray<UmschalterOption<boolean>> = [
    { wert: true, label: 'Monat', ariaLabel: 'pro Monat' },
    { wert: false, label: 'Jahr', ariaLabel: 'pro Jahr' },
];

export const JA_NEIN: ReadonlyArray<UmschalterOption<boolean>> = [
    { wert: true, label: 'Ja' },
    { wert: false, label: 'Nein' },
];
