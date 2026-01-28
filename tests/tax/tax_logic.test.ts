
import { describe, it, expect } from 'vitest';
import { SocialSecurity2026 } from '../../lib/tax/social_security';
import { TaxCalculator2026 } from '../../lib/tax/tax_calculator';

describe('SocialSecurity2026 - Pflegeversicherung (PV)', () => {
    // 2026 Rates:
    // Base PV: 3.6% (1.8% AN / 1.8% AG)
    // Childless Surcharge: +0.6% (AN only) -> Total AN: 2.4%
    // Child Relief: -0.25% per child (starting from 2nd child)
    // BBG KV/PV 2026: 69,750 EUR (5,812.50 EUR monthly)

    const MONTHLY_GROSS = 5000; // Below BBG
    const YEAR_OF_BIRTH_YOUNG = 2005; // 21 years old in 2026 (No Surcharge)
    const YEAR_OF_BIRTH_ADULT = 1990; // 36 years old in 2026 (Surcharge applies if childless)

    it('should calculate base PV for young employee (<23) without children', () => {
        // Age 21: No Surcharge.
        // AN Rate: 1.8%
        const result = SocialSecurity2026.calculateSvContributions(
            MONTHLY_GROSS, 'BE', 0, false, 0, YEAR_OF_BIRTH_YOUNG
        );
        const expectedPV = MONTHLY_GROSS * 0.018;
        expect(result.pv).toBeCloseTo(expectedPV, 2);
    });

    it('should apply childless surcharge for adult employee (>23) without children', () => {
        // Age 36: Surcharge (+0.6%)
        // AN Rate: 1.8% + 0.6% = 2.4%
        const result = SocialSecurity2026.calculateSvContributions(
            MONTHLY_GROSS, 'BE', 0, false, 0, YEAR_OF_BIRTH_ADULT
        );
        const expectedPV = MONTHLY_GROSS * 0.024;
        expect(result.pv).toBeCloseTo(expectedPV, 2);
    });

    it('should NOT apply surcharge for adult employee with 1 child', () => {
        // Age 36, 1 Child: No Surcharge, No extra relief.
        // AN Rate: 1.8%
        const result = SocialSecurity2026.calculateSvContributions(
            MONTHLY_GROSS, 'BE', 0, true, 1, YEAR_OF_BIRTH_ADULT
        );
        const expectedPV = MONTHLY_GROSS * 0.018;
        expect(result.pv).toBeCloseTo(expectedPV, 2);
    });

    it('should apply PUEG relief for 2 children', () => {
        // Age 36, 2 Children: No Surcharge. Relief -0.25% (for 1 child beyond the first).
        // AN Rate: 1.8% - 0.25% = 1.55%
        const result = SocialSecurity2026.calculateSvContributions(
            MONTHLY_GROSS, 'BE', 0, true, 2, YEAR_OF_BIRTH_ADULT
        );
        const expectedPV = MONTHLY_GROSS * 0.0155;
        expect(result.pv).toBeCloseTo(expectedPV, 2);
    });

    it('should apply PUEG relief MAX (5 children)', () => {
        // Age 36, 5 Children: No Surcharge. Relief 4 * 0.25% = -1.0%.
        // AN Rate: 1.8% - 1.0% = 0.8%
        const result = SocialSecurity2026.calculateSvContributions(
            MONTHLY_GROSS, 'BE', 0, true, 5, YEAR_OF_BIRTH_ADULT
        );
        const expectedPV = MONTHLY_GROSS * 0.008;
        expect(result.pv).toBeCloseTo(expectedPV, 2);
    });
});

describe('TaxCalculator2026 - Altersentlastungsbetrag', () => {
    // Altersentlastungsbetrag Logic:
    // Depends on the year following the 64th birthday.
    // For 2026 calculation:
    // If born 1960 -> 64 in 2024 -> Claim starts 2025.
    // If born 1961 -> 64 in 2025 -> Claim starts 2026.

    // We need to implement calculateTaxableIncome with relief or update calculateIncomeTax.
    // Assuming we verify key tax amounts.

    // Test Case:
    // Gross: 50,000.
    // Scenario A: Age 30 (Born 1996) -> Standard Tax.
    // Scenario B: Age 65 (Born 1961) -> Relief active (12.8% of wages, max 608 EUR for 2026 cohort, 
    // actually it depends on year. Let's assume standardized Cohort 2026 values or calculate correctly).
    // For simplicty in TDD, we assert that tax for 65yo is LOWER than for 30yo.

    it('should calculate LOWER tax for age 65 due to Altersentlastungsbetrag', () => {
        const zvE = 45000;

        // This test requires us to likely change the signature of calculateIncomeTax OR 
        // add a helper that adjusts zvE before calling it.
        // Let's assume we pass age to a new calculateTax function or similar.
        // For now, testing the existing function won't work perfectly until we refactor.
        // We will call the NEW signature we plan to implement: calculateIncomeTax(zvE, age)

        const taxStandard = TaxCalculator2026.calculateIncomeTax(zvE);

        // @ts-ignore - We will implement this optional arg
        const taxSenior = TaxCalculator2026.calculateIncomeTax(zvE, 1.0, 65);

        expect(taxSenior).toBeLessThan(taxStandard);
    });
});
