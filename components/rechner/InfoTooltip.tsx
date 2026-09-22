'use client';

import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Info } from 'lucide-react';

/**
 * Erklaerung zu einem Feld oder einer Kennzahl.
 *
 * Bewusst als Tooltip und nicht als Dauertext: Erklaerungen unter jedem Feld
 * haben das Eingabepanel auf rund 1.100 Pixel aufgeblaeht - laenger als ein
 * uebliches Browserfenster. Der Inhalt bleibt derselbe, nur auf Abruf.
 *
 * Erreichbar per Maus (Hover), Tastatur (Fokus) und Touch (Klick).
 *
 * WARUM PORTAL UND FIXED POSITION
 * -------------------------------
 * Der Tooltip wird nach document.body gehaengt statt an Ort und Stelle
 * gerendert. Grund: Jeder Vorfahre mit `overflow: hidden` schneidet ihn sonst
 * ab. Genau das passierte im Expertenbereich - dessen Rahmen traegt
 * `overflow-hidden` fuer die runden Ecken und kappte die oberen 48 von 124
 * Pixeln des Tooltips.
 *
 * Ein Portal loest das ein fuer alle Mal, unabhaengig davon, in welchen
 * Container ein Tooltip kuenftig gesetzt wird.
 */

const ABSTAND = 8;
const BREITE = 256;

interface Position {
    left: number;
    top: number;
    /** Zeigt der Pfeil nach unten (Tooltip oberhalb) oder nach oben? */
    oberhalb: boolean;
}

export function InfoTooltip({ text, label = 'Information' }: { text: string; label?: string }) {
    const [position, setPosition] = useState<Position | null>(null);
    const knopfRef = useRef<HTMLButtonElement>(null);
    const id = useId();

    const oeffnen = useCallback(() => {
        const el = knopfRef.current;
        if (!el) return;

        const r = el.getBoundingClientRect();
        // Grobe Hoehenschaetzung reicht fuer die Entscheidung oben/unten.
        const geschaetzteHoehe = 40 + text.length * 0.42;
        const platzOben = r.top;
        const oberhalb = platzOben > geschaetzteHoehe + ABSTAND;

        // Waagerecht zentrieren, aber im Fenster halten.
        const links = Math.min(
            Math.max(ABSTAND, r.left + r.width / 2 - BREITE / 2),
            window.innerWidth - BREITE - ABSTAND
        );

        setPosition({
            left: links,
            top: oberhalb ? r.top - ABSTAND : r.bottom + ABSTAND,
            oberhalb,
        });
    }, [text]);

    const schliessen = useCallback(() => setPosition(null), []);

    // Der Tooltip liegt fix im Fenster. Scrollt die Seite, wandert der
    // Ausloeser darunter weg - der Tooltip stuende dann neben nichts. Beim
    // Zeigen mit der Maus schliesst er ohnehin, per Klick geoeffnet aber nicht.
    useEffect(() => {
        if (position === null) return;
        window.addEventListener('scroll', schliessen, true);
        window.addEventListener('resize', schliessen);
        return () => {
            window.removeEventListener('scroll', schliessen, true);
            window.removeEventListener('resize', schliessen);
        };
    }, [position, schliessen]);

    return (
        <>
            <button
                ref={knopfRef}
                type="button"
                aria-label={`${label}: Erklärung anzeigen`}
                aria-describedby={position ? id : undefined}
                aria-expanded={position !== null}
                onMouseEnter={oeffnen}
                onMouseLeave={schliessen}
                onFocus={oeffnen}
                onBlur={schliessen}
                onClick={(e) => {
                    e.preventDefault();
                    oeffnen();
                }}
                onKeyDown={(e) => { if (e.key === 'Escape') schliessen(); }}
                className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center cursor-help rounded-full text-slate-400 transition-colors hover:text-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
                <Info className="h-3.5 w-3.5" />
            </button>

            {position !== null &&
                typeof document !== 'undefined' &&
                createPortal(
                    <span
                        id={id}
                        role="tooltip"
                        style={{
                            position: 'fixed',
                            left: position.left,
                            top: position.top,
                            width: BREITE,
                            transform: position.oberhalb ? 'translateY(-100%)' : undefined,
                        }}
                        className="z-[100] block rounded-lg border border-slate-700 bg-slate-950 p-3 text-xs leading-relaxed text-slate-300 shadow-xl"
                    >
                        {text}
                    </span>,
                    document.body
                )}
        </>
    );
}
