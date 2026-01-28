'use client';

import { TaxResult } from '@/types/tax';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ScenarioDashboardProps {
    scenarios: Record<string, TaxResult>;
}

export default function ScenarioDashboard({ scenarios }: ScenarioDashboardProps) {

    const chartData = Object.keys(scenarios).map(key => {
        const res = scenarios[key];
        let label = key;
        if (key === 'A_Base_100') label = 'A (Basis)';
        if (key === 'B_Time_90') label = 'B (90%)';
        if (key === 'C_Time_80') label = 'C (80%)';
        if (key === 'D_Bonus_5k') label = 'D (+Bonus)';

        return {
            name: label,
            Netto: res.net_income,
            Steuern: res.total_tax,
            Sozialabgaben: res.total_social_security,
            Brutto: res.gross_income
        };
    });

    return (
        <div className="glass-card p-8 flex flex-col h-full">
            <h2 className="text-2xl font-bold mb-6 text-white border-b border-white/10 pb-4">Szenarien-Vergleich</h2>

            <div className="h-80 w-full mb-8">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff20" />
                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#cbd5e1' }} stroke="#64748b" />
                        <YAxis tickFormatter={(val) => `${val / 1000}k`} tick={{ fill: '#cbd5e1' }} stroke="#64748b" />
                        <Tooltip
                            formatter={(val: number | undefined) => val ? new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(val) : ''}
                            cursor={{ fill: '#ffffff10' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#1e293b', color: '#fff' }}
                        />
                        <Legend wrapperStyle={{ color: '#cbd5e1' }} />
                        <Bar dataKey="Netto" fill="#34d399" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Sozialabgaben" fill="#fbbf24" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Steuern" fill="#f87171" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Comparison Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/10 text-slate-300">
                    <thead className="bg-white/5">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Szenario</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">Brutto</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">Netto</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">Δ Netto</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">Grenzsteuer</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {Object.keys(scenarios).sort().map((key) => {
                            const res = scenarios[key];
                            const baseNet = scenarios['A_Base_100']?.net_income || 0;
                            const delta = res.net_income - baseNet;

                            let label = key;
                            if (key.includes('A_')) label = 'Szenario A (Basis)';
                            if (key.includes('B_')) label = 'Szenario B (90% Arbeitszeit)';
                            if (key.includes('C_')) label = 'Szenario C (80% Arbeitszeit)';
                            if (key.includes('D_')) label = 'Szenario D (+5k Bonus)';

                            return (
                                <tr key={key} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{label}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-slate-400">{res.gross_income.toLocaleString('de-DE')} €</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-emerald-400">{res.net_income.toLocaleString('de-DE')} €</td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-mono ${delta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {delta > 0 ? '+' : ''}{delta.toLocaleString('de-DE')} €
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-slate-400">{res.tax_rate_marginal}%</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
