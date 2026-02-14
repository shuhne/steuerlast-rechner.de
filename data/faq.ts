export interface FAQItem {
    question: string;
    answer: string;
    category: 'general' | 'social' | 'tax' | 'future';
}

export const FAQ_ITEMS: FAQItem[] = [
    {
        question: "Was ändert sich 2026 bei den Sozialabgaben?",
        answer: "Für 2026 werden steigende Beiträge in der gesetzlichen Krankenversicherung (Zusatzbeitrag) und der Pflegeversicherung erwartet. Experten gehen von einem Anstieg der Beitragsbemessungsgrenzen sowie leichten Erhöhungen beim Zusatzbeitrag aus, um die steigenden Kosten im Gesundheitssystem zu decken.",
        category: 'social'
    },
    {
        question: "Wie genau ist die Zukunftsprognose?",
        answer: "Die Prognosen basieren auf demografischen Entwicklungen (Verrentung der Babyboomer) und offiziellen Schätzungen führender Wirtschaftsinstitute. Da gesetzliche Änderungen nicht exakt vorhersehbar sind, bieten wir verschiedene Szenarien (Optimistisch, Realistisch, Pessimistisch) an, um eine Bandbreite möglicher Entwicklungen aufzuzeigen.",
        category: 'future'
    },
    {
        question: "Werden meine Daten gespeichert?",
        answer: "Nein. Alle Berechnungen finden ausschließlich lokal in deinem Browser statt. Es werden keine Eingaben an unsere Server gesendet oder gespeichert. Datenschutz hat bei uns höchste Priorität.",
        category: 'general'
    },
    {
        question: "Was bedeutet das 'Pessimistische Szenario 2036'?",
        answer: "Dieses Szenario zeigt, wie sich deine Abgaben entwickeln könnten, wenn keine grundlegenden Reformen stattfinden und die Kosten für Rente und Pflege durch die alternde Gesellschaft stark ansteigen. Es nimmt an, dass Beitragssätze deutlich erhöht werden müssen, um das System zu finanzieren.",
        category: 'future'
    },
    {
        question: "Lohnt sich ein Wechsel der Steuerklasse?",
        answer: "Ein Wechsel der Steuerklasse (z.B. von 4/4 auf 3/5) kann das monatliche Netto kurzfristig erhöhen, ändert aber nichts an der jährlichen Gesamtsteuerlast. Eine Nachzahlung am Jahresende ist bei Kombination 3/5 daher oft möglich. Seit 2026 wird zudem das Faktorverfahren als faire Alternative stärker gefördert.",
        category: 'tax'
    },
    {
        question: "Wie wirken sich Kinderfreibeträge aus?",
        answer: "Kinderfreibeträge mindern das zu versteuernde Einkommen, wirken sich aber meist erst bei der Einkommensteuererklärung aus (Günstigerprüfung zwischen Kindergeld und Freibetrag). Beim Solidaritätszuschlag und der Kirchensteuer werden sie jedoch bereits monatlich berücksichtigt.",
        category: 'tax'
    },
    {
        question: "Was sind Werbungskosten und die Pauschale?",
        answer: "Werbungskosten sind Ausgaben, die dem Erwerb, der Sicherung und der Erhaltung der Einnahmen dienen. Jeder Arbeitnehmer erhält automatisch eine Werbungskostenpauschale (Arbeitnehmer-Pauschbetrag, aktuell 1.230 €). Liegen deine tatsächlichen Kosten höher (z.B. Fahrtwege, Arbeitsmittel), kannst du diese in der Steuererklärung absetzen.",
        category: 'tax'
    },
    {
        question: "Kann ich das Home Office absetzen?",
        answer: "Ja, mit der Home-Office-Pauschale kannst du pro Tag im Home Office einen festen Betrag (aktuell 6 €/Tag, max. 1.260 €/Jahr) als Werbungskosten geltend machen. Dies gilt auch, wenn kein separates Arbeitszimmer vorhanden ist.",
        category: 'tax'
    },
    {
        question: "Was ist der Grenzsteuersatz?",
        answer: "Der Grenzsteuersatz gibt an, mit welchem Prozentsatz jeder ZUSÄTZLICH verdiente Euro versteuert wird. Er ist in Deutschland progressiv und steigt mit dem Einkommen an (bis zum Spitzensteuersatz von 42% bzw. 45%). Er ist nicht zu verwechseln mit dem Durchschnittssteuersatz, der meist viel niedriger liegt.",
        category: 'general'
    }
];
