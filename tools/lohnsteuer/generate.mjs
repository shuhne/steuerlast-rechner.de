#!/usr/bin/env node
/**
 * Generator: amtlicher BMF-Programmablaufplan (PAP) -> TypeScript
 * ==============================================================
 *
 * Erzeugt aus der amtlichen XML-Fassung des Lohnsteuer-Programmablaufplans
 * eine 1:1-Portierung nach TypeScript (big.js statt java.math.BigDecimal).
 *
 * WARUM ES DIESEN GENERATOR GIBT
 * ------------------------------
 * Bis Juli 2026 wurde im Projekt der PAP 2023 per Regex-Skript "auf 2026
 * gepatcht". Drei von vier Tarifzonen-Ersetzungen sind dabei stillschweigend
 * fehlgeschlagen -> bis zu 1.329 EUR/Jahr zu viel Lohnsteuer. Deshalb gilt:
 *
 *   Der Rechenkern wird NIE von Hand geaendert, sondern immer neu generiert.
 *
 * BEZUGSQUELLE DER XML
 * --------------------
 * https://www.bmf-steuerrechner.de/interface/pseudocodes.xhtml
 * -> "Lohnsteuer<JAHR>.xml"
 * Direktlink-Muster (kann sich aendern, die Seite oben ist massgeblich):
 * https://www.bmf-steuerrechner.de/javax.faces.resource/daten/xmls/Lohnsteuer<JAHR>.xml.xhtml
 *
 * BENUTZUNG
 * ---------
 *   npm run gen:lohnsteuer                 # generiert aus der eingecheckten XML
 *   PAP_YEAR=2027 npm run gen:lohnsteuer   # anderes Jahr
 *
 * NACH DEM GENERIEREN IMMER:
 *   npm test -- pruftabelle
 * Der Test vergleicht gegen die amtlichen Pruef­tabellen (Toleranz 0 EUR).
 * Schlaegt er fehl, ist die Portierung falsch - nicht der Test anpassen.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..', '..');

const YEAR = process.env.PAP_YEAR || '2026';
const XML_PATH = path.join(HERE, `Lohnsteuer${YEAR}.xml`);
const OUT_PATH = path.join(REPO, 'lib', 'tax', 'generated', `Lohnsteuer${YEAR}.ts`);
const SOURCE_URL = `https://www.bmf-steuerrechner.de/javax.faces.resource/daten/xmls/Lohnsteuer${YEAR}.xml.xhtml`;

// ---------------------------------------------------------------------------
// 1. Minimaler XML-Parser
// ---------------------------------------------------------------------------
// Bewusst ohne Dependency: Die PAP-XML nutzt nur Elemente, Attribute in
// doppelten Anfuehrungszeichen und Kommentare. Ein vollstaendiger XML-Parser
// waere eine unnoetige Abhaengigkeit in der Build-Kette des Rechenkerns.

const decode = (s) =>
    s
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&amp;/g, '&');

function parseXml(src) {
    const stripped = src.replace(/^﻿/, '').replace(/<!--[\s\S]*?-->/g, '');
    let i = 0;

    function parseNodes(stopTag) {
        const nodes = [];
        while (i < stripped.length) {
            const lt = stripped.indexOf('<', i);
            if (lt === -1) break;
            i = lt;
            if (stripped.startsWith('</', i)) {
                const gt = stripped.indexOf('>', i);
                const name = stripped.slice(i + 2, gt).trim();
                i = gt + 1;
                if (name === stopTag) return nodes;
                continue;
            }
            if (stripped.startsWith('<?', i)) {
                i = stripped.indexOf('>', i) + 1;
                continue;
            }
            const gt = stripped.indexOf('>', i);
            const raw = stripped.slice(i + 1, gt);
            const selfClosing = raw.trimEnd().endsWith('/');
            const body = selfClosing ? raw.trimEnd().slice(0, -1) : raw;
            const name = body.match(/^([\w:.-]+)/)[1];
            const attrs = {};
            for (const m of body.matchAll(/([\w:.-]+)\s*=\s*"([^"]*)"/g)) {
                attrs[m[1]] = decode(m[2]);
            }
            i = gt + 1;
            const node = { name, attrs, children: [] };
            if (!selfClosing) node.children = parseNodes(name);
            nodes.push(node);
        }
        return nodes;
    }

    return parseNodes(null).find((n) => n.name === 'PAP');
}

const findAll = (node, name, acc = []) => {
    if (node.name === name) acc.push(node);
    for (const c of node.children) findAll(c, name, acc);
    return acc;
};

// ---------------------------------------------------------------------------
// 2. Java-BigDecimal-Ausdruck -> big.js-Ausdruck
// ---------------------------------------------------------------------------

/** Findet zu einer oeffnenden Klammer die passende schliessende. */
function matchParen(s, openIdx) {
    let depth = 0;
    for (let k = openIdx; k < s.length; k++) {
        if (s[k] === '(') depth++;
        else if (s[k] === ')') {
            depth--;
            if (depth === 0) return k;
        }
    }
    throw new Error(`Unbalancierte Klammern in: ${s}`);
}

