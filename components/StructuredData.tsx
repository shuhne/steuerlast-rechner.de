import React from 'react';

interface StructuredDataProps {
    data?: Record<string, any>;
}

export function StructuredData({ data }: StructuredDataProps) {
    const defaultData = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Steuerlast Rechner 2026",
        "url": "https://steuerlast-rechner.de",
        "applicationCategory": "FinanceApplication",
        "operatingSystem": "Web",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "EUR"
        },
        "featureList": "Brutto Netto Rechner, Steuerlast Prognose, Sozialabgaben Rechner",
        "description": "Kostenloser Brutto-Netto-Rechner für 2026 mit Prognose-Funktion für zukünftige Sozialabgaben und Steuerlasten."
    };

    const structuredData = data || defaultData;

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
    );
}
