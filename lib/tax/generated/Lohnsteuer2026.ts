/* eslint-disable */
// @ts-nocheck
/**
 * AUTOMATISCH GENERIERT - NICHT VON HAND BEARBEITEN.
 *
 * Quelle : amtlicher Programmablaufplan des BMF, Lohnsteuer2026.xml
 * Bezug  : https://www.bmf-steuerrechner.de/javax.faces.resource/daten/xmls/Lohnsteuer2026.xml.xhtml
 * PAP    : version=1.0, Stand 2025-10-23 12:40
 * Erzeugt: tools/lohnsteuer/generate.mjs
 *
 * Aenderungen ausschliesslich ueber eine neue XML-Fassung und
 * "npm run gen:lohnsteuer" einspielen.
 * Siehe docs/wissensspeicher/runbook-jahreswechsel.md
 */
import Big from 'big.js';

// Eigene Big-Instanz: der PAP rechnet exakt und rundet ausschliesslich
// explizit. Eine hohe DP verhindert, dass big.js bei Divisionen vorzeitig
// rundet. Die globale Big-Konfiguration anderer Module bleibt unberuehrt.
const PapBig = Big();
PapBig.DP = 40;
PapBig.RM = 0;

export const PAP_META = { jahr: 2026, version: '1.0', stand: '2025-10-23 12:40' } as const;

