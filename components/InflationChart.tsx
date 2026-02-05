'use client';

import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';
import { TrendingDown, AlertTriangle } from 'lucide-react';
import { InfoTooltip } from './InfoTooltip';
import { DisplayPeriod } from '../types/api';
import { convertToDisplayPeriod } from '../utils/periodConverter';
import { buildChartData, calculatePurchasingPowerLoss, CURRENT_YEAR } from '../utils/inflationCalculator';

interface InflationChartProps {
    annualGross: number;
    displayPeriod: DisplayPeriod;
}

export function InflationChart({ annualGross, displayPeriod }: InflationChartProps) {
    const chartData = useMemo(() => {
        const rawData = buildChartData(annualGross);
        return rawData.map(point => ({
            ...point,
            kaufkraft: point.kaufkraft ? convertToDisplayPeriod(point.kaufkraft, displayPeriod) : undefined,
            kaufkraftFuture: point.kaufkraftFuture ? convertToDisplayPeriod(point.kaufkraftFuture, displayPeriod) : undefined,
        }));
    }, [annualGross, displayPeriod]);

    const formatCurrency = (val: number) => new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
    }).format(val);

    // Calculate total loss in ~25 years using the dedicated utility function
    const lossPercent = useMemo(() => calculatePurchasingPowerLoss(annualGross, 2050), [annualGross]);

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6 shadow-sm">
            {/* Header */}
            <div className="mb-4">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <TrendingDown className="w-5 h-5 text-indigo-400" />
                        Kaufkraft über Zeit
                    </h3>
                    <InfoTooltip text="Zeigt, was dein heutiges Gehalt in der Vergangenheit wert gewesen wäre und wie die Inflation es in Zukunft entwertet. Historische Raten: Destatis. Prognose: ~2 % p.a. (EZB-Zielwert)." />
                </div>
                <p className="text-sm text-slate-400 mt-1">
                    Was dein Gehalt ({formatCurrency(convertToDisplayPeriod(annualGross, displayPeriod))}{displayPeriod === 'monthly' ? '/Monat' : '/Jahr'}) real wert ist – gestern, heute, morgen
                </p>
            </div>

            {/* Chart */}
            <div className="h-[300px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
                        <defs>
                            <linearGradient id="kaufkraftPast" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.01} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis
                            dataKey="year"
                            stroke="#64748b"
                            tick={{ fontSize: 12, fill: '#64748b' }}
                            tickMargin={10}
                            type="number"
                            domain={[2000, 2055]}
                            ticks={[2000, 2005, 2010, 2015, 2020, 2026, 2030, 2035, 2040, 2045, 2050]}
                        />
                        <YAxis
                            stroke="#64748b"
                            tick={{ fontSize: 12, fill: '#64748b' }}
                            tickFormatter={(val) => val === 0 ? '0 €' : `${Math.round(val / 1000)}k`}
                            width={40}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                            itemStyle={{ fontSize: '12px' }}
                            labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                            formatter={(value: number | undefined, name?: string) => {
                                const label = name === 'kaufkraft' ? 'Historisch' : 'Prognose';
                                return [formatCurrency(value || 0), label];
                            }}
                            labelFormatter={(label) => `Jahr ${label}`}
                        />
                        <Legend
                            wrapperStyle={{ paddingTop: '20px' }}
                            formatter={(value: string) => value === 'kaufkraft' ? 'Historisch' : 'Prognose'}
                        />
                        <ReferenceLine x={CURRENT_YEAR} stroke="#475569" strokeDasharray="6 3" label={{ value: 'Heute', position: 'top', fill: '#64748b', fontSize: 11 }} />

                        {/* Past area (blue) */}
                        <Area
                            type="monotone"
                            dataKey="kaufkraft"
                            name="kaufkraft"
                            stroke="#60a5fa"
                            strokeWidth={2}
                            fill="url(#kaufkraftPast)"
                            dot={false}
                            activeDot={{ r: 4, fill: '#60a5fa' }}
                            connectNulls={false}
                        />
                        {/* Future line (warm orange, dashed, no fill) */}
                        <Area
                            type="monotone"
                            dataKey="kaufkraftFuture"
                            name="kaufkraftFuture"
                            stroke="#d97706"
                            strokeWidth={2}
                            strokeDasharray="6 3"
                            fill="none"
                            dot={false}
                            activeDot={{ r: 4, fill: '#d97706' }}
                            connectNulls={false}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Subtle warning + source info */}
            <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[11px] text-amber-500/70">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Ohne Gehaltserhöhung ca. {lossPercent}% Kaufkraftverlust bis 2050</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-600">
                    <span>Ø Inflation 2000–2025: ~2,3 % p.a.</span>
                    <span className="text-slate-700">|</span>
                    <span>Prognose: ~2,0 % (EZB-Ziel)</span>
                </div>
            </div>
        </div>
    );
}
