'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, Wallet, Building2, HeartPulse } from 'lucide-react';
import { TaxResult, ScenarioResult, CurvePoint } from '../types/api';
import { ScenarioChart } from './ScenarioChart';
import { OptimizationChart } from './OptimizationChart';
import { SalaryComparisonChart } from './SalaryComparisonChart';

interface ResultDashboardProps {
    result: TaxResult | null;
    scenarios?: ScenarioResult | null;
    curve?: CurvePoint[] | null;
    referenceNetIncome?: number | null;
    age?: number;
}

export function ResultDashboard({ result, scenarios, curve, referenceNetIncome, age = 30 }: ResultDashboardProps) {
    if (!result) {
        return (
            <div className="flex flex-col items-center justify-center p-8 sm:p-12 bg-slate-900 border border-slate-800 rounded-xl text-slate-400">
                <Wallet className="w-12 h-12 mb-4 text-slate-600" />
                <h3 className="text-lg font-medium text-white">Noch keine Berechnung</h3>
                <p className="text-sm mt-1">Bitte gib deine Daten <span className="lg:hidden">oben</span><span className="hidden lg:inline">links</span> ein.</p>
            </div>
        );
    }

    const {
        net_income, net_income_monthly, total_tax, total_social_security,
        income_tax, church_tax, kv_employee, pv_employee, rv_employee, av_employee,
        gross_income
    } = result;

    // Calculate Comparison (only if reference exists and is different)
    let compElement = null;
    if (referenceNetIncome !== undefined && referenceNetIncome !== null && Math.abs(referenceNetIncome - net_income) > 0.1) {
        const diff = net_income - referenceNetIncome;
        const percent = (diff / referenceNetIncome) * 100;
        const isPositive = diff > 0;

        compElement = (
            <div className="absolute top-6 right-6 text-right">
                <div className={`text-lg font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isPositive ? '+' : ''} {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(diff)}
                    <span className="text-xs text-slate-400 ml-1 font-normal block md:inline md:ml-2">gegenüber 2026</span>
                </div>
                <div className={`text-sm font-medium ${isPositive ? 'text-emerald-500/70' : 'text-rose-500/70'}`}>
                    {isPositive ? '+' : ''}{percent.toFixed(1).replace('.', ',')} %
                </div>
            </div>
        );
    }

    const data = [
        { name: 'Netto', value: net_income, color: '#4f46e5' }, // Indigo-600
        { name: 'Steuern', value: total_tax, color: '#94a3b8' }, // Slate-400
        { name: 'Sozialabgaben', value: total_social_security, color: '#64748b' }, // Slate-500
    ];

    const taxBurden = ((total_tax + total_social_security) / gross_income * 100).toFixed(1);

    return (
        <div className="space-y-4">
            {/* Top Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Main Result Card */}
                <div className="md:col-span-2 bg-gradient-to-br from-indigo-900/50 to-slate-900 border border-indigo-500/30 rounded-xl p-4 sm:p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full filter blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/20 transition-all duration-700"></div>

                    {compElement}

                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div className="flex items-center gap-2 text-indigo-200 mb-2">
                            <Wallet className="w-5 h-5" />
                            <span className="font-medium">Dein Nettogehalt</span>
                        </div>
                        <div>
                            <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-1">
                                {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(net_income_monthly)}
                            </div>
                            <div className="flex items-center gap-2 text-indigo-300 text-sm">
                                <span className="bg-indigo-500/20 px-2 py-0.5 rounded text-xs font-bold">Monatlich</span>
                                <span className="text-slate-400">{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(net_income)} im Jahr</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Stats Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-center gap-4">
                    <div className="space-y-1">
                        <div className="text-sm text-slate-400">Steuer-/Abgabenlast</div>
                        <div className="text-2xl font-bold text-white">{taxBurden}%</div>
                        <div className="text-xs text-rose-400 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            Gesamtbelastung
                        </div>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-rose-500 h-full rounded-full" style={{ width: `${taxBurden}%` }}></div>
                    </div>
                </div>
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
                            <span className="text-white font-bold text-lg">{new Intl.NumberFormat('de-DE', { maximumFractionDigits: 1 }).format(gross_income / 1000)}k</span>
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
                                    <span className="text-white font-mono">{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(income_tax)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Kirchensteuer</span>
                                    <span className="text-white font-mono">{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(church_tax)}</span>
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
                                    <span className="text-white font-mono">{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(rv_employee)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Arbeitslosenvers.</span>
                                    <span className="text-white font-mono">{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(av_employee)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Krankenversicherung</span>
                                    <span className="text-white font-mono">{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(kv_employee)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Pflegeversicherung</span>
                                    <span className="text-white font-mono">{new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(pv_employee)}</span>
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
                        <SalaryComparisonChart annualGross={gross_income} age={age} />
                    </div>
                    {scenarios && <ScenarioChart scenarios={scenarios} />}
                    {curve && <OptimizationChart data={curve} />}
                </div>
            )}
        </div>
    );
}