export class Lohnsteuer2026 {
    // --- EINGABEPARAMETER ---
    af: number = 1;
    AJAHR: number = 0;
    ALTER1: number = 0;
    ALV: number = 0;
    f: number = 1.0;
    JFREIB: any = new PapBig(0);
    JHINZU: any = new PapBig(0);
    JRE4: any = new PapBig(0);
    JRE4ENT: any = new PapBig(0);
    JVBEZ: any = new PapBig(0);
    KRV: number = 0;
    KVZ: any = new PapBig(0);
    LZZ: number = 1;
    LZZFREIB: any = new PapBig(0);
    LZZHINZU: any = new PapBig(0);
    MBV: any = new PapBig(0);
    PKPV: any = new PapBig(0);
    PKPVAGZ: any = new PapBig(0);
    PKV: number = 0;
    PVA: any = new PapBig(0);
    PVS: number = 0;
    PVZ: number = 0;
    R: number = 0;
    RE4: any = new PapBig(0);
    SONSTB: any = new PapBig(0);
    SONSTENT: any = new PapBig(0);
    STERBE: any = new PapBig(0);
    STKL: number = 1;
    VBEZ: any = new PapBig(0);
    VBEZM: any = new PapBig(0);
    VBEZS: any = new PapBig(0);
    VBS: any = new PapBig(0);
    VJAHR: number = 0;
    ZKF: any = new PapBig(0);
    ZMVB: number = 0;
    // --- AUSGABEPARAMETER ---
    BK: any = new PapBig(0);
    BKS: any = new PapBig(0);
    LSTLZZ: any = new PapBig(0);
    SOLZLZZ: any = new PapBig(0);
    SOLZS: any = new PapBig(0);
    STS: any = new PapBig(0);
    VFRB: any = new PapBig(0);
    VFRBS1: any = new PapBig(0);
    VFRBS2: any = new PapBig(0);
    WVFRB: any = new PapBig(0);
    WVFRBO: any = new PapBig(0);
    WVFRBM: any = new PapBig(0);
    // --- INTERNE FELDER ---
    ALTE: any = new PapBig(0);
    ANP: any = new PapBig(0);
    ANTEIL1: any = new PapBig(0);
    AVSATZAN: any = new PapBig(0);
    BBGKVPV: any = new PapBig(0);
    BBGRVALV: any = new PapBig(0);
    BMG: any = new PapBig(0);
    DIFF: any = new PapBig(0);
    EFA: any = new PapBig(0);
    FVB: any = new PapBig(0);
    FVBSO: any = new PapBig(0);
    FVBZ: any = new PapBig(0);
    FVBZSO: any = new PapBig(0);
    GFB: any = new PapBig(0);
    HBALTE: any = new PapBig(0);
    HFVB: any = new PapBig(0);
    HFVBZ: any = new PapBig(0);
    HFVBZSO: any = new PapBig(0);
    HOCH: any = new PapBig(0);
    J: number = 0;
    JBMG: any = new PapBig(0);
    JLFREIB: any = new PapBig(0);
    JLHINZU: any = new PapBig(0);
    JW: any = new PapBig(0);
    K: number = 0;
    KFB: any = new PapBig(0);
    KVSATZAN: any = new PapBig(0);
    KZTAB: number = 0;
    LSTJAHR: any = new PapBig(0);
    LSTOSO: any = new PapBig(0);
    LSTSO: any = new PapBig(0);
    MIST: any = new PapBig(0);
    PKPVAGZJ: any = new PapBig(0);
    PVSATZAN: any = new PapBig(0);
    RVSATZAN: any = new PapBig(0);
    RW: any = new PapBig(0);
    SAP: any = new PapBig(0);
    SOLZFREI: any = new PapBig(0);
    SOLZJ: any = new PapBig(0);
    SOLZMIN: any = new PapBig(0);
    SOLZSBMG: any = new PapBig(0);
    SOLZSZVE: any = new PapBig(0);
    ST: any = new PapBig(0);
    ST1: any = new PapBig(0);
    ST2: any = new PapBig(0);
    VBEZB: any = new PapBig(0);
    VBEZBSO: any = new PapBig(0);
    VERGL: any = new PapBig(0);
    VSPHB: any = new PapBig(0);
    VSP: any = new PapBig(0);
    VSPN: any = new PapBig(0);
    VSPALV: any = new PapBig(0);
    VSPKVPV: any = new PapBig(0);
    VSPR: any = new PapBig(0);
    W1STKL5: any = new PapBig(0);
    W2STKL5: any = new PapBig(0);
    W3STKL5: any = new PapBig(0);
    X: any = new PapBig(0);
    Y: any = new PapBig(0);
    ZRE4: any = new PapBig(0);
    ZRE4J: any = new PapBig(0);
    ZRE4VP: any = new PapBig(0);
    ZRE4VPR: any = new PapBig(0);
    ZTABFB: any = new PapBig(0);
    ZVBEZ: any = new PapBig(0);
    ZVBEZJ: any = new PapBig(0);
    ZVE: any = new PapBig(0);
    ZX: any = new PapBig(0);
    ZZX: any = new PapBig(0);
    // --- KONSTANTEN ---
    TAB1: any[] = [new PapBig(0), new PapBig( 0.4), new PapBig( 0.384), new PapBig( 0.368), new PapBig( 0.352), new PapBig( 0.336), new PapBig( 0.32), new PapBig( 0.304), new PapBig( 0.288), new PapBig( 0.272), new PapBig( 0.256), new PapBig( 0.24), new PapBig( 0.224), new PapBig( 0.208), new PapBig( 0.192), new PapBig( 0.176), new PapBig( 0.16), new PapBig( 0.152), new PapBig( 0.144), new PapBig( 0.14), new PapBig( 0.136), new PapBig( 0.132), new PapBig( 0.128), new PapBig( 0.124), new PapBig( 0.12), new PapBig( 0.116), new PapBig( 0.112), new PapBig( 0.108), new PapBig( 0.104), new PapBig( 0.1), new PapBig( 0.096), new PapBig( 0.092), new PapBig( 0.088), new PapBig( 0.084), new PapBig( 0.08), new PapBig( 0.076), new PapBig( 0.072), new PapBig( 0.068), new PapBig( 0.064), new PapBig( 0.06), new PapBig( 0.056), new PapBig( 0.052), new PapBig( 0.048), new PapBig( 0.044), new PapBig( 0.04), new PapBig( 0.036), new PapBig( 0.032), new PapBig( 0.028), new PapBig( 0.024), new PapBig( 0.02), new PapBig( 0.016), new PapBig( 0.012), new PapBig( 0.008), new PapBig( 0.004), new PapBig( 0)];
    TAB2: any[] = [new PapBig(0), new PapBig( 3000), new PapBig( 2880), new PapBig( 2760), new PapBig( 2640), new PapBig( 2520), new PapBig( 2400), new PapBig( 2280), new PapBig( 2160), new PapBig( 2040), new PapBig( 1920), new PapBig( 1800), new PapBig( 1680), new PapBig( 1560), new PapBig( 1440), new PapBig( 1320), new PapBig( 1200), new PapBig( 1140), new PapBig( 1080), new PapBig( 1050), new PapBig( 1020), new PapBig( 990), new PapBig( 960), new PapBig( 930), new PapBig( 900), new PapBig( 870), new PapBig( 840), new PapBig( 810), new PapBig( 780), new PapBig( 750), new PapBig( 720), new PapBig( 690), new PapBig( 660), new PapBig( 630), new PapBig( 600), new PapBig( 570), new PapBig( 540), new PapBig( 510), new PapBig( 480), new PapBig( 450), new PapBig( 420), new PapBig( 390), new PapBig( 360), new PapBig( 330), new PapBig( 300), new PapBig( 270), new PapBig( 240), new PapBig( 210), new PapBig( 180), new PapBig( 150), new PapBig( 120), new PapBig( 90), new PapBig( 60), new PapBig( 30), new PapBig( 0)];
    TAB3: any[] = [new PapBig(0), new PapBig( 900), new PapBig( 864), new PapBig( 828), new PapBig( 792), new PapBig( 756), new PapBig( 720), new PapBig( 684), new PapBig( 648), new PapBig( 612), new PapBig( 576), new PapBig( 540), new PapBig( 504), new PapBig( 468), new PapBig( 432), new PapBig( 396), new PapBig( 360), new PapBig( 342), new PapBig( 324), new PapBig( 315), new PapBig( 306), new PapBig( 297), new PapBig( 288), new PapBig( 279), new PapBig( 270), new PapBig( 261), new PapBig( 252), new PapBig( 243), new PapBig( 234), new PapBig( 225), new PapBig( 216), new PapBig( 207), new PapBig( 198), new PapBig( 189), new PapBig( 180), new PapBig( 171), new PapBig( 162), new PapBig( 153), new PapBig( 144), new PapBig( 135), new PapBig( 126), new PapBig( 117), new PapBig( 108), new PapBig( 99), new PapBig( 90), new PapBig( 81), new PapBig( 72), new PapBig( 63), new PapBig( 54), new PapBig( 45), new PapBig( 36), new PapBig( 27), new PapBig( 18), new PapBig( 9), new PapBig( 0)];
    TAB4: any[] = [new PapBig(0), new PapBig( 0.4), new PapBig( 0.384), new PapBig( 0.368), new PapBig( 0.352), new PapBig( 0.336), new PapBig( 0.32), new PapBig( 0.304), new PapBig( 0.288), new PapBig( 0.272), new PapBig( 0.256), new PapBig( 0.24), new PapBig( 0.224), new PapBig( 0.208), new PapBig( 0.192), new PapBig( 0.176), new PapBig( 0.16), new PapBig( 0.152), new PapBig( 0.144), new PapBig( 0.14), new PapBig( 0.136), new PapBig( 0.132), new PapBig( 0.128), new PapBig( 0.124), new PapBig( 0.12), new PapBig( 0.116), new PapBig( 0.112), new PapBig( 0.108), new PapBig( 0.104), new PapBig( 0.1), new PapBig( 0.096), new PapBig( 0.092), new PapBig( 0.088), new PapBig( 0.084), new PapBig( 0.08), new PapBig( 0.076), new PapBig( 0.072), new PapBig( 0.068), new PapBig( 0.064), new PapBig( 0.06), new PapBig( 0.056), new PapBig( 0.052), new PapBig( 0.048), new PapBig( 0.044), new PapBig( 0.04), new PapBig( 0.036), new PapBig( 0.032), new PapBig( 0.028), new PapBig( 0.024), new PapBig( 0.02), new PapBig( 0.016), new PapBig( 0.012), new PapBig( 0.008), new PapBig( 0.004), new PapBig( 0)];
    TAB5: any[] = [new PapBig(0), new PapBig( 1900), new PapBig( 1824), new PapBig( 1748), new PapBig( 1672), new PapBig( 1596), new PapBig( 1520), new PapBig( 1444), new PapBig( 1368), new PapBig( 1292), new PapBig( 1216), new PapBig( 1140), new PapBig( 1064), new PapBig( 988), new PapBig( 912), new PapBig( 836), new PapBig( 760), new PapBig( 722), new PapBig( 684), new PapBig( 665), new PapBig( 646), new PapBig( 627), new PapBig( 608), new PapBig( 589), new PapBig( 570), new PapBig( 551), new PapBig( 532), new PapBig( 513), new PapBig( 494), new PapBig( 475), new PapBig( 456), new PapBig( 437), new PapBig( 418), new PapBig( 399), new PapBig( 380), new PapBig( 361), new PapBig( 342), new PapBig( 323), new PapBig( 304), new PapBig( 285), new PapBig( 266), new PapBig( 247), new PapBig( 228), new PapBig( 209), new PapBig( 190), new PapBig( 171), new PapBig( 152), new PapBig( 133), new PapBig( 114), new PapBig( 95), new PapBig( 76), new PapBig( 57), new PapBig( 38), new PapBig( 19), new PapBig( 0)];
    ZAHL1: any = new PapBig(1);
    ZAHL2: any = new PapBig(2);
    ZAHL5: any = new PapBig(5);
    ZAHL7: any = new PapBig(7);
    ZAHL12: any = new PapBig(12);
    ZAHL100: any = new PapBig(100);
    ZAHL360: any = new PapBig(360);
    ZAHL500: any = new PapBig(500);
    ZAHL700: any = new PapBig(700);
    ZAHL1000: any = new PapBig(1000);
    ZAHL10000: any = new PapBig(10000);

