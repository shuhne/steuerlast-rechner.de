import React from 'react';

interface StructuredDataProps {
    /**
     * Optional structured data override. Must NEVER contain user-supplied strings.
     * Only pass hardcoded, trusted values (e.g. legal/Impressum metadata).
     * User input here would bypass XSS protections since this renders into a
     * script tag via dangerouslySetInnerHTML.
     */
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

    // Escape </script> sequences to prevent premature script-tag termination (XSS).
    // JSON.stringify does not escape these sequences on its own.
    const safeJson = JSON.stringify(structuredData).replace(/<\/script>/gi, '<\\/script>');

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: safeJson }}
        />
    );
}
