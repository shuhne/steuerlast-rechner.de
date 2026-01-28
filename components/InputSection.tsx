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
    hasResult?: boolean;
}

const SCENARIOS = {
    'current': {
        label: 'Aktuell (2026)',
        desc: 'Geltendes Recht',
        details: [],
        values: { rv: 18.6, av: 2.6, kv_add: 2.9, pv: 3.6, tax: 1.0, soli: 1.0 }
    },
    'pessimist_2035': {
        label: 'Pessimistisches Szenario (2035)',
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
        label: 'Realistisches Szenario (2035)',
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
        label: 'Optimistisches Szenario (2035)',
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

export function InputSection({ onCalculate, isLoading, hasResult }: InputSectionProps) {
    // Basic States
    // Initialize with formatted string
    const [grossSalary, setGrossSalary] = useState<string>('');
    const [period, setPeriod] = useState<'yearly' | 'monthly'>('yearly');
    const [taxClass, setTaxClass] = useState<string>('1');
    const [churchTax, setChurchTax] = useState<boolean>(false);
    const [state, setState] = useState<string>('be');

    // Logic for Sliders (Base Salary tracking)
    // We store the "Base" salary (100% value) separately to calculate sliders correctly
    const [baseSalary, setBaseSalary] = useState<number>(0);
    const [wageRaise, setWageRaise] = useState<number>(0); // 0-100%
    const [workLoad, setWorkLoad] = useState<number>(100); // 5-100%

    // Age and Children
    const [age, setAge] = useState<number>(30);
    const [hasChildren, setHasChildren] = useState<boolean>(false);
    const [childCount, setChildCount] = useState<number>(0);

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

    // Update Salary when logic inputs change
    // This effect runs when wageRaise or workLoad changes to update the DISPLAYED grossSalary
    useEffect(() => {
        if (baseSalary === 0) return;

        // Formula: New Gross = Base * (1 + Raise%) * (WorkLoad%)
        const raised = baseSalary * (1 + wageRaise / 100);
        const final = raised * (workLoad / 100);

        setGrossSalary(formatGermanNumber(final));

        // Auto-Calculate if we already have results
        if (hasResult) {
            // Debounce slightly in strict mode or just call it directly?
            // We use a small timeout to avoid stutter only if really needed, but direct call is usually fine for these calculations.
            // We need to call performCalculation with the NEW value, but performCalculation reads from state 'grossSalary'.
            // Because setGrossSalary is async, we pass the value explicitly or wait.
            // To be safe, we'll wait for the effect of grossSalary change? No, that would trigger on manual typing too.
            // BETTER: pass explicit gross to performCalculation
            const settings = getSimulationSettings();
            onCalculate({
                gross_income: period === 'monthly' ? final * 12 : final,
                period: 'yearly',
                tax_class: parseInt(taxClass),
                church_tax: churchTax,
                state: state.toUpperCase(),
                simulation_settings: settings
            });
        }

    }, [wageRaise, workLoad]);
    // Note: We DO NOT put baseSalary in deps to avoid loops, and we handle manual input separately.

    // Auto-Calculate Effect for ALL inputs if hasResult is true
    useEffect(() => {
        if (hasResult) {
            // We use a debounce or simple check.
            const timer = setTimeout(() => {
                performCalculation();
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [age, hasChildren, childCount, wageRaise, workLoad, taxClass, churchTax, state, mode, selectedScenario]);

    // Handle Manual Input
    const handleManualInput = (val: string) => {
        setGrossSalary(formatLiveInput(val));

        // When user types manually, we assume this is the NEW 100% Base, and reset sliders
        const num = parseGermanNumber(val);
        if (num > 0) {
            setBaseSalary(num);
            setWageRaise(0);
            setWorkLoad(100);
        }
    };

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

        // Update Base for logic consistency
        setBaseSalary(newVal);
    };

    const getSimulationSettings = (): SimulationSettings | null => {
        if (mode === 'future' || showCustomSettings) {
            return {
                rv_rate_total: simRv / 100,
                av_rate_total: simAv / 100,
                kv_rate_add: simKvAdd / 100,
                pv_rate_total: simPv / 100,
                income_tax_factor: simTaxFactor,
                soli_factor: simTaxFactor
            };
        }
        return null;
    };

    const performCalculation = (explicitSettings?: SimulationSettings | null) => {
        let finalGross = parseGermanNumber(grossSalary);

        if (finalGross <= 0) {
            onCalculate(null);
            return;
        }

        // Use explicit settings if provided, otherwise derive from current state
        let settings = explicitSettings ?? getSimulationSettings();

        onCalculate({
            gross_income: period === 'monthly' ? finalGross * 12 : finalGross,
            period: 'yearly',
            tax_class: parseInt(taxClass),
            church_tax: churchTax,
            state: state.toUpperCase(),
            has_children: hasChildren,
            child_count: hasChildren ? childCount : 0,
            age: age,
            simulation_settings: settings
        });

        // Update Base Salary on explicit calculation if sliders are at default
        if (wageRaise === 0 && workLoad === 100) {
            setBaseSalary(parseGermanNumber(grossSalary));
        }
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
                            <option value="pessimist_2035">Pessimistisches Szenario (2035)</option>
                            <option value="realist_2030">Realistisches Szenario (2035)</option>
                            <option value="optimist_2030">Optimistisches Szenario (2035)</option>
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
                            onChange={(e) => handleManualInput(e.target.value)}
                            onBlur={() => {
                                // optional: format strictly on blur
                                const val = parseGermanNumber(grossSalary);
                                setGrossSalary(formatGermanNumber(val));
                                if (wageRaise === 0 && workLoad === 100) setBaseSalary(val);
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

                {/* Age & Children Row */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <label htmlFor="age-input" className="text-sm font-medium text-slate-400 block mb-1">Alter</label>
                            {age > 64 && <span className="text-[10px] text-emerald-400 bg-emerald-900/20 px-1.5 py-0.5 rounded border border-emerald-500/20">Altersentlastung</span>}
                        </div>
                        <input
                            id="age-input"
                            type="number"
                            min="15" max="100"
                            value={age}
                            onChange={(e) => setAge(Math.min(100, Math.max(15, parseInt(e.target.value) || 0)))}
                            className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2.5 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400 block mb-1">Kinder</label>
                        {!hasChildren ? (
                            <button
                                onClick={() => setHasChildren(true)}
                                className="w-full py-2.5 px-3 rounded-lg border border-slate-800 text-slate-400 text-sm font-medium hover:bg-slate-900 transition-all bg-slate-950"
                            >
                                Keine
                            </button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setChildCount(Math.max(0, childCount - 1))}
                                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white"
                                >
                                    -
                                </button>
                                <div className="flex-1 text-center font-mono text-white text-lg font-medium">
                                    {childCount}
                                </div>
                                <button
                                    onClick={() => setChildCount(Math.min(10, childCount + 1))}
                                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white"
                                >
                                    +
                                </button>
                                <button
                                    onClick={() => { setHasChildren(false); setChildCount(0); }}
                                    className="w-8 h-10 flex items-center justify-center rounded-lg text-slate-600 hover:text-rose-500 ml-1"
                                    title="Keine Kinder"
                                >
                                    x
                                </button>
                            </div>
                        )}
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
                    <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-6 animate-in slide-in-from-top-2">

                        {/* 1. Global Expert Settings (Always Visible) */}
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <div className="flex justify-between">
                                    <label className="text-xs text-slate-400">Lohnerhöhung (+{wageRaise}%)</label>
                                    <span className="text-xs font-mono text-emerald-400">{wageRaise}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0" max="100" step="1"
                                    value={wageRaise}
                                    onChange={e => setWageRaise(parseInt(e.target.value))}
                                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                />
                            </div>

                            <div className="space-y-1">
                                <div className="flex justify-between">
                                    <label className="text-xs text-slate-400">Arbeitszeit ({workLoad}%)</label>
                                    <span className="text-xs font-mono text-indigo-400">{workLoad}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="5" max="100" step="5"
                                    value={workLoad}
                                    onChange={e => setWorkLoad(parseInt(e.target.value))}
                                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                />
                            </div>
                        </div>

                        {/* 2. Simulation Settings (Only in Future Mode or if explicitly needed)
                             Currently we show them always in expert mode, but user asked to remove Tax Slider unless in Future Mode.
                             We can keep the social security inputs visible or hide them too?
                             The request said "Restrict Tax Slider visibility to future mode".
                             Let's group the simulation specific ones.
                        */}

                        <div className="pt-4 border-t border-slate-800 space-y-4">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Sozialabgaben</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-400">Rentenvers. (%)</label>
                                    <input type="number" value={simRv} onChange={e => setSimRv(parseFloat(e.target.value))} className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-sm text-white focus:border-indigo-500 focus:outline-none" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-400">Krankenvers. Z. (%)</label>
                                    <input type="number" value={simKvAdd} onChange={e => setSimKvAdd(parseFloat(e.target.value))} className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-sm text-white focus:border-indigo-500 focus:outline-none" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-400">Pflegevers. (%)</label>
                                    <input type="number" value={simPv} onChange={e => setSimPv(parseFloat(e.target.value))} className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-sm text-white focus:border-indigo-500 focus:outline-none" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-400">Arbeitslosenv. (%)</label>
                                    <input type="number" value={simAv} onChange={e => setSimAv(parseFloat(e.target.value))} className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-sm text-white focus:border-indigo-500 focus:outline-none" />
                                </div>
                            </div>
                        </div>

                        {/* Tax Factor - ONLY in Future Mode */}
                        {mode === 'future' && (
                            <div className="space-y-1 pt-2 border-t border-slate-800 animate-in fade-in">
                                <label className="text-xs text-slate-400 block mb-2">Simulierte Steuererhöhung (Faktor)</label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="range"
                                        min="0.8" max="2.0" step="0.1"
                                        value={simTaxFactor}
                                        onChange={e => setSimTaxFactor(parseFloat(e.target.value))}
                                        className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                                    />
                                    <span className="text-sm font-mono text-white w-12 text-right">x{simTaxFactor.toFixed(1)}</span>
                                </div>
                            </div>
                        )}
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