    /** Fuehrt den kompletten Programmablaufplan aus. */
    calculate(): void {
        this.MPARA();
        this.MRE4JL();
        this.VBEZBSO = new PapBig(0);
        this.MRE4();
        this.MRE4ABZ();
        this.MBERECH();
        this.MSONST();
    }

    MPARA(): void {
        this.BBGRVALV = new PapBig(101400);
        this.AVSATZAN = new PapBig(0.013);
        this.RVSATZAN = new PapBig(0.093);
        this.BBGKVPV = new PapBig(69750);
        this.KVSATZAN = (this.KVZ.div(this.ZAHL2).div(this.ZAHL100)).plus(new PapBig(0.07));
        if (this.PVS === 1) {
            this.PVSATZAN = new PapBig(0.023);
        } else {
            this.PVSATZAN = new PapBig(0.018);
        }
        if (this.PVZ === 1) {
            this.PVSATZAN = this.PVSATZAN.plus(new PapBig(0.006));
        } else {
            this.PVSATZAN = this.PVSATZAN.minus(this.PVA.times(new PapBig(0.0025)));
        }
        this.W1STKL5 = new PapBig(14071);
        this.W2STKL5 = new PapBig(34939);
        this.W3STKL5 = new PapBig(222260);
        this.GFB = new PapBig(12348);
        this.SOLZFREI = new PapBig(20350);
    }