/** Zerlegt eine Argumentliste an Top-Level-Kommas. */
function splitArgs(inner) {
    const out = [];
    let depth = 0;
    let cur = '';
    for (const ch of inner) {
        if (ch === '(' || ch === '{') depth++;
        if (ch === ')' || ch === '}') depth--;
        if (ch === ',' && depth === 0) {
            out.push(cur);
            cur = '';
        } else cur += ch;
    }
    if (cur.trim() !== '') out.push(cur);
    return out.map((a) => a.trim());
}

// Java-Rundungsmodus -> big.js-Rundungsmodus
//   Java ROUND_DOWN (Richtung Null)  === big.js roundDown = 0
//   Java ROUND_UP   (von Null weg)   === big.js roundUp   = 3
//   Java ROUND_HALF_UP               === big.js roundHalfUp = 1
const ROUND_MODE = {
    'BigDecimal.ROUND_DOWN': '0',
    'BigDecimal.ROUND_UP': '3',
    'BigDecimal.ROUND_HALF_UP': '1',
};

/**
 * Schreibt `x.divide(a, n, MODE)` -> `x.div(a).round(n, MODE)` und
 * `x.setScale(n, MODE)` -> `x.round(n, MODE)` um. Muss vor der
 * Methodennamen-Ersetzung laufen, weil Argumente umgehaengt werden.
 */
