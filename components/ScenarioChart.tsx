'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ScenarioResult } from '../types/api';
import { ArrowRightLeft } from 'lucide-react';
import { InfoTooltip } from './InfoTooltip';

interface ScenarioChartProps {
    scenarios: ScenarioResult;
}

export function ScenarioChart({ scenarios }: ScenarioChartProps) {
    if (!scenarios || Object.keys(scenarios).length === 0) return null;

    // Transform object to array for Recharts
    // scenarios looks like { "A_Base_100": { ... }, "B_Time_90": { ... } }
    const data = Object.entries(scenarios).map(([key, val]) => {
        let label = key;
        if (key.includes('Time_90')) label = '90%';
        if (key.includes('Time_80')) label = '80%';
        if (key.includes('Time_70')) label = '70%';
        if (key.includes('Time_50')) label = '50%';

        // Remove Base/100 if present
        if (key.includes('Base')) return null;

        return {
            name: label,
            gross: val.gross_income,
            net: val.net_income,
            fullKey: key
        };
    }).filter(item => item !== null);

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6 shadow-sm">
            <div className="mb-4">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <ArrowRightLeft className="w-5 h-5 text-indigo-400" />
                        Lohnentwicklung Teilzeit
                    </h3>
                    <InfoTooltip text="Zeigt, wie sich dein Nettogehalt verhält, wenn du deine Arbeitszeit reduzierst (z.B. auf 80% oder 50%). Da die Steuerbelastung progressiv ist, sinkt das Netto oft weniger stark als das Brutto." />
                </div>
                <p className="text-sm text-slate-400 mt-1">Brutto vs. Netto bei verschiedenen Teilzeitmodellen</p>
            </div>

            <div className="h-[300px] w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis
                            dataKey="name"
                            stroke="#64748b"
                            tick={{ fill: '#64748b' }}
                        />
                        <YAxis
                            stroke="#64748b"
                            tickFormatter={(val) => val === 0 ? '0 €' : `${(val / 1000).toFixed(0)}k`}
                            tick={{ fill: '#64748b' }}
                        />
                        <Tooltip
                            cursor={{ fill: '#1e293b', opacity: 0.5 }}
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                            itemStyle={{ color: '#f8fafc' }}
                            formatter={(value: any) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value || 0)}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar dataKey="gross" name="Brutto" fill="#334155" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="net" name="Netto" fill="#60a5fa" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <p className="text-xs text-slate-500 mt-4 text-center">
                Vergleich Brutto vs. Netto bei verschiedenen Teilzeitmodellen.
            </p>
        </div>
    );
}