    MRE4JL(): void {
        if (this.LZZ === 1) {
            this.ZRE4J = this.RE4.div(this.ZAHL100).round(2, 0);
            this.ZVBEZJ = this.VBEZ.div(this.ZAHL100).round(2, 0);
            this.JLFREIB = this.LZZFREIB.div(this.ZAHL100).round(2, 0);
            this.JLHINZU = this.LZZHINZU.div(this.ZAHL100).round(2, 0);
        } else {
            if (this.LZZ === 2) {
                this.ZRE4J = (this.RE4.times(this.ZAHL12)).div(this.ZAHL100).round(2, 0);
                this.ZVBEZJ = (this.VBEZ.times(this.ZAHL12)).div(this.ZAHL100).round(2, 0);
                this.JLFREIB = (this.LZZFREIB.times(this.ZAHL12)).div(this.ZAHL100).round(2, 0);
                this.JLHINZU = (this.LZZHINZU.times(this.ZAHL12)).div(this.ZAHL100).round(2, 0);
            } else {
                if (this.LZZ === 3) {
                    this.ZRE4J = (this.RE4.times(this.ZAHL360)).div(this.ZAHL700).round(2, 0);
                    this.ZVBEZJ = (this.VBEZ.times(this.ZAHL360)).div(this.ZAHL700).round(2, 0);
                    this.JLFREIB = (this.LZZFREIB.times(this.ZAHL360)).div(this.ZAHL700).round(2, 0);
                    this.JLHINZU = (this.LZZHINZU.times(this.ZAHL360)).div(this.ZAHL700).round(2, 0);
                } else {
                    this.ZRE4J = (this.RE4.times(this.ZAHL360)).div(this.ZAHL100).round(2, 0);
                    this.ZVBEZJ = (this.VBEZ.times(this.ZAHL360)).div(this.ZAHL100).round(2, 0);
                    this.JLFREIB = (this.LZZFREIB.times(this.ZAHL360)).div(this.ZAHL100).round(2, 0);
                    this.JLHINZU = (this.LZZHINZU.times(this.ZAHL360)).div(this.ZAHL100).round(2, 0);
                }
            }
        }
        if (this.af === 0) {
            this.f = 1;
        }
    }

    MRE4(): void {
        if (this.ZVBEZJ.cmp(new PapBig(0)) === 0) {
            this.FVBZ = new PapBig(0);
            this.FVB = new PapBig(0);
            this.FVBZSO = new PapBig(0);
            this.FVBSO = new PapBig(0);
        } else {
            if (this.VJAHR < 2006) {
                this.J = 1;
            } else {
                if (this.VJAHR < 2058) {
                    this.J = this.VJAHR - 2004;
                } else {
                    this.J = 54;
                }
            }
            if (this.LZZ === 1) {
                this.VBEZB = (this.VBEZM.times(new PapBig(this.ZMVB))).plus(this.VBEZS);
                this.HFVB = this.TAB2[this.J].div(this.ZAHL12).times(new PapBig(this.ZMVB)).round(0, 3);
                this.FVBZ = this.TAB3[this.J].div(this.ZAHL12).times(new PapBig(this.ZMVB)).round(0, 3);
            } else {
                this.VBEZB = ((this.VBEZM.times(this.ZAHL12)).plus(this.VBEZS)).round(2, 0);
                this.HFVB = this.TAB2[this.J];
                this.FVBZ = this.TAB3[this.J];
            }
            this.FVB = ((this.VBEZB.times(this.TAB1[this.J]))).div(this.ZAHL100).round(2, 3);
            if (this.FVB.cmp(this.HFVB) === 1) {
                this.FVB = this.HFVB;
            }
            if (this.FVB.cmp(this.ZVBEZJ) === 1) {
                this.FVB = this.ZVBEZJ;
            }
            this.FVBSO = (this.FVB.plus((this.VBEZBSO.times(this.TAB1[this.J])).div(this.ZAHL100))).round(2, 3);
            if (this.FVBSO.cmp(this.TAB2[this.J]) === 1) {
                this.FVBSO = this.TAB2[this.J];
            }
            this.HFVBZSO = (((this.VBEZB.plus(this.VBEZBSO)).div(this.ZAHL100)).minus(this.FVBSO)).round(2, 0);
            this.FVBZSO = (this.FVBZ.plus((this.VBEZBSO).div(this.ZAHL100))).round(0, 3);
            if (this.FVBZSO.cmp(this.HFVBZSO) === 1) {
                this.FVBZSO = this.HFVBZSO.round(0, 3);
            }
            if (this.FVBZSO.cmp(this.TAB3[this.J]) === 1) {
                this.FVBZSO = this.TAB3[this.J];
            }
            this.HFVBZ = ((this.VBEZB.div(this.ZAHL100)).minus(this.FVB)).round(2, 0);
            if (this.FVBZ.cmp(this.HFVBZ) === 1) {
                this.FVBZ = this.HFVBZ.round(0, 3);
            }
        }
        this.MRE4ALTE();
    }

