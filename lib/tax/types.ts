export interface SimulationSettings {
    rv_rate_total?: number | null;
    av_rate_total?: number | null;
    kv_rate_add?: number | null;
    pv_rate_total?: number | null;
    income_tax_factor: number;
    soli_factor: number;
}

export interface TaxRequest {
    gross_income: number;
    tax_class: number;
    church_tax: boolean;
    state: string;
    period: 'yearly' | 'monthly';
    has_children?: boolean;
    child_count?: number;
    age?: number; // New param for 2026 calculation
    year_of_birth?: number; // Deprecated or kept for compat, prefer age for simplicity in frontend
    health_insurance_type?: 'statutory' | 'private';
    kv_add_rate?: number;
    private_kv_amount?: number;
    simulation_settings?: SimulationSettings | null;
}

export interface TaxResult {
    gross_income: number;
    taxable_income: number;
    income_tax: number;
    soli: number;
    church_tax: number;
    total_tax: number;

    kv_employee: number;
    pv_employee: number;
    rv_employee: number;
    av_employee: number;
    total_social_security: number;

    net_income: number;
    net_income_monthly: number;

    tax_rate_average: number;
    tax_rate_marginal: number;
}

export type ScenarioResult = Record<string, TaxResult>;

export interface CurvePoint {
    factor_percent: number;
    gross: number;
    net: number;
    marginal_tax: number;
}
