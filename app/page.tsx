'use client';

import React from 'react';
import { CalculatorLayout } from '../components/CalculatorLayout';
import { EingabePanel } from '../components/rechner/EingabePanel';
import { ErgebnisPanel } from '../components/rechner/ErgebnisPanel';
import { Analysen } from '../components/rechner/Analysen';
import { Zeitreise1958 } from '../components/rechner/Zeitreise1958';
import { useRechner } from '../components/rechner/useRechner';
import { PAP_META } from '../lib/tax';

export default function Home() {
    const r = useRechner();

    const inhalt = (
        <article className="prose prose-invert prose-slate max-w-none">
            <h2 className="mb-6 text-3xl font-bold text-white">Wie dieser Rechner arbeitet</h2>
            <p className="mb-6 leading-relaxed text-slate-400">
                Die Lohnsteuer wird nach dem amtlichen Programmablaufplan des
                Bundesfinanzministeriums berechnet — demselben Verfahren, das auch
                Lohnabrechnungsprogramme verwenden. Der Rechenkern wird direkt aus der vom BMF
                veröffentlichten XML-Fassung erzeugt und gegen die amtlichen Prüftabellen
                getestet: 43 Bruttostufen in sechs Steuerklassen, in beiden Tabellen, mit einer
                Toleranz von null Euro.
            </p>

            <div className="my-10 grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                    <h3 className="mb-3 text-xl font-semibold text-white">Was berechnet wird</h3>
                    <ul className="space-y-2 text-slate-400">
                        <li className="flex gap-2"><span className="text-indigo-400">•</span> Lohnsteuer, Solidaritätszuschlag und Kirchensteuer</li>
                        <li className="flex gap-2"><span className="text-indigo-400">•</span> Renten-, Arbeitslosen-, Kranken- und Pflegeversicherung</li>
                        <li className="flex gap-2"><span className="text-indigo-400">•</span> Arbeitgeberanteile und Gesamtkosten der Stelle</li>
                        <li className="flex gap-2"><span className="text-indigo-400">•</span> Übergangsbereich bei Midijobs, Einmalzahlungen, Freibeträge</li>
                    </ul>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                    <h3 className="mb-3 text-xl font-semibold text-white">Was der Rechner nicht kann</h3>
                    <ul className="space-y-2 text-slate-400">
                        <li className="flex gap-2"><span className="text-slate-600">•</span> Die endgültige Steuer — die ergibt sich aus der Veranlagung</li>
                        <li className="flex gap-2"><span className="text-slate-600">•</span> Betriebliche Altersvorsorge und geldwerte Vorteile</li>
                        <li className="flex gap-2"><span className="text-slate-600">•</span> Faktorverfahren und Mehrfachbeschäftigung</li>
                        <li className="flex gap-2"><span className="text-slate-600">•</span> Zuverlässige Prognosen künftiger Rechtslagen</li>
                    </ul>
                </div>
            </div>

            <h2 className="mb-4 text-2xl font-bold text-white">Warum Szenarien und keine Prognosen</h2>
            <p className="mb-6 leading-relaxed text-slate-400">
                Beitragssätze und Steuertarife ändern sich laufend. Dieser Rechner trennt deshalb
                sauber zwischen geltendem Recht, veröffentlichten Gesetzentwürfen, politischen
                Ankündigungen und eigenen Annahmen. Jedes Szenario zeigt seinen rechtlichen Status
                und benennt, was es bewusst nicht abbildet. Eine politische Ankündigung ist keine
                künftige Rechtslage — und wird hier auch nicht als solche dargestellt.
            </p>

            <p className="text-sm text-slate-500">
                Rechenkern: amtlicher Programmablaufplan {PAP_META.jahr}, Version {PAP_META.version},
                Stand {PAP_META.stand}.
            </p>
        </article>
    );

    return (
        <CalculatorLayout
            sidebar={<EingabePanel {...r} />}
            results={
                <div className="space-y-4">
                    {r.ansicht === 'historisch' ? (
                        <Zeitreise1958 {...r} />
                    ) : (
                        <>
                            <ErgebnisPanel {...r} />
                            <Analysen {...r} />
                        </>
                    )}
                </div>
            }
            content={inhalt}
        />
    );
}
