import { NextRequest, NextResponse } from 'next/server';
import { ScenarioEngine } from '../../../lib/tax/scenario_engine';
import { TaxRequestSchema } from '../../../lib/tax/validation';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const result = TaxRequestSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: 'Ungültige Eingabe', details: result.error.flatten() },
                { status: 400 }
            );
        }

        const curveResult = ScenarioEngine.generateCurve(result.data);

        return NextResponse.json(curveResult);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (process.env.NODE_ENV !== 'production') {
            console.error('Curve Generation Error:', error);
        } else {
            console.error('Curve Generation Error:', message);
        }
        return NextResponse.json(
            { error: 'Failed to generate curve' },
            { status: 500 }
        );
    }
}