    MRE4ALTE(): void {
        if (this.ALTER1 === 0) {
            this.ALTE = new PapBig(0);
        } else {
            if (this.AJAHR < 2006) {
                this.K = 1;
            } else {
                if (this.AJAHR < 2058) {
                    this.K = this.AJAHR - 2004;
                } else {
                    this.K = 54;
                }
            }
            this.BMG = this.ZRE4J.minus(this.ZVBEZJ);
            this.ALTE = (this.BMG.times(this.TAB4[this.K])).round(0, 3);
            this.HBALTE = this.TAB5[this.K];
            if (this.ALTE.cmp(this.HBALTE) === 1) {
                this.ALTE = this.HBALTE;
            }
        }
    }

    MRE4ABZ(): void {
        this.ZRE4 = (this.ZRE4J.minus(this.FVB).minus(this.ALTE).minus(this.JLFREIB).plus(this.JLHINZU)).round(2, 0);
        if (this.ZRE4.cmp(new PapBig(0)) === -1) {
            this.ZRE4 = new PapBig(0);
        }
        this.ZRE4VP = this.ZRE4J;
        this.ZVBEZ = this.ZVBEZJ.minus(this.FVB).round(2, 0);
        if (this.ZVBEZ.cmp(new PapBig(0)) === -1) {
            this.ZVBEZ = new PapBig(0);
        }
    }

    MBERECH(): void {
        this.MZTABFB();
        this.VFRB = ((this.ANP.plus(this.FVB.plus(this.FVBZ))).times(this.ZAHL100)).round(0, 0);
        this.MLSTJAHR();
        this.WVFRB = ((this.ZVE.minus(this.GFB)).times(this.ZAHL100)).round(0, 0);
        if (this.WVFRB.cmp(new PapBig(0)) === -1) {
            this.WVFRB = new PapBig(0);
        }
        this.LSTJAHR = (this.ST.times(new PapBig(this.f))).round(0, 0);
        this.UPLSTLZZ();
        if (this.ZKF.cmp(new PapBig(0)) === 1) {
            this.ZTABFB = this.ZTABFB.plus(this.KFB);
            this.MRE4ABZ();
            this.MLSTJAHR();
            this.JBMG = (this.ST.times(new PapBig(this.f))).round(0, 0);
        } else {
            this.JBMG = this.LSTJAHR;
        }
        this.MSOLZ();
    }

    MZTABFB(): void {
        this.ANP = new PapBig(0);
        if (this.ZVBEZ.cmp(new PapBig(0)) >= 0 && this.ZVBEZ.cmp(this.FVBZ) === -1) {
            this.FVBZ = new PapBig(this.ZVBEZ.round(0, 0).toNumber());
        }
        if (this.STKL < 6) {
            if (this.ZVBEZ.cmp(new PapBig(0)) === 1) {
                if ((this.ZVBEZ.minus(this.FVBZ)).cmp(new PapBig(102)) === -1) {
                    this.ANP = (this.ZVBEZ.minus(this.FVBZ)).round(0, 3);
                } else {
                    this.ANP = new PapBig(102);
                }
            }
        } else {
            this.FVBZ = new PapBig(0);
            this.FVBZSO = new PapBig(0);
        }
        if (this.STKL < 6) {
            if (this.ZRE4.cmp(this.ZVBEZ) === 1) {
                if (this.ZRE4.minus(this.ZVBEZ).cmp(new PapBig(1230)) === -1) {
                    this.ANP = this.ANP.plus(this.ZRE4).minus(this.ZVBEZ).round(0, 3);
                } else {
                    this.ANP = this.ANP.plus(new PapBig(1230));
                }
            }
        }
        this.KZTAB = 1;
        if (this.STKL === 1) {
            this.SAP = new PapBig(36);
            this.KFB = (this.ZKF.times(new PapBig(9756))).round(0, 0);
        } else {
            if (this.STKL === 2) {
                this.EFA = new PapBig(4260);
                this.SAP = new PapBig(36);
                this.KFB = (this.ZKF.times(new PapBig(9756))).round(0, 0);
            } else {
                if (this.STKL === 3) {
                    this.KZTAB = 2;
                    this.SAP = new PapBig(36);
                    this.KFB = (this.ZKF.times(new PapBig(9756))).round(0, 0);
                } else {
                    if (this.STKL === 4) {
                        this.SAP = new PapBig(36);
                        this.KFB = (this.ZKF.times(new PapBig(4878))).round(0, 0);
                    } else {
                        if (this.STKL === 5) {
                            this.SAP = new PapBig(36);
                            this.KFB = new PapBig(0);
                        } else {
                            this.KFB = new PapBig(0);
                        }
                    }
                }
            }
        }
        this.ZTABFB = (this.EFA.plus(this.ANP).plus(this.SAP).plus(this.FVBZ)).round(2, 0);
    }

