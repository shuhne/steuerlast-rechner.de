'use client';

import React, { useState, useEffect } from 'react';
import { Euro, Calculator, MapPin, CheckCircle2, ChevronDown, ChevronUp, Settings2, AlertTriangle, Timer, Trash2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { TaxRequest, SimulationSettings, DisplayPeriod } from '../types/api';

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
    onCalculate: (data: TaxRequest | null, isBaseCalculation?: boolean) => void;
    isLoading: boolean;
    hasResult?: boolean;
    displayPeriod: DisplayPeriod;
    onDisplayPeriodChange: (period: DisplayPeriod) => void;
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

export function InputSection({ onCalculate, isLoading, hasResult, displayPeriod, onDisplayPeriodChange }: InputSectionProps) {
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
    const [ageInput, setAgeInput] = useState<string>('30');
    const [hasChildren, setHasChildren] = useState<boolean>(false);
    const [childCount, setChildCount] = useState<number>(0);

    // Future Mode States
    const [mode, setMode] = useState<'current' | 'future'>('current');
    const [selectedScenario, setSelectedScenario] = useState<string>('pessimist_2035');
    const [showCustomSettings, setShowCustomSettings] = useState(false);

    // Validation message
    const [showSalaryHint, setShowSalaryHint] = useState(false);

    // Custom Simulation Values (Initialized with Current)
    const [simRv, setSimRv] = useState(18.6);
    const [simAv, setSimAv] = useState(2.6);
    const [simKvAdd, setSimKvAdd] = useState(2.9);
    const [simPv, setSimPv] = useState(3.6); // Total rate
    const [simTaxFactor, setSimTaxFactor] = useState(1.0);

    // PKV Logic 2026
    const JAEG_2026_EST = 77400; // Estimated 2026
    const [healthInsuranceType, setHealthInsuranceType] = useState<'statutory' | 'private'>('statutory');
    const [privateKvAmount, setPrivateKvAmount] = useState<number>(0);

    // Check availability of PKV based on gross salary
    const currentGrossVal = parseGermanNumber(grossSalary);
    // If monthly period selected, we project to year for JAEG check
    const projectedYearlyGross = period === 'monthly' ? currentGrossVal * 12 : currentGrossVal;
    const canHavePKV = projectedYearlyGross >= JAEG_2026_EST;

    // Reset PKV if falling below JAEG
    useEffect(() => {
        if (!canHavePKV && healthInsuranceType === 'private') {
            setHealthInsuranceType('statutory');
        }
    }, [canHavePKV, healthInsuranceType]);

    // Update displayed salary when slider inputs change (no auto-calc here, handled by debounced effect below)
    useEffect(() => {
        if (baseSalary === 0) return;
        const raised = baseSalary * (1 + wageRaise / 100);
        const final = raised * (workLoad / 100);
        setGrossSalary(formatGermanNumber(final));
    }, [wageRaise, workLoad]);

    // Auto-reset children to "Keine" when count reaches 0
    useEffect(() => {
        if (hasChildren && childCount === 0) {
            const timer = setTimeout(() => {
                setHasChildren(false);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [hasChildren, childCount]);

    // Auto-Calculate Effect for ALL inputs if hasResult is true
    // Use 1s debounce for slider/button inputs (wageRaise, workLoad, age) to prevent
    // auto-scroll on mobile while user is still adjusting values
    useEffect(() => {
        if (hasResult) {
            const timer = setTimeout(() => {
                performCalculation();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [age, hasChildren, childCount, wageRaise, workLoad, taxClass, churchTax, state, mode, selectedScenario, healthInsuranceType, privateKvAmount]);

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

        // Sync display period with global state
        onDisplayPeriodChange(newPeriod);
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

        // Determine if this is a base calculation (no slider adjustments, current mode)
        const isBaseCalculation = mode === 'current' && wageRaise === 0 && workLoad === 100;

        onCalculate({
            gross_income: period === 'monthly' ? finalGross * 12 : finalGross,
            period: 'yearly',
            tax_class: parseInt(taxClass),
            church_tax: churchTax,
            state: state.toUpperCase(),
            has_children: hasChildren,
            child_count: hasChildren ? childCount : 0,
            age: age,
            simulation_settings: settings,
            health_insurance_type: healthInsuranceType,
            private_kv_amount: healthInsuranceType === 'private' ? privateKvAmount : undefined
        }, isBaseCalculation);

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
        if (!grossSalary || parseGermanNumber(grossSalary) === 0) {
            setShowSalaryHint(true);
            setTimeout(() => setShowSalaryHint(false), 2000);
            return;
        }
        performCalculation();
    };

    const handleReset = () => {
        // Basic States
        setGrossSalary('');
        setPeriod('yearly');
        setTaxClass('1');
        setChurchTax(false);
        setState('be');

        // Slider logic
        setBaseSalary(0);
        setWageRaise(0);
        setWorkLoad(100);

        // Age and Children
        setAge(30);
        setAgeInput('30');
        setHasChildren(false);
        setChildCount(0);

        // Future Mode
        setMode('current');
        setSelectedScenario('pessimist_2035');
        setShowCustomSettings(false);

        // Custom Simulation Values
        setSimRv(18.6);
        setSimAv(2.6);
        setSimKvAdd(2.9);
        setSimPv(3.6);
        setSimTaxFactor(1.0);

        // PKV
        setHealthInsuranceType('statutory');
        setPrivateKvAmount(0);

        // Clear results and sync display period
        onCalculate(null);
        onDisplayPeriodChange('yearly');
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6 shadow-xl shadow-slate-950/50 space-y-6">

            {/* Header & Mode Switch */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-indigo-400">
                        <Calculator className="w-5 h-5" />
                        <h2 className="text-lg font-semibold text-white">Eingabedaten</h2>
                    </div>
                    {grossSalary && parseGermanNumber(grossSalary) > 0 && (
                        <button
                            onClick={handleReset}
                            className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded hover:bg-slate-800"
                            aria-label="Alle Eingaben zurücksetzen"
                            title="Zurücksetzen"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
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
                <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-2">
                    <label htmlFor="scenario-select" className="text-sm font-medium text-slate-400 block">Wähle ein Szenario</label>
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
                            "mt-4 border rounded-lg overflow-hidden transition-colors",
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
                        Gehalt (Brutto)
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
                    <label className="text-sm font-medium text-slate-400 block">Steuerklasse</label>
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

                {/* State, Church, Age, Children - unified grid for consistent spacing */}
                <div className="grid grid-cols-2 gap-4">
                    {/* State */}
                    <div className="space-y-1.5">
                        <label htmlFor="state-select" className="text-sm font-medium text-slate-400 block">Bundesland</label>
                        <div className="relative">
                            <select
                                id="state-select"
                                value={state}
                                onChange={(e) => setState(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 text-white pl-3 pr-8 py-2.5 rounded-lg text-base sm:text-sm appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            >
                                <option value="bw">Baden-Württemberg</option>
                                <option value="by">Bayern</option>
                                <option value="be">Berlin</option>
                                <option value="bb">Brandenburg</option>
                                <option value="hb">Bremen</option>
                                <option value="hh">Hamburg</option>
                                <option value="he">Hessen</option>
                                <option value="mv">Mecklenburg-Vorpommern</option>
                                <option value="ni">Niedersachsen</option>
                                <option value="nw">Nordrhein-Westfalen</option>
                                <option value="rp">Rheinland-Pfalz</option>
                                <option value="sl">Saarland</option>
                                <option value="sn">Sachsen</option>
                                <option value="st">Sachsen-Anhalt</option>
                                <option value="sh">Schleswig-Holstein</option>
                                <option value="th">Thüringen</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 pointer-events-none" />
                        </div>
                    </div>

                    {/* Church Tax */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-400 block">Kirchensteuer</label>
                        <button
                            onClick={() => setChurchTax(!churchTax)}
                            className={cn(
                                "w-full py-2.5 px-3 rounded-lg border text-base sm:text-sm font-medium transition-all flex items-center justify-center gap-2",
                                churchTax ? "bg-indigo-900/30 border-indigo-500 text-indigo-300" : "bg-slate-950 border-slate-800 text-slate-400"
                            )}
                        >
                            {churchTax ? "Ja" : "Nein"}
                        </button>
                    </div>

                    {/* Age */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                            <label htmlFor="age-input" className="text-sm font-medium text-slate-400">Alter</label>
                            {age > 64 && <span className="text-[10px] text-emerald-400 bg-emerald-900/20 px-1.5 py-0.5 rounded border border-emerald-500/20">Altersentlastung</span>}
                        </div>
                        <div className="relative group">
                            <input
                                id="age-input"
                                type="number"
                                min="15" max="100"
                                value={ageInput}
                                onChange={(e) => setAgeInput(e.target.value)}
                                onBlur={() => {
                                    const num = parseInt(ageInput) || 30;
                                    const clamped = Math.min(100, Math.max(15, num));
                                    setAgeInput(String(clamped));
                                    setAge(clamped);
                                }}
                                className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2.5 rounded-lg text-base sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <div className="absolute right-1 top-1 bottom-1 w-10 flex flex-col gap-0.5 bg-slate-900 rounded p-0.5 border border-slate-800">
                                <button
                                    onClick={() => { const v = Math.min(100, age + 1); setAge(v); setAgeInput(String(v)); }}
                                    className="flex-1 text-[10px] font-bold rounded flex items-center justify-center transition-colors text-slate-500 hover:text-slate-300 hover:bg-slate-800"
                                >
                                    +
                                </button>
                                <button
                                    onClick={() => { const v = Math.max(15, age - 1); setAge(v); setAgeInput(String(v)); }}
                                    className="flex-1 text-[10px] font-bold rounded flex items-center justify-center transition-colors text-slate-500 hover:text-slate-300 hover:bg-slate-800"
                                >
                                    −
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Children */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-400 block">Kinder</label>
                        {!hasChildren ? (
                            <button
                                onClick={() => { setHasChildren(true); setChildCount(1.0); }}
                                className="w-full py-2.5 px-3 rounded-lg border border-slate-800 text-slate-400 text-base sm:text-sm font-medium hover:bg-slate-900 transition-all bg-slate-950"
                            >
                                Keine
                            </button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setChildCount(Math.max(0, childCount - 0.5))}
                                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white"
                                >
                                    -
                                </button>
                                <div className="flex-1 text-center font-mono text-white text-lg font-medium">
                                    {childCount.toFixed(1)}
                                </div>
                                <button
                                    onClick={() => setChildCount(Math.min(10, childCount + 0.5))}
                                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white"
                                >
                                    +
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Private Health Insurance Option (Condition: Above JAEG) */}
                {canHavePKV && (
                    <div className="pt-2 pb-2 animate-in fade-in slide-in-from-top-1 border-t border-slate-800/50">
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-white block flex justify-between">
                                <span>Krankenversicherung</span>
                                <span className="text-[10px] bg-emerald-950 text-emerald-500 px-1.5 py-0.5 rounded border border-emerald-900/50">
                                    Freie Wahl
                                </span>
                            </label>

                            <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                                <button
                                    onClick={() => setHealthInsuranceType('statutory')}
                                    className={cn(
                                        "py-2 px-3 rounded-lg text-xs font-bold transition-all",
                                        healthInsuranceType === 'statutory'
                                            ? "bg-slate-800 text-white shadow"
                                            : "text-slate-400 hover:text-slate-300"
                                    )}
                                >
                                    Gesetzlich
                                </button>
                                <button
                                    onClick={() => setHealthInsuranceType('private')}
                                    className={cn(
                                        "py-2 px-3 rounded-lg text-xs font-bold transition-all",
                                        healthInsuranceType === 'private'
                                            ? "bg-white text-slate-950 shadow-lg shadow-slate-900/20"
                                            : "text-slate-400 hover:text-slate-300"
                                    )}
                                >
                                    Privat
                                </button>
                            </div>

                            {healthInsuranceType === 'private' && (
                                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1">
                                    <label htmlFor="pkv-amount" className="text-sm font-medium text-slate-400 block">
                                        Monatlicher Beitrag (PKV + PV)
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                                            <Euro className="w-4 h-4" />
                                        </div>
                                        <input
                                            id="pkv-amount"
                                            type="number"
                                            value={privateKvAmount || ''}
                                            onChange={(e) => setPrivateKvAmount(parseFloat(e.target.value))}
                                            placeholder="z.B. 500"
                                            className="w-full bg-slate-950 border border-slate-800 text-white pl-9 pr-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-500 leading-tight">
                                        Der Arbeitgeberzuschuss wird automatisch berücksichtigt (max. 50% vom GKV-Höchstsatz).
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
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
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sozialabgaben</h4>
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
                            <div className="space-y-1 pt-4 border-t border-slate-800 animate-in fade-in">
                                <label className="text-xs text-slate-400 block">Simulierte Steuererhöhung (Faktor)</label>
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

            <div className="relative">
                {showSalaryHint && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[11px] text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700/40 whitespace-nowrap animate-in fade-in duration-200">
                        Bitte zuerst ein Gehalt eingeben
                    </div>
                )}
                <button
                    onClick={handleCalculate}
                    disabled={isLoading}
                    className={cn(
                        "w-full text-white font-bold py-4 sm:py-3.5 px-4 rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 group",
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
        </div >
    );
}
