import { TaxResult } from './types';

export class TaxCalculator1958 {
    // 1958 Constants in Deutsche Mark (DM)
    static readonly GRUNDFREIBETRAG_DM = 1680;
    static readonly ZONE_2_LIMIT_DM = 8009;
    static readonly ZONE_3_LIMIT_DM = 23999;
    static readonly ZONE_4_LIMIT_DM = 110039;

    // 1958 Social Security Rates (Employee Shares)
    static readonly RV_RATE_1958 = 0.07; // Pension Insurance (total 14%)
    static readonly AV_RATE_1958 = 0.005; // Unemployment Insurance (total 1%)
    static readonly KV_RATE_1958 = 0.0325; // Health Insurance (average total 6.5%)
    static readonly PV_RATE_1958 = 0.0; // Care Insurance (none in 1958)

    // 1958 Social Security Ceilings (Beitragsbemessungsgrenzen) in DM
    static readonly RV_AV_CEILING_DM = 9000;
    static readonly KV_CEILING_DM = 6750;

    // 1958 Lump-sum Deductions in DM
    static readonly WERBUNGSKOSTEN_DM = 564;
    static readonly SONDERAUSGABEN_DM = 36; // Simplified

    // Conversion and Scaling Constants
    static readonly DM_TO_EUR_RATE = 1.95583;
    static readonly BUNDESBANK_INFLATION_FACTOR = 2.86; // 1 DM 1958 = 2.86 EUR 2026 (price-adjusted)
    static readonly AVERAGE_WAGE_1958_DM = 5330;
    static readonly AVERAGE_WAGE_2026_EUR = 51944;

    /**
     * Calculates the DM-to-EUR or EUR-to-DM conversion and scaling factor based on the chosen mode.
     */
    static getScalingFactors(mode: 'wage' | 'price'): {
        eurToDmFactor: number; // Multiply 2026 gross in EUR by this to get 1958 DM
        dmToEurFactor: number; // Multiply 1958 amount in DM by this to get 2026 equivalent EUR
    } {
        if (mode === 'wage') {
            // Lohnbereinigt: Based on average wage growth
            // Gross_DM = Gross_EUR * (AVERAGE_WAGE_1958_DM / AVERAGE_WAGE_2026_EUR)
            const eurToDmFactor = this.AVERAGE_WAGE_1958_DM / this.AVERAGE_WAGE_2026_EUR;
            const dmToEurFactor = this.AVERAGE_WAGE_2026_EUR / this.AVERAGE_WAGE_1958_DM;
            return { eurToDmFactor, dmToEurFactor };
        } else {
            // Preisbereinigt: Based on CPI / Inflation (1 DM 1958 = 2.86 EUR 2026)
            // Gross_DM = Gross_EUR / 2.86
            const eurToDmFactor = 1.0 / this.BUNDLEBANK_INFLATION_FACTOR_FIX();
            const dmToEurFactor = this.BUNDLEBANK_INFLATION_FACTOR_FIX();
            return { eurToDmFactor, dmToEurFactor };
        }
    }

    private static BUNDLEBANK_INFLATION_FACTOR_FIX() {
        return this.BUNDESBANK_INFLATION_FACTOR;
    }

    /**
     * Calculates the 1958 German Income Tax (ESt) for a single individual in DM.
     * Input: zu versteuerndes Einkommen (zvE) in DM.
     */
    static calculateIncomeTaxDM(zvE: number): number {
        // Round down zvE to full DM as per historical standard
        const zvE_floored = Math.floor(Math.max(0, zvE));

        if (zvE_floored <= this.GRUNDFREIBETRAG_DM) {
            return 0.0;
        }

        let tax = 0.0;

        if (zvE_floored <= this.ZONE_2_LIMIT_DM) {
            tax = 0.20 * (zvE_floored - this.GRUNDFREIBETRAG_DM);
        } else if (zvE_floored <= this.ZONE_3_LIMIT_DM) {
            const Y = (zvE_floored - 8000) / 1000;
            tax = 1264 + 272 * Y + 2.9 * Math.pow(Y, 2);
        } else if (zvE_floored <= this.ZONE_4_LIMIT_DM) {
            const Y = (zvE_floored - 24000) / 1000;
            tax = 6358 + 382 * Y + 1.572 * Math.pow(Y, 2) - 0.006 * Math.pow(Y, 3);
        } else {
            tax = 0.53 * zvE_floored - 11281;
        }

        return Math.floor(Math.max(0, tax));
    }

    /**
     * Calculates the 1958 Income Tax (ESt) in DM, supporting joint splitting.
     */
    static calculateIncomeTaxSplittingDM(zvE: number, taxClass: number): number {
        // Splitting applies to married classes (3, 4, 5)
        const isSplitting = [3, 4, 5].includes(taxClass);

        if (isSplitting) {
            const halfTax = this.calculateIncomeTaxDM(zvE / 2);
            return halfTax * 2;
        }

        return this.calculateIncomeTaxDM(zvE);
    }

