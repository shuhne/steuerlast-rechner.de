'use client';

import React, { useMemo, useSyncExternalStore } from 'react';

/**
 * Postanschrift, die erst im Browser zusammengesetzt wird.
 * Einfacher Bot-Schutz, ausdruecklich kein Sicherheitsmechanismus.
 */

// "Sascha Huhne (B.Sc. Wirtschaftsinformatik)"
const TEIL_1 = 'U2FzY2hhIEh1aG5lIChCLlNjLiBXaXJ0c2NoYWZ0c2luZm9ybWF0aWsp';
// "Fischerinsel 9"
const TEIL_2 = 'RmlzY2hlcmluc2VsIDk=';
// "10179 Berlin"
const TEIL_3 = 'MTAxNzkgQmVybGlu';

const dekodieren = (s: string): string => {
    try {
        return atob(s);
    } catch {
        return 'Fehler beim Laden';
    }
};

const imBrowser = () => true;
const aufDemServer = () => false;

export function ProtectedAddress() {
    // useSyncExternalStore liefert auf dem Server false und nach der
    // Hydration true - ohne setState in einem Effect.
    const geladen = useSyncExternalStore(
        () => () => {},
        imBrowser,
        aufDemServer
    );

    const zeilen = useMemo(
        () => (geladen ? [TEIL_1, TEIL_2, TEIL_3].map(dekodieren) : null),
        [geladen]
    );

    if (!zeilen) {
        return <div className="h-20 w-48 animate-pulse rounded bg-slate-800/50" aria-hidden="true" />;
    }

    return (
        <div className="select-none" onCopy={(e) => e.preventDefault()}>
            {zeilen.map((zeile, i) => (
                <React.Fragment key={i}>
                    <span>{zeile}</span>
                    <br />
                </React.Fragment>
            ))}
            <span>Deutschland</span>
        </div>
    );
}
