'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface OptimizationCurveProps {
    data: any[]; // { factor_percent, gross, net, marginal_tax }
}

export default function OptimizationCurve({ data }: OptimizationCurveProps) {

    return (
        <div className="glass-card p-8 flex flex-col h-full">
            <h2 className="text-2xl font-bold mb-4 text-white border-b border-white/10 pb-4">
                Einkommens-Optimierung (50% - 150%)
            </h2>
            <p className="text-sm text-slate-400 mb-8">
                Verlauf von Netto und Grenzsteuer bei Variation des Bruttoeinkommens (Arbeitszeit).
            </p>

            <div className="h-80 w-full mb-8">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={data}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff20" />
                        <XAxis
                            dataKey="gross"
                            tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                            type="number"
                            domain={['auto', 'auto']}
                            label={{ value: 'Brutto (€)', position: 'insideBottomRight', offset: -10, fill: '#94a3b8' }}
                            tick={{ fill: '#cbd5e1' }}
                            stroke="#64748b"
                        />
                        <YAxis
                            yAxisId="left"
                            tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                            label={{ value: 'Netto (€)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
                            tick={{ fill: '#cbd5e1' }}
                            stroke="#64748b"
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            domain={[0, 60]}
                            unit="%"
                            label={{ value: 'Grenzsteuer', angle: 90, position: 'insideRight', fill: '#94a3b8' }}
                            tick={{ fill: '#cbd5e1' }}
                            stroke="#64748b"
                        />

                        <Tooltip
                            formatter={(val: number | undefined, name: any) => {
                                if (!val) return '';
                                if (name === 'Netto') return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(val);
                                if (name === 'Grenzsteuersatz') return `${val}%`;
                                return val;
                            }}
                            labelFormatter={(label) => `Brutto: ${new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(label)}`}
                            contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#1e293b', color: '#fff' }}
                        />
                        <Legend wrapperStyle={{ color: '#cbd5e1' }} />

                        <Line yAxisId="left" type="monotone" dataKey="net" name="Netto" stroke="#34d399" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#34d399' }} />
                        <Line yAxisId="right" type="stepAfter" dataKey="marginal_tax" name="Grenzsteuersatz" stroke="#f87171" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-sm text-slate-300">
                <strong className="text-white block mb-1">💡 Interpretation:</strong>
                Die <span className="text-red-400">rote Linie</span> zeigt, wie viel Prozent von jedem <i>zusätzlichen</i> Euro an den Staat gehen (Grenzbelastung).
                Die <span className="text-emerald-400">grüne Linie</span> ist Ihr Netto.
                Flacht die grüne Kurve ab oder springt die rote Linie stark an, lohnt sich Mehrarbeit weniger.
            </div>
        </div>
    );
}
