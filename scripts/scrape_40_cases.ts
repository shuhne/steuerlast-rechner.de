import { chromium } from 'playwright';
import fs from 'fs';

const TEST_CASES = [
    // Standard Class 1, vary income and state, statutory KV (default 1.7% in 2026? BR-info uses 1.7% by default. User asked for variations, so let's vary KV-Zusatz too)
    { id: 1, gross: 30000, class: 1, state: 'baden-wuerttemberg', church: true, age: 25, kv: 'gesetzlich', kv_add: 1.7, children: 0 },
    { id: 2, gross: 35000, class: 1, state: 'bayern', church: false, age: 30, kv: 'gesetzlich', kv_add: 1.7, children: 0 },
    { id: 3, gross: 40000, class: 1, state: 'berlin', church: true, age: 35, kv: 'gesetzlich', kv_add: 2.0, children: 0 },
    { id: 4, gross: 45000, class: 1, state: 'brandenburg', church: false, age: 40, kv: 'gesetzlich', kv_add: 2.5, children: 0 },
    { id: 5, gross: 50000, class: 1, state: 'bremen', church: true, age: 45, kv: 'gesetzlich', kv_add: 3.0, children: 0 },

    // Varying children
    { id: 6, gross: 55000, class: 1, state: 'hamburg', church: false, age: 32, kv: 'gesetzlich', kv_add: 1.7, children: 0.5 },
    { id: 7, gross: 60000, class: 1, state: 'hessen', church: true, age: 38, kv: 'gesetzlich', kv_add: 1.7, children: 1 },
    { id: 8, gross: 65000, class: 1, state: 'mecklenburg-vorpommern', church: false, age: 42, kv: 'gesetzlich', kv_add: 1.7, children: 1.5 },
    { id: 9, gross: 70000, class: 1, state: 'niedersachsen', church: true, age: 48, kv: 'gesetzlich', kv_add: 1.7, children: 2 },
    { id: 10, gross: 75000, class: 1, state: 'nordrhein-westfalen', church: false, age: 52, kv: 'gesetzlich', kv_add: 1.7, children: 3 },

    // Elderly (Altersentlastungsbetrag test)
    { id: 11, gross: 45000, class: 1, state: 'rheinland-pfalz', church: true, age: 65, kv: 'gesetzlich', kv_add: 1.7, children: 0 }, // Not quite 65 before tax year
    { id: 12, gross: 50000, class: 1, state: 'saarland', church: false, age: 66, kv: 'gesetzlich', kv_add: 1.7, children: 0 },
    { id: 13, gross: 60000, class: 1, state: 'sachsen', church: true, age: 68, kv: 'gesetzlich', kv_add: 1.7, children: 0 }, // Sachsen has special PV
    { id: 14, gross: 80000, class: 1, state: 'sachsen-anhalt', church: false, age: 70, kv: 'gesetzlich', kv_add: 1.7, children: 0 },

    // High Income & Private KV
    { id: 15, gross: 80000, class: 1, state: 'schleswig-holstein', church: true, age: 30, kv: 'privat_versichert', pkv_monthly: 400, children: 0 },
    { id: 16, gross: 90000, class: 1, state: 'thueringen', church: false, age: 35, kv: 'privat_versichert', pkv_monthly: 500, children: 1 },
    { id: 17, gross: 100000, class: 1, state: 'baden-wuerttemberg', church: true, age: 40, kv: 'privat_versichert', pkv_monthly: 600, children: 2 },
    { id: 18, gross: 120000, class: 1, state: 'bayern', church: false, age: 45, kv: 'privat_versichert', pkv_monthly: 700, children: 0 },
    { id: 19, gross: 150000, class: 1, state: 'hessen', church: true, age: 50, kv: 'privat_versichert', pkv_monthly: 800, children: 3 },
    { id: 20, gross: 200000, class: 1, state: 'nordrhein-westfalen', church: false, age: 55, kv: 'privat_versichert', pkv_monthly: 900, children: 0 },
    { id: 21, gross: 250000, class: 1, state: 'berlin', church: true, age: 60, kv: 'privat_versichert', pkv_monthly: 1000, children: 0 },
    { id: 22, gross: 300000, class: 1, state: 'hamburg', church: false, age: 65, kv: 'privat_versichert', pkv_monthly: 1200, children: 0 },

    // Extremely High/Low
    { id: 23, gross: 12000, class: 1, state: 'bayern', church: true, age: 25, kv: 'gesetzlich', kv_add: 1.7, children: 0 }, // Below Grundfreibetrag
    { id: 24, gross: 15000, class: 1, state: 'bremen', church: false, age: 28, kv: 'gesetzlich', kv_add: 1.7, children: 0 },
    { id: 25, gross: 500000, class: 1, state: 'hessen', church: true, age: 50, kv: 'privat_versichert', pkv_monthly: 1000, children: 0 },
    { id: 26, gross: 1000000, class: 1, state: 'bayern', church: false, age: 55, kv: 'privat_versichert', pkv_monthly: 1000, children: 0 },

    // specific Tax Classes
    { id: 27, gross: 60000, class: 2, state: 'berlin', church: true, age: 35, kv: 'gesetzlich', kv_add: 1.7, children: 1 },
    { id: 28, gross: 60000, class: 2, state: 'bayern', church: false, age: 40, kv: 'gesetzlich', kv_add: 1.7, children: 2 },
    { id: 29, gross: 80000, class: 3, state: 'hessen', church: true, age: 35, kv: 'gesetzlich', kv_add: 1.7, children: 1 },
    { id: 30, gross: 80000, class: 3, state: 'baden-wuerttemberg', church: false, age: 40, kv: 'gesetzlich', kv_add: 1.7, children: 2 },
    { id: 31, gross: 80000, class: 4, state: 'nordrhein-westfalen', church: true, age: 35, kv: 'gesetzlich', kv_add: 1.7, children: 1 },
    { id: 32, gross: 80000, class: 4, state: 'hamburg', church: false, age: 40, kv: 'privat_versichert', pkv_monthly: 500, children: 2 },
    { id: 33, gross: 40000, class: 5, state: 'niedersachsen', church: true, age: 35, kv: 'gesetzlich', kv_add: 1.7, children: 1 },
    { id: 34, gross: 40000, class: 5, state: 'bremen', church: false, age: 40, kv: 'gesetzlich', kv_add: 1.7, children: 2 },
    { id: 35, gross: 20000, class: 6, state: 'sachsen', church: true, age: 30, kv: 'gesetzlich', kv_add: 1.7, children: 0 },
    { id: 36, gross: 20000, class: 6, state: 'thueringen', church: false, age: 30, kv: 'gesetzlich', kv_add: 1.7, children: 0 },

    // Sachsen Specifics (PV)
    { id: 37, gross: 40000, class: 1, state: 'sachsen', church: false, age: 30, kv: 'gesetzlich', kv_add: 1.7, children: 0 },
    { id: 38, gross: 60000, class: 1, state: 'sachsen', church: true, age: 40, kv: 'gesetzlich', kv_add: 1.7, children: 1 },
    { id: 39, gross: 90000, class: 1, state: 'sachsen', church: false, age: 50, kv: 'gesetzlich', kv_add: 1.7, children: 2 },
    { id: 40, gross: 120000, class: 1, state: 'sachsen', church: true, age: 60, kv: 'privat_versichert', pkv_monthly: 800, children: 0 },
];

