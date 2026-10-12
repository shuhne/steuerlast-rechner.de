'use client';

import React, { useState } from 'react';
import { AlertTriangle, Building2, ChevronDown, ChevronUp, HeartPulse, Info, Wallet } from 'lucide-react';
import type { RechnerErgebnis } from '../../lib/tax';
import { PAP_META } from '../../lib/tax';
import { formatEuro, formatProzent, useRechner } from './useRechner';
import { RechtsstatusChip } from './EingabePanel';
import { Donut } from './Donut';
import { cn, KARTE, KARTE_PX, PERIODEN, Umschalter } from './ui';

type Props = ReturnType<typeof useRechner>;

function Zeile({
    name,
    betrag,
    erlaeuterung,
    monatlich,
    stark,
}: {
    name: string;
    betrag: number;
    erlaeuterung?: string;
    monatlich: boolean;
    stark?: boolean;
}) {
    return (
        <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className={cn('min-w-0 flex-1 [overflow-wrap:anywhere] text-slate-400', stark && 'font-semibold text-slate-200')}>
                {name}
                {erlaeuterung && (
                    <span className="ml-1.5 text-xs text-slate-400">{erlaeuterung}</span>
                )}
            </span>
            <span className={cn('shrink-0 font-mono tabular-nums text-white', stark && 'font-bold')}>
                {formatEuro(monatlich ? betrag / 12 : betrag)}
            </span>
        </div>
    );
}

