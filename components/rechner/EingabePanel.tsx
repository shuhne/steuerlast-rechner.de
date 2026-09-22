'use client';

import React, { useState } from 'react';
import { ArrowDown, Calculator, ChevronDown, ChevronUp, Euro, History, RotateCcw, Settings2, Trash2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { RECHTSSTAENDE, RECHTSSTATUS_LABEL, svWerte, SV_2026 } from '../../lib/tax';
import { formatEuro, parseZahl, useRechner } from './useRechner';
import { InfoTooltip } from './InfoTooltip';

const cn = (...i: ClassValue[]) => twMerge(clsx(i));

const BUNDESLAENDER: Array<[string, string]> = [
    ['BW', 'Baden-Württemberg'], ['BY', 'Bayern'], ['BE', 'Berlin'], ['BB', 'Brandenburg'],
    ['HB', 'Bremen'], ['HH', 'Hamburg'], ['HE', 'Hessen'], ['MV', 'Mecklenburg-Vorpommern'],
    ['NI', 'Niedersachsen'], ['NW', 'Nordrhein-Westfalen'], ['RP', 'Rheinland-Pfalz'],
    ['SL', 'Saarland'], ['SN', 'Sachsen'], ['ST', 'Sachsen-Anhalt'],
    ['SH', 'Schleswig-Holstein'], ['TH', 'Thüringen'],
];

const STATUS_FARBE: Record<string, string> = {
    geltendes_recht: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    verkuendet: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
    regierungsentwurf: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    referentenentwurf: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    politische_ankuendigung: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
    amtliche_projektion: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    eigene_annahme: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
};

export function RechtsstatusChip({ status, klein }: { status: string; klein?: boolean }) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full border font-semibold',
                klein ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs',
                STATUS_FARBE[status] ?? 'bg-slate-700/40 text-slate-300 border-slate-600'
            )}
        >
            {RECHTSSTATUS_LABEL[status as keyof typeof RECHTSSTATUS_LABEL] ?? status}
        </span>
    );
}

type Props = ReturnType<typeof useRechner>;

/**
 * Beschriftetes Feld. Die Erlaeuterung steckt im Tooltip statt als Dauertext
 * darunter - das haelt das Panel kurz genug, damit es im Fenster bleibt.
 */
function Feld({
    label,
    hinweis,
    children,
}: {
    label: string;
    hinweis?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-1.5">
            <span className="flex items-center gap-1 text-sm font-medium text-slate-400">
                {label}
                {hinweis && <InfoTooltip text={hinweis} />}
            </span>
            {children}
        </div>
    );
}

/** Was-waere-wenn-Regler. */
function Regler({
    label,
    wert,
    setzen,
    min,
    max,
    schritt,
    einheit,
    farbe,
}: {
    label: string;
    wert: number;
    setzen: (v: number) => void;
    min: number;
    max: number;
    schritt: number;
    einheit: string;
    farbe: string;
}) {
    return (
        <div className="space-y-1">
            <div className="flex items-baseline justify-between">
                <label className="text-xs text-slate-400">{label}</label>
                <span className={cn('font-mono text-xs font-semibold', farbe)}>
                    {wert.toLocaleString('de-DE')} {einheit}
                </span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={schritt}
                value={wert}
                onChange={(e) => setzen(parseFloat(e.target.value))}
                aria-label={label}
                className={cn(
                    'h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-800',
                    farbe.replace('text-', 'accent-')
                )}
            />
        </div>
    );
}

const inputKlasse =
    'w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5 text-base text-white ' +
    'focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm';

// Zahlenfelder ohne die nativen Spinner des Browsers - die sind je nach
// Browser unterschiedlich gross und lassen sich nicht gestalten.
const ohneSpinner =
    '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none ' +
    '[&::-webkit-inner-spin-button]:appearance-none';

/**
 * Zahlenfeld mit eigenen Plus/Minus-Schaltflaechen.
 *
 * Die nativen Spinner sind auf Touch-Geraeten kaum treffbar und in Firefox gar
 * nicht vorhanden. Eigene Schaltflaechen sind gross genug und ueberall gleich.
 */
