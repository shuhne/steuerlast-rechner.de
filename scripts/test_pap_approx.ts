import fs from 'fs';

const data = JSON.parse(fs.readFileSync('./scripts/reference_40_cases.json', 'utf-8'));
const cases = data.cases;
const results = data.results;

// Tariff 2026
function calculateESt(zvE: number): number {
    let floored = Math.floor(zvE);
    if (floored <= 12348) return 0;

    let tax = 0;
    if (floored <= 17799) {
        let y = (floored - 12348) / 10000;
        tax = (914.51 * y + 1400) * y;
    } else if (floored <= 69878) {
        let z = (floored - 17799) / 10000;
        tax = (173.10 * z + 2397) * z + 1034.87;
    } else if (floored <= 277825) {
        tax = 0.42 * floored - 11135.63;
    } else {
        tax = 0.45 * floored - 19470.38;
    }
    return Math.floor(tax); // ESt is floored
}

function calcLohnsteuer(tc: any) {
    let re4 = tc.gross;

    // Werbungskosten & Sonderausgaben
    let wkb = 1230;
    let sap = 36;
    if (tc.class === 2) wkb = 1230;
    // ...

    // Altersentlastungsbetrag
    let age = tc.age; // age at end of 2026
    let alters = 0;
    if (age >= 65) {
        // 2026 rate is 12.8%, max 608 Euro
        alters = Math.min(608, Math.floor(re4 * 0.128));
    }

    let bem = re4 - alters;

    // Vorsorgepauschale
    // 1. RV
    let rvBem = Math.min(bem, 101400);
    // 2026: 100% of 9.3%
    let vspRv = rvBem * 0.093;

    // 2. KV / PV
    let kvBem = Math.min(bem, 69750);
    let vspKvPv = 0;

    if (tc.kv === 'gesetzlich') {
        let kvSatz = 0.07 + (tc.kv_add / 100 / 2);
        let pvSatz = 0.017;
        if (tc.state === 'sachsen') {
            pvSatz = 0.022; // Sachsen employee pays more
        }

        let childless = tc.children === 0 && age > 23;
        if (childless) pvSatz += 0.006;

        let childInt = Math.floor(tc.children);
        if (childInt > 1) {
            pvSatz -= Math.min(childInt - 1, 4) * 0.0025;
        }

        vspKvPv = kvBem * (kvSatz + pvSatz);
    } else {
        // PKV
        // Usually Lohnsteuer calculates with Basisabsicherung.
        // Assuming user input * 12 * 0.8 as Basisabsicherung?
        // Let's assume the full premium or a standard 80% for Basis.
        let monthly = tc.pkv_monthly;
        vspKvPv = monthly * 12 * 0.8; // Rough estimate for PKV
    }

    // Mindestvorsorgepauschale für KV/PV
    let minVspKvPv = 0;
    if (tc.class === 1 || tc.class === 2 || tc.class === 4 || tc.class === 5 || tc.class === 6) {
        minVspKvPv = Math.min(bem * 0.12, 1900);
    } else if (tc.class === 3) {
        minVspKvPv = Math.min(bem * 0.12, 3000);
    }

    // Günstigerprüfung KV/PV
    let finalVspKvPv = Math.max(vspKvPv, minVspKvPv);

    // Sum Vorsorgepauschale
    // Rounding is specific in BMF (often CENTS, CEIL/FLOOR). We just float for now.
    let vsp = Math.ceil(vspRv) + Math.ceil(finalVspKvPv); // BMF often rounds up the parts

    let zve = Math.max(0, bem - wkb - sap - vsp);

    // Tax calculation
    let tax = calculateESt(zve);
    return tax;
}

let fails = 0;
for (let i = 0; i < cases.length; i++) {
    const tc = cases[i];
    if (tc.class !== 1) continue; // Just test class 1 for now
    if (tc.kv !== 'gesetzlich') continue;

    const ref = results.find((r: any) => r.id === tc.id);
    let myTax = calcLohnsteuer(tc);

    let diff = Math.abs(myTax - ref.income_tax);
    if (diff > 2) {
        console.log(`Case ${tc.id} (${tc.gross}€): MyTax ${myTax} vs Ref ${ref.income_tax} (Diff: ${diff})`);
        fails++;
    }
}

console.log(`\nFailed Class 1 Statutory Cases: ${fails}`);
