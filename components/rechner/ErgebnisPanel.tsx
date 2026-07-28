'use client';

import React, { useState } from 'react';
import { AlertTriangle, Building2, ChevronDown, ChevronUp, HeartPulse, Info, Wallet } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { RechnerErgebnis } from '../../lib/tax';
import { PAP_META, SV_2026 } from '../../lib/tax';
import { formatEuro, formatProzent, useRechner } from './useRechner';
import { RechtsstatusChip } from './EingabePanel';

const cn = (...i: ClassValue[]) => twMerge(clsx(i));

type Props = ReturnType<typeof useRechner>;

function Zeile({
    name,
    betrag,
    erlaeuterung,
    monatlich,
    stark,
}: {
    name: string;
    betrag: number;
    erlaeuterung?: string;
    monatlich: boolean;
    stark?: boolean;
}) {
    return (
        <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className={cn('text-slate-400', stark && 'font-semibold text-slate-200')}>
                {name}
                {erlaeuterung && (
                    <span className="ml-1.5 text-xs text-slate-600">{erlaeuterung}</span>
                )}
            </span>
            <span className={cn('shrink-0 font-mono text-white', stark && 'font-bold')}>
                {formatEuro(monatlich ? betrag / 12 : betrag)}
            </span>
        </div>
    );
}

