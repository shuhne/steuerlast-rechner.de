'use client';

import React, { useState } from 'react';
import { ArrowDown, Calculator, ChevronDown, ChevronUp, Euro, RotateCcw, Settings2, Trash2 } from 'lucide-react';
import { RECHTSSTAENDE, RECHTSSTAND_GELTEND, RECHTSSTATUS_LABEL, svWerte, SV_2026 } from '../../lib/tax';
import { formatEuro, parseZahl, useRechner } from './useRechner';
import { InfoTooltip } from './InfoTooltip';
import { cn, JA_NEIN, KARTE, STEUER_HOEHE, Umschalter } from './ui';

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
                klein ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
                STATUS_FARBE[status] ?? 'bg-slate-700/40 text-slate-300 border-slate-600'
            )}
        >
            {RECHTSSTATUS_LABEL[status as keyof typeof RECHTSSTATUS_LABEL] ?? status}
        </span>
    );
}

type Props = ReturnType<typeof useRechner>;

/** Kleines Etikett rechts in der Beschriftungszeile, passt in deren 20 px. */
function Etikett({ children }: { children: React.ReactNode }) {
    return (
        <span className="ml-auto rounded border border-emerald-500/20 bg-emerald-900/20 px-1.5 text-xs leading-5 text-emerald-400">
            {children}
        </span>
    );
}

/**
 * Beschriftetes Feld. Die Erlaeuterung steckt im Tooltip statt als Dauertext
 * darunter - das haelt das Panel kurz genug, damit es im Fenster bleibt.
 *
 * Die Beschriftungszeile ist mindestens 24 px hoch, mit und ohne Info-Symbol.
 * Bricht eine Beschriftung auf sehr schmalen Geraeten doch einmal um, sorgt
 * `mt-auto` dafuer, dass die Eingabefelder einer Rasterzeile trotzdem auf
 * einer Linie stehen: Das Raster streckt beide Felder auf gleiche Hoehe, das
 * Bedienelement sitzt jeweils unten.
 */
