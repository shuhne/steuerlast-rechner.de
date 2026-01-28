'use client';

import React, { useState, useMemo } from 'react';
import { CalculatorLayout } from './CalculatorLayout';
import { Search, ChevronRight, HelpCircle } from 'lucide-react';
import { StructuredData } from './StructuredData';

interface FAQItem {
    question: string;
    answer: string;
    category: 'general' | 'social' | 'tax' | 'future';
}

const FAQ_ITEMS: FAQItem[] = [
    {
        question: "Was ändert sich 2026 bei den Sozialabgaben?",
        answer: "Für 2026 werden steigende Beiträge in der gesetzlichen Krankenversicherung (Zusatzbeitrag) und der Pflegeversicherung erwartet. Experten gehen von einem Anstieg der Beitragsbemessungsgrenzen sowie leichten Erhöhungen beim Zusatzbeitrag aus, um die steigenden Kosten im Gesundheitssystem zu decken.",
        category: 'social'
    },
    {
        question: "Wie genau ist die Zukunftsprognose?",
        answer: "Die Prognosen basieren auf demografischen Entwicklungen (Verrentung der Babyboomer) und offiziellen Schätzungen führender Wirtschaftsinstitute. Da gesetzliche Änderungen nicht exakt vorhersehbar sind, bieten wir verschiedene Szenarien (Optimistisch, Realistisch, Pessimistisch) an, um eine Bandbreite möglicher Entwicklungen aufzuzeigen.",
        category: 'future'
    },
    {
        question: "Werden meine Daten gespeichert?",
        answer: "Nein. Alle Berechnungen finden ausschließlich lokal in deinem Browser statt. Es werden keine Eingaben an unsere Server gesendet oder gespeichert. Datenschutz hat bei uns höchste Priorität.",
        category: 'general'
    },
    {
        question: "Was bedeutet das 'Pessimistische Szenario 2036'?",
        answer: "Dieses Szenario zeigt, wie sich deine Abgaben entwickeln könnten, wenn keine grundlegenden Reformen stattfinden und die Kosten für Rente und Pflege durch die alternde Gesellschaft stark ansteigen. Es nimmt an, dass Beitragssätze deutlich erhöht werden müssen, um das System zu finanzieren.",
        category: 'future'
    },
    {
        question: "Lohnt sich ein Wechsel der Steuerklasse?",
        answer: "Ein Wechsel der Steuerklasse (z.B. von 4/4 auf 3/5) kann das monatliche Netto kurzfristig erhöhen, ändert aber nichts an der jährlichen Gesamtsteuerlast. Eine Nachzahlung am Jahresende ist bei Kombination 3/5 daher oft möglich. Seit 2026 wird zudem das Faktorverfahren als faire Alternative stärker gefördert.",
        category: 'tax'
    },
    {
        question: "Wie wirken sich Kinderfreibeträge aus?",
        answer: "Kinderfreibeträge mindern das zu versteuernde Einkommen, wirken sich aber meist erst bei der Einkommensteuererklärung aus (Günstigerprüfung zwischen Kindergeld und Freibetrag). Beim Solidaritätszuschlag und der Kirchensteuer werden sie jedoch bereits monatlich berücksichtigt.",
        category: 'tax'
    },
    {
        question: "Was sind Werbungskosten und die Pauschale?",
        answer: "Werbungskosten sind Ausgaben, die dem Erwerb, der Sicherung und der Erhaltung der Einnahmen dienen. Jeder Arbeitnehmer erhält automatisch eine Werbungskostenpauschale (Arbeitnehmer-Pauschbetrag, aktuell 1.230 €). Liegen deine tatsächlichen Kosten höher (z.B. Fahrtwege, Arbeitsmittel), kannst du diese in der Steuererklärung absetzen.",
        category: 'tax'
    },
    {
        question: "Kann ich das Home Office absetzen?",
        answer: "Ja, mit der Home-Office-Pauschale kannst du pro Tag im Home Office einen festen Betrag (aktuell 6 €/Tag, max. 1.260 €/Jahr) als Werbungskosten geltend machen. Dies gilt auch, wenn kein separates Arbeitszimmer vorhanden ist.",
        category: 'tax'
    },
    {
        question: "Was ist der Grenzsteuersatz?",
        answer: "Der Grenzsteuersatz gibt an, mit welchem Prozentsatz jeder ZUSÄTZLICH verdiente Euro versteuert wird. Er ist in Deutschland progressiv und steigt mit dem Einkommen an (bis zum Spitzensteuersatz von 42% bzw. 45%). Er ist nicht zu verwechseln mit dem Durchschnittssteuersatz, der meist viel niedriger liegt.",
        category: 'general'
    }
];

