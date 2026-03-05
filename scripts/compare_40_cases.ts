import fs from 'fs';
import { ScenarioEngine } from '../lib/tax/scenario_engine';
import { TaxRequest } from '../lib/tax/types';

const data = JSON.parse(fs.readFileSync('./scripts/reference_40_cases.json', 'utf-8'));
const cases = data.cases;
const results = data.results;

console.log("Comparing 40 Test Cases vs Local 2026 Calculator\n");

let totalCases = 0;
let incomeTaxFails = 0;
let soliFails = 0;
let churchFails = 0;
let svFails = 0;

for (let i = 0; i < cases.length; i++) {
    const tc = cases[i];
    const ref = results.find((r: any) => r.id === tc.id);
    if (!ref) continue;

    const req: TaxRequest = {
        period: 'yearly',
        tax_class: tc.class,
        gross_income: tc.gross,
        state: tc.state.toUpperCase().substring(0, 2), // Approximation, might need map
        church_tax: tc.church,
        age: tc.age,
        health_insurance_type: tc.kv === 'gesetzlich' ? 'statutory' : 'private',
        kv_add_rate: tc.kv_add,
        private_kv_amount: tc.pkv_monthly,
        has_children: tc.children > 0,
        child_count: tc.children
    };

    // State mapping fixes
    const stateMap: Record<string, string> = {
        'baden-wuerttemberg': 'BW', 'bayern': 'BY', 'berlin': 'BE', 'brandenburg': 'BB',
        'bremen': 'HB', 'hamburg': 'HH', 'hessen': 'HE', 'mecklenburg-vorpommern': 'MV',
        'niedersachsen': 'NI', 'nordrhein-westfalen': 'NW', 'rheinland-pfalz': 'RP',
        'saarland': 'SL', 'sachsen': 'SN', 'sachsen-anhalt': 'ST', 'schleswig-holstein': 'SH',
        'thueringen': 'TH'
    };
    req.state = stateMap[tc.state];

    const local = ScenarioEngine.calculateTaxRequest(req);

    totalCases++;

    const isMatch = (a: number, b: number, tolerance = 2.0) => Math.abs(a - b) <= tolerance;

    const refSv = ref.kv + ref.pv + ref.rv + ref.av;
    const localSv = local.total_social_security;

    let hasDiff = false;
    let errLog = `--- Case ${tc.id}: ${tc.gross}€, Class ${tc.class}, ${req.state}, Child: ${tc.children}, PKV: ${tc.kv === 'privat_versichert'} ---\n`;

    // We only expect our calculator to match Tax Class 1 (and maybe 4)
    if (tc.class !== 1 && tc.class !== 4) {
        errLog += `  [INFO] Skipping exact tax match enforcement for Class ${tc.class} (Local supports basic tariff)\n`;
    } else {
        if (!isMatch(local.income_tax, ref.income_tax)) {
            errLog += `  Income Tax mismatch: Local ${local.income_tax} vs Ref ${ref.income_tax}\n`;
            hasDiff = true;
            incomeTaxFails++;
        }
        if (!isMatch(local.church_tax, ref.church_tax)) {
            errLog += `  Church Tax mismatch: Local ${local.church_tax} vs Ref ${ref.church_tax}\n`;
            hasDiff = true;
            churchFails++;
        }
    }

    if (!isMatch(local.soli, ref.soli)) {
        errLog += `  Soli mismatch: Local ${local.soli} vs Ref ${ref.soli}\n`;
        hasDiff = true;
        if (tc.class === 1 || tc.class === 4) soliFails++;
    }

    // Social Security should match for all classes!
    if (!isMatch(localSv, refSv, 5.0)) { // 5 Euro tolerance due to monthly rounding vs yearly rounding
        errLog += `  SV Total mismatch: Local ${localSv} vs Ref ${refSv} (KV=${local.kv_employee}/${ref.kv}, PV=${local.pv_employee}/${ref.pv}, RV=${local.rv_employee}/${ref.rv}, AV=${local.av_employee}/${ref.av})\n`;
        hasDiff = true;
        svFails++;
    }

    if (hasDiff) {
        console.log(errLog);
    }
}

console.log(`\nSummary: 
Total Cases Evaluated: ${totalCases}
Income Tax Fails (Class 1/4): ${incomeTaxFails}
Soli Fails (Class 1/4): ${soliFails}
Church Tax Fails (Class 1/4): ${churchFails}
Social Security Fails (All): ${svFails}
`);