    /**
     * Main method to calculate the historical 1958 tax and social security.
     * Takes 2026 gross yearly income in EUR and returns a full TaxResult scaled to 2026 EUR.
     */
    static calculate1958(
        grossEur: number,
        taxClass: number,
        churchTax: boolean,
        state: string,
        mode: 'wage' | 'price'
    ): TaxResult {
        const { eurToDmFactor, dmToEurFactor } = this.getScalingFactors(mode);

        // 1. Convert Gross Income to 1958 DM
        const grossDm = grossEur * eurToDmFactor;

        // 2. Social Security Employee Contributions in 1958 DM
        const rvDm = this.RV_RATE_1958 * Math.min(grossDm, this.RV_AV_CEILING_DM);
        const avDm = this.AV_RATE_1958 * Math.min(grossDm, this.RV_AV_CEILING_DM);
        const kvDm = this.KV_RATE_1958 * Math.min(grossDm, this.KV_CEILING_DM);
        const pvDm = 0.0;

        const totalSvDm = rvDm + avDm + kvDm;

        // 3. Taxable Income (zvE) in 1958 DM
        // deductions = SV contributions + Werbungskosten (564 DM) + Sonderausgaben (36 DM)
        const deductionsDm = totalSvDm + this.WERBUNGSKOSTEN_DM + this.SONDERAUSGABEN_DM;
        const zvEDm = Math.max(0, grossDm - deductionsDm);

        // 4. Calculate Income Tax in 1958 DM
        const incomeTaxDm = this.calculateIncomeTaxSplittingDM(zvEDm, taxClass);

        // 5. Church Tax in 1958 DM (8% in BY/BW, 9% elsewhere)
        let churchTaxRate = 0.09;
        if (['BY', 'BW'].includes(state.toUpperCase())) {
            churchTaxRate = 0.08;
        }
        const churchTaxDm = churchTax ? Math.round(incomeTaxDm * churchTaxRate * 100) / 100 : 0.0;

        const totalTaxDm = incomeTaxDm + churchTaxDm;

        // 6. Net Income in 1958 DM
        const netDm = grossDm - totalSvDm - totalTaxDm;

        // 7. Scale everything back to 2026 EUR equivalents
        const scale = (valDm: number) => Number((valDm * dmToEurFactor).toFixed(2));

        const grossEurResult = scale(grossDm);
        const taxableIncomeEur = scale(zvEDm);
        const incomeTaxEur = scale(incomeTaxDm);
        const churchTaxEur = scale(churchTaxDm);
        const totalTaxEur = scale(totalTaxDm);
        const rvEur = scale(rvDm);
        const avEur = scale(avDm);
        const kvEur = scale(kvDm);
        const pvEur = scale(pvDm);
        const totalSvEur = scale(totalSvDm);
        const netEur = scale(netDm);

        // 8. Calculate Rates
        const avgTaxRate = grossEurResult > 0 ? (totalTaxEur / grossEurResult * 100) : 0;

        // Calculate Marginal Rate: derivative of the ESt function in DM at the zvE point
        const marginalRate = this.getMarginalTaxRate(zvEDm, taxClass);

        return {
            gross_income: Number(grossEur.toFixed(2)), // Keep original input gross
            taxable_income: taxableIncomeEur,
            income_tax: incomeTaxEur,
            soli: 0.0, // No Soli in 1958
            church_tax: churchTaxEur,
            total_tax: totalTaxEur,
            kv_employee: kvEur,
            pv_employee: pvEur,
            rv_employee: rvEur,
            av_employee: avEur,
            total_social_security: totalSvEur,
            net_income: netEur,
            net_income_monthly: Number((netEur / 12).toFixed(2)),
            tax_rate_average: Number(avgTaxRate.toFixed(2)),
            tax_rate_marginal: Number(marginalRate.toFixed(2))
        };
    }

    /**
     * Calculates the marginal tax rate in 1958 at the given zvE in DM.
     */
    static getMarginalTaxRate(zvEDm: number, taxClass: number): number {
        const isSplitting = [3, 4, 5].includes(taxClass);

        // Calculate ESt at zvEDm and zvEDm + 100 DM to smooth out rounding and get slope
        const zvE1 = zvEDm;
        const zvE2 = zvEDm + 100;

        const tax1 = this.calculateIncomeTaxSplittingDM(zvE1, taxClass);
        const tax2 = this.calculateIncomeTaxSplittingDM(zvE2, taxClass);

        const marginal = ((tax2 - tax1) / 100) * 100;
        return Math.min(53.0, Math.max(0, marginal));
    }
}
