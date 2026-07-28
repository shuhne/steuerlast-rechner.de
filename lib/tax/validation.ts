import { z } from 'zod';
import { RECHTSSTAENDE } from './parameter/rechtsstaende';

/**
 * Eingabevalidierung fuer die oeffentliche API.
 *
 * Die Oberflaeche rechnet seit dem Umbau lokal im Browser; die API-Routen
 * bleiben als dokumentierte oeffentliche Schnittstelle bestehen.
 */

export const BUNDESLAENDER = [
    'BW', 'BY', 'BE', 'BB', 'HB', 'HH', 'HE', 'MV',
    'NI', 'NW', 'RP', 'SL', 'SN', 'ST', 'SH', 'TH',
] as const;

const szenarioIds = RECHTSSTAENDE.map((r) => r.id) as [string, ...string[]];

export const RechnerEingabeSchema = z.object({
    bruttoJahr: z.number().min(0).max(10_000_000),
    steuerklasse: z.number().int().min(1).max(6),
    bundesland: z.enum(BUNDESLAENDER),
    kirchensteuer: z.boolean(),
    kirchensteuerKappungProzent: z.number().min(0).max(10).nullable().optional(),
    alter: z.number().int().min(14).max(120),
    kinderfreibetraege: z.number().min(0).max(20),
    kinderFuerPflege: z.number().min(0).max(20),
    krankenversicherung: z.enum(['gesetzlich', 'privat']),
    kvZusatzProzent: z.number().min(0).max(15),
    pkvMonatsbeitrag: z.number().min(0).max(10_000).optional(),
    pkvArbeitgeberzuschussMonat: z
        .union([z.number().min(0).max(10_000), z.literal('maximal')])
        .optional(),
    jahresfreibetrag: z.number().min(0).max(1_000_000).optional(),
    sonstigeBezuege: z.number().min(0).max(10_000_000).optional(),
    rentenversicherungspflichtig: z.boolean().optional(),
    arbeitslosenversicherungspflichtig: z.boolean().optional(),
    szenarioId: z.enum(szenarioIds).nullable().optional(),
});

export const Eingabe1958Schema = z.object({
    bruttoJahrEur: z.number().min(0).max(10_000_000),
    bereinigung: z.enum(['lohn', 'preis']),
    veranlagung: z.enum(['einzel', 'zusammen']),
    kirchensteuer: z.boolean(),
    bundesland: z.enum(BUNDESLAENDER),
});

export type ValidierteEingabe = z.infer<typeof RechnerEingabeSchema>;