    MLSTJAHR(): void {
        this.UPEVP();
        this.ZVE = this.ZRE4.minus(this.ZTABFB).minus(this.VSP);
        this.UPMLST();
    }

    UPLSTLZZ(): void {
        this.JW = this.LSTJAHR.times(this.ZAHL100);
        this.UPANTEIL();
        this.LSTLZZ = this.ANTEIL1;
    }

    UPMLST(): void {
        if (this.ZVE.cmp(this.ZAHL1) === -1) {
            this.ZVE = new PapBig(0);
            this.X = new PapBig(0);
        } else {
            this.X = (this.ZVE.div(new PapBig(this.KZTAB))).round(0, 0);
        }
        if (this.STKL < 5) {
            this.UPTAB26();
        } else {
            this.MST5_6();
        }
    }

    UPEVP(): void {
        if (this.KRV === 1) {
            this.VSPR = new PapBig(0);
        } else {
            if (this.ZRE4VP.cmp(this.BBGRVALV) === 1) {
                this.ZRE4VPR = this.BBGRVALV;
            } else {
                this.ZRE4VPR = this.ZRE4VP;
            }
            this.VSPR = (this.ZRE4VPR.times(this.RVSATZAN)).round(2, 0);
        }
        this.MVSPKVPV();
        if (this.ALV === 1) {
        } else {
            if (this.STKL === 6) {
            } else {
                this.MVSPHB();
            }
        }
    }

    MVSPKVPV(): void {
        if (this.ZRE4VP.cmp(this.BBGKVPV) === 1) {
            this.ZRE4VPR = this.BBGKVPV;
        } else {
            this.ZRE4VPR = this.ZRE4VP;
        }
        if (this.PKV > 0) {
            if (this.STKL === 6) {
                this.VSPKVPV = new PapBig(0);
            } else {
                this.PKPVAGZJ = this.PKPVAGZ.times(this.ZAHL12).div(this.ZAHL100).round(2, 0);
                this.VSPKVPV = this.PKPV.times(this.ZAHL12).div(this.ZAHL100).round(2, 0);
                this.VSPKVPV = this.VSPKVPV.minus(this.PKPVAGZJ);
                if (this.VSPKVPV.cmp(new PapBig(0)) === -1) {
                    this.VSPKVPV = new PapBig(0);
                }
            }
        } else {
            this.VSPKVPV = this.ZRE4VPR.times(this.KVSATZAN.plus(this.PVSATZAN)).round(2, 0);
        }
        this.VSP = this.VSPKVPV.plus(this.VSPR).round(0, 3);
    }

    MVSPHB(): void {
        if (this.ZRE4VP.cmp(this.BBGRVALV) === 1) {
            this.ZRE4VPR = this.BBGRVALV;
        } else {
            this.ZRE4VPR = this.ZRE4VP;
        }
        this.VSPALV = this.AVSATZAN.times(this.ZRE4VPR).round(2, 0);
        this.VSPHB = this.VSPALV.plus(this.VSPKVPV).round(2, 0);
        if (this.VSPHB.cmp(new PapBig(1900)) === 1) {
            this.VSPHB = new PapBig(1900);
        }
        this.VSPN = this.VSPR.plus(this.VSPHB).round(0, 3);
        if (this.VSPN.cmp(this.VSP) === 1) {
            this.VSP = this.VSPN;
        }
    }

    MST5_6(): void {
        this.ZZX = this.X;
        if (this.ZZX.cmp(this.W2STKL5) === 1) {
            this.ZX = this.W2STKL5;
            this.UP5_6();
            if (this.ZZX.cmp(this.W3STKL5) === 1) {
                this.ST = (this.ST.plus((this.W3STKL5.minus(this.W2STKL5)).times(new PapBig(0.42)))).round(0, 0);
                this.ST = (this.ST.plus((this.ZZX.minus(this.W3STKL5)).times(new PapBig(0.45)))).round(0, 0);
            } else {
                this.ST = (this.ST.plus((this.ZZX.minus(this.W2STKL5)).times(new PapBig(0.42)))).round(0, 0);
            }
        } else {
            this.ZX = this.ZZX;
            this.UP5_6();
            if (this.ZZX.cmp(this.W1STKL5) === 1) {
                this.VERGL = this.ST;
                this.ZX = this.W1STKL5;
                this.UP5_6();
                this.HOCH = (this.ST.plus((this.ZZX.minus(this.W1STKL5)).times(new PapBig(0.42)))).round(0, 0);
                if (this.HOCH.cmp(this.VERGL) === -1) {
                    this.ST = this.HOCH;
                } else {
                    this.ST = this.VERGL;
                }
            }
        }
    }

