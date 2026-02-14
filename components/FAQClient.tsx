'use client';

import React, { useState, useMemo } from 'react';
import { CalculatorLayout } from './CalculatorLayout';
import { Search, ChevronRight, HelpCircle } from 'lucide-react';
import { StructuredData } from './StructuredData';

import { FAQ_ITEMS } from '../data/faq';

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