export function FAQClient() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<string | null>(null);

    const filteredItems = useMemo(() => {
        return FAQ_ITEMS.filter(item => {
            const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.answer.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = activeFilter ? item.category === activeFilter : true;
            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, activeFilter]);

    const sidebar = (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl shadow-slate-950/50 h-full flex flex-col gap-6">
            <div>
                <div className="flex items-center gap-2 text-indigo-400 mb-4">
                    <Search className="w-5 h-5" />
                    <h2 className="text-lg font-semibold text-white">Suche</h2>
                </div>
                <div className="relative group">
                    <input
                        type="text"
                        placeholder="Frage suchen..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 text-white pl-4 pr-10 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                </div>
            </div>

            <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Kategorien</h3>
                <nav className="space-y-1">
                    <button
                        onClick={() => setActiveFilter(null)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex justify-between items-center ${!activeFilter ? 'bg-indigo-500/10 text-indigo-300' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                    >
                        Alle Fragen
                        {!activeFilter && <ChevronRight className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={() => setActiveFilter('tax')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex justify-between items-center ${activeFilter === 'tax' ? 'bg-indigo-500/10 text-indigo-300' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                    >
                        Steuern & Abgaben
                        {activeFilter === 'tax' && <ChevronRight className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={() => setActiveFilter('social')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex justify-between items-center ${activeFilter === 'social' ? 'bg-indigo-500/10 text-indigo-300' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                    >
                        Sozialversicherung
                        {activeFilter === 'social' && <ChevronRight className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={() => setActiveFilter('future')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex justify-between items-center ${activeFilter === 'future' ? 'bg-indigo-500/10 text-indigo-300' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                    >
                        Zukunftsprognose
                        {activeFilter === 'future' && <ChevronRight className="w-4 h-4" />}
                    </button>
                </nav>
            </div>
        </div>
    );

    const results = (
        <div className="space-y-6">
            <StructuredData />
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8 shadow-xl min-h-[500px]">
                <div className="flex justify-between items-end mb-8 border-b border-slate-800 pb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Häufig gestellte Fragen</h1>
                        <p className="text-slate-400">Antworten zu Steuerklassen, Sozialabgaben und unserer Berechnungsmethodik.</p>
                    </div>
                    <div className="hidden sm:block">
                        <HelpCircle className="w-12 h-12 text-slate-800" />
                    </div>
                </div>

                <div className="space-y-6">
                    {filteredItems.length > 0 ? (
                        filteredItems.map((item, index) => (
                            <div key={index} className="group border-b border-slate-800 pb-6 last:border-0 last:pb-0">
                                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-indigo-300 transition-colors flex items-start gap-3">
                                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                                    {item.question}
                                </h3>
                                <p className="text-slate-400 leading-relaxed pl-4.5">{item.answer}</p>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 text-slate-500">
                            <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p>Keine Ergebnisse für "{searchQuery}" gefunden.</p>
                            <button onClick={() => { setSearchQuery(''); setActiveFilter(null) }} className="text-indigo-400 hover:text-indigo-300 mt-2 text-sm font-bold">Suche zurücksetzen</button>
                        </div>
                    )}
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
