/**
 * Oeffentliche Schnittstelle der Rechenlogik.
 *
 * Oberflaeche und API-Routen importieren ausschliesslich von hier, nie direkt
 * aus `generated/` oder `parameter/`.
 */

export { berechne, jaeg } from './rechner';
export type { RechnerEingabe, RechnerErgebnis } from './rechner';

export {
    teilzeitanalyse,
    gehaltskurve,
    steuerklassenvergleich,
    stundenlohn,
} from './analysen';
export type {
    TeilzeitPunkt,
    KurvenPunkt,
    SteuerklassenVergleich,
    SteuerklassenVariante,
    StundenlohnErgebnis,
} from './analysen';

export {
    berechne1958,
    einkommensteuer1958,
    einkommensteuer1958Dm,
    umrechnungsfaktoren,
    P1958,
    NICHT_MODELLIERT as GRENZEN_1958,
} from './historisch/jahr1958';
export type { Eingabe1958, Ergebnis1958, Bereinigung, Veranlagung1958 } from './historisch/jahr1958';

export { SV_2026, werte as svWerte } from './parameter/sozialversicherung';
export type { SvParameter } from './parameter/sozialversicherung';
export { KIRCHENSTEUER } from './parameter/kirchensteuer';
export {
    RECHTSSTAENDE,
    RECHTSSTAND_GELTEND,
    rechtsstandFuer,
} from './parameter/rechtsstaende';
export type { Rechtsstand, Annahme } from './parameter/rechtsstaende';
export { RECHTSSTATUS_LABEL, istGesichert, unsichereParameter } from './parameter/typen';
export type { Rechtsstatus, Belastbarkeit, Parameter, Quelle } from './parameter/typen';

export { PAP_META } from './lohnsteuer';
export { maximalerPkvZuschuss, berechneSozialabgaben } from './sozialabgaben';
export { euroRunden, runden } from './runden';
