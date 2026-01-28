import React from 'react';

export function StructuredData() {
    const structuredData = {
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

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
    );
}
