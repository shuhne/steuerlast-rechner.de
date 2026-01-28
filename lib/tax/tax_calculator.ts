export class TaxCalculator2026 {
    // 2026 Constants
    static readonly GRUNDFREIBETRAG = 12348;
    static readonly ZONE_2_LIMIT = 17799;
    static readonly ZONE_3_LIMIT = 69878;
    static readonly ZONE_4_LIMIT = 277825;

    // Soli
    static readonly SOLI_FREIGRENZE_SINGLE = 20350;  // Tax amount, not income
    static readonly SOLI_FREIGRENZE_MARRIED = 40700;

    /**
     * Calculates the German Income Tax (ESt) for 2026 based on §32a EStG.
     * Input: zu versteuerndes Einkommen (zvE)
     * Output: Income Tax Amount (yearly)
     */
    static calculateIncomeTax(zvE: number, factor: number = 1.0, age: number = 30): number {
        // Round down zvE to full Euro first (as per German Tax Law)
        let zvE_floored = Math.floor(zvE);

        // Altersentlastungsbetrag (Simplified for 2026 Calculation)
        // § 24a EStG: Applicable if age > 64 (completed 64th year before start of tax year)
        if (age > 64) {
            // Values for 2026 (based on cohort 2025/2026 trend)
            // Percentage: 12.8%, Max: 608 EUR
            // This applies to wage income (Arbeitslohn) mostly, simplification involves applying it to zvE part approx.
            // Strictly it applies to "Einkünfte aus nichtselbstständiger Arbeit" etc.
            // We assume mostly wage income here.
            const reliefPercent = 0.128;
            const reliefMax = 608;

            const relief = Math.min(zvE_floored * reliefPercent, reliefMax);
            zvE_floored = Math.floor(Math.max(0, zvE_floored - relief));
        }

        if (zvE_floored <= this.GRUNDFREIBETRAG) {
            return 0.0;
        }

        let tax = 0.0;
        if (zvE_floored <= this.ZONE_2_LIMIT) {
            const y = (zvE_floored - this.GRUNDFREIBETRAG) / 10000.0;
            tax = (914.51 * y + 1400) * y;
            tax = Math.floor(tax);

        } else if (zvE_floored <= this.ZONE_3_LIMIT) {
            const z = (zvE_floored - this.ZONE_2_LIMIT) / 10000.0;
            tax = (173.10 * z + 2397) * z + 1034.87;
            tax = Math.floor(tax);

        } else if (zvE_floored <= this.ZONE_4_LIMIT) {
            tax = 0.42 * zvE_floored - 11135.63;
            tax = Math.floor(tax);

        } else {
            tax = 0.45 * zvE_floored - 19470.38;
            tax = Math.floor(tax);
        }

        return tax * factor;
    }

    /**
     * Calculates Solidaritätszuschlag 2026.
     * Thresholds refer to the Income Tax amount!
     */
    static calculateSoli(incomeTax: number, splitting: boolean = false, factor: number = 1.0): number {
        const limit = splitting ? this.SOLI_FREIGRENZE_MARRIED : this.SOLI_FREIGRENZE_SINGLE;

        if (incomeTax <= limit) {
            return 0.0;
        }

        // Milderungszone logic:
        // If tax is above limit, Soli is min(5.5% of tax, 11.9% of (tax - limit))
        const soliFull = 0.055 * incomeTax;
        const soliMild = 0.119 * (incomeTax - limit);

        const soli = Math.min(soliFull, soliMild);
        return Number((soli * factor).toFixed(2));
    }

    /**
     * Calculates Church Tax.
     * BY/BW = 8%, others = 9%.
     */
    static calculateChurchTax(incomeTax: number, state: string): number {
        let rate = 0.09;
        if (['BY', 'BW'].includes(state)) {
            rate = 0.08;
        }

        const kist = incomeTax * rate;
        // Note: Kappung (capping) logic is intentionally omitted

        return Number(kist.toFixed(2));
    }

    /**
     * Calculates the marginal tax rate (Grenzsteuersatz) by derivative or small delta.
     * Using small delta (1 Euro) for simplicity and accuracy in discrete steps.
     */
    static getMarginalTaxRate(zvE: number): number {
        if (zvE < this.GRUNDFREIBETRAG) {
            return 0.0;
        }

        const taxNow = this.calculateIncomeTax(zvE);
        const taxNext = this.calculateIncomeTax(zvE + 100); // +100 to smooth out rounding effects

        return Number(((taxNext - taxNow) / 100 * 100).toFixed(2)); // in Percent
    }
}
