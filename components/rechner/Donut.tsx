'use client';

import React from 'react';

/**
 * Ringdiagramm fuer die Zusammensetzung des Bruttos.
 *
 * Bewusst von Hand gezeichnet statt mit recharts: Das `<Pie>` von recharts 3
 * erzeugte in dieser Konstellation leere Sektor-Gruppen ohne Pfade. Fuer drei
 * Segmente lohnt die Abhaengigkeit ohnehin nicht - und so ist das Ergebnis
 * unabhaengig von Versionswechseln der Library.
 */

export interface DonutSegment {
    name: string;
    wert: number;
    farbe: string;
}

export function Donut({
    segmente,
    groesse = 200,
    dicke = 26,
    titel,
    wert,
}: {
    segmente: DonutSegment[];
    groesse?: number;
    dicke?: number;
    titel: string;
    wert: string;
}) {
    const summe = segmente.reduce((s, e) => s + Math.max(0, e.wert), 0);
    const radius = (groesse - dicke) / 2;
    const umfang = 2 * Math.PI * radius;
    const mitte = groesse / 2;

    // Kleine Luecke zwischen den Segmenten, aber nur wenn genug Platz ist.
    const luecke = segmente.length > 1 && summe > 0 ? Math.min(4, umfang / 200) : 0;

    let versatz = 0;

    return (
        <div className="relative" style={{ width: groesse, height: groesse }}>
            <svg
                width={groesse}
                height={groesse}
                viewBox={`0 0 ${groesse} ${groesse}`}
                role="img"
                aria-label={`${titel}: ${segmente
                    .map((s) => `${s.name} ${summe > 0 ? Math.round((s.wert / summe) * 100) : 0} Prozent`)
                    .join(', ')}`}
            >
                <g transform={`rotate(-90 ${mitte} ${mitte})`}>
                    <circle
                        cx={mitte}
                        cy={mitte}
                        r={radius}
                        fill="none"
                        stroke="#1e293b"
                        strokeWidth={dicke}
                    />
                    {summe > 0 &&
                        segmente.map((s) => {
                            const anteil = Math.max(0, s.wert) / summe;
                            const laenge = Math.max(0, anteil * umfang - luecke);
                            const kreis = (
                                <circle
                                    key={s.name}
                                    cx={mitte}
                                    cy={mitte}
                                    r={radius}
                                    fill="none"
                                    stroke={s.farbe}
                                    strokeWidth={dicke}
                                    strokeDasharray={`${laenge} ${umfang - laenge}`}
                                    strokeDashoffset={-versatz}
                                    strokeLinecap="butt"
                                />
                            );
                            versatz += anteil * umfang;
                            return kreis;
                        })}
                </g>
            </svg>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs text-slate-400">{titel}</span>
                <span className="font-mono text-lg font-bold text-white">{wert}</span>
            </div>
        </div>
    );
}
