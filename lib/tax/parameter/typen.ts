/**
 * Typen fuer das Parameter- und Rechtsstandsmodell.
 * =================================================
 *
 * Leitgedanke: Jede Zahl, die aus einem Gesetz, einer Verordnung oder einer
 * amtlichen Bekanntmachung stammt, traegt ihre Herkunft mit sich. Die
 * Oberflaeche liest diese Metadaten direkt aus - dadurch kann die angezeigte
 * Quellenangabe nicht mehr veralten, ohne dass auch der Wert veraltet.
 *
 * Fuer Agenten, die dieses Repository aktualisieren:
 * siehe docs/wissensspeicher/README.md
 */

/**
 * Rechtlicher Status eines Parameters oder Szenarios.
 *
 * Die Reihenfolge ist absteigend nach Verbindlichkeit. Die Oberflaeche
 * kennzeichnet alles unterhalb von `geltendes_recht` sichtbar als unsicher.
 */
export type Rechtsstatus =
    /** In Kraft. Bundesgesetzblatt oder amtliche Bekanntmachung. */
    | 'geltendes_recht'
    /** Beschlossen und verkuendet, tritt aber erst spaeter in Kraft. */
    | 'verkuendet'
    /** Regierungsentwurf, im parlamentarischen Verfahren. */
    | 'regierungsentwurf'
    /** Referentenentwurf eines Ministeriums, noch nicht im Kabinett. */
    | 'referentenentwurf'
    /** Koalitionsvertrag, Koalitionsausschuss, politische Ankuendigung. */
    | 'politische_ankuendigung'
    /** Amtliche Vorausberechnung (z. B. Rentenversicherungsbericht). */
    | 'amtliche_projektion'
    /** Eigene Annahme dieses Projekts. Immer als solche auszuweisen. */
    | 'eigene_annahme';

export const RECHTSSTATUS_LABEL: Record<Rechtsstatus, string> = {
    geltendes_recht: 'Geltendes Recht',
    verkuendet: 'Verkündet, tritt später in Kraft',
    regierungsentwurf: 'Regierungsentwurf',
    referentenentwurf: 'Referentenentwurf',
    politische_ankuendigung: 'Politische Ankündigung',
    amtliche_projektion: 'Amtliche Vorausberechnung',
    eigene_annahme: 'Eigene Annahme',
};

/** Wie belastbar ist der Wert? Steuert Warnhinweise in der Oberflaeche. */
export type Belastbarkeit =
    /** Direkt aus der Primaerquelle uebernommen. */
    | 'belegt'
    /** Aus belegten Werten nach einer dokumentierten Regel hergeleitet. */
    | 'hergeleitet'
    /** Zwischen belegten Stuetzstellen interpoliert. */
    | 'interpoliert'
    /** Schaetzung. Muss in der Oberflaeche sichtbar sein. */
    | 'geschaetzt';

export interface Quelle {
    /** Herausgeber, z. B. "BMF", "Destatis", "Deutsche Rentenversicherung". */
    herausgeber: string;
    /** Titel des Dokuments. */
    titel: string;
    /** Fundstelle: Paragraf, Aktenzeichen, Seite, Tabellennummer. */
    fundstelle?: string;
    /** Stabile URL. */
    url?: string;
    /** Stand/Abrufdatum im Format JJJJ-MM-TT. */
    stand: string;
}

/** Ein einzelner Parameter mit vollstaendiger Provenienz. */
export interface Parameter<T> {
    wert: T;
    einheit?: string;
    rechtsstatus: Rechtsstatus;
    belastbarkeit: Belastbarkeit;
    quelle: Quelle;
    /** Erstes Jahr der Gueltigkeit. */
    gueltigAb: number;
    /** Letztes Jahr der Gueltigkeit, falls bekannt. */
    gueltigBis?: number;
    /**
     * Erlaeuterung, insbesondere bei `hergeleitet`, `interpoliert` oder
     * `geschaetzt`: Wie kam der Wert zustande, was ist die Unsicherheit?
     */
    hinweis?: string;
}

/** Kurzform fuer belegte Parameter aus geltendem Recht. */
export function belegt<T>(
    wert: T,
    quelle: Quelle,
    gueltigAb: number,
    extra: Partial<Parameter<T>> = {}
): Parameter<T> {
    return {
        wert,
        rechtsstatus: 'geltendes_recht',
        belastbarkeit: 'belegt',
        quelle,
        gueltigAb,
        ...extra,
    };
}

/** True, wenn der Parameter ohne Vorbehalt als Rechtslage dargestellt werden darf. */
export function istGesichert(p: Parameter<unknown>): boolean {
    return p.rechtsstatus === 'geltendes_recht' && p.belastbarkeit === 'belegt';
}

/** Sammelt alle nicht gesicherten Parameter eines Objekts fuer die Anzeige. */
export function unsichereParameter(
    obj: Record<string, unknown>,
    pfad = ''
): Array<{ pfad: string; parameter: Parameter<unknown> }> {
    const out: Array<{ pfad: string; parameter: Parameter<unknown> }> = [];
    for (const [key, value] of Object.entries(obj)) {
        if (value === null || typeof value !== 'object') continue;
        const p = `${pfad}${pfad ? '.' : ''}${key}`;
        if ('wert' in value && 'rechtsstatus' in value) {
            const param = value as Parameter<unknown>;
            if (!istGesichert(param)) out.push({ pfad: p, parameter: param });
        } else {
            out.push(...unsichereParameter(value as Record<string, unknown>, p));
        }
    }
    return out;
}
