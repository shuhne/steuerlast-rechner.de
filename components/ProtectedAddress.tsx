'use client';

import React, { useEffect, useState } from 'react';

export function ProtectedAddress() {
    const [content, setContent] = useState<React.ReactNode>(null);

    useEffect(() => {
        // Base64 encoded parts to avoid plain text in source
        // "Sascha Huhne (B.Sc. Wirtschaftsinformatik)"
        const p1 = "U2FzY2hhIEh1aG5lIChCLlNjLiBXaXJ0c2NoYWZ0c2luZm9ybWF0aWsp";
        // "Fischerinsel 9"
        const p2 = "RmlzY2hlcmluc2VsIDk=";
        // "10179 Berlin"
        const p3 = "MTAxNzkgQmVybGlu";

        const decode = (str: string) => {
            try {
                return atob(str);
            } catch (e) {
                return "Fehler beim Laden";
            }
        };

        setContent(
            <div className="select-none" onCopy={(e) => e.preventDefault()}>
                <span>{decode(p1)}</span><br />
                <span>{decode(p2)}</span><br />
                <span>{decode(p3)}</span><br />
                <span>Deutschland</span>
            </div>
        );
    }, []);

    // Placeholder during SSR / initial load (bot sees this)
    if (!content) {
        return <div className="h-20 w-48 bg-slate-800/50 animate-pulse rounded" aria-hidden="true" />;
    }

    return content;
}
