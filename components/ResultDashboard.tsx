'use client';

import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Wallet, Building2, HeartPulse, History, AlertTriangle, Info, Scale, ArrowRight, TrendingDown, ChevronDown, ChevronUp } from 'lucide-react';
import { TaxResult, ScenarioResult, CurvePoint, DisplayPeriod } from '../types/api';
import { convertToDisplayPeriod } from '../utils/periodConverter';
import { ScenarioChart } from './ScenarioChart';
import { OptimizationChart } from './OptimizationChart';
import { SalaryComparisonChart } from './SalaryComparisonChart';
import { InflationChart } from './InflationChart';
import { HourlyWageCard } from './HourlyWageCard';

interface ResultDashboardProps {
    result: TaxResult | null;
    currentResult?: TaxResult | null; // For historical mode comparison
    historicalMode?: 'wage' | 'price' | null; // For historical mode comparison
    scenarios?: ScenarioResult | null;
    curve?: CurvePoint[] | null;
    referenceNetIncome?: number | null; // Reference for future scenario comparison (2026 base)
    baseNetIncome?: number | null; // Base for slider comparison (0% raise, 100% workload)
    age?: number;
    displayPeriod: DisplayPeriod;
    onDisplayPeriodChange: (period: DisplayPeriod) => void;
    weeklyHours: number;
}

