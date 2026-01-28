import { SimulationSettings } from './types';

export class SocialSecurity2026 {
    // BBG 2026 (Annual)
    static readonly BBG_KV_PV = 69750.0;  // Kranken-/Pflegeversicherung
    static readonly BBG_RV_AV = 101400.0; // Renten-/Arbeitslosenversicherung

    // Rates 2026 (General)
    static readonly RATE_KV_GEN = 0.146;
    static readonly RATE_RV = 0.186;
    static readonly RATE_AV = 0.026;
    static readonly RATE_PV_GEN = 0.036;

    // PV Spec
    static readonly PV_SURCHARGE_CHILDLESS = 0.006;
    static readonly PV_CHILD_RELIEF = 0.0025;
    static readonly PV_CHILD_RELIEF_MAX_CHILDREN = 5;

    // Sachsen Spec
    static readonly PV_SACHSEN_AG_SHARE = 0.012;

    static calculateSvContributions(
        grossIncome: number,
        state: string,
        kvAddRate: number,
        hasChildren: boolean,
        childCount: number,
        yearOfBirth: number,
        isPrivateKv: boolean = false,
        privateKvAmount: number | null = null,
        simSettings: SimulationSettings | null = null
    ): { rv: number; av: number; kv: number; pv: number } {

        // Override constants if simulation settings exist
        let rateRv = this.RATE_RV;
        let rateAv = this.RATE_AV;
        let ratePvGen = this.RATE_PV_GEN;
        let finalKvAddRate = kvAddRate;

        if (simSettings) {
            if (simSettings.rv_rate_total !== undefined && simSettings.rv_rate_total !== null) {
                rateRv = simSettings.rv_rate_total;
            }
            if (simSettings.av_rate_total !== undefined && simSettings.av_rate_total !== null) {
                rateAv = simSettings.av_rate_total;
            }
            if (simSettings.pv_rate_total !== undefined && simSettings.pv_rate_total !== null) {
                ratePvGen = simSettings.pv_rate_total;
            }
            if (simSettings.kv_rate_add !== undefined && simSettings.kv_rate_add !== null) {
                // Determine if we need to convert?
                // Logic: Python code assumed simSettings.kv_rate_add might be stored as e.g. 0.07 (7%).
                // And existing input kvAddRate comes as e.g. 1.7 (1.7%).
                // But in React frontend, we pass everything consistently properly before calling API.
                // Assuming consistency: if simSettings stores 0.07, we use 7.0 for calculation if we multiply by 100.
                finalKvAddRate = simSettings.kv_rate_add * 100;
            }
        }

        // --- Rentenversicherung (RV) ---
        const rvBasis = Math.min(grossIncome, this.BBG_RV_AV);
        const rvEmployee = rvBasis * (rateRv / 2);

        // --- Arbeitslosenversicherung (AV) ---
        const avBasis = Math.min(grossIncome, this.BBG_RV_AV);
        const avEmployee = avBasis * (rateAv / 2);

        // --- Krankenversicherung (KV) ---
        let kvEmployee = 0.0;
        if (!isPrivateKv) {
            const kvBasis = Math.min(grossIncome, this.BBG_KV_PV);
            // General Rate 14.6% -> 7.3% Employee + 7.3% Employer
            const kvEmployeeRate = (this.RATE_KV_GEN / 2) + (finalKvAddRate / 100 / 2);
            kvEmployee = kvBasis * kvEmployeeRate;
        } else {
            if (privateKvAmount) {
                kvEmployee = privateKvAmount * 12;
            } else {
                kvEmployee = 0.0;
            }
        }

        // --- Pflegeversicherung (PV) ---
        const pvBasis = Math.min(grossIncome, this.BBG_KV_PV);
        const currentPvRate = ratePvGen;

        let pvAgRate: number;
        let pvAnBaseRate: number;

        // Determine Base Distribution based on current rate
        if (state === "SN") {
            // Sachsen specific logic
            if (simSettings && simSettings.pv_rate_total !== null && simSettings.pv_rate_total !== undefined) {
                pvAgRate = 0.012; // Keep fixed 1.2% AG share in simulation too (simplified)
            } else {
                pvAgRate = this.PV_SACHSEN_AG_SHARE;
            }
            pvAnBaseRate = currentPvRate - pvAgRate;
        } else {
            // Standard 50/50 split of the base rate
            pvAgRate = currentPvRate / 2;
            pvAnBaseRate = currentPvRate / 2;
        }

        // Surcharge (Zuschlag für Kinderlose)
        const age = 2026 - yearOfBirth;
        let isChildlessSurcharge = false;
        if (!hasChildren && age > 23) {
            isChildlessSurcharge = true;
        }

        if (isChildlessSurcharge) {
            pvAnBaseRate += this.PV_SURCHARGE_CHILDLESS;
        }

        // Relief (Abschlag)
        let relief = 0.0;
        if (hasChildren && childCount >= 2) {
            const eligibleChildrenForRelief = Math.min(childCount, this.PV_CHILD_RELIEF_MAX_CHILDREN) - 1;
            relief = eligibleChildrenForRelief * this.PV_CHILD_RELIEF;
        }

        const pvAnFinalRate = Math.max(0, pvAnBaseRate - relief);

        let pvEmployee = 0.0;
        if (!isPrivateKv) {
            pvEmployee = pvBasis * pvAnFinalRate;
        }

        return {
            rv: Number(rvEmployee.toFixed(2)),
            av: Number(avEmployee.toFixed(2)),
            kv: Number(kvEmployee.toFixed(2)),
            pv: Number(pvEmployee.toFixed(2))
        };
    }
}
