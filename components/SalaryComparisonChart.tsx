'use client';

import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot, Legend } from 'recharts';
import { Info, Users } from 'lucide-react';
import { getChartData, getUserComparison } from '../utils/salaryComparison';

interface SalaryComparisonChartProps {
    annualGross: number; // Yearly gross income
    age: number;
}

export function SalaryComparisonChart({ annualGross, age }: SalaryComparisonChartProps) {
    const gender = 'all';

    // Load Chart Data (Memoized as it's static/calculated once)
    const chartData = useMemo(() => getChartData(), []);

    // Calculate User Comparison
    const comparison = useMemo(() => {
        return getUserComparison(annualGross, age, gender);
    }, [annualGross, age, gender]);

    // Formatter for currency
    const formatCurrency = (val: number) => new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0
    }).format(val);

    // X-Axis Ticks (every 5 years)
    const xTicks = [18, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 67];

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6 shadow-sm">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-2 relative z-10">
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Users className="w-5 h-5 text-indigo-400" />
                            Gehaltsvergleich
                        </h3>

                        {/* Info Icon / Tooltip */}
                        <div className="relative group flex items-center">
                            <Info className="w-4 h-4 text-slate-500 hover:text-slate-300 cursor-help" />
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs text-slate-400 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 pointer-events-none">
                                <p className="font-semibold text-slate-300 mb-1">Datenbasis</p>
                                <ul className="list-disc pl-3 space-y-1">
                                    <li>Stepstone Gehaltsreport 2025 (Prognose)</li>
                                    <li>Destatis Verdienststrukturen</li>
                                    <li>Extrapolation über Alterskoeffizienten</li>
                                </ul>
                                <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-500">
                                    Hinweis: Die Werte sind statistische Näherungen (Median) und dienen der Orientierung.
                                </div>
                            </div>
                        </div>
                    </div>
                    <p className="text-sm text-slate-400 mt-1">
                        Vergleich mit Daten aus 2025 (Prognose Stepstone)
                    </p>
                </div>

                {/* Analysis Text / Metric - Top Right, Glassmorphism */}
                <div className="w-full lg:w-1/2 lg:max-w-md bg-slate-800/20 backdrop-blur-sm border border-white/5 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-indigo-500/20 rounded-full text-indigo-300 flex-shrink-0">
                            <Users className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                            <div className="text-indigo-100 font-medium text-sm leading-snug">
                                Du verdienst mehr als <span className="text-emerald-400 font-bold">{comparison.percentile.toFixed(0)}%</span>
                                {' '}der Beschäftigten in deinem Alter.
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Analysis Text / Metric */}


            {/* Chart */}
            <div className="h-[300px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={chartData}
                        margin={{ top: 20, right: 20, left: 10, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis
                            dataKey="age"
                            stroke="#64748b"
                            tick={{ fontSize: 12 }}
                            tickMargin={10}
                            type="number"
                            ticks={xTicks} // Use explicit ticks
                            domain={['dataMin', 'dataMax']}
                            unit=" J"
                        />
                        <YAxis
                            stroke="#64748b"
                            tick={{ fontSize: 12 }}
                            tickFormatter={(val) => `${val / 1000}k`}
                            width={35}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                            itemStyle={{ fontSize: '12px' }}
                            labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                            formatter={(value: number | undefined) => [formatCurrency(value || 0), '']}
                            labelFormatter={(label) => `Alter: ${label}`}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />

                        {/* Lines */}
                        <Line
                            type="monotone"
                            dataKey="medianMale"
                            name="Median (Männer)"
                            stroke="#60a5fa" // Blue-400
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 4 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="medianFemale"
                            name="Median (Frauen)"
                            stroke="#c084fc" // Purple-400
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 4 }}
                        />

                        {/* User Dot */}
                        <ReferenceDot
                            x={age}
                            y={annualGross}
                            r={6}
                            fill="#10b981" // Emerald-500
                            stroke="#fff"
                            strokeWidth={2}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
