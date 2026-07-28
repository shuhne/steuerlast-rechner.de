import { euroRunden } from './runden';
import { SV_2026, SvParameter, werte } from './parameter/sozialversicherung';

/**
 * Sozialversicherungsbeitraege
 * ============================
 *
 * Bildet ab:
 * - Regelfall mit Beitragsbemessungsgrenzen
 * - Uebergangsbereich (Midijob) nach § 20 Abs. 2a SGB IV
 * - Geringfuegige Beschaeftigung (Minijob)
 * - Sachsen-Sonderregel der Pflegeversicherung
 * - Zuschlag fuer Kinderlose und Abschlaege ab dem 2. Kind
 * - Arbeitgeberanteile (fuer die Anzeige der Gesamtkosten)
 *
 * Nicht abgebildet: Umlagen U1/U2/U3, Beitraege zur gesetzlichen
 * Unfallversicherung, berufsstaendische Versorgungswerke.
 */

export type Beschaeftigungsart = 'regulaer' | 'uebergangsbereich' | 'minijob';

export interface SvSaetze {
    rvSatz: number;
    avSatz: number;
    kvAllgemein: number;
    kvZusatz: number;
    pvSatz: number;
    pvZuschlagKinderlose: number;
    pvAbschlagJeKind: number;
    bbgRvAv: number;
    bbgKvPv: number;
}

export interface SvEingabe {
    bruttoJahr: number;
    bundesland: string;
    /** Kassenindividueller Zusatzbeitragssatz in Prozentpunkten (gesamt). */
    kvZusatzProzent: number;
    kinderFuerPflege: number;
    alter: number;
    krankenversicherung:
        | { art: 'gesetzlich' }
        | { art: 'privat'; monatsbeitrag: number; arbeitgeberzuschussMonat: number };
    /** Optionale Ueberschreibungen fuer Szenarien. Werte als Dezimalzahl. */
    ueberschreibungen?: Partial<Omit<SvSaetze, 'kvZusatz'>> & { kvZusatz?: number };
    /** Bei Minijob: Befreiung von der Rentenversicherungspflicht (Regelfall). */
    minijobRvBefreiung?: boolean;
    parameter?: SvParameter;
}

export interface SvAnteil {
    rv: number;
    av: number;
    kv: number;
    pv: number;
    summe: number;
}

export interface SvErgebnis {
    art: Beschaeftigungsart;
    arbeitnehmer: SvAnteil;
    arbeitgeber: SvAnteil;
    /** Effektive Saetze des Arbeitnehmers, fuer Erlaeuterungen in der UI. */
    saetzeArbeitnehmer: { rv: number; av: number; kv: number; pv: number };
    /** Nur im Uebergangsbereich gesetzt. */
    uebergangsbereich?: {
        beitragspflichtigeEinnahmeGesamt: number;
        beitragspflichtigeEinnahmeArbeitnehmer: number;
        faktorF: number;
    };
    hinweise: string[];
}

const r2 = euroRunden;

/** Effektiver Arbeitnehmeranteil zur Pflegeversicherung. */
export function pflegesatzArbeitnehmer(
    s: Pick<SvSaetze, 'pvSatz' | 'pvZuschlagKinderlose' | 'pvAbschlagJeKind'>,
    opts: { bundesland: string; kinder: number; alter: number; pvArbeitgeberSachsen: number }
): number {
    const kinder = Math.floor(Math.max(0, opts.kinder));
    const sachsen = opts.bundesland.toUpperCase() === 'SN';

    // Grundverteilung: hälftig, in Sachsen trägt der Arbeitgeber 0,5 Punkte weniger.
    let satz = sachsen ? s.pvSatz - opts.pvArbeitgeberSachsen : s.pvSatz / 2;

    if (kinder <= 0 && opts.alter >= 23) satz += s.pvZuschlagKinderlose;
    if (kinder >= 2) satz -= (Math.min(kinder, 5) - 1) * s.pvAbschlagJeKind;

    return Math.max(0, satz);
}

