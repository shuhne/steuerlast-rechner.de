export interface FAQItem {
    question: string;
    answer: string;
    category: 'general' | 'social' | 'tax' | 'future';
}

/**
 * Die Antworten sollen belegbar sein. Wo eine Zahl genannt wird, gehoert die
 * Quelle dazu. Wo etwas unsicher ist, wird das gesagt.
 */
export const FAQ_ITEMS: FAQItem[] = [
    {
        question: 'Wie genau rechnet dieser Rechner?',
        answer:
            'Die Lohnsteuer wird nach dem amtlichen Programmablaufplan des Bundesfinanzministeriums ' +
            'berechnet — demselben Verfahren, das Lohnabrechnungsprogramme verwenden. Der Rechenkern ' +
            'wird direkt aus der vom BMF veröffentlichten XML-Fassung erzeugt und automatisch gegen ' +
            'die amtlichen Prüftabellen getestet: 43 Bruttostufen in sechs Steuerklassen, in beiden ' +
            'Tabellen, mit einer Toleranz von null Euro. Abweichungen lassen den Build fehlschlagen.',
        category: 'general',
    },
    {
        question: 'Werden meine Daten übertragen oder gespeichert?',
        answer:
            'Nein. Die gesamte Berechnung läuft in deinem Browser; Gehalt, Steuerklasse und die ' +
            'übrigen Angaben verlassen dein Gerät nicht. Es gibt keine Cookies, kein Tracking und ' +
            'keine Analytics. Wie bei jedem Seitenaufruf verarbeitet der Hosting-Anbieter technisch ' +
            'notwendige Verbindungsdaten wie die IP-Adresse — deine Eingaben sind davon nicht betroffen.',
        category: 'general',
    },
    {
        question: 'Was gilt 2026 bei den Sozialabgaben?',
        answer:
            'Die Beitragsbemessungsgrenze liegt bei 101.400 € im Jahr für die Renten- und ' +
            'Arbeitslosenversicherung und bei 69.750 € für die Kranken- und Pflegeversicherung ' +
            '(Sozialversicherungsrechengrößen-Verordnung 2026). Die Beitragssätze betragen 18,6 % ' +
            'in der Rentenversicherung, 2,6 % in der Arbeitslosenversicherung, 14,6 % in der ' +
            'Krankenversicherung und 3,6 % in der Pflegeversicherung. Der durchschnittliche ' +
            'Zusatzbeitrag zur Krankenversicherung wurde vom Bundesgesundheitsministerium auf 2,9 % ' +
            'festgelegt. Der tatsächlich gewichtete Kassendurchschnitt lag im Januar 2026 höher, ' +
            'bei rund 3,1 % — den eigenen Satz kannst du im Rechner eintragen.',
        category: 'social',
    },
    {
        question: 'Was ist die Grenzabgabenquote?',
        answer:
            'Sie gibt an, welcher Anteil des nächsten verdienten Euro als Steuern und ' +
            'Sozialversicherungsbeiträge abgeht. Sie ist deutlich höher als der oft genannte ' +
            'Grenzsteuersatz, weil dieser nur die Einkommensteuer betrachtet. Bei 60.000 € Brutto ' +
            'liegt der Grenzsteuersatz bei rund 34 %, die tatsächliche Grenzabgabenquote aber bei ' +
            'rund 50 %. Oberhalb der Beitragsbemessungsgrenzen fällt sie sprunghaft, weil dort ' +
            'keine weiteren Sozialbeiträge mehr anfallen.',
        category: 'general',
    },
    {
        question: 'Wie belastbar sind die Zukunftsszenarien?',
        answer:
            'Unterschiedlich — und der Rechner sagt es dir. Jedes Szenario zeigt seinen rechtlichen ' +
            'Status: geltendes Recht, Referentenentwurf, amtliche Vorausberechnung oder eigene ' +
            'Annahme. Die Beitragssätze der Rentenversicherung stammen aus dem ' +
            'Rentenversicherungsbericht 2025 der Bundesregierung, der neun Modellvarianten ' +
            'ausweist. Für die Kranken- und Pflegeversicherung gibt es keine vergleichbare amtliche ' +
            'Langfristrechnung; die dortigen Werte sind Fortschreibungen und als solche ' +
            'gekennzeichnet. Jedes Szenario benennt außerdem, was es bewusst nicht abbildet.',
        category: 'future',
    },
    {
        question: 'Ist die für 2027 angekündigte Steuerreform eingerechnet?',
        answer:
            'Nein, und das ist Absicht. Der Koalitionsausschuss hat sich am 1. Juli 2026 auf eine ' +
            'Einkommensteuerreform zum 1. Januar 2027 verständigt: rund 10 Milliarden Euro ' +
            'Entlastung durch höheren Grundfreibetrag, höheren Kinderfreibetrag, höheres Kindergeld, ' +
            'höheren Arbeitnehmer-Pauschbetrag und eine Abflachung der zweiten Progressionszone. ' +
            'Beschlossen sind bisher aber nur Richtung und Volumen, nicht die konkreten Beträge. ' +
            'Ohne Referentenentwurf wäre jede Zahl frei erfunden. Die 2027er Szenarien zeigen ' +
            'deshalb nur die Sozialabgaben — die tatsächliche Steuerbelastung dürfte niedriger ' +
            'ausfallen als dort dargestellt.',
        category: 'future',
    },
    {
        question: 'Lohnt sich ein Wechsel der Steuerklasse?',
        answer:
            'Die Steuerklassenkombination verändert nur, wie sich der Abzug über das Jahr verteilt — ' +
            'nicht die Jahressteuerschuld. Diese ergibt sich erst aus der gemeinsamen Veranlagung. ' +
            'Bei der Kombination III/V besteht Pflicht zur Einkommensteuererklärung, und es kommt ' +
            'häufig zu Nachzahlungen. Die im Steuerfortentwicklungsgesetz vorgesehene Überführung ' +
            'von III/V in das Faktorverfahren wurde nach dem Bruch der Ampelkoalition gestrichen ' +
            'und ist derzeit nicht geplant.',
        category: 'tax',
    },
    {
        question: 'Wie wirken sich Kinder aus?',
        answer:
            'Zweifach. In der Pflegeversicherung entfällt für Eltern der Zuschlag für Kinderlose von ' +
            '0,6 Beitragssatzpunkten; ab dem zweiten bis zum fünften Kind unter 25 Jahren kommt je ' +
            'Kind ein Abschlag von 0,25 Punkten dazu (§ 55 SGB XI). Steuerlich mindern ' +
            'Kinderfreibeträge beim laufenden Abzug bereits den Solidaritätszuschlag und die ' +
            'Kirchensteuer; bei der Lohnsteuer selbst wirken sie erst über die Günstigerprüfung ' +
            'zwischen Kindergeld und Freibetrag in der Veranlagung.',
        category: 'tax',
    },
    {
        question: 'Warum ist mein Nettogehalt bei einem Midijob höher als erwartet?',
        answer:
            'Zwischen 603,01 € und 2.000 € Monatsbrutto liegt der Übergangsbereich. Dort sind die ' +
            'Arbeitnehmerbeiträge zur Sozialversicherung nach § 20 Abs. 2a SGB IV reduziert und ' +
            'steigen erst an der oberen Grenze auf den vollen Satz. Der Versicherungsschutz bleibt ' +
            'vollständig erhalten, und die Rentenanwartschaft richtet sich weiterhin nach dem vollen ' +
            'Bruttoentgelt.',
        category: 'social',
    },
    {
        question: 'Was ist bei privater Krankenversicherung zu beachten?',
        answer:
            'Gib den vollen Monatsbeitrag inklusive Pflegepflichtversicherung an. Der ' +
            'Arbeitgeberzuschuss nach § 257 SGB V und § 61 SGB XI wird abgezogen: höchstens die ' +
            'Hälfte deines Beitrags und höchstens 508,59 € für die Kranken- plus 104,63 € für die ' +
            'Pflegeversicherung im Monat (in Sachsen 75,56 € für die Pflegeversicherung). ' +
            'Wechseln kannst du erst ab einem Jahresbruttoentgelt von 77.400 €.',
        category: 'social',
    },
    {
        question: 'Was sind Werbungskosten und die Pauschale?',
        answer:
            'Werbungskosten sind Ausgaben für den Beruf. Jeder Arbeitnehmer erhält automatisch den ' +
            'Arbeitnehmer-Pauschbetrag von 1.230 €; er ist im Lohnsteuerabzug bereits enthalten. ' +
            'Liegen die tatsächlichen Kosten höher, kannst du sie in der Steuererklärung geltend ' +
            'machen oder einen Freibetrag beim Finanzamt eintragen lassen — diesen kannst du im ' +
            'Rechner unter "Weitere Angaben" berücksichtigen. Seit 2026 beträgt die ' +
            'Entfernungspauschale einheitlich 38 Cent je Kilometer ab dem ersten Kilometer ' +
            '(Steueränderungsgesetz 2025).',
        category: 'tax',
    },
    {
        question: 'Wie funktioniert der Vergleich mit 1958?',
        answer:
            'Dein heutiges Bruttogehalt wird auf 1958 zurückgerechnet — wahlweise über das ' +
            'Durchschnittsentgelt der Rentenversicherung (relative Position auf der Einkommensskala) ' +
            'oder über die Preisentwicklung laut Bundesbank. Darauf werden der Einkommensteuertarif ' +
            'von 1958 und die damaligen Sozialabgaben angewandt. Der Vergleich ist bewusst ' +
            'unvollständig: Kinderfreibeträge, die Höchstbeträge für Sonderausgaben, die ' +
            'Vermögensteuer und die völlig andere Leistungsseite fehlen. Die Abweichungen wirken ' +
            'überwiegend in dieselbe Richtung — das Netto von 1958 erscheint eher zu hoch. Der ' +
            'Rechner listet alle Einschränkungen und die Belastbarkeit jedes einzelnen Werts auf.',
        category: 'general',
    },
];