export function ResultDashboard({ 
    result, 
    currentResult, 
    historicalMode, 
    scenarios, 
    curve, 
    referenceNetIncome, 
    baseNetIncome, 
    age = 30, 
    displayPeriod, 
    onDisplayPeriodChange, 
    weeklyHours 
}: ResultDashboardProps) {

    const [showInfoDetails, setShowInfoDetails] = useState(false);

    if (!result) return null;

    const {
        net_income, net_income_monthly, total_tax, total_social_security,
        income_tax, church_tax, kv_employee, pv_employee, rv_employee, av_employee,
        gross_income
    } = result;

    // Historical mode explanation banner (shown above the standard layout)
    const historicalBanner = (historicalMode && currentResult) ? (() => {
        const isWage = historicalMode === 'wage';
        const factor = isWage ? (5330 / 51944) : (1 / 2.86);
        const gross_1958_DM = gross_income * factor;
        const formatDM = (val: number) =>
            new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'DEM' }).format(val).replace('DEM', 'DM');
        const formatEUR = (val: number) =>
            new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(val);

        return (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 text-sm text-slate-300">
                <div className="flex gap-3 items-start">
                    <History className="w-5 h-5 shrink-0 mt-0.5 text-indigo-400" />
                    <div className="flex-1">
                        <h4 className="font-bold text-white mb-1">
                            Historischer Vergleich (1958): {isWage ? 'Lohnbereinigt' : 'Preisbereinigt'}
                        </h4>
                        <p className="leading-relaxed text-slate-300">
                            {isWage ? (
                                `Dein Gehalt von ${formatEUR(gross_income)} entspricht lohnbereinigt ${formatDM(gross_1958_DM)} im Jahr 1958. Die Berechnung unten zeigt, was du mit dem 1958er Steuertarif netto erhalten hättest.`
                            ) : (
                                `Dein Gehalt von ${formatEUR(gross_income)} entspricht kaufkraftbereinigt ${formatDM(gross_1958_DM)} im Jahr 1958 (1 DM ≈ 2,86 € heute). Die Berechnung unten zeigt, was du mit dem 1958er Steuertarif netto erhalten hättest.`
                            )}
                        </p>
                        
                        <button 
                            onClick={() => setShowInfoDetails(!showInfoDetails)}
                            className="mt-3 flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                            {showInfoDetails ? 'Weniger anzeigen' : 'Mehr über die Unterschiede erfahren'}
                            {showInfoDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                    </div>
                </div>

                {showInfoDetails && (
                    <div className="mt-4 pt-4 border-t border-slate-800/80 text-xs text-slate-400 space-y-3 leading-relaxed animate-fadeIn">
                        <div>
                            <span className="font-semibold text-slate-200 block mb-1">1. Deutlich geringere Sozialabgaben damals</span>
                            Im Jahr 1958 lag die gesamte Belastung der Sozialabgaben für Arbeitnehmer bei nur ca. <strong className="text-emerald-400">10,75 %</strong> (Rentenversicherung: 7%, Arbeitslosenversicherung: 0,5%, Krankenversicherung: ca. 3,25% im Durchschnitt, Pflegeversicherung: 0%). Heute zahlen Arbeitnehmer über <strong className="text-rose-400">20 %</strong> an Sozialabgaben. Die Pflegeversicherung existierte damals noch gar nicht und wurde erst 1995 eingeführt.
                        </div>
                        <div>
                            <span className="font-semibold text-slate-200 block mb-1">2. Verschiebung der Steuerprogression (Kalte Progression & Mittelstandsbauch)</span>
                            Der Spitzensteuersatz von 53 % griff 1958 erst ab einem zu versteuernden Einkommen von 110.040 DM. Das entsprach dem <strong className="text-emerald-400">20-fachen Durchschnittslohn</strong> damals (heute lohnbereinigt über 1 Million €!). Heute greift der Spitzensteuersatz (42%) bereits ab ca. 66.000 € (nur dem 1,3-fachen Durchschnittsgehalt). Die Steuerkurve wurde im Laufe der Zeit extrem nach links verschoben, wodurch mittlere und kleinere Einkommen heute prozentual viel früher und stärker belastet werden.
                        </div>
                        <div>
                            <span className="font-semibold text-slate-200 block mb-1">Wann und wie wurde das System umgebaut?</span>
                            Das deutsche Steuersystem wurde in mehreren großen Reformen umstrukturiert, insbesondere mit der Einführung des linear-progressiven Tarifs **1990** und den darauffolgenden Reformen der **Schröder-Fischer-Regierung (2000–2005)**. Während der Spitzensteuersatz gesenkt wurde, wurden gleichzeitig die Progressionsstufen gestaucht. Durch die Demografie und den medizinischen Fortschritt stiegen die Sozialabgaben seit den 1970er Jahren kontinuierlich an, was den Netto-Lohnanteil für den Durchschnittsverdiener bis heute stetig reduziert hat.
                        </div>
                    </div>
                )}
            </div>
        );
    })() : null;

    // result has already been destructured at the top of the function

    // Calculate Comparison
    // Priority 1: Future scenario comparison (referenceNetIncome differs from current)
    // Priority 2: Slider comparison (baseNetIncome differs, but we're in current mode)
    let compElement = null;

    const hasFutureScenarioComparison = referenceNetIncome !== undefined && referenceNetIncome !== null && Math.abs(referenceNetIncome - net_income) > 0.1;
    const hasSliderComparison = baseNetIncome !== undefined && baseNetIncome !== null && Math.abs(baseNetIncome - net_income) > 0.1 && !hasFutureScenarioComparison;

    if (hasFutureScenarioComparison && referenceNetIncome) {
        // Future scenario mode - compare against 2026 reference
        const diff = net_income - referenceNetIncome;
        const displayDiff = convertToDisplayPeriod(diff, displayPeriod);
        const percent = (diff / referenceNetIncome) * 100;
        const isPositive = diff > 0;

        compElement = (
            <div className="text-left sm:text-right">
                <div className={`text-lg sm:text-xl font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isPositive ? '+' : ''} {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(displayDiff)}
                    <span className="text-xs text-slate-400 ml-1.5 font-normal block sm:inline sm:ml-2">gegenüber 2026</span>
                </div>
                <div className={`text-sm font-medium ${isPositive ? 'text-emerald-500/70' : 'text-rose-500/70'}`}>
                    {isPositive ? '+' : ''}{percent.toFixed(1).replace('.', ',')} %
                </div>
            </div>
        );
    } else if (hasSliderComparison && baseNetIncome) {
        // Slider adjustment mode - compare against base (0% raise, 100% workload)
        const diff = net_income - baseNetIncome;
        const displayDiff = convertToDisplayPeriod(diff, displayPeriod);
        const percent = (diff / baseNetIncome) * 100;
        const isPositive = diff > 0;

        compElement = (
            <div className="text-left sm:text-right">
                <div className={`text-lg sm:text-xl font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isPositive ? '+' : ''} {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(displayDiff)}
                    <span className="text-xs text-slate-400 ml-1.5 font-normal block sm:inline sm:ml-2">gegenüber Basis</span>
                </div>
                <div className={`text-sm font-medium ${isPositive ? 'text-emerald-500/70' : 'text-rose-500/70'}`}>
                    {isPositive ? '+' : ''}{percent.toFixed(1).replace('.', ',')} %
                </div>
            </div>
        );
    } else if (historicalMode && currentResult) {
        // Historical mode - compare 1958 net against 2026 current net
        const diff = net_income - currentResult.net_income;
        const displayDiff = convertToDisplayPeriod(diff, displayPeriod);
        const percent = (diff / currentResult.net_income) * 100;
        const isPositive = diff > 0;

        compElement = (
            <div className="text-left sm:text-right">
                <div className={`text-lg sm:text-xl font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isPositive ? '+' : ''} {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(displayDiff)}
                    <span className="text-xs text-slate-400 ml-1.5 font-normal block sm:inline sm:ml-2">gegenüber 2026</span>
                </div>
                <div className={`text-sm font-medium ${isPositive ? 'text-emerald-500/70' : 'text-rose-500/70'}`}>
                    {isPositive ? '+' : ''}{percent.toFixed(1).replace('.', ',')} %
                </div>
            </div>
        );
    }

    const data = [
        { name: 'Netto', value: convertToDisplayPeriod(net_income, displayPeriod), color: '#4f46e5' }, // Indigo-600
        { name: 'Steuern', value: convertToDisplayPeriod(total_tax, displayPeriod), color: '#94a3b8' }, // Slate-400
        { name: 'Sozialabgaben', value: convertToDisplayPeriod(total_social_security, displayPeriod), color: '#64748b' }, // Slate-500
    ];



    return (
        <div className="space-y-4">
            {/* Historical mode explanation banner */}
            {historicalBanner}
            {/* Top Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Main Result Card */}
                <div className="md:col-span-2 lg:col-span-2 bg-gradient-to-br from-indigo-900/50 to-slate-900 border border-indigo-500/30 rounded-xl p-4 sm:p-5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full filter blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/20 transition-all duration-700"></div>

                    <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start gap-4 w-full h-full">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <Wallet className="w-5 h-5 text-indigo-400" />
                                <h3 className="text-lg font-semibold text-white">Dein Nettogehalt{historicalMode ? ' (1958er Tarif)' : ''}</h3>
                            </div>
                            <div>
                                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-none mt-1">
                                    {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(displayPeriod === 'monthly' ? net_income_monthly : net_income)}
                                </div>
                                <div className="flex items-center gap-1 text-sm mt-3.5">
                                    <button
                                        onClick={() => onDisplayPeriodChange('monthly')}
                                        className={`px-2 py-0.5 rounded text-xs font-bold transition-colors ${displayPeriod === 'monthly'
                                            ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-400/50'
                                            : 'bg-slate-700/30 text-slate-400 hover:bg-slate-700/50 hover:text-slate-300'
                                            }`}
                                    >
                                        Monatlich
                                    </button>
                                    <button
                                        onClick={() => onDisplayPeriodChange('yearly')}
                                        className={`px-2 py-0.5 rounded text-xs font-bold transition-colors ${displayPeriod === 'yearly'
                                            ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-400/50'
                                            : 'bg-slate-700/30 text-slate-400 hover:bg-slate-700/50 hover:text-slate-300'
                                            }`}
                                    >
                                        Jährlich
                                    </button>
                                </div>
                            </div>
                        </div>

                        {compElement && (
                            <div className="shrink-0 mt-1 sm:mt-0">
                                {compElement}
                            </div>
                        )}
                    </div>
                </div>


                {/* Hourly Wage Card */}
                <HourlyWageCard
                    gross_income={gross_income}
                    net_income={net_income}
                    weeklyHours={weeklyHours}
                    displayPeriod={displayPeriod}
                />
            </div>

            {/* Detailed Breakdown Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Chart Section */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6">
                    <h3 className="text-lg font-semibold text-white mb-6">Zusammensetzung</h3>
                    <div className="h-[300px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                    label={({ percent }) => `${((percent || 0) * 100).toFixed(1)}%`}
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: number | undefined) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value || 0)}
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                                    itemStyle={{ color: '#f8fafc' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Label */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-slate-400 text-xs">Gesamt</span>
                            <span className="text-white font-bold text-lg">{new Intl.NumberFormat('de-DE', { maximumFractionDigits: 1 }).format(convertToDisplayPeriod(gross_income, displayPeriod) / 1000)}k</span>
                        </div>
                    </div>

                    {/* Custom Legend */}
                    <div className="flex justify-center gap-4 mt-2">
                        {data.map((item) => (
                            <div key={item.name} className="flex items-center gap-2 text-sm">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="text-slate-300">{item.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* List Breakdown */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6 space-y-4 sm:space-y-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Abzüge im Detail</h3>

                    <div className="space-y-4">
                        {/* Steuern */}
                        <div>
                            <div className="flex items-center gap-2 mb-3 text-slate-100 font-medium">
                                <Building2 className="w-4 h-4 text-emerald-400" />
                                Steuern
                            </div>
                            <div className="bg-slate-950/50 rounded-lg p-3 space-y-2 border border-slate-800/50">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Lohnsteuer</span>
                                    <span className="text-white font-mono">{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(convertToDisplayPeriod(income_tax, displayPeriod))}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Kirchensteuer</span>
                                    <span className="text-white font-mono">{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(convertToDisplayPeriod(church_tax, displayPeriod))}</span>
                                </div>
                            </div>
                        </div>

                        {/* Sozialabgaben */}
                        <div>
                            <div className="flex items-center gap-2 mb-3 text-slate-100 font-medium">
                                <HeartPulse className="w-4 h-4 text-rose-400" />
                                Sozialabgaben
                            </div>
                            <div className="bg-slate-950/50 rounded-lg p-3 space-y-2 border border-slate-800/50">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Rentenversicherung</span>
                                    <span className="text-white font-mono">{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(convertToDisplayPeriod(rv_employee, displayPeriod))}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Arbeitslosenvers.</span>
                                    <span className="text-white font-mono">{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(convertToDisplayPeriod(av_employee, displayPeriod))}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Krankenversicherung</span>
                                    <span className="text-white font-mono">{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(convertToDisplayPeriod(kv_employee, displayPeriod))}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Pflegeversicherung</span>
                                    <span className="text-white font-mono">{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(convertToDisplayPeriod(pv_employee, displayPeriod))}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Advanced Analysis Grid - Loaded conditionally */}
            {(scenarios || curve || result) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="lg:col-span-2">
                        <SalaryComparisonChart annualGross={gross_income} age={age} displayPeriod={displayPeriod} historicalMode={historicalMode} />
                    </div>
                    {scenarios && <ScenarioChart scenarios={scenarios} displayPeriod={displayPeriod} />}
                    {curve && <OptimizationChart data={curve} displayPeriod={displayPeriod} />}
                </div>
            )}

            {/* Inflation / Purchasing Power Chart */}
            {result && (
                <InflationChart annualGross={gross_income} displayPeriod={displayPeriod} />
            )}
        </div>
    );
}
