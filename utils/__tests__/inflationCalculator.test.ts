import { describe, it, expect } from 'vitest';
import {
    buildChartData,
    calculatePurchasingPowerLoss,
    calculateInflationFactor,
    INFLATION_RATES,
    FUTURE_INFLATION,
    CURRENT_YEAR
} from '../inflationCalculator';

describe('inflationCalculator', () => {
    describe('Constants', () => {
        it('should have CURRENT_YEAR set to 2026', () => {
            expect(CURRENT_YEAR).toBe(2026);
        });

        it('should have FUTURE_INFLATION set to 2.0 (EZB target)', () => {
            expect(FUTURE_INFLATION).toBe(2.0);
        });

        it('should have historical inflation rates from 1970 to 2025', () => {
            expect(INFLATION_RATES[1970]).toBeDefined();
            expect(INFLATION_RATES[2000]).toBeDefined();
            expect(INFLATION_RATES[2025]).toBeDefined();
        });
    });

    describe('calculateInflationFactor', () => {
        it('should return 1.0 when fromYear equals toYear', () => {
            expect(calculateInflationFactor(2020, 2020)).toBe(1.0);
        });

        it('should return 1.0 when fromYear is greater than toYear', () => {
            expect(calculateInflationFactor(2025, 2020)).toBe(1.0);
        });

        it('should calculate correct factor for future years with 2% inflation', () => {
            // From 2026 to 2027 with 2% future inflation
            const factor = calculateInflationFactor(2026, 2027);
            expect(factor).toBeCloseTo(1.02, 4);
        });

        it('should compound correctly over multiple years', () => {
            // 10 years at 2% = 1.02^10 ≈ 1.219
            const factor = calculateInflationFactor(2026, 2036);
            expect(factor).toBeCloseTo(Math.pow(1.02, 10), 3);
        });

        it('should calculate correct factor for 24 years (2026-2050)', () => {
            // 24 years at 2% = 1.02^24 ≈ 1.608
            const factor = calculateInflationFactor(2026, 2050);
            expect(factor).toBeCloseTo(1.608, 2);
        });
    });

    describe('calculatePurchasingPowerLoss', () => {
        it('should return 0 for current year or past years', () => {
            expect(calculatePurchasingPowerLoss(60000, 2026)).toBe(0);
            expect(calculatePurchasingPowerLoss(60000, 2020)).toBe(0);
        });

        it('should calculate approximately 38% loss by 2050 (24 years at 2%)', () => {
            // With 2% inflation: loss = 1 - 1/1.02^24 ≈ 1 - 0.622 ≈ 0.378
            const loss = calculatePurchasingPowerLoss(60000, 2050);
            expect(loss).toBeGreaterThanOrEqual(35);
            expect(loss).toBeLessThanOrEqual(42);
        });

        it('should calculate approximately 18% loss by 2036 (10 years at 2%)', () => {
            // With 2% inflation: loss = 1 - 1/1.02^10 ≈ 1 - 0.82 ≈ 0.18
            const loss = calculatePurchasingPowerLoss(60000, 2036);
            expect(loss).toBeGreaterThanOrEqual(15);
            expect(loss).toBeLessThanOrEqual(22);
        });

        it('should return same percentage regardless of income amount', () => {
            const loss1 = calculatePurchasingPowerLoss(30000, 2050);
            const loss2 = calculatePurchasingPowerLoss(60000, 2050);
            const loss3 = calculatePurchasingPowerLoss(120000, 2050);

            expect(loss1).toBe(loss2);
            expect(loss2).toBe(loss3);
        });

        it('should NEVER return a value over 50% for 2050 (this was the bug!)', () => {
            // This test ensures the bug where monthly values were compared
            // to yearly values (resulting in ~95% loss) doesn't recur
            const loss = calculatePurchasingPowerLoss(60000, 2050);
            expect(loss).toBeLessThan(50);
        });

        it('should NEVER return a value over 70% even for 2070', () => {
            // Even 44 years of 2% inflation shouldn't exceed 70%
            // 1 - 1/1.02^44 ≈ 0.58
            const loss = calculatePurchasingPowerLoss(60000, 2070);
            expect(loss).toBeLessThan(70);
        });
    });

    describe('buildChartData', () => {
        const testGross = 60000;

        it('should generate data points from startYear to endYear', () => {
            const data = buildChartData(testGross, 2020, 2030);
            expect(data.length).toBe(11); // 2020 to 2030 inclusive
            expect(data[0].year).toBe(2020);
            expect(data[10].year).toBe(2030);
        });

        it('should have current year point with both kaufkraft and kaufkraftFuture', () => {
            const data = buildChartData(testGross);
            const currentPoint = data.find(d => d.year === CURRENT_YEAR);

            expect(currentPoint).toBeDefined();
            expect(currentPoint!.kaufkraft).toBe(testGross);
            expect(currentPoint!.kaufkraftFuture).toBe(testGross);
        });

        it('should have past points with only kaufkraft (no kaufkraftFuture)', () => {
            const data = buildChartData(testGross);
            const pastPoint = data.find(d => d.year === 2020);

            expect(pastPoint).toBeDefined();
            expect(pastPoint!.kaufkraft).toBeDefined();
            expect(pastPoint!.kaufkraftFuture).toBeUndefined();
        });

        it('should have future points with only kaufkraftFuture (no kaufkraft)', () => {
            const data = buildChartData(testGross);
            const futurePoint = data.find(d => d.year === 2030);

            expect(futurePoint).toBeDefined();
            expect(futurePoint!.kaufkraft).toBeUndefined();
            expect(futurePoint!.kaufkraftFuture).toBeDefined();
        });

        it('should show higher kaufkraft in the past (inflation adjusted)', () => {
            const data = buildChartData(testGross);
            const year2000 = data.find(d => d.year === 2000);
            const year2026 = data.find(d => d.year === CURRENT_YEAR);

            // In 2000, today's 60k would have been worth more (higher purchasing power)
            expect(year2000!.kaufkraft).toBeGreaterThan(year2026!.kaufkraft!);
        });

        it('should show lower kaufkraftFuture in the future (inflation erodes value)', () => {
            const data = buildChartData(testGross);
            const year2026 = data.find(d => d.year === CURRENT_YEAR);
            const year2050 = data.find(d => d.year === 2050);

            // In 2050, today's 60k will be worth less
            expect(year2050!.kaufkraftFuture).toBeLessThan(year2026!.kaufkraftFuture!);
        });

        it('should calculate 2050 purchasing power correctly (~62% of current)', () => {
            const data = buildChartData(testGross);
            const year2050 = data.find(d => d.year === 2050);

            // Expected: 60000 / 1.02^24 ≈ 37320
            const expected = testGross / Math.pow(1.02, 24);
            expect(year2050!.kaufkraftFuture).toBeCloseTo(expected, -2); // Within 100
        });
    });

    describe('Regression: Monthly vs Yearly Bug Prevention', () => {
        /**
         * This test suite specifically guards against the bug where
         * the purchasing power loss was incorrectly calculated as ~95%
         * when monthly display mode was active, because monthly-converted
         * values were compared against yearly values.
         */

        it('calculatePurchasingPowerLoss should be independent of display period', () => {
            // The function only takes annualGross, no display period
            // This ensures the calculation is always based on consistent units
            const loss = calculatePurchasingPowerLoss(60000, 2050);

            // The loss should be around 38%, definitely not 95%
            expect(loss).toBeGreaterThan(30);
            expect(loss).toBeLessThan(50);
        });

        it('buildChartData should return consistent values regardless of how they are later converted', () => {
            const data = buildChartData(60000);
            const year2050 = data.find(d => d.year === 2050);

            // Raw data should be in yearly terms
            // Monthly conversion should happen ONLY at display time, not in the calculation
            expect(year2050!.kaufkraftFuture).toBeGreaterThan(30000); // Should be ~37k, not ~3k
            expect(year2050!.kaufkraftFuture).toBeLessThan(45000);
        });

        it('loss percentage should be mathematically correct: ~38% for 24 years at 2%', () => {
            // Mathematical proof:
            // Inflation factor after 24 years = 1.02^24 ≈ 1.608
            // Future purchasing power = original / factor = 1 / 1.608 ≈ 0.622
            // Loss = 1 - 0.622 = 0.378 ≈ 38%

            const inflationFactor = Math.pow(1.02, 24);
            const expectedLossPercent = (1 - 1 / inflationFactor) * 100;

            const actualLoss = calculatePurchasingPowerLoss(60000, 2050);

            expect(actualLoss).toBeCloseTo(expectedLossPercent, 0); // Within 1%
        });
    });
});
