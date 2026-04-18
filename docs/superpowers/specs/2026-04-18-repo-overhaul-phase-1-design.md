# Repository Overhaul — Phase 1 (Hygiene, InputSection Refactor, Tests & Docs)

**Status:** Approved design — ready for implementation planning
**Date:** 2026-04-18
**Owner:** shuhne
**Scope:** P1 (hygiene) + P2 (InputSection refactor) + P3 (tests & docs) + expanded roadmap doc
**Explicitly deferred:** P4 (new feature implementations), P5 (core tax-math hardening)

---

## 1. Goals

1. Eliminate structural debt that blocks future work: duplicated type definitions, scattered constants, committed build artifacts, a stranded `frontend/` directory, and a monolithic input component.
2. Raise test coverage from ~30% to ~70% by closing the biggest gaps (API routes, middleware, utility modules, representative UI).
3. Produce the documentation needed for a contributor to understand the architecture and extend the calculator safely.
4. Convert the existing 17-item feature brainstorm into a prioritized, estimated roadmap that future phases can execute against.
5. Preserve exact tax-calculation behavior — the 40 BMF reference cases in [scripts/reference_40_cases.json](../../../scripts/reference_40_cases.json) must continue to pass exactly.

## 2. Non-goals

- No changes to [lib/tax/Lohnsteuer2026.ts](../../../lib/tax/Lohnsteuer2026.ts). It is generated from the official BMF PAP; `@ts-nocheck` is appropriate for generated code. A thin typed adapter may be introduced if needed for test ergonomics, but no internal edits.
- No implementation of new user-facing features. Only the roadmap document is updated.
- No UI/visual redesign. Layout, styling, copy unchanged.
- No i18n. Project stays German-only.
- No state-management migration. Stays on React `useState`.
- No Firebase/hosting/config changes beyond `package.json` scripts.

## 3. Hard constraints

- **Regression gate:** `npm run test:pap` must exit 0 after every commit in this work stream.
- **Internal API only:** API routes at `app/api/*` are consumed exclusively by this repo's own frontend; we are free to change the wire format from `snake_case` to `camelCase`.
- **Strict TypeScript:** no new `@ts-ignore`, `@ts-nocheck`, or `any`. Existing `@ts-ignore` in InputSection must be removed, not relocated. `@ts-nocheck` in `Lohnsteuer2026.ts` remains.
- **No behavior change under test:** the four existing test suites must continue to pass with no assertion edits beyond renames caused by the type consolidation.

## 4. Approach

One unified design (this document), implemented across ~4 sequenced commits on a single branch. Each commit is independently verifiable against the regression gate.

Commit sequence:

1. **Hygiene** — deletions, gitignore, constants extraction, type consolidation, rate-limit fix, deps cleanup, npm scripts.
2. **InputSection refactor** — split the 874-line component into focused sub-components; extract scenarios and German number utilities.
3. **Test coverage** — add tests for API routes, middleware, utilities, and representative UI.
4. **Documentation** — README, ARCHITECTURE.md, CONTRIBUTING.md, ROADMAP.md.

Rationale for unified spec: the three workstreams are tightly coupled. Type consolidation (commit 1) enables the InputSection refactor (commit 2); the refactor enables the component tests (commit 3); the documentation (commit 4) captures the new structure.

## 5. Commit 1 — Hygiene & Structure

### 5.1 Deletions and gitignore

- Delete `frontend/` directory entirely (contains only `.next/` build cache; leftover from an earlier monorepo split).
- Delete `scripts/debug_pw.html` (34 KB) and `scripts/debug_pw.png` (127 KB).
- Extend `.gitignore` to include `.next/` (currently missing), `scripts/debug_pw.*`, `coverage/`, and `*.tsbuildinfo`.

### 5.2 Type consolidation

Three files currently define variants of `TaxRequest` / `TaxResult`:

- [types/api.ts](../../../types/api.ts) — most complete
- [lib/tax/types.ts](../../../lib/tax/types.ts) — simplified
- [types/tax.ts](../../../types/tax.ts) — oldest

