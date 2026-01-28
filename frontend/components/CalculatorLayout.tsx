"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, Lock, Check, Github } from 'lucide-react';

interface CalculatorLayoutProps {
    sidebar: React.ReactNode;
    results: React.ReactNode;
}

export function CalculatorLayout({ sidebar, results }: CalculatorLayoutProps) {
    const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
    const privacyButtonRef = useRef<HTMLButtonElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    const handleFooterPrivacyClick = () => {
        // 1. Scroll to Top / Button
        if (privacyButtonRef.current) {
            privacyButtonRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // 2. Open Overlay
            setIsPrivacyOpen(true);
        }
    };

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                overlayRef.current &&
                !overlayRef.current.contains(event.target as Node) &&
                privacyButtonRef.current &&
                !privacyButtonRef.current.contains(event.target as Node)
            ) {
                setIsPrivacyOpen(false);
            }
        };

        // Only add listener if open
        if (isPrivacyOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isPrivacyOpen]);


    return (
        <div className="min-h-screen w-full bg-slate-950 p-3 sm:p-4 md:p-6 lg:p-8 font-sans selection:bg-indigo-500/30">
            <div className="mx-auto max-w-7xl">
                <header className="mb-8 sm:mb-12 flex flex-col md:flex-row md:items-start justify-between gap-4 sm:gap-6">
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                            <a href="/" className="hover:text-emerald-400 transition-colors">steuerlast-rechner.de</a>
                        </h1>
                        <p className="text-slate-400 text-base sm:text-lg mt-2 sm:mt-3 max-w-3xl leading-relaxed">
                            Dein Gehalt im Detail: Berechne dein Netto 2026, prüfe Auswirkungen von Stundenreduzierungen oder simuliere steigende Sozialabgaben.
                        </p>
                    </div>

                    {/* Privacy Button & Overlay */}
                    <div className="relative shrink-0 mx-auto md:mx-0">
                        <button
                            ref={privacyButtonRef}
                            onClick={() => setIsPrivacyOpen(!isPrivacyOpen)}
                            className="peer flex items-center gap-2 text-slate-400 hover:text-white transition-colors bg-slate-900/50 hover:bg-slate-800 px-4 py-2 rounded-full border border-slate-700/50 text-sm font-medium backdrop-blur-sm"
                        >
                            <ShieldCheck className="w-4 h-4" />
                            Datenschutz
                        </button>

                        {/* Hover Overlay - Controlled by State OR Peer Hover */}
                        <div
                            ref={overlayRef}
                            className={`absolute right-1/2 translate-x-1/2 md:translate-x-0 md:transform-none md:right-0 top-full mt-2 w-[calc(100vw-2rem)] max-w-[320px] sm:w-[320px] md:w-[350px] p-4 sm:p-6 bg-slate-900/95 border border-slate-700 rounded-xl shadow-2xl transition-all duration-200 z-50 backdrop-blur-md 
                            ${isPrivacyOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-2 peer-hover:opacity-100 peer-hover:visible peer-hover:translate-y-0 pointer-events-none peer-hover:pointer-events-auto'}`}
                        >
                            <h3 className="text-white font-bold mb-4 flex items-center gap-2 border-b border-slate-800 pb-3">
                                <Lock className="w-4 h-4 text-emerald-400" />
                                Deine Daten sind sicher
                            </h3>
                            <ul className="space-y-3 text-sm text-slate-300">
                                <li className="flex gap-2 items-start"><Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> Keine Analytics & Tracker</li>
                                <li className="flex gap-2 items-start"><Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> Keine Cookies</li>
                                <li className="flex gap-2 items-start"><Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> Lokale In-Browser-Verarbeitung</li>
                                <li className="flex gap-2 items-start"><Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> Keine Speicherung von Eingabedaten</li>
                            </ul>

                            <div className="mt-5 pt-4 border-t border-slate-800 text-xs text-slate-500 flex justify-between items-center">
                                <span>Privatsphäre by Design.</span>
                                <button className="flex items-center gap-1 hover:text-white transition-colors cursor-default">
                                    <Github className="w-3 h-3" />
                                    Open Source
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex flex-col lg:grid lg:grid-cols-[400px_1fr] gap-4 sm:gap-6 lg:gap-8 lg:items-start">
                    {/* Input Panel (Sidebar) */}
                    <aside className="w-full shrink-0">
                        {sidebar}
                    </aside>

                    {/* Result Dashboard */}
                    <main className="w-full min-w-0">
                        {results}
                    </main>
                </div>
            </div>
            {/* Footer */}
            <footer className="mx-auto max-w-7xl mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-500 text-sm">
                <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                    <span>&copy; 2026 steuerlast-rechner.de</span>
                    <nav className="flex gap-6">
                        <a href="/impressum" className="hover:text-slate-300 transition-colors">Impressum</a>
                        <a href="/faq" className="hover:text-slate-300 transition-colors">FAQ</a>
                        <button onClick={handleFooterPrivacyClick} className="hover:text-slate-300 transition-colors">Datenschutz</button>
                    </nav>
                </div>

                <a
                    href="https://github.com/shuhne/steuerlast-rechner.de"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-white px-3 py-1.5 rounded-full transition-all group"
                >
                    <Github className="w-4 h-4" />
                    <span className="font-medium">GitHub</span>
                    <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-bold px-1.5 py-0.5 rounded ml-1 group-hover:bg-indigo-500/20">OPEN SOURCE</span>
                </a>
            </footer>
        </div>
    );
}
