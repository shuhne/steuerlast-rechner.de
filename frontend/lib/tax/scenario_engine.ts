import { TaxRequest, TaxResult, CurvePoint, ScenarioResult } from './types';
import { TaxCalculator2026 } from './tax_calculator';
import { SocialSecurity2026 } from './social_security';

export class ScenarioEngine {

    /**
     * Runs the full tax calculation for a single request.
     */
    static calculateTaxRequest(req: TaxRequest): TaxResult {
        const gross = req.gross_income;

        // 0. Settings
        const simSettings = req.simulation_settings || null;

        // 1. Social Security
        // Default year_of_birth if missing (should be handled by validation, but safe fallback)
        const yearOfBirth = req.year_of_birth ?? 1990;

        const sv = SocialSecurity2026.calculateSvContributions(
            gross,
            req.state,
            req.kv_add_rate || 1.7, // Default 1.7 if missing
            req.has_children || false,
            req.child_count || 0,
            yearOfBirth,
            req.health_insurance_type === "private",
            req.private_kv_amount || null,
            simSettings
        );

        const totalSv = sv.rv + sv.av + sv.kv + sv.pv;

        // 2. Taxable Income (Simplified)
        // zvE = Gross - SV (Employee Share) - Werbungskosten (Standard 1230€) - Sonderausgaben (Pauschal 36€)
        // Note: Vorsorgeaufwendungen are deductible. 
        // Simplified: Deductible SV = KV (minus claim for sick pay ~4%) + PV + RV. 

        const deductibleRv = sv.rv;
        const deductibleKvPv = (sv.kv + sv.pv); // Simplified

        // Werbungskostenpauschale 2023+: 1230 Euro
        const WERBUNGSKOSTEN = 1230.0;
        // Sonderausgaben Pauschbetrag
        const SONDERAUSGABEN = 36.0;

        const deductions = deductibleRv + deductibleKvPv + WERBUNGSKOSTEN + SONDERAUSGABEN;
        const zvE = Math.max(0, gross - deductions);

        // 3. Taxes
        // Modifiers
        let taxFactor = 1.0;
        let soliFactor = 1.0;
        if (simSettings) {
            taxFactor = simSettings.income_tax_factor;
            soliFactor = simSettings.soli_factor;
        }

        const est = TaxCalculator2026.calculateIncomeTax(zvE, taxFactor);
        const soli = TaxCalculator2026.calculateSoli(est, false, soliFactor);
        let kist = 0.0;
        if (req.church_tax) {
            kist = TaxCalculator2026.calculateChurchTax(est, req.state);
        }

        const totalTax = est + soli + kist;

        // 4. Net
        const net = gross - totalSv - totalTax;

        // 5. KPIs
        const avgTaxRate = gross > 0 ? (totalTax / gross * 100) : 0;
        const marginalRate = TaxCalculator2026.getMarginalTaxRate(zvE);

        return {
            gross_income: Number(gross.toFixed(2)),
            taxable_income: Number(zvE.toFixed(2)),
            income_tax: Number(est.toFixed(2)),
            soli: Number(soli.toFixed(2)),
            church_tax: Number(kist.toFixed(2)),
            total_tax: Number(totalTax.toFixed(2)),
            kv_employee: sv.kv,
            pv_employee: sv.pv,
            rv_employee: sv.rv,
            av_employee: sv.av,
            total_social_security: Number(totalSv.toFixed(2)),
            net_income: Number(net.toFixed(2)),
            net_income_monthly: Number((net / 12).toFixed(2)),
            tax_rate_average: Number(avgTaxRate.toFixed(2)),
            tax_rate_marginal: Number(marginalRate.toFixed(2))
        };
    }

    /**
     * Generates standard scenarios based on the input.
     * Desired Output Order for Chart:
     * 1. 90% Time
     * 2. 80% Time
     * 3. 70% Time
     * 4. 50% Time
     */
    static runScenarios(baseReq: TaxRequest): ScenarioResult {
        const results: ScenarioResult = {};

        // Helper to clone request
        const cloneReq = (req: TaxRequest, percentage: number): TaxRequest => {
            return {
                ...req,
                gross_income: req.gross_income * percentage
            };
        };

        // 1. 90%
        results["A_Time_90"] = this.calculateTaxRequest(cloneReq(baseReq, 0.90));

        // 2. 80%
        results["B_Time_80"] = this.calculateTaxRequest(cloneReq(baseReq, 0.80));

        // 3. 70%
        results["C_Time_70"] = this.calculateTaxRequest(cloneReq(baseReq, 0.70));

        // 4. 50% Time (Halftags)
        results["D_Time_50"] = this.calculateTaxRequest(cloneReq(baseReq, 0.50));

        return results;
    }

    /**
     * Generates a curve from 50% to 150% of the base income.
     */
    static generateCurve(baseReq: TaxRequest, steps: number = 20): CurvePoint[] {
        const points: CurvePoint[] = [];
        const baseGross = baseReq.gross_income;
        const startFactor = 0.5;
        const endFactor = 1.5;

        const stepSize = (endFactor - startFactor) / steps;

        let current = startFactor;
        while (current <= endFactor + 0.001) {
            const req = { ...baseReq, gross_income: baseGross * current };
            const res = this.calculateTaxRequest(req);

            points.push({
                factor_percent: Math.round(current * 100),
                gross: res.gross_income,
                net: res.net_income,
                marginal_tax: res.tax_rate_marginal
            });
            current += stepSize;
        }
        return points;
    }
}