function ZahlFeld({
    wert,
    setzen,
    min,
    max,
    schritt = 1,
    suffix,
    ariaLabel,
}: {
    wert: number;
    setzen: (v: number) => void;
    min: number;
    max: number;
    schritt?: number;
    suffix?: string;
    ariaLabel: string;
}) {
    const begrenzen = (v: number) => Math.min(max, Math.max(min, v));
    const runden = (v: number) => Math.round(v / schritt) * schritt;

    return (
        <div className="group relative">
            <input
                type="number"
                inputMode="decimal"
                min={min}
                max={max}
                step={schritt}
                value={Number.isFinite(wert) ? wert : ''}
                onChange={(e) => setzen(parseFloat(e.target.value))}
                onBlur={(e) => setzen(begrenzen(parseFloat(e.target.value) || min))}
                aria-label={ariaLabel}
                className={cn(inputKlasse, 'pr-12 font-mono', ohneSpinner)}
            />
            {suffix && (
                <span className="pointer-events-none absolute right-12 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                    {suffix}
                </span>
            )}
            <div className="absolute bottom-1 right-1 top-1 flex w-10 flex-col gap-0.5 rounded border border-slate-800 bg-slate-900 p-0.5">
                <button
                    type="button"
                    onClick={() => setzen(begrenzen(runden(wert + schritt)))}
                    aria-label={`${ariaLabel} erhöhen`}
                    className="flex flex-1 items-center justify-center rounded text-xs font-bold text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300"
                >
                    +
                </button>
                <button
                    type="button"
                    onClick={() => setzen(begrenzen(runden(wert - schritt)))}
                    aria-label={`${ariaLabel} verringern`}
                    className="flex flex-1 items-center justify-center rounded text-xs font-bold text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300"
                >
                    −
                </button>
            </div>
        </div>
    );
}

