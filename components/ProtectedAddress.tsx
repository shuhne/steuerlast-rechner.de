'use client';

import React, { useEffect, useState } from 'react';

export function ProtectedAddress() {
    const [content, setContent] = useState<React.ReactNode>(null);

    useEffect(() => {
        // Adresse als Base64 kodiert (einfacher Bot-Schutz, kein Sicherheitsmechanismus)
        // "Sascha Huhne (B.Sc. Wirtschaftsinformatik)"
        const p1 = "U2FzY2hhIEh1aG5lIChCLlNjLiBXaXJ0c2NoYWZ0c2luZm9ybWF0aWsp";
        // "Fischerinsel 9"
        const p2 = "RmlzY2hlcmluc2VsIDk=";
        // "10179 Berlin"
        const p3 = "MTAxNzkgQmVybGlu";

        const decode = (str: string) => {
            try {
                return atob(str);
            } catch {
                return "Fehler beim Laden";
            }
        };

        setContent({
            p1: decode(p1),
            p2: decode(p2),
            p3: decode(p3),
        });
    }, []);

    // Placeholder during SSR / initial load (bot sees this)
    if (!content) {
        return <div className="h-20 w-48 bg-slate-800/50 animate-pulse rounded" aria-hidden="true" />;
    }

    return (
        <div className="select-none" onCopy={(e) => e.preventDefault()}>
            <span>{(content as any).p1}</span><br />
            <span>{(content as any).p2}</span><br />
            <span>{(content as any).p3}</span><br />
            <span>Deutschland</span>
        </div>
    );
}
