import { ScenarioEngine } from '../lib/tax/scenario_engine';
import { TaxRequest } from '../lib/tax/types';

const testCases: TaxRequest[] = [
    { period: 'yearly', tax_class: 1, gross_income: 30000, state: 'BW', church_tax: true, age: 25, health_insurance_type: 'statutory', has_children: false, child_count: 0 },
    { period: 'yearly', tax_class: 1, gross_income: 45000, state: 'BE', church_tax: false, age: 30, health_insurance_type: 'statutory', has_children: false, child_count: 0 },
    { period: 'yearly', tax_class: 1, gross_income: 60000, state: 'BY', church_tax: true, age: 35, health_insurance_type: 'statutory', has_children: true, child_count: 1 },
    { period: 'yearly', tax_class: 1, gross_income: 80000, state: 'HE', church_tax: false, age: 40, health_insurance_type: 'statutory', has_children: true, child_count: 2 },
    { period: 'yearly', tax_class: 1, gross_income: 100000, state: 'BW', church_tax: true, age: 45, health_insurance_type: 'private', private_kv_amount: 600, has_children: false, child_count: 0 },
    { period: 'yearly', tax_class: 1, gross_income: 150000, state: 'NW', church_tax: false, age: 50, health_insurance_type: 'private', private_kv_amount: 800, has_children: true, child_count: 3 },
    { period: 'yearly', tax_class: 1, gross_income: 50000, state: 'SN', church_tax: true, age: 66, health_insurance_type: 'statutory', has_children: false, child_count: 0 },
    { period: 'yearly', tax_class: 1, gross_income: 36000, state: 'HB', church_tax: false, age: 28, health_insurance_type: 'statutory', kv_add_rate: 1.5, has_children: false, child_count: 0 },
    { period: 'yearly', tax_class: 1, gross_income: 120000, state: 'NI', church_tax: true, age: 38, health_insurance_type: 'statutory', kv_add_rate: 2.0, has_children: false, child_count: 0 },
    { period: 'yearly', tax_class: 1, gross_income: 200000, state: 'HH', church_tax: false, age: 55, health_insurance_type: 'private', private_kv_amount: 1000, has_children: false, child_count: 0 },
];

console.log("Running 10 Test Cases for 2026 Tax Calculator\n");

const results = testCases.map((tc, idx) => {
    const res = ScenarioEngine.calculateTaxRequest(tc);
    return {
        id: idx + 1,
        gross: res.gross_income,
        net: res.net_income,
        taxable: res.taxable_income,
        income_tax: res.income_tax,
        soli: res.soli,
        church_tax: res.church_tax,
        sv_total: res.total_social_security
    };
});

console.table(results);
