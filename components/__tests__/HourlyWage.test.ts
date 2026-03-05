import { describe, it, expect } from 'vitest';
import { calculateHourlyWages } from '../HourlyWageCard';

describe('calculateHourlyWages', () => {
    it('returns zero for missing or invalid inputs', () => {
        expect(calculateHourlyWages(0, 0, 40)).toEqual({ grossHourly: 0, netHourly: 0, isBelowMinimumWage: false, minimumWage2026: 13.90 });
        expect(calculateHourlyWages(50000, 30000, 0)).toEqual({ grossHourly: 0, netHourly: 0, isBelowMinimumWage: false, minimumWage2026: 13.90 });
    });

    it('calculates hourly wage correctly', () => {
        // Gross income 52000, 40 hours -> 52000 / (40 * 52) = 52000 / 2080 = 25 EUR/h
        // Net income 31200, 40 hours -> 31200 / 2080 = 15 EUR/h
        const result = calculateHourlyWages(52000, 31200, 40);
        expect(result.grossHourly).toBeCloseTo(25, 2);
        expect(result.netHourly).toBeCloseTo(15, 2);
        expect(result.isBelowMinimumWage).toBe(false);
    });

    it('identifies minimum wage warning if gross hourly is below 13.90', () => {
        // Gross income 20000, 40 hours -> 20000 / 2080 = 9.61 EUR/h
        const result = calculateHourlyWages(20000, 15000, 40);
        expect(result.grossHourly).toBeLessThan(13.90);
        expect(result.isBelowMinimumWage).toBe(true);
    });

    it('does not identify minimum wage warning if gross hourly is exactly or above 13.90', () => {
        const h13_90_yearly = 13.90 * 40 * 52; // 28912
        expect(calculateHourlyWages(h13_90_yearly, 20000, 40).isBelowMinimumWage).toBe(false);

        expect(calculateHourlyWages(30000, 20000, 40).isBelowMinimumWage).toBe(false);
    });
});