export function ErgebnisPanel(p: Props) {
    const [monatlich, setMonatlich] = useState(true);
    const [methodikOffen, setMethodikOffen] = useState(false);
    const [agOffen, setAgOffen] = useState(false);

    if (!p.hatEingabe || !p.ergebnis) {
        return (
            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-700/70 bg-slate-900 p-8 text-center lg:min-h-[480px]">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10">
                    <Wallet className="h-7 w-7 text-indigo-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">Deine Auswertung erscheint hier</h3>
                <p className="max-w-xs text-sm leading-relaxed text-slate-400">
                    Gib dein Bruttogehalt ein. Alles wird direkt in deinem Browser gerechnet.
                </p>
            </div>
        );
    }

    const e: RechnerErgebnis = p.ergebnis;
    const st = e.steuern;
    const sv = e.sozialabgaben;
    const steuernSumme =
        st.lohnsteuer + st.soli + st.kirchensteuer +
        st.lohnsteuerSonstigeBezuege + st.soliSonstigeBezuege + st.kirchensteuerSonstigeBezuege;

    return (
        <div className="space-y-4">
            {/* Szenario-Warnung */}
            {e.rechtsstand.rechtsstatus !== 'geltendes_recht' && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="font-semibold text-amber-100">
                                    {e.rechtsstand.bezeichnung}
                                </span>
                                <RechtsstatusChip status={e.rechtsstand.rechtsstatus} klein />
                            </div>
                            <p className="text-sm leading-relaxed text-amber-100/90">
                                Das ist kein geltendes Recht, sondern ein Szenario. Die Zahlen sind
                                keine Prognose deines künftigen Nettogehalts.
                            </p>
                            {p.rechtsstand.nichtModelliert.length > 0 && (
                                <details className="group">
                                    <summary className="cursor-pointer list-none text-xs font-semibold text-amber-300 hover:text-amber-200">
                                        Was dieses Szenario bewusst nicht abbildet
                                        <ChevronDown className="ml-1 inline h-3 w-3 transition-transform group-open:rotate-180" />
                                    </summary>
                                    <ul className="mt-2 list-disc space-y-1.5 pl-4 text-xs leading-relaxed text-amber-100/80">
                                        {p.rechtsstand.nichtModelliert.map((t, i) => (
                                            <li key={i}>{t}</li>
                                        ))}
                                    </ul>
                                </details>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Netto */}
            <div className="relative overflow-hidden rounded-xl border border-indigo-500/30 bg-gradient-to-br from-indigo-900/50 to-slate-900 p-5">
                <div className="relative z-10">
                    <div className="mb-3 flex items-center gap-2">
                        <Wallet className="h-6 w-6 text-indigo-400" />
                        <h3 className="text-xl font-semibold text-white">Dein Nettogehalt</h3>
                    </div>
                    <div className="text-4xl font-bold leading-none tracking-tight text-white sm:text-5xl">
                        {formatEuro(monatlich ? e.netto.monat : e.netto.jahr)}
                    </div>
                    <div className="mt-4 flex items-center gap-1.5">
                        {([true, false] as const).map((m) => (
                            <button
                                key={String(m)}
                                onClick={() => setMonatlich(m)}
                                className={cn(
                                    'rounded px-3 py-1 text-xs font-bold transition-colors',
                                    monatlich === m
                                        ? 'border border-indigo-400/50 bg-indigo-500/30 text-indigo-200'
                                        : 'bg-slate-700/30 text-slate-400 hover:bg-slate-700/50'
                                )}
                            >
                                {m ? 'Monatlich' : 'Jährlich'}
                            </button>
                        ))}
                    </div>

                    {p.referenz && (
                        <div className="mt-5 rounded-xl border border-slate-800/50 bg-slate-950/40 p-3">
                            <div
                                className={cn(
                                    'text-lg font-bold',
                                    e.netto.jahr >= p.referenz.netto.jahr ? 'text-emerald-400' : 'text-rose-400'
                                )}
                            >
                                {e.netto.jahr >= p.referenz.netto.jahr ? '+' : ''}
                                {formatEuro(
                                    monatlich
                                        ? e.netto.monat - p.referenz.netto.monat
                                        : e.netto.jahr - p.referenz.netto.jahr
                                )}
                                <span className="ml-2 text-xs font-normal text-slate-400">
                                    gegenüber geltendem Recht 2026
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Kennzahlen */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                    { label: 'Abgabenquote', wert: formatProzent(e.quoten.abgabenquote), hinweis: 'Steuern und Beiträge zusammen' },
                    { label: 'Grenzabgabenquote', wert: formatProzent(e.quoten.grenzabgabenquote), hinweis: 'vom nächsten Euro' },
                    { label: 'Netto je Stunde', wert: p.stunden ? formatEuro(p.stunden.nettoJeStunde) : '–', hinweis: `bei ${p.z.wochenstunden} h/Woche` },
                    { label: 'Arbeitgeberkosten', wert: formatEuro(monatlich ? e.arbeitgeber.gesamtkosten / 12 : e.arbeitgeber.gesamtkosten), hinweis: 'Brutto plus AG-Anteile' },
                ].map((k) => (
                    <div key={k.label} className="rounded-xl border border-slate-800 bg-slate-900 p-3">
                        <div className="text-xs text-slate-400">{k.label}</div>
                        <div className="mt-1 font-mono text-lg font-bold text-white">{k.wert}</div>
                        <div className="mt-0.5 text-[11px] leading-tight text-slate-600">{k.hinweis}</div>
                    </div>
                ))}
            </div>

            {/* Abzüge */}
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 sm:p-6">
                <h3 className="mb-4 text-lg font-semibold text-white">
                    Abzüge im Detail <span className="text-sm font-normal text-slate-500">({monatlich ? 'monatlich' : 'jährlich'})</span>
                </h3>

                <div className="space-y-5">
                    <div>
                        <div className="mb-3 flex items-center gap-2 font-medium text-slate-100">
                            <Building2 className="h-4 w-4 text-emerald-400" />
                            Steuern
                        </div>
                        <div className="space-y-2 rounded-lg border border-slate-800/50 bg-slate-950/50 p-3">
                            <Zeile name="Lohnsteuer" betrag={st.lohnsteuer} monatlich={monatlich} />
                            <Zeile
                                name="Solidaritätszuschlag"
                                erlaeuterung={st.soli === 0 ? '(unter der Freigrenze)' : undefined}
                                betrag={st.soli}
                                monatlich={monatlich}
                            />
                            {p.z.kirchensteuer && (
                                <Zeile
                                    name="Kirchensteuer"
                                    erlaeuterung={`${(p.z.bundesland === 'BY' || p.z.bundesland === 'BW' ? 8 : 9)} %`}
                                    betrag={st.kirchensteuer}
                                    monatlich={monatlich}
                                />
                            )}
                            {p.z.sonstigeBezuege > 0 && (
                                <>
                                    <Zeile name="Lohnsteuer auf Einmalzahlung" betrag={st.lohnsteuerSonstigeBezuege} monatlich={monatlich} />
                                    {st.soliSonstigeBezuege > 0 && (
                                        <Zeile name="Soli auf Einmalzahlung" betrag={st.soliSonstigeBezuege} monatlich={monatlich} />
                                    )}
                                    {p.z.kirchensteuer && st.kirchensteuerSonstigeBezuege > 0 && (
                                        <Zeile name="Kirchensteuer auf Einmalzahlung" betrag={st.kirchensteuerSonstigeBezuege} monatlich={monatlich} />
                                    )}
                                </>
                            )}
                            <div className="border-t border-slate-800 pt-2">
                                <Zeile name="Summe Steuern" betrag={steuernSumme} monatlich={monatlich} stark />
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="mb-3 flex items-center gap-2 font-medium text-slate-100">
                            <HeartPulse className="h-4 w-4 text-rose-400" />
                            Sozialabgaben
                            {sv.art !== 'regulaer' && (
                                <span className="rounded border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-300">
                                    {sv.art === 'minijob' ? 'Minijob' : 'Übergangsbereich'}
                                </span>
                            )}
                        </div>
                        <div className="space-y-2 rounded-lg border border-slate-800/50 bg-slate-950/50 p-3">
                            <Zeile name="Rentenversicherung" erlaeuterung={formatProzent(sv.saetze.rv * 100, 2)} betrag={sv.rv} monatlich={monatlich} />
                            <Zeile name="Arbeitslosenversicherung" erlaeuterung={formatProzent(sv.saetze.av * 100, 2)} betrag={sv.av} monatlich={monatlich} />
                            <Zeile
                                name="Krankenversicherung"
                                erlaeuterung={p.z.krankenversicherung === 'privat' ? '(privat, nach AG-Zuschuss)' : formatProzent(sv.saetze.kv * 100, 2)}
                                betrag={sv.kv}
                                monatlich={monatlich}
                            />
                            <Zeile
                                name="Pflegeversicherung"
                                erlaeuterung={p.z.krankenversicherung === 'privat' ? '(im PKV-Beitrag enthalten)' : formatProzent(sv.saetze.pv * 100, 2)}
                                betrag={sv.pv}
                                monatlich={monatlich}
                            />
                            <div className="border-t border-slate-800 pt-2">
                                <Zeile name="Summe Sozialabgaben" betrag={sv.summe} monatlich={monatlich} stark />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-indigo-500/20 bg-indigo-950/30 p-3">
                        <Zeile name="Bruttogehalt" betrag={e.brutto} monatlich={monatlich} />
                        <Zeile name="abzüglich Steuern und Beiträge" betrag={-(steuernSumme + sv.summe)} monatlich={monatlich} />
                        <div className="mt-2 border-t border-indigo-500/20 pt-2">
                            <Zeile name="Nettogehalt" betrag={e.netto.jahr} monatlich={monatlich} stark />
                        </div>
                    </div>
                </div>

                {/* Arbeitgeberanteile */}
                <div className="mt-4 overflow-hidden rounded-lg border border-slate-800">
                    <button
                        onClick={() => setAgOffen(!agOffen)}
                        className="flex w-full items-center justify-between bg-slate-950/50 px-3 py-2.5 text-sm text-slate-300 transition-colors hover:bg-slate-950"
                    >
                        <span>Was dein Arbeitgeber zusätzlich zahlt</span>
                        <span className="flex items-center gap-2">
                            <span className="font-mono text-white">
                                {formatEuro(monatlich ? e.arbeitgeber.summe / 12 : e.arbeitgeber.summe)}
                            </span>
                            {agOffen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </span>
                    </button>
                    {agOffen && (
                        <div className="space-y-2 border-t border-slate-800 bg-slate-950/30 p-3">
                            <Zeile name="Rentenversicherung" betrag={e.arbeitgeber.rv} monatlich={monatlich} />
                            <Zeile name="Arbeitslosenversicherung" betrag={e.arbeitgeber.av} monatlich={monatlich} />
                            <Zeile name="Krankenversicherung" betrag={e.arbeitgeber.kv} monatlich={monatlich} />
                            <Zeile name="Pflegeversicherung" betrag={e.arbeitgeber.pv} monatlich={monatlich} />
                            <div className="border-t border-slate-800 pt-2">
                                <Zeile name="Gesamtkosten der Stelle" betrag={e.arbeitgeber.gesamtkosten} monatlich={monatlich} stark />
                            </div>
                            <p className="pt-1 text-xs leading-relaxed text-slate-500">
                                Ohne Umlagen U1/U2/U3 und ohne Beiträge zur gesetzlichen Unfallversicherung.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Hinweise */}
            {e.hinweise.length > 0 && (
                <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                    {e.hinweise.map((h, i) => (
                        <div key={i} className="flex gap-2 text-sm leading-relaxed text-slate-400">
                            <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                            <span>{h}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Methodenkasten */}
            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
                <button
                    onClick={() => setMethodikOffen(!methodikOffen)}
                    className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-slate-950/40"
                >
                    <span className="text-sm font-semibold text-slate-300">Stand und Quellen</span>
                    {methodikOffen ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
                </button>
                <div className="border-t border-slate-800 px-4 py-3 text-xs leading-relaxed text-slate-500">
                    Berechnet nach dem amtlichen Programmablaufplan {PAP_META.jahr} des BMF
                    (Version {PAP_META.version}, Stand {PAP_META.stand}) sowie der
                    Sozialversicherungsrechengrößen-Verordnung 2026.
                </div>
                {methodikOffen && (
                    <div className="space-y-3 border-t border-slate-800 bg-slate-950/30 p-4 text-xs leading-relaxed text-slate-400">
                        {[
                            SV_2026.bbgRvAv, SV_2026.bbgKvPv, SV_2026.jaeg,
                            SV_2026.rvSatz, SV_2026.avSatz, SV_2026.kvAllgemein,
                            SV_2026.kvZusatzDurchschnitt, SV_2026.pvSatz, SV_2026.mindestlohn,
                        ].map((param, i) => (
                            <div key={i} className="border-l-2 border-slate-800 pl-3">
                                <div className="font-mono text-slate-300">
                                    {param.einheit === 'EUR/Jahr' || param.einheit === 'EUR/Stunde'
                                        ? formatEuro(param.wert)
                                        : formatProzent(param.wert * 100, 2)}
                                    {param.einheit ? ` ${param.einheit.replace('EUR', '')}` : ''}
                                </div>
                                <div className="text-slate-500">
                                    {param.quelle.herausgeber}: {param.quelle.titel}
                                    {param.quelle.fundstelle ? ` — ${param.quelle.fundstelle}` : ''}
                                </div>
                                {param.hinweis && <div className="mt-1 text-slate-600">{param.hinweis}</div>}
                            </div>
                        ))}
                        <p className="border-t border-slate-800 pt-3 text-slate-500">
                            Die Berechnung bildet den laufenden Lohnsteuerabzug ab. Die endgültige
                            Steuer ergibt sich erst aus der Einkommensteuerveranlagung. Nicht
                            abgebildet sind unter anderem betriebliche Altersvorsorge,
                            geldwerte Vorteile, Faktorverfahren und Mehrfachbeschäftigung.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
