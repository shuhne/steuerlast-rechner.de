'use client';

import React, { useState, useEffect } from 'react';
import { Euro, Calculator, MapPin, CheckCircle2, ChevronDown, ChevronUp, Settings2, AlertTriangle, Timer } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { TaxRequest, SimulationSettings } from '../types/api';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Helper: Parse "1.000,00" -> 1000.00
const parseGermanNumber = (str: string): number => {
    if (!str) return 0;
    const clean = str.replace(/\./g, '').replace(',', '.');
    return parseFloat(clean) || 0;
};

// Helper: Format 1000.00 -> "1.000,00"
const formatGermanNumber = (num: number): string => {
    return new Intl.NumberFormat('de-DE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(num);
};

// Helper: Format strict input while typing (avoids messing up cursor/decimals too much)
// We only format the integer part with dots, leave decimal part alone for typing
const formatLiveInput = (val: string): string => {
    // Remove non-numeric/comma chars
    let clean = val.replace(/[^0-9,]/g, '');

    // Split integer and decimal
    const parts = clean.split(',');

    // Format integer part with dots
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    // Rejoin (limit to one comma)
    if (parts.length > 2) {
        return parts[0] + ',' + parts.slice(1).join('');
    } else if (parts.length === 2) {
        return parts[0] + ',' + parts[1];
    }
    return parts[0];
};

interface InputSectionProps {
    onCalculate: (data: TaxRequest | null) => void;
    isLoading: boolean;
}

const SCENARIOS = {
    'current': {
        label: 'Aktuell (2026)',
        desc: 'Geltendes Recht',
        details: [],
        values: { rv: 18.6, av: 2.6, kv_add: 2.9, pv: 3.6, tax: 1.0, soli: 1.0 }
    },
    'pessimist_2035': {
        label: 'Demografische Progression (2035)',
        desc: 'Status Quo bei rapider Alterung',
        details: [
            'Keine Anhebung des Renteneintrittsalters (Verbleib bei 67 Jahren).',
            'Konstante Netto-Zuwanderung (< 200k p.a.).',
            'Fixierung des Rentenniveaus bei 48% (Haltelinie).',
            'Signifikante Kostensteigerung im Gesundheitswesen durch Alterung.'
        ],
        values: { rv: 22.5, av: 3.0, kv_add: 7.0, pv: 7.0, tax: 1.1, soli: 1.1 }
    },
    'realist_2030': {
        label: 'Intergenerationale Kompromisse (2035)',
        desc: 'Moderate Anpassungen zur Stabilisierung',
        details: [
            'Dämpfung der Ausgaben durch moderate Leistungsanpassungen.',
            'Netto-Zuwanderung von ca. 300k qualifizierten Fachkräften p.a.',
            'Steuerliche Zuschüsse stabilisieren Rentenniveau teilweise.',
            'Begrenzte Anhebung der Beitragsbemessungsgrenzen.'
        ],
        values: { rv: 20.5, av: 2.8, kv_add: 4.5, pv: 5.0, tax: 1.05, soli: 1.0 }
    },
    'optimist_2030': {
        label: 'Systemische Diversifizierung (2035)',
        desc: 'Umfassende Strukturreformen',
        details: [
            'Dynamisierung des Renteneintrittsalters (Koppelung an Lebenserwartung).',
            'Erweiterung der Beitragszahlerbasis (Erwerbstätigenversicherung).',
            'Hohe qualifizierte Zuwanderung (> 400k p.a.).',
            'Effizienzgewinne im Gesundheitssektor durch Digitalisierung.'
        ],
        values: { rv: 19.5, av: 2.6, kv_add: 3.5, pv: 4.0, tax: 1.02, soli: 1.0 }
    },
};

export function InputSection({ onCalculate, isLoading }: InputSectionProps) {
    // Basic States
    // Initialize with formatted string
    const [grossSalary, setGrossSalary] = useState<string>('');
    const [period, setPeriod] = useState<'yearly' | 'monthly'>('yearly');
    const [taxClass, setTaxClass] = useState<string>('1');
    const [churchTax, setChurchTax] = useState<boolean>(false);
    const [state, setState] = useState<string>('be');

    // Future Mode States
    const [mode, setMode] = useState<'current' | 'future'>('current');
    const [selectedScenario, setSelectedScenario] = useState<string>('pessimist_2035');
    const [showCustomSettings, setShowCustomSettings] = useState(false);

    // Custom Simulation Values (Initialized with Current)
    const [simRv, setSimRv] = useState(18.6);
    const [simAv, setSimAv] = useState(2.6);
    const [simKvAdd, setSimKvAdd] = useState(2.9);
    const [simPv, setSimPv] = useState(3.6); // Total rate
    const [simTaxFactor, setSimTaxFactor] = useState(1.0);

    const handlePeriodChange = (newPeriod: 'yearly' | 'monthly') => {
        if (newPeriod === period) return;

        const currentVal = parseGermanNumber(grossSalary);
        let newVal = currentVal;

        if (period === 'yearly' && newPeriod === 'monthly') {
            newVal = currentVal / 12;
        } else if (period === 'monthly' && newPeriod === 'yearly') {
            newVal = currentVal * 12;
        }

        setGrossSalary(formatGermanNumber(newVal));
        setPeriod(newPeriod);
    };

    const performCalculation = (explicitSettings?: SimulationSettings | null) => {
        let finalGross = parseGermanNumber(grossSalary);

        if (period === 'monthly') {
            finalGross *= 12;
        }

        if (finalGross <= 0) {
            onCalculate(null);
            return;
        }

        // Use explicit settings if provided, otherwise derive from current state
        let settings = explicitSettings;

        if (settings === undefined) {
            if (mode === 'future' || showCustomSettings) {
                settings = {
                    rv_rate_total: simRv / 100,
                    av_rate_total: simAv / 100,
                    kv_rate_add: simKvAdd / 100,
                    pv_rate_total: simPv / 100,
                    income_tax_factor: simTaxFactor,
                    soli_factor: simTaxFactor
                };
            } else {
                settings = null;
            }
        }

        onCalculate({
            gross_income: finalGross,
            period: 'yearly',
            tax_class: parseInt(taxClass),
            church_tax: churchTax,
            state: state.toUpperCase(),
            simulation_settings: settings
        });
    };

    // Effect: Update sim values AND trigger calculation when scenario/mode changes
    useEffect(() => {
        let newSettings: SimulationSettings | null = null;

        if (mode === 'current') {
            const v = SCENARIOS['current'].values;
            setSimRv(v.rv); setSimAv(v.av); setSimKvAdd(v.kv_add); setSimPv(v.pv); setSimTaxFactor(v.tax);
            // In current mode, we usually don't send settings unless custom mode is active. 
            // But if switching TO current, we should force standard calculation (null settings).
            newSettings = null;
        } else {
            // Future mode - Load selected scenario
            // @ts-ignore
            const v = SCENARIOS[selectedScenario].values;
            if (v) {
                setSimRv(v.rv); setSimAv(v.av); setSimKvAdd(v.kv_add); setSimPv(v.pv); setSimTaxFactor(v.tax);

                newSettings = {
                    rv_rate_total: v.rv / 100,
                    av_rate_total: v.av / 100,
                    kv_rate_add: v.kv_add / 100,
                    pv_rate_total: v.pv / 100,
                    income_tax_factor: v.tax,
                    soli_factor: v.tax
                };
            }
        }

        // Trigger calculation with the NEW settings immediately
        // We pass the new settings explicitly to avoid waiting for state updates
        performCalculation(newSettings);

    }, [mode, selectedScenario]);

    const handleCalculate = () => {
        performCalculation();
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6 shadow-xl shadow-slate-950/50 space-y-5 sm:space-y-6">

            {/* Header & Mode Switch */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-indigo-400">
                    <Calculator className="w-5 h-5" />
                    <h2 className="text-lg font-semibold text-white">Eingabedaten</h2>
                </div>

                {/* Mode Switcher */}
                <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                    <button
                        onClick={() => setMode('current')}
                        className={cn(
                            "py-2.5 sm:py-2 px-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all",
                            mode === 'current' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20" : "text-slate-400 hover:text-white"
                        )}
                        aria-pressed={mode === 'current'}
                        aria-label="Modus: Aktuell (2026)"
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        Aktuell (2026)
                    </button>
                    <button
                        onClick={() => { setMode('future'); setShowCustomSettings(true); }}
                        className={cn(
                            "py-2.5 sm:py-2 px-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all",
                            mode === 'future' ? "bg-rose-600 text-white shadow-lg shadow-rose-900/20" : "text-slate-400 hover:text-white"
                        )}
                        aria-pressed={mode === 'future'}
                        aria-label="Modus: Zukunftsszenario"
                    >
                        <Timer className="w-4 h-4" />
                        Zukunftsszenario
                    </button>
                </div>
            </div>

            {/* Future Scenario Selector */}
            {mode === 'future' && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label htmlFor="scenario-select" className="text-sm font-medium text-slate-400 mb-2 block">Wähle ein Szenario</label>
                    <div className="relative">
                        <select
                            id="scenario-select"
                            value={selectedScenario}
                            onChange={(e) => setSelectedScenario(e.target.value)}
                            className="w-full bg-slate-950 border border-rose-500/50 text-white pl-4 pr-10 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 appearance-none cursor-pointer"
                        >
                            <option value="pessimist_2035">Demografische Progression (2035)</option>
                            <option value="realist_2030">Intergenerationale Kompromisse (2035)</option>
                            <option value="optimist_2030">Systemische Diversifizierung (2035)</option>
                            <option value="custom" disabled className="text-slate-500">Eigenes Szenario jederzeit im Expertenmodus unten</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                    {/* Dynamic Scenario Description */}
                    {selectedScenario !== 'custom' && (
                        <div className={cn(
                            "mt-3 border rounded-lg overflow-hidden transition-colors",
                            selectedScenario.includes('pessimist') ? "bg-rose-500/10 border-rose-500/20" :
                                selectedScenario.includes('realist') ? "bg-orange-500/10 border-orange-500/20" :
                                    "bg-emerald-500/10 border-emerald-500/20"
                        )}>
                            <div className="p-3 flex gap-3 text-sm">
                                <AlertTriangle className={cn("w-5 h-5 shrink-0 mt-0.5",
                                    selectedScenario.includes('pessimist') ? "text-rose-500" :
                                        selectedScenario.includes('realist') ? "text-orange-500" : "text-emerald-500"
                                )} />
                                <div className="space-y-1 w-full">
                                    {/* @ts-ignore */}
                                    <p className={cn("font-medium", selectedScenario.includes('pessimist') ? "text-rose-200" : selectedScenario.includes('realist') ? "text-orange-200" : "text-emerald-200")}>
                                        {/* @ts-ignore */}
                                        {SCENARIOS[selectedScenario]?.desc}
                                    </p>

                                    <details className="group">
                                        <summary className="cursor-pointer text-xs opacity-70 hover:opacity-100 flex items-center gap-1 select-none transition-opacity list-none mt-1">
                                            <span className='border-b border-dashed border-current'>Details zu den Annahmen</span>
                                            <ChevronDown className="w-3 h-3 group-open:rotate-180 transition-transform" />
                                        </summary>
                                        <ul className="mt-2 text-xs space-y-1.5 pl-4 list-disc marker:text-current/50 opacity-90 pb-1">
                                            {/* @ts-ignore */}
                                            {SCENARIOS[selectedScenario]?.details?.map((detail, idx) => (
                                                <li key={idx} className={cn(selectedScenario.includes('pessimist') ? "text-rose-100" : selectedScenario.includes('realist') ? "text-orange-100" : "text-emerald-100")}>
                                                    {detail}
                                                </li>
                                            ))}
                                        </ul>
                                    </details>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Main Inputs (Standard) */}
            <div className="space-y-6">
                {/* Gehalt Eingabe mit Toggle */}
                <div className="space-y-2">
                    <label htmlFor="gross-salary" className="text-sm font-medium text-slate-400 flex items-center justify-between">
                        Gehalt
                    </label>
                    <div className="relative group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                            <Euro className="w-5 h-5" />
                        </div>
                        <input
                            id="gross-salary"
                            type="text"
                            value={grossSalary}
                            onChange={(e) => setGrossSalary(formatLiveInput(e.target.value))}
                            onBlur={() => {
                                // optional: format strictly on blur
                                const val = parseGermanNumber(grossSalary);
                                setGrossSalary(formatGermanNumber(val));
                            }}
                            className="w-full bg-slate-950 border border-slate-800 text-white pl-10 pr-24 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono text-lg"
                            placeholder="50.000,00"
                        />
                        {/* Vertical Toggle Switch */}
                        <div className="absolute right-1 top-1 bottom-1 w-20 flex flex-col gap-0.5 bg-slate-900 rounded p-0.5 border border-slate-800">
                            <button
                                onClick={() => handlePeriodChange('yearly')}
                                className={cn(
                                    "flex-1 text-[10px] uppercase font-bold rounded flex items-center justify-center transition-colors",
                                    period === 'yearly' ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-slate-300"
                                )}
                            >
                                Jährlich
                            </button>
                            <button
                                onClick={() => handlePeriodChange('monthly')}
                                className={cn(
                                    "flex-1 text-[10px] uppercase font-bold rounded flex items-center justify-center transition-colors",
                                    period === 'monthly' ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-slate-300"
                                )}
                            >
                                Monatlich
                            </button>
                        </div>
                    </div>
                </div>

                {/* Steuerklasse Select */}
                <div className="space-y-2" role="group" aria-label="Steuerklasse wählen">
                    <label className="text-sm font-medium text-slate-400">Steuerklasse</label>
                    <div className="grid grid-cols-3 gap-1 sm:grid-cols-6">
                        {[1, 2, 3, 4, 5, 6].map((cls) => (
                            <button
                                key={cls}
                                onClick={() => setTaxClass(cls.toString())}
                                className={cn(
                                    "py-2 rounded-md border text-xs font-bold transition-all",
                                    taxClass === cls.toString()
                                        ? "bg-indigo-600 border-indigo-500 text-white"
                                        : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900"
                                )}
                                aria-label={`Steuerklasse ${cls}`}
                                aria-pressed={taxClass === cls.toString()}
                            >
                                {cls}
                            </button>
                        ))}
                    </div>
                </div>

                {/* State & Church Tax */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label htmlFor="state-select" className="text-sm font-medium text-slate-400">Bundesland</label>
                        <div className="relative">
                            <select
                                id="state-select"
                                value={state}
                                onChange={(e) => setState(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 text-white pl-3 pr-8 py-2.5 rounded-lg text-sm appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            >
                                <option value="bw">BW</option><option value="by">BY</option><option value="be">BE</option>
                                <option value="bb">BB</option><option value="hb">HB</option><option value="hh">HH</option>
                                <option value="he">HE</option><option value="mv">MV</option><option value="ni">NI</option>
                                <option value="nw">NW</option><option value="rp">RP</option><option value="sl">SL</option>
                                <option value="sn">SN</option><option value="st">ST</option><option value="sh">SH</option>
                                <option value="th">TH</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 pointer-events-none" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400 block mb-1">Kirchensteuer</label>
                        <button
                            onClick={() => setChurchTax(!churchTax)}
                            className={cn(
                                "w-full py-2.5 px-3 rounded-lg border text-sm font-medium transition-all flex items-center justify-center gap-2",
                                churchTax ? "bg-indigo-900/30 border-indigo-500 text-indigo-300" : "bg-slate-950 border-slate-800 text-slate-400"
                            )}
                        >
                            {churchTax ? "Ja" : "Nein"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Collapsible Simulation / Expert Settings */}
            <div className="border border-slate-800 rounded-xl overflow-hidden">
                <button
                    onClick={() => setShowCustomSettings(!showCustomSettings)}
                    className="w-full flex items-center justify-between p-4 bg-slate-950 hover:bg-slate-900 transition-colors"
                >
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                        <Settings2 className="w-4 h-4 text-indigo-400" />
                        Expertenmodus
                    </div>
                    {showCustomSettings ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                </button>

                {showCustomSettings && (
                    <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-4 animate-in slide-in-from-top-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs text-slate-400">Rentenvers. (%)</label>
                                <input type="number" value={simRv} onChange={e => setSimRv(parseFloat(e.target.value))} className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-sm text-white focus:border-indigo-500 focus:outline-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-slate-400">Krankenvers. Zusatz (%)</label>
                                <input type="number" value={simKvAdd} onChange={e => setSimKvAdd(parseFloat(e.target.value))} className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-sm text-white focus:border-indigo-500 focus:outline-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-slate-400">Pflegevers. Gesamt (%)</label>
                                <input type="number" value={simPv} onChange={e => setSimPv(parseFloat(e.target.value))} className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-sm text-white focus:border-indigo-500 focus:outline-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-slate-400">Arbeitslosenvers. (%)</label>
                                <input type="number" value={simAv} onChange={e => setSimAv(parseFloat(e.target.value))} className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-sm text-white focus:border-indigo-500 focus:outline-none" />
                            </div>
                        </div>

                        <div className="space-y-1 pt-2 border-t border-slate-800">
                            <label className="text-xs text-slate-400 block mb-2">Steuererhöhung (Faktor)</label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="range"
                                    min="0.8" max="2.0" step="0.1"
                                    value={simTaxFactor}
                                    onChange={e => setSimTaxFactor(parseFloat(e.target.value))}
                                    className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                />
                                <span className="text-sm font-mono text-white w-12 text-right">x{simTaxFactor.toFixed(1)}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <button
                onClick={handleCalculate}
                disabled={isLoading}
                className={cn(
                    "w-full mt-4 text-white font-bold py-4 sm:py-3.5 px-4 rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 group",
                    mode === 'future'
                        ? "bg-rose-600 hover:bg-rose-500 shadow-rose-900/20"
                        : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/20"
                )}
            >
                {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <>
                        <span>{mode === 'future' ? 'Szenario simulieren' : 'Jetzt berechnen'}</span>
                        <CheckCircle2 className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                    </>
                )}
            </button>
        </div>
    );
}
