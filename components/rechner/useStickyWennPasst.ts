'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Sticky nur dann, wenn das Element vollstaendig ins Fenster passt.
 *
 * WARUM DAS NICHT IN CSS GEHT
 * ---------------------------
 * `position: sticky` klebt ein Element am oberen Rand, sobald es dort
 * ankommt. Ist das Element hoeher als das Fenster, bleibt sein unterer Teil
 * dauerhaft ausserhalb des sichtbaren Bereichs und ist nicht mehr erreichbar.
 * Der uebliche Ausweg - `max-height` plus `overflow-y-auto` - erzeugt eine
 * zweite Scrollleiste im Element. Beides ist unerwuenscht.
 *
 * Deshalb wird die Hoehe gemessen: Passt das Element, wird geklebt. Passt es
 * nicht, scrollt es normal mit der Seite mit. In keinem Fall entsteht eine
 * eigene Scrollleiste.
 *
 * Auf schmalen Bildschirmen liegt die Seitenleiste ohnehin ueber dem Ergebnis,
 * dort waere Sticky sinnlos - daher die Breitenbedingung.
 *
 * WARUM WEDER ResizeObserver NOCH requestAnimationFrame ALLEIN TRAGEN
 * -------------------------------------------------------------------
 * Beide sind an den Rendering-Lebenszyklus gekoppelt und liefern in einem
 * nicht sichtbaren Tab keine Rueckmeldung - der ResizeObserver feuerte in der
 * Testumgebung nicht einmal die laut Spezifikation garantierte erste
 * Beobachtung nach `observe`. Die Messung laeuft deshalb direkt nach jedem
 * Render; Observer und Resize-Listener sind nur zusaetzliche Ausloeser fuer
 * Aenderungen, die ohne Render passieren (etwa nachgeladene Schriften).
 */
export function useStickyWennPasst({
    abBreite = 1024,
    abstandOben = 24,
    puffer = 24,
}: {
    /** Ab dieser Fensterbreite ueberhaupt kleben (entspricht Tailwind `lg`). */
    abBreite?: number;
    /** Abstand zum oberen Fensterrand in Pixeln. */
    abstandOben?: number;
    /** Zusaetzlicher Sicherheitsabstand nach unten. */
    puffer?: number;
} = {}) {
    const ref = useRef<HTMLElement>(null);
    const [klebt, setKlebt] = useState(false);

    const pruefen = useCallback(() => {
        const el = ref.current;
        if (!el) return;

        const breitGenug = window.innerWidth >= abBreite;
        // offsetHeight ist die tatsaechlich gerenderte Hoehe einschliesslich
        // Rahmen - also genau das, was Platz braucht.
        const passt = el.offsetHeight + abstandOben + puffer <= window.innerHeight;

        // Nur setzen, wenn sich etwas aendert: React wuerde bei gleichem Wert
        // zwar ohnehin nicht neu rendern, aber so bleibt die Absicht sichtbar.
        setKlebt((vorher) => {
            const neu = breitGenug && passt;
            return neu === vorher ? vorher : neu;
        });
    }, [abBreite, abstandOben, puffer]);

    // Nach jedem Render neu messen. Bewusst ohne Abhaengigkeitsliste: Jede
    // Aenderung im Panel (aufgeklappter Expertenbereich, laengere Hinweise,
    // Wechsel des Rechtsstands) veraendert die Hoehe und braucht eine neue
    // Messung. Wenn useEffect laeuft, ist das Layout bereits geschrieben,
    // `offsetHeight` also belastbar.
    //
    // Die Kaskade ist begrenzt: `pruefen` setzt nur bei echter Aenderung, der
    // Folgerender misst denselben Wert erneut und bricht ab. Ein Ausweichen auf
    // requestAnimationFrame waere schlechter - in nicht sichtbaren Tabs feuert
    // es nicht, die Seitenleiste bliebe dort dauerhaft unbeklebt.
    useEffect(pruefen);

    // Aenderungen ohne Render: Fenstergroesse, nachgeladene Schriften.
    useEffect(() => {
        window.addEventListener('resize', pruefen);

        let beobachter: ResizeObserver | undefined;
        if (typeof ResizeObserver !== 'undefined' && ref.current) {
            beobachter = new ResizeObserver(pruefen);
            beobachter.observe(ref.current);
        }

        return () => {
            window.removeEventListener('resize', pruefen);
            beobachter?.disconnect();
        };
    }, [pruefen]);

    return {
        ref,
        klebt,
        /** Fertige Klassen fuer das Element. */
        klassen: klebt ? 'lg:sticky' : '',
        stil: klebt ? { top: abstandOben } : undefined,
    };
}