Action:

- `types/api.ts` becomes the single source of truth. All fields converted to `camelCase` (`grossIncome`, `netIncomeMonthly`, `simulationSettings`, etc.).
- Delete `lib/tax/types.ts` and `types/tax.ts`.
- Update all imports repo-wide. Expected call sites: components under `components/`, API routes under `app/api/*`, scripts under `scripts/`, `lib/tax/scenario_engine.ts`, `lib/tax/tax_calculator.ts`, `lib/tax/validation.ts`.
- Update Zod schema in `lib/tax/validation.ts` to match the new camelCase keys.
- Update `scripts/reference_40_cases.json` if it stores keys that are read by validation (it appears to store computed results only — verify during implementation).

### 5.3 Constants extraction

Create `lib/tax/constants.ts` containing (at minimum):

- `GRUNDFREIBETRAG_2026 = 12_348`
- Progression zone limits: `ZONE_1_END = 12_348`, `ZONE_2_END = 17_799`, `ZONE_3_END = 69_878`, `ZONE_4_END = 277_825`
- `SOLI_FREIGRENZE_SINGLE = 20_350`, `SOLI_FREIGRENZE_JOINT = 40_700`
- `WERBUNGSKOSTEN_PAUSCHBETRAG = 1_230`
- `SONDERAUSGABEN_PAUSCHBETRAG = 36`
- `DEFAULT_KV_ZUSATZBEITRAG_PERCENT = 2.9`
- `PV_KINDERLOS_ZUSCHLAG_PERCENT`, `PV_KINDERABSCHLAG_PER_CHILD_PERCENT` (current values from code)
- `AGE_ALTERSENTLASTUNG_THRESHOLD = 64`
- Social-security contribution ceilings (`BBG_KV_PV`, `BBG_RV_AV`) for 2026

Each constant carries a JSDoc comment with the BMF or SGB source citation. All current hard-coded usages in `lib/tax/tax_calculator.ts`, `lib/tax/scenario_engine.ts`, and `lib/tax/validation.ts` replaced with imports.

### 5.4 Middleware rate-limit fix

[middleware.ts](../../../middleware.ts) stores per-IP counters in an in-memory `Map` with no cleanup — unbounded growth.

Fix:

- Track `{ count, windowStart }` per IP.
- On each request, lazy-evict entries whose `windowStart` is older than the current window.
- Cap the map at `RATE_LIMIT_MAX_IPS = 10_000`; if exceeded on insert, evict the oldest `windowStart` entry.
- Keep the public behavior (30 req/min) unchanged.
- Replace the `(request as any).ip` cast with a typed helper that reads `x-forwarded-for` first, then `x-real-ip`, then returns `"unknown"`.

### 5.5 Dependency cleanup

- Remove `taxjs` from `package.json` (no imports found).
- Remove `playwright` entirely, and delete `scripts/scrape_40_cases.ts` (its only consumer). The `scripts/reference_40_cases.json` file is already committed and only needs regeneration when the BMF publishes a new PAP — regeneration protocol is documented in `CONTRIBUTING.md` (restore the scraping script from git history or rewrite with a fresh browser automation tool at that point).
- Add `tsx` as a devDep.
- Rename `package.json` `"name"` from `"frontend"` to `"steuerlast-rechner"`.

### 5.6 npm scripts

Add to `package.json`:

```json
"test:pap":    "tsx scripts/test_pap_exact.ts",
"test:cases":  "tsx scripts/compare_40_cases.ts",
"test:approx": "tsx scripts/test_pap_approx.ts",
"lint:fix":    "eslint --fix",
"typecheck":   "tsc --noEmit"
```

### 5.7 Verification

- `npm run typecheck` — clean
- `npm run lint` — clean
- `npm run test` — all existing Vitest tests pass (assertions updated only for the camelCase rename)
- `npm run test:pap` — all 40 BMF cases exact match
- `npm run build` — Next.js build succeeds