    UP5_6(): void {
        this.X = (this.ZX.times(new PapBig(1.25))).round(0, 0);
        this.UPTAB26();
        this.ST1 = this.ST;
        this.X = (this.ZX.times(new PapBig(0.75))).round(0, 0);
        this.UPTAB26();
        this.ST2 = this.ST;
        this.DIFF = (this.ST1.minus(this.ST2)).times(this.ZAHL2);
        this.MIST = (this.ZX.times(new PapBig(0.14))).round(0, 0);
        if (this.MIST.cmp(this.DIFF) === 1) {
            this.ST = this.MIST;
        } else {
            this.ST = this.DIFF;
        }
    }

    MSOLZ(): void {
        this.SOLZFREI = (this.SOLZFREI.times(new PapBig(this.KZTAB)));
        if (this.JBMG.cmp(this.SOLZFREI) === 1) {
            this.SOLZJ = (this.JBMG.times(new PapBig(5.5))).div(this.ZAHL100).round(2, 0);
            this.SOLZMIN = (this.JBMG.minus(this.SOLZFREI)).times(new PapBig(11.9)).div(this.ZAHL100).round(2, 0);
            if (this.SOLZMIN.cmp(this.SOLZJ) === -1) {
                this.SOLZJ = this.SOLZMIN;
            }
            this.JW = this.SOLZJ.times(this.ZAHL100).round(0, 0);
            this.UPANTEIL();
            this.SOLZLZZ = this.ANTEIL1;
        } else {
            this.SOLZLZZ = new PapBig(0);
        }
        if (this.R > 0) {
            this.JW = this.JBMG.times(this.ZAHL100);
            this.UPANTEIL();
            this.BK = this.ANTEIL1;
        } else {
            this.BK = new PapBig(0);
        }
    }

    UPANTEIL(): void {
        if (this.LZZ === 1) {
            this.ANTEIL1 = this.JW;
        } else {
            if (this.LZZ === 2) {
                this.ANTEIL1 = this.JW.div(this.ZAHL12).round(0, 0);
            } else {
                if (this.LZZ === 3) {
                    this.ANTEIL1 = (this.JW.times(this.ZAHL7)).div(this.ZAHL360).round(0, 0);
                } else {
                    this.ANTEIL1 = this.JW.div(this.ZAHL360).round(0, 0);
                }
            }
        }
    }

    MSONST(): void {
        this.LZZ = 1;
        if (this.ZMVB === 0) {
            this.ZMVB = 12;
        }
        if (this.SONSTB.cmp(new PapBig(0)) === 0 && this.MBV.cmp(new PapBig(0)) === 0) {
            this.LSTSO = new PapBig(0);
            this.STS = new PapBig(0);
            this.SOLZS = new PapBig(0);
            this.BKS = new PapBig(0);
        } else {
            this.MOSONST();
            this.ZRE4J = ((this.JRE4.plus(this.SONSTB)).div(this.ZAHL100)).round(2, 0);
            this.ZVBEZJ = ((this.JVBEZ.plus(this.VBS)).div(this.ZAHL100)).round(2, 0);
            this.VBEZBSO = this.STERBE;
            this.MRE4SONST();
            this.MLSTJAHR();
            this.WVFRBM = (this.ZVE.minus(this.GFB)).times(this.ZAHL100).round(2, 0);
            if (this.WVFRBM.cmp(new PapBig(0)) === -1) {
                this.WVFRBM = new PapBig(0);
            }
            this.LSTSO = this.ST.times(this.ZAHL100);
            this.STS = this.LSTSO.minus(this.LSTOSO).times(new PapBig(this.f)).div(this.ZAHL100).round(0, 0).times(this.ZAHL100);
            this.STSMIN();
        }
    }

