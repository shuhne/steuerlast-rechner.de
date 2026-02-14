import React from 'react';
import { FAQClient } from '../../components/FAQClient';
import { StructuredData } from '../../components/StructuredData';
import { FAQ_ITEMS } from '../../data/faq';

export const metadata = {
    title: 'Häufige Fragen (FAQ) | Steuerlast-Rechner.de',
    description: 'Antworten zu Steuerklassen, Sozialabgaben 2026, Home Office Pauschale, Werbungskosten und der Berechnung des Netto-Gehalts.',
    alternates: {
        canonical: './faq',
    },
};

export default function FAQPage() {
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": FAQ_ITEMS.map(item => ({
            "@type": "Question",
            "name": item.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": item.answer
            }
        }))
    };

    return (
        <>
            <StructuredData data={faqSchema} />
            <FAQClient />
        </>
    );
}
