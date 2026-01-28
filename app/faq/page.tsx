import React from 'react';
import { FAQClient } from '../../components/FAQClient';
import { StructuredData } from '../../components/StructuredData';

export const metadata = {
    title: 'Häufige Fragen (FAQ) | Steuerlast-Rechner.de',
    description: 'Antworten zu Steuerklassen, Sozialabgaben 2026, Home Office Pauschale, Werbungskosten und der Berechnung des Netto-Gehalts.',
};

export default function FAQPage() {
    return (
        <>
            <StructuredData />
            <FAQClient />
        </>
    );
}
