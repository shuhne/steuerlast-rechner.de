import { NextRequest, NextResponse } from 'next/server';
import { berechne, berechne1958, teilzeitanalyse, gehaltskurve } from '../../../lib/tax';
import { RechnerEingabeSchema, Eingabe1958Schema } from '../../../lib/tax/validation';
import { z } from 'zod';

/**
 * Oeffentliche Rechen-API.
 *
 * Die Oberflaeche selbst nutzt diese Route NICHT mehr: Sie rechnet seit dem
 * Umbau vollstaendig im Browser, damit keine Gehaltsdaten das Geraet
 * verlassen. Die Route bleibt als dokumentierte Schnittstelle fuer Dritte
 * bestehen.
 */

const Anfrage = z.discriminatedUnion('modus', [
    z.object({
        modus: z.literal('aktuell'),
        eingabe: RechnerEingabeSchema,
        analysen: z
            .object({
                teilzeit: z.object({ wochenstunden: z.number().min(1).max(80) }).optional(),
                kurve: z.boolean().optional(),
            })
            .optional(),
    }),
    z.object({ modus: z.literal('historisch'), eingabe: Eingabe1958Schema }),
]);

export async function POST(request: NextRequest) {
    try {
        const parsed = Anfrage.safeParse(await request.json());
        if (!parsed.success) {
            return NextResponse.json(
                { fehler: 'Ungültige Eingabe', details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        if (parsed.data.modus === 'historisch') {
            return NextResponse.json(berechne1958(parsed.data.eingabe));
        }

        const eingabe = parsed.data.eingabe;
        const ergebnis = berechne(eingabe);
        const analysen = parsed.data.analysen;

        return NextResponse.json({
            ergebnis,
            teilzeit: analysen?.teilzeit
                ? teilzeitanalyse(eingabe, analysen.teilzeit.wochenstunden)
                : undefined,
            kurve: analysen?.kurve ? gehaltskurve(eingabe) : undefined,
        });
    } catch (error) {
        console.error('Berechnungsfehler:', error instanceof Error ? error.message : error);
        return NextResponse.json({ fehler: 'Berechnung fehlgeschlagen' }, { status: 500 });
    }
}