export function berechneSozialabgaben(e: SvEingabe): SvErgebnis {
    const p = e.parameter ?? SV_2026;
    const basis = werte(p);
    const o = e.ueberschreibungen ?? {};

    const s: SvSaetze = {
        rvSatz: o.rvSatz ?? basis.rvSatz,
        avSatz: o.avSatz ?? basis.avSatz,
        kvAllgemein: o.kvAllgemein ?? basis.kvAllgemein,
        kvZusatz: o.kvZusatz ?? e.kvZusatzProzent / 100,
        pvSatz: o.pvSatz ?? basis.pvSatz,
        pvZuschlagKinderlose: o.pvZuschlagKinderlose ?? basis.pvZuschlagKinderlose,
        pvAbschlagJeKind: o.pvAbschlagJeKind ?? basis.pvAbschlagJeKind,
        bbgRvAv: o.bbgRvAv ?? basis.bbgRvAv,
        bbgKvPv: o.bbgKvPv ?? basis.bbgKvPv,
    };

    const privat = e.krankenversicherung.art === 'privat';
    const hinweise: string[] = [];

    const pvAn = pflegesatzArbeitnehmer(s, {
        bundesland: e.bundesland,
        kinder: e.kinderFuerPflege,
        alter: e.alter,
        pvArbeitgeberSachsen: basis.pvArbeitgeberSachsen,
    });
    const pvAgEffektiv =
        e.bundesland.toUpperCase() === 'SN' ? basis.pvArbeitgeberSachsen : s.pvSatz / 2;

    const kvAnSatz = s.kvAllgemein / 2 + s.kvZusatz / 2;
    const kvAgSatz = s.kvAllgemein / 2 + s.kvZusatz / 2;

    const bruttoMonat = e.bruttoJahr / 12;
    const G = basis.geringfuegigkeitsgrenze;
    const A = basis.uebergangsbereichObergrenze;
    const F = basis.faktorF;

    // ---------------------------------------------------------------- Minijob
    if (bruttoMonat > 0 && bruttoMonat <= G) {
        const rvBefreit = e.minijobRvBefreiung ?? true;
        // Arbeitgeberpauschalen: 15 % RV, 13 % KV (nur bei gesetzlich Versicherten)
        const agRv = e.bruttoJahr * 0.15;
        const agKv = privat ? 0 : e.bruttoJahr * 0.13;
        const anRv = rvBefreit ? 0 : e.bruttoJahr * (s.rvSatz - 0.15);

        hinweise.push(
            `Geringfügige Beschäftigung: Das Monatsbrutto liegt bei oder unter der ` +
                `Geringfügigkeitsgrenze von ${G} €. Der Arbeitgeber zahlt Pauschalbeiträge; ` +
                `die Lohnsteuer wird üblicherweise pauschal mit 2 % vom Arbeitgeber übernommen ` +
                `und nicht über die Steuerklasse abgerechnet. Die Steuerberechnung dieses ` +
                `Rechners bildet den individuellen Lohnsteuerabzug ab und passt hier nicht.`
        );
        if (!rvBefreit) {
            hinweise.push('Keine Befreiung von der Rentenversicherungspflicht: Eigenanteil 3,6 %.');
        }

        const an: SvAnteil = { rv: r2(anRv), av: 0, kv: 0, pv: 0, summe: r2(anRv) };
        const ag: SvAnteil = { rv: r2(agRv), av: 0, kv: r2(agKv), pv: 0, summe: r2(agRv + agKv) };
        return {
            art: 'minijob',
            arbeitnehmer: an,
            arbeitgeber: ag,
            saetzeArbeitnehmer: { rv: rvBefreit ? 0 : s.rvSatz - 0.15, av: 0, kv: 0, pv: 0 },
            hinweise,
        };
    }

    // -------------------------------------------------------- Übergangsbereich
    if (!privat && bruttoMonat > G && bruttoMonat <= A) {
        // § 20 Abs. 2a SGB IV
        const beGesamtMonat = F * G + ((A - F * G) / (A - G)) * (bruttoMonat - G);
        const beAnMonat = (A / (A - G)) * (bruttoMonat - G);

        const beGesamt = beGesamtMonat * 12;
        const beAn = beAnMonat * 12;

        const an: SvAnteil = {
            rv: r2(beAn * (s.rvSatz / 2)),
            av: r2(beAn * (s.avSatz / 2)),
            kv: r2(beAn * kvAnSatz),
            pv: r2(beAn * pvAn),
            summe: 0,
        };
        an.summe = r2(an.rv + an.av + an.kv + an.pv);

        const gesamt = {
            rv: beGesamt * s.rvSatz,
            av: beGesamt * s.avSatz,
            kv: beGesamt * (s.kvAllgemein + s.kvZusatz),
            pv: beGesamt * s.pvSatz,
        };
        const ag: SvAnteil = {
            rv: r2(Math.max(0, gesamt.rv - an.rv)),
            av: r2(Math.max(0, gesamt.av - an.av)),
            kv: r2(Math.max(0, gesamt.kv - an.kv)),
            pv: r2(Math.max(0, gesamt.pv - an.pv)),
            summe: 0,
        };
        ag.summe = r2(ag.rv + ag.av + ag.kv + ag.pv);

        hinweise.push(
            `Übergangsbereich (Midijob): Zwischen ${G.toLocaleString('de-DE')} € und ` +
                `${A.toLocaleString('de-DE')} € Monatsbrutto sind die Arbeitnehmerbeiträge nach ` +
                `§ 20 Abs. 2a SGB IV reduziert, der volle Sozialversicherungsschutz bleibt erhalten. ` +
                `Die Rentenanwartschaft richtet sich trotzdem nach dem vollen Bruttoentgelt.`
        );

        return {
            art: 'uebergangsbereich',
            arbeitnehmer: an,
            arbeitgeber: ag,
            saetzeArbeitnehmer: {
                rv: s.rvSatz / 2,
                av: s.avSatz / 2,
                kv: kvAnSatz,
                pv: pvAn,
            },
            uebergangsbereich: {
                beitragspflichtigeEinnahmeGesamt: r2(beGesamt),
                beitragspflichtigeEinnahmeArbeitnehmer: r2(beAn),
                faktorF: F,
            },
            hinweise,
        };
    }

    // ------------------------------------------------------------- Regelfall
    const basisRvAv = Math.min(e.bruttoJahr, s.bbgRvAv);
    const basisKvPv = Math.min(e.bruttoJahr, s.bbgKvPv);

    const an: SvAnteil = {
        rv: r2(basisRvAv * (s.rvSatz / 2)),
        av: r2(basisRvAv * (s.avSatz / 2)),
        kv: 0,
        pv: 0,
        summe: 0,
    };
    const ag: SvAnteil = {
        rv: r2(basisRvAv * (s.rvSatz / 2)),
        av: r2(basisRvAv * (s.avSatz / 2)),
        kv: 0,
        pv: 0,
        summe: 0,
    };

    if (privat) {
        const kv = e.krankenversicherung as {
            art: 'privat';
            monatsbeitrag: number;
            arbeitgeberzuschussMonat: number;
        };
        // Der Arbeitgeberzuschuss ist auf die Hälfte des Beitrags und zugleich
        // auf den GKV-Höchstbetrag begrenzt (§ 257 SGB V, § 61 SGB XI).
        const hoechstzuschuss =
            (s.bbgKvPv / 12) * (s.kvAllgemein / 2 + s.kvZusatz / 2) +
            (s.bbgKvPv / 12) * pvAgEffektiv;
        const zuschuss = Math.min(
            kv.arbeitgeberzuschussMonat,
            kv.monatsbeitrag / 2,
            hoechstzuschuss
        );
        an.kv = r2(Math.max(0, (kv.monatsbeitrag - zuschuss) * 12));
        an.pv = 0;
        ag.kv = r2(zuschuss * 12);
        ag.pv = 0;

        if (kv.arbeitgeberzuschussMonat > zuschuss + 0.005) {
            hinweise.push(
                `Der Arbeitgeberzuschuss wurde auf ${zuschuss.toLocaleString('de-DE', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                })} €/Monat begrenzt (höchstens die Hälfte des Beitrags und höchstens der ` +
                    `Höchstzuschuss nach § 257 SGB V bzw. § 61 SGB XI).`
            );
        }
        hinweise.push(
            'Bei privater Krankenversicherung ist der eingegebene Beitrag maßgeblich; ' +
                'die Pflege-Pflichtversicherung ist darin enthalten.'
        );
    } else {
        an.kv = r2(basisKvPv * kvAnSatz);
        an.pv = r2(basisKvPv * pvAn);
        ag.kv = r2(basisKvPv * kvAgSatz);
        ag.pv = r2(basisKvPv * pvAgEffektiv);
    }

    an.summe = r2(an.rv + an.av + an.kv + an.pv);
    ag.summe = r2(ag.rv + ag.av + ag.kv + ag.pv);

    return {
        art: 'regulaer',
        arbeitnehmer: an,
        arbeitgeber: ag,
        saetzeArbeitnehmer: {
            rv: s.rvSatz / 2,
            av: s.avSatz / 2,
            kv: privat ? 0 : kvAnSatz,
            pv: privat ? 0 : pvAn,
        },
        hinweise,
    };
}

/** Maximaler Arbeitgeberzuschuss zur PKV in Euro/Monat (§ 257 SGB V, § 61 SGB XI). */
export function maximalerPkvZuschuss(
    bundesland: string,
    kvZusatzProzent: number,
    p: SvParameter = SV_2026
): { kv: number; pv: number; summe: number } {
    const b = werte(p);
    const monatsBbg = b.bbgKvPv / 12;
    const kv = monatsBbg * (b.kvAllgemein / 2 + kvZusatzProzent / 100 / 2);
    const pvSatzAg =
        bundesland.toUpperCase() === 'SN' ? b.pvArbeitgeberSachsen : b.pvSatz / 2;
    const pv = monatsBbg * pvSatzAg;
    return { kv: r2(kv), pv: r2(pv), summe: r2(kv + pv) };
}
