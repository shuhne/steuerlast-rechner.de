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
            <h2 className="mb-6 text-3xl font-bold text-white">Was du hier herausfindest</h2>
            <p className="mb-6 leading-relaxed text-slate-400">
                Wie viel von deinem Bruttogehalt tatsächlich bei dir ankommt — und warum. Der
                Rechner zeigt dir nicht nur die Zahl unter dem Strich, sondern auch, was passiert,
                wenn sich etwas ändert: weniger Stunden, mehr Gehalt, ein Bonus im Dezember.
            </p>

            <div className="my-10 grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                    <h3 className="mb-3 text-xl font-semibold text-white">Lohnt sich Teilzeit?</h3>
                    <p className="leading-relaxed text-slate-400">
                        Weil die Steuer progressiv ist, sinkt dein Netto langsamer als deine
                        Arbeitszeit. Bei 80 Prozent verlierst du deutlich weniger als ein Fünftel —
                        dein Netto je Arbeitsstunde steigt sogar. Der Rechner zeigt dir die
                        Rechnung samt Auswirkung auf deine spätere Rente.
                    </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                    <h3 className="mb-3 text-xl font-semibold text-white">Was bringt mehr Gehalt?</h3>
                    <p className="leading-relaxed text-slate-400">
                        Von 100 Euro mehr brutto bleibt bei mittleren Einkommen ungefähr die
                        Hälfte. Wo genau du stehst, hängt von den Beitragsbemessungsgrenzen ab —
                        darüber wird jeder weitere Euro spürbar günstiger. Nützlich vor dem
                        nächsten Gespräch mit deiner Führungskraft.
                    </p>
                </div>
            </div>

            <h2 className="mb-4 text-2xl font-bold text-white">Und wie sieht es morgen aus?</h2>
            <p className="mb-6 leading-relaxed text-slate-400">
                Beitragssätze steigen, Steuertarife ändern sich. Neben dem geltenden Recht kannst
                du deshalb durchrechnen, was die amtlichen Vorausberechnungen für 2030, 2035 und
                2039 bedeuten würden. Jedes Szenario sagt dir, worauf es beruht — auf einem
                Gesetzentwurf, einer Modellrechnung der Bundesregierung oder einer Annahme. So
                weißt du, wie viel Gewicht die Zahl hat.
            </p>

            <h2 className="mb-4 text-2xl font-bold text-white">Woher die Zahlen kommen</h2>
            <p className="mb-6 leading-relaxed text-slate-400">
                Gerechnet wird nach dem amtlichen Programmablaufplan des
                Bundesfinanzministeriums — demselben Verfahren, das auch die Lohnabrechnung deines
                Arbeitgebers verwendet. Jede Zahl im Ergebnis lässt sich über den Bereich
                &bdquo;Stand und Quellen&ldquo; bis zur Fundstelle zurückverfolgen.
            </p>
            <p className="mb-6 leading-relaxed text-slate-400">
                Was der Rechner nicht leisten kann: Er bildet den laufenden Lohnsteuerabzug ab.
                Die endgültige Steuer ergibt sich erst aus deiner Einkommensteuererklärung.
                Betriebliche Altersvorsorge, Dienstwagen und das Faktorverfahren bleiben außen vor.
            </p>

            <p className="text-sm text-slate-500">
                Rechenkern: amtlicher Programmablaufplan {PAP_META.jahr}, Version {PAP_META.version},
                Stand {PAP_META.stand}. Keine Steuerberatung.
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
