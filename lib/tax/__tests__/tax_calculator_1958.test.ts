import { describe, it, expect } from 'vitest';
import { TaxCalculator1958 } from '../tax_calculator_1958';

describe('TaxCalculator1958', () => {
    describe('Income Tax Formula (DM)', () => {
        it('should calculate 0 tax for income below Grundfreibetrag (1,680 DM)', () => {
            expect(TaxCalculator1958.calculateIncomeTaxDM(1000)).toBe(0);
            expect(TaxCalculator1958.calculateIncomeTaxDM(1680)).toBe(0);
        });

        it('should calculate Zone 2 correctly (1,681 DM to 8,009 DM)', () => {
            // ESt = 0.20 * (zvE - 1680)
            expect(TaxCalculator1958.calculateIncomeTaxDM(5000)).toBe(Math.floor(0.20 * (5000 - 1680)));
            expect(TaxCalculator1958.calculateIncomeTaxDM(8000)).toBe(Math.floor(0.20 * (8000 - 1680)));
        });

        it('should calculate Zone 3 correctly (8,010 DM to 23,999 DM)', () => {
            // Y = (zvE - 8000) / 1000, ESt = 1264 + 272 * Y + 2.9 * Y^2
            const zvE = 15000;
            const Y = (zvE - 8000) / 1000;
            const expected = Math.floor(1264 + 272 * Y + 2.9 * Math.pow(Y, 2));
            expect(TaxCalculator1958.calculateIncomeTaxDM(zvE)).toBe(expected);
        });

        it('should calculate Zone 4 correctly (24,000 DM to 110,039 DM)', () => {
            // Y = (zvE - 24000) / 1000, ESt = 6358 + 382 * Y + 1.572 * Y^2 - 0.006 * Y^3
            const zvE = 50000;
            const Y = (zvE - 24000) / 1000;
            const expected = Math.floor(6358 + 382 * Y + 1.572 * Math.pow(Y, 2) - 0.006 * Math.pow(Y, 3));
            expect(TaxCalculator1958.calculateIncomeTaxDM(zvE)).toBe(expected);
        });

        it('should calculate Zone 5 correctly (>= 110,040 DM)', () => {
            // ESt = 0.53 * zvE - 11281
            const zvE = 120000;
            const expected = Math.floor(0.53 * zvE - 11281);
            expect(TaxCalculator1958.calculateIncomeTaxDM(zvE)).toBe(expected);
        });

        it('should support married splitting method', () => {
            // ESt_splitting(zvE) = 2 * ESt_single(zvE / 2)
            const zvE = 100000;
            const expected = 2 * TaxCalculator1958.calculateIncomeTaxDM(zvE / 2);
            expect(TaxCalculator1958.calculateIncomeTaxSplittingDM(zvE, 3)).toBe(expected);
            expect(TaxCalculator1958.calculateIncomeTaxSplittingDM(zvE, 1)).toBe(TaxCalculator1958.calculateIncomeTaxDM(zvE));
        });
    });

    describe('Scaling factors and calculations (EUR/DM)', () => {
        it('should calculate scaling factors for wage mode correctly', () => {
            const factors = TaxCalculator1958.getScalingFactors('wage');
            expect(factors.eurToDmFactor).toBeCloseTo(5330 / 51944, 6);
            expect(factors.dmToEurFactor).toBeCloseTo(51944 / 5330, 6);
        });

        it('should calculate scaling factors for price mode correctly', () => {
            const factors = TaxCalculator1958.getScalingFactors('price');
            expect(factors.eurToDmFactor).toBeCloseTo(1 / 2.86, 6);
            expect(factors.dmToEurFactor).toBeCloseTo(2.86, 6);
        });

        it('should calculate full 1958 result in Euros', () => {
            const gross = 50000;
            const resWage = TaxCalculator1958.calculate1958(gross, 1, false, 'BE', 'wage');

            expect(resWage.gross_income).toBe(gross);
            expect(resWage.net_income).toBeLessThan(gross);
            expect(resWage.net_income).toBeGreaterThan(0);
            expect(resWage.soli).toBe(0); // Soli is always 0
            expect(resWage.pv_employee).toBe(0); // PV is always 0
        });

        it('should calculate marginal tax rate correctly', () => {
            // In Zone 2, single marginal rate should be 20%
            const marginal = TaxCalculator1958.getMarginalTaxRate(5000, 1);
            expect(marginal).toBe(20.0);
        });
    });
});