function rewriteScaledCalls(input) {
    let s = input;
    for (;;) {
        const m = s.match(/\.\s*(divide|setScale)\s*\(/);
        if (!m) break;
        const callStart = m.index;
        const open = s.indexOf('(', callStart);
        const close = matchParen(s, open);
        const args = splitArgs(s.slice(open + 1, close));
        let replacement;
        if (m[1] === 'divide') {
            if (args.length === 1) replacement = `.PLACEDIV(${args[0]})`;
            else if (args.length === 3)
                replacement = `.PLACEDIV(${args[0]}).PLACEROUND(${args[1]}, ${ROUND_MODE[args[2]]})`;
            else throw new Error(`Unerwartete divide-Stelligkeit ${args.length}: ${s}`);
        } else {
            if (args.length === 2) replacement = `.PLACEROUND(${args[0]}, ${ROUND_MODE[args[1]]})`;
            else throw new Error(`Unerwartete setScale-Stelligkeit ${args.length}: ${s}`);
        }
        s = s.slice(0, callStart) + replacement + s.slice(close + 1);
    }
    return s;
}

function makeTranslator(names) {
    const known = new Set(names);

    return function translate(expr) {
        let s = ` ${expr} `;

        s = rewriteScaledCalls(s);

        s = s.replace(/BigDecimal\.ZERO/g, 'PLACEZERO');
        s = s.replace(/BigDecimal\.ONE/g, 'PLACEONE');
        s = s.replace(/BigDecimal\.valueOf\s*\(/g, 'PLACEVALUEOF(');

        s = s.replace(/\.\s*multiply\s*\(/g, '.times(');
        s = s.replace(/\.\s*add\s*\(/g, '.plus(');
        s = s.replace(/\.\s*subtract\s*\(/g, '.minus(');
        s = s.replace(/\.\s*compareTo\s*\(/g, '.cmp(');
        // Java longValue() schneidet Richtung Null ab
        s = s.replace(/\.\s*longValue\s*\(\s*\)/g, '.round(0, 0).toNumber()');

        // Bezeichner qualifizieren (keine Property-Zugriffe anfassen)
        s = s.replace(/(\.?)\b([A-Za-z_][A-Za-z0-9_]*)\b/g, (match, dot, id) => {
            if (dot === '.') return match;
            if (!known.has(id)) return match;
            return `this.${id}`;
        });

        s = s.replace(/PLACEZERO/g, 'new Big(0)');
        s = s.replace(/PLACEONE/g, 'new Big(1)');
        s = s.replace(/PLACEVALUEOF\(/g, 'new Big(');
        s = s.replace(/\.PLACEDIV\(/g, '.div(');
        s = s.replace(/\.PLACEROUND\(/g, '.round(');

        s = s.replace(/([^=!<>])==([^=])/g, '$1===$2');

        return s.trim();
    };
}

// ---------------------------------------------------------------------------
// 3. Codegenerierung
// ---------------------------------------------------------------------------

/** Position des Zuweisungs-`=` (nicht Teil von ==, <=, >=, !=). */
function findAssignmentEq(s) {
    let depth = 0;
    for (let k = 0; k < s.length; k++) {
        const ch = s[k];
        if (ch === '(') depth++;
        else if (ch === ')') depth--;
        else if (ch === '=' && depth === 0) {
            if (s[k + 1] === '=') {
                k++;
                continue;
            }
            if ('<>!='.includes(s[k - 1])) continue;
            return k;
        }
    }
    throw new Error(`Keine Zuweisung gefunden in: ${s}`);
}

function emitStatements(nodes, translate, indent) {
    const pad = ' '.repeat(indent);
    const out = [];
    for (const n of nodes) {
        if (n.name === 'EXECUTE') {
            out.push(`${pad}this.${n.attrs.method}();`);
        } else if (n.name === 'EVAL') {
            const raw = n.attrs.exec.replace(/\s+/g, ' ').trim();
            const eq = findAssignmentEq(raw);
            out.push(
                `${pad}${translate(raw.slice(0, eq))} = ${translate(raw.slice(eq + 1))};`
            );
        } else if (n.name === 'IF') {
            const thenNode = n.children.find((c) => c.name === 'THEN');
            const elseNode = n.children.find((c) => c.name === 'ELSE');
            out.push(`${pad}if (${translate(n.attrs.expr)}) {`);
            out.push(...emitStatements(thenNode ? thenNode.children : [], translate, indent + 4));
            if (elseNode) {
                out.push(`${pad}} else {`);
                out.push(...emitStatements(elseNode.children, translate, indent + 4));
            }
            out.push(`${pad}}`);
        }
    }
    return out;
}

function javaArrayToTs(value, translate) {
    const inner = value.trim().replace(/^\{/, '').replace(/\}$/, '');
    return `[${splitArgs(inner).map((v) => translate(v)).join(', ')}]`;
}

function main() {
    const src = fs.readFileSync(XML_PATH, 'utf8');
    const pap = parseXml(src);

    const inputs = findAll(pap, 'INPUT').map((n) => n.attrs);
    const outputs = findAll(pap, 'OUTPUT').map((n) => n.attrs);
    const internals = findAll(pap, 'INTERNAL').map((n) => n.attrs);
    const constants = findAll(pap, 'CONSTANT').map((n) => n.attrs);

    const allNames = [...inputs, ...outputs, ...internals, ...constants].map((a) => a.name);
    const translate = makeTranslator(allNames);

    const methodsRoot = pap.children.find((c) => c.name === 'METHODS');
    const mainNode = methodsRoot.children.find((c) => c.name === 'MAIN');
    const methods = methodsRoot.children.filter((c) => c.name === 'METHOD');

    const stamp = (src.match(/Stand:\s*([0-9-]+\s*[0-9:]*)/) || [])[1] || 'unbekannt';
    const version = pap.attrs.version || '?';

    const L = [];
    L.push('/* eslint-disable */');
    L.push('// @ts-nocheck');
    L.push('/**');
    L.push(' * AUTOMATISCH GENERIERT - NICHT VON HAND BEARBEITEN.');
    L.push(' *');
    L.push(` * Quelle : amtlicher Programmablaufplan des BMF, Lohnsteuer${YEAR}.xml`);
    L.push(` * Bezug  : ${SOURCE_URL}`);
    L.push(` * PAP    : version=${version}, Stand ${stamp}`);
    L.push(' * Erzeugt: tools/lohnsteuer/generate.mjs');
    L.push(' *');
    L.push(' * Aenderungen ausschliesslich ueber eine neue XML-Fassung und');
    L.push(' * "npm run gen:lohnsteuer" einspielen.');
    L.push(' * Siehe docs/wissensspeicher/runbook-jahreswechsel.md');
    L.push(' */');
    L.push("import Big from 'big.js';");
    L.push('');
    L.push('// Eigene Big-Instanz: der PAP rechnet exakt und rundet ausschliesslich');
    L.push('// explizit. Eine hohe DP verhindert, dass big.js bei Divisionen vorzeitig');
    L.push('// rundet. Die globale Big-Konfiguration anderer Module bleibt unberuehrt.');
    L.push('const PapBig = Big();');
    L.push('PapBig.DP = 40;');
    L.push('PapBig.RM = 0;');
    L.push('');
    L.push(`export const PAP_META = { jahr: ${YEAR}, version: '${version}', stand: '${stamp}' } as const;`);
    L.push('');
    L.push(`export class Lohnsteuer${YEAR} {`);

    L.push('    // --- EINGABEPARAMETER ---');
    for (const a of inputs) {
        if (a.type === 'BigDecimal') L.push(`    ${a.name}: any = new Big(0);`);
        else L.push(`    ${a.name}: number = ${a.default ?? a.defaul ?? 0};`);
    }
    L.push('    // --- AUSGABEPARAMETER ---');
    for (const a of outputs) L.push(`    ${a.name}: any = new Big(0);`);
    L.push('    // --- INTERNE FELDER ---');
    for (const a of internals) {
        if (a.type === 'BigDecimal') L.push(`    ${a.name}: any = new Big(0);`);
        else L.push(`    ${a.name}: number = ${a.default ?? 0};`);
    }
    L.push('    // --- KONSTANTEN ---');
    for (const a of constants) {
        if (a.type === 'BigDecimal[]') L.push(`    ${a.name}: any[] = ${javaArrayToTs(a.value, translate)};`);
        else L.push(`    ${a.name}: any = ${translate(a.value)};`);
    }

    L.push('');
    L.push('    /** Fuehrt den kompletten Programmablaufplan aus. */');
    L.push('    calculate(): void {');
    L.push(...emitStatements(mainNode.children, translate, 8));
    L.push('    }');

    for (const m of methods) {
        L.push('');
        L.push(`    ${m.attrs.name}(): void {`);
        L.push(...emitStatements(m.children, translate, 8));
        L.push('    }');
    }

    L.push('}');
    L.push('');
    L.push(`export default Lohnsteuer${YEAR};`);

    let code = L.join('\n');
    // Alle Konstruktoraufrufe auf die lokale Big-Instanz umbiegen,
    // ohne die Importzeile zu beruehren.
    code = code.replace(/new Big\(/g, 'new PapBig(');

    fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
    fs.writeFileSync(OUT_PATH, code + '\n', 'utf8');

    console.log(`OK  ${path.relative(REPO, OUT_PATH)}`);
    console.log(`    PAP ${YEAR}, version ${version}, Stand ${stamp}`);
    console.log(`    ${inputs.length} Eingaben, ${outputs.length} Ausgaben, ${methods.length + 1} Methoden`);
    console.log('    Naechster Schritt: npm test -- pruftabelle');
}

main();