    STSMIN(): void {
        if (this.STS.cmp(new PapBig(0)) === -1) {
            if (this.MBV.cmp(new PapBig(0)) === 0) {
            } else {
                this.LSTLZZ = this.LSTLZZ.plus(this.STS);
                if (this.LSTLZZ.cmp(new PapBig(0)) === -1) {
                    this.LSTLZZ = new PapBig(0);
                }
                this.SOLZLZZ = this.SOLZLZZ.plus(this.STS.times(new PapBig(5.5).div(this.ZAHL100))).round(0, 0);
                if (this.SOLZLZZ.cmp(new PapBig(0)) === -1) {
                    this.SOLZLZZ = new PapBig(0);
                }
                this.BK = this.BK.plus(this.STS);
                if (this.BK.cmp(new PapBig(0)) === -1) {
                    this.BK = new PapBig(0);
                }
            }
            this.STS = new PapBig(0);
            this.SOLZS = new PapBig(0);
        } else {
            this.MSOLZSTS();
        }
        if (this.R > 0) {
            this.BKS = this.STS;
        } else {
            this.BKS = new PapBig(0);
        }
    }

    MSOLZSTS(): void {
        if (this.ZKF.cmp(new PapBig(0)) === 1) {
            this.SOLZSZVE = this.ZVE.minus(this.KFB);
        } else {
            this.SOLZSZVE = this.ZVE;
        }
        if (this.SOLZSZVE.cmp(new PapBig(1)) === -1) {
            this.SOLZSZVE = new PapBig(0);
            this.X = new PapBig(0);
        } else {
            this.X = this.SOLZSZVE.div(new PapBig(this.KZTAB)).round(0, 0);
        }
        if (this.STKL < 5) {
            this.UPTAB26();
        } else {
            this.MST5_6();
        }
        this.SOLZSBMG = this.ST.times(new PapBig(this.f)).round(0, 0);
        if (this.SOLZSBMG.cmp(this.SOLZFREI) === 1) {
            this.SOLZS = this.STS.times(new PapBig(5.5)).div(this.ZAHL100).round(0, 0);
        } else {
            this.SOLZS = new PapBig(0);
        }
    }

    MOSONST(): void {
        this.ZRE4J = (this.JRE4.div(this.ZAHL100)).round(2, 0);
        this.ZVBEZJ = (this.JVBEZ.div(this.ZAHL100)).round(2, 0);
        this.JLFREIB = this.JFREIB.div(this.ZAHL100).round(2, 0);
        this.JLHINZU = this.JHINZU.div(this.ZAHL100).round(2, 0);
        this.MRE4();
        this.MRE4ABZ();
        this.ZRE4VP = this.ZRE4VP.minus(this.JRE4ENT.div(this.ZAHL100));
        this.MZTABFB();
        this.VFRBS1 = ((this.ANP.plus(this.FVB.plus(this.FVBZ))).times(this.ZAHL100)).round(2, 0);
        this.MLSTJAHR();
        this.WVFRBO = ((this.ZVE.minus(this.GFB)).times(this.ZAHL100)).round(2, 0);
        if (this.WVFRBO.cmp(new PapBig(0)) === -1) {
            this.WVFRBO = new PapBig(0);
        }
        this.LSTOSO = this.ST.times(this.ZAHL100);
    }

    MRE4SONST(): void {
        this.MRE4();
        this.FVB = this.FVBSO;
        this.MRE4ABZ();
        this.ZRE4VP = this.ZRE4VP.plus(this.MBV.div(this.ZAHL100)).minus(this.JRE4ENT.div(this.ZAHL100)).minus(this.SONSTENT.div(this.ZAHL100));
        this.FVBZ = this.FVBZSO;
        this.MZTABFB();
        this.VFRBS2 = ((((this.ANP.plus(this.FVB).plus(this.FVBZ))).times(this.ZAHL100))).minus(this.VFRBS1);
    }

    UPTAB26(): void {
        if (this.X.cmp(this.GFB.plus(this.ZAHL1)) === -1) {
            this.ST = new PapBig(0);
        } else {
            if (this.X.cmp(new PapBig(17800)) === -1) {
                this.Y = (this.X.minus(this.GFB)).div(this.ZAHL10000).round(6, 0);
                this.RW = this.Y.times(new PapBig(914.51));
                this.RW = this.RW.plus(new PapBig(1400));
                this.ST = (this.RW.times(this.Y)).round(0, 0);
            } else {
                if (this.X.cmp(new PapBig(69879)) === -1) {
                    this.Y = (this.X.minus(new PapBig(17799))).div(this.ZAHL10000).round(6, 0);
                    this.RW = this.Y.times(new PapBig(173.1));
                    this.RW = this.RW.plus(new PapBig(2397));
                    this.RW = this.RW.times(this.Y);
                    this.ST = (this.RW.plus(new PapBig(1034.87))).round(0, 0);
                } else {
                    if (this.X.cmp(new PapBig(277826)) === -1) {
                        this.ST = ((this.X.times(new PapBig(0.42))).minus(new PapBig(11135.63))).round(0, 0);
                    } else {
                        this.ST = ((this.X.times(new PapBig(0.45))).minus(new PapBig(19470.38))).round(0, 0);
                    }
                }
            }
        }
        this.ST = this.ST.times(new PapBig(this.KZTAB));
    }
}

export default Lohnsteuer2026;
