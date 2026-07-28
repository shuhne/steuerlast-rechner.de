'use client';

import React from 'react';
import {
    Area, CartesianGrid, ComposedChart, Legend, Line, ReferenceDot, ReferenceLine,
    ResponsiveContainer, Tooltip, XAxis, YAxis, Bar,
} from 'recharts';
import { ArrowRightLeft, TrendingDown, TrendingUp, Users } from 'lucide-react';
import { VERDIENSTE_2025, verteilungskurve } from '../../lib/statistik/verdienste';
import { BASISJAHR, KAUFKRAFT_QUELLEN, kaufkraftverlust } from '../../lib/statistik/kaufkraft';
import { formatEuro, formatProzent, useRechner } from './useRechner';

type Props = ReturnType<typeof useRechner>;

const achse = { stroke: '#64748b', tick: { fontSize: 12, fill: '#64748b' } };
const tooltipStil = {
    contentStyle: { backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' },
    itemStyle: { color: '#f8fafc' },
    labelStyle: { color: '#94a3b8' },
};
const kEuro = (v: number) => (v === 0 ? '0' : `${Math.round(v / 1000)}k`);

// Recharts gibt Werte als `number | undefined` und Namen als ReactNode heraus.
type WertTyp = number | undefined;
type NameTyp = string | number | undefined;
const zahl = (v: unknown): number => (typeof v === 'number' ? v : Number(v) || 0);

function Karte({
    titel, untertitel, icon, quelle, children,
}: {
    titel: string; untertitel: string; icon: React.ReactNode; quelle?: string; children: React.ReactNode;
}) {
    return (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 sm:p-6">
            <div className="mb-4">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-white">{icon}{titel}</h3>
                <p className="mt-1 text-sm text-slate-400">{untertitel}</p>
            </div>
            {children}
            {quelle && <p className="mt-3 text-[11px] leading-relaxed text-slate-600">{quelle}</p>}
        </div>
    );
}

export function Analysen(p: Props) {
    if (!p.hatEingabe || !p.ergebnis) return null;

    return (
        <div className="space-y-4">
            <Teilzeit {...p} />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Grenzbelastung {...p} />
                <Einordnung {...p} />
            </div>
            <Kaufkraft {...p} />
            <Paarvergleich {...p} />
        </div>
    );
}

function Teilzeit(p: Props) {
    if (!p.teilzeit) return null;
    const daten = p.teilzeit.map((t) => ({
        name: `${t.anteilProzent} %`,
        stunden: Math.round(p.z.wochenstunden * (t.anteilProzent / 100) * 10) / 10,
        netto: t.nettoMonat,
        jeStunde: t.nettoJeWochenstunde / 12,
        verlust: t.nettoverlustProzent,
        stundenPlus: t.stundennettoVeraenderungProzent,
    }));
    const achtzig = p.teilzeit.find((t) => t.anteilProzent === 80);

    return (
        <Karte
            titel="Teilzeit"
            untertitel="Was Stundenreduzierung wirklich kostet"
            icon={<ArrowRightLeft className="h-5 w-5 text-indigo-400" />}
            quelle="Rentenanwartschaft: Entgeltpunkte = Bruttoentgelt geteilt durch das vorläufige Durchschnittsentgelt der Rentenversicherung (51.944 € für 2026)."
        >
            {achtzig && (
                <p className="mb-4 rounded-lg border border-indigo-500/20 bg-indigo-950/30 p-3 text-sm leading-relaxed text-slate-300">
                    Bei <strong className="text-white">80 % Arbeitszeit</strong> verlierst du{' '}
                    <strong className="text-rose-300">{formatProzent(achtzig.nettoverlustProzent)}</strong> deines
                    Nettos, arbeitest aber 20 % weniger. Dein Netto je Arbeitsstunde{' '}
                    {achtzig.stundennettoVeraenderungProzent >= 0 ? 'steigt' : 'sinkt'} um{' '}
                    <strong className={achtzig.stundennettoVeraenderungProzent >= 0 ? 'text-emerald-300' : 'text-rose-300'}>
                        {formatProzent(Math.abs(achtzig.stundennettoVeraenderungProzent))}
                    </strong>
                    .
                </p>
            )}
            <div className="h-[280px] w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={daten} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="name" {...achse} />
                        <YAxis yAxisId="l" {...achse} tickFormatter={kEuro} />
                        <YAxis yAxisId="r" orientation="right" {...achse} tickFormatter={(v) => `${v} €`} />
                        <Tooltip
                            {...tooltipStil}
                            formatter={(v: WertTyp, n: NameTyp) => [formatEuro(zahl(v)), n]}
                            labelFormatter={(l) => `Arbeitszeit ${l}`}
                        />
                        <Legend wrapperStyle={{ paddingTop: 16 }} />
                        <Bar yAxisId="l" dataKey="netto" name="Netto / Monat" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                        <Line yAxisId="r" type="monotone" dataKey="jeStunde" name="Netto je Wochenstunde / Monat" stroke="#34d399" strokeWidth={2} dot={{ r: 3 }} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[440px] text-left text-xs">
                    <thead className="text-slate-500">
                        <tr>
                            <th className="pb-2 font-medium">Arbeitszeit</th>
                            <th className="pb-2 text-right font-medium">Netto/Monat</th>
                            <th className="pb-2 text-right font-medium">Nettoverlust</th>
                            <th className="pb-2 text-right font-medium">Stundennetto</th>
                            <th className="pb-2 text-right font-medium">Entgeltpunkte</th>
                        </tr>
                    </thead>
                    <tbody className="font-mono text-slate-300">
                        {p.teilzeit.map((t) => (
                            <tr key={t.anteilProzent} className="border-t border-slate-800/60">
                                <td className="py-1.5">{t.anteilProzent} %</td>
                                <td className="py-1.5 text-right">{formatEuro(t.nettoMonat, 0)}</td>
                                <td className="py-1.5 text-right text-rose-300">
                                    {t.nettoverlustProzent === 0 ? '–' : `−${formatProzent(t.nettoverlustProzent)}`}
                                </td>
                                <td className="py-1.5 text-right text-emerald-300">
                                    {t.stundennettoVeraenderungProzent === 0 ? '–' : `+${formatProzent(t.stundennettoVeraenderungProzent)}`}
                                </td>
                                <td className="py-1.5 text-right">{t.entgeltpunkte.toLocaleString('de-DE', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Karte>
    );
}

function Grenzbelastung(p: Props) {
    if (!p.kurve || !p.ergebnis) return null;
    const daten = p.kurve.map((k) => ({
        brutto: k.bruttoJahr,
        netto: k.nettoJahr,
        grenze: k.grenzabgabenquote,
        grenzeSteuer: k.grenzsteuerquote,
    }));

    return (
        <Karte
            titel="Grenzbelastung"
            untertitel="Wie viel vom nächsten Euro ankommt"
            icon={<TrendingUp className="h-5 w-5 text-indigo-400" />}
            quelle="Die Grenzabgabenquote enthält Lohnsteuer, Solidaritätszuschlag, Kirchensteuer und Arbeitnehmerbeiträge zur Sozialversicherung. Die sichtbaren Sprünge liegen an den Beitragsbemessungsgrenzen (69.750 € und 101.400 €), oberhalb derer keine weiteren Beiträge anfallen."
        >
            <p className="mb-4 rounded-lg border border-indigo-500/20 bg-indigo-950/30 p-3 text-sm leading-relaxed text-slate-300">
                Von 100 € mehr brutto bleiben dir rund{' '}
                <strong className="text-white">
                    {formatEuro(100 - p.ergebnis.quoten.grenzabgabenquote, 0)}
                </strong>{' '}
                netto. Davon entfallen {formatProzent(p.ergebnis.quoten.grenzsteuerquote)} auf Steuern
                und {formatProzent(p.ergebnis.quoten.grenzabgabenquote - p.ergebnis.quoten.grenzsteuerquote)} auf Sozialabgaben.
            </p>
            <div className="h-[280px] w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={daten} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="nettoVerlauf" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="brutto" type="number" domain={['dataMin', 'dataMax']} {...achse} tickFormatter={kEuro} />
                        <YAxis yAxisId="l" {...achse} tickFormatter={kEuro} />
                        <YAxis yAxisId="r" orientation="right" domain={[0, 70]} unit="%" {...achse} />
                        <Tooltip
                            {...tooltipStil}
                            labelFormatter={(v: React.ReactNode) => `Brutto ${formatEuro(zahl(v), 0)}`}
                            formatter={(v: WertTyp, n: NameTyp) =>
                                String(n).includes('quote')
                                    ? [formatProzent(zahl(v)), n]
                                    : [formatEuro(zahl(v), 0), n]
                            }
                        />
                        <Legend wrapperStyle={{ paddingTop: 16 }} />
                        <Area yAxisId="l" type="monotone" dataKey="netto" name="Netto" stroke="#60a5fa" strokeWidth={2} fill="url(#nettoVerlauf)" />
                        <Line yAxisId="r" type="monotone" dataKey="grenze" name="Grenzabgabenquote" stroke="#f43f5e" strokeWidth={2} dot={false} />
                        <Line yAxisId="r" type="monotone" dataKey="grenzeSteuer" name="davon Steuern" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
                        <ReferenceLine yAxisId="l" x={p.bruttoJahr} stroke="#475569" strokeDasharray="5 3" label={{ value: 'du', position: 'top', fill: '#64748b', fontSize: 11 }} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </Karte>
    );
}

function Einordnung(p: Props) {
    if (!p.einordnung) return null;
    const kurve = verteilungskurve();

    return (
        <Karte
            titel="Einordnung"
            untertitel="Dein Bruttogehalt im Vergleich"
            icon={<Users className="h-5 w-5 text-indigo-400" />}
            quelle={`${VERDIENSTE_2025.quelle.herausgeber}: ${VERDIENSTE_2025.quelle.titel}. ${VERDIENSTE_2025.quelle.fundstelle}`}
        >
            <div className="mb-4 space-y-2 rounded-lg border border-indigo-500/20 bg-indigo-950/30 p-3 text-sm leading-relaxed text-slate-300">
                <p>
                    Du verdienst mehr als{' '}
                    <strong className="text-white">{Math.round(p.einordnung.perzentilGesamt)} %</strong>{' '}
                    der Vollzeitbeschäftigten in Deutschland.
                </p>
                <p className="text-xs text-slate-400">
                    Median aller Vollzeitbeschäftigten: {formatEuro(p.einordnung.medianGesamt, 0)}.
                    Bezogen auf dein Alter wären es rund {Math.round(p.einordnung.perzentilAltersgruppe)} % —
                    diese Zahl beruht allerdings auf einer Modellannahme zum Altersprofil, nicht auf
                    amtlichen Daten.
                </p>
            </div>
            <div className="h-[240px] w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={kurve} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="perzentil" type="number" domain={[5, 99]} {...achse} tickFormatter={(v) => `${v} %`} />
                        <YAxis {...achse} tickFormatter={kEuro} scale="log" domain={['dataMin', 'dataMax']} />
                        <Tooltip
                            {...tooltipStil}
                            labelFormatter={(v: React.ReactNode) => `${v}. Perzentil`}
                            formatter={(v: WertTyp) => [formatEuro(zahl(v), 0), 'Bruttojahresverdienst']}
                        />
                        <Line type="monotone" dataKey="brutto" stroke="#818cf8" strokeWidth={2} dot={false} name="Verteilung" />
                        <ReferenceDot x={p.einordnung.perzentilGesamt} y={p.bruttoJahr} r={5} fill="#34d399" stroke="#0f172a" strokeWidth={2} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </Karte>
    );
}

function Kaufkraft(p: Props) {
    if (!p.kaufkraft || !p.ergebnis) return null;
    const verlust = kaufkraftverlust(2050);

    return (
        <Karte
            titel="Kaufkraft über die Zeit"
            untertitel={`Was dein Netto von ${formatEuro(p.ergebnis.netto.jahr, 0)} in anderen Jahren bedeutet`}
            icon={<TrendingDown className="h-5 w-5 text-indigo-400" />}
            quelle={`Historische Teuerungsraten: ${KAUFKRAFT_QUELLEN.vergangenheit.herausgeber}, ${KAUFKRAFT_QUELLEN.vergangenheit.titel}. Ab ${BASISJAHR + 1} mit 2 % pro Jahr fortgeschrieben — eine Annahme, keine Prognose.`}
        >
            <p className="mb-4 rounded-lg border border-amber-500/20 bg-amber-950/20 p-3 text-sm leading-relaxed text-slate-300">
                Bleibt dein Gehalt nominal gleich, hat es 2050 nur noch die Kaufkraft von rund{' '}
                <strong className="text-white">
                    {formatEuro(p.kaufkraft.find((k) => k.jahr === 2050)?.realwertOhneErhoehung ?? 0, 0)}
                </strong>{' '}
                in heutigen Preisen — ein Verlust von {verlust} %.
            </p>
            <div className="h-[280px] w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={p.kaufkraft} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="jahr" type="number" domain={[2000, 2050]} ticks={[2000, 2010, 2020, BASISJAHR, 2030, 2040, 2050]} {...achse} />
                        <YAxis {...achse} tickFormatter={kEuro} />
                        <Tooltip
                            {...tooltipStil}
                            labelFormatter={(v) => `Jahr ${v}`}
                            formatter={(v: WertTyp, n: NameTyp) => [formatEuro(zahl(v), 0), n]}
                        />
                        <Legend wrapperStyle={{ paddingTop: 16 }} />
                        <ReferenceLine x={BASISJAHR} stroke="#475569" strokeDasharray="6 3" label={{ value: 'heute', position: 'top', fill: '#64748b', fontSize: 11 }} />
                        <Line type="monotone" dataKey="kaufkraftaequivalent" name="Betrag für gleiche Kaufkraft" stroke="#60a5fa" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="realwertOhneErhoehung" name="Realwert ohne Gehaltserhöhung" stroke="#f59e0b" strokeWidth={2} strokeDasharray="6 3" dot={false} connectNulls={false} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </Karte>
    );
}

function Paarvergleich(p: Props) {
    if (!p.paarvergleich) return null;

    return (
        <Karte
            titel="Steuerklassen für Paare"
            untertitel="Beispielrechnung: Partner verdient 60 % deines Bruttos"
            icon={<Users className="h-5 w-5 text-indigo-400" />}
        >
            <div className="overflow-x-auto">
                <table className="w-full min-w-[400px] text-left text-sm">
                    <thead className="text-xs text-slate-500">
                        <tr>
                            <th className="pb-2 font-medium">Kombination</th>
                            <th className="pb-2 text-right font-medium">Netto zusammen / Jahr</th>
                            <th className="pb-2 text-right font-medium">Differenz</th>
                        </tr>
                    </thead>
                    <tbody className="font-mono text-slate-300">
                        {p.paarvergleich.varianten.map((v) => (
                            <tr key={v.bezeichnung} className="border-t border-slate-800/60">
                                <td className="py-2 font-sans">
                                    {v.bezeichnung}
                                    {v.bezeichnung === p.paarvergleich!.beste && (
                                        <span className="ml-2 rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300">
                                            höchstes laufendes Netto
                                        </span>
                                    )}
                                </td>
                                <td className="py-2 text-right">{formatEuro(v.nettoGesamt, 0)}</td>
                                <td className="py-2 text-right text-slate-500">
                                    {v.differenz === 0 ? '–' : formatEuro(v.differenz, 0)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">{p.paarvergleich.hinweis}</p>
        </Karte>
    );
}
