import { NextRequest, NextResponse } from 'next/server';

/**
 * Einfache Missbrauchsbremse fuer die oeffentliche Rechen-API.
 *
 * GELTUNGSBEREICH
 * Die Oberflaeche selbst rechnet im Browser und ruft diese Route nicht auf.
 * Betroffen sind ausschliesslich Zugriffe Dritter auf /api/calculate.
 *
 * BEKANNTE GRENZE
 * Der Zaehler liegt im Arbeitsspeicher der jeweiligen Instanz. In einer
 * serverlosen Umgebung gibt es mehrere Instanzen, und kalte Starts setzen den
 * Zaehler zurueck. Das Limit wirkt daher nur je Instanz und ist eine Bremse,
 * kein Schutz. Fuer echten Schutz braeuchte es einen gemeinsamen Speicher
 * (z. B. Redis) oder die Ratenbegrenzung des vorgelagerten CDN.
 *
 * DATENSCHUTZ
 * Es wird kein Klartext gespeichert. Aus der IP wird ein Hash gebildet, und
 * die Eintraege verfallen mit dem Zeitfenster. Es gibt keine Persistenz und
 * kein Logging der Anfragen.
 */

const ZEITFENSTER_MS = 60_000;
const MAX_ANFRAGEN = 30;
/** Obergrenze gegen unbegrenztes Wachstum der Map bei vielen verschiedenen IPs. */
const MAX_EINTRAEGE = 5_000;

const zaehler = new Map<string, number[]>();

/**
 * Nicht kryptografischer Hash. Zweck ist ausschliesslich, die IP nicht im
 * Klartext im Speicher zu halten; fuer eine Bremse reicht das.
 */
function schluessel(ip: string): string {
    let h = 2166136261;
    for (let i = 0; i < ip.length; i++) {
        h ^= ip.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(36);
}

function clientKennung(request: NextRequest): string {
    const weitergeleitet = request.headers.get('x-forwarded-for');
    const ip = weitergeleitet
        ? weitergeleitet.split(',')[0].trim()
        : (request.headers.get('x-real-ip') ?? 'unbekannt');
    return schluessel(ip);
}

function ueberLimit(kennung: string): boolean {
    const jetzt = Date.now();

    if (zaehler.size > MAX_EINTRAEGE) {
        for (const [k, zeiten] of zaehler) {
            if (zeiten.every((t) => jetzt - t >= ZEITFENSTER_MS)) zaehler.delete(k);
        }
        if (zaehler.size > MAX_EINTRAEGE) zaehler.clear();
    }

    const aktuell = (zaehler.get(kennung) ?? []).filter((t) => jetzt - t < ZEITFENSTER_MS);
    if (aktuell.length >= MAX_ANFRAGEN) {
        zaehler.set(kennung, aktuell);
        return true;
    }

    aktuell.push(jetzt);
    zaehler.set(kennung, aktuell);
    return false;
}

export function middleware(request: NextRequest): NextResponse {
    if (ueberLimit(clientKennung(request))) {
        return NextResponse.json(
            { fehler: 'Zu viele Anfragen. Bitte warte kurz.' },
            { status: 429, headers: { 'Retry-After': '60' } }
        );
    }
    return NextResponse.next();
}

export const config = {
    matcher: ['/api/calculate'],
};