export function EingabePanel(p: Props) {
    const [expertenmodus, setExpertenmodus] = useState(false);
    const sv = svWerte(SV_2026);

    return (
        <div className="space-y-6 rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-xl shadow-slate-950/50 sm:p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-400">
                    <Calculator className="h-5 w-5" />
                    <h2 className="text-lg font-semibold text-white">Deine Angaben</h2>
                </div>
                {p.hatEingabe && (
                    <button
                        onClick={p.zuruecksetzen}
                        className="rounded p-1 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300"
                        title="Zurücksetzen"
                        aria-label="Alle Eingaben zurücksetzen"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Gehalt */}
            <Feld label="Bruttogehalt">
                <div className="group relative">
                    <Euro className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400" />
                    <input
                        type="text"
                        inputMode="decimal"
                        value={p.z.bruttoEingabe}
                        onChange={(e) => p.setzen('bruttoEingabe', e.target.value.replace(/[^0-9.,]/g, ''))}
                        onBlur={() => {
                            const v = parseZahl(p.z.bruttoEingabe);
                            if (v > 0) p.setzen('bruttoEingabe', v.toLocaleString('de-DE'));
                        }}
                        placeholder="z. B. 50.000"
                        className="w-full rounded-lg border border-slate-800 bg-slate-950 py-3 pl-10 pr-24 font-mono text-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        aria-label="Bruttogehalt"
                    />
                    <div className="absolute bottom-1 right-1 top-1 flex w-20 flex-col gap-0.5 rounded border border-slate-800 bg-slate-900 p-0.5">
                        {(['jahr', 'monat'] as const).map((per) => (
                            <button
                                key={per}
                                onClick={() => p.setPeriode(per)}
                                className={cn(
                                    'flex flex-1 items-center justify-center rounded text-xs font-bold uppercase transition-colors',
                                    p.z.periode === per ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'
                                )}
                            >
                                {per === 'jahr' ? 'Jährlich' : 'Monatlich'}
                            </button>
                        ))}
                    </div>
                </div>
            </Feld>

            {/* Rechtsstand */}
            {/* Ohne Status-Chip: Der Rechtsstand steht bereits im Namen der
                Auswahl, und bei Szenarien weist die Ergebniskarte deutlich
                genug darauf hin. Ein farbiger Chip an jedem Zustand - auch am
                Normalfall "geltendes Recht" - war visuelles Rauschen. */}
            <Feld label="Rechtsstand" hinweis={p.rechtsstand.beschreibung}>
                <div className="relative">
                    <select
                        value={p.z.szenarioId}
                        onChange={(e) => p.setzen('szenarioId', e.target.value)}
                        className={cn(inputKlasse, 'cursor-pointer appearance-none pr-9')}
                        aria-label="Rechtsstand oder Szenario wählen"
                    >
                        {RECHTSSTAENDE.map((r) => (
                            <option key={r.id} value={r.id}>
                                {r.bezeichnung}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                </div>
            </Feld>

            {/* Steuerklasse */}
            <Feld label="Steuerklasse">
                <div className="grid grid-cols-6 gap-1">
                    {[1, 2, 3, 4, 5, 6].map((k) => (
                        <button
                            key={k}
                            onClick={() => p.setzen('steuerklasse', k)}
                            aria-pressed={p.z.steuerklasse === k}
                            className={cn(
                                'rounded-md border py-2 text-xs font-bold transition-all',
                                p.z.steuerklasse === k
                                    ? 'border-indigo-500 bg-indigo-600 text-white'
                                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-900'
                            )}
                        >
                            {k}
                        </button>
                    ))}
                </div>
            </Feld>

            <div className="grid grid-cols-2 gap-4">
                <Feld label="Bundesland">
                    <div className="relative">
                        <select
                            value={p.z.bundesland}
                            onChange={(e) => p.setzen('bundesland', e.target.value)}
                            className={cn(inputKlasse, 'cursor-pointer appearance-none pr-8')}
                        >
                            {BUNDESLAENDER.map(([k, n]) => (
                                <option key={k} value={k}>{n}</option>
                            ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-500" />
                    </div>
                </Feld>

                <Feld label="Kirchensteuer">
                    <button
                        onClick={() => p.setzen('kirchensteuer', !p.z.kirchensteuer)}
                        className={cn(
                            'flex w-full items-center justify-center rounded-lg border px-3 py-2.5 text-base font-medium transition-all sm:text-sm',
                            p.z.kirchensteuer
                                ? 'border-indigo-500 bg-indigo-900/30 text-indigo-300'
                                : 'border-slate-800 bg-slate-950 text-slate-400'
                        )}
                    >
                        {p.z.kirchensteuer ? 'Ja' : 'Nein'}
                    </button>
                </Feld>

                <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                        <label className="text-sm font-medium text-slate-400">Alter</label>
                        {p.z.alter > 64 && (
                            <span className="rounded border border-emerald-500/20 bg-emerald-900/20 px-1.5 py-0.5 text-[10px] text-emerald-400">
                                Altersentlastung
                            </span>
                        )}
                    </div>
                    <ZahlFeld
                        wert={p.z.alter}
                        setzen={(v) => p.setzen('alter', v)}
                        min={14}
                        max={100}
                        ariaLabel="Alter"
                    />
                </div>

                <Feld
                    label="Kinder"
                    hinweis="Halbe Werte sind moeglich: Der Kinderfreibetrag wird auf beide Elternteile aufgeteilt, jeder traegt in der Regel 0,5 je Kind. Bei Alleinerziehenden oder wenn der andere Elternteil den Freibetrag uebertragen hat, ist es 1,0."
                >
                    {p.z.kinder === 0 ? (
                        <button
                            onClick={() => p.setzen('kinder', 1)}
                            className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5 text-base font-medium text-slate-400 transition-all hover:bg-slate-900 sm:text-sm"
                        >
                            Keine
                        </button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => p.setzen('kinder', Math.max(0, p.z.kinder - 0.5))}
                                aria-label="Ein halbes Kind weniger"
                                className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 transition-colors hover:border-slate-700 hover:text-white"
                            >
                                −
                            </button>
                            <div className="flex-1 text-center font-mono text-lg font-medium text-white">
                                {p.z.kinder.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                            </div>
                            <button
                                onClick={() => p.setzen('kinder', Math.min(12, p.z.kinder + 0.5))}
                                aria-label="Ein halbes Kind mehr"
                                className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 transition-colors hover:border-slate-700 hover:text-white"
                            >
                                +
                            </button>
                        </div>
                    )}
                </Feld>

                <Feld
                    label="Wochenstunden"
                    hinweis="Grundlage für den Stundenlohn. Bei reduzierter Arbeitszeit über den Regler unten wird der Wert entsprechend angepasst."
                >
                    <ZahlFeld
                        wert={p.z.wochenstunden}
                        setzen={(v) => p.setzen('wochenstunden', v)}
                        min={1}
                        max={80}
                        schritt={0.5}
                        ariaLabel="Wochenstunden"
                    />
                </Feld>

                <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1 text-sm font-medium text-slate-400">
                            Krankenversicherung
                            {!p.pkvMoeglich && (
                                <InfoTooltip text={`Die allgemeine Jahresarbeitsentgeltgrenze im gewählten Rechtsstand ${p.rechtsstand.jahr} liegt bei ${formatEuro(p.rechtsstand.sv.jaeg.wert, 0)}. Das regelmäßige Jahresarbeitsentgelt muss diese Grenze überschreiten. Sonderregeln für Bestandsfälle sind nicht abgebildet.`} />
                            )}
                        </span>
                        {p.pkvMoeglich && (
                            <span className="rounded border border-emerald-900/50 bg-emerald-950 px-1.5 py-0.5 text-[10px] text-emerald-500">
                                Freie Wahl
                            </span>
                        )}
                    </div>
                    <div className="relative">
                        <select
                            value={p.z.krankenversicherung}
                            onChange={(e) => p.setzen('krankenversicherung', e.target.value as 'gesetzlich' | 'privat')}
                            disabled={!p.pkvMoeglich}
                            className={cn(inputKlasse, 'cursor-pointer appearance-none pr-8 disabled:opacity-60')}
                        >
                            <option value="gesetzlich">Gesetzlich</option>
                            <option value="privat">Privat</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-500" />
                    </div>
                </div>
            </div>

            {/* KV-Zusatzbeitrag: jetzt Hauptfeld statt wirkungslosem Expertenfeld */}
            {p.z.krankenversicherung === 'gesetzlich' ? (
                <Feld
                    label="Zusatzbeitrag Krankenkasse"
                    hinweis={`Standard ist der rechnerische Durchschnitt von ${(sv.kvZusatzDurchschnitt * 100)
                        .toLocaleString('de-DE', { minimumFractionDigits: 1 })} % nach § 242a SGB V. Der tatsächlich gewichtete Kassendurchschnitt lag im Januar 2026 bei rund 3,1 %. Den eigenen Satz findest du auf der Website deiner Kasse.`}
                >
                    <ZahlFeld
                        wert={p.z.kvZusatzProzent}
                        setzen={(v) => p.setzen('kvZusatzProzent', v)}
                        min={0}
                        max={10}
                        schritt={0.1}
                        suffix="%"
                        ariaLabel="Zusatzbeitrag der Krankenkasse"
                    />
                </Feld>
            ) : (
                <Feld
                    label="PKV-Beitrag im Monat"
                    hinweis="Voller Monatsbeitrag inklusive Pflegepflichtversicherung. Der Arbeitgeberzuschuss wird abgezogen: höchstens die Hälfte des Beitrags und höchstens 508,59 € für die Kranken- plus 104,63 € für die Pflegeversicherung."
                >
                    <div className="relative">
                        <Euro className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                        <input
                            type="number"
                            min={0}
                            step={10}
                            value={p.z.pkvMonatsbeitrag || ''}
                            onChange={(e) => p.setzen('pkvMonatsbeitrag', Math.max(0, parseFloat(e.target.value) || 0))}
                            placeholder="z. B. 700"
                            className={cn(inputKlasse, 'pl-9 font-mono')}
                        />
                    </div>
                </Feld>
            )}

            {/* Expertenmodus - wirkt jetzt tatsaechlich */}
            <div className="overflow-hidden rounded-xl border border-slate-800">
                <button
                    onClick={() => setExpertenmodus(!expertenmodus)}
                    className="flex w-full items-center justify-between bg-slate-950 p-4 transition-colors hover:bg-slate-900"
                >
                    <span className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                        <Settings2 className="h-4 w-4 text-indigo-400" />
                        Weitere Angaben
                    </span>
                    {expertenmodus ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
                </button>

                {expertenmodus && (
                    <div className="space-y-5 border-t border-slate-800 bg-slate-900 p-4">
                        {/* Was-waere-wenn: die beiden Regler aus der frueheren Fassung,
                            wieder an ihrem alten Platz im Expertenbereich. Sie
                            veraendern nur das Ergebnis, nicht das Eingabefeld. */}
                        <div className="space-y-4 rounded-lg border border-slate-800 bg-slate-950/50 p-3">
                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1 text-sm font-semibold text-slate-300">
                                Was wäre wenn
                                <InfoTooltip
                                    text="Beide Regler wirken nur auf das Ergebnis. Dein eingegebenes Gehalt bleibt unverändert, du kannst also jederzeit auf den Ausgangswert zurück."
                                />
                            </span>
                            {p.hatAnpassung && (
                                <button
                                    onClick={() => {
                                        p.setzen('lohnerhoehungProzent', 0);
                                        p.setzen('arbeitszeitProzent', 100);
                                    }}
                                    className="flex items-center gap-1 text-xs text-slate-500 transition-colors hover:text-slate-300"
                                >
                                    <RotateCcw className="h-3 w-3" />
                                    zurücksetzen
                                </button>
                            )}
                        </div>

                        <Regler
                            label="Gehaltserhöhung"
                            wert={p.z.lohnerhoehungProzent}
                            setzen={(v) => p.setzen('lohnerhoehungProzent', v)}
                            min={0}
                            max={50}
                            schritt={1}
                            einheit="%"
                            farbe="text-emerald-400"
                        />

                        <Regler
                            label="Arbeitszeit"
                            wert={p.z.arbeitszeitProzent}
                            setzen={(v) => p.setzen('arbeitszeitProzent', v)}
                            min={10}
                            max={100}
                            schritt={5}
                            einheit="%"
                            farbe="text-indigo-400"
                        />

                        {p.hatAnpassung && (
                            <div className="rounded-lg border border-slate-800 bg-slate-900 p-2.5 text-xs">
                                <div className="flex justify-between text-slate-400">
                                    <span>Brutto neu</span>
                                    <span className="font-mono text-white">
                                        {formatEuro(p.monatlich ? p.bruttoJahr / 12 : p.bruttoJahr, 0)}
                                        {p.monatlich ? ' / Monat' : ' / Jahr'}
                                    </span>
                                </div>
                                <div className="mt-1 flex justify-between text-slate-400">
                                    <span>Wochenstunden</span>
                                    <span className="font-mono text-white">
                                        {p.wochenstundenEffektiv.toLocaleString('de-DE', { maximumFractionDigits: 1 })} h
                                    </span>
                                </div>
                            </div>
                        )}
                            </div>

                        <Feld
                            label="Einmalzahlung im Jahr"
                            hinweis="Bonus, Weihnachts- oder Urlaubsgeld. Wird als sonstiger Bezug nach § 39b Abs. 3 EStG versteuert — dabei greift der Grenzsteuersatz, nicht der Durchschnittssatz."
                        >
                            <input
                                type="number"
                                min={0}
                                step={100}
                                value={p.z.sonstigeBezuege || ''}
                                onChange={(e) => p.setzen('sonstigeBezuege', Math.max(0, parseFloat(e.target.value) || 0))}
                                placeholder="0"
                                className={cn(inputKlasse, 'font-mono')}
                            />
                        </Feld>

                        <Feld
                            label="Freibetrag lt. ELStAM"
                            hinweis="Ein beim Finanzamt eingetragener Lohnsteuerfreibetrag, z. B. für hohe Werbungskosten oder Fahrtkosten."
                        >
                            <input
                                type="number"
                                min={0}
                                step={100}
                                value={p.z.jahresfreibetrag || ''}
                                onChange={(e) => p.setzen('jahresfreibetrag', Math.max(0, parseFloat(e.target.value) || 0))}
                                placeholder="0"
                                className={cn(inputKlasse, 'font-mono')}
                            />
                        </Feld>

                        {p.z.kirchensteuer && (
                            <Feld
                                label="Kirchensteuer-Kappung"
                                hinweis="Nur für die Veranlagung relevant und in den meisten Ländern nur auf Antrag. Beim laufenden Lohnsteuerabzug gibt es keine Kappung. Leer lassen, wenn unsicher."
                            >
                                <div className="relative">
                                    <input
                                        type="number"
                                        min={2}
                                        max={4.5}
                                        step={0.25}
                                        value={p.z.kirchensteuerKappungProzent ?? ''}
                                        onChange={(e) =>
                                            p.setzen(
                                                'kirchensteuerKappungProzent',
                                                e.target.value === '' ? null : parseFloat(e.target.value)
                                            )
                                        }
                                        placeholder="keine Kappung"
                                        className={cn(inputKlasse, 'pr-8 font-mono')}
                                    />
                                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">%</span>
                                </div>
                            </Feld>
                        )}
                    </div>
                )}
            </div>

            {/* Zeitreise */}
            <button
                onClick={() => p.setAnsicht(p.ansicht === 'historisch' ? 'rechner' : 'historisch')}
                className={cn(
                    'flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-all',
                    p.ansicht === 'historisch'
                        ? 'border-amber-500/40 bg-amber-600/20 text-amber-200'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                )}
            >
                <History className="h-4 w-4" />
                {p.ansicht === 'historisch' ? 'Zurück zum Rechner' : 'Zeitreise: Wie wäre es 1958 gewesen?'}
            </button>

            {/* Auf schmalen Bildschirmen liegt das Ergebnis weit unterhalb des
                Panels. Frueher sprang die Seite nach dem Klick auf "Berechnen"
                dorthin; seit der Sofortberechnung gibt es diesen Moment nicht
                mehr, deshalb dieser ausdrueckliche Sprung. */}
            {p.hatEingabe && p.ergebnis && (
                <a
                    href="#ergebnis"
                    className="flex items-center justify-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-950/40 px-4 py-3 text-sm font-semibold text-indigo-200 transition-colors hover:bg-indigo-900/40 lg:pointer-events-none lg:border-transparent lg:bg-transparent lg:font-normal lg:text-slate-500"
                >
                    <span>{formatEuro(p.ergebnis.netto.monat)} netto im Monat</span>
                    <ArrowDown className="h-4 w-4 lg:hidden" />
                </a>
            )}
        </div>
    );
}
