import React from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface HourlyWageCardProps {
    gross_income: number;
    net_income: number;
    weeklyHours: number;
    displayPeriod: 'yearly' | 'monthly';
}

export function calculateHourlyWages(gross_income: number, net_income: number, weeklyHours: number) {
    if (!gross_income || !weeklyHours || weeklyHours <= 0) return { grossHourly: 0, netHourly: 0, isBelowMinimumWage: false, minimumWage2026: 13.90 };

    const yearlyHours = weeklyHours * 52;
    const grossHourly = gross_income / yearlyHours;
    const netHourly = net_income / yearlyHours;
    const minimumWage2026 = 13.90;
    const isBelowMinimumWage = grossHourly > 0 && grossHourly < minimumWage2026;

    return { grossHourly, netHourly, isBelowMinimumWage, minimumWage2026 };
}

export function HourlyWageCard({ gross_income, net_income, weeklyHours, displayPeriod }: HourlyWageCardProps) {
    if (!gross_income || !weeklyHours) return null;

    const { grossHourly, netHourly, isBelowMinimumWage, minimumWage2026 } = calculateHourlyWages(gross_income, net_income, weeklyHours);

    const formattedGrossHourly = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(grossHourly);
    const formattedNetHourly = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(netHourly);

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col h-full relative overflow-hidden">
            <div className="flex flex-col justify-center flex-grow gap-2">
                <h3 className="text-lg font-semibold text-white">Stundenlohn</h3>

                <div className="flex flex-col gap-3">
                    <div className="space-y-0.5">
                        <div className="text-sm text-slate-400">Brutto</div>
                        <div className={`text-xl font-bold tracking-tight ${isBelowMinimumWage ? 'text-rose-400' : 'text-slate-200'}`}>
                            {formattedGrossHourly}
                        </div>
                    </div>
                    <div className="space-y-0.5">
                        <div className="text-sm text-slate-400">Netto</div>
                        <div className="text-xl font-bold tracking-tight text-white">
                            {formattedNetHourly}
                        </div>
                    </div>
                </div>

                {isBelowMinimumWage && (
                    <div className="text-xs text-rose-400 flex items-start gap-1.5 mt-1" role="alert" data-testid="minimum-wage-warning">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span className="leading-tight">Achtung: Liegt unter Mindestlohn (13,90 €)</span>
                    </div>
                )}
            </div>
        </div>
    );
}