function Feld({
    label,
    hinweis,
    zusatz,
    className,
    children,
}: {
    label: string;
    hinweis?: string;
    /** Etikett rechts in der Beschriftungszeile, z. B. ein Status. */
    zusatz?: React.ReactNode;
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <div className={cn('flex min-w-0 flex-col gap-1.5', className)}>
            <span className="flex min-h-6 flex-wrap items-center gap-x-1.5 text-[13px] font-medium leading-5 text-slate-400">
                <span>
                    {label}
                    {hinweis && (
                        <>
                            {/* Untrennbar an das letzte Wort gebunden, damit das
                                Symbol nicht allein in eine neue Zeile rutscht. */}
                            {'\u00a0'}
                            <InfoTooltip label={label} text={hinweis} />
                        </>
                    )}
                </span>
                {zusatz}
            </span>
            <div className="mt-auto">{children}</div>
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
        <div className="space-y-2">
            <div className="flex items-baseline justify-between">
                <label className="text-sm text-slate-400">{label}</label>
                <span className={cn('font-mono text-sm font-semibold', farbe)}>
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

// Alle regulaeren Bedienelemente sind 48 px hoch. Vorher lagen Textfelder je nach
// Schriftgroesse bei 42 oder 46 px, Schaltflaechen bei 44 px - nebeneinander
// sichtbar ungleich.
const inputKlasse =
    `${STEUER_HOEHE} w-full rounded-lg border border-slate-800 bg-slate-950 px-3 text-base text-white ` +
    'focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm';

const auswahlKlasse = cn(inputKlasse, 'cursor-pointer appearance-none truncate pr-8');

// Zahlenfelder ohne die nativen Spinner des Browsers - die sind je nach
// Browser unterschiedlich gross und lassen sich nicht gestalten.
const ohneSpinner =
    '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none ' +
    '[&::-webkit-inner-spin-button]:appearance-none';

function Auswahlpfeil() {
    return <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />;
}

/**
 * Zahlenfeld mit eigenen Plus/Minus-Schaltflaechen.
 *
 * Die nativen Spinner sind auf Touch-Geraeten kaum treffbar und in Firefox gar
 * nicht vorhanden. Eigene Schaltflaechen sind gross genug und ueberall gleich.
 *
 * Die Schaltflaechen sitzen wie vor dem UI-Umbau vom September 2026
 * rechts im Feld. Eine eigene Zeile wuerde das Eingabepanel verlaengern.
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
    const basis = Number.isFinite(wert) ? wert : min;
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
                className={cn(inputKlasse, suffix ? 'pr-16' : 'pr-12', 'font-mono', ohneSpinner)}
            />
            {suffix && (
                <span className="pointer-events-none absolute right-12 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                    {suffix}
                </span>
            )}
            <div className="absolute inset-y-0 right-0 flex w-10 flex-col overflow-hidden rounded-r-lg border-l border-slate-800 bg-slate-900/70">
                <button
                    type="button"
                    onClick={() => setzen(begrenzen(runden(basis + schritt)))}
                    disabled={basis >= max}
                    aria-label={`${ariaLabel} erhöhen`}
                    className="flex min-h-6 flex-1 items-center justify-center text-sm font-semibold text-slate-400 transition-colors hover:bg-slate-800 hover:text-white focus-visible:outline-2 focus-visible:outline-indigo-400 disabled:text-slate-600"
                >
                    +
                </button>
                <button
                    type="button"
                    onClick={() => setzen(begrenzen(runden(basis - schritt)))}
                    disabled={basis <= min}
                    aria-label={`${ariaLabel} verringern`}
                    className="flex min-h-6 flex-1 items-center justify-center text-sm font-semibold text-slate-400 transition-colors hover:bg-slate-800 hover:text-white focus-visible:outline-2 focus-visible:outline-indigo-400 disabled:text-slate-600"
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
    const zusatzUeberschrieben = p.rechtsstand.svUeberschreibungen?.kvZusatz;

    return (
        <div className={cn(KARTE.standard, 'space-y-4 shadow-xl shadow-slate-950/50')}>
            <div className="flex h-6 items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-400">
                    <Calculator className="h-5 w-5" />
                    <h2 className="text-lg font-semibold text-white">Deine Angaben</h2>
                </div>
                {p.hatEingabe && (
                    <button
                        onClick={p.zuruecksetzen}
                        className="relative rounded p-1 text-slate-400 transition-colors after:absolute after:-inset-2.5 hover:bg-slate-800 hover:text-slate-300"
                        title="Zurücksetzen"
                        aria-label="Alle Eingaben zurücksetzen"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Der Periodenschalter sitzt wieder rechts im Gehaltsfeld. */}
            <Feld label="Bruttogehalt">
                <div className="group relative">
                    <Euro className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400" />
                    <input
                        type="text"
                        inputMode="decimal"
                        value={p.z.bruttoEingabe}
                        onChange={(e) => p.setzen('bruttoEingabe', e.target.value)}
                        onBlur={() => {
                            const v = parseZahl(p.z.bruttoEingabe);
                            if (v > 0) p.setzen('bruttoEingabe', v.toLocaleString('de-DE'));
                        }}
                        placeholder="z. B. 50.000"
                        className={cn(inputKlasse, 'h-14 pl-10 pr-24 font-mono text-xl sm:text-xl')}
                        aria-label={`Bruttogehalt ${p.monatlich ? 'pro Monat' : 'pro Jahr'}`}
                        aria-invalid={!!p.bruttoFehler}
                        aria-describedby={p.bruttoFehler ? "brutto-fehler" : undefined}
                    />
                    <div role="group" aria-label="Bruttogehalt angeben" className="absolute bottom-1 right-1 top-1 flex w-20 flex-col gap-0.5 rounded border border-slate-800 bg-slate-900 p-0.5">
                        {(['jahr', 'monat'] as const).map((per) => (
                            <button
                                key={per}
                                type="button"
                                onClick={() => p.setPeriode(per)}
                                aria-pressed={p.z.periode === per}
                                className={cn(
                                    'flex flex-1 items-center justify-center rounded text-xs font-bold uppercase transition-colors focus-visible:outline-2 focus-visible:outline-indigo-400',
                                    p.z.periode === per ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                                )}
                            >
                                {per === 'jahr' ? 'Jährlich' : 'Monatlich'}
                            </button>
                        ))}
                    </div>
                </div>
            </Feld>

            {p.bruttoFehler && <p id="brutto-fehler" role="alert" className="text-sm text-rose-300">{p.bruttoFehler}</p>}

            {/* Rechtsstand */}
            {/* Ohne Status-Chip: Der Rechtsstand steht bereits im Namen der
                Auswahl, und bei Szenarien weist die Ergebniskarte deutlich
                genug darauf hin. Ein farbiger Chip an jedem Zustand - auch am
                Normalfall "geltendes Recht" - war visuelles Rauschen. */}
            <Feld label="Rechtsstand" hinweis={p.ansicht === 'historisch' ? 'Historischer Vergleich mit 1958: wahlweise lohn- oder kaufkraftbereinigt. Die Grenzen des Modells stehen im Ergebnis.' : p.rechtsstand.beschreibung}>
                <div className="relative">
                    <select
                        value={p.ansicht === 'historisch' ? 'historisch-1958' : p.z.szenarioId}
                        onChange={(e) => {
                            const historisch = e.target.value === 'historisch-1958';
                            p.setzen('szenarioId', historisch ? RECHTSSTAND_GELTEND.id : e.target.value);
                            p.setAnsicht(historisch ? 'historisch' : 'rechner');
                        }}
                        className={auswahlKlasse}
                        aria-label="Rechtsstand oder Szenario wählen"
                    >
                        {RECHTSSTAENDE.map((r) => (
                            <option key={r.id} value={r.id}>
                                {r.bezeichnung}
                            </option>
                        ))}
                        <option value="historisch-1958">Zeitreise 1958 (historischer Vergleich)</option>
                    </select>
                    <Auswahlpfeil />
                </div>
            </Feld>

            {/* Steuerklasse */}
            <Feld label="Steuerklasse">
                <div className="grid grid-cols-6 gap-1.5" role="group" aria-label="Steuerklasse">
                    {[1, 2, 3, 4, 5, 6].map((k) => (
                        <button
                            key={k}
                            onClick={() => p.setzen('steuerklasse', k)}
                            aria-pressed={p.z.steuerklasse === k}
                            className={cn(
                                STEUER_HOEHE,
                                'rounded-md border font-mono text-sm font-semibold transition-colors',
                                p.z.steuerklasse === k
                                    ? 'border-indigo-500 bg-indigo-600 text-white'
                                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                            )}
                        >
                            {k}
                        </button>
                    ))}
                </div>
            </Feld>

            {/* Paarweise gruppiert: Ort und Konfession, Person und Umfang,
                Elternstatus und Kinderzahl, Kasse und Beitrag. */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-4 sm:gap-x-4">
                <Feld label="Bundesland">
                    <div className="relative">
                        <select
                            aria-label="Bundesland"
                            value={p.z.bundesland}
                            onChange={(e) => p.setzen('bundesland', e.target.value)}
                            className={auswahlKlasse}
                        >
                            {BUNDESLAENDER.map(([k, n]) => (
                                <option key={k} value={k}>{n}</option>
                            ))}
                        </select>
                        <Auswahlpfeil />
                    </div>
                </Feld>

                <Feld label="Kirchensteuer">
                    <Umschalter
                        label="Kirchensteuer"
                        optionen={JA_NEIN}
                        wert={p.z.kirchensteuer}
                        setzen={(v) => p.setzen('kirchensteuer', v)}
                        className="w-full"
                    />
                </Feld>

                <Feld label="Alter" zusatz={p.z.alter > 64 && <Etikett>Altersentlastung</Etikett>}>
                    <ZahlFeld
                        wert={p.z.alter}
                        setzen={(v) => p.setzen('alter', v)}
                        min={14}
                        max={100}
                        ariaLabel="Alter"
                    />
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

                <Feld label="Elternteil" hinweis="Für die Pflegeversicherung gilt die Elterneigenschaft lebenslang, auch wenn alle Kinder älter als 25 sind. Steuerliche Kinderfreibeträge sind die separate Angabe daneben.">
                    <Umschalter
                        label="Elterneigenschaft"
                        optionen={JA_NEIN}
                        wert={p.z.hatKinder}
                        setzen={(v) => p.setzen('hatKinder', v)}
                        className="w-full"
                    />
                </Feld>
                <Feld label="Kinderfreibeträge" hinweis="Steuerlicher Zähler, meist 0,5 je Kind und Elternteil. Unabhängig von den Kindern unter 25 in der Pflegeversicherung. Wirkt auf Solidaritätszuschlag und Kirchensteuer.">
                    <ZahlFeld wert={p.z.kinderfreibetraege} setzen={(v) => p.setzen('kinderfreibetraege', v)} min={0} max={20} schritt={0.5} ariaLabel="Kinderfreibeträge lt. ELStAM" />
                </Feld>

                {p.z.hatKinder && <Feld label="Kinder unter 25" className="col-span-2" hinweis="Nur ganze Kinder zählen für die Beitragsabschläge der Pflegeversicherung. Sind alle Kinder älter, trage 0 ein; die Elterneigenschaft bleibt bestehen.">
                    <ZahlFeld wert={p.z.kinderUnter25} setzen={(v) => p.setzen('kinderUnter25', v)} min={0} max={20} ariaLabel="Kinder unter 25" />
                </Feld>}

                {/* Beginnt immer in einer neuen Zeile, damit Kasse und Beitrag
                    nebeneinander stehen - auch wenn das Kinderfeld fehlt. */}
                <Feld
                    label={'Kranken\u00adversicherung'}
                    className="col-start-1"
                    hinweis={p.pkvMoeglich ? undefined : `Die allgemeine Jahresarbeitsentgeltgrenze im gewählten Rechtsstand ${p.rechtsstand.jahr} liegt bei ${formatEuro(p.rechtsstand.sv.jaeg.wert, 0)}. Das regelmäßige Jahresarbeitsentgelt muss diese Grenze überschreiten. Sonderregeln für Bestandsfälle sind nicht abgebildet.`}
                    zusatz={p.pkvMoeglich && <Etikett>Über JAEG</Etikett>}
                >
                    <div className="relative">
                        <select
                            value={p.z.krankenversicherung}
                            onChange={(e) => p.setzen('krankenversicherung', e.target.value as 'gesetzlich' | 'privat')}
                            aria-label="Krankenversicherung"
                            className={cn(auswahlKlasse, 'disabled:opacity-60')}
                        >
                            <option value="gesetzlich">Gesetzlich</option>
                            <option value="privat">Privat</option>
                        </select>
                        <Auswahlpfeil />
                    </div>
                </Feld>

                {/* KV-Zusatzbeitrag: jetzt Hauptfeld statt wirkungslosem Expertenfeld */}
                {p.z.krankenversicherung === 'gesetzlich' ? (
                    <Feld
                        label="Zusatzbeitrag"
                        hinweis={`Zusatzbeitrag deiner Krankenkasse. Standard ist der rechnerische Durchschnitt von ${(sv.kvZusatzDurchschnitt * 100)
                            .toLocaleString('de-DE', { minimumFractionDigits: 1 })} % nach § 242a SGB V. Der tatsächlich gewichtete Kassendurchschnitt lag im Januar 2026 bei rund 3,1 %. Den eigenen Satz findest du auf der Website deiner Kasse.`}
                    >
                        <div className="space-y-2">
                            {zusatzUeberschrieben !== undefined && (
                                <div className="relative">
                                    <select aria-label="Zusatzbeitrag verwenden" className={auswahlKlasse} value={p.z.eigenerZusatzbeitrag ? 'eigen' : 'szenario'} onChange={(e) => p.setzen('eigenerZusatzbeitrag', e.target.value === 'eigen')}>
                                        <option value="szenario">Szenario: {(zusatzUeberschrieben * 100).toLocaleString('de-DE')} %</option>
                                        <option value="eigen">Eigener Satz</option>
                                    </select>
                                    <Auswahlpfeil />
                                </div>
                            )}
                            {(p.z.eigenerZusatzbeitrag || zusatzUeberschrieben === undefined) && <ZahlFeld
                                wert={p.z.kvZusatzProzent}
                                setzen={(v) => p.setzen('kvZusatzProzent', v)}
                                min={0}
                                max={10}
                                schritt={0.1}
                                suffix="%"
                                ariaLabel="Zusatzbeitrag der Krankenkasse"
                            />}
                        </div>
                    </Feld>
                ) : (
                    <Feld
                        label="PKV / Monat"
                        hinweis="Voller Monatsbeitrag inklusive Pflegepflichtversicherung. Der Arbeitgeberzuschuss wird durch den halben Beitrag und die Grenzen des gewählten Rechtsstands begrenzt. Die Aufteilung in Basisabsicherung und Mehrleistungen ist nicht modelliert."
                    >
                        <div className="relative">
                            <Euro className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="number"
                                min={0}
                                step={10}
                                aria-label="PKV-Beitrag im Monat"
                                value={p.z.pkvMonatsbeitrag || ''}
                                onChange={(e) => p.setzen('pkvMonatsbeitrag', Math.max(0, parseFloat(e.target.value) || 0))}
                                placeholder="z. B. 700"
                                className={cn(inputKlasse, 'pl-9 font-mono', ohneSpinner)}
                            />
                        </div>
                    </Feld>
                )}
            </div>

            {p.z.krankenversicherung === 'privat' && !p.pkvMoeglich && <p className="text-sm text-amber-200">Unter der allgemeinen Jahresarbeitsentgeltgrenze: Die Auswahl bildet eine bestehende PKV ab. Ob du privat versichert bleiben darfst, hängt von deinem Versicherungsstatus ab.</p>}

            {/* Expertenmodus - wirkt jetzt tatsaechlich */}
            <div className="overflow-hidden rounded-lg border border-slate-800">
                <button
                    onClick={() => setExpertenmodus(!expertenmodus)}
                    aria-expanded={expertenmodus}
                    className={cn(STEUER_HOEHE, 'flex w-full items-center justify-between bg-slate-950 px-4 transition-colors hover:bg-slate-900')}
                >
                    <span className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                        <Settings2 className="h-4 w-4 text-indigo-400" />
                        Weitere Angaben
                    </span>
                    {expertenmodus ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                </button>

                {expertenmodus && (
                    <div className="space-y-5 border-t border-slate-800 bg-slate-900 p-4">
                        {/* Was-waere-wenn: die beiden Regler aus der frueheren Fassung,
                            wieder an ihrem alten Platz im Expertenbereich. Sie
                            veraendern nur das Ergebnis, nicht das Eingabefeld. */}
                        <div className="space-y-4 rounded-lg border border-slate-800 bg-slate-950/50 p-3">
                        <div className="flex h-5 items-center justify-between">
                            <span className="text-sm font-semibold text-slate-300">
                                Was wäre wenn{'\u00a0'}
                                <InfoTooltip
                                    label="Was wäre wenn"
                                    text="Beide Regler wirken nur auf das Ergebnis. Dein eingegebenes Gehalt bleibt unverändert, du kannst also jederzeit auf den Ausgangswert zurück."
                                />
                            </span>
                            {p.hatAnpassung && (
                                <button
                                    onClick={() => {
                                        p.setzen('lohnerhoehungProzent', 0);
                                        p.setzen('arbeitszeitProzent', 100);
                                    }}
                                    className="relative flex items-center gap-1 text-xs text-slate-400 transition-colors after:absolute after:-inset-x-2 after:-inset-y-3 hover:text-slate-300"
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
                            <div className="space-y-1 rounded-lg border border-slate-800 bg-slate-900 p-3 text-sm">
                                <div className="flex justify-between text-slate-400">
                                    <span>Brutto neu</span>
                                    <span className="font-mono text-white">
                                        {formatEuro(p.monatlich ? p.bruttoJahr / 12 : p.bruttoJahr, 0)}
                                        {p.monatlich ? ' / Monat' : ' / Jahr'}
                                    </span>
                                </div>
                                <div className="flex justify-between text-slate-400">
                                    <span>Wochenstunden</span>
                                    <span className="font-mono text-white">
                                        {p.wochenstundenEffektiv.toLocaleString('de-DE', { maximumFractionDigits: 1 })} h
                                    </span>
                                </div>
                            </div>
                        )}
                            </div>

                        <Feld
                            label="Bonus im Dezember"
                            hinweis="Einmalzahlung bei ganzjähriger Beschäftigung mit gleichbleibendem Monatslohn. Sozialbeiträge bis zur noch freien Jahresgrenze (§ 23a SGB IV), Besteuerung als sonstiger Bezug (§ 39b Abs. 3 EStG). Andere Zahlungsmonate, Unterbrechungen und Mini-/Midijobs sind nicht modelliert."
                        >
                            <div className="relative">
                                <Euro className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="number"
                                    min={0}
                                    step={100}
                                    aria-label="Bonus im Dezember"
                                    value={p.z.sonstigeBezuege || ''}
                                    onChange={(e) => p.setzen('sonstigeBezuege', Math.max(0, parseFloat(e.target.value) || 0))}
                                    placeholder="0"
                                    className={cn(inputKlasse, 'pl-9 font-mono', ohneSpinner)}
                                />
                            </div>
                        </Feld>

                        <Feld
                            label="Freibetrag lt. ELStAM"
                            hinweis="Ein beim Finanzamt eingetragener Lohnsteuerfreibetrag, z. B. für hohe Werbungskosten oder Fahrtkosten."
                        >
                            <div className="relative">
                                <Euro className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="number"
                                    min={0}
                                    step={100}
                                    aria-label="Freibetrag lt. ELStAM"
                                    value={p.z.jahresfreibetrag || ''}
                                    onChange={(e) => p.setzen('jahresfreibetrag', Math.max(0, parseFloat(e.target.value) || 0))}
                                    placeholder="0"
                                    className={cn(inputKlasse, 'pl-9 font-mono', ohneSpinner)}
                                />
                            </div>
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
                                        aria-label="Kirchensteuer-Kappung"
                                value={p.z.kirchensteuerKappungProzent ?? ''}
                                        onChange={(e) =>
                                            p.setzen(
                                                'kirchensteuerKappungProzent',
                                                e.target.value === '' ? null : parseFloat(e.target.value)
                                            )
                                        }
                                        placeholder="keine Kappung"
                                        className={cn(inputKlasse, 'pr-8 font-mono', ohneSpinner)}
                                    />
                                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">%</span>
                                </div>
                            </Feld>
                        )}
                    </div>
                )}
            </div>

            {p.eingabeFehler && !p.bruttoFehler && <p role="alert" className="text-sm text-rose-300">{p.eingabeFehler}</p>}

            {/* Auf schmalen Bildschirmen liegt das Ergebnis weit unterhalb des
                Panels. Frueher sprang die Seite nach dem Klick auf "Berechnen"
                dorthin; seit der Sofortberechnung gibt es diesen Moment nicht
                mehr, deshalb dieser ausdrueckliche Sprung. */}
            {p.hatEingabe && p.ergebnis && (
                <a
                    href="#ergebnis"
                    className={cn(
                        STEUER_HOEHE,
                        'flex items-center justify-center gap-2 rounded-lg border border-indigo-500/30 bg-indigo-950/40 px-4 text-sm font-semibold text-indigo-200 transition-colors hover:bg-indigo-900/40',
                        'lg:pointer-events-none lg:h-auto lg:border-transparent lg:bg-transparent lg:font-normal lg:text-slate-400'
                    )}
                >
                    <span>{p.ansicht === 'historisch' ? 'Zum Vergleich mit 1958' : `${formatEuro(p.ergebnis.netto.monat)} netto im Monat`}</span>
                    <ArrowDown className="h-4 w-4 lg:hidden" />
                </a>
            )}
        </div>
    );
}