async function run() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const results = [];

    for (const tc of TEST_CASES) {
        console.log(`Processing case ${tc.id}: ${tc.gross}€, Class ${tc.class}, ${tc.state}`);

        await page.goto('https://www.brutto-netto-rechner.info/');

        // Accept cookies if present
        try {
            await page.click('.cmpboxbtn.cmpboxbtnyes', { timeout: 3000 });
        } catch (e) { }

        // Income
        await page.fill('#f_bruttolohn', tc.gross.toString());

        // Period: Yearly
        await page.evaluate(() => {
            const radio = document.querySelector('input[name="f_abrechnungszeitraum"][value="jahr"]') as HTMLInputElement;
            if (radio) radio.click();
        });

        // Year: 2026
        await page.evaluate(() => {
            const sel = document.getElementById('f_zeitraum') as HTMLSelectElement;
            if (sel) { sel.value = '2026'; sel.dispatchEvent(new Event('change')); }
        });

        // Tax Class
        await page.evaluate((cls) => {
            const sel = document.getElementById('f_steuerklasse') as HTMLSelectElement;
            if (sel) { sel.value = cls.toString(); sel.dispatchEvent(new Event('change')); }
        }, tc.class);

        // State
        await page.evaluate((st) => {
            const sel = document.getElementById('f_bundesland') as HTMLSelectElement;
            if (sel) { sel.value = st; sel.dispatchEvent(new Event('change')); }
        }, tc.state);

        // Church Tax
        await page.evaluate((ch) => {
            const radioName = 'f_kirchensteuer';
            const val = ch ? 'ja' : 'nein';
            const radios = Array.from(document.querySelectorAll(`input[name="${radioName}"]`)) as HTMLInputElement[];
            const target = radios.find(r => r.value === val);
            if (target) { target.click(); } else {
                const sel = document.getElementById('f_kirchensteuer') as HTMLSelectElement;
                if (sel) { sel.value = val; sel.dispatchEvent(new Event('change')); }
            }
        }, tc.church);

        // Age
        await page.fill('#f_alter', tc.age.toString());

        // Children
        await page.evaluate((has) => {
            const radioName = 'f_kinder';
            const radios = Array.from(document.querySelectorAll(`input[name="${radioName}"]`)) as HTMLInputElement[];
            const target = radios.find(r => r.value === (has ? 'ja' : 'nein'));
            if (target) { target.click(); }
        }, tc.children > 0);

        if (tc.children > 0) {
            // Depending on the field f_kinderfreibetrag (the tax allowance) vs f_kinder_anz (count for PV)
            await page.evaluate((c) => {
                const sel = document.getElementById('f_kinderfreibetrag') as HTMLSelectElement;
                if (sel) { sel.value = c.toString(); sel.dispatchEvent(new Event('change')); }
                const sel2 = document.getElementById('f_kinder_anz') as HTMLSelectElement;
                if (sel2) { sel2.value = Math.floor(c).toString(); sel2.dispatchEvent(new Event('change')); }
            }, tc.children);
        }

        // KV Type
        await page.evaluate((kv) => {
            const radioName = 'f_krankenversicherung';
            const radios = Array.from(document.querySelectorAll(`input[name="${radioName}"]`)) as HTMLInputElement[];
            const target = radios.find(r => r.value === kv);
            if (target) { target.click(); } else {
                const sel = document.getElementById('f_krankenversicherung') as HTMLSelectElement;
                if (sel) { sel.value = kv; sel.dispatchEvent(new Event('change')); }
            }
        }, tc.kv);

        if (tc.kv === 'gesetzlich') {
            await page.fill('#f_KVZ', tc.kv_add!.toString(), { force: true });
            await page.fill('#f_private_kv', '0', { force: true });
        } else {
            await page.fill('#f_private_kv', tc.pkv_monthly!.toString(), { force: true });
        }

        // Calculate
        await page.evaluate(() => {
            const btn = document.querySelector('input[type="submit"][value="berechnen"]') as HTMLElement;
            if (btn) btn.click();
        });

        // Wait for results
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(500);

        // Extract
        const extractVal = async (rowTitleMatch: RegExp) => {
            return await page.evaluate((matchStr) => {
                const regex = new RegExp(matchStr, 'i');
                const t = document.querySelectorAll('tr');
                for (let i = 0; i < t.length; i++) {
                    const th = t[i].querySelector('th') || t[i].querySelector('td:first-child');
                    if (th && regex.test(th.textContent || '')) {
                        const valTd = t[i].querySelector('td:last-child');
                        if (valTd) {
                            const text = valTd.textContent || '';
                            const num = text.replace(/[^0-9,-]/g, '').replace(',', '.');
                            return parseFloat(num) || 0;
                        }
                    }
                }
                return 0;
            }, rowTitleMatch.source);
        };

        const result = {
            id: tc.id,
            gross: tc.gross,
            net: await extractVal(/Nettoeinkommen/i),
            income_tax: await extractVal(/Lohnsteuer/i),
            soli: await extractVal(/Solidarit.tszuschlag/i),
            church_tax: await extractVal(/Kirchensteuer/i),
            kv: await extractVal(/Krankenversicherung/i),
            pv: await extractVal(/Pflegeversicherung/i),
            rv: await extractVal(/Rentenversicherung/i),
            av: await extractVal(/Arbeitslosenversicherung/i),
        };

        results.push(result);
    }

    fs.writeFileSync('./scripts/reference_40_cases.json', JSON.stringify({ cases: TEST_CASES, results: results }, null, 2));
    console.log('Saved to reference_40_cases.json');
    await browser.close();
}

run().catch(console.error);
