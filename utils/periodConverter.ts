import { DisplayPeriod } from '../types/api';

/**
 * Konvertiert einen Jahreswert basierend auf der Display-Periode
 */
export function convertToDisplayPeriod(
    yearlyValue: number,
    displayPeriod: DisplayPeriod
): number {
    return displayPeriod === 'monthly' ? yearlyValue / 12 : yearlyValue;
}

/**
 * Formatiert einen Wert als Waehrung mit korrektem Suffix
 */
export function formatCurrencyWithPeriod(
    yearlyValue: number,
    displayPeriod: DisplayPeriod,
    options?: { compact?: boolean }
): string {
    const value = convertToDisplayPeriod(yearlyValue, displayPeriod);

    if (options?.compact) {
        const suffix = displayPeriod === 'monthly' ? '/Mo' : '/Jahr';
        return `${(value / 1000).toFixed(0)}k${suffix}`;
    }

    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0
    }).format(value);
}

/**
 * Gibt das Label fuer die Y-Achse zurueck
 */
export function getAxisLabel(displayPeriod: DisplayPeriod): string {
    return displayPeriod === 'monthly' ? 'Euro/Monat' : 'Euro/Jahr';
}

/**
 * Formatiert Tick-Werte fuer Y-Achsen
 */
export function formatAxisTick(
    value: number,
    displayPeriod: DisplayPeriod
): string {
    if (value === 0) return '0';
    return `${(value / 1000).toFixed(0)}k`;
}