export function ErgebnisPanel(p: Props) {
    // Die Anzeigeeinheit liegt im gemeinsamen Zustand. Frueher hatte dieses
    // Panel einen eigenen Umschalter, sodass man "Jaehrlich" eingeben und
    // "Monatlich" angezeigt bekommen konnte.
    const { monatlich, setMonatlich } = p;
    const [methodikOffen, setMethodikOffen] = useState(false);
    const [agOffen, setAgOffen] = useState(false);

    if (!p.hatEingabe || !p.ergebnis) {
        return (
            <div id="ergebnis" className="flex min-h-[240px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-700/70 bg-slate-900 p-5 text-center sm:p-6 lg:min-h-[360px]">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10">
                    <Wallet className="h-7 w-7 text-indigo-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">Deine Auswertung erscheint hier</h3>
                <p className="max-w-xs text-sm leading-relaxed text-slate-400">
                    {p.eingabeFehler ?? 'Gib dein Bruttogehalt ein — den Rest übernehmen wir.'}
                </p>
            </div>
        );
    }

    const e: RechnerErgebnis = p.ergebnis;
    const st = e.steuern;
    const sv = e.sozialabgaben;
    const steuernSumme =
        st.lohnsteuer + st.soli + st.kirchensteuer +
        st.lohnsteuerSonstigeBezuege + st.soliSonstigeBezuege + st.kirchensteuerSonstigeBezuege;

    // Die Ergebniskarte traegt die Farbe des Rechtsstands. Frueher war der
    // Modus an der Faerbung der ganzen Karte erkennbar; ein kleiner Chip
    // allein geht im Ueberflug unter.
    const istSzenario = e.rechtsstand.rechtsstatus !== 'geltendes_recht';
    const kartenFarbe = istSzenario
        ? 'border-rose-500/30 from-rose-900/40'
        : 'border-indigo-500/30 from-indigo-900/50';
    const akzent = istSzenario ? 'text-rose-400' : 'text-indigo-400';

    const zusammensetzung = [
        { name: 'Netto', wert: e.netto.jahr, farbe: '#4f46e5' },
        { name: 'Steuern', wert: steuernSumme, farbe: '#94a3b8' },
        { name: 'Sozialabgaben', wert: sv.summe, farbe: '#64748b' },
    ];

    return (
        // @container: Die Kennzahlen waehlen ihre Spaltenzahl nach der Breite
        // dieser Spalte, nicht nach dem Fenster. Bei 1024 px ist das Fenster
        // breit, die Ergebnisspalte neben dem Formular aber nur gut 500 px -
        // vier Kacheln liefen dort ueber ihre Raender.
        <div id="ergebnis" className="@container scroll-mt-6 space-y-5 sm:space-y-6">
            {/* Szenario-Warnung */}
            {e.rechtsstand.rechtsstatus !== 'geltendes_recht' && (
                <div className={cn('rounded-xl border border-amber-500/30 bg-amber-500/10 py-4', KARTE_PX)}>
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="font-semibold text-amber-100">
                                    {e.rechtsstand.bezeichnung}
                                </span>
                                <RechtsstatusChip status={e.rechtsstand.rechtsstatus} klein />
                            </div>
                            <p className="text-sm leading-relaxed text-amber-100/90">
                                Eine Modellrechnung, keine Vorhersage: So sähe dein Netto aus,
                                wenn die zugrunde gelegten Annahmen eintreffen.
                            </p>
                            {p.rechtsstand.nichtModelliert.length > 0 && (
                                <details className="group">
                                    <summary className="cursor-pointer list-none text-xs font-semibold text-amber-300 hover:text-amber-200">
                                        Was hier nicht eingerechnet ist
                                        <ChevronDown className="ml-1 inline h-3 w-3 transition-transform group-open:rotate-180" />
                                    </summary>
                                    <ul className="mt-2 list-disc space-y-1.5 pl-4 text-xs leading-relaxed text-amber-100/80">
                                        {p.rechtsstand.nichtModelliert.map((t, i) => (
                                            <li key={i}>{t}</li>
                                        ))}
                                    </ul>
                                </details>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Netto */}
            <div className={cn(KARTE.hervorgehoben, kartenFarbe)}>
                <div className="relative z-10">
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                            <Wallet className={cn('h-5 w-5 shrink-0', akzent)} />
                            <h3 className="text-lg font-semibold text-white">Dein Nettogehalt</h3>
                            {istSzenario && (
                                <span className="text-sm font-normal text-rose-200/80">
                                    {p.rechtsstand.kurz}
                                </span>
                            )}
                        </div>
                        <Umschalter
                            label="Ergebnis anzeigen"
                            optionen={PERIODEN}
                            wert={monatlich}
                            setzen={setMonatlich}
                        />
                    </div>
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                        <span className="text-3xl font-bold leading-tight tracking-tight text-white tabular-nums @md:text-4xl @xl:text-5xl">
                            {formatEuro(monatlich ? e.netto.monat : e.netto.jahr)}
                        </span>
                        <span className="text-base font-medium text-slate-400">
                            {monatlich ? 'im Monat' : 'im Jahr'}
                        </span>
                    </div>

                    {p.basisErgebnis && (
                        <div className="mt-4 rounded-lg border border-slate-800/50 bg-slate-950/40 p-3">
                            <div
                                className={cn(
                                    'text-lg font-bold',
                                    e.netto.jahr >= p.basisErgebnis.netto.jahr
                                        ? 'text-emerald-400'
                                        : 'text-rose-400'
                                )}
                            >
                                {e.netto.jahr >= p.basisErgebnis.netto.jahr ? '+' : ''}
                                {formatEuro(
                                    monatlich
                                        ? e.netto.monat - p.basisErgebnis.netto.monat
                                        : e.netto.jahr - p.basisErgebnis.netto.jahr
                                )}
                                <span className="ml-2 text-xs font-normal text-slate-400">
                                    gegenüber deiner Eingabe
                                </span>
                            </div>
                            <div className="mt-0.5 text-xs text-slate-400">
                                {p.z.lohnerhoehungProzent > 0 && `+${p.z.lohnerhoehungProzent} % Gehalt`}
                                {p.z.lohnerhoehungProzent > 0 && p.z.arbeitszeitProzent !== 100 && ' · '}
                                {p.z.arbeitszeitProzent !== 100 && `${p.z.arbeitszeitProzent} % Arbeitszeit`}
                            </div>
                        </div>
                    )}

                    {p.referenz && (
                        <div className="mt-4 rounded-lg border border-slate-800/50 bg-slate-950/40 p-3">
                            <div
                                className={cn(
                                    'text-lg font-bold',
                                    e.netto.jahr >= p.referenz.netto.jahr ? 'text-emerald-400' : 'text-rose-400'
                                )}
                            >
                                {e.netto.jahr >= p.referenz.netto.jahr ? '+' : ''}
                                {formatEuro(
                                    monatlich
                                        ? e.netto.monat - p.referenz.netto.monat
                                        : e.netto.jahr - p.referenz.netto.jahr
                                )}
                                <span className="ml-2 text-xs font-normal text-slate-400">
                                    gegenüber geltendem Recht 2026
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Kennzahlen. Vier Spalten erst ab 42rem Spaltenbreite (rund 160 px
                je Kachel) - darunter passen "Grenzabgabenquote" und ein
                sechsstelliger Arbeitgeberbetrag nicht in die Kachel. */}
            <div className="grid grid-cols-2 gap-3 @2xl:grid-cols-4">
                {[
                    { label: 'Abgabenquote', wert: formatProzent(e.quoten.abgabenquote), hinweis: 'Steuern und Beiträge zusammen' },
                    { label: 'Grenzabgabenquote', wert: formatProzent(e.quoten.grenzabgabenquote), hinweis: 'vom nächsten Euro' },
                    { label: 'Netto je Stunde', wert: p.stunden ? formatEuro(p.stunden.nettoJeStunde) : '–', hinweis: `bei ${p.wochenstundenEffektiv.toLocaleString('de-DE')} h/Woche` },
                    { label: 'Arbeitgeberkosten', wert: formatEuro(monatlich ? e.arbeitgeber.gesamtkosten / 12 : e.arbeitgeber.gesamtkosten), hinweis: `Brutto plus AG-Anteile, ${monatlich ? 'pro Monat' : 'pro Jahr'}` },
                ].map((k) => (
                    <div key={k.label} className={cn(KARTE.kennzahl, "flex flex-col")}>
                        <div className="min-h-8 text-xs leading-4 hyphens-auto [overflow-wrap:anywhere] text-slate-400 @md:text-sm">{k.label}</div>
                        <div className="mt-1 whitespace-nowrap font-mono text-base font-semibold text-white @md:text-lg">{k.wert}</div>
                        <div className="mt-auto pt-2 text-xs leading-relaxed text-slate-400">{k.hinweis}</div>
                    </div>
                ))}
            </div>

            {/* Zusammensetzung - der schnelle Blick auf die Anteile */}
            <div className={KARTE.standard}>
                <h3 className="mb-4 text-lg font-semibold text-white">Zusammensetzung</h3>
                <div className="flex flex-col items-center gap-6 @xl:flex-row @xl:justify-center @xl:gap-10">
                    <Donut
                        segmente={zusammensetzung}
                        titel="Brutto"
                        wert={formatEuro(monatlich ? e.brutto / 12 : e.brutto, 0)}
                    />
                    <ul className="w-full max-w-xs space-y-2 @xl:w-auto">
                        {zusammensetzung.map((eintrag) => (
                            <li key={eintrag.name} className="flex items-center justify-between gap-4 text-sm">
                                <span className="flex items-center gap-2 text-slate-300">
                                    <span
                                        className="h-3 w-3 shrink-0 rounded-full"
                                        style={{ backgroundColor: eintrag.farbe }}
                                    />
                                    {eintrag.name}
                                </span>
                                <span className="flex items-baseline gap-3 font-mono">
                                    <span className="text-slate-400">
                                        {e.brutto > 0 ? formatProzent((eintrag.wert / e.brutto) * 100) : '–'}
                                    </span>
                                    <span className="w-24 text-right text-white">
                                        {formatEuro(monatlich ? eintrag.wert / 12 : eintrag.wert, 0)}
                                    </span>
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Abzüge */}
            <div className={KARTE.standard}>
                <h3 className="mb-4 text-lg font-semibold text-white">
                    Abzüge im Detail <span className="text-sm font-normal text-slate-400">({monatlich ? 'monatlich' : 'jährlich'})</span>
                </h3>

                <div className="space-y-5">
                    <div>
                        <div className="mb-3 flex items-center gap-2 font-medium text-slate-100">
                            <Building2 className="h-4 w-4 text-emerald-400" />
                            Steuern
                        </div>
                        <div className="space-y-2 rounded-lg border border-slate-800/50 bg-slate-950/50 p-3">
                            <Zeile name="Lohnsteuer" betrag={st.lohnsteuer} monatlich={monatlich} />
                            <Zeile
                                name="Solidaritätszuschlag"
                                erlaeuterung={st.soli === 0 ? '(unter der Freigrenze)' : undefined}
                                betrag={st.soli}
                                monatlich={monatlich}
                            />
                            {p.z.kirchensteuer && (
                                <Zeile
                                    name="Kirchensteuer"
                                    erlaeuterung={`${(p.z.bundesland === 'BY' || p.z.bundesland === 'BW' ? 8 : 9)} %`}
                                    betrag={st.kirchensteuer}
                                    monatlich={monatlich}
                                />
                            )}
                            {p.z.sonstigeBezuege > 0 && (
                                <>
                                    <Zeile name="Lohnsteuer auf Einmalzahlung" betrag={st.lohnsteuerSonstigeBezuege} monatlich={monatlich} />
                                    {st.soliSonstigeBezuege > 0 && (
                                        <Zeile name="Soli auf Einmalzahlung" betrag={st.soliSonstigeBezuege} monatlich={monatlich} />
                                    )}
                                    {p.z.kirchensteuer && st.kirchensteuerSonstigeBezuege > 0 && (
                                        <Zeile name="Kirchensteuer auf Einmalzahlung" betrag={st.kirchensteuerSonstigeBezuege} monatlich={monatlich} />
                                    )}
                                </>
                            )}
                            <div className="border-t border-slate-800 pt-2">
                                <Zeile name="Summe Steuern" betrag={steuernSumme} monatlich={monatlich} stark />
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="mb-3 flex items-center gap-2 font-medium text-slate-100">
                            <HeartPulse className="h-4 w-4 text-rose-400" />
                            Sozialabgaben
                            {sv.art !== 'regulaer' && (
                                <span className="rounded border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-xs font-semibold text-amber-300">
                                    {sv.art === 'minijob' ? 'Minijob' : 'Übergangsbereich'}
                                </span>
                            )}
                        </div>
                        <div className="space-y-2 rounded-lg border border-slate-800/50 bg-slate-950/50 p-3">
                            <Zeile name="Rentenversicherung" erlaeuterung={formatProzent(sv.saetze.rv * 100, 2)} betrag={sv.rv} monatlich={monatlich} />
                            <Zeile name="Arbeitslosenversicherung" erlaeuterung={formatProzent(sv.saetze.av * 100, 2)} betrag={sv.av} monatlich={monatlich} />
                            <Zeile
                                name="Krankenversicherung"
                                erlaeuterung={p.z.krankenversicherung === 'privat' ? '(privat, nach AG-Zuschuss)' : formatProzent(sv.saetze.kv * 100, 2)}
                                betrag={sv.kv}
                                monatlich={monatlich}
                            />
                            <Zeile
                                name="Pflegeversicherung"
                                erlaeuterung={p.z.krankenversicherung === 'privat' ? '(im PKV-Beitrag enthalten)' : formatProzent(sv.saetze.pv * 100, 2)}
                                betrag={sv.pv}
                                monatlich={monatlich}
                            />
                            <div className="border-t border-slate-800 pt-2">
                                <Zeile name="Summe Sozialabgaben" betrag={sv.summe} monatlich={monatlich} stark />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-indigo-500/20 bg-indigo-950/30 p-3">
                        <Zeile name="Bruttogehalt" betrag={e.brutto} monatlich={monatlich} />
                        <Zeile name="abzüglich Steuern und Beiträge" betrag={-(steuernSumme + sv.summe)} monatlich={monatlich} />
                        <div className="mt-2 border-t border-indigo-500/20 pt-2">
                            <Zeile name="Nettogehalt" betrag={e.netto.jahr} monatlich={monatlich} stark />
                        </div>
                    </div>
                </div>

                {/* Arbeitgeberanteile */}
                <div className="mt-4 overflow-hidden rounded-lg border border-slate-800">
                    <button
                        onClick={() => setAgOffen(!agOffen)}
                        aria-expanded={agOffen}
                        className="flex min-h-11 w-full items-center justify-between gap-3 bg-slate-950/50 px-3 py-2 text-left text-sm text-slate-300 transition-colors hover:bg-slate-950"
                    >
                        <span>Was dein Arbeitgeber zusätzlich zahlt</span>
                        <span className="flex items-center gap-2">
                            <span className="font-mono tabular-nums text-white">
                                {formatEuro(monatlich ? e.arbeitgeber.summe / 12 : e.arbeitgeber.summe)}
                            </span>
                            {agOffen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </span>
                    </button>
                    {agOffen && (
                        <div className="space-y-2 border-t border-slate-800 bg-slate-950/30 p-3">
                            <Zeile name="Rentenversicherung" betrag={e.arbeitgeber.rv} monatlich={monatlich} />
                            <Zeile name="Arbeitslosenversicherung" betrag={e.arbeitgeber.av} monatlich={monatlich} />
                            <Zeile name="Krankenversicherung" betrag={e.arbeitgeber.kv} monatlich={monatlich} />
                            <Zeile name="Pflegeversicherung" betrag={e.arbeitgeber.pv} monatlich={monatlich} />
                            <div className="border-t border-slate-800 pt-2">
                                <Zeile name="Gesamtkosten der Stelle" betrag={e.arbeitgeber.gesamtkosten} monatlich={monatlich} stark />
                            </div>
                            <p className="pt-1 text-xs leading-relaxed text-slate-400">
                                Ohne Umlagen U1/U2/U3 und ohne Beiträge zur gesetzlichen Unfallversicherung.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Hinweise */}
            {e.hinweise.length > 0 && (
                <div className={cn('space-y-2 rounded-xl border border-slate-800 bg-slate-900/60 py-4', KARTE_PX)}>
                    {e.hinweise.map((h, i) => (
                        <div key={i} className="flex gap-2 text-sm leading-relaxed text-slate-400">
                            <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                            <span>{h}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Methodenkasten */}
            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
                <button
                    onClick={() => setMethodikOffen(!methodikOffen)}
                    aria-expanded={methodikOffen}
                    className={cn('flex min-h-11 w-full items-center justify-between py-3 text-left transition-colors hover:bg-slate-950/40', KARTE_PX)}
                >
                    <span className="text-sm font-semibold text-slate-300">Stand und Quellen</span>
                    {methodikOffen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                </button>
                <div className={cn('border-t border-slate-800 py-3 text-xs leading-relaxed text-slate-400', KARTE_PX)}>
                    Berechnet nach dem amtlichen Programmablaufplan {PAP_META.jahr} des BMF
                    (Version {PAP_META.version}, Stand {PAP_META.stand}).
                    Sozialversicherung: {p.rechtsstand.bezeichnung}.
                    {istSzenario && ' Die Steuerberechnung berücksichtigt noch nicht alle Änderungen des Szenarios.'}
                </div>
                {methodikOffen && (
                    <div className={cn('space-y-3 border-t border-slate-800 bg-slate-950/30 py-4 text-xs leading-relaxed text-slate-400', KARTE_PX)}>
                        {[
                            { label: 'Beitragsbemessungsgrenze Rente / Arbeitslosigkeit', param: p.rechtsstand.sv.bbgRvAv },
                            { label: 'Beitragsbemessungsgrenze Krankenversicherung', param: p.rechtsstand.sv.bbgKv },
                            { label: 'Beitragsbemessungsgrenze Pflegeversicherung', param: p.rechtsstand.sv.bbgPv },
                            { label: 'Allgemeine Versicherungspflichtgrenze', param: p.rechtsstand.sv.jaeg },
                            { label: 'Vorläufiges Durchschnittsentgelt Rente', param: p.rechtsstand.sv.durchschnittsentgelt },
                            ...(!istSzenario ? [
                                { label: 'Rentenbeitrag', param: p.rechtsstand.sv.rvSatz },
                                { label: 'Arbeitslosenbeitrag', param: p.rechtsstand.sv.avSatz },
                                { label: 'Allgemeiner Krankenbeitrag', param: p.rechtsstand.sv.kvAllgemein },
                                { label: 'Durchschnittlicher Zusatzbeitrag', param: p.rechtsstand.sv.kvZusatzDurchschnitt },
                                { label: 'Pflegebeitrag', param: p.rechtsstand.sv.pvSatz },
                                { label: 'Mindestlohn', param: p.rechtsstand.sv.mindestlohn },
                            ] : []),
                        ].map(({ label, param }) => (
                            <div key={label} className="border-l-2 border-slate-800 pl-3">
                                <div>{label}</div>
                                <div className="font-mono text-slate-300">
                                    {param.einheit === 'EUR/Jahr' || param.einheit === 'EUR/Stunde'
                                        ? formatEuro(param.wert)
                                        : formatProzent(param.wert * 100, 2)}
                                    {param.einheit ? ` ${param.einheit.replace('EUR', '')}` : ''}
                                </div>
                                {istSzenario && <RechtsstatusChip status={param.rechtsstatus} klein />}
                                <div className="text-slate-400">
                                    {param.quelle.herausgeber}:{' '}
                                    {param.quelle.url ? (
                                        <a href={param.quelle.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-300">
                                            {param.quelle.titel}
                                        </a>
                                    ) : param.quelle.titel}
                                    {param.quelle.fundstelle ? ` — ${param.quelle.fundstelle}` : ''}
                                </div>
                                {param.hinweis && <div className="mt-1 text-slate-400">{param.hinweis}</div>}
                            </div>
                        ))}
                        <p className="text-sm text-slate-300">Verwendeter Zusatzbeitrag: {((p.z.eigenerZusatzbeitrag ? undefined : p.rechtsstand.svUeberschreibungen?.kvZusatz) ?? p.z.kvZusatzProzent / 100) * 100} % ({p.z.eigenerZusatzbeitrag || p.rechtsstand.svUeberschreibungen?.kvZusatz === undefined ? 'eigene Eingabe' : 'Szenarioannahme'}).</p>
                        {p.rechtsstand.annahmen.map((annahme, i) => (
                            <div key={`annahme-${i}`} className="space-y-1 border-l-2 border-amber-500/30 pl-3">
                                <RechtsstatusChip status={annahme.rechtsstatus} klein />
                                <div>{annahme.text}</div>
                                <div className="text-slate-400">
                                    {annahme.quelle.url ? (
                                        <a href={annahme.quelle.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-300">
                                            {annahme.quelle.herausgeber}: {annahme.quelle.titel}
                                        </a>
                                    ) : `${annahme.quelle.herausgeber}: ${annahme.quelle.titel}`}
                                </div>
                            </div>
                        ))}
                        <p className="border-t border-slate-800 pt-3 text-slate-400">
                            Die Berechnung bildet den laufenden Lohnsteuerabzug ab. Die endgültige
                            Steuer ergibt sich erst aus der Einkommensteuerveranlagung. Nicht
                            abgebildet sind unter anderem betriebliche Altersvorsorge,
                            geldwerte Vorteile, Faktorverfahren und Mehrfachbeschäftigung.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