## 6. Commit 2 — InputSection refactor

[components/InputSection.tsx](../../../components/InputSection.tsx) (874 lines) is decomposed into:

```
components/input/
├── InputSection.tsx          # composer; ≤100 lines; owns no logic
├── BasicFields.tsx           # gross income, period, state, tax class
├── PersonalFields.tsx        # age, year-of-birth reconciliation, children, church tax
├── InsuranceFields.tsx       # public vs private branch; KV/PV amounts
├── PartTimeSection.tsx       # hours slider + effective-% derived display
├── ExpertModeToggle.tsx      # reveals simulation_settings controls
└── ExpertFields.tsx          # Rentenwert, KV-Zusatz, progression overrides
```

Supporting moves:

- **[data/scenarios.ts](../../../data/scenarios.ts)** — extract the four hard-coded scenario objects (`current`, `pessimist`, `realist`, `optimist`) from `InputSection`. Typed against the consolidated `SimulationSettings` type from `types/api.ts`.
- **[utils/germanNumber.ts](../../../utils/germanNumber.ts)** — extract `parseGermanNumber(input: string): number | null`, `formatGermanNumber(value: number, options?: Intl.NumberFormatOptions): string`, and `formatCurrency(value: number): string`. Replace all duplicate implementations across InputSection, ResultDashboard, and chart components.
- Replace all five `@ts-ignore` occurrences with proper types. Likely culprits are Recharts payload typing (use Recharts' generic types) and number/string coercion at the input boundary (use the new `parseGermanNumber` helper, which returns `number | null`).

Parent `app/page.tsx` imports from `components/input/InputSection.tsx`; public prop contract unchanged.

### 6.1 Verification

- All Vitest suites pass.
- `npm run test:pap` passes (InputSection does not touch calculation logic, but we gate anyway).
- Manual smoke: dev server renders the form, debounced calculations still fire, expert-mode toggle still works.

## 7. Commit 3 — Test coverage

New test files:

- `app/api/calculate/route.test.ts`, `app/api/simulate/route.test.ts`, `app/api/curve/route.test.ts` — each covers: happy path (200 with expected shape), Zod validation error (400), malformed JSON (400), oversized body. Uses Next.js Route Handler testing pattern (direct `POST` invocation with a `Request` object).
- `middleware.test.ts` — 30-req window boundary, per-IP isolation, cleanup eviction after window expiry, cap behavior when `RATE_LIMIT_MAX_IPS` is exceeded.
- `utils/germanNumber.test.ts` — parse/format round-trips, edge cases (`","`, `"1.234,56"`, `"abc"`, empty, negative, `undefined`).
- `utils/periodConverter.test.ts` — yearly ↔ monthly for integers and fractional amounts; rounding contract documented.
- `utils/salaryComparison.test.ts` — the polynomial-fit logic that currently has no tests and magic coefficients.
- `components/input/BasicFields.test.tsx` and `components/input/ExpertFields.test.tsx` — at minimum: renders with default props, emits `onChange` with correctly typed values, validation error displayed when parse fails. Two components chosen as representative; not all seven.

Housekeeping:

- Move [tests/tax/tax_logic.test.ts](../../../tests/tax/tax_logic.test.ts) → `lib/tax/__tests__/tax_logic.test.ts` so all tests live alongside their subject. Delete the empty `tests/` directory.

Coverage target: ~70% line coverage. `npm run test:coverage` becomes part of the verification step.

### 7.1 Verification

- `npm run test` — all suites pass.
- `npm run test:coverage` — line coverage ≥ 70% (soft target; report the number in the commit message).
- `npm run test:pap` — 40 BMF cases exact match.

## 8. Commit 4 — Documentation

### 8.1 README.md

Sections to update or add:

- **Architecture** — brief prose plus a Mermaid diagram showing `User input → React state → API route → scenario_engine → tax_calculator + social_security → TaxResult → charts`.
- **Running the BMF validation suite** — document `npm run test:pap` and `npm run test:cases` as the authoritative regression checks, and when to re-run them.
- **Project structure** — annotated directory tree.
- Link to ARCHITECTURE.md and CONTRIBUTING.md.

### 8.2 New `docs/ARCHITECTURE.md`

- Layer responsibilities table (UI → API route → scenario engine → tax calculator → Lohnsteuer2026).
- Data-flow diagram (Mermaid).
- Type system — one source of truth at `types/api.ts`, camelCase at the boundary; how Zod validation maps HTTP input to typed internal requests.
- Calculation engine note — why `Lohnsteuer2026.ts` is untouched (generated from BMF PAP; update protocol via `scripts/patch_lohnsteuer2026.ts`).
- Constants — where they live (`lib/tax/constants.ts`) and the annual update protocol.

### 8.3 New `CONTRIBUTING.md`

- Local setup, commit conventions (Conventional Commits as already used in git log), PR checklist.
- Test conventions — where tests go (colocated `__tests__/`), what to test when.
- When the 40-case reference set must be regenerated (answer: only when BMF publishes an updated PAP; never as a side effect of refactoring).
- Feature-add workflow — branch, ROADMAP entry, spec, plan, PR.

### 8.4 Rewrite `docs/new_features_ideas.md` → `docs/ROADMAP.md`

Structure:

- Keep all 17 existing ideas, with original descriptions preserved.
- Add 3–5 new candidate ideas informed by the current architecture. Initial candidate list (subject to revision during implementation):
  1. *Steuerklassen-Kombinationsrechner* — couples IV/IV vs III/V vs IV-mit-Faktor comparison.
  2. *Minijob/Midijob-Grenzanalyse* — visualizes marginal take-home at the 556 €/2 000 € thresholds.
  3. *Kirchensteuer-Austritt ROI* — computes break-even for leaving the church when the Austritt fee applies.
  4. *13./14. Gehalt Vergleich* — effect of paying annual sum as 12 vs 13 vs 14 instalments.
  5. *Fünftelregelung-Advisor* — for severance/Abfindung, compares with/without Fünftelregelung and flags when it applies.
- Tabulate every idea with columns: **Idea**, **Category**, **Effort (S/M/L)**, **Risk**, **Data dependency** (e.g. needs city-level cost-of-living index), **User value (H/M/L)**, **Acceptance criteria summary (1 line)**, **Depends on**.
- Propose a three-sprint ordering based on effort × value, surfaced as a "Recommended sequence" section at the top.

## 9. Risks and mitigations

| Risk | Mitigation |
|---|---|
| camelCase rename breaks a caller I missed | Project is a single repo; grep for snake_case keys before the commit; regression suite catches any live path. |
| InputSection split introduces a prop-wiring bug | Keep the public component API of `<InputSection>` identical; sub-components are private. UI smoke-test before closing the commit. |
| Rate-limit eviction bug opens a DoS window | Unit tests exercise boundary and cap behavior; existing 30 req/min contract preserved. |
| Test additions slow down CI noticeably | API-route and middleware tests use direct handler invocation (no server spin-up); expected total CI time increase <10 s. |
| Removing `playwright` breaks a workflow | Confirm no non-script usage; if `scripts/scrape_40_cases.ts` is deleted, document in CONTRIBUTING how to regenerate the reference set should the BMF PAP change. |

## 10. Verification summary

After each commit:

- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run test:pap`
- `npm run build` (at least at the end of commits 1 and 2)

Final commit adds coverage check: `npm run test:coverage` ≥ 70% line coverage.

## 11. Out-of-scope items for future phases

- **P4 — Feature implementations.** Picked from the new ROADMAP.md.
- **P5 — Core tax-math hardening.** Typed adapter around `Lohnsteuer2026.ts`, removal of any residual `any` in `tax_calculator.ts`, annual-update protocol automation.
- E2E tests with Playwright (only if we later decide to invest in browser-level regression coverage).
- Performance profiling of Big.js arithmetic.
- Rate-limit migration from in-memory to Redis (only relevant if deployment topology changes).
