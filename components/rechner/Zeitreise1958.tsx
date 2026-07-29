'use client';

import React from 'react';
import { History, TriangleAlert } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { GRENZEN_1958, P1958 } from '../../lib/tax';
import { formatEuro, formatProzent, useRechner } from './useRechner';

const cn = (...i: ClassValue[]) => twMerge(clsx(i));

type Props = ReturnType<typeof useRechner>;

const formatDM = (v: number) =>
    `${v.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} DM`;

export function Zeitreise1958(p: Props) {
    if (!p.hatEingabe || !p.historisch || !p.ergebnisGeltendesRecht) {
        return (
            <div className="rounded-xl border border-dashed border-amber-700/50 bg-slate-900 p-8 text-center">
                <History className="mx-auto mb-4 h-8 w-8 text-amber-500" />
                <p className="text-sm text-slate-400">
                    Gib dein Bruttogehalt ein, um den Vergleich mit 1958 zu sehen.
                </p>
            </div>
        );
    }

    const h = p.historisch;
    // Immer gegen geltendes Recht, auch wenn oben ein Szenario gewaehlt ist.
    const heute = p.ergebnisGeltendesRecht;
    const differenz = h.inEuro.netto - heute.netto.jahr;

    return (
        <div className="space-y-4">
            <div className="rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-900/30 to-slate-900 p-5">
                <div className="mb-3 flex items-center gap-2">
                    <History className="h-6 w-6 text-amber-400" />
                    <h3 className="text-xl font-semibold text-white">Zeitreise nach 1958</h3>
                </div>
                <p className="mb-5 text-sm leading-relaxed text-slate-300">
                    1958 ist das Geburtsjahr des heutigen Formeltarifs und des Ehegattensplittings.
                    Dein Bruttogehalt von {formatEuro(p.bruttoJahr, 0)} entspricht{' '}
                    {p.z.bereinigung1958 === 'lohn' ? 'lohnbereinigt' : 'kaufkraftbereinigt'} einem
                    Jahresbrutto von <strong className="text-amber-200">{formatDM(h.bruttoDm)}</strong>{' '}
                    im Jahr 1958.
                </p>

                <div className="mb-5 grid grid-cols-2 gap-1 rounded-lg border border-slate-800 bg-slate-950 p-1">
                    {(
                        [
                            ['lohn', 'Relative Position (Lohn)'],
                            ['preis', 'Kaufkraft (Preise)'],
                        ] as const
                    ).map(([k, label]) => (
                        <button
                            key={k}
                            onClick={() => p.setzen('bereinigung1958', k)}
                            className={cn(
                                'rounded-md px-2 py-2 text-xs font-bold transition-all',
                                p.z.bereinigung1958 === k
                                    ? 'bg-amber-600 text-white shadow'
                                    : 'text-slate-400 hover:text-white'
                            )}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-lg border border-slate-800/60 bg-slate-950/40 p-4">
                        <div className="text-xs uppercase tracking-wider text-slate-500">Netto nach 1958er Recht</div>
                        <div className="mt-1 text-3xl font-bold text-white">{formatEuro(h.inEuro.netto, 0)}</div>
                        <div className="mt-1 text-xs text-slate-500">
                            {formatDM(h.nettoDm)} · Abgabenquote {formatProzent(h.abgabenquote)}
                        </div>
                    </div>
                    <div className="rounded-lg border border-slate-800/60 bg-slate-950/40 p-4">
                        <div className="text-xs uppercase tracking-wider text-slate-500">Netto nach heutigem Recht</div>
                        <div className="mt-1 text-3xl font-bold text-white">{formatEuro(heute.netto.jahr, 0)}</div>
                        <div className="mt-1 text-xs text-slate-500">
                            Abgabenquote {formatProzent(heute.quoten.abgabenquote)}
                        </div>
                    </div>
                </div>

                <div
                    className={cn(
                        'mt-4 rounded-lg border p-3 text-sm font-semibold',
                        differenz >= 0
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                            : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                    )}
                >
                    {differenz >= 0 ? '+' : ''}
                    {formatEuro(differenz, 0)} pro Jahr nach 1958er Recht
                </div>
            </div>

            {/* Aufschlüsselung */}
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 sm:p-6">
                <h4 className="mb-4 text-base font-semibold text-white">Aufschlüsselung 1958</h4>
                <div className="space-y-2 rounded-lg border border-slate-800/50 bg-slate-950/50 p-3 text-sm">
                    {[
                        ['Bruttojahreslohn', h.bruttoDm],
                        ['Rentenversicherung (7,0 %)', -h.rvDm],
                        ['Arbeitslosenversicherung (1,0 %)', -h.avDm],
                        ['Krankenversicherung (rund 4,0 %)', -h.kvDm],
                        ['Pflegeversicherung', 0],
                        ['zu versteuerndes Einkommen', h.zvEDm],
                        ['Einkommensteuer', -h.einkommensteuerDm],
                        ...(p.z.kirchensteuer ? ([['Kirchensteuer', -h.kirchensteuerDm]] as Array<[string, number]>) : []),
                        ['Solidaritätszuschlag', 0],
                    ].map(([name, wert]) => (
                        <div key={name as string} className="flex justify-between gap-3">
                            <span className="text-slate-400">
                                {name as string}
                                {(name === 'Pflegeversicherung' || name === 'Solidaritätszuschlag') && (
                                    <span className="ml-1.5 text-xs text-slate-600">(gab es 1958 nicht)</span>
                                )}
                            </span>
                            <span className="shrink-0 font-mono text-white">{formatDM(wert as number)}</span>
                        </div>
                    ))}
                    <div className="flex justify-between gap-3 border-t border-slate-800 pt-2 font-bold">
                        <span className="text-slate-200">Nettojahreslohn</span>
                        <span className="font-mono text-white">{formatDM(h.nettoDm)}</span>
                    </div>
                </div>
                {h.hinweise.map((t, i) => (
                    <p key={i} className="mt-3 text-xs leading-relaxed text-slate-500">{t}</p>
                ))}
            </div>

            {/* Grenzen des Vergleichs */}
            <div className="rounded-xl border border-amber-500/20 bg-amber-950/10 p-4 sm:p-6">
                <h4 className="mb-3 flex items-center gap-2 text-base font-semibold text-amber-200">
                    <TriangleAlert className="h-4 w-4" />
                    Was der Vergleich nicht erfasst
                </h4>
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-400">
                    {GRENZEN_1958.map((t, i) => (
                        <li key={i}>{t}</li>
                    ))}
                </ul>
                <p className="mt-4 border-t border-amber-500/20 pt-3 text-xs leading-relaxed text-slate-500">
                    Diese Lücken wirken überwiegend in dieselbe Richtung — das Netto von 1958
                    fällt hier eher zu günstig aus.
                </p>
            </div>

            {/* Datengrundlage */}
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 sm:p-6">
                <h4 className="mb-3 text-base font-semibold text-white">Datengrundlage 1958</h4>
                <div className="space-y-3 text-xs leading-relaxed">
                    {[
                        P1958.grundfreibetragDm, P1958.rvSatz, P1958.avSatz, P1958.kvSatz,
                        P1958.bbgRvAvDm, P1958.bbgKvDm, P1958.kaufkraftfaktor,
                    ].map((param, i) => (
                        <div key={i} className="border-l-2 border-slate-800 pl-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono text-slate-300">
                                    {param.einheit?.startsWith('DM')
                                        ? formatDM(param.wert)
                                        : param.wert < 1
                                          ? formatProzent(param.wert * 100, 2)
                                          : param.wert.toLocaleString('de-DE')}
                                </span>
                                {param.belastbarkeit !== 'belegt' && (
                                    <span className="rounded border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-300">
                                        {param.belastbarkeit}
                                    </span>
                                )}
                            </div>
                            <div className="text-slate-500">
                                {param.quelle.herausgeber}: {param.quelle.titel}
                            </div>
                            {param.hinweis && <div className="mt-1 text-slate-600">{param.hinweis}</div>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
