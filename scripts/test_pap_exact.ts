import fs from 'fs';
import { Lohnsteuer2026Big } from '../lib/tax/Lohnsteuer2026';
import Big from 'big.js';

const data = JSON.parse(fs.readFileSync('./scripts/reference_40_cases.json', 'utf-8'));
const cases = data.cases;
const results = data.results;

let fails = 0;
let solsFails = 0;

for (let i = 0; i < cases.length; i++) {
    const tc = cases[i];
    const ref = results.find((r: any) => r.id === tc.id);

    let lst: any = new Lohnsteuer2026Big();

    // Init all expected inputs to 0
    lst.VBEZ = new Big(0);
    lst.VBEZM = new Big(0);
    lst.VBEZS = new Big(0);
    lst.LZZFREIB = new Big(0);
    lst.LZZHINZU = new Big(0);
    lst.VKAPA = new Big(0);
    lst.VMT = new Big(0);
    lst.ZMVB = 0;
    lst.JRE4 = new Big(0);
    lst.JVBEZ = new Big(0);
    lst.SONSTB = new Big(0);
    lst.STERBE = new Big(0);
    lst.VKVSONST = new Big(0);
    lst.ENTSCH = new Big(0);
    lst.VJAHR = 0;
    lst.PKPV = new Big(0);
    lst.SONSTENT = new Big(0);
    lst.JRE4ENT = new Big(0);
    lst.MBV = new Big(0);
    lst.JFREIB = new Big(0);
    lst.JHINZU = new Big(0);
    lst.af = 1; // factor procedure, 1 default
    lst.f = 1.0;
    lst.R = 0; // religion 0
    lst.PVS = 0;
    lst.PVZ = 0;
    lst.KVZ = new Big(0);

    // BMF inputs are mostly in cents, except factors
    lst.RE4 = new Big(tc.gross).mul(100);
    lst.STKL = tc.class;
    lst.LZZ = 1; // 1 = Yearly

    // Church tax indicator (optional in BMF, usually applied standalone on LSt)
    // Age
    if (tc.age > 64) {
        lst.ALTER1 = 1;
        lst.AJAHR = 2026 - Math.floor(tc.age); // Approx year of 64th birthday or year of birth? BMF AJAHR is year of birth + 64? Wait, BMF says AJAHR is the year in which the person turned 64.
        lst.AJAHR = 2026 - tc.age + 64;
    } else {
        lst.ALTER1 = 0;
    }

    // Children
    lst.ZKF = new Big(tc.children);

    // State
    if (tc.state === 'sachsen') {
        lst.PVS = 1;
    }

    // KV
    if (tc.kv === 'gesetzlich') {
        lst.KRV = 0; // 0 = gesetzlich PV
        lst.PKV = 0; // 0 = gesetzlich KV
        lst.KVZ = new Big(tc.kv_add); // in percentage
        // Childless surcharge
        if (tc.age > 23 && tc.children === 0) {
            lst.PVZ = 1;
        }
    } else {
        lst.KRV = 0;
        lst.PKV = 1; // private KV
        // Pass base PKV premium (usually 80% or total) as PKPV in CENTS per month
        lst.PKPV = new Big(tc.pkv_monthly).mul(100);
    }

    lst.calculate();

    let myTax = lst.LSTLZZ.toNumber() / 100;
    let mySoli = lst.SOLZLZZ.toNumber() / 100;

    let diff = Math.abs(myTax - ref.income_tax);
    if (diff > 2) {
        console.log(`Case ${tc.id} (${tc.gross}€, Class ${tc.class}): MyTax ${myTax} vs Ref ${ref.income_tax} (Diff: ${diff})`);
        fails++;
    }

    let soliDiff = Math.abs(mySoli - ref.soli);
    if (soliDiff > 1) {
        console.log(`  Soli mismatch: MySoli ${mySoli} vs Ref ${ref.soli}`);
        solsFails++;
    }
}

console.log(`\nFailed Income Tax Cases: ${fails}`);
console.log(`Failed Soli Cases: ${solsFails}`);
