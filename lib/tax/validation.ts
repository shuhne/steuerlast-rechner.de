import { z } from 'zod';

const GERMAN_STATE_CODES = [
    'BB', 'BE', 'BW', 'BY', 'HB', 'HE', 'HH', 'MV',
    'NI', 'NW', 'RP', 'SH', 'SL', 'SN', 'ST', 'TH',
] as const;

export const SimulationSettingsSchema = z.object({
    rv_rate_total: z.number().min(0).max(100).nullable().optional(),
    av_rate_total: z.number().min(0).max(100).nullable().optional(),
    kv_rate_add: z.number().min(0).max(0.20).nullable().optional(),
    pv_rate_total: z.number().min(0).max(100).nullable().optional(),
    income_tax_factor: z.number().min(0.5).max(3.0),
    soli_factor: z.number().min(0.5).max(3.0),
});

export const TaxRequestSchema = z.object({
    gross_income: z.number().min(0).max(2_000_000),
    tax_class: z.number().int().min(1).max(6),
    church_tax: z.boolean(),
    state: z.enum(GERMAN_STATE_CODES),
    period: z.enum(['yearly', 'monthly']),
    has_children: z.boolean().optional(),
    child_count: z.number().int().min(0).max(20).optional(),
    age: z.number().int().min(0).max(120).optional(),
    year_of_birth: z.number().int().min(1900).max(2026).optional(),
    health_insurance_type: z.enum(['statutory', 'private']).optional(),
    kv_add_rate: z.number().min(0).max(10).optional(),
    private_kv_amount: z.number().min(0).max(10_000).optional(),
    simulation_settings: SimulationSettingsSchema.nullable().optional(),
});

export type ValidatedTaxRequest = z.infer<typeof TaxRequestSchema>;
