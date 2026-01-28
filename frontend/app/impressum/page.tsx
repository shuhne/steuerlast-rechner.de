import React from 'react';
import { CalculatorLayout } from '../../components/CalculatorLayout';
import { Scale } from 'lucide-react';
import { StructuredData } from '../../components/StructuredData';
import { ProtectedAddress } from '../../components/ProtectedAddress';

export const metadata = {
    title: 'Impressum | Steuerlast-Rechner.de',
    description: 'Rechtliche Angaben und Kontaktinformationen für Steuerlast-Rechner.de',
    robots: {
        index: false,
        follow: true,
    },
};

export default function ImpressumPage() {
    const sidebar = (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl shadow-slate-950/50 h-full">
            <div className="flex items-center gap-2 text-indigo-400 mb-6">
                <Scale className="w-5 h-5" />
                <h2 className="text-lg font-semibold text-white">Rechtliches</h2>
            </div>
            <nav className="space-y-2">
                <a href="#angaben" className="block px-4 py-2 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 transition-colors">Angaben gemäß § 5 TMG</a>
                <a href="#kontakt" className="block px-4 py-2 rounded-lg text-slate-400 text-sm font-medium hover:bg-slate-800 hover:text-white transition-colors">Kontakt</a>
                <a href="#haftung" className="block px-4 py-2 rounded-lg text-slate-400 text-sm font-medium hover:bg-slate-800 hover:text-white transition-colors">Haftungsausschluss</a>
            </nav>
        </div>
    );

    const results = (
        <div className="space-y-6">
            <StructuredData />
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8 shadow-xl">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">Impressum</h1>

                <div className="space-y-8 text-slate-300">
                    <section id="angaben">
                        <h2 className="text-xl font-semibold text-white mb-4">Angaben gemäß § 5 TMG</h2>
                        <div className="text-slate-300">
                            <p className="mb-2 text-slate-400">Diese Webseite wird entwickelt und betrieben von:</p>
                            <ProtectedAddress />
                        </div>
                    </section>

                    <section className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                        <h3 className="text-lg font-semibold text-white mb-2">Hinweis zur Nutzung</h3>
                        <p className="text-slate-300 text-sm leading-relaxed">
                            Unser Rechner wurde ausgiebig auf korrekte Funktionsweise überprüft. Jedoch kann auf das Ergebnis keine Garantie gewährt werden.
                            Bei Fehlern oder Featurewünsche bitte ein <a href="https://github.com/shuhne/steuerlast-rechner.de/issues" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-white underline decoration-indigo-400/30 hover:decoration-white/50 transition-all">GitHub Issue anlegen</a>.
                        </p>
                    </section>

                    <section id="kontakt">
                        <h2 className="text-xl font-semibold text-white mb-4">Kontakt</h2>
                        <p>
                            E-Mail: <a href="mailto:info@steuerlast-rechner.de" className="text-indigo-400 hover:text-indigo-300">info@steuerlast-rechner.de</a>
                        </p>
                    </section>

                    <section id="haftung">
                        <h2 className="text-xl font-semibold text-white mb-4">Haftung für Inhalte</h2>
                        <p className="mb-4">
                            Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
                        </p>
                        <p>
                            Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">Haftung für Links</h2>
                        <p>
                            Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-white mb-4">Urheberrecht</h2>
                        <p>
                            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet.
                        </p>
                    </section>

                    <section className="pt-6 border-t border-slate-800">
                        <p className="text-sm text-slate-500">
                            Quelle: Erstellt mit dem Impressum-Generator von e-recht24.de
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );

    return (
        <CalculatorLayout
            sidebar={sidebar}
            results={results}
        />
    );
}
