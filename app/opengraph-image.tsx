import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Steuerlast Rechner 2026';
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    fontSize: 128,
                    background: 'linear-gradient(to bottom right, #0f172a, #1e1b4b)',
                    color: 'white',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'sans-serif',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    Steuerlast
                </div>
                <div style={{ fontSize: 64, marginTop: 20, color: '#818cf8' }}>
                    Rechner 2026
                </div>
                <div style={{ fontSize: 32, marginTop: 40, color: '#94a3b8', background: '#1e293b', padding: '10px 40px', borderRadius: '50px' }}>
                    Brutto Netto & Prognose
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
