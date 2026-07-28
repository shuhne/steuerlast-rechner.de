'use client';

import React, { useId, useState } from 'react';
import { Info } from 'lucide-react';

/**
 * Erklaerung zu einem Feld oder einer Kennzahl.
 *
 * Bewusst als Tooltip und nicht als Dauertext: Erklaerungen unter jedem Feld
 * haben das Eingabepanel auf rund 1.100 Pixel aufgeblaeht - laenger als ein
 * uebliches Browserfenster. Der Inhalt bleibt derselbe, nur auf Abruf.
 *
 * Erreichbar per Maus (Hover), Tastatur (Fokus) und Touch (Klick).
 */
export function InfoTooltip({ text, ausrichtung = 'mitte' }: { text: string; ausrichtung?: 'mitte' | 'rechts' }) {
    const [sichtbar, setSichtbar] = useState(false);
    const id = useId();

    return (
        <span className="relative inline-flex items-center">
            <button
                type="button"
                aria-label="Erklärung anzeigen"
                aria-describedby={sichtbar ? id : undefined}
                aria-expanded={sichtbar}
                onMouseEnter={() => setSichtbar(true)}
                onMouseLeave={() => setSichtbar(false)}
                onFocus={() => setSichtbar(true)}
                onBlur={() => setSichtbar(false)}
                onClick={(e) => {
                    e.preventDefault();
                    setSichtbar((v) => !v);
                }}
                className="cursor-help rounded-full p-0.5 text-slate-500 transition-colors hover:text-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
                <Info className="h-3.5 w-3.5" />
            </button>

            {sichtbar && (
                <span
                    id={id}
                    role="tooltip"
                    className={`absolute bottom-full z-50 mb-2 w-64 rounded-lg border border-slate-700 bg-slate-950 p-3 text-xs leading-relaxed text-slate-300 shadow-xl ${
                        ausrichtung === 'rechts' ? 'right-0' : 'left-1/2 -translate-x-1/2'
                    }`}
                >
                    {text}
                </span>
            )}
        </span>
    );
}
