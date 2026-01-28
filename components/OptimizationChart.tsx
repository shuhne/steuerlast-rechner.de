'use client';

import React from 'react';
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CurvePoint } from '../types/api';
import { TrendingUp } from 'lucide-react';
import { InfoTooltip } from './InfoTooltip';

interface OptimizationChartProps {
    data: CurvePoint[];
}

export function OptimizationChart({ data }: OptimizationChartProps) {
    if (!data || data.length === 0) return null;

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-semibold text-white flex items-center">
                    Grenzsteueranalyse
                    <InfoTooltip text="Der Grenzsteuersatz zeigt an, wie viel Cent von jedem zusätzlich verdienten Euro an den Staat gehen. Ein progressiver Steuersatz bedeutet, dass Besserverdienende einen höheren Prozentsatz an Steuern zahlen." />
                </h3>
            </div>

            <div className="h-[300px] w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis
                            dataKey="gross"
                            tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                            stroke="#64748b"
                            tick={{ fill: '#64748b' }}
                        />
                        <YAxis
                            yAxisId="left"
                            stroke="#64748b"
                            tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                            tick={{ fill: '#64748b' }}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            stroke="#94a3b8"
                            unit="%"
                            domain={[0, 60]}
                            tick={{ fill: '#94a3b8' }}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                            itemStyle={{ color: '#f8fafc' }}
                            labelFormatter={(val) => `Brutto: ${new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(val)}`}
                            formatter={(value: any, name: any) => {
                                if (name === 'Netto') return [new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value), name];
                                if (name === 'Grenzsteuer') return [`${value.toFixed(1)}%`, name];
                                return [value, name];
                            }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Area
                            yAxisId="left"
                            type="monotone"
                            dataKey="net"
                            name="Netto"
                            stroke="#6366f1"
                            fillOpacity={1}
                            fill="url(#colorNet)"
                            strokeWidth={2}
                        />
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="marginal_tax"
                            name="Grenzsteuer"
                            stroke="#f43f5e"
                            strokeWidth={2}
                            dot={false}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
            <p className="text-sm text-slate-400 mt-4 text-center">
                Verlauf von Netto-Gehalt und Grenzsteuerbelastung bei Gehaltsänderung (+/- 50%)
            </p>
        </div>
    );
}
